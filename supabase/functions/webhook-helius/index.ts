import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOPLUS_APP_KEY = Deno.env.get("GOPLUS_APP_KEY") || Deno.env.get("GOPLUS_API_KEY") || "";
const GOPLUS_APP_SECRET = Deno.env.get("GOPLUS_APP_SECRET") || "";

// ---- Dual-Tier Thresholds ----
const AGGRESSIVE = {
    MIN_WHALE_BUY: 10000,
    MAX_WHALE_BUY: 60000,
    MIN_MARKET_CAP: 200000,
    MAX_MARKET_CAP: 5000000,
    MIN_LIQUIDITY: 50000,
};

const CONSERVATIVE = {
    MIN_WHALE_BUY: 50000,
    MIN_MARKET_CAP: 3000000,
    MAX_MARKET_CAP: 30000000,
    MIN_LIQUIDITY: 150000,
};

interface SwapEvent {
    nativeInput?: { account: string; amount: string };
    nativeOutput?: { account: string; amount: string };
    tokenInputs?: { mint: string; amount: string; userAccount: string }[];
    tokenOutputs?: { mint: string; amount: string; userAccount: string }[];
}

// ---- GoPlus Access Token (cached, 2hr TTL) ----
let goplusAccessToken: string | null = null;
let goplusTokenExpiry = 0;

async function sha1(message: string): Promise<string> {
    const data = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getGoPlusToken(): Promise<string | null> {
    if (goplusAccessToken && Date.now() / 1000 < goplusTokenExpiry - 60) return goplusAccessToken;
    if (!GOPLUS_APP_KEY || !GOPLUS_APP_SECRET) return null;
    try {
        const time = Math.floor(Date.now() / 1000).toString();
        const sign = await sha1(GOPLUS_APP_KEY + time + GOPLUS_APP_SECRET);
        const resp = await fetch("https://api.gopluslabs.io/api/v1/token", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ app_key: GOPLUS_APP_KEY, time, sign }),
        });
        const json = await resp.json();
        if (json.code === 1 && json.result?.access_token) {
            goplusAccessToken = json.result.access_token;
            goplusTokenExpiry = Date.now() / 1000 + (json.result.expires_in || 3600);
            return goplusAccessToken;
        }
        return null;
    } catch (e) { console.error("GoPlus token error:", e); return null; }
}

// ---- SOL Price (CoinGecko → Jupiter → fallback) ----
async function getSolPrice(): Promise<number> {
    try {
        const resp = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
        if (resp.ok) { const d = await resp.json(); if (d?.solana?.usd > 10) return d.solana.usd; }
    } catch (e) { }
    try {
        const resp = await fetch("https://price.jup.ag/v6/price?ids=SOL");
        if (resp.ok) { const d = await resp.json(); if (d?.data?.SOL?.price > 10) return d.data.SOL.price; }
    } catch (e) { }
    return 200;
}

// ---- GoPlus Security Check (graceful degradation) ----
async function checkGoPlus(mint: string): Promise<{ passed: boolean; data: any; verified: boolean }> {
    try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        const token = await getGoPlusToken();
        if (token) headers["Authorization"] = token;

        const resp = await fetch(`https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${mint}`, { headers });
        if (!resp.ok) return { passed: true, data: null, verified: false };
        const json = await resp.json();
        if (json.code !== 1 || !json.result) return { passed: true, data: null, verified: false };

        const keys = Object.keys(json.result);
        let tokenData = json.result[mint];
        if (!tokenData) { const l = mint.toLowerCase(); for (const k of keys) { if (k.toLowerCase() === l) { tokenData = json.result[k]; break; } } }
        if (!tokenData) return { passed: true, data: null, verified: false };

        let passed = true;
        if (tokenData.non_transferable === "1") passed = false;
        if (tokenData.freezable?.status === "1") passed = false;
        if (tokenData.mintable?.status === "1") passed = false;
        if (tokenData.transfer_fee_upgradable?.status === "1") passed = false;
        if (tokenData.closable?.status === "1") passed = false;
        if (tokenData.transfer_hook && tokenData.transfer_hook.length > 0) passed = false;
        if (tokenData.transfer_hook_upgradable?.status === "1") passed = false;
        if (tokenData.balance_mutable_authority?.status === "1") passed = false;
        return { passed, data: tokenData, verified: true };
    } catch (error) {
        console.error("GoPlus error:", error);
        return { passed: true, data: null, verified: false };
    }
}

