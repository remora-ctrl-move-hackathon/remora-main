"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, TrendingUp, Users, Award, ArrowUpRight, DollarSign, Target, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function Vault() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("1000")

  const topTraders = [
    { 
      id: 1, 
      name: "CryptoWhale", 
      avatar: "CW", 
      pnl: "+45.2%", 
      return7d: "+12.3%", 
      return30d: "+45.2%", 
      followers: 1234,
      risk: "Medium",
      strategy: "Swing Trading"
    },
    { 
      id: 2, 
      name: "DeFiMaster", 
      avatar: "DM", 
      pnl: "+38.5%", 
      return7d: "+8.5%", 
      return30d: "+38.5%", 
      followers: 892,
      risk: "Low",
      strategy: "Yield Farming"
    },
    { 
      id: 3, 
      name: "MoonTrader", 
      avatar: "MT", 
      pnl: "+62.1%", 
      return7d: "+18.4%", 
      return30d: "+62.1%", 
      followers: 2156,
      risk: "High",
      strategy: "Scalping"
    },
  ]

  const myVaults = [
    { id: 1, trader: "CryptoWhale", invested: 1000, current: 1234, pnl: "+23.4%", allocation: "45%" },
    { id: 2, trader: "DeFiMaster", invested: 500, current: 585, pnl: "+17.0%", allocation: "25%" },
    { id: 3, trader: "MoonTrader", invested: 750, current: 912, pnl: "+21.6%", allocation: "30%" },
  ]

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case "Low": return "text-green-500 bg-green-500/10"
      case "Medium": return "text-yellow-500 bg-yellow-500/10"
      case "High": return "text-red-500 bg-red-500/10"
      default: return "text-muted-foreground bg-accent0/10"
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Copy Trading Vaults</h1>
            <p className="text-sm text-muted-foreground">Follow top traders automatically</p>
          </div>
        </div>

        <Card className="mb-6 bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-400 mb-1">DEPOSITS</div>
                <div className="text-2xl font-bold text-white font-mono">$2,250</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                <div className="text-2xl font-bold text-success">$2,731</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
                <div className="text-2xl font-bold text-success flex items-center gap-1">
                  <ArrowUpRight className="h-5 w-5" />
                  +21.4%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Top Traders</TabsTrigger>
            <TabsTrigger value="myvaults" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">My Vaults</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            {topTraders.map((trader, index) => (
              <Card key={trader.id} className="backdrop-blur-xl bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold">
                          {trader.avatar}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                            <Award className="h-3 w-3 text-slate-900" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-foreground">{trader.name}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {trader.followers.toLocaleString()} followers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">{trader.pnl}</div>
                      <div className="text-xs text-muted-foreground">30d return</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-accent rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">7d Return</div>
                      <div className="text-lg font-semibold text-success">{trader.return7d}</div>
                    </div>
                    <div className="bg-accent rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Strategy</div>
                      <div className="text-sm font-medium text-foreground">{trader.strategy}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getRiskColor(trader.risk)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {trader.risk} Risk
                    </Badge>
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Follow Trader
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                          <DialogTitle>Follow {trader.name}</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Allocate funds to copy this trader's strategy
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Amount (USDC)</Label>
                            <Input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="bg-slate-800 border-slate-700"
                            />
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Trader</span>
                              <span className="font-medium">{trader.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Expected ROI</span>
                              <span className="font-medium text-green-400">{trader.pnl}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Risk Level</span>
                              <span className="font-medium">{trader.risk}</span>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-700">Cancel</Button>
                          <Button onClick={() => setOpen(false)} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                            Confirm & Follow
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="myvaults" className="space-y-4">
            {myVaults.map((vault) => (
              <Card key={vault.id} className="backdrop-blur-xl bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg mb-1">{vault.trader}</div>
                      <div className="text-sm text-muted-foreground">Allocation: {vault.allocation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{vault.pnl}</div>
                      <div className="text-xs text-muted-foreground">P&L</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-accent rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Invested</div>
                      <div className="text-lg font-semibold">${vault.invested}</div>
                    </div>
                    <div className="bg-accent rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Current Value</div>
                      <div className="text-lg font-semibold text-green-400">${vault.current}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-slate-700 hover:bg-slate-800">
                        Withdraw
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-slate-700 hover:bg-slate-800">
                        Add Funds
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/streams">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white">
                          Stream Profits
                        </Button>
                      </Link>
                      <Link href="/remit">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white">
                          Send as Remit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="backdrop-blur-xl bg-card border-border">
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                <h3 className="font-bold text-lg mb-2">Portfolio Summary</h3>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-2xl font-bold text-green-400">+$481</div>
                    <div className="text-xs text-muted-foreground">Total Earnings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-xs text-muted-foreground">Active Vaults</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">+21.4%</div>
                    <div className="text-xs text-muted-foreground">Avg Return</div>
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
