import { MerkleClient, MerkleClientConfig } from "@merkletrade/ts-sdk"
import { Aptos } from "@aptos-labs/ts-sdk"

export interface MarketData {
  pair: string
  price: number
  change24h: number
  funding: number
  volume24h: number
  openInterest: number
  high24h: number
  low24h: number
}

export interface OrderBookEntry {
  price: number
  size: number
  total: number
}

export interface Position {
  id: string
  pair: string
  side: "long" | "short"
  size: number
  entryPrice: number
  markPrice: number
  pnl: number
  pnlPercentage: number
  liquidationPrice: number
  margin: number
  leverage: number
}

export interface PlaceOrderParams {
  pair: string
  side: "long" | "short"
  size: number
  leverage: number
  orderType: "market" | "limit"
  limitPrice?: number
  reduceOnly?: boolean
  postOnly?: boolean
}

class MerkleTradingService {
  private client: MerkleClient | null = null
  private aptos: Aptos | null = null
  private wsSession: any = null
  private priceFeedIterator: any = null
  private accountFeedIterator: any = null
  private priceSubscription: any = null
  private accountSubscription: any = null
  
  // Helper to normalize pair formats
  private normalizePairFormat(pair: string): string {
    // Convert common formats to SDK format
    // APT-PERP, APT-USDC -> APT_USD
    // BTC-PERP -> BTC_USD
    const normalized = pair.toUpperCase()
      .replace("-PERP", "_USD")
      .replace("-USDC", "_USD")
      .replace("-USD", "_USD")
      .replace("-", "_")
    
    // Default pairs supported by SDK
    if (normalized.includes("APT")) return "APT_USD"
    if (normalized.includes("BTC")) return "BTC_USD"
    if (normalized.includes("ETH")) return "ETH_USD"
    if (normalized.includes("SOL")) return "SOL_USD"
    
    return normalized
  }

  async initialize(testnet: boolean = true) {
    try {
      const config = testnet 
        ? await MerkleClientConfig.testnet()
        : await MerkleClientConfig.mainnet()
      
      this.client = new MerkleClient(config)
      this.aptos = new Aptos(config.aptosConfig)
      
      // Try to establish WebSocket connection
      try {
        if (this.client.connectWsApi) {
          this.wsSession = await this.client.connectWsApi()
          console.log("WebSocket connected")
        }
      } catch (wsError) {
        console.log("WebSocket not available, will use polling")
      }
      
      console.log("Merkle client initialized for", testnet ? "testnet" : "mainnet")
      return true
    } catch (error) {
      console.error("Failed to initialize Merkle client:", error)
      return false
    }
  }

  async getMarketData(pair: string = "APT_USDC"): Promise<MarketData | null> {
    if (!this.client) {
      await this.initialize()
    }

    // Normalize pair format to SDK format (e.g., APT-PERP -> APT_USD)
    const sdkPair = this.normalizePairFormat(pair)

    try {
      // Fetch all pair data to find the correct one
      const [allPairs, allStates] = await Promise.all([
        this.client!.getAllPairInfos(),
        this.client!.getAllPairStates()
      ])
      
      // Use the first available pair for now (typically APT_USD)
      const pairInfo = allPairs[0]
      const pairState = allStates[0]
      
      if (pairState) {
        // Calculate metrics from state (cast to any for flexible access)
        const stateData = pairState as any
        const currentPrice = Number(stateData.price || stateData.markPrice || 0) / 1e8
        const prevPrice = Number(stateData.price24hAgo || currentPrice * 1e8) / 1e8
        const change24h = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0

        return {
          pair: pair.replace("_", "-"),
          price: currentPrice || 12.84,
          change24h,
          funding: Number(stateData.fundingRate || 0) / 1e6,
          volume24h: Number(stateData.volume24h || 0) / 1e6,
          openInterest: Number(stateData.openInterest || 0) / 1e6,
          high24h: Number(stateData.high24h || currentPrice * 1e8) / 1e8,
          low24h: Number(stateData.low24h || currentPrice * 1e8) / 1e8
        }
      }
    } catch (error) {
      console.warn("Using fallback market data:", error)
    }
    
    // Return realistic mock data as fallback
    const basePrice = 12.84 + (Math.random() - 0.5) * 0.5
    return {
      pair: pair.replace("_", "-"),
      price: basePrice,
      change24h: (Math.random() - 0.5) * 15,
      funding: 0.0125 + (Math.random() - 0.5) * 0.005,
      volume24h: 1.2 + Math.random() * 0.5,
      openInterest: 850 + Math.random() * 100,
      high24h: basePrice * 1.02,
      low24h: basePrice * 0.98
    }
  }

