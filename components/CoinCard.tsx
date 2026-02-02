/**
 * CoinCard Component
 * Displays a single coin in the discovery feed
 * Shows: name, symbol, chain, price, liquidity, age, and freshness
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Coin } from '@/types/coin';
import {
    formatAge,
    formatPrice,
    formatLiquidity,
    formatPercentChange,
    getChainInfo
} from '@/utils/format';

interface CoinCardProps {
    coin: Coin;
    onPress?: (coin: Coin) => void;
}

export function CoinCard({ coin, onPress }: CoinCardProps) {
    const colorScheme = useColorScheme();
    const chainInfo = getChainInfo(coin.chain);
    const priceChange = formatPercentChange(coin.priceChange24h);
    const age = formatAge(coin.pairCreatedAt);

    return (
        <Pressable
            onPress={() => onPress?.(coin)}
            style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressed
            ]}
        >
            <ThemedView style={styles.container}>
                {/* Header Row: Name, Symbol, Chain Badge */}
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <ThemedText style={styles.name} numberOfLines={1}>
                            {coin.name}
                        </ThemedText>
                        <ThemedText style={styles.symbol}>${coin.symbol}</ThemedText>
                    </View>
                    <View style={[styles.chainBadge, { backgroundColor: chainInfo.color }]}>
                        <ThemedText style={styles.chainText}>{chainInfo.name}</ThemedText>
                    </View>
                </View>

                {/* Price Row */}
                <View style={styles.priceRow}>
                    <ThemedText style={styles.price}>{formatPrice(coin.price)}</ThemedText>
                    <ThemedText
                        style={[
                            styles.priceChange,
                            { color: priceChange.isPositive ? '#22c55e' : '#ef4444' }
                        ]}
                    >
                        {priceChange.text}
                    </ThemedText>
                </View>

                {/* Stats Row: Liquidity, Volume, Age */}
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statLabel}>Liquidity</ThemedText>
                        <ThemedText style={styles.statValue}>{formatLiquidity(coin.liquidity)}</ThemedText>
                    </View>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statLabel}>Volume 24h</ThemedText>
                        <ThemedText style={styles.statValue}>{formatLiquidity(coin.volume24h)}</ThemedText>
                    </View>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statLabel}>Age</ThemedText>
                        <ThemedText style={[styles.statValue, styles.ageValue, { color: Colors[colorScheme ?? 'light'].tint }]}>{age}</ThemedText>
                    </View>
                </View>

                {/* Freshness Indicator */}
                <View style={styles.freshnessRow}>
                    <View style={styles.freshnessBar}>
                        <View
                            style={[
                                styles.freshnessProgress,
                                {
                                    width: `${coin.freshnessScore}%`,
                                    backgroundColor: coin.freshnessScore > 70
                                        ? '#22c55e'
                                        : coin.freshnessScore > 40
                                            ? '#eab308'
                                            : '#ef4444'
                                }
                            ]}
                        />
                    </View>
                    <ThemedText style={styles.freshnessLabel}>
                        {coin.freshnessScore > 70 ? '🔥 Fresh' : coin.freshnessScore > 40 ? '⏰ Recent' : '📅 Older'}
                    </ThemedText>
                </View>

                {/* Discovery Reason (Why Card preview) */}
                <View style={styles.reasonRow}>
                    <ThemedText style={styles.reasonText}>💡 {coin.discoveryReason}</ThemedText>
                </View>
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    container: {
        borderRadius: 16,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        flexShrink: 1,
    },
    symbol: {
        fontSize: 14,
        opacity: 0.6,
    },
    chainBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    chainText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 12,
        marginBottom: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
    },
    priceChange: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        opacity: 0.5,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    ageValue: {

    },
    freshnessRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    freshnessBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    freshnessProgress: {
        height: '100%',
        borderRadius: 2,
    },
    freshnessLabel: {
        fontSize: 12,
        opacity: 0.8,
    },
    reasonRow: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    reasonText: {
        fontSize: 12,
        opacity: 0.7,
        fontStyle: 'italic',
    },
});
