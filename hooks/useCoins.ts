/**
 * useCoins Hook
 * Custom React hook for fetching and managing coin data from Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { Coin, WhaleSignal, UseCoinsResult, ChainId, CoinTier } from '@/types/coin';
import { supabase } from '@/utils/supabase';

// Calculate freshness score (0-100, higher = newer)
function calculateFreshnessScore(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return Math.max(0, Math.round(100 - (hoursOld / 24) * 100));
}

// Calculate liquidity score (0-100)
function calculateLiquidityScore(liquidity: number): number {
    if (liquidity >= 1_000_000) return 100;
    if (liquidity >= 100_000) return 80 + Math.min(20, (liquidity - 100_000) / 45_000);
    if (liquidity >= 10_000) return 50 + Math.min(30, (liquidity - 10_000) / 3_000);
    if (liquidity >= 1_000) return 20 + Math.min(30, (liquidity - 1_000) / 300);
    return Math.round((liquidity / 1_000) * 20);
}

// Map Supabase snake_case row to camelCase Coin type
function mapRowToCoin(row: any): Coin {
    const discoveryTs = row.discovery_timestamp || row.created_at || new Date().toISOString();

    return {
        id: row.id,
        tokenAddress: row.token_address || '',
        pairAddress: row.pair_address || '',
        name: row.name || 'Unknown',
        symbol: row.symbol || '???',
        chain: (row.chain || 'solana') as ChainId,
        price: Number(row.price) || 0,
        priceChange24h: Number(row.price_change_24h) || 0,
        liquidity: Number(row.liquidity) || 0,
        volume24h: Number(row.volume_24h) || 0,
        marketCap: row.market_cap ? Number(row.market_cap) : null,
        pairCreatedAt: discoveryTs,
        tier: (row.tier || 'aggressive') as CoinTier,

        // Discovery metadata
        discoveryTimestamp: discoveryTs,
        discoveredAtPrice: Number(row.discovered_at_price) || 0,
        firstWhaleWallet: row.first_whale_wallet || '',
        firstWhaleBuyAmount: Number(row.first_whale_buy_amount) || 0,

        // Verification
        goplusVerified: row.goplus_verified || row.rugcheck_verified || false,
        goplusDetails: row.goplus_details || {},
        dexscreenerVerified: row.dexscreener_verified || false,
        lpBurnPercent: Number(row.lp_burn_percent) || 0,

        // LLM summaries
        llmWhyConsider: row.llm_why_consider || [],
        llmRiskFactors: row.llm_risk_factors || [],
        llmGeneratedAt: row.llm_generated_at || null,

        // Computed fields
        freshnessScore: calculateFreshnessScore(discoveryTs),
        liquidityScore: calculateLiquidityScore(Number(row.liquidity) || 0),
        discoveryReason: row.first_whale_buy_amount
            ? `Whale bought $${Math.round(Number(row.first_whale_buy_amount)).toLocaleString()}`
            : 'New token discovered on Solana',

        // Whale count
        whaleCount: 0,
    };
}

/** Helper: race a promise against a timeout */
function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
    return Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Supabase query timed out')), ms)
        ),
    ]);
}

/**
 * Hook to fetch and manage coin list data from Supabase
 * Shows empty state if no coins are available
 */
export function useCoins(tier?: CoinTier): UseCoinsResult {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCoins = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('coins')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (tier) {
                query = query.eq('tier', tier);
            }

            const { data, error: dbError } = await withTimeout(query, 10000);

            if (dbError) {
                console.warn('Supabase error:', dbError.message);
                // Don't show error if table is just empty
                setCoins([]);
                return;
            }

            if (data && data.length > 0) {
                console.log(`Loaded ${data.length} coins from Supabase`);
                const mapped = data.map(mapRowToCoin)
                    .sort((a, b) => b.freshnessScore - a.freshnessScore);
                setCoins(mapped);
            } else {
                console.log('No coins in Supabase yet');
                setCoins([]);
            }
        } catch (err) {
            console.warn('Fetch coins error:', err);
            // Timeout or network error with no cached data — show empty state, not error
            setCoins([]);
        } finally {
            setLoading(false);
        }
    }, [tier]);

    const refresh = useCallback(async () => {
        await fetchCoins();
    }, [fetchCoins]);

    // Initial fetch on mount
    useEffect(() => {
        fetchCoins();
    }, [fetchCoins]);

    // Subscribe to real-time inserts for live updates
    useEffect(() => {
        const channel = supabase
            .channel('coins-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'coins' },
                (payload) => {
                    console.log('New coin discovered:', payload.new);
                    const newCoin = mapRowToCoin(payload.new);
                    setCoins(prev => [newCoin, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        coins,
        loading,
        error,
        refresh,
    };
}

/**
 * Hook to get a single coin by ID from Supabase
 */
export function useCoin(coinId: string): {
    coin: Coin | null;
    loading: boolean;
    error: Error | null;
    whaleSignals: WhaleSignal[];
} {
    const [coin, setCoin] = useState<Coin | null>(null);
    const [whaleSignals, setWhaleSignals] = useState<WhaleSignal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                setLoading(true);

                const { data, error: dbError } = await withTimeout(
                    supabase
                        .from('coins')
                        .select('*, whale_signals(*)')
                        .eq('id', coinId)
                        .maybeSingle(),
                    15000
                );

                if (dbError || !data) {
                    setError(new Error(dbError?.message || 'Coin not found'));
                    return;
                }

                // Map whale signals
                const signals: WhaleSignal[] = (data.whale_signals || []).map((ws: any) => ({
                    id: ws.id,
                    coinId: ws.coin_id,
                    walletAddress: ws.wallet_address,
                    buyAmountUsd: ws.buy_amount_usd,
                    transactionSignature: ws.transaction_signature,
                    isFirstDiscoverer: ws.is_first_discoverer,
                    createdAt: ws.created_at,
                }));

                setCoin(mapRowToCoin(data));
                setWhaleSignals(signals);
            } catch (err) {
                console.warn('Fetch coin error:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch coin'));
            } finally {
                setLoading(false);
            }
        };

        if (coinId) fetchCoin();
    }, [coinId]);

    return { coin, loading, error, whaleSignals };
}
