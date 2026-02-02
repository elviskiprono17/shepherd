/**
 * Formatting Utilities
 * Helper functions for displaying coin data in the UI
 */

/**
 * Format a timestamp to relative age (e.g., "2h ago", "3d ago")
 */
export function formatAge(isoTimestamp: string): string {
    const created = new Date(isoTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else if (days < 7) {
        return `${days}d ago`;
    } else {
        return `${Math.floor(days / 7)}w ago`;
    }
}

/**
 * Format price with appropriate precision
 * Very small prices get more decimal places
 */
export function formatPrice(price: number): string {
    if (price === 0) return '$0';

    if (price < 0.00001) {
        return `$${price.toExponential(2)}`;
    } else if (price < 0.01) {
        return `$${price.toFixed(6)}`;
    } else if (price < 1) {
        return `$${price.toFixed(4)}`;
    } else if (price < 1000) {
        return `$${price.toFixed(2)}`;
    } else {
        return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLiquidity(value: number): string {
    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(1)}K`;
    } else {
        return `$${value.toFixed(0)}`;
    }
}

/**
 * Format percentage change with color indicator
 */
export function formatPercentChange(percent: number): {
    text: string;
    isPositive: boolean;
} {
    const isPositive = percent >= 0;
    const sign = isPositive ? '+' : '';
    return {
        text: `${sign}${percent.toFixed(2)}%`,
        isPositive,
    };
}

/**
 * Get chain display name and color
 */
export function getChainInfo(chain: string): { name: string; color: string } {
    const chains: Record<string, { name: string; color: string }> = {
        solana: { name: 'SOL', color: '#9945FF' },
        ethereum: { name: 'ETH', color: '#627EEA' },
        bsc: { name: 'BSC', color: '#F3BA2F' },
        base: { name: 'BASE', color: '#0052FF' },
        arbitrum: { name: 'ARB', color: '#28A0F0' },
    };

    return chains[chain] || { name: chain.toUpperCase(), color: '#888888' };
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars = 4): string {
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
