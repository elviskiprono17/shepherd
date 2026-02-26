/**
 * Watchlist Screen
 * Shows coins the user has saved to watch.
 * Coins can be added from the coin detail screen.
 * Persisted locally via AsyncStorage.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    FlatList,
    Pressable,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { NavHeader } from '@/components/NavHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { Coin } from '@/types/coin';
import { supabase } from '@/utils/supabase';

const WATCHLIST_STORAGE_KEY = '@watchlist_ids';

export default function WatchlistScreen() {
    const { colorScheme, toggleTheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWatchlist = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
            const ids: string[] = saved ? JSON.parse(saved) : [];

            if (ids.length === 0) {
                setCoins([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('coins')
                .select('*')
                .in('id', ids)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Watchlist fetch error:', error.message);
                setCoins([]);
            } else {
                setCoins((data || []).map(row => ({
                    id: row.id,
                    tokenAddress: row.token_address || '',
                    pairAddress: row.pair_address || '',
                    name: row.name || 'Unknown',
                    symbol: row.symbol || '???',
                    chain: row.chain || 'solana',
                    price: Number(row.price) || 0,
                    priceChange24h: Number(row.price_change_24h) || 0,
                    liquidity: Number(row.liquidity) || 0,
                    volume24h: Number(row.volume_24h) || 0,
                    marketCap: row.market_cap ? Number(row.market_cap) : null,
                    pairCreatedAt: row.discovery_timestamp || row.created_at,
                    tier: row.tier || 'aggressive',
                    discoveryTimestamp: row.discovery_timestamp || row.created_at,
                    discoveredAtPrice: Number(row.discovered_at_price) || 0,
                    firstWhaleWallet: row.first_whale_wallet || '',
                    firstWhaleBuyAmount: Number(row.first_whale_buy_amount) || 0,
                    goplusVerified: row.goplus_verified || false,
                    goplusDetails: row.goplus_details || {},
                    dexscreenerVerified: row.dexscreener_verified || false,
                    lpBurnPercent: Number(row.lp_burn_percent) || 0,
                    llmWhyConsider: row.llm_why_consider || [],
                    llmRiskFactors: row.llm_risk_factors || [],
                    llmGeneratedAt: row.llm_generated_at || null,
                    freshnessScore: 0,
                    liquidityScore: 0,
                    discoveryReason: '',
                })));
            }
        } catch (err) {
            console.warn('Watchlist error:', err);
            setCoins([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchWatchlist();
        setRefreshing(false);
    };

    const removeFromWatchlist = async (coinId: string) => {
        try {
            const saved = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
            const ids: string[] = saved ? JSON.parse(saved) : [];
            const updated = ids.filter(id => id !== coinId);
            await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
            setCoins(prev => prev.filter(c => c.id !== coinId));
        } catch (e) {
            console.warn('Remove watchlist error:', e);
        }
    };

    const formatPrice = (price: number) => {
        if (price < 0.0001) return `$${price.toExponential(2)}`;
        if (price < 1) return `$${price.toFixed(6)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatChange = (change: number) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    };

    const formatCompact = (value: number) => {
        if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
    };

    const renderCoin = ({ item }: { item: Coin }) => (
        <Pressable
            style={[styles.coinCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
            onPress={() => router.push(`/coin/${item.id}` as Href)}
        >
            <View style={styles.coinHeader}>
                <View style={styles.coinNameRow}>
                    <ThemedText style={styles.coinSymbol}>{item.symbol}</ThemedText>
                    <ThemedText style={styles.coinName} numberOfLines={1}>{item.name}</ThemedText>
                </View>
                <Pressable
                    onPress={() => removeFromWatchlist(item.id)}
                    hitSlop={8}
                    style={styles.removeButton}
                >
                    <ThemedText style={styles.removeText}>✕</ThemedText>
                </Pressable>
            </View>
            <View style={styles.coinStats}>
                <ThemedText style={styles.coinPrice}>{formatPrice(item.price)}</ThemedText>
                <ThemedText style={[
                    styles.coinChange,
                    { color: item.priceChange24h >= 0 ? '#22C55E' : '#EF4444' }
                ]}>
                    {formatChange(item.priceChange24h)}
                </ThemedText>
                <ThemedText style={styles.coinLiq}>Liq {formatCompact(item.liquidity)}</ThemedText>
            </View>
        </Pressable>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyEmoji}>⭐</ThemedText>
            <ThemedText style={styles.emptyTitle}>No coins in watchlist</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
                Save coins from the Hot feed to track them here
            </ThemedText>
        </View>
    );

    return (
        <SafeAreaView style={[
            styles.safeArea,
            { backgroundColor: isDark ? '#000000' : '#ffffff' }
        ]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <NavHeader onToggleTheme={toggleTheme} />

            <FlatList
                data={coins}
                keyExtractor={item => item.id}
                renderItem={renderCoin}
                ListEmptyComponent={!loading ? renderEmpty : null}
                contentContainerStyle={[
                    styles.listContent,
                    coins.length === 0 && styles.listContentEmpty,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FACC15"
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 32,
    },
    listContentEmpty: {
        flex: 1,
        justifyContent: 'center',
    },
    coinCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
    },
    coinHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    coinNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    coinSymbol: {
        fontSize: 16,
        fontWeight: '700',
    },
    coinName: {
        fontSize: 13,
        opacity: 0.5,
        flex: 1,
    },
    removeButton: {
        padding: 4,
    },
    removeText: {
        fontSize: 14,
        opacity: 0.4,
    },
    coinStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    coinPrice: {
        fontSize: 15,
        fontWeight: '600',
    },
    coinChange: {
        fontSize: 13,
        fontWeight: '600',
    },
    coinLiq: {
        fontSize: 12,
        opacity: 0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        opacity: 0.5,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
