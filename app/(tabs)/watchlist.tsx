/**
 * Watchlist Screen
 * Shows coins the user has saved to watch.
 * Coins can be added from the coin detail screen.
 * Persisted locally via AsyncStorage.
 * Uses mock data for preview when watchlist is empty.
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

// ---- Mock data for preview ----
const MOCK_WATCHLIST: Coin[] = [
    {
        id: 'mock-1',
        tokenAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        pairAddress: 'pair1',
        name: 'Bonk',
        symbol: 'BONK',
        chain: 'solana',
        price: 0.00002847,
        priceChange24h: 18.4,
        liquidity: 2_450_000,
        volume24h: 890_000,
        marketCap: 1_800_000,
        pairCreatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tier: 'conservative',
        discoveryTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        discoveredAtPrice: 0.00001200,
        firstWhaleWallet: 'Whale1abc...',
        firstWhaleBuyAmount: 45000,
        goplusVerified: true,
        goplusDetails: {},
        dexscreenerVerified: true,
        lpBurnPercent: 95,
        llmWhyConsider: [],
        llmRiskFactors: [],
        llmGeneratedAt: null,
        freshnessScore: 90,
        liquidityScore: 85,
        discoveryReason: 'Whale bought $45,000',
    },
    {
        id: 'mock-2',
        tokenAddress: '9nEqaUcb4jS9GSy4Bz3K5j3Dv5q2rTX4o5d7FzwKBJW',
        pairAddress: 'pair2',
        name: 'dogwifhat',
        symbol: 'WIF',
        chain: 'solana',
        price: 0.00000891,
        priceChange24h: -5.2,
        liquidity: 180_000,
        volume24h: 67_000,
        marketCap: 420_000,
        pairCreatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        tier: 'aggressive',
        discoveryTimestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        discoveredAtPrice: 0.00000650,
        firstWhaleWallet: 'Whale2def...',
        firstWhaleBuyAmount: 5000,
        goplusVerified: true,
        goplusDetails: {},
        dexscreenerVerified: true,
        lpBurnPercent: 80,
        llmWhyConsider: [],
        llmRiskFactors: [],
        llmGeneratedAt: null,
        freshnessScore: 65,
        liquidityScore: 60,
        discoveryReason: 'Whale bought $5,000',
    },
    {
        id: 'mock-3',
        tokenAddress: '3bRTivrVsitbmCTGtqwp7hxXPsybkjn4XLNtPsHqa3zR',
        pairAddress: 'pair3',
        name: 'Pepe Sol',
        symbol: 'PEPE',
        chain: 'solana',
        price: 0.00000034,
        priceChange24h: 142.5,
        liquidity: 95_000,
        volume24h: 210_000,
        marketCap: 340_000,
        pairCreatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        tier: 'aggressive',
        discoveryTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        discoveredAtPrice: 0.00000014,
        firstWhaleWallet: 'Whale3ghi...',
        firstWhaleBuyAmount: 3200,
        goplusVerified: true,
        goplusDetails: {},
        dexscreenerVerified: true,
        lpBurnPercent: 100,
        llmWhyConsider: [],
        llmRiskFactors: [],
        llmGeneratedAt: null,
        freshnessScore: 95,
        liquidityScore: 45,
        discoveryReason: 'Whale bought $3,200',
    },
];

// Whether to show mock data for preview
const USE_MOCK_DATA = false;

export default function WatchlistScreen() {
    const { colorScheme, toggleTheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const [coins, setCoins] = useState<Coin[]>(USE_MOCK_DATA ? MOCK_WATCHLIST : []);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWatchlist = useCallback(async () => {
        if (USE_MOCK_DATA) {
            setLoading(false);
            return;
        }
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
        if (USE_MOCK_DATA) {
            setCoins(prev => prev.filter(c => c.id !== coinId));
            return;
        }
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

    const getMultiple = (current: number, discovered: number) => {
        if (!discovered || discovered <= 0) return null;
        const multiple = current / discovered;
        return multiple;
    };

    const getTimeSince = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const renderCoin = ({ item }: { item: Coin }) => {
        const multiple = getMultiple(item.price, item.discoveredAtPrice);
        const isUp = item.priceChange24h >= 0;

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.coinCard,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push(`/coin/${item.id}` as Href)}
            >
                {/* Top: Symbol, Name, Remove */}
                <View style={styles.coinHeader}>
                    <View style={styles.coinNameRow}>
                        <View style={[styles.tierDot, {
                            backgroundColor: item.tier === 'aggressive' ? '#F97316' : '#3B82F6'
                        }]} />
                        <ThemedText style={styles.coinSymbol}>${item.symbol}</ThemedText>
                        <ThemedText style={styles.coinName} numberOfLines={1}>{item.name}</ThemedText>
                    </View>
                    <Pressable
                        onPress={() => removeFromWatchlist(item.id)}
                        hitSlop={12}
                        style={styles.removeButton}
                    >
                        <ThemedText style={styles.removeText}>✕</ThemedText>
                    </Pressable>
                </View>

                {/* Middle: Price + Change + Multiple */}
                <View style={styles.priceRow}>
                    <ThemedText style={styles.coinPrice}>{formatPrice(item.price)}</ThemedText>
                    <View style={[
                        styles.changeBadge,
                        { backgroundColor: isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }
                    ]}>
                        <ThemedText style={[
                            styles.changeText,
                            { color: isUp ? '#22C55E' : '#EF4444' }
                        ]}>
                            {formatChange(item.priceChange24h)}
                        </ThemedText>
                    </View>
                    {multiple && multiple > 1 && (
                        <View style={[styles.multipleBadge, { backgroundColor: 'rgba(250,204,21,0.15)' }]}>
                            <ThemedText style={styles.multipleText}>
                                {multiple.toFixed(1)}x
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Bottom: Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>💧 Liq</ThemedText>
                        <ThemedText style={styles.statValue}>{formatCompact(item.liquidity)}</ThemedText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>📊 MCap</ThemedText>
                        <ThemedText style={styles.statValue}>{item.marketCap ? formatCompact(item.marketCap) : 'N/A'}</ThemedText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>🐋 Whale</ThemedText>
                        <ThemedText style={styles.statValue}>{formatCompact(item.firstWhaleBuyAmount)}</ThemedText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statLabel}>⏰</ThemedText>
                        <ThemedText style={styles.statValue}>{getTimeSince(item.discoveryTimestamp)}</ThemedText>
                    </View>
                </View>
            </Pressable>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyEmoji}>⭐</ThemedText>
            <ThemedText style={styles.emptyTitle}>No coins in watchlist</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
                Tap the ⭐ on any coin to save it here for quick access
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

            {/* Watchlist Count Header */}
            {coins.length > 0 && (
                <View style={[styles.countBar, { backgroundColor: isDark ? 'rgba(250,204,21,0.08)' : 'rgba(250,204,21,0.08)' }]}>
                    <ThemedText style={styles.countText}>
                        ⭐ {coins.length} coin{coins.length !== 1 ? 's' : ''} saved
                    </ThemedText>
                </View>
            )}

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
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    countBar: {
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 8,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    countText: {
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.7,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 32,
    },
    listContentEmpty: {
        flex: 1,
        justifyContent: 'center',
    },
    coinCard: {
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    coinHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    coinNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    tierDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    coinSymbol: {
        fontSize: 17,
        fontWeight: '700',
    },
    coinName: {
        fontSize: 13,
        opacity: 0.45,
        flex: 1,
    },
    removeButton: {
        padding: 6,
    },
    removeText: {
        fontSize: 14,
        opacity: 0.35,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    coinPrice: {
        fontSize: 22,
        fontWeight: '700',
    },
    changeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    multipleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    multipleText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FACC15',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        opacity: 0.45,
        marginBottom: 3,
    },
    statValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.06)',
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
        lineHeight: 20,
    },
});
