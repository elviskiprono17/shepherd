/**
 * OAuth Callback Handler
 * This route handles the OAuth redirect from Supabase
 * It extracts the tokens from the URL and sets the session
 */

import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

export default function AuthCallbackScreen() {
    const params = useLocalSearchParams();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // The tokens might be in the URL params
                const access_token = params.access_token as string;
                const refresh_token = params.refresh_token as string;

                if (access_token && refresh_token) {
                    // Set the session with the tokens from the URL
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });

                    if (error) {
                        console.error('Error setting session:', error);
                    }
                } else {
                    // If no tokens in params, the session might already be set
                    // Just refresh to make sure we have the latest
                    await supabase.auth.refreshSession();
                }

                // Navigate to home after a short delay
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 500);
            } catch (error) {
                console.error('Auth callback error:', error);
                // Navigate to login on error
                router.replace('/login');
            }
        };

        handleAuthCallback();
    }, [params]);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
            <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
            <ThemedText style={styles.text}>Completing sign in...</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 16,
        fontSize: 16,
    },
});
