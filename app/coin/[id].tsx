/**
 * Coin Detail Screen
 * Shows comprehensive information about a selected coin:
 * - Price chart placeholder
 * - Key metrics (liquidity, volume, market cap)
 * - "Why Buy" card with AI-powered insights
 * - Risk indicators
 * - Links to DEX
 */

import React from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    ScrollView,
    Pressable,
    Linking
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCoin } from '@/hooks/useCoins';
import {
    formatPrice,
    formatLiquidity,
    formatAge,
    formatPercentChange,
    getChainInfo,
    truncateAddress
} from '@/utils/format';

export default function CoinDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { coin, loading, error } = useCoin(id || '');

    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }]}>
                <ThemedView style={styles.loadingContainer}>
                    <ThemedText style={styles.loadingEmoji}>⏳</ThemedText>
                    <ThemedText>Loading coin details...</ThemedText>
                </ThemedView>
            </SafeAreaView>
        );
    }

    if (error || !coin) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }]}>
                <ThemedView style={styles.loadingContainer}>
                    <ThemedText style={styles.loadingEmoji}>😵</ThemedText>
                    <ThemedText>Coin not found</ThemedText>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
                    </Pressable>
                </ThemedView>
            </SafeAreaView>
        );
    }

    const chainInfo = getChainInfo(coin.chain);
    const priceChange = formatPercentChange(coin.priceChange24h);

    // Generate "Why Buy" reasons based on coin data
    const whyBuyReasons = generateWhyBuyReasons(coin);
    const riskFactors = generateRiskFactors(coin);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Header with back button */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backArrow}>
                        <ThemedText style={styles.backArrowText}>← Back</ThemedText>
                    </Pressable>
                </View>

                {/* Coin Title */}
                <View style={styles.titleSection}>
                    <View style={styles.titleRow}>
                        <ThemedText style={styles.coinName}>{coin.name}</ThemedText>
                        <View style={[styles.chainBadge, { backgroundColor: chainInfo.color }]}>
                            <ThemedText style={styles.chainText}>{chainInfo.name}</ThemedText>
                        </View>
                    </View>
                    <ThemedText style={styles.coinSymbol}>${coin.symbol}</ThemedText>
                </View>

                {/* Price Section */}
                <View style={[styles.priceCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <ThemedText style={styles.priceLabel}>Current Price</ThemedText>
                    <ThemedText style={styles.priceValue}>{formatPrice(coin.price)}</ThemedText>
                    <ThemedText style={[
                        styles.priceChange,
                        { color: priceChange.isPositive ? '#22c55e' : '#ef4444' }
                    ]}>
                        {priceChange.text} (24h)
                    </ThemedText>
                </View>

                {/* Key Metrics */}
                <View style={styles.metricsGrid}>
                    <MetricCard
                        label="Liquidity"
                        value={formatLiquidity(coin.liquidity)}
                        icon="💧"
                        isDark={isDark}
                    />
                    <MetricCard
                        label="Volume 24h"
                        value={formatLiquidity(coin.volume24h)}
                        icon="📊"
                        isDark={isDark}
                    />
                    <MetricCard
                        label="Age"
                        value={formatAge(coin.pairCreatedAt)}
                        icon="⏰"
                        isDark={isDark}
                    />
                    <MetricCard
                        label="Freshness"
                        value={`${coin.freshnessScore}/100`}
                        icon="🔥"
                        isDark={isDark}
                    />
                </View>

                {/* Why Buy Card */}
                <View style={[styles.whyBuyCard, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                    <View style={styles.whyBuyHeader}>
                        <ThemedText style={styles.whyBuyEmoji}>💡</ThemedText>
                        <ThemedText style={styles.whyBuyTitle}>Why Consider This Token</ThemedText>
                    </View>
                    {whyBuyReasons.map((reason, index) => (
                        <View key={index} style={styles.reasonRow}>
                            <ThemedText style={styles.reasonBullet}>✓</ThemedText>
                            <ThemedText style={styles.reasonText}>{reason}</ThemedText>
                        </View>
                    ))}
                    <ThemedText style={styles.disclaimer}>
                        ⚠️ This is not financial advice. Always DYOR.
                    </ThemedText>
                </View>

                {/* Risk Factors */}
                <View style={[styles.riskCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <View style={styles.whyBuyHeader}>
                        <ThemedText style={styles.whyBuyEmoji}>⚠️</ThemedText>
                        <ThemedText style={styles.riskTitle}>Risk Factors</ThemedText>
                    </View>
                    {riskFactors.map((risk, index) => (
                        <View key={index} style={styles.reasonRow}>
                            <ThemedText style={styles.riskBullet}>•</ThemedText>
                            <ThemedText style={styles.reasonText}>{risk}</ThemedText>
                        </View>
                    ))}
                </View>

                {/* Token Details */}
                <View style={[styles.detailsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <ThemedText style={styles.detailsTitle}>Token Details</ThemedText>
                    <DetailRow label="Contract" value={truncateAddress(coin.tokenAddress, 6)} />
                    <DetailRow label="Pair" value={truncateAddress(coin.pairAddress, 6)} />
                    <DetailRow label="Chain" value={coin.chain.toUpperCase()} />
                    <DetailRow label="Liquidity Score" value={`${coin.liquidityScore}/100`} />
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <Pressable
                        style={[styles.actionButton, styles.primaryButton]}
                        onPress={() => {
                            // Open DexScreener page
                            const url = `https://dexscreener.com/${coin.chain}/${coin.pairAddress}`;
                            Linking.openURL(url);
                        }}
                    >
                        <ThemedText style={styles.primaryButtonText}>View on DexScreener 🔗</ThemedText>
                    </Pressable>
                    <Pressable
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={() => router.back()}
                    >
                        <ThemedText style={styles.secondaryButtonText}>Back to Feed</ThemedText>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Helper component for metric cards
function MetricCard({ label, value, icon, isDark }: {
    label: string;
    value: string;
    icon: string;
    isDark: boolean;
}) {
    return (
        <View style={[styles.metricCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <ThemedText style={styles.metricIcon}>{icon}</ThemedText>
            <ThemedText style={styles.metricValue}>{value}</ThemedText>
            <ThemedText style={styles.metricLabel}>{label}</ThemedText>
        </View>
    );
}

// Helper component for detail rows
function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>{label}</ThemedText>
            <ThemedText style={styles.detailValue}>{value}</ThemedText>
        </View>
    );
}

// Generate "Why Buy" reasons based on coin metrics
function generateWhyBuyReasons(coin: any): string[] {
    const reasons: string[] = [];

    if (coin.freshnessScore > 80) {
        reasons.push("🚀 Very fresh token - early discovery opportunity");
    } else if (coin.freshnessScore > 50) {
        reasons.push("⚡ Recently launched with growing momentum");
    }

    if (coin.liquidityScore > 70) {
        reasons.push("💪 Strong liquidity - easier to trade");
    } else if (coin.liquidityScore > 40) {
        reasons.push("📈 Decent liquidity for a new token");
    }

    if (coin.priceChange24h > 50) {
        reasons.push("🔥 Strong price momentum in last 24h");
    } else if (coin.priceChange24h > 10) {
        reasons.push("📊 Positive price action trending up");
    }

    if (coin.volume24h > 1000000) {
        reasons.push("🎯 High trading volume indicates interest");
    } else if (coin.volume24h > 100000) {
        reasons.push("👀 Active trading volume");
    }

    if (coin.chain === 'solana') {
        reasons.push("⚡ On Solana - fast & low fees");
    } else if (coin.chain === 'base') {
        reasons.push("🔵 On Base - growing ecosystem");
    }

    // Ensure at least one reason
    if (reasons.length === 0) {
        reasons.push("🆕 New token discovery in your filtered chains");
    }

    return reasons.slice(0, 4); // Max 4 reasons
}

// Generate risk factors based on coin metrics
function generateRiskFactors(coin: any): string[] {
    const risks: string[] = [];

    if (coin.freshnessScore > 90) {
        risks.push("Extremely new - high volatility expected");
    }

    if (coin.liquidityScore < 30) {
        risks.push("Low liquidity - potential slippage issues");
    }

    if (coin.priceChange24h < -20) {
        risks.push("Recent price decline - possible dump");
    }

    if (coin.priceChange24h > 100) {
        risks.push("Extreme gains may lead to pullback");
    }

    // Always add general meme coin risk
    risks.push("Meme coins are highly speculative assets");

    return risks.slice(0, 3); // Max 3 risks
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    backArrow: {
        paddingVertical: 8,
    },
    backArrowText: {
        fontSize: 16,
        color: '#FACC15',
        fontWeight: '600',
    },
    backButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#FACC15',
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    titleSection: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    coinName: {
        fontSize: 28,
        fontWeight: '800',
    },
    chainBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    chainText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    coinSymbol: {
        fontSize: 16,
        opacity: 0.6,
        marginTop: 4,
    },
    priceCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 14,
        opacity: 0.6,
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 36,
        fontWeight: '800',
    },
    priceChange: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 16,
    },
    metricCard: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    metricIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FACC15',
    },
    metricLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 4,
    },
    whyBuyCard: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    whyBuyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    whyBuyEmoji: {
        fontSize: 24,
    },
    whyBuyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#22c55e',
    },
    riskTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
    },
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 8,
    },
    reasonBullet: {
        color: '#22c55e',
        fontWeight: '700',
    },
    riskBullet: {
        color: '#ef4444',
        fontWeight: '700',
    },
    reasonText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    disclaimer: {
        fontSize: 11,
        opacity: 0.6,
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
    riskCard: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    detailsCard: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    detailLabel: {
        fontSize: 14,
        opacity: 0.6,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    actions: {
        paddingHorizontal: 20,
        gap: 12,
    },
    actionButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#FACC15',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        borderWidth: 2,
        borderColor: '#FACC15',
    },
    secondaryButtonText: {
        color: '#FACC15',
        fontSize: 16,
        fontWeight: '600',
    },
});
