import { MerkleClient, MerkleClientConfig } from '@merkletrade/ts-sdk'

// Merkle Trade Configuration
export const MERKLE_CONFIG = {
  // Use testnet for development, mainnet for production
  NETWORK: process.env.NEXT_PUBLIC_APTOS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
  
  // Trading pairs supported by Merkle Trade
  TRADING_PAIRS: {
    BTC_USD: 'BTC_USD',
    ETH_USD: 'ETH_USD',
    APT_USD: 'APT_USD',
    SOL_USD: 'SOL_USD',
    AVAX_USD: 'AVAX_USD',
    MATIC_USD: 'MATIC_USD',
    DOGE_USD: 'DOGE_USD',
  } as const,

  // Default trading parameters
  DEFAULT_PARAMS: {
    SLIPPAGE_TOLERANCE: 0.01, // 1%
    MIN_POSITION_SIZE: 1_000_000, // 1 USDC in smallest units
    DEFAULT_LEVERAGE: 2,
    MAX_LEVERAGE: 100,
  },

  // Risk management settings
  RISK_MANAGEMENT: {
    MAX_POSITION_SIZE_PERCENTAGE: 0.2, // 20% of vault
    STOP_LOSS_PERCENTAGE: 0.05, // 5%
    TAKE_PROFIT_PERCENTAGE: 0.15, // 15%
  }
} as const

export type TradingPair = keyof typeof MERKLE_CONFIG.TRADING_PAIRS

/**
 * Initialize Merkle Trade client
 */
export async function createMerkleClient(): Promise<MerkleClient> {
  try {
    const config = MERKLE_CONFIG.NETWORK === 'mainnet' 
      ? await MerkleClientConfig.mainnet()
      : await MerkleClientConfig.testnet()
    
    return new MerkleClient(config)
  } catch (error) {
    console.error('Failed to initialize Merkle client:', error)
    throw new Error('Merkle Trade client initialization failed')
  }
}

/**
 * Format amount for Merkle Trade (converts to smallest units)
 * Following SDK example: sizeDelta: 300_000_000n (for $300)
 */
export function formatMerkleAmount(amount: number): bigint {
  // Merkle Trade uses 6 decimal places for USDC
  // Example: $300 = 300_000_000n
  return BigInt(Math.floor(amount * 1_000_000))
}

/**
 * Parse amount from Merkle Trade (converts from smallest units)
 */
export function parseMerkleAmount(amount: bigint | string | number): number {
  if (typeof amount === 'bigint') {
    return Number(amount) / 1_000_000
  }
  if (typeof amount === 'string') {
    return Number(amount) / 1_000_000
  }
  return amount / 1_000_000
}

/**
 * Calculate position size based on vault balance and risk parameters
 */
export function calculatePositionSize(
  vaultBalance: number,
  riskPercentage: number = MERKLE_CONFIG.RISK_MANAGEMENT.MAX_POSITION_SIZE_PERCENTAGE
): number {
  return Math.floor(vaultBalance * riskPercentage)
}

/**
 * Validate trading pair
 */
export function isValidTradingPair(pair: string): pair is TradingPair {
  return Object.values(MERKLE_CONFIG.TRADING_PAIRS).includes(pair as TradingPair)
}

/**
 * Get display name for trading pair
 */
export function getTradingPairDisplayName(pair: TradingPair): string {
  return pair.replace('_', '/')
}