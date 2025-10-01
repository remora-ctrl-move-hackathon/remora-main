import { MerkleClient } from '@merkletrade/ts-sdk'
import { InputGenerateTransactionPayloadData } from '@aptos-labs/ts-sdk'
import { 
  createMerkleClient, 
  formatMerkleAmount, 
  parseMerkleAmount,
  TradingPair,
  MERKLE_CONFIG
} from '@/config/merkle'

export interface Position {
  pair: TradingPair
  size: number
  collateral: number
  isLong: boolean
  entryPrice: number
  markPrice: number
  pnl: number
  liquidationPrice: number
  timestamp: number
}

export interface OrderParams {
  pair: TradingPair
  size: number // in USDC
  collateral: number // in USDC
  isLong: boolean
  isIncrease: boolean
  leverage?: number
}

export interface LimitOrderParams extends OrderParams {
  triggerPrice: number
}

export interface TradingStats {
  totalPnl: number
  totalVolume: number
  winRate: number
  activePositions: number
  totalPositions: number
}

export class PerpetualTradingService {
  private merkleClient: MerkleClient | null = null
  private initPromise: Promise<void> | null = null

  constructor() {
    this.initPromise = this.initialize()
  }

  private async initialize(): Promise<void> {
    try {
      this.merkleClient = await createMerkleClient()
      console.log('Merkle Trade client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Merkle Trade client:', error)
      throw error
    }
  }

