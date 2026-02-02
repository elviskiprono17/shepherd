/**
 * LoadingSkeleton Component
 * Animated placeholder shown while coin data is loading
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { ThemedView } from '@/components/themed-view';

interface LoadingSkeletonProps {
    count?: number;
}

function SkeletonCard() {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.7, { duration: 800 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <ThemedView style={styles.card}>
            {/* Header skeleton */}
            <View style={styles.header}>
                <Animated.View style={[styles.titleSkeleton, animatedStyle]} />
                <Animated.View style={[styles.badgeSkeleton, animatedStyle]} />
            </View>

            {/* Price skeleton */}
            <Animated.View style={[styles.priceSkeleton, animatedStyle]} />

            {/* Stats row skeleton */}
            <View style={styles.statsRow}>
                <Animated.View style={[styles.statSkeleton, animatedStyle]} />
                <Animated.View style={[styles.statSkeleton, animatedStyle]} />
                <Animated.View style={[styles.statSkeleton, animatedStyle]} />
            </View>

            {/* Freshness bar skeleton */}
            <Animated.View style={[styles.barSkeleton, animatedStyle]} />

            {/* Reason skeleton */}
            <Animated.View style={[styles.reasonSkeleton, animatedStyle]} />
        </ThemedView>
    );
}

export function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    titleSkeleton: {
        width: 140,
        height: 20,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    badgeSkeleton: {
        width: 48,
        height: 24,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    priceSkeleton: {
        width: 120,
        height: 28,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statSkeleton: {
        width: 80,
        height: 36,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    barSkeleton: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 12,
    },
    reasonSkeleton: {
        width: '80%',
        height: 16,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
});
