/**
 * Login Screen
 * Authentication screen with Google, Apple, and Email/Password options
 */

import React, { useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    TextInput,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { ColorScheme, useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
    const { colorScheme } = useTheme();
    const { signInWithEmail, signUpWithEmail, signInWithOAuth, isLoading } = useAuth();
    const isDark = colorScheme === 'dark';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const { error } = isSignUp
                ? await signUpWithEmail(email, password)
                : await signInWithEmail(email, password);

            if (error) {
                Alert.alert('Error', error.message);
            } else if (isSignUp) {
                Alert.alert('Success', 'Check your email to confirm your account!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
        setLoading(true);
        try {
            const { error } = await signInWithOAuth(provider);
            if (error) {
                Alert.alert('Error', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000' : '#fff' }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ThemedView style={styles.content}>
                    {/* Logo and Title */}
                    <View style={styles.header}>
                        <Image
                            source={require('@/assets/images/shepherd-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <ThemedText style={styles.title}>Shepherd</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Discover fresh meme coins before everyone else
                        </ThemedText>
                    </View>

                    {/* OAuth Buttons */}
                    <View style={styles.oauthSection}>
                        <Pressable
                            style={[
                                styles.oauthButton,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                    borderWidth: 1,
                                }
                            ]}
                            onPress={() => handleOAuthSignIn('google')}
                            disabled={loading}
                        >
                            <ThemedText style={styles.oauthLogo}>G</ThemedText>
                            <ThemedText style={[styles.oauthButtonText, { color: isDark ? '#fff' : '#000' }]}>
                                Continue with Google
                            </ThemedText>
                        </Pressable>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
                        <ThemedText style={styles.dividerText}>or</ThemedText>
                        <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
                    </View>

                    {/* Email/Password Form */}
                    <View style={styles.form}>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    color: isDark ? '#fff' : '#000',
                                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                }
                            ]}
                            placeholder="Email"
                            placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    color: isDark ? '#fff' : '#000',
                                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                                }
                            ]}
                            placeholder="Password"
                            placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Pressable
                            style={[styles.submitButton, { backgroundColor: Colors[colorScheme].tint }]}
                            onPress={handleEmailAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <ThemedText style={styles.submitButtonText}>
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                </ThemedText>
                            )}
                        </Pressable>
                    </View>

                    {/* Toggle Sign In / Sign Up */}
                    <Pressable onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
                        <ThemedText style={styles.toggleText}>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            <ThemedText style={[styles.toggleTextBold, { color: Colors[colorScheme].tint }]}>
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </ThemedText>
                        </ThemedText>
                    </Pressable>
                </ThemedView>
            </KeyboardAvoidingView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
    },
    oauthSection: {
        gap: 12,
        marginBottom: 24,
    },
    oauthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    oauthButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    oauthLogo: {
        fontSize: 20,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 14,
        opacity: 0.5,
    },
    form: {
        gap: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    submitButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    toggleButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 14,
        opacity: 0.7,
    },
    toggleTextBold: {
        fontWeight: '700',
    },
});
