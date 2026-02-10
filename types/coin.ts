/**
 * Coin Types - Mirrors Supabase `coins` table schema
 * Includes fields for GoPlus verification and LLM summaries
 */

// Chain identifiers supported by the app
export type ChainId = 'solana' | 'ethereum' | 'bsc' | 'base' | 'arbitrum';

// Tier levels based on risk tolerance filters
export type CoinTier = 'aggressive' | 'conservative';

// Core coin data structure (matches Supabase `coins` table)
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
    tier: CoinTier;

    // Discovery metadata
    discoveryTimestamp: string;
    firstWhaleWallet: string;
    firstWhaleBuyAmount: number;

    // Verification statuses
    goplusVerified: boolean;
    goplusDetails: Record<string, any>;
    dexscreenerVerified: boolean;
    lpBurnPercent: number;

    // LLM-generated summaries (mock data until Claude is integrated)
    llmWhyConsider: string[];
    llmRiskFactors: string[];
    llmGeneratedAt: string | null;

    // Computed fields (calculated client-side)
    freshnessScore: number;   // 0-100, higher = newer
    liquidityScore: number;   // 0-100, higher = more liquid
    discoveryReason: string;  // Human-readable explanation

    // Whale signals count (from joined query)
    whaleCount?: number;
}

// Whale signal record (matches Supabase `whale_signals` table)
export interface WhaleSignal {
    id: string;
    coinId: string;
    walletAddress: string;
    buyAmountUsd: number;
    transactionSignature: string;
    isFirstDiscoverer: boolean;
    createdAt: string;
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
