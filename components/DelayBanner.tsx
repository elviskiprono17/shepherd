/**
 * DelayBanner Component
 * Shows random upgrade prompts to Free users
 * Displays when they're viewing delayed data (24 hours behind Pro users)
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { ColorScheme, useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

const UPGRADE_MESSAGES = [
    "⏰ You're viewing data from 24 hours ago",
    "🚀 Pro users see this data in real-time",
    "💎 Upgrade to Pro for instant alpha",
    "📊 Real-time data = better trades",
    "⚡ Don't miss the next 100x - Go Pro!",
];

interface DelayBannerProps {
    showChance?: number; // Probability of showing (0-1), default 0.15
}

export function DelayBanner({ showChance = 0.15 }: DelayBannerProps) {
    const { isPro, user } = useAuth();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Only show for logged-in Free users
        if (!user || isPro) {
            setIsVisible(false);
            return;
        }

        // Random chance to show
        if (Math.random() < showChance) {
            // Pick random message
            const randomMessage = UPGRADE_MESSAGES[Math.floor(Math.random() * UPGRADE_MESSAGES.length)];
            setMessage(randomMessage);
            setIsVisible(true);

            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto-hide after 8 seconds
            const timeout = setTimeout(() => {
                handleDismiss();
            }, 8000);

            return () => clearTimeout(timeout);
        }
    }, [user, isPro]);

    const handleDismiss = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setIsVisible(false));
    };

    const handleUpgrade = () => {
        handleDismiss();
        // Navigate to upgrade screen (Pro+ button on navbar)
        console.log('Navigate to upgrade');
    };

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    backgroundColor: isDark ? 'rgba(250, 204, 21, 0.15)' : 'rgba(250, 204, 21, 0.1)',
                    borderColor: Colors[colorScheme].tint,
                }
            ]}
        >
            <View style={styles.content}>
                <ThemedText style={styles.message}>{message}</ThemedText>
                <View style={styles.actions}>
                    <Pressable
                        style={[styles.upgradeButton, { backgroundColor: Colors[colorScheme].tint }]}
                        onPress={handleUpgrade}
                    >
                        <ThemedText style={styles.upgradeText}>Upgrade</ThemedText>
                    </Pressable>
                    <Pressable onPress={handleDismiss} hitSlop={8}>
                        <ThemedText style={styles.dismissText}>✕</ThemedText>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        gap: 12,
    },
    message: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    upgradeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    upgradeText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '700',
    },
    dismissText: {
        fontSize: 16,
        opacity: 0.5,
    },
});
