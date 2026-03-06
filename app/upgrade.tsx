/**
 * Pro+ Upgrade Screen
 * Premium subscription payment screen with plan comparison
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Pressable,
    ScrollView,
    Alert,
    Platform,
    Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

type PlanType = 'monthly' | 'yearly';

const PLANS = {
    monthly: { price: '$29', period: '/month' },
    yearly: { price: '$348', period: '/year' },
};

const FREE_FEATURES = [
    { text: 'Basic whale signal alerts', included: true },
    { text: 'Top 5 coins per day', included: true },
    { text: '15-min delayed signals', included: true },
    { text: 'Standard risk filters', included: true },
    { text: 'Real-time whale tracking', included: false },
    { text: 'Unlimited signals', included: false },
    { text: 'AI risk analysis', included: false },
    { text: 'Custom wallet watchlist', included: false },
    { text: 'Priority notifications', included: false },
];

const PRO_FEATURES = [
    { text: 'Real-time whale signal alerts', included: true },
    { text: 'Unlimited coins & signals', included: true },
    { text: 'Instant signal delivery', included: true },
    { text: 'Advanced risk filters', included: true },
    { text: 'Live whale wallet tracking', included: true },
    { text: 'AI-powered risk analysis', included: true },
    { text: 'Custom wallet watchlist', included: true },
    { text: 'Priority push notifications', included: true },
    { text: 'Early access to new features', included: true },
];

export default function UpgradeScreen() {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

    const handleBack = () => {
        router.back();
    };

    const handleSubscribe = () => {
        if (Platform.OS === 'web') {
            alert('Payment processing coming soon! You\'ll be among the first to know.');
        } else {
            Alert.alert(
                'Coming Soon! 🚀',
                'Pro+ subscriptions are launching soon. You\'ll be notified when it\'s available!',
                [{ text: 'Got it', style: 'default' }]
            );
        }
    };

    const plan = PLANS[selectedPlan];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} hitSlop={8} style={styles.backButton}>
                    <IconSymbol
                        name="chevron.left"
                        size={24}
                        color={isDark ? Colors.dark.text : Colors.light.text}
                    />
                </Pressable>
                <ThemedText style={styles.headerTitle}>Upgrade</ThemedText>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={[styles.heroSection, {
                    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.08)' : 'rgba(250, 204, 21, 0.06)',
                    borderColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(250, 204, 21, 0.15)',
                }]}>
                    <ThemedText style={styles.heroEmoji}>⚡</ThemedText>
                    <ThemedText style={[styles.heroTitle, { color: Colors[colorScheme ?? 'light'].tint }]}>
                        Shepherd Pro+
                    </ThemedText>
                    <ThemedText style={[styles.heroSubtitle, { opacity: 0.7 }]}>
                        Get ahead of the herd with real-time whale signals
                    </ThemedText>
                </View>

                {/* Plan Toggle */}
                <View style={[styles.planToggle, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                }]}>
                    <Pressable
                        style={[
                            styles.planOption,
                            selectedPlan === 'monthly' && {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#ffffff',
                            },
                        ]}
                        onPress={() => setSelectedPlan('monthly')}
                    >
                        <ThemedText style={[
                            styles.planOptionText,
                            selectedPlan === 'monthly' && { fontWeight: '700' },
                        ]}>Monthly</ThemedText>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.planOption,
                            selectedPlan === 'yearly' && {
                                backgroundColor: Colors[colorScheme ?? 'light'].tint,
                            },
                        ]}
                        onPress={() => setSelectedPlan('yearly')}
                    >
                        <ThemedText style={[
                            styles.planOptionText,
                            selectedPlan === 'yearly' && { color: '#000', fontWeight: '700' },
                        ]}>
                            Yearly
                        </ThemedText>
                    </Pressable>
                </View>

                {/* Price Display */}
                <View style={styles.priceSection}>
                    <View style={styles.priceRow}>
                        <ThemedText style={[styles.priceAmount, { color: Colors[colorScheme ?? 'light'].tint }]}>
                            {plan.price}
                        </ThemedText>
                        <ThemedText style={[styles.pricePeriod, { opacity: 0.5 }]}>
                            {plan.period}
                        </ThemedText>
                    </View>
                </View>

                {/* Features Comparison */}
                <View style={styles.comparisonSection}>
                    {/* Pro Features */}
                    <View style={[styles.featureCard, {
                        backgroundColor: isDark ? 'rgba(250, 204, 21, 0.06)' : 'rgba(250, 204, 21, 0.04)',
                        borderColor: Colors[colorScheme ?? 'light'].tint,
                    }]}>
                        <View style={styles.featureCardHeader}>
                            <ThemedText style={[styles.featureCardTitle, { color: Colors[colorScheme ?? 'light'].tint }]}>
                                Pro+
                            </ThemedText>
                            <View style={[styles.recommendedBadge, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
                                <ThemedText style={styles.recommendedText}>RECOMMENDED</ThemedText>
                            </View>
                        </View>
                        {PRO_FEATURES.map((feature, i) => (
                            <View key={i} style={styles.featureRow}>
                                <ThemedText style={[styles.featureIcon, { color: '#22c55e' }]}>✓</ThemedText>
                                <ThemedText style={styles.featureText}>{feature.text}</ThemedText>
                            </View>
                        ))}
                    </View>

                    {/* Free Features */}
                    <View style={[styles.featureCard, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    }]}>
                        <View style={styles.featureCardHeader}>
                            <ThemedText style={[styles.featureCardTitle, { opacity: 0.6 }]}>
                                Free
                            </ThemedText>
                            <ThemedText style={[styles.currentPlanText, { opacity: 0.4 }]}>Current plan</ThemedText>
                        </View>
                        {FREE_FEATURES.map((feature, i) => (
                            <View key={i} style={styles.featureRow}>
                                <ThemedText style={[
                                    styles.featureIcon,
                                    { color: feature.included ? '#22c55e' : '#ef4444' },
                                ]}>
                                    {feature.included ? '✓' : '✗'}
                                </ThemedText>
                                <ThemedText style={[
                                    styles.featureText,
                                    !feature.included && { opacity: 0.4, textDecorationLine: 'line-through' },
                                ]}>
                                    {feature.text}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                </View>



                {/* Bottom spacing for button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Subscribe Button */}
            <View style={[styles.bottomBar, {
                backgroundColor: isDark ? '#000000' : '#ffffff',
                borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }]}>
                <Pressable
                    style={[styles.subscribeButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                    onPress={handleSubscribe}
                >
                    <ThemedText style={styles.subscribeText}>
                        Subscribe Now
                    </ThemedText>
                    <ThemedText style={styles.subscribeSubtext}>
                        {plan.price}{plan.period}
                    </ThemedText>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    heroSection: {
        alignItems: 'center',
        padding: 28,
        borderRadius: 20,
        borderWidth: 1,
    },
    heroEmoji: {
        fontSize: 40,
        marginBottom: 12,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 6,
    },
    heroSubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    planToggle: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    planOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    planOptionText: {
        fontSize: 15,
    },
    priceSection: {
        alignItems: 'center',
        gap: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    priceAmount: {
        fontSize: 42,
        fontWeight: '800',
    },
    pricePeriod: {
        fontSize: 16,
    },

    comparisonSection: {
        gap: 16,
    },
    featureCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        gap: 12,
    },
    featureCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    featureCardTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    recommendedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    recommendedText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    currentPlanText: {
        fontSize: 12,
        fontWeight: '600',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureIcon: {
        fontSize: 16,
        fontWeight: '700',
        width: 20,
        textAlign: 'center',
    },
    featureText: {
        fontSize: 14,
        flex: 1,
    },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    subscribeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 2,
    },
    subscribeText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    },
    subscribeSubtext: {
        color: 'rgba(0,0,0,0.6)',
        fontSize: 12,
        fontWeight: '600',
    },
});