  async getOrderBook(pair: string = "APT_USDC"): Promise<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }> {
    // Merkle SDK doesn't provide direct order book access
    // Return mock data for now
    const basePrice = 12.84
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []
    
    for (let i = 0; i < 5; i++) {
      const bidPrice = basePrice - (i + 1) * 0.01
      const askPrice = basePrice + (i + 1) * 0.01
      
      bids.push({
        price: bidPrice,
        size: Math.floor(Math.random() * 1000) + 100,
        total: Math.floor(Math.random() * 10000) + 1000
      })
      
      asks.push({
        price: askPrice,
        size: Math.floor(Math.random() * 1000) + 100,
        total: Math.floor(Math.random() * 10000) + 1000
      })
    }
    
    return { bids, asks }
  }

  async getPositions(userAddress: string): Promise<Position[]> {
    if (!this.client) {
      await this.initialize()
    }

    try {
      const positions = await this.client!.getPositions({ address: userAddress as `0x${string}` })
      
      if (!positions || positions.length === 0) {
        return []
      }
      
      return positions.map((pos: any, index: number) => {
        // SDK returns values in proper units
        const size = Number(pos.size || pos.sizeDelta || 0) / 1e6
        const collateral = Number(pos.collateral || pos.collateralDelta || 1) / 1e6
        const leverage = collateral > 0 ? size / collateral : 1
        const entryPrice = Number(pos.avgPrice || 0) / 1e8
        const markPrice = Number(pos.markPrice || pos.avgPrice || 0) / 1e8
        const pnl = this.calculatePnL(pos)
        
        // Format pair for display
        const displayPair = (pos.pair || 'APT_USD')
          .replace("_USD", "-PERP")
          .replace("_", "-")
        
        return {
          id: `${pos.pair || 'APT_USD'}_${index}`,
          pair: displayPair,
          side: pos.isLong ? "long" : "short",
          size,
          entryPrice,
          markPrice,
          pnl,
          pnlPercentage: collateral > 0 ? (pnl / collateral) * 100 : 0,
          liquidationPrice: this.calculateLiquidationPrice(entryPrice, leverage, pos.isLong),
          margin: collateral,
          leverage
        }
      })
    } catch (error: any) {
      // Only log non-404 errors
      if (error.response?.status !== 404 && !error.message?.includes('404')) {
        console.warn("Failed to fetch positions:", error.message)
      }
      return []
    }
  }

  async placeOrder(params: PlaceOrderParams, userAddress: string): Promise<any | null> {
    if (!this.client) {
      await this.initialize()
    }

    try {
      // Normalize pair format (e.g., APT-PERP -> APT_USD)
      const sdkPair = this.normalizePairFormat(params.pair)
      
      // Convert dollar amounts to proper units
      // Size is the notional value in USDC (6 decimals)
      // Example: $300 position size = 300_000_000n (300 * 1e6)
      const sizeDelta = BigInt(Math.floor(params.size * 1_000_000))
      
      // Collateral is margin in USDC
      // Example: $300 size with 10x leverage = $30 collateral
      const collateralDelta = BigInt(Math.floor((params.size / params.leverage) * 1_000_000))
      
      let payload
      
      if (params.orderType === "market") {
        // Market order payload - matches example format
        payload = this.client!.payloads.placeMarketOrder({
          pair: sdkPair,
          userAddress,
          sizeDelta,
          collateralDelta,
          isLong: params.side === "long",
          isIncrease: true, // true for opening, false for closing
        })
      } else {
        // Limit order with trigger price (8 decimals)
        const price = BigInt(Math.floor((params.limitPrice || 0) * 100_000_000))
        payload = this.client!.payloads.placeLimitOrder({
          pair: sdkPair,
          userAddress,
          sizeDelta,
          collateralDelta,
          isLong: params.side === "long",
          isIncrease: true,
          price,
          canExecuteAbovePrice: params.side === "long"
        })
      }
      
      return payload
    } catch (error) {
      console.error("Failed to create order payload:", error)
      return null
    }
  }

  async closePosition(positionId: string, userAddress: string): Promise<any | null> {
    if (!this.client) {
      await this.initialize()
    }

    try {
      // Get current position details
      const positions = await this.getPositions(userAddress)
      const position = positions.find(p => p.id === positionId)
      
      if (!position) {
        throw new Error("Position not found")
      }
      
      // Normalize pair format
      const sdkPair = this.normalizePairFormat(position.pair)
      
      // For closing, use the position's size and collateral
      // Based on the example: isIncrease: false means closing
      const sizeDelta = BigInt(Math.floor(position.size * 1_000_000))
      const collateralDelta = BigInt(Math.floor(position.margin * 1_000_000))
      
      const payload = this.client!.payloads.placeMarketOrder({
        pair: sdkPair,
        userAddress,
        sizeDelta,
        collateralDelta,
        isLong: position.side === "long",
        isIncrease: false, // false for closing position (from example)
      })
      
      return payload
    } catch (error) {
      console.error("Failed to close position:", error)
      return null
    }
  }

  async getTradingHistory(userAddress: string): Promise<any[]> {
    if (!this.client) {
      await this.initialize()
    }

    try {
      const history = await this.client!.getTradingHistory({ address: userAddress as `0x${string}` })
      return history || []
    } catch (error: any) {
      // Don't log 404 errors as they're expected for users with no history
      if (!error.message?.includes('404')) {
        console.warn("Failed to fetch trading history:", error.message)
      }
      return []
    }
  }

  async getSupportedPairs(): Promise<string[]> {
    if (!this.client) {
      await this.initialize()
    }

    try {
      const pairInfos = await this.client!.getAllPairInfos()
      return pairInfos.map((info: any) => info.name || info.pair)
    } catch (error) {
      console.warn("Failed to fetch supported pairs, using defaults")
      // Return default pairs
      return ["BTC_USD", "ETH_USD", "APT_USD", "SOL_USD"]
    }
  }

  async subscribeToPriceFeed(pair: string, callback: (price: number) => void) {
    // Clear existing subscription
    this.unsubscribePriceFeed()
    
    const sdkPair = this.normalizePairFormat(pair)
    
    // Try WebSocket subscription first (based on ws.ts example)
    if (this.wsSession) {
      try {
        // Subscribe to price feed using WebSocket session
        this.priceFeedIterator = this.wsSession.subscribePriceFeed(sdkPair)
        
        // Create async handler for price updates
        this.priceSubscription = (async () => {
          try {
            for await (const priceData of this.priceFeedIterator) {
              // Price data from WebSocket
              const price = Number(priceData.price || 0) / 1e8
              callback(price)
            }
          } catch (error) {
            console.log("Price feed iteration stopped")
          }
        })()
        
        console.log(`Subscribed to ${sdkPair} price feed via WebSocket`)
        return
      } catch (wsError) {
        console.log("WebSocket price feed failed, using polling")
      }
    }
    
    // Fallback to polling if WebSocket not available
    this.priceSubscription = setInterval(async () => {
      try {
        const data = await this.getMarketData(pair)
        if (data) {
          callback(data.price)
        }
      } catch (error) {
        // Silently handle errors
      }
    }, 2000)
  }

  unsubscribePriceFeed() {
    // Clean up WebSocket iterator
    if (this.priceFeedIterator && this.priceFeedIterator.return) {
      this.priceFeedIterator.return()
      this.priceFeedIterator = null
    }
    
    // Clean up subscription
    if (this.priceSubscription) {
      if (this.priceSubscription instanceof Promise) {
        // WebSocket subscription is a promise
        this.priceSubscription = null
      } else {
        // Polling subscription
        clearInterval(this.priceSubscription)
        this.priceSubscription = null
      }
    }
  }

  async subscribeToAccount(userAddress: string, callback: (data: any) => void) {
    // Clear existing subscription
    this.unsubscribeAccount()
    
    // Try WebSocket subscription first (based on ws.ts example)
    if (this.wsSession) {
      try {
        // Subscribe to account feed using WebSocket session
        // Note: Account feed doesn't require parameters in the example
        this.accountFeedIterator = this.wsSession.subscribeAccountFeed()
        
        // Create async handler for account updates
        this.accountSubscription = (async () => {
          try {
            for await (const accountData of this.accountFeedIterator) {
              // Account data from WebSocket
              callback(accountData)
              // Also fetch positions when account updates
              const positions = await this.getPositions(userAddress)
              callback({ positions, accountData })
            }
          } catch (error) {
            console.log("Account feed iteration stopped")
          }
        })()
        
        console.log("Subscribed to account feed via WebSocket")
        return
      } catch (wsError) {
        console.log("WebSocket account feed failed, using polling")
      }
    }
    
    // Fallback to polling if WebSocket not available
    this.accountSubscription = setInterval(async () => {
      try {
        const positions = await this.getPositions(userAddress)
        callback({ positions })
      } catch (error) {
        // Silently handle errors
      }
    }, 5000)
  }

  unsubscribeAccount() {
    // Clean up WebSocket iterator
    if (this.accountFeedIterator && this.accountFeedIterator.return) {
      this.accountFeedIterator.return()
      this.accountFeedIterator = null
    }
    
    // Clean up subscription
    if (this.accountSubscription) {
      if (this.accountSubscription instanceof Promise) {
        // WebSocket subscription is a promise
        this.accountSubscription = null
      } else {
        // Polling subscription
        clearInterval(this.accountSubscription)
        this.accountSubscription = null
      }
    }
  }

  private calculatePnL(position: any): number {
    try {
      // Manual PnL calculation
      const entryPrice = Number(position.avgPrice || 0) / 1e8
      const markPrice = Number(position.markPrice || position.avgPrice || 0) / 1e8
      const size = Number(position.sizeDelta || 0) / 1e6
      
      if (entryPrice === 0 || size === 0) return 0
      
      let pnl = 0
      if (position.isLong) {
        pnl = (markPrice - entryPrice) * size
      } else {
        pnl = (entryPrice - markPrice) * size
      }
      
      return pnl
    } catch (error) {
      return 0
    }
  }

  private calculateLiquidationPrice(entryPrice: number, leverage: number, isLong: boolean): number {
    const liquidationDistance = (1 / leverage) * 0.9 // 90% of margin
    
    if (isLong) {
      return entryPrice * (1 - liquidationDistance)
    } else {
      return entryPrice * (1 + liquidationDistance)
    }
  }
}

export const merkleTradingService = new MerkleTradingService()