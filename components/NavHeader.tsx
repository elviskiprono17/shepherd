/**
 * NavHeader Component
 * Custom navigation header with hamburger menu, Pro+ button, and theme toggle
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

interface NavHeaderProps {
    onToggleTheme: () => void;
}

export function NavHeader({ onToggleTheme }: NavHeaderProps) {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const handleMenuPress = () => {
        router.push('/feedback');
    };

    const handleProPress = () => {
        // TODO: Navigate to upgrade/subscription screen
        console.log('Pro+ pressed');
    };

    return (
        <View style={styles.container}>
            {/* Left: Hamburger Menu */}
            <Pressable style={styles.iconButton} onPress={handleMenuPress} hitSlop={8}>
                <IconSymbol
                    name="line.3.horizontal"
                    size={24}
                    color={isDark ? Colors.dark.text : Colors.light.text}
                />
            </Pressable>

            {/* Center: Pro+ Button */}
            <Pressable
                style={[
                    styles.proButton,
                    {
                        backgroundColor: isDark ? '#000000' : '#ffffff',
                        borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
                    }
                ]}
                onPress={handleProPress}
            >
                <ThemedText style={[styles.proButtonText, { color: isDark ? Colors.dark.tint : Colors.light.tint }]}>
                    Pro+
                </ThemedText>
            </Pressable>

            {/* Right: Theme Toggle */}
            <Pressable style={styles.iconButton} onPress={onToggleTheme} hitSlop={8}>
                <IconSymbol
                    name={isDark ? 'sun.max.fill' : 'moon.fill'}
                    size={24}
                    color={isDark ? Colors.dark.tint : Colors.light.text}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    },
    iconButton: {
        padding: 8,
    },
    proButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'solid',
    },
    proButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
