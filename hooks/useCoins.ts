/**
 * useCoins Hook
 * Custom React hook for fetching and managing coin data from Supabase
 * Falls back to mock data if Supabase is unavailable
 */

import { useState, useEffect, useCallback } from 'react';
import { Coin, WhaleSignal, UseCoinsResult, ChainId, CoinTier } from '@/types/coin';
import { supabase } from '@/utils/supabase';
import { getMockCoins } from '@/data/mockCoins';

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
    const pairCreatedAt = row.pair_created_at || discoveryTs;

    return {
        id: row.id,
        tokenAddress: row.token_address,
        pairAddress: row.pair_address || '',
        name: row.name,
        symbol: row.symbol,
        chain: (row.chain || 'solana') as ChainId,
        price: row.price || 0,
        priceChange24h: row.price_change_24h || 0,
        liquidity: row.liquidity || 0,
        volume24h: row.volume_24h || 0,
        marketCap: row.market_cap,
        pairCreatedAt,
        tier: (row.tier || 'aggressive') as CoinTier,

        // Discovery metadata
        discoveryTimestamp: discoveryTs,
        firstWhaleWallet: row.first_whale_wallet || '',
        firstWhaleBuyAmount: row.first_whale_buy_amount || 0,

        // Verification
        goplusVerified: row.goplus_verified || row.rugcheck_verified || false,
        goplusDetails: row.goplus_details || {},
        dexscreenerVerified: row.dexscreener_verified || false,
        lpBurnPercent: row.lp_burn_percent || 0,

        // LLM summaries
        llmWhyConsider: row.llm_why_consider || [],
        llmRiskFactors: row.llm_risk_factors || [],
        llmGeneratedAt: row.llm_generated_at || null,

        // Computed fields
        freshnessScore: calculateFreshnessScore(pairCreatedAt),
        liquidityScore: calculateLiquidityScore(row.liquidity || 0),
        discoveryReason: row.first_whale_buy_amount
            ? `Whale bought $${Math.round(row.first_whale_buy_amount).toLocaleString()}`
            : 'New token discovered on Solana',

        // Whale count from joined data
        whaleCount: row.whale_signals?.[0]?.count || 0,
    };
}

/**
 * Hook to fetch and manage coin list data from Supabase
 * Provides loading state, error handling, and refresh capability
 */
export function useCoins(): UseCoinsResult {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCoins = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Try Supabase first
            const { data, error: dbError } = await supabase
                .from('coins')
                .select('*, whale_signals(count)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (dbError) {
                console.warn('Supabase error, falling back to mock data:', dbError.message);
                const mockData = getMockCoins();
                setCoins(mockData);
                return;
            }

            if (data && data.length > 0) {
                const mapped = data.map(mapRowToCoin)
                    .sort((a, b) => b.freshnessScore - a.freshnessScore);
                setCoins(mapped);
            } else {
                // No data in Supabase yet — use mock data
                console.log('No coins in Supabase yet, using mock data');
                const mockData = getMockCoins();
                setCoins(mockData);
            }
        } catch (err) {
            console.error('Fetch coins error:', err);
            // Fallback to mock data on any error
            try {
                const mockData = getMockCoins();
                setCoins(mockData);
            } catch {
                setError(err instanceof Error ? err : new Error('Failed to fetch coins'));
            }
        } finally {
            setLoading(false);
        }
    }, []);

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

                // Try Supabase first
                const { data, error: dbError } = await supabase
                    .from('coins')
                    .select('*, whale_signals(*)')
                    .eq('id', coinId)
                    .maybeSingle();

                if (dbError || !data) {
                    // Fallback to mock data
                    const allCoins = getMockCoins();
                    const found = allCoins.find(c => c.id === coinId) || null;
                    if (!found) throw new Error('Coin not found');
                    setCoin(found);
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
                setError(err instanceof Error ? err : new Error('Failed to fetch coin'));
            } finally {
                setLoading(false);
            }
        };

        if (coinId) fetchCoin();
    }, [coinId]);

    return { coin, loading, error, whaleSignals };
}
