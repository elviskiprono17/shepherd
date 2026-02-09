/**
 * Alerts Screen - Price & Discovery Notifications
 * Manage alerts for:
 * - New token discoveries matching filters
 * - Price movement thresholds
 * - Liquidity changes
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    ScrollView,
    Pressable,
    Switch
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavHeader } from '@/components/NavHeader';
import { useTheme } from '@/contexts/ThemeContext';

interface Alert {
    id: string;
    type: 'discovery' | 'price' | 'liquidity';
    title: string;
    description: string;
    enabled: boolean;
    emoji: string;
}

const MOCK_ALERTS: Alert[] = [
    {
        id: '1',
        type: 'discovery',
        title: 'New Token Alert',
        description: 'Get notified when new tokens match your filters',
        enabled: true,
        emoji: '🔔',
    },
    {
        id: '2',
        type: 'price',
        title: 'Price Pump Alert',
        description: 'Alert when a token pumps 50%+ in 1 hour',
        enabled: true,
        emoji: '📈',
    },
    {
        id: '3',
        type: 'price',
        title: 'Price Drop Alert',
        description: 'Alert when a token drops 30%+ in 1 hour',
        enabled: false,
        emoji: '📉',
    },
    {
        id: '4',
        type: 'liquidity',
        title: 'Liquidity Added',
        description: 'Alert when significant liquidity is added',
        enabled: true,
        emoji: '💧',
    },
    {
        id: '5',
        type: 'liquidity',
        title: 'Liquidity Removed',
        description: 'Warning when liquidity is pulled (rug risk)',
        enabled: true,
        emoji: '⚠️',
    },
];

export default function AlertsScreen() {
    const { colorScheme, toggleTheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);

    const toggleAlert = (id: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
        ));
    };

    const enabledCount = alerts.filter(a => a.enabled).length;

    return (
        <SafeAreaView style={[
            styles.safeArea,
            { backgroundColor: isDark ? '#000000' : '#ffffff' }
        ]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <NavHeader onToggleTheme={toggleTheme} />

            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Alerts</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {enabledCount} of {alerts.length} alerts active
                    </ThemedText>
                </View>

                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: isDark ? 'rgba(250, 204, 21, 0.1)' : 'rgba(250, 204, 21, 0.05)' }]}>
                    <ThemedText style={styles.statusEmoji}>🔔</ThemedText>
                    <View style={styles.statusText}>
                        <ThemedText style={styles.statusTitle}>Push Notifications</ThemedText>
                        <ThemedText style={styles.statusSubtitle}>
                            Coming soon - alerts will work in-app for now
                        </ThemedText>
                    </View>
                </View>

                {/* Alert Categories */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Discovery Alerts</ThemedText>
                    {alerts.filter(a => a.type === 'discovery').map(alert => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onToggle={toggleAlert}
                            isDark={isDark}
                        />
                    ))}
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Price Alerts</ThemedText>
                    {alerts.filter(a => a.type === 'price').map(alert => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onToggle={toggleAlert}
                            isDark={isDark}
                        />
                    ))}
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Liquidity Alerts</ThemedText>
                    {alerts.filter(a => a.type === 'liquidity').map(alert => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onToggle={toggleAlert}
                            isDark={isDark}
                        />
                    ))}
                </View>

                {/* Add Custom Alert Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.addButton,
                        pressed && styles.addButtonPressed
                    ]}
                >
                    <ThemedText style={styles.addButtonText}>+ Create Custom Alert</ThemedText>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function AlertCard({
    alert,
    onToggle,
    isDark
}: {
    alert: Alert;
    onToggle: (id: string) => void;
    isDark: boolean;
}) {
    return (
        <View style={[
            styles.alertCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
        ]}>
            <View style={styles.alertLeft}>
                <ThemedText style={styles.alertEmoji}>{alert.emoji}</ThemedText>
                <View style={styles.alertInfo}>
                    <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
                    <ThemedText style={styles.alertDescription}>{alert.description}</ThemedText>
                </View>
            </View>
            <Switch
                value={alert.enabled}
                onValueChange={() => onToggle(alert.id)}
                trackColor={{ false: '#767577', true: '#FACC15' }}
                thumbColor={alert.enabled ? '#fff' : '#f4f3f4'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 32,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
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
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
    },
    statusEmoji: {
        fontSize: 32,
    },
    statusText: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusSubtitle: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 2,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        opacity: 0.8,
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    alertLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    alertEmoji: {
        fontSize: 24,
    },
    alertInfo: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    alertDescription: {
        fontSize: 12,
        opacity: 0.6,
    },
    addButton: {
        borderWidth: 2,
        borderColor: '#FACC15',
        borderStyle: 'dashed',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addButtonPressed: {
        opacity: 0.7,
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
    },
    addButtonText: {
        color: '#FACC15',
        fontSize: 16,
        fontWeight: '600',
    },
});
