/**
 * Filters Screen - Risk Appetite Configuration
 * Allows users to set filters based on their risk tolerance.
 * Displays real thresholds for Aggressive and Conservative tiers.
 * Persists selection via FilterContext.
 */

import React from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    ScrollView,
    Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { NavHeader } from '@/components/NavHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useFilter } from '@/contexts/FilterContext';
import { CoinTier } from '@/types/coin';

// Real thresholds matching the webhook-helius edge function
const TIER_THRESHOLDS: Record<CoinTier, {
    whaleBuy: string;
    marketCap: string;
    liquidity: string;
    emoji: string;
    description: string;
}> = {
    aggressive: {
        whaleBuy: '$10K – $60K',
        marketCap: '$200K – $5M',
        liquidity: '$50K+',
        emoji: '🔥',
        description: 'Higher risk, earlier entries. Smaller caps with emerging whale interest.',
    },
    conservative: {
        whaleBuy: '$50K+',
        marketCap: '$3M – $30M',
        liquidity: '$150K+',
        emoji: '🛡️',
        description: 'Lower risk, established tokens. Larger caps with strong whale conviction.',
    },
};

export default function FiltersScreen() {
    const { colorScheme, toggleTheme } = useTheme();
    const { selectedTier, setSelectedTier } = useFilter();
    const isDark = colorScheme === 'dark';

    const currentThresholds = TIER_THRESHOLDS[selectedTier];

    return (
        <SafeAreaView style={[
            styles.safeArea,
            { backgroundColor: isDark ? '#000000' : '#ffffff' }
        ]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <NavHeader onToggleTheme={toggleTheme} />

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Filters</ThemedText>
                    <ThemedText style={styles.subtitle}>Set your risk appetite</ThemedText>
                </View>

                {/* Risk Level Selection */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Risk Level</ThemedText>
                    <View style={styles.riskButtons}>
                        {(['aggressive', 'conservative'] as CoinTier[]).map((level) => (
                            <Pressable
                                key={level}
                                style={[
                                    styles.riskButton,
                                    selectedTier === level && styles.riskButtonActive,
                                    { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                                ]}
                                onPress={() => setSelectedTier(level)}
                            >
                                <ThemedText style={styles.riskEmoji}>
                                    {TIER_THRESHOLDS[level].emoji}
                                </ThemedText>
                                <ThemedText style={[
                                    styles.riskLabel,
                                    selectedTier === level && styles.riskLabelActive
                                ]}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Tier Description */}
                <View style={styles.section}>
                    <View style={[styles.descriptionCard, { backgroundColor: isDark ? 'rgba(250,204,21,0.08)' : 'rgba(250,204,21,0.08)' }]}>
                        <ThemedText style={styles.descriptionText}>
                            {currentThresholds.description}
                        </ThemedText>
                    </View>
                </View>

                {/* Current Thresholds */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Signal Thresholds</ThemedText>
                    <View style={[styles.settingCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <View style={styles.settingRow}>
                            <ThemedText style={styles.settingLabel}>🐋  Whale Buy</ThemedText>
                            <ThemedText style={styles.settingValue}>{currentThresholds.whaleBuy}</ThemedText>
                        </View>
                        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
                        <View style={styles.settingRow}>
                            <ThemedText style={styles.settingLabel}>📊  Market Cap</ThemedText>
                            <ThemedText style={styles.settingValue}>{currentThresholds.marketCap}</ThemedText>
                        </View>
                        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
                        <View style={styles.settingRow}>
                            <ThemedText style={styles.settingLabel}>💧  Liquidity</ThemedText>
                            <ThemedText style={styles.settingValue}>{currentThresholds.liquidity}</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Active Indicator */}
                <View style={styles.activeIndicator}>
                    <View style={[styles.activeDot, { backgroundColor: '#22C55E' }]} />
                    <ThemedText style={styles.activeText}>
                        {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} filter active
                    </ThemedText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        opacity: 0.8,
    },
    riskButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    riskButton: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    riskButtonActive: {
        borderColor: '#FACC15',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
    },
    riskEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    riskLabel: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.6,
    },
    riskLabelActive: {
        color: '#FACC15',
        opacity: 1,
    },
    descriptionCard: {
        borderRadius: 12,
        padding: 16,
    },
    descriptionText: {
        fontSize: 13,
        opacity: 0.7,
        lineHeight: 20,
    },
    settingCard: {
        borderRadius: 12,
        padding: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingLabel: {
        fontSize: 14,
        opacity: 0.6,
    },
    settingValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FACC15',
    },
    divider: {
        height: 1,
    },
    activeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeText: {
        fontSize: 13,
        opacity: 0.6,
    },
});