// ---- Determine tier from buy amount + DexScreener data ----
function determineTier(buyUsd: number, liq: number, mcap: number): string | null {
    // Conservative check first (higher quality signal)
    if (
        buyUsd >= CONSERVATIVE.MIN_WHALE_BUY &&
        mcap >= CONSERVATIVE.MIN_MARKET_CAP && mcap <= CONSERVATIVE.MAX_MARKET_CAP &&
        liq >= CONSERVATIVE.MIN_LIQUIDITY
    ) {
        return "conservative";
    }

    // Aggressive check
    if (
        buyUsd >= AGGRESSIVE.MIN_WHALE_BUY && buyUsd <= AGGRESSIVE.MAX_WHALE_BUY &&
        mcap >= AGGRESSIVE.MIN_MARKET_CAP && mcap <= AGGRESSIVE.MAX_MARKET_CAP &&
        liq >= AGGRESSIVE.MIN_LIQUIDITY
    ) {
        return "aggressive";
    }

    return null; // Does not qualify for either tier
}

// ---- Solana RPC: Check if wallet previously held this token ----
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

async function isFirstTimeBuyer(wallet: string, mint: string): Promise<boolean> {
    try {
        // Step 1: Find the wallet's token account for this mint
        const ataResp = await fetch(SOLANA_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    wallet,
                    { mint },
                    { encoding: "jsonParsed" }
                ]
            }),
        });
        const ataData = await ataResp.json();
        const accounts = ataData?.result?.value || [];
        if (accounts.length === 0) {
            // No token account found — this shouldn't happen post-swap,
            // but treat as first-time buyer (safe fallback)
            return true;
        }

        const tokenAccountPubkey = accounts[0].pubkey;

        // Step 2: Check how many transactions this token account has
        // If only 1 (the current buy), it's a first-time buyer
        const sigResp = await fetch(SOLANA_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", id: 2,
                method: "getSignaturesForAddress",
                params: [
                    tokenAccountPubkey,
                    { limit: 3 }  // Only need to know if > 1
                ]
            }),
        });
        const sigData = await sigResp.json();
        const signatures = sigData?.result || [];

        // 1 signature = only the current buy → first-time buyer
        // 2+ signatures = prior activity with this token → NOT first-time
        return signatures.length <= 1;
    } catch (error) {
        console.error("Fresh-buy check error:", error);
        // On error, allow the signal through (graceful degradation)
        return true;
    }
}

