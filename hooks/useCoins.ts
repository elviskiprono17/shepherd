/**
 * useCoins Hook
 * Custom React hook for fetching and managing coin data
 * Currently uses mock data - will be replaced with Supabase queries in Phase 2
 */

import { useState, useEffect, useCallback } from 'react';
import { Coin, UseCoinsResult } from '@/types/coin';
import { getMockCoins } from '@/data/mockCoins';

// Simulated network delay for realistic loading states
const MOCK_DELAY_MS = 800;

/**
 * Hook to fetch and manage coin list data
 * Provides loading state, error handling, and refresh capability
 */
export function useCoins(): UseCoinsResult {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Fetch coins from data source
     * In Phase 2: This will call Supabase instead of mock data
     */
    const fetchCoins = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Simulate network request delay
            await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

            // Get mock data (Phase 2: Replace with Supabase query)
            // const { data, error } = await supabase.from('coins').select('*').order('pair_created_at', { ascending: false });
            const data = getMockCoins();

            setCoins(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch coins'));
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Refresh coin data - can be called by pull-to-refresh
     */
    const refresh = useCallback(async () => {
        await fetchCoins();
    }, [fetchCoins]);

    // Initial fetch on mount
    useEffect(() => {
        fetchCoins();
    }, [fetchCoins]);

    return {
        coins,
        loading,
        error,
        refresh,
    };
}

/**
 * Hook to get a single coin by ID
 */
export function useCoin(coinId: string): {
    coin: Coin | null;
    loading: boolean;
    error: Error | null;
} {
    const [coin, setCoin] = useState<Coin | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS / 2));

                const allCoins = getMockCoins();
                const found = allCoins.find(c => c.id === coinId) || null;

                if (!found) {
                    throw new Error('Coin not found');
                }

                setCoin(found);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch coin'));
            } finally {
                setLoading(false);
            }
        };

        fetchCoin();
    }, [coinId]);

    return { coin, loading, error };
}
