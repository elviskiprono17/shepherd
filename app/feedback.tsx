/**
 * Feedback Screen
 * Placeholder for user feedback and bug reporting
 * Accessible via hamburger menu
 */

import React from 'react';
import { StyleSheet, SafeAreaView, View, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

export default function FeedbackScreen() {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const handleBack = () => {
        router.back();
    };

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
                <ThemedText style={styles.headerTitle}>Feedback</ThemedText>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Coming Soon */}
                <ThemedView style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <ThemedText style={styles.emoji}>🚧</ThemedText>
                    <ThemedText style={styles.title}>Coming Soon</ThemedText>
                    <ThemedText style={styles.description}>
                        We're building a feedback system so you can share your thoughts and report issues.
                    </ThemedText>
                </ThemedView>

                {/* Feature Cards */}
                <View style={styles.featureList}>
                    <ThemedView style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <ThemedText style={styles.featureEmoji}>💬</ThemedText>
                        <View style={styles.featureInfo}>
                            <ThemedText style={styles.featureTitle}>Share Feedback</ThemedText>
                            <ThemedText style={styles.featureDescription}>Tell us what you think</ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <ThemedText style={styles.featureEmoji}>🐛</ThemedText>
                        <View style={styles.featureInfo}>
                            <ThemedText style={styles.featureTitle}>Report Bugs</ThemedText>
                            <ThemedText style={styles.featureDescription}>Help us improve</ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <ThemedText style={styles.featureEmoji}>💡</ThemedText>
                        <View style={styles.featureInfo}>
                            <ThemedText style={styles.featureTitle}>Request Features</ThemedText>
                            <ThemedText style={styles.featureDescription}>Shape the future</ThemedText>
                        </View>
                    </ThemedView>
                </View>
            </ScrollView>
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
        gap: 24,
    },
    card: {
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 20,
    },
    featureList: {
        gap: 12,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    featureEmoji: {
        fontSize: 28,
    },
    featureInfo: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: 13,
        opacity: 0.6,
    },
});
