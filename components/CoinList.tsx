/**
 * CoinList Component
 * FlatList wrapper for displaying coin feed with pull-to-refresh
 */

import React from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { CoinCard } from './CoinCard';
import { LoadingSkeleton } from './ui/LoadingSkeleton';
import { ErrorState } from './ui/ErrorState';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Coin } from '@/types/coin';

interface CoinListProps {
    coins: Coin[];
    loading: boolean;
    error: Error | null;
    onRefresh: () => Promise<void>;
    onCoinPress?: (coin: Coin) => void;
}

export function CoinList({
    coins,
    loading,
    error,
    onRefresh,
    onCoinPress
}: CoinListProps) {
    const [refreshing, setRefreshing] = React.useState(false);
    const colorScheme = useColorScheme();

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    // Show loading skeleton on initial load
    if (loading && coins.length === 0) {
        return <LoadingSkeleton count={5} />;
    }

    // Show error state
    if (error && coins.length === 0) {
        return <ErrorState message={error.message} onRetry={onRefresh} />;
    }

    // Empty state
    if (!loading && coins.length === 0) {
        return (
            <View style={styles.emptyContainer}>

                <ThemedText style={styles.emptyTitle}>Nothing to show here for now</ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                    Refresh for latest coins
                </ThemedText>
            </View>
        );
    }

    return (
        <FlatList
            data={coins}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <CoinCard coin={item} onPress={onCoinPress} />
            )}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={Colors[colorScheme ?? 'light'].tint}
                    colors={[Colors[colorScheme ?? 'light'].tint]}
                />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingVertical: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
    },
});
