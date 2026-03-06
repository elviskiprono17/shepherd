/**
 * Filters Screen - Risk Appetite Configuration
 * Allows users to set filters based on their risk tolerance.
 * Displays real thresholds for Aggressive and Conservative tiers.
 * Includes push notification preferences per tier.
 */

import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    ScrollView,
    Pressable,
    Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { NavHeader } from '@/components/NavHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useFilter } from '@/contexts/FilterContext';
import { CoinTier } from '@/types/coin';


const NOTIF_STORAGE_KEY = '@notification_prefs';

// Real thresholds matching the webhook-helius edge function
const TIER_THRESHOLDS: Record<CoinTier, {
    whaleBuy: string;
    marketCap: string;
    liquidity: string;
    emoji: string;
    description: string;
}> = {
    aggressive: {
        whaleBuy: '$1K – $10K',
        marketCap: '$50K – $5M',
        liquidity: '$10K+',
        emoji: '🔥',
        description: 'Higher risk, earlier entries. Smaller caps with emerging whale interest.',
    },
    conservative: {
        whaleBuy: '$10K – $100K',
        marketCap: '$1M – $30M',
        liquidity: '$150K+',
        emoji: '🛡️',
        description: 'Lower risk, established tokens. Larger caps with strong whale conviction.',
    },
};

// Custom toggle that renders consistently on web and native
function CustomToggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            style={[
                styles.toggleTrack,
                { backgroundColor: value ? '#FACC15' : '#767577' },
            ]}
        >
            <View
                style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: value ? 20 : 0 }] },
                ]}
            />
        </Pressable>
    );
}

export default function FiltersScreen() {
    const { colorScheme, toggleTheme } = useTheme();
    const { selectedTier, setSelectedTier } = useFilter();
    const isDark = colorScheme === 'dark';

    const currentThresholds = TIER_THRESHOLDS[selectedTier];

    // Push notification preferences
    const [notifyAggressive, setNotifyAggressive] = useState(true);
    const [notifyConservative, setNotifyConservative] = useState(true);


    // Load saved notification prefs
    useEffect(() => {
        const loadPrefs = async () => {
            try {
                const saved = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
                if (saved) {
                    const prefs = JSON.parse(saved);
                    setNotifyAggressive(prefs.aggressive ?? true);
                    setNotifyConservative(prefs.conservative ?? true);
                }
            } catch (e) {
                console.log('Error loading notification prefs:', e);
            }
        };
        loadPrefs();
    }, []);

    const toggleNotifyAggressive = async (value: boolean) => {
        setNotifyAggressive(value);
        try {
            const prefs = { aggressive: value, conservative: notifyConservative };
            await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(prefs));
        } catch (e) { console.log('Error saving notification prefs:', e); }
    };

    const toggleNotifyConservative = async (value: boolean) => {
        setNotifyConservative(value);
        try {
            const prefs = { aggressive: notifyAggressive, conservative: value };
            await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(prefs));
        } catch (e) { console.log('Error saving notification prefs:', e); }
    };

    return (
        <SafeAreaView style={[
            styles.safeArea,
            { backgroundColor: isDark ? '#000000' : '#ffffff' }
        ]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <NavHeader onToggleTheme={toggleTheme} />

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>

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

                {/* Push Notifications */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Push Notifications</ThemedText>
                    <View style={[styles.settingCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <View style={styles.notifRow}>
                            <View style={styles.notifInfo}>
                                <ThemedText style={styles.notifEmoji}>🔥</ThemedText>
                                <ThemedText style={styles.notifLabel}>Aggressive Signals</ThemedText>
                            </View>
                            <CustomToggle
                                value={notifyAggressive}
                                onValueChange={toggleNotifyAggressive}
                            />
                        </View>
                        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
                        <View style={styles.notifRow}>
                            <View style={styles.notifInfo}>
                                <ThemedText style={styles.notifEmoji}>🛡️</ThemedText>
                                <ThemedText style={styles.notifLabel}>Conservative Signals</ThemedText>
                            </View>
                            <CustomToggle
                                value={notifyConservative}
                                onValueChange={toggleNotifyConservative}
                            />
                        </View>
                    </View>
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
        paddingTop: 8,
        paddingBottom: 32,
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
    notifRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    notifInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    notifEmoji: {
        fontSize: 20,
    },
    notifLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    toggleTrack: {
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 4,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#ffffff',
    },

});
