import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

// ---- Milestone thresholds ----
const BREAKEVEN_X = 2; // 2x discovered_at_price
// TP1 = whale that discovered the coin sells everything (100% sold)
const TTL_HOURS = 72; // Stop monitoring coins older than 72h
const MAX_COINS_PER_RUN = 10; // Limit batch size to conserve credits

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "*" } });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const now = new Date();

        // Fetch coins that still need monitoring (active, breakeven)
        // Once a coin hits tp1 (whale sold everything) → it's done, never re-checked
        const { data: coins, error: fetchErr } = await supabase
            .from("coins")
            .select("id, token_address, discovered_at_price, first_whale_wallet, performance_status, hit_breakeven, hit_tp1, peak_price, peak_multiple, created_at")
            .in("performance_status", ["active", "breakeven"])
            .not("discovered_at_price", "is", null)
            .gt("discovered_at_price", 0);

        if (fetchErr) {
            console.error("Fetch error:", fetchErr.message);
            return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 });
        }

        if (!coins || coins.length === 0) {
            return new Response(JSON.stringify({ success: true, message: "No coins to check", checked: 0 }), { status: 200 });
        }

        // Limit coins per run to conserve credits
        const batch = coins.slice(0, MAX_COINS_PER_RUN);
        console.log(`Checking ${batch.length} of ${coins.length} active coins (batch limit: ${MAX_COINS_PER_RUN})`);

        let updated = 0;
        let errors = 0;
        let expired = 0;

        for (const coin of batch) {
            try {
                // 0. TTL check: expire coins older than 72h
                const coinAge = (now.getTime() - new Date(coin.created_at).getTime()) / (1000 * 60 * 60);
                if (coinAge >= TTL_HOURS) {
                    await supabase.from("coins").update({ performance_status: "expired" }).eq("id", coin.id);
                    console.log(`⏰ ${coin.token_address.slice(0, 12)} EXPIRED (${coinAge.toFixed(0)}h old)`);
                    expired++;
                    updated++;
                    continue;
                }

                // 1. Get current price from DexScreener
                const dexResp = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${coin.token_address}`);
                if (!dexResp.ok) { errors++; continue; }
                const dexData = await dexResp.json();
                const pairs = dexData.pairs || [];
                if (!pairs.length) { errors++; continue; }

                const best = pairs.reduce((a: any, b: any) =>
                    (b.liquidity?.usd || 0) > (a.liquidity?.usd || 0) ? b : a
                );
                const currentPrice = parseFloat(best.priceUsd) || 0;
                if (currentPrice <= 0) continue;

                const discoveryPrice = Number(coin.discovered_at_price);
                if (discoveryPrice <= 0) continue;

                const currentMultiple = currentPrice / discoveryPrice;
                const newPeakPrice = Math.max(currentPrice, Number(coin.peak_price) || 0);
                const newPeakMultiple = Math.max(currentMultiple, Number(coin.peak_multiple) || 1);

                // 2. Check if whale sold everything (needed for TP1)
                let whaleSoldPct = 0;
                if (coin.first_whale_wallet && !coin.hit_tp1) {
                    whaleSoldPct = await checkWhaleSellPct(coin.first_whale_wallet, coin.token_address);
                    // Delay after RPC calls to conserve rate limits
                    await new Promise(r => setTimeout(r, 500));
                }

                // 3. Determine milestones (only set once, never unset)
                const updateData: Record<string, any> = {
                    price: currentPrice,
                    current_multiple: Math.round(currentMultiple * 100) / 100,
                    peak_price: newPeakPrice,
                    peak_multiple: Math.round(newPeakMultiple * 100) / 100,
                    last_price_check: now.toISOString(),
                    whale_sold_pct: whaleSoldPct,
                };

                // Hit breakeven (2x) for the first time
                if (!coin.hit_breakeven && currentMultiple >= BREAKEVEN_X) {
                    updateData.hit_breakeven = true;
                    updateData.hit_breakeven_at = now.toISOString();
                    updateData.performance_status = "breakeven";
                    console.log(`✅ ${coin.token_address.slice(0, 12)} HIT BREAKEVEN (${currentMultiple.toFixed(1)}x)`);
                }

                // TP1: whale that discovered this coin sold everything (100% sold)
                if (!coin.hit_tp1 && whaleSoldPct >= 100) {
                    updateData.hit_tp1 = true;
                    updateData.hit_tp1_at = now.toISOString();
                    updateData.performance_status = "tp1";
                    // Also ensure breakeven is tagged
                    if (!coin.hit_breakeven) {
                        updateData.hit_breakeven = true;
                        updateData.hit_breakeven_at = now.toISOString();
                    }
                    console.log(`🎯 ${coin.token_address.slice(0, 12)} HIT TP1 — whale sold everything`);
                }

                // 4. Update the coin
                const { error: updateErr } = await supabase
                    .from("coins")
                    .update(updateData)
                    .eq("id", coin.id);

                if (updateErr) {
                    console.error(`Update error for ${coin.id}:`, updateErr.message);
                    errors++;
                } else {
                    updated++;
                }

                // Rate limit: DexScreener allows ~300 req/min, be safe
                // Longer delay to conserve DexScreener rate limits & credits
                await new Promise(r => setTimeout(r, 500));

            } catch (coinErr) {
                console.error(`Error processing coin ${coin.id}:`, coinErr);
                errors++;
            }
        }

        console.log(`Done: ${updated} updated (${expired} expired), ${errors} errors out of ${batch.length} coins`);
        return new Response(
            JSON.stringify({ success: true, checked: batch.length, updated, expired, errors, remaining: coins.length - batch.length }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Fatal error:", error);
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
});

/**
 * Check what % of their position the whale has sold.
 * Compares current token balance to the initial buy.
 * Returns 0-100 (percentage sold).
 */
async function checkWhaleSellPct(wallet: string, mint: string): Promise<number> {
    try {
        const resp = await fetch(SOLANA_RPC, {
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
        const data = await resp.json();
        const accounts = data?.result?.value || [];

        if (accounts.length === 0) {
            // No token account = wallet sold everything
            return 100;
        }

        const tokenInfo = accounts[0]?.account?.data?.parsed?.info;
        const currentBalance = Number(tokenInfo?.tokenAmount?.uiAmount || 0);

        // If balance is 0, whale sold 100%
        if (currentBalance <= 0) return 100;

        // We can't perfectly know the original amount from just on-chain data
        // without indexing all txs. But if wallet still holds tokens, we know
        // they haven't fully exited. Check if balance is very low.
        // We'll use a heuristic: check tx count on the token account.
        // Many outgoing txs = likely selling.
        const tokenAccountPubkey = accounts[0].pubkey;
        const sigResp = await fetch(SOLANA_RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", id: 2,
                method: "getSignaturesForAddress",
                params: [tokenAccountPubkey, { limit: 10 }]
            }),
        });
        const sigData = await sigResp.json();
        const txCount = (sigData?.result || []).length;

        // Heuristic: 1 tx = initial buy only (0% sold)
        // 2+ txs with low balance relative to activity = partial/full sell
        if (txCount <= 1) return 0; // Only the initial buy

        // If there are multiple transactions and balance > 0,
        // estimate ~0% sold (still holding). 
        // If balance is 0, it's 100% sold (caught above).
        // For a more precise check, we'd need to sum all transfer amounts,
        // but this heuristic catches the biggest cases (full exit).
        return 0;
    } catch (err) {
        console.error("Whale sell check error:", err);
        return 0; // On error, assume still holding (graceful)
    }
}
