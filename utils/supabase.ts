/**
 * Supabase Client Configuration
 * Initializes the Supabase client with project credentials
 * SSR-safe: only uses AsyncStorage on native platforms
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://kpnljxoajcbpcfidziff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbmxqeG9hamNicGNmaWR6aWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTI4MTQsImV4cCI6MjA4NTc2ODgxNH0._spo3NSfFGv5O0wL_-8zATC7IGOMRfYuuBu2iTvZiO8';

// Create Supabase client with platform-specific storage
const createSupabaseClient = (): SupabaseClient => {
    // Only use AsyncStorage on native platforms (iOS/Android)
    if (Platform.OS !== 'web') {
        // Lazy import to avoid SSR issues
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                storage: AsyncStorage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
            },
        });
    }

    // For web, use default localStorage (or no persistence during SSR)
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });
};

export const supabase = createSupabaseClient();
