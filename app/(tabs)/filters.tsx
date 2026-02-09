/**
 * Filters Screen - Risk Appetite Configuration
 * Allows users to set filters based on their risk tolerance:
 * - Liquidity thresholds
 * - Token age preferences  
 * - Chain selection
 * - Market cap ranges
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    ScrollView,
    Pressable,
    Switch
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavHeader } from '@/components/NavHeader';
import { useTheme } from '@/contexts/ThemeContext';

type RiskLevel = 'conservative' | 'aggressive';

interface FilterState {
    riskLevel: RiskLevel;
    minLiquidity: number;
    maxAgeHours: number;
    chains: {
        solana: boolean;
        ethereum: boolean;
        bsc: boolean;
        base: boolean;
        arbitrum: boolean;
    };
}

const RISK_PRESETS: Record<RiskLevel, { minLiquidity: number; maxAgeHours: number }> = {
    conservative: { minLiquidity: 100000, maxAgeHours: 48 },
    aggressive: { minLiquidity: 1000, maxAgeHours: 6 },
};

export default function FiltersScreen() {
    const { colorScheme, toggleTheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const [filters, setFilters] = useState<FilterState>({
        riskLevel: 'conservative',
        minLiquidity: 100000,
        maxAgeHours: 48,
        chains: {
            solana: true,
            ethereum: true,
            bsc: true,
            base: true,
            arbitrum: true,
        },
    });

    const selectRiskLevel = (level: RiskLevel) => {
        const preset = RISK_PRESETS[level];
        setFilters(prev => ({
            ...prev,
            riskLevel: level,
            minLiquidity: preset.minLiquidity,
            maxAgeHours: preset.maxAgeHours,
        }));
    };

    const toggleChain = (chain: keyof FilterState['chains']) => {
        setFilters(prev => ({
            ...prev,
            chains: {
                ...prev.chains,
                [chain]: !prev.chains[chain],
            },
        }));
    };

    const formatLiquidity = (value: number) => {
        if (value >= 100000) return '$100K+';
        if (value >= 10000) return '$10K+';
        return '$1K+';
    };

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
                        {(['conservative', 'aggressive'] as RiskLevel[]).map((level) => (
                            <Pressable
                                key={level}
                                style={[
                                    styles.riskButton,
                                    filters.riskLevel === level && styles.riskButtonActive,
                                    { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                                ]}
                                onPress={() => selectRiskLevel(level)}
                            >
                                <ThemedText style={styles.riskEmoji}>
                                    {level === 'conservative' ? '🛡️' : '🔥'}
                                </ThemedText>
                                <ThemedText style={[
                                    styles.riskLabel,
                                    filters.riskLevel === level && styles.riskLabelActive
                                ]}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Current Settings */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Current Settings</ThemedText>
                    <View style={[styles.settingCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <View style={styles.settingRow}>
                            <ThemedText style={styles.settingLabel}>Min Liquidity</ThemedText>
                            <ThemedText style={styles.settingValue}>{formatLiquidity(filters.minLiquidity)}</ThemedText>
                        </View>
                        <View style={styles.settingRow}>
                            <ThemedText style={styles.settingLabel}>Max Token Age</ThemedText>
                            <ThemedText style={styles.settingValue}>{filters.maxAgeHours}h</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Chain Selection */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Chains</ThemedText>
                    <View style={[styles.chainCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        {Object.entries(filters.chains).map(([chain, enabled]) => (
                            <View key={chain} style={styles.chainRow}>
                                <View style={styles.chainInfo}>
                                    <ThemedText style={styles.chainEmoji}>
                                        {chain === 'solana' ? '◎' : chain === 'ethereum' ? 'Ξ' : chain === 'bsc' ? '🔶' : chain === 'base' ? '🔵' : '◆'}
                                    </ThemedText>
                                    <ThemedText style={styles.chainName}>
                                        {chain.charAt(0).toUpperCase() + chain.slice(1)}
                                    </ThemedText>
                                </View>
                                <Switch
                                    value={enabled}
                                    onValueChange={() => toggleChain(chain as keyof FilterState['chains'])}
                                    trackColor={{ false: '#767577', true: '#a78bfa' }}
                                    thumbColor={enabled ? '#fff' : '#f4f3f4'}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Apply Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.applyButton,
                        pressed && styles.applyButtonPressed
                    ]}
                >
                    <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
                </Pressable>
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
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
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
        color: '#a78bfa',
        opacity: 1,
    },
    settingCard: {
        borderRadius: 12,
        padding: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingLabel: {
        fontSize: 14,
        opacity: 0.6,
    },
    settingValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a78bfa',
    },
    chainCard: {
        borderRadius: 12,
        padding: 8,
    },
    chainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    chainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    chainEmoji: {
        fontSize: 20,
        width: 28,
        textAlign: 'center',
    },
    chainName: {
        fontSize: 14,
        fontWeight: '500',
    },
    applyButton: {
        backgroundColor: '#a78bfa',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonPressed: {
        opacity: 0.8,
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
