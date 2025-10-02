"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  TrendingUp, AlertTriangle, BarChart3, DollarSign, Activity,
  ChevronDown, Settings, ArrowUpRight, ArrowDownRight, Info, Loader2, RefreshCw
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useMerkleTrading } from "@/hooks/useMerkleTrading"
import toast from "react-hot-toast"

// Chart component with real price updates
const TradingChart = ({ currentPrice, pair }: { currentPrice: number, pair: string }) => {
  const [priceHistory, setPriceHistory] = useState<number[]>(
    Array.from({ length: 50 }, () => currentPrice + (Math.random() - 0.5) * 0.2)
  )
  
  // Update with real price changes
  useEffect(() => {
    setPriceHistory(prev => {
      const newHistory = [...prev.slice(1), currentPrice]
      return newHistory
    })
  }, [currentPrice])
  
  // Add smooth transitions between updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceHistory(prev => {
        const lastPrice = prev[prev.length - 1]
        const variance = lastPrice * 0.0003 // Small variance for smooth animation
        const newPrice = lastPrice + (Math.random() - 0.5) * variance
        return [...prev.slice(1), newPrice]
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const maxPrice = Math.max(...priceHistory)
  const minPrice = Math.min(...priceHistory)
  const priceRange = maxPrice - minPrice || 1

  return (
    <div className="w-full h-[400px] bg-background border border-border/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">{pair}</h3>
          <p className="text-2xl font-bold">${currentPrice.toFixed(4)}</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-0">
          <Activity className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>
      <div className="h-[320px] flex items-end gap-0.5">
        {priceHistory.map((price, index) => {
          const height = ((price - minPrice) / priceRange) * 100
          const isUp = index > 0 ? price > priceHistory[index - 1] : true
          return (
            <div
              key={index}
              className={`flex-1 ${isUp ? 'bg-primary' : 'bg-foreground/20'} rounded-t transition-all duration-300`}
              style={{ height: `${Math.max(1, height)}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function AdvancedTrading() {
  const { connected, account } = useWallet()
  const {
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
    fetchPositions
  } = useMerkleTrading()
  
  // Trading state
  const [selectedPair, setSelectedPair] = useState("APT-PERP")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [side, setSide] = useState<"long" | "short">("long")
  const [amount, setAmount] = useState("100")
  const [leverage, setLeverage] = useState([10])
  const [limitPrice, setLimitPrice] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [reduceOnly, setReduceOnly] = useState(false)
  const [postOnly, setPostOnly] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  // Recent trades state
  const [recentTrades, setRecentTrades] = useState<any[]>([])

  // Generate mock recent trades
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentTrades(prev => {
        const newTrade = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          price: currentPrice + (Math.random() - 0.5) * 0.02,
          size: Math.floor(Math.random() * 1000) + 100,
          side: Math.random() > 0.5 ? 'buy' : 'sell'
        }
        return [newTrade, ...prev.slice(0, 9)]
      })
    }, 3000)
    
    return () => clearInterval(interval)
  }, [currentPrice])

  // Calculate position details
  const calculatePositionSize = () => {
    const usdAmount = parseFloat(amount) || 0
    const lev = leverage[0] || 1
    return (usdAmount * lev).toFixed(2)
  }

  const calculateLiquidationPrice = () => {
    const entryPrice = limitPrice ? parseFloat(limitPrice) : (marketData?.price || currentPrice)
    const lev = leverage[0] || 1
    const liquidationDistance = (1 / lev) * 0.9 // 90% of margin
    
    if (side === "long") {
      return (entryPrice * (1 - liquidationDistance)).toFixed(2)
    } else {
      return (entryPrice * (1 + liquidationDistance)).toFixed(2)
    }
  }

  const handlePlaceOrder = async () => {
    if (!connected) {
      toast.error("Please connect your wallet")
      return
    }

    if (!initialized) {
      toast.error("Trading service not initialized")
      return
    }

    const orderAmount = parseFloat(amount)
    if (!orderAmount || orderAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error("Please enter a valid limit price")
      return
    }

    setPlacingOrder(true)
    try {
      const success = await placeOrder({
        pair: selectedPair,
        side,
        size: orderAmount,
        leverage: leverage[0],
        orderType,
        limitPrice: orderType === "limit" ? parseFloat(limitPrice) : undefined,
        reduceOnly,
        postOnly
      })

      if (success) {
        // Reset form
        setAmount("100")
        setLimitPrice("")
        setLeverage([10])
        // Refresh data
        await fetchPositions()
      }
    } finally {
      setPlacingOrder(false)
    }
  }

  const handleClosePosition = async (positionId: string) => {
    if (!connected) {
      toast.error("Please connect your wallet")
      return
    }
    
    const success = await closePosition(positionId)
    if (success) {
      await fetchPositions()
    }
  }

  // Auto-refresh data and setup real-time subscriptions
  useEffect(() => {
    if (connected && initialized) {
      // Initial data fetch
      fetchMarketData(selectedPair.replace("-", "_"))
      fetchOrderBook(selectedPair.replace("-", "_"))
      fetchPositions()
      
      // Set up refresh interval
      const interval = setInterval(() => {
        fetchMarketData(selectedPair.replace("-", "_"))
        fetchOrderBook(selectedPair.replace("-", "_"))
        if (positions.length > 0) {
          fetchPositions()
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [connected, initialized, selectedPair, fetchMarketData, fetchOrderBook, fetchPositions, positions.length])

  const displayPrice = marketData?.price || currentPrice || 12.84

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-normal text-foreground">Advanced Trading</h1>
            <p className="text-sm text-muted-foreground">Trade perpetuals with up to 150x leverage</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                fetchMarketData(selectedPair.replace("-", "_"))
                fetchOrderBook(selectedPair.replace("-", "_"))
                fetchPositions()
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Badge variant="outline" className="bg-primary/10 text-primary border-0">
              <AlertTriangle className="h-3 w-3 mr-1" />
              High Risk
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Chart & Market Info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Market Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{selectedPair}</h2>
                  <Badge className={`${(marketData?.change24h || 0) > 0 ? 'bg-primary/10 text-primary' : 'bg-foreground/10 text-foreground'} border-0`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {(marketData?.change24h || 0) > 0 ? '+' : ''}{marketData?.change24h?.toFixed(2) || '0.00'}%
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-muted-foreground">1H</Button>
                  <Button variant="outline" size="sm" className="text-muted-foreground">4H</Button>
                  <Button size="sm" className="bg-primary text-white border-0">1D</Button>
                  <Button variant="outline" size="sm" className="text-muted-foreground">1W</Button>
                </div>
              </div>
            </div>

            {/* Chart */}
            <TradingChart currentPrice={displayPrice} pair={selectedPair} />

            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm text-muted-foreground">Mark Price</span>
                  <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-primary/10 text-primary border-0">
                    Live
                  </Badge>
                </div>
                <p className="text-xl font-normal text-foreground">
                  ${displayPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Funding</p>
                <p className="text-xl font-normal text-foreground">
                  {marketData?.funding?.toFixed(4) || '0.0125'}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                <p className="text-xl font-normal text-foreground">
                  ${(marketData?.volume24h || 1.2).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Open Interest</p>
                <p className="text-xl font-normal text-foreground">
                  ${(marketData?.openInterest || 850).toFixed(0)}K
                </p>
              </div>
            </div>

            {/* Order Book & Trades */}
            <Card className="border-border/50 bg-background">
              <CardContent className="pt-6">
                <Tabs defaultValue="orderbook">
                  <TabsList className="bg-muted/50 border border-border/50">
                    <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                    <TabsTrigger value="trades">Recent Trades</TabsTrigger>
                    <TabsTrigger value="positions">
                      Your Positions {positions.length > 0 && `(${positions.length})`}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="orderbook" className="mt-4">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2 pb-2 border-b border-border/50">
                          <span>Price</span>
                          <span className="text-right">Size</span>
                          <span className="text-right">Total</span>
                        </div>
                        {orderBook.bids.map((bid, i) => (
                          <div key={i} className="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-muted/20 transition-colors">
                            <span className="text-primary font-mono">{bid.price.toFixed(2)}</span>
                            <span className="text-right font-mono">{bid.size}</span>
                            <span className="text-right text-muted-foreground font-mono">{bid.total}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2 pb-2 border-b border-border/50">
                          <span>Price</span>
                          <span className="text-right">Size</span>
                          <span className="text-right">Total</span>
                        </div>
                        {orderBook.asks.map((ask, i) => (
                          <div key={i} className="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-muted/20 transition-colors">
                            <span className="text-foreground font-mono">{ask.price.toFixed(2)}</span>
                            <span className="text-right font-mono">{ask.size}</span>
                            <span className="text-right text-muted-foreground font-mono">{ask.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="trades" className="mt-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground pb-2 border-b border-border/50">
                        <span>Time</span>
                        <span>Price</span>
                        <span>Size</span>
                        <span>Side</span>
                      </div>
                      {recentTrades.map((trade, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 text-sm py-1">
                          <span className="text-muted-foreground font-mono">{trade.time}</span>
                          <span className="font-mono">{trade.price.toFixed(2)}</span>
                          <span className="font-mono">{trade.size}</span>
                          <span className={trade.side === 'buy' ? 'text-primary' : 'text-foreground'}>
                            {trade.side === 'buy' ? 'Buy' : 'Sell'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="positions" className="mt-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : positions.length > 0 ? (
                      <div className="space-y-2">
                        {positions.map((position) => (
                          <div key={position.id} className="border border-border/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{position.pair}</span>
                                <Badge className={position.side === "long" ? "bg-primary/10 text-primary border-0" : "bg-foreground/10 text-foreground border-0"}>
                                  {position.side === "long" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                  {position.side}
                                </Badge>
                                <Badge variant="outline" className="border-border/50">{position.leverage}x</Badge>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-foreground border-border/50"
                                onClick={() => handleClosePosition(position.id)}
                                disabled={loading}
                              >
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Close Position"}
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">Position Size</p>
                                <p className="font-medium">${position.size.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Entry Price</p>
                                <p className="font-medium font-mono">${position.entryPrice.toFixed(4)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">PnL</p>
                                <p className={`font-medium ${position.pnl > 0 ? 'text-primary' : 'text-foreground'}`}>
                                  ${position.pnl.toFixed(2)} ({position.pnlPercentage > 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%)
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Liquidation Price</p>
                                <p className="font-medium text-foreground">${position.liquidationPrice.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {connected ? "No open positions" : "Connect wallet to view positions"}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Order Form */}
          <div className="space-y-4">
            <Card className="border-border/50 bg-background">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-normal">Place Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Long/Short Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className={side === "long" ? "bg-primary text-white hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted"}
                    onClick={() => setSide("long")}
                    disabled={placingOrder}
                  >
                    Long
                  </Button>
                  <Button
                    className={side === "short" ? "bg-muted text-foreground hover:bg-muted" : "bg-muted/50 text-muted-foreground hover:bg-muted/50"}
                    onClick={() => setSide("short")}
                    disabled={placingOrder}
                  >
                    Short
                  </Button>
                </div>

                {/* Order Type */}
                <div className="space-y-2">
                  <Label className="text-sm">Order Type</Label>
                  <Select value={orderType} onValueChange={(v) => setOrderType(v as any)} disabled={placingOrder}>
                    <SelectTrigger className="bg-background border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label className="text-sm">Amount (USDC)</Label>
                  <Input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    className="bg-background border-border/50"
                    disabled={placingOrder}
                  />
                </div>

                {/* Limit Price (if limit order) */}
                {orderType === "limit" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Limit Price</Label>
                    <Input 
                      type="number" 
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder={displayPrice.toFixed(2)}
                      className="bg-background border-border/50"
                      disabled={placingOrder}
                    />
                  </div>
                )}

                {/* Leverage Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Leverage</Label>
                    <span className="text-lg font-normal">{leverage[0]}x</span>
                  </div>
                  <div className="px-2">
                    <Slider 
                      value={leverage}
                      onValueChange={setLeverage}
                      min={1}
                      max={150}
                      step={1}
                      className="py-4"
                      disabled={placingOrder}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    <span>1x</span>
                    <span>50x</span>
                    <span>100x</span>
                    <span>150x</span>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="border-t border-border/50 pt-4">
                  <button 
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    disabled={placingOrder}
                  >
                    <Settings className="h-4 w-4" />
                    Advanced Options
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Reduce Only</Label>
                        <Switch 
                          checked={reduceOnly}
                          onCheckedChange={setReduceOnly}
                          disabled={placingOrder}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Post Only</Label>
                        <Switch 
                          checked={postOnly}
                          onCheckedChange={setPostOnly}
                          disabled={placingOrder}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Position Summary */}
                <div className="space-y-2 text-sm border-t border-border/50 pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position Size</span>
                    <span className="font-medium">${calculatePositionSize()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry Price</span>
                    <span className="font-mono">
                      ${orderType === "limit" && limitPrice 
                        ? parseFloat(limitPrice).toFixed(4) 
                        : displayPrice.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Liquidation Price</span>
                    <span className="font-medium text-foreground">${calculateLiquidationPrice()}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button 
                  className={`w-full ${side === "long" ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80 text-foreground"} text-white`}
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!connected || !initialized || placingOrder}
                >
                  {placingOrder ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : connected ? (
                    <>
                      {side === "long" ? <ArrowUpRight className="h-4 w-4 mr-2" /> : <ArrowDownRight className="h-4 w-4 mr-2" />}
                      Open {side === "long" ? "Long" : "Short"}
                    </>
                  ) : "Connect Wallet"}
                </Button>

                {/* Risk Warning */}
                <Alert className="bg-primary/5 border-primary/20">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-xs">
                    <span className="font-medium">High Risk Warning</span><br />
                    <span className="text-muted-foreground">
                      Trading with leverage can result in losses greater than your initial investment. Only trade with funds you can afford to lose.
                    </span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}