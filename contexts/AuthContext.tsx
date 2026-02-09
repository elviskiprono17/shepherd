/**
 * Auth Context
 * Provides authentication state and functions across the app
 * Supports Google, Apple, and Email/Password authentication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

        return () => subscription.unsubscribe();
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

    // Sign in with OAuth (Google/Apple)
    const signInWithOAuth = async (provider: 'google' | 'apple') => {
        try {
            // Use expo-auth-session for proper redirect URI
            const AuthSession = require('expo-auth-session');
            const WebBrowser = require('expo-web-browser');

            // Create the proper redirect URI
            const redirectUri = AuthSession.makeRedirectUri({
                scheme: 'shepherd',
                path: 'auth-callback',
            });

            console.log('Redirect URI:', redirectUri);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUri,
                    skipBrowserRedirect: true,
                },
            });

            if (error) {
                return { error: new Error(error.message) };
            }

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUri
                );

                console.log('OAuth result:', result);

                if (result.type === 'success' && result.url) {
                    // Extract the session from the URL
                    const url = new URL(result.url);

                    // Supabase can return tokens in hash or query params
                    let access_token: string | null = null;
                    let refresh_token: string | null = null;

                    // Check hash first (fragment)
                    if (url.hash) {
                        const hashParams = new URLSearchParams(url.hash.substring(1));
                        access_token = hashParams.get('access_token');
                        refresh_token = hashParams.get('refresh_token');
                    }

                    // Check query params as fallback
                    if (!access_token) {
                        access_token = url.searchParams.get('access_token');
                        refresh_token = url.searchParams.get('refresh_token');
                    }

                    if (access_token && refresh_token) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });
                        if (sessionError) {
                            return { error: new Error(sessionError.message) };
                        }
                    } else {
                        // If we got here but no tokens, the session may already be set
                        // Try refreshing the session
                        await supabase.auth.refreshSession();
                    }
                } else if (result.type === 'cancel') {
                    return { error: new Error('Authentication was cancelled') };
                }
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
