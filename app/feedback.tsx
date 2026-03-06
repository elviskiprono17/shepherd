/**
 * Feedback Screen
 * Simple feedback form with text area and submit
 * Accessible via hamburger menu
 */

import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Pressable, ScrollView, Alert, TextInput, ActivityIndicator, Keyboard, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { supabase } from '@/utils/supabase';

export default function FeedbackScreen() {
    const { colorScheme } = useTheme();
    const { signOut, user } = useAuth();
    const isDark = colorScheme === 'dark';
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleLogout = () => {
        // Dismiss the modal, sign out — useProtectedRoute handles redirect to login
        router.dismiss();
        signOut();
    };

    const handleSubmit = async () => {
        const trimmed = feedback.trim();
        if (!trimmed) {
            Alert.alert('Empty Feedback', 'Please write something before submitting.');
            return;
        }

        setSubmitting(true);
        Keyboard.dismiss();

        try {
            // Race the insert against a 10-second timeout
            const insertPromise = supabase.from('user_feedback').insert({
                user_id: user?.id || null,
                user_email: user?.email || 'anonymous',
                message: trimmed,
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            );

            const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

            if (error) {
                console.error('Feedback error:', error.message);
                Alert.alert('Error', 'Could not submit feedback. Please try again.');
            } else {
                setFeedback('');
                Alert.alert('Thank You! 🙏', 'Your feedback has been received.');
            }
        } catch (err: any) {
            console.error('Feedback submit error:', err);
            Alert.alert('Error', err?.message === 'Request timed out'
                ? 'Request timed out. Please check your connection and try again.'
                : 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
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

            <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

                {/* Feedback Section */}
                <View style={styles.feedbackSection}>
                    <ThemedText style={styles.feedbackLabel}>Leave Feedback</ThemedText>
                    <ThemedText style={[styles.feedbackHint, { opacity: 0.5 }]}>
                        Bugs, ideas, suggestions — anything goes
                    </ThemedText>

                    <TextInput
                        style={[
                            styles.textArea,
                            {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                color: isDark ? '#ffffff' : '#000000',
                                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                            },
                        ]}
                        placeholder="What should we do?"
                        placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={feedback}
                        onChangeText={setFeedback}
                        maxLength={2000}
                        editable={!submitting}
                    />

                    <Pressable
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: feedback.trim()
                                    ? Colors[colorScheme ?? 'light'].tint
                                    : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            },
                        ]}
                        onPress={handleSubmit}
                        disabled={submitting || !feedback.trim()}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <ThemedText style={[
                                styles.submitText,
                                {
                                    color: feedback.trim() ? '#000000' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'),
                                },
                            ]}>
                                Submit
                            </ThemedText>
                        )}
                    </Pressable>
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
    feedbackSection: {
        gap: 8,
    },
    feedbackLabel: {
        fontSize: 18,
        fontWeight: '700',
    },
    feedbackHint: {
        fontSize: 13,
        marginBottom: 4,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        lineHeight: 22,
        minHeight: 150,
    },
    submitButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 4,
    },
    submitText: {
        fontSize: 16,
        fontWeight: '700',
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
