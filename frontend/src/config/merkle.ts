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

  // Default trading parameters - following Merkle SDK patterns
  DEFAULT_PARAMS: {
    SLIPPAGE_TOLERANCE: 0.01, // 1%
    MIN_POSITION_SIZE: 2, // 2 USDC minimum (following their docs: "start with just $2")
    DEFAULT_LEVERAGE: 2,
    MAX_LEVERAGE: 150, // Up to 150x as per their documentation
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
 * Following SDK patterns: amounts should be in USDC units with 6 decimals
 * Example: 300 USDC -> 300_000_000n
 */
export function formatMerkleAmount(amount: number): bigint {
  // Merkle SDK expects USDC units (6 decimals)
  // Example from docs: sizeDelta: 300_000_000n (300 USDC)
  return BigInt(Math.floor(amount * 1_000_000))
}

/**
 * Parse amount from Merkle Trade (converts from smallest units)
 * Following SDK patterns: amounts are in USDC units with 6 decimals
 */
export function parseMerkleAmount(amount: bigint | string | number): number {
  // Convert from micro USDC to USDC
  if (typeof amount === 'bigint') {
    return Number(amount) / 1_000_000
  }
  if (typeof amount === 'string') {
    return Number(amount) / 1_000_000
  }
  return amount / 1_000_000
}

/**
 * Get minimum position size following Merkle patterns
 */
export function getMinPositionSize(): number {
  return MERKLE_CONFIG.DEFAULT_PARAMS.MIN_POSITION_SIZE
}

/**
 * Get collateral symbol - Merkle uses USDC
 */
export function getCollateralSymbol(): string {
  return 'USDC'
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