/**
 * Auth Context
 * Provides authentication state and functions across the app
 * Supports Google, Apple, and Email/Password authentication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';

export type PlanType = 'free' | 'pro';

interface UserProfile {
    id: string;
    email: string | null;
    planType: PlanType;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    isPro: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile from profiles table
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.log('Error fetching profile:', error);
                return null;
            }

            return {
                id: data.id,
                email: data.email,
                planType: data.plan_type as PlanType,
                createdAt: data.created_at,
            };
        } catch (err) {
            console.log('Error in fetchProfile:', err);
            return null;
        }
    };

    // Refresh profile data
    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id);
            setProfile(profileData);
        }
    };

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id).then(setProfile);
            }

            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                } else {
                    setProfile(null);
                }
            }
        );

        // Deep link listener for OAuth redirect (backup for mobile)
        let linkingSubscription: any = null;
        if (Platform.OS !== 'web') {
            const Linking = require('expo-linking');
            linkingSubscription = Linking.addEventListener('url', async (event: { url: string }) => {
                if (event.url && event.url.includes('auth-callback')) {
                    console.log('Deep link received:', event.url.substring(0, 50) + '...');
                    const QueryParams = require('expo-auth-session/build/QueryParams');
                    const { params } = QueryParams.getQueryParams(event.url);
                    if (params?.access_token && params?.refresh_token) {
                        await supabase.auth.setSession({
                            access_token: params.access_token,
                            refresh_token: params.refresh_token,
                        });
                    }
                }
            });
        }

        return () => {
            subscription.unsubscribe();
            if (linkingSubscription) linkingSubscription.remove();
        };
    }, []);

    // Sign in with email/password
    const signInWithEmail = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // Sign up with email/password
    const signUpWithEmail = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // Extract tokens from a redirect URL (hash fragment or query params)
    const createSessionFromUrl = async (urlString: string) => {
        try {
            // Try expo-auth-session's QueryParams first (most reliable)
            const QueryParams = require('expo-auth-session/build/QueryParams');
            const { params, errorCode } = QueryParams.getQueryParams(urlString);
            if (errorCode) {
                console.error('OAuth error code:', errorCode);
                return null;
            }
            const { access_token, refresh_token } = params;
            if (!access_token) return null;

            const { data, error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
            });
            if (error) {
                console.error('Failed to set session:', error.message);
                return null;
            }
            return data.session;
        } catch (e) {
            console.error('Error creating session from URL:', e);
            return null;
        }
    };

    // Sign in with OAuth (Google/Apple)
    const signInWithOAuth = async (provider: 'google' | 'apple') => {
        try {
            if (Platform.OS === 'web') {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider,
                    options: { redirectTo: window.location.origin },
                });
                if (error) return { error: new Error(error.message) };
                return { error: null };
            }

            // Mobile: open browser and listen for deep link return
            const Linking = require('expo-linking');
            const WebBrowser = require('expo-web-browser');

            const redirectUri = Linking.createURL('auth-callback');
            console.log('OAuth redirect URI:', redirectUri);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUri,
                    skipBrowserRedirect: true,
                },
            });

            if (error) return { error: new Error(error.message) };

            if (data?.url) {
                // Create a promise that resolves when the deep link fires
                const sessionPromise = new Promise<void>((resolve) => {
                    const sub = Linking.addEventListener('url', async (event: { url: string }) => {
                        if (event.url && event.url.includes('auth-callback')) {
                            console.log('Deep link caught, setting session...');
                            await createSessionFromUrl(event.url);
                            sub.remove();
                            // Close the browser
                            try { WebBrowser.dismissBrowser(); } catch (_) { }
                            resolve();
                        }
                    });

                    // Timeout after 60s to avoid hanging forever
                    setTimeout(() => {
                        sub.remove();
                        resolve();
                    }, 60000);
                });

                // Open the browser (non-blocking for deep links)
                await WebBrowser.openBrowserAsync(data.url, {
                    showInRecents: true,
                    createTask: false,
                });

                // Wait for the deep link to fire
                await sessionPromise;
            }

            return { error: null };
        } catch (err) {
            console.error('OAuth error:', err);
            return { error: err as Error };
        }
    };

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const value = {
        user,
        profile,
        session,
        isLoading,
        isPro: profile?.planType === 'pro',
        signInWithEmail,
        signUpWithEmail,
        signInWithOAuth,
        signOut,
        refreshProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
