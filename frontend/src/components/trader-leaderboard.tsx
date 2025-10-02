"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, Users, Trophy, Copy } from "lucide-react"
import toast from "react-hot-toast"

interface Trader {
  address: string
  name: string
  roi: number
  totalProfit: number
  copiers: number
  winRate: number
  rank: number
  strategies: string[]
}

const topTraders: Trader[] = [
  {
    address: "0x1234...5678",
    name: "CryptoWhale",
    roi: 127.5,
    totalProfit: 52400,
    copiers: 234,
    winRate: 78,
    rank: 1,
    strategies: ["Scalping", "Momentum"]
  },
  {
    address: "0x8765...4321",
    name: "DeFiMaster",
    roi: 98.2,
    totalProfit: 41200,
    copiers: 189,
    winRate: 72,
    rank: 2,
    strategies: ["Arbitrage", "Swing"]
  },
  {
    address: "0xabcd...efgh",
    name: "YieldHunter",
    roi: 85.7,
    totalProfit: 38900,
    copiers: 156,
    winRate: 69,
    rank: 3,
    strategies: ["Yield Farming", "HODLing"]
  },
  {
    address: "0xijkl...mnop",
    name: "RiskTaker",
    roi: 76.3,
    totalProfit: 31500,
    copiers: 134,
    winRate: 65,
    rank: 4,
    strategies: ["Leverage", "Options"]
  },
  {
    address: "0xqrst...uvwx",
    name: "SmartMoney",
    roi: 68.9,
    totalProfit: 28700,
    copiers: 112,
    winRate: 71,
    rank: 5,
    strategies: ["DCA", "Value"]
  }
]

export function TraderLeaderboard() {
  const [following, setFollowing] = useState<string[]>([])
  
  const handleFollow = (address: string) => {
    if (following.includes(address)) {
      setFollowing(following.filter(a => a !== address))
      toast.success("Unfollowed trader")
    } else {
      setFollowing([...following, address])
      toast.success("Now copying trader's strategies!")
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Traders Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topTraders.map((trader) => (
            <div
              key={trader.address}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">{getRankIcon(trader.rank)}</div>
                <Avatar>
                  <AvatarFallback>{trader.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{trader.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {trader.address}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {trader.roi}% ROI
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {trader.copiers} copiers
                    </span>
                    <span>Win Rate: {trader.winRate}%</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {trader.strategies.map((strategy) => (
                      <Badge key={strategy} variant="secondary" className="text-xs">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +${trader.totalProfit.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Profit</p>
                </div>
                <Button
                  size="sm"
                  variant={following.includes(trader.address) ? "outline" : "default"}
                  onClick={() => handleFollow(trader.address)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {following.includes(trader.address) ? "Following" : "Copy"}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">🏆 Leaderboard Rewards</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">1st Place</p>
              <p className="font-semibold">$5,000 USDC</p>
            </div>
            <div>
              <p className="text-muted-foreground">2nd Place</p>
              <p className="font-semibold">$3,000 USDC</p>
            </div>
            <div>
              <p className="text-muted-foreground">3rd Place</p>
              <p className="font-semibold">$1,000 USDC</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}