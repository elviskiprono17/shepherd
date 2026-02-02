/**
 * Explore Screen - Trending Coins & Search
 * Placeholder for future features:
 * - Search functionality
 * - Filter by chain
 * - Trending tokens
 * - Watchlist
 */

import React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={[
      styles.safeArea,
      { backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#ffffff' }
    ]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Explore</ThemedText>
          <ThemedText style={styles.subtitle}>Discover trending tokens</ThemedText>
        </View>

        {/* Coming Soon Placeholder */}
        <View style={styles.placeholder}>
          <ThemedText style={styles.emoji}>🔍</ThemedText>
          <ThemedText style={styles.comingSoon}>Coming Soon</ThemedText>
          <ThemedText style={styles.features}>
            • Search tokens by name{'\n'}
            • Filter by chain{'\n'}
            • View trending coins{'\n'}
            • Create watchlists
          </ThemedText>
        </View>
      </ThemedView>
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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#a78bfa',
  },
  features: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 28,
  },
});
