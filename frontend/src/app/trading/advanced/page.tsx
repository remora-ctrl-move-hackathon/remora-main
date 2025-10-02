"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, 
  AlertTriangle, Zap, BarChart3, Settings,
  ArrowUpRight, ArrowDownRight, Info
} from "lucide-react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import toast from "react-hot-toast"
import { LiveIndicator, AnimatedNumber } from "@/components/ui/live-indicator"

export default function AdvancedTrading() {
  const { connected } = useWallet()
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [side, setSide] = useState<"long" | "short">("long")
  const [leverage, setLeverage] = useState([10])
  const [amount, setAmount] = useState("100")
  const [price, setPrice] = useState("")
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Mock market data with some randomness for demo
  const [currentPrice, setCurrentPrice] = useState(12.85)
  const [prevPrice, setPrevPrice] = useState(12.85)
  const funding = 0.0125
  const volume24h = 1200000
  const openInterest = 850000
  
  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrevPrice(currentPrice)
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 0.02
        return Math.max(0, prev + change)
      })
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleTrade = () => {
    if (!connected) {
      toast.error("Please connect your wallet")
      return
    }
    toast.success(`${side === "long" ? "Long" : "Short"} position opened with ${leverage}x leverage`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Advanced Trading</h1>
            <p className="text-sm text-gray-500 font-light mt-1">Trade perpetuals with up to 150x leverage</p>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High Risk
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Chart Placeholder */}
            <Card className="bg-white border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle>APT-PERP</CardTitle>
                    <Badge className={currentPrice > 12 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}>
                      {currentPrice > 12 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {((currentPrice - 12) / 12 * 100).toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">1H</Button>
                    <Button variant="outline" size="sm">4H</Button>
                    <Button variant="default" size="sm">1D</Button>
                    <Button variant="outline" size="sm">1W</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Mark Price</span>
                    <LiveIndicator className="justify-center" />
                  </div>
                  <AnimatedNumber 
                    value={currentPrice} 
                    decimals={2} 
                    prefix="$" 
                    trend={currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : null}
                    className="text-2xl font-light"
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Funding</span>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-light">{funding}%</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">24h Volume</span>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-light">
                    ${volume24h >= 1000000 ? `${(volume24h / 1000000).toFixed(1)}M` : `${(volume24h / 1000).toFixed(0)}K`}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Open Interest</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-light">
                    ${openInterest >= 1000000 ? `${(openInterest / 1000000).toFixed(1)}M` : `${(openInterest / 1000).toFixed(0)}K`}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Book / Trades */}
            <Card className="bg-white border-border/50">
              <Tabs defaultValue="orderbook">
                <CardHeader>
                  <TabsList>
                    <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                    <TabsTrigger value="trades">Recent Trades</TabsTrigger>
                    <TabsTrigger value="positions">Your Positions</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="orderbook" className="m-0">
                    <div className="space-y-1">
                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 pb-2">
                        <span>Price</span>
                        <span className="text-right">Size</span>
                        <span className="text-right">Total</span>
                      </div>
                      {/* Sell orders */}
                      {[5, 4, 3, 2, 1].map(i => (
                        <div key={`sell-${i}`} className="grid grid-cols-3 gap-4 text-sm">
                          <span className="text-red-600">{(currentPrice + i * 0.01).toFixed(2)}</span>
                          <span className="text-right">{(Math.random() * 1000).toFixed(0)}</span>
                          <span className="text-right">{(Math.random() * 10000).toFixed(0)}</span>
                        </div>
                      ))}
                      <div className="border-t border-b py-2 my-2">
                        <div className="text-center font-medium">${currentPrice}</div>
                      </div>
                      {/* Buy orders */}
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={`buy-${i}`} className="grid grid-cols-3 gap-4 text-sm">
                          <span className="text-green-600">{(currentPrice - i * 0.01).toFixed(2)}</span>
                          <span className="text-right">{(Math.random() * 1000).toFixed(0)}</span>
                          <span className="text-right">{(Math.random() * 10000).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="trades" className="m-0">
                    <div className="text-center text-gray-500 py-8">Recent trades would appear here</div>
                  </TabsContent>
                  <TabsContent value="positions" className="m-0">
                    <div className="text-center text-gray-500 py-8">You have no open positions</div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Trading Panel */}
          <div>
            <Card className="bg-white border-border/50 sticky top-24">
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buy/Sell Tabs */}
                <Tabs value={side} onValueChange={(v) => setSide(v as "long" | "short")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="long" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                      Long
                    </TabsTrigger>
                    <TabsTrigger value="short" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                      Short
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Order Type */}
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <Select value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")}>
                    <SelectTrigger>
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
                  <Label>Amount (USDC)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {/* Limit Price */}
                {orderType === "limit" && (
                  <div className="space-y-2">
                    <Label>Limit Price</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={currentPrice.toString()}
                    />
                  </div>
                )}

                {/* Leverage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Leverage</Label>
                    <span className="text-sm font-medium">{leverage[0]}x</span>
                  </div>
                  <Slider
                    value={leverage}
                    onValueChange={setLeverage}
                    min={1}
                    max={150}
                    step={1}
                    className="py-3"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1x</span>
                    <span>50x</span>
                    <span>100x</span>
                    <span>150x</span>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Advanced Options</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {showAdvanced && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Stop Loss</Label>
                      <Input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Take Profit</Label>
                      <Input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                )}

                {/* Position Info */}
                <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position Size</span>
                    <span>${(Number(amount) * leverage[0]).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entry Price</span>
                    <span>${orderType === "limit" && price ? price : currentPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Liquidation Price</span>
                    <span className="text-red-600">
                      ${side === "long" 
                        ? (currentPrice * (1 - 0.9 / leverage[0])).toFixed(2)
                        : (currentPrice * (1 + 0.9 / leverage[0])).toFixed(2)
                      }
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleTrade}
                  className={`w-full ${side === "long" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                  disabled={!connected || !amount}
                >
                  {side === "long" ? <ArrowUpRight className="h-4 w-4 mr-2" /> : <ArrowDownRight className="h-4 w-4 mr-2" />}
                  {side === "long" ? "Open Long" : "Open Short"}
                </Button>

                {/* Risk Warning */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium mb-1">High Risk Warning</p>
                      <p>Trading with leverage can result in losses greater than your initial investment. Only trade with funds you can afford to lose.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}