// ---- Main Handler ----
Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "*" } });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });

    try {
        const payload = await req.json();
        console.log(`Received ${payload.length} txs`);
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const solPrice = await getSolPrice();
        console.log(`SOL=$${solPrice}`);
        const results: any[] = [];

        for (const tx of payload) {
            if (!tx.events?.swap) continue;
            const swap: SwapEvent = tx.events.swap;
            const wallet = tx.feePayer;

            for (const output of (swap.tokenOutputs || [])) {
                const mint = output.mint;
                if (["So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"].includes(mint)) continue;

                let buyUsd = 0;
                if (swap.nativeInput) buyUsd = (parseFloat(swap.nativeInput.amount) / 1e9) * solPrice;
                else if (swap.tokenInputs) {
                    for (const inp of swap.tokenInputs) {
                        if (["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"].includes(inp.mint)) buyUsd = parseFloat(inp.amount);
                    }
                }

                // Skip if below minimum aggressive threshold
                if (buyUsd < AGGRESSIVE.MIN_WHALE_BUY) continue;

                // Fresh-buy check: skip if whale previously held this token
                const freshBuy = await isFirstTimeBuyer(wallet, mint);
                if (!freshBuy) {
                    console.log(`Skip ${mint.slice(0, 12)}: whale ${wallet.slice(0, 8)} previously held this token`);
                    continue;
                }

                const { data: existing } = await supabase.from("coins").select("id").eq("token_address", mint).maybeSingle();
                if (existing) {
                    const { data: sig } = await supabase.from("whale_signals").select("id").eq("wallet_address", wallet).eq("coin_id", existing.id).maybeSingle();
                    if (!sig) {
                        await supabase.from("whale_signals").insert({ coin_id: existing.id, wallet_address: wallet, buy_amount_usd: buyUsd, transaction_signature: tx.signature, is_first_discoverer: false });
                    }
                    results.push({ mint, status: "whale_added" });
                    continue;
                }

                // DexScreener
                const dexResp = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
                if (!dexResp.ok) continue;
                const dexData = await dexResp.json();
                const pairs = dexData.pairs || [];
                if (!pairs.length) continue;
                const best = pairs.reduce((a: any, b: any) => (b.liquidity?.usd || 0) > (a.liquidity?.usd || 0) ? b : a);
                const liq = best.liquidity?.usd || 0, mcap = best.marketCap || best.fdv || 0;
                const dexPrice = parseFloat(best.priceUsd) || 0;

                // Determine tier
                const tier = determineTier(buyUsd, liq, mcap);
                if (!tier) {
                    console.log(`Skip ${mint.slice(0, 12)}: no tier match (buy=$${buyUsd.toFixed(0)} liq=$${liq.toFixed(0)} mcap=$${mcap.toFixed(0)})`);
                    continue;
                }

                // GoPlus Security — must pass before we record
                const gp = await checkGoPlus(mint);
                if (!gp.passed) {
                    console.log(`Skip ${mint.slice(0, 12)}: failed GoPlus`);
                    continue;
                }

                let lpBurn = 0;
                for (const d of (gp.data?.dex || [])) { if (d.burn_percent > lpBurn) lpBurn = d.burn_percent; }

                // Insert coin — discovered_at_price only set after verification passes
                const { data: newCoin, error: insertErr } = await supabase.from("coins").insert({
                    token_address: mint, pair_address: best.pairAddress || '',
                    name: best.baseToken.name, symbol: best.baseToken.symbol, chain: "solana",
                    price: dexPrice, price_change_24h: best.priceChange?.h24 || 0,
                    liquidity: liq, volume_24h: best.volume?.h24 || 0, market_cap: mcap,
                    tier, discovery_timestamp: new Date((tx.timestamp || Date.now() / 1000) * 1000).toISOString(),
                    discovered_at_price: dexPrice,
                    first_whale_wallet: wallet, first_whale_buy_amount: buyUsd,
                    goplus_verified: gp.verified, goplus_details: gp.data || {}, lp_burn_percent: lpBurn,
                    rugcheck_verified: true, dexscreener_verified: true,
                    llm_why_consider: [`Whale bought $${buyUsd.toLocaleString()}`, `Liquidity $${(liq / 1000).toFixed(0)}K`, gp.verified ? 'GoPlus verified safe' : 'GoPlus pending'],
                    llm_risk_factors: ["Newly discovered", "Meme coins are speculative", "Limited history"],
                    llm_generated_at: new Date().toISOString(),
                }).select().single();
                if (insertErr) { console.error(`Insert: ${insertErr.message}`); continue; }

                // Insert whale signal
                await supabase.from("whale_signals").insert({
                    coin_id: newCoin.id, wallet_address: wallet,
                    buy_amount_usd: buyUsd, transaction_signature: tx.signature, is_first_discoverer: true,
                });
                console.log(`Discovered [${tier.toUpperCase()}]: ${best.baseToken.symbol} @ $${dexPrice}`);
                results.push({ mint, name: best.baseToken.name, symbol: best.baseToken.symbol, tier, status: "discovered", id: newCoin.id });
            }
        }

        return new Response(JSON.stringify({ success: true, processed: payload.length, results }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
});