  private async ensureInitialized(): Promise<MerkleClient> {
    if (this.initPromise) {
      await this.initPromise
      this.initPromise = null
    }
    
    if (!this.merkleClient) {
      throw new Error('Merkle Trade client not initialized')
    }
    
    return this.merkleClient
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(
    userAddress: string,
    params: OrderParams
  ): Promise<InputGenerateTransactionPayloadData> {
    const client = await this.ensureInitialized()
    
    try {
      const payload = await client.payloads.placeMarketOrder({
        pair: params.pair,
        userAddress,
        sizeDelta: formatMerkleAmount(params.size),
        collateralDelta: formatMerkleAmount(params.collateral),
        isLong: params.isLong,
        isIncrease: params.isIncrease,
      })

      return payload
    } catch (error) {
      console.error('Error placing market order:', error)
      throw new Error(`Failed to place market order: ${error}`)
    }
  }

  /**
   * Place a limit order
   */
  async placeLimitOrder(
    userAddress: string,
    params: LimitOrderParams
  ): Promise<InputGenerateTransactionPayloadData> {
    const client = await this.ensureInitialized()
    
    try {
      const payload = await client.payloads.placeLimitOrder({
        pair: params.pair,
        userAddress,
        sizeDelta: formatMerkleAmount(params.size),
        collateralDelta: formatMerkleAmount(params.collateral),
        price: formatMerkleAmount(params.triggerPrice),
        isLong: params.isLong,
        isIncrease: params.isIncrease,
      })

      return payload
    } catch (error) {
      console.error('Error placing limit order:', error)
      throw new Error(`Failed to place limit order: ${error}`)
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(
    userAddress: string,
    pair: TradingPair,
    orderId: string
  ): Promise<InputGenerateTransactionPayloadData> {
    const client = await this.ensureInitialized()
    
    try {
      const payload = await client.payloads.cancelOrder({
        pair,
        userAddress: userAddress as `0x${string}`,
        orderId: BigInt(orderId),
      })

      return payload
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw new Error(`Failed to cancel order: ${error}`)
    }
  }

  /**
   * Get user positions
   */
  async getUserPositions(userAddress: string): Promise<Position[]> {
    const client = await this.ensureInitialized()
    
    try {
      const positions = await client.api.getPositions({ 
        address: userAddress as `0x${string}` 
      })
      
      return positions.map((pos: any) => ({
        pair: pos.pair as TradingPair,
        size: parseMerkleAmount(pos.size),
        collateral: parseMerkleAmount(pos.collateral),
        isLong: pos.isLong,
        entryPrice: parseMerkleAmount(pos.entryPrice),
        markPrice: parseMerkleAmount(pos.markPrice),
        pnl: parseMerkleAmount(pos.pnl),
        liquidationPrice: parseMerkleAmount(pos.liquidationPrice),
        timestamp: pos.timestamp,
      }))
    } catch (error) {
      console.error('Error fetching positions:', error)
      return []
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userAddress: string): Promise<any[]> {
    const client = await this.ensureInitialized()
    
    try {
      const orders = await client.api.getOrders({ 
        address: userAddress as `0x${string}` 
      })
      return orders
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  /**
   * Get trading history
   */
  async getTradingHistory(userAddress: string): Promise<any[]> {
    const client = await this.ensureInitialized()
    
    try {
      const history = await client.api.getTradingHistory({ 
        address: userAddress as `0x${string}` 
      })
      return history
    } catch (error) {
      console.error('Error fetching trading history:', error)
      return []
    }
  }

  /**
   * Calculate trading statistics
   */
  async getTradingStats(userAddress: string): Promise<TradingStats> {
    try {
      const [positions, history] = await Promise.all([
        this.getUserPositions(userAddress),
        this.getTradingHistory(userAddress)
      ])

      const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0)
      const totalVolume = history.reduce((sum, trade) => sum + (trade.size || 0), 0)
      const totalTrades = history.length
      const winningTrades = history.filter(trade => (trade.pnl || 0) > 0).length
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

      return {
        totalPnl,
        totalVolume,
        winRate,
        activePositions: positions.length,
        totalPositions: totalTrades,
      }
    } catch (error) {
      console.error('Error calculating trading stats:', error)
      return {
        totalPnl: 0,
        totalVolume: 0,
        winRate: 0,
        activePositions: 0,
        totalPositions: 0,
      }
    }
  }

  /**
   * Get market price for a trading pair
   */
  async getMarketPrice(pair: TradingPair): Promise<number> {
    const client = await this.ensureInitialized()
    
    try {
      // This would need to be implemented based on Merkle's price API
      // For now, return a placeholder
      return 50000 // Placeholder price
    } catch (error) {
      console.error('Error fetching market price:', error)
      return 0
    }
  }

  /**
   * Calculate position PnL
   */
  calculatePnL(
    entryPrice: number,
    currentPrice: number,
    size: number,
    isLong: boolean
  ): number {
    const priceDiff = isLong 
      ? currentPrice - entryPrice 
      : entryPrice - currentPrice
    
    return (priceDiff / entryPrice) * size
  }

  /**
   * Calculate liquidation price
   */
  calculateLiquidationPrice(
    entryPrice: number,
    collateral: number,
    size: number,
    isLong: boolean,
    maintenanceMargin: number = 0.01 // 1%
  ): number {
    const leverage = size / collateral
    const liquidationDistance = collateral * maintenanceMargin / size
    
    return isLong 
      ? entryPrice * (1 - liquidationDistance)
      : entryPrice * (1 + liquidationDistance)
  }

  /**
   * Validate trading parameters
   */
  validateTradeParams(params: OrderParams): { isValid: boolean; error?: string } {
    if (params.size < MERKLE_CONFIG.DEFAULT_PARAMS.MIN_POSITION_SIZE) {
      return {
        isValid: false,
        error: `Position size must be at least ${MERKLE_CONFIG.DEFAULT_PARAMS.MIN_POSITION_SIZE / 1_000_000} USDC`
      }
    }

    const leverage = params.size / params.collateral
    if (leverage > MERKLE_CONFIG.DEFAULT_PARAMS.MAX_LEVERAGE) {
      return {
        isValid: false,
        error: `Leverage cannot exceed ${MERKLE_CONFIG.DEFAULT_PARAMS.MAX_LEVERAGE}x`
      }
    }

    if (params.collateral <= 0) {
      return {
        isValid: false,
        error: 'Collateral must be greater than 0'
      }
    }

    return { isValid: true }
  }
}

// Export singleton instance
export const perpetualTradingService = new PerpetualTradingService()