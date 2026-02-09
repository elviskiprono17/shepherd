/**
 * Feedback Screen
 * Placeholder for user feedback and bug reporting
 * Accessible via hamburger menu
 */

import React from 'react';
import { StyleSheet, SafeAreaView, View, Pressable, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function FeedbackScreen() {
    const { colorScheme } = useTheme();
    const { signOut, user } = useAuth();
    const isDark = colorScheme === 'dark';

    const handleBack = () => {
        router.back();
    };

    const handleLogout = async () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/login');
                    }
                },
            ]
        );
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
                <ThemedText style={styles.headerTitle}>Menu</ThemedText>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* User Info */}
                {user && (
                    <ThemedView style={[styles.userCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <ThemedText style={styles.userEmoji}>👤</ThemedText>
                        <View style={styles.userInfo}>
                            <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
                            <ThemedText style={styles.userPlan}>Free Plan</ThemedText>
                        </View>
                    </ThemedView>
                )}

                {/* Menu Items */}
                <View style={styles.featureList}>
                    <ThemedView style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <ThemedText style={styles.featureEmoji}>💬</ThemedText>
                        <View style={styles.featureInfo}>
                            <ThemedText style={styles.featureTitle}>Share Feedback</ThemedText>
                            <ThemedText style={styles.featureDescription}>Coming soon</ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <ThemedText style={styles.featureEmoji}>🐛</ThemedText>
                        <View style={styles.featureInfo}>
                            <ThemedText style={styles.featureTitle}>Report Bugs</ThemedText>
                            <ThemedText style={styles.featureDescription}>Coming soon</ThemedText>
                        </View>
                    </ThemedView>

                    <ThemedView style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <ThemedText style={styles.featureEmoji}>💡</ThemedText>
                        <View style={styles.featureInfo}>
                            <ThemedText style={styles.featureTitle}>Request Features</ThemedText>
                            <ThemedText style={styles.featureDescription}>Coming soon</ThemedText>
                        </View>
                    </ThemedView>
                </View>

                {/* Logout Button */}
                <Pressable
                    style={[styles.logoutButton, { borderColor: '#ef4444' }]}
                    onPress={handleLogout}
                >
                    <ThemedText style={styles.logoutEmoji}>🚪</ThemedText>
                    <ThemedText style={[styles.logoutText, { color: '#ef4444' }]}>Log Out</ThemedText>
                </Pressable>
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
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    userEmoji: {
        fontSize: 32,
    },
    userInfo: {
        flex: 1,
    },
    userEmail: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    userPlan: {
        fontSize: 12,
        opacity: 0.6,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
        marginTop: 8,
    },
    logoutEmoji: {
        fontSize: 20,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
