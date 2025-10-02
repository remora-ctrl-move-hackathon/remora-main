"use client"

import { useState, useCallback, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { 
  perpetualTradingService, 
  Position, 
  OrderParams, 
  LimitOrderParams, 
  TradingStats 
} from '@/services/perpetual-trading.service'
import { TradingPair } from '@/config/merkle'
import toast from 'react-hot-toast'

export function usePerpetualTrading() {
  const { account, signAndSubmitTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [tradingHistory, setTradingHistory] = useState<any[]>([])
  const [tradingStats, setTradingStats] = useState<TradingStats>({
    totalPnl: 0,
    totalVolume: 0,
    winRate: 0,
    activePositions: 0,
    totalPositions: 0,
  })

  // Throttling for API calls
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const FETCH_COOLDOWN = 15000 // 15 seconds minimum between fetches

  /**
   * Fetch user's trading data
   */
  const fetchTradingData = useCallback(async (force = false) => {
    if (!account) return

    const now = Date.now()
    if (!force && (now - lastFetchTime) < FETCH_COOLDOWN) {
      console.log('Skipping fetch due to cooldown')
      return
    }

    try {
      setLoading(true)
      setLastFetchTime(now)

      const [positionsData, ordersData, historyData, statsData] = await Promise.all([
        perpetualTradingService.getUserPositions(account.address),
        perpetualTradingService.getUserOrders(account.address),
        perpetualTradingService.getTradingHistory(account.address),
        perpetualTradingService.getTradingStats(account.address),
      ])

      setPositions(positionsData)
      setOrders(ordersData)
      setTradingHistory(historyData)
      setTradingStats(statsData)
    } catch (error) {
      console.error('Error fetching trading data:', error)
      toast.error('Failed to fetch trading data')
    } finally {
      setLoading(false)
    }
  }, [account, lastFetchTime])

  /**
   * Place a market order
   */
  const placeMarketOrder = useCallback(async (params: OrderParams) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error('Please connect your wallet')
      return
    }

    // Validate parameters
    const validation = perpetualTradingService.validateTradeParams(params)
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid trade parameters')
      return
    }

    try {
      setLoading(true)
      
      const payload = await perpetualTradingService.placeMarketOrder(
        account.address,
        params
      )

      const response = await signAndSubmitTransaction({
        data: payload,
      })

      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(
        `${params.isIncrease ? 'Opened' : 'Closed'} ${params.isLong ? 'long' : 'short'} position in ${params.pair}`
      )

      // Refresh trading data
      await fetchTradingData(true)

      return response.hash
    } catch (error: any) {
      console.error('Error placing market order:', error)
      toast.error(error.message || 'Failed to place market order')
      throw error
    } finally {
      setLoading(false)
    }
  }, [account, signAndSubmitTransaction, fetchTradingData])

  /**
   * Place a limit order
   */
  const placeLimitOrder = useCallback(async (params: LimitOrderParams) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error('Please connect your wallet')
      return
    }

    // Validate parameters
    const validation = perpetualTradingService.validateTradeParams(params)
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid trade parameters')
      return
    }

    try {
      setLoading(true)
      
      const payload = await perpetualTradingService.placeLimitOrder(
        account.address,
        params
      )

      const response = await signAndSubmitTransaction({
        data: payload,
      })

      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Limit order placed for ${params.pair} at $${params.triggerPrice}`)

      // Refresh trading data
      await fetchTradingData(true)

      return response.hash
    } catch (error: any) {
      console.error('Error placing limit order:', error)
      toast.error(error.message || 'Failed to place limit order')
      throw error
    } finally {
      setLoading(false)
    }
  }, [account, signAndSubmitTransaction, fetchTradingData])

  /**
   * Cancel an order
   */
  const cancelOrder = useCallback(async (orderId: string, pair: TradingPair) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      setLoading(true)
      
      const payload = await perpetualTradingService.cancelOrder(
        account.address,
        pair,
        orderId
      )

      const response = await signAndSubmitTransaction({
        data: payload,
      })

      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Order cancelled successfully')

      // Refresh trading data
      await fetchTradingData(true)

      return response.hash
    } catch (error: any) {
      console.error('Error cancelling order:', error)
      toast.error(error.message || 'Failed to cancel order')
      throw error
    } finally {
      setLoading(false)
    }
  }, [account, signAndSubmitTransaction, fetchTradingData])

  /**
   * Close a position (market order in opposite direction)
   */
  const closePosition = useCallback(async (position: Position) => {
    const closeParams: OrderParams = {
      pair: position.pair,
      size: position.size,
      collateral: 0, // No additional collateral needed to close
      isLong: !position.isLong, // Opposite direction
      isIncrease: false, // Closing position
    }

    return await placeMarketOrder(closeParams)
  }, [placeMarketOrder])

  /**
   * Get market price for a trading pair
   */
  const getMarketPrice = useCallback(async (pair: TradingPair): Promise<number> => {
    try {
      return await perpetualTradingService.getMarketPrice(pair)
    } catch (error) {
      console.error('Error fetching market price:', error)
      return 0
    }
  }, [])

  /**
   * Calculate position PnL
   */
  const calculatePnL = useCallback((
    entryPrice: number,
    currentPrice: number,
    size: number,
    isLong: boolean
  ): number => {
    return perpetualTradingService.calculatePnL(entryPrice, currentPrice, size, isLong)
  }, [])

  /**
   * Calculate liquidation price
   */
  const calculateLiquidationPrice = useCallback((
    entryPrice: number,
    collateral: number,
    size: number,
    isLong: boolean
  ): number => {
    return perpetualTradingService.calculateLiquidationPrice(
      entryPrice, 
      collateral, 
      size, 
      isLong
    )
  }, [])

  // Auto-fetch trading data when account changes
  useEffect(() => {
    if (account) {
      fetchTradingData()
    }
  }, [account, fetchTradingData])

  // Periodic data refresh
  useEffect(() => {
    if (account) {
      const interval = setInterval(() => {
        fetchTradingData(false) // Don't force, respect cooldown
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [account, fetchTradingData])

  return {
    loading,
    positions,
    orders,
    tradingHistory,
    tradingStats,
    placeMarketOrder,
    placeLimitOrder,
    cancelOrder,
    closePosition,
    getMarketPrice,
    calculatePnL,
    calculateLiquidationPrice,
    fetchTradingData,
    perpetualTradingService,
  }
}