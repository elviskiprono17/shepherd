/**
 * Filter Context
 * Manages the user's selected risk tier (aggressive/conservative)
 * Persists preference in AsyncStorage
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoinTier } from '@/types/coin';

interface FilterContextType {
    selectedTier: CoinTier;
    setSelectedTier: (tier: CoinTier) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const FILTER_STORAGE_KEY = '@filter_tier';

interface FilterProviderProps {
    children: ReactNode;
}

export function FilterProvider({ children }: FilterProviderProps) {
    const [selectedTier, setSelectedTierState] = useState<CoinTier>('aggressive');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved tier preference
    useEffect(() => {
        const loadTier = async () => {
            try {
                const savedTier = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
                if (savedTier === 'aggressive' || savedTier === 'conservative') {
                    setSelectedTierState(savedTier);
                }
            } catch (error) {
                console.log('Error loading filter tier:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTier();
    }, []);

    const setSelectedTier = async (tier: CoinTier) => {
        setSelectedTierState(tier);
        try {
            await AsyncStorage.setItem(FILTER_STORAGE_KEY, tier);
        } catch (error) {
            console.log('Error saving filter tier:', error);
        }
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <FilterContext.Provider value={{ selectedTier, setSelectedTier }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter(): FilterContextType {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
}
