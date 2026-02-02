/**
 * Coin Detail Modal
 * Shows detailed information about a selected coin
 */

import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CoinDetailModal() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.emoji}>📊</ThemedText>
      <ThemedText type="title">Coin Details</ThemedText>
      <ThemedText style={styles.subtitle}>
        Detailed view coming soon
      </ThemedText>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
        onPress={() => router.back()}
      >
        <ThemedText style={styles.buttonText}>Go Back</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.6,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#a78bfa',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
