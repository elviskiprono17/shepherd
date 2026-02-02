/**
 * Mock Coin Data
 * Realistic data structure matching DexScreener API responses
 * This will be replaced with real API calls + Supabase in Phase 2
 */

import { Coin, ChainId } from '@/types/coin';

// Helper to generate random date in past X hours
function randomDateInPastHours(maxHours: number): string {
    const now = new Date();
    const hoursAgo = Math.random() * maxHours;
    const pastDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return pastDate.toISOString();
}

// Generate discovery reason based on coin attributes
function generateDiscoveryReason(coin: Partial<Coin>): string {
    const reasons = [
        `New liquidity added on ${coin.chain?.toUpperCase()}`,
        `Fresh launch with ${coin.liquidityScore! > 70 ? 'strong' : 'growing'} liquidity`,
        `Trending on ${coin.chain?.toUpperCase()} DEXs`,
        `High volume activity detected`,
        `Recently created trading pair`,
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
}

// Calculate freshness score (0-100, higher = newer)
function calculateFreshnessScore(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    // 0 hours = 100 score, 24+ hours = 0 score
    return Math.max(0, Math.round(100 - (hoursOld / 24) * 100));
}

// Calculate liquidity score (0-100)
function calculateLiquidityScore(liquidity: number): number {
    // Scale: $1K = 20, $10K = 50, $100K = 80, $1M+ = 100
    if (liquidity >= 1_000_000) return 100;
    if (liquidity >= 100_000) return 80 + (liquidity - 100_000) / 45_000;
    if (liquidity >= 10_000) return 50 + (liquidity - 10_000) / 3_000;
    if (liquidity >= 1_000) return 20 + (liquidity - 1_000) / 300;
    return Math.round((liquidity / 1_000) * 20);
}

// Mock coin data - realistic meme coins
export const MOCK_COINS: Coin[] = [
    {
        id: '1',
        tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        pairAddress: 'HxkQdUnrPdHwXP5T9kewEXs3ApgvbufuTfdw9v1nApFd',
        name: 'Bonk',
        symbol: 'BONK',
        chain: 'solana',
        price: 0.00001234,
        priceChange24h: 15.7,
        liquidity: 2_500_000,
        volume24h: 890_000,
        marketCap: 850_000_000,
        pairCreatedAt: randomDateInPastHours(3),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '2',
        tokenAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
        pairAddress: 'FRhB8L7Y9Qq41qZXYLtC2nw8An1RJfLLxRF2x9RwLLMo',
        name: 'Popcat',
        symbol: 'POPCAT',
        chain: 'solana',
        price: 0.00089,
        priceChange24h: -5.2,
        liquidity: 1_200_000,
        volume24h: 450_000,
        marketCap: 450_000_000,
        pairCreatedAt: randomDateInPastHours(6),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '3',
        tokenAddress: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5',
        pairAddress: 'MEWPair123456789abcdef',
        name: 'Cat in a Dogs World',
        symbol: 'MEW',
        chain: 'solana',
        price: 0.0067,
        priceChange24h: 28.4,
        liquidity: 3_800_000,
        volume24h: 1_200_000,
        marketCap: 620_000_000,
        pairCreatedAt: randomDateInPastHours(2),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '4',
        tokenAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
        pairAddress: '0xPairShiba123456789',
        name: 'Shiba Inu',
        symbol: 'SHIB',
        chain: 'ethereum',
        price: 0.000012,
        priceChange24h: 3.8,
        liquidity: 45_000_000,
        volume24h: 12_000_000,
        marketCap: 7_200_000_000,
        pairCreatedAt: randomDateInPastHours(12),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '5',
        tokenAddress: 'WIFnewtoken123solana456',
        pairAddress: 'WIFpairaddress789abc',
        name: 'Dogwifhat',
        symbol: 'WIF',
        chain: 'solana',
        price: 2.45,
        priceChange24h: -12.3,
        liquidity: 28_000_000,
        volume24h: 8_500_000,
        marketCap: 2_400_000_000,
        pairCreatedAt: randomDateInPastHours(8),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '6',
        tokenAddress: 'FLOKInewtoken789eth',
        pairAddress: 'FLOKIpair456def',
        name: 'Floki Inu',
        symbol: 'FLOKI',
        chain: 'bsc',
        price: 0.00015,
        priceChange24h: 8.9,
        liquidity: 15_000_000,
        volume24h: 5_200_000,
        marketCap: 1_400_000_000,
        pairCreatedAt: randomDateInPastHours(5),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '7',
        tokenAddress: 'BRETTnewtoken123base',
        pairAddress: 'BRETTpair789ghi',
        name: 'Brett',
        symbol: 'BRETT',
        chain: 'base',
        price: 0.089,
        priceChange24h: 45.2,
        liquidity: 8_500_000,
        volume24h: 3_200_000,
        marketCap: 890_000_000,
        pairCreatedAt: randomDateInPastHours(1),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '8',
        tokenAddress: 'MOGnewtoken456arb',
        pairAddress: 'MOGpair123jkl',
        name: 'Mog Coin',
        symbol: 'MOG',
        chain: 'ethereum',
        price: 0.0000021,
        priceChange24h: -3.1,
        liquidity: 4_200_000,
        volume24h: 980_000,
        marketCap: 380_000_000,
        pairCreatedAt: randomDateInPastHours(4),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '9',
        tokenAddress: 'GIGAnewsolanatoken789',
        pairAddress: 'GIGApair456mno',
        name: 'Giga Chad',
        symbol: 'GIGA',
        chain: 'solana',
        price: 0.042,
        priceChange24h: 120.5,
        liquidity: 2_100_000,
        volume24h: 890_000,
        marketCap: 42_000_000,
        pairCreatedAt: randomDateInPastHours(0.5),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
    {
        id: '10',
        tokenAddress: 'AIXBTnewbasetoken123',
        pairAddress: 'AIXBTpair789pqr',
        name: 'aixbt by Virtuals',
        symbol: 'AIXBT',
        chain: 'base',
        price: 0.34,
        priceChange24h: 67.8,
        liquidity: 12_000_000,
        volume24h: 4_500_000,
        marketCap: 340_000_000,
        pairCreatedAt: randomDateInPastHours(2.5),
        freshnessScore: 0,
        liquidityScore: 0,
        discoveryReason: '',
    },
];

// Process mock data to add calculated fields
export function getMockCoins(): Coin[] {
    return MOCK_COINS.map(coin => {
        const freshnessScore = calculateFreshnessScore(coin.pairCreatedAt);
        const liquidityScore = calculateLiquidityScore(coin.liquidity);

        return {
            ...coin,
            freshnessScore,
            liquidityScore,
            discoveryReason: generateDiscoveryReason({
                ...coin,
                freshnessScore,
                liquidityScore
            }),
        };
    }).sort((a, b) => b.freshnessScore - a.freshnessScore); // Sort by freshness
}
