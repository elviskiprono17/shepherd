/**
 * ErrorState Component
 * Displayed when there's an error fetching coin data
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    message = 'Something went wrong',
    onRetry
}: ErrorStateProps) {
    const colorScheme = useColorScheme();
    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.emoji}>😵</ThemedText>
            <ThemedText style={styles.title}>Oops!</ThemedText>
            <ThemedText style={styles.message}>{message}</ThemedText>

            {onRetry && (
                <Pressable
                    style={({ pressed }) => [
                        styles.retryButton,
                        { backgroundColor: colorScheme === 'dark' ? '#FACC15' : '#000000' },
                        pressed && styles.retryButtonPressed
                    ]}
                    onPress={onRetry}
                >
                    <ThemedText style={[styles.retryText, { color: colorScheme === 'dark' ? '#000000' : '#FACC15' }]}>Try Again</ThemedText>
                </Pressable>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#FACC15',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
