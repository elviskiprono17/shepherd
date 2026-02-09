/**
 * Home Screen - Coin Discovery Feed
 * Displays real-time meme coin discovery feed with:
 * - Token name, symbol, and chain
 * - Price and 24h change
 * - Liquidity and volume stats
 * - Age and freshness indicators
 * - Discovery reason (Why Card preview)
 * 
 * Data Flow:
 * 1. useCoins hook fetches data (mock now, Supabase later)
 * 2. CoinList renders with pull-to-refresh
 * 3. CoinCard displays individual token info
 */

import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CoinList } from '@/components/CoinList';
import { NavHeader } from '@/components/NavHeader';
import { useCoins } from '@/hooks/useCoins';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { Coin } from '@/types/coin';

export default function HomeScreen() {
  const { colorScheme, toggleTheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const { coins, loading, error, refresh } = useCoins();

  // Navigate to coin detail screen when card is pressed
  const handleCoinPress = (coin: Coin) => {
    router.push(`/coin/${coin.id}` as Href);
  };

  return (
    <SafeAreaView style={[
      styles.safeArea,
      { backgroundColor: isDark ? '#000000' : '#ffffff' }
    ]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavHeader onToggleTheme={toggleTheme} />

      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.logo}>Shepherd</ThemedText>
          <ThemedText style={styles.tagline}>Discover fresh tokens</ThemedText>
        </View>

        {/* Stats Bar */}
        <View style={[styles.statsBar, { backgroundColor: colorScheme === 'dark' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(250, 204, 21, 0.1)' }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>{coins.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Tokens</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colorScheme === 'dark' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(250, 204, 21, 0.2)' }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>
              {coins.filter(c => c.freshnessScore > 70).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Fresh 🔥</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colorScheme === 'dark' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(250, 204, 21, 0.2)' }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>
              {new Set(coins.map(c => c.chain)).size}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Chains</ThemedText>
          </View>
        </View>

        {/* Coin Feed */}
        <View style={styles.feedContainer}>
          <CoinList
            coins={coins}
            loading={loading}
            error={error}
            onRefresh={refresh}
            onCoinPress={handleCoinPress}
          />
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
    paddingBottom: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    opacity: 0.6,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,

  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',

  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,

  },
  feedContainer: {
    flex: 1,
  },
});
