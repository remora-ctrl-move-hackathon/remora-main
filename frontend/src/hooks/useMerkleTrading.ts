import { useState, useCallback, useEffect } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { 
  merkleTradingService, 
  MarketData, 
  Position, 
  PlaceOrderParams,
  OrderBookEntry 
} from "@/services/merkle-trading.service"
import toast from "react-hot-toast"

export function useMerkleTrading() {
  const { account, signAndSubmitTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }>({ 
    bids: [], 
    asks: [] 
  })
  const [positions, setPositions] = useState<Position[]>([])
  const [tradingHistory, setTradingHistory] = useState<any[]>([])
  const [currentPrice, setCurrentPrice] = useState<number>(0)

  // Initialize Merkle client
  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        const success = await merkleTradingService.initialize(true) // Use testnet
        setInitialized(success)
        if (!success) {
          toast.error("Failed to initialize trading service")
        }
      }
    }
    init()
  }, [initialized])

  // Fetch market data
  const fetchMarketData = useCallback(async (pair: string = "APT_USDC") => {
    if (!initialized) return
    
    setLoading(true)
    try {
      const data = await merkleTradingService.getMarketData(pair)
      if (data) {
        setMarketData(data)
        setCurrentPrice(data.price)
      }
    } catch (error) {
      // Silently handle errors, the service already provides fallback data
    } finally {
      setLoading(false)
    }
  }, [initialized])

  // Fetch order book
  const fetchOrderBook = useCallback(async (pair: string = "APT_USDC") => {
    if (!initialized) return
    
    try {
      const data = await merkleTradingService.getOrderBook(pair)
      setOrderBook(data)
    } catch (error) {
      // Silently handle errors
    }
  }, [initialized])

  // Fetch user positions
  const fetchPositions = useCallback(async () => {
    if (!initialized || !account) return
    
    setLoading(true)
    try {
      const userPositions = await merkleTradingService.getPositions(account.address)
      setPositions(userPositions)
    } catch (error) {
      // Silently handle errors - positions will be empty array
      setPositions([])
    } finally {
      setLoading(false)
    }
  }, [initialized, account])

  // Fetch trading history
  const fetchTradingHistory = useCallback(async () => {
    if (!initialized || !account) return
    
    try {
      const history = await merkleTradingService.getTradingHistory(account.address)
      setTradingHistory(history)
    } catch (error) {
      // Silently handle errors - history will be empty array
      setTradingHistory([])
    }
  }, [initialized, account])

  // Place order
  const placeOrder = useCallback(async (params: PlaceOrderParams) => {
    if (!initialized || !account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet")
      return false
    }

    setLoading(true)
    try {
      const payload = await merkleTradingService.placeOrder(params, account.address)
      
      if (!payload) {
        throw new Error("Failed to create order payload")
      }

      const response = await signAndSubmitTransaction({
        data: payload as any
      })

      toast.success(
        `${params.side === "long" ? "Long" : "Short"} position opened successfully!`
      )
      
      // Refresh positions after successful order
      await fetchPositions()
      
      return true
    } catch (error: any) {
      console.error("Error placing order:", error)
      toast.error(error.message || "Failed to place order")
      return false
    } finally {
      setLoading(false)
    }
  }, [initialized, account, signAndSubmitTransaction, fetchPositions])

  // Close position
  const closePosition = useCallback(async (positionId: string) => {
    if (!initialized || !account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet")
      return false
    }

    setLoading(true)
    try {
      const payload = await merkleTradingService.closePosition(positionId, account.address)
      
      if (!payload) {
        throw new Error("Failed to create close position payload")
      }

      const response = await signAndSubmitTransaction({
        data: payload as any
      })

      toast.success("Position closed successfully!")
      
      // Refresh positions after closing
      await fetchPositions()
      
      return true
    } catch (error: any) {
      console.error("Error closing position:", error)
      toast.error(error.message || "Failed to close position")
      return false
    } finally {
      setLoading(false)
    }
  }, [initialized, account, signAndSubmitTransaction, fetchPositions])

  // Subscribe to price updates
  const subscribeToPriceUpdates = useCallback(async (pair: string = "APT_USDC") => {
    if (!initialized) return

    await merkleTradingService.subscribeToPriceFeed(pair, (price: number) => {
      setCurrentPrice(price)
      setMarketData(prev => prev ? { ...prev, price } : null)
    })
  }, [initialized])

  // Subscribe to account updates
  const subscribeToAccountUpdates = useCallback(async () => {
    if (!initialized || !account) return

    await merkleTradingService.subscribeToAccount(account.address, (data: any) => {
      // Refresh positions when account data changes
      fetchPositions()
    })
  }, [initialized, account, fetchPositions])

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      merkleTradingService.unsubscribePriceFeed()
      merkleTradingService.unsubscribeAccount()
    }
  }, [])

  // Auto-refresh data when account changes
  useEffect(() => {
    if (account && initialized) {
      fetchMarketData()
      fetchOrderBook()
      fetchPositions()
      fetchTradingHistory()
      subscribeToPriceUpdates()
      subscribeToAccountUpdates()
    }
  }, [
    account, 
    initialized, 
    fetchMarketData, 
    fetchOrderBook, 
    fetchPositions, 
    fetchTradingHistory,
    subscribeToPriceUpdates,
    subscribeToAccountUpdates
  ])

  // Refresh market data periodically
  useEffect(() => {
    if (!initialized) return

    const interval = setInterval(() => {
      fetchMarketData()
      fetchOrderBook()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [initialized, fetchMarketData, fetchOrderBook])

  return {
    loading,
    initialized,
    marketData,
    orderBook,
    positions,
    tradingHistory,
    currentPrice,
    placeOrder,
    closePosition,
    fetchMarketData,
    fetchOrderBook,
    fetchPositions,
    fetchTradingHistory
  }
}