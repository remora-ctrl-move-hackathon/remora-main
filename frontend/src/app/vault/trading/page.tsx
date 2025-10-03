"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, Shield,
  ArrowUpRight, ArrowDownRight, Loader2, Activity,
  Target, Zap, AlertTriangle, BarChart3, X
} from "lucide-react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { usePerpetualTrading } from "@/hooks/usePerpetualTrading"
import { MERKLE_CONFIG, TradingPair, getTradingPairDisplayName } from "@/config/merkle"
import { OrderParams, LimitOrderParams, Position } from "@/services/perpetual-trading.service"
import toast from "react-hot-toast"
import Link from "next/link"
import { TradingViewChart } from "@/components/trading/TradingViewChart"

export default function TradingVault() {
  const { connected, account } = useWallet()
  const {
    loading,
    positions,
    orders,
    tradingStats,
    placeMarketOrder,
    placeLimitOrder,
    cancelOrder,
    closePosition,
    getMarketPrice,
    calculatePnL,
    fetchTradingData
  } = usePerpetualTrading()

  const [openTrade, setOpenTrade] = useState(false)
  const [openLimitOrder, setOpenLimitOrder] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [activeTab, setActiveTab] = useState<"positions" | "orders" | "history">("positions")
  const [selectedChartPair, setSelectedChartPair] = useState<TradingPair>('BTC_USD')

  const [tradeForm, setTradeForm] = useState({
    pair: 'BTC_USD' as TradingPair,
    size: "1000",
    collateral: "500",
    isLong: true,
    leverage: "2"
  })

  const [limitOrderForm, setLimitOrderForm] = useState({
    pair: 'BTC_USD' as TradingPair,
    size: "1000",
    collateral: "500",
    isLong: true,
    triggerPrice: "50000"
  })

  const [marketPrices, setMarketPrices] = useState<Record<TradingPair, number>>({} as any)

  // Fetch market prices periodically
  useEffect(() => {
    const fetchPrices = async () => {
      const prices: Record<string, number> = {}
      for (const pair of Object.values(MERKLE_CONFIG.TRADING_PAIRS)) {
        try {
          prices[pair] = await getMarketPrice(pair)
        } catch (error) {
          console.error(`Error fetching price for ${pair}:`, error)
        }
      }
      setMarketPrices(prices as Record<TradingPair, number>)
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [getMarketPrice])

  const handlePlaceMarketOrder = async () => {
    if (!connected) {
      toast.error("Please connect your wallet")
      return
    }

    const orderParams: OrderParams = {
      pair: tradeForm.pair,
      size: parseFloat(tradeForm.size),
      collateral: parseFloat(tradeForm.collateral),
      isLong: tradeForm.isLong,
      isIncrease: true,
    }

    try {
      await placeMarketOrder(orderParams)
      setOpenTrade(false)
      setTradeForm({
        pair: 'BTC_USD',
        size: "1000",
        collateral: "500",
        isLong: true,
        leverage: "2"
      })
    } catch (error) {
      console.error("Failed to place market order:", error)
    }
  }

  const handlePlaceLimitOrder = async () => {
    if (!connected) {
      toast.error("Please connect your wallet")
      return
    }

    const limitParams: LimitOrderParams = {
      pair: limitOrderForm.pair,
      size: parseFloat(limitOrderForm.size),
      collateral: parseFloat(limitOrderForm.collateral),
      isLong: limitOrderForm.isLong,
      isIncrease: true,
      triggerPrice: parseFloat(limitOrderForm.triggerPrice),
    }

    try {
      await placeLimitOrder(limitParams)
      setOpenLimitOrder(false)
      setLimitOrderForm({
        pair: 'BTC_USD',
        size: "1000",
        collateral: "500",
        isLong: true,
        triggerPrice: "50000"
      })
    } catch (error) {
      console.error("Failed to place limit order:", error)
    }
  }

  const handleClosePosition = async (position: Position) => {
    try {
      await closePosition(position)
      toast.success(`Closed ${position.isLong ? 'long' : 'short'} position in ${position.pair}`)
    } catch (error) {
      console.error("Failed to close position:", error)
    }
  }

  const getPositionStatusColor = (pnl: number) => {
    if (pnl > 0) return "text-green-600"
    if (pnl < 0) return "text-red-600"
    return "text-gray-600"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Perpetual Trading Vault</h1>
            <p className="text-sm text-gray-500 font-light mt-1">Advanced trading strategies with leverage</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={openLimitOrder} onOpenChange={setOpenLimitOrder}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Limit Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Place Limit Order</DialogTitle>
                  <DialogDescription>
                    Set a trigger price for your order
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Trading Pair</Label>
                    <Select 
                      value={limitOrderForm.pair} 
                      onValueChange={(value) => setLimitOrderForm({...limitOrderForm, pair: value as TradingPair})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MERKLE_CONFIG.TRADING_PAIRS).map(pair => (
                          <SelectItem key={pair} value={pair}>
                            {getTradingPairDisplayName(pair)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Position Size (USDC)</Label>
                      <Input 
                        type="number" 
                        value={limitOrderForm.size}
                        onChange={(e) => setLimitOrderForm({...limitOrderForm, size: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Collateral (USDC)</Label>
                      <Input 
                        type="number" 
                        value={limitOrderForm.collateral}
                        onChange={(e) => setLimitOrderForm({...limitOrderForm, collateral: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Trigger Price (USD)</Label>
                    <Input 
                      type="number" 
                      value={limitOrderForm.triggerPrice}
                      onChange={(e) => setLimitOrderForm({...limitOrderForm, triggerPrice: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={limitOrderForm.isLong ? "default" : "outline"}
                      onClick={() => setLimitOrderForm({...limitOrderForm, isLong: true})}
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Long
                    </Button>
                    <Button 
                      variant={!limitOrderForm.isLong ? "default" : "outline"}
                      onClick={() => setLimitOrderForm({...limitOrderForm, isLong: false})}
                      className="flex-1"
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Short
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setOpenLimitOrder(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePlaceLimitOrder} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Place Limit Order
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={openTrade} onOpenChange={setOpenTrade}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Zap className="h-4 w-4 mr-2" />
                  Market Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Place Market Order</DialogTitle>
                  <DialogDescription>
                    Execute trade immediately at market price
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Trading Pair</Label>
                    <Select 
                      value={tradeForm.pair} 
                      onValueChange={(value) => setTradeForm({...tradeForm, pair: value as TradingPair})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MERKLE_CONFIG.TRADING_PAIRS).map(pair => (
                          <SelectItem key={pair} value={pair}>
                            {getTradingPairDisplayName(pair)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Position Size (USDC)</Label>
                      <Input 
                        type="number" 
                        value={tradeForm.size}
                        onChange={(e) => setTradeForm({...tradeForm, size: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Collateral (USDC)</Label>
                      <Input 
                        type="number" 
                        value={tradeForm.collateral}
                        onChange={(e) => setTradeForm({...tradeForm, collateral: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Leverage:</span>
                      <span>{(parseFloat(tradeForm.size) / parseFloat(tradeForm.collateral) || 0).toFixed(2)}x</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={tradeForm.isLong ? "default" : "outline"}
                      onClick={() => setTradeForm({...tradeForm, isLong: true})}
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Long
                    </Button>
                    <Button 
                      variant={!tradeForm.isLong ? "default" : "outline"}
                      onClick={() => setTradeForm({...tradeForm, isLong: false})}
                      className="flex-1"
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Short
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setOpenTrade(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePlaceMarketOrder} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Place Market Order
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Trading Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-light">Total PnL</span>
                <DollarSign className={`h-4 w-4 ${getPositionStatusColor(tradingStats.totalPnl)}`} />
              </div>
              <div className={`text-2xl font-light ${getPositionStatusColor(tradingStats.totalPnl)}`}>
                {formatCurrency(tradingStats.totalPnl)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Unrealized + Realized</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-light">Win Rate</span>
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">{tradingStats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-400 mt-1">Success rate</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-light">Active Positions</span>
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">{tradingStats.activePositions}</div>
              <div className="text-xs text-gray-400 mt-1">Open trades</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-light">Volume</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">{formatCurrency(tradingStats.totalVolume)}</div>
              <div className="text-xs text-gray-400 mt-1">Total traded</div>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart */}
        <Card className="bg-white border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-light">Price Chart</CardTitle>
              <Select value={selectedChartPair} onValueChange={(value) => setSelectedChartPair(value as TradingPair)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MERKLE_CONFIG.TRADING_PAIRS).map(pair => (
                    <SelectItem key={pair} value={pair}>
                      {getTradingPairDisplayName(pair)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <TradingViewChart
              symbol={selectedChartPair.replace('_', '')}
              interval="60"
              theme="light"
              height={500}
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-white border border-border/30">
            <TabsTrigger value="positions">Active Positions</TabsTrigger>
            <TabsTrigger value="orders">Pending Orders</TabsTrigger>
            <TabsTrigger value="history">Trading History</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !connected ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-gray-500">Connect your wallet to view positions</p>
                </CardContent>
              </Card>
            ) : positions.length === 0 ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-gray-500">No active positions</p>
                  <p className="text-sm text-gray-400 mt-2">Place your first trade to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <Card key={index} className="bg-white border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                            position.isLong 
                              ? 'from-green-500/10 to-green-500/20' 
                              : 'from-red-500/10 to-red-500/20'
                          } flex items-center justify-center`}>
                            {position.isLong ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {getTradingPairDisplayName(position.pair)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {position.isLong ? 'Long' : 'Short'} • {formatCurrency(position.size)} Size
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getPositionStatusColor(position.pnl)}`}>
                            {formatCurrency(position.pnl)}
                          </div>
                          <div className="text-xs text-gray-500">PnL</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Entry Price</p>
                          <p className="font-semibold">{formatCurrency(position.entryPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Mark Price</p>
                          <p className="font-semibold">{formatCurrency(position.markPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Collateral</p>
                          <p className="font-semibold">{formatCurrency(position.collateral)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Liq. Price</p>
                          <p className="font-semibold text-red-600">{formatCurrency(position.liquidationPrice)}</p>
                        </div>
                      </div>

                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleClosePosition(position)}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                        Close Position
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-gray-500">No pending orders</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <Card key={index} className="bg-white border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{order.pair}</h3>
                          <p className="text-sm text-gray-500">{order.type} Order</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => cancelOrder(order.id, order.pair)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="bg-white border-border/50">
              <CardContent className="pt-6 text-center py-8">
                <p className="text-gray-500">Trading history coming soon</p>
                <p className="text-sm text-gray-400 mt-2">Track your past trades and performance</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Vaults */}
        <div className="mt-8 text-center">
          <Link href="/vault">
            <Button variant="outline">
              <ArrowDownRight className="h-4 w-4 mr-2" />
              Back to Vaults
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}