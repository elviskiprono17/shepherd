/**
 * Coin Types - Mirrors DexScreener API response structure
 * These types will be used throughout the app for type safety
 */

// Chain identifiers supported by the app
export type ChainId = 'solana' | 'ethereum' | 'bsc' | 'base' | 'arbitrum';

// Core coin data structure
export interface Coin {
    id: string;
    tokenAddress: string;
    pairAddress: string;
    name: string;
    symbol: string;
    chain: ChainId;
    price: number;
    priceChange24h: number;
    liquidity: number;
    volume24h: number;
    marketCap: number | null;
    pairCreatedAt: string; // ISO timestamp

    // Explainability fields for "Why Card"
    freshnessScore: number;   // 0-100, higher = newer
    liquidityScore: number;   // 0-100, higher = more liquid
    discoveryReason: string;  // Human-readable explanation
}

// Metrics snapshot for historical tracking
export interface CoinMetrics {
    coinId: string;
    price: number;
    liquidity: number;
    volume24h: number;
    priceChange24h: number;
    recordedAt: string;
}

// API response wrapper
export interface CoinsResponse {
    coins: Coin[];
    total: number;
    page: number;
    pageSize: number;
}

// Hook return type
export interface UseCoinsResult {
    coins: Coin[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}
