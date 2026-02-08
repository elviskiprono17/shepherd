/**
 * Theme Context
 * Manages application color scheme (light/dark mode)
 * Persists user preference in AsyncStorage
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
    colorScheme: ColorScheme;
    toggleTheme: () => void;
    setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const systemColorScheme = useSystemColorScheme();
    const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
        systemColorScheme === 'dark' ? 'dark' : 'light'
    );
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme === 'light' || savedTheme === 'dark') {
                    setColorSchemeState(savedTheme);
                }
            } catch (error) {
                console.log('Error loading theme:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, []);

    const setColorScheme = async (scheme: ColorScheme) => {
        setColorSchemeState(scheme);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        const newScheme: ColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(newScheme);
    };

    // Don't render until theme is loaded to prevent flash
    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ colorScheme, toggleTheme, setColorScheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
