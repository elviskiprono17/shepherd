/**
 * Supabase Client Configuration
 * Initializes the Supabase client with project credentials
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://kpnljxoajcbpcfidziff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwbmxqeG9hamNicGNmaWR6aWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTI4MTQsImV4cCI6MjA4NTc2ODgxNH0._spo3NSfFGv5O0wL_-8zATC7IGOMRfYuuBu2iTvZiO8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
