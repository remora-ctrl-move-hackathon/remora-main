"use client"

import { ArrowLeft, Activity, TrendingUp, Layers, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function OrderGlass() {
  const orderbook = {
    bids: [
      { price: 1.0245, volume: 45234, total: 45234, percentage: 85 },
      { price: 1.0243, volume: 32451, total: 77685, percentage: 65 },
      { price: 1.0241, volume: 28910, total: 106595, percentage: 55 },
      { price: 1.0240, volume: 19234, total: 125829, percentage: 40 },
      { price: 1.0238, volume: 15678, total: 141507, percentage: 30 },
    ],
    asks: [
      { price: 1.0246, volume: 38234, total: 38234, percentage: 75 },
      { price: 1.0248, volume: 29451, total: 67685, percentage: 58 },
      { price: 1.0250, volume: 24910, total: 92595, percentage: 48 },
      { price: 1.0252, volume: 17234, total: 109829, percentage: 35 },
      { price: 1.0254, volume: 12678, total: 122507, percentage: 25 },
    ]
  }

  const recentTrades = [
    { id: 1, wallet: "0x1234...5678", side: "buy", price: 1.0245, volume: 1250, time: "2m ago" },
    { id: 2, wallet: "0xabcd...ef12", side: "sell", price: 1.0246, volume: 890, time: "5m ago" },
    { id: 3, wallet: "0x9876...5432", side: "buy", price: 1.0244, volume: 2100, time: "8m ago" },
    { id: 4, wallet: "0x5555...6666", side: "buy", price: 1.0245, volume: 450, time: "12m ago" },
    { id: 5, wallet: "0x7777...8888", side: "sell", price: 1.0247, volume: 1800, time: "15m ago" },
  ]

  const vaultPositions = [
    { vault: "CryptoWhale Vault", size: 125000, entry: 1.0120, current: 1.0245, pnl: "+1.23%" },
    { vault: "DeFi Master Vault", size: 85000, entry: 1.0180, current: 1.0245, pnl: "+0.64%" },
    { vault: "Moon Trader Vault", size: 210000, entry: 1.0300, current: 1.0245, pnl: "-0.53%" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">OrderGlass</h1>
            <p className="text-sm text-muted-foreground">Real-time orderbook analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="backdrop-blur-xl bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
                  <div className="text-2xl font-bold text-foreground">$45.2M</div>
                </div>
                <Activity className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Spread</div>
                  <div className="text-2xl font-bold text-foreground">0.0001</div>
                </div>
                <Layers className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Last Price</div>
                  <div className="text-2xl font-bold text-green-400">$1.0245</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle>Orderbook Heatmap</CardTitle>
            <CardDescription className="text-muted-foreground">Live bid/ask depth visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                <span>BIDS</span>
                <span>Volume</span>
              </div>
              {orderbook.bids.map((bid, index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute inset-0 bg-green-500/20 rounded"
                    style={{ width: `${bid.percentage}%` }}
                  />
                  <div className="relative flex justify-between text-sm py-2 px-3">
                    <span className="font-mono text-green-400">{bid.price.toFixed(4)}</span>
                    <span className="font-mono text-gray-300">{bid.volume.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              
              <div className="py-3 text-center border-y border-slate-700">
                <div className="text-xs text-muted-foreground">SPREAD</div>
                <div className="text-xl font-bold">1.0245</div>
              </div>

              <div className="text-xs text-muted-foreground mt-4 mb-2 flex justify-between">
                <span>ASKS</span>
                <span>Volume</span>
              </div>
              {orderbook.asks.map((ask, index) => (
                <div key={index} className="relative">
                  <div 
                    className="absolute inset-0 bg-red-500/20 rounded"
                    style={{ width: `${ask.percentage}%` }}
                  />
                  <div className="relative flex justify-between text-sm py-2 px-3">
                    <span className="font-mono text-red-400">{ask.price.toFixed(4)}</span>
                    <span className="font-mono text-gray-300">{ask.volume.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="trades" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 backdrop-blur-xl bg-card border border-border">
            <TabsTrigger value="trades" className="data-[state=active]:bg-black data-[state=active]:text-white">Recent Trades</TabsTrigger>
            <TabsTrigger value="vaults" className="data-[state=active]:bg-black data-[state=active]:text-white">Vault Positions</TabsTrigger>
            <TabsTrigger value="hedge" className="data-[state=active]:bg-black data-[state=active]:text-white">Treasury Hedge</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            <Card className="backdrop-blur-xl bg-card border-border">
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={trade.side === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {trade.side === "buy" ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {trade.side.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="text-sm font-mono">{trade.wallet}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {trade.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">${trade.price.toFixed(4)}</div>
                        <div className="text-xs text-muted-foreground">{trade.volume.toLocaleString()} vol</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vaults">
            <Card className="backdrop-blur-xl bg-card border-border">
              <CardHeader>
                <CardTitle>Active Vault Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vaultPositions.map((position, index) => (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">{position.vault}</div>
                        <Badge className={position.pnl.startsWith("+") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {position.pnl}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <div className="text-muted-foreground text-xs mb-1">Position Size</div>
                          <div className="font-mono font-semibold">${position.size.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs mb-1">Entry Price</div>
                          <div className="font-mono">${position.entry.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs mb-1">Current Price</div>
                          <div className="font-mono">${position.current.toFixed(4)}</div>
                        </div>
                      </div>
                      <Link href="/vault">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white">
                          View in Vault Dashboard
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hedge">
            <Card className="backdrop-blur-xl bg-card border-border">
              <CardHeader>
                <CardTitle>Treasury Hedging Tool</CardTitle>
                <CardDescription className="text-muted-foreground">Manage portfolio exposure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="bg-slate-800/30 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground mb-2">Portfolio Exposure</div>
                      <div className="text-3xl font-bold mb-4">$420,000</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">USDC</span>
                          <span className="font-semibold">$250,000 (59.5%)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">APT</span>
                          <span className="font-semibold">$170,000 (40.5%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Long Hedge
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700">
                      Short Hedge
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    Hedge your portfolio against market volatility
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}
