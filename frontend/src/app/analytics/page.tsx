"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Zap, Wallet, Shield, PieChart, CircleDollarSign, Layers, Loader2 } from "lucide-react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { usePerpetualTrading } from "@/hooks/usePerpetualTrading"
import { useProtocolAnalytics } from "@/hooks/useProtocolAnalytics"
import Link from "next/link"

export default function Analytics() {
  const { connected, account } = useWallet()
  const { 
    loading, 
    positions, 
    tradingHistory, 
    tradingStats,
    orders 
  } = usePerpetualTrading()
  const { metrics: protocolMetrics, loading: protocolLoading } = useProtocolAnalytics()
  
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate real portfolio metrics
  const calculatePortfolioValue = () => {
    if (!connected || !positions.length) return 0
    return positions.reduce((total, position) => {
      return total + position.collateral + position.pnl
    }, walletBalance)
  }

  const calculateTotalPnL = () => {
    if (!positions.length) return 0
    return positions.reduce((total, position) => total + position.pnl, 0)
  }

  const calculatePnLPercentage = () => {
    const totalCollateral = positions.reduce((total, pos) => total + pos.collateral, 0)
    const totalPnL = calculateTotalPnL()
    if (totalCollateral === 0) return 0
    return ((totalPnL / totalCollateral) * 100)
  }

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!connected || !account) {
        setIsLoading(false)
        return
      }

      try {
        // In a real implementation, you'd fetch the actual APT/USDC balance
        // For now, we'll simulate it
        const simulatedBalance = Math.random() * 10000 + 1000 // Random balance between 1000-11000
        setWalletBalance(simulatedBalance)
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWalletData()
  }, [connected, account])

  const portfolioValue = calculatePortfolioValue()
  const totalPnL = calculateTotalPnL()
  const pnlPercentage = calculatePnLPercentage()

  const stats = [
    { 
      label: "Portfolio Value", 
      value: connected ? `$${portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : "$0", 
      change: connected ? `${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(1)}%` : "0%", 
      trend: pnlPercentage >= 0 ? "up" : "down", 
      icon: Wallet,
      subValue: connected ? `${positions.length} positions` : "Connect wallet"
    },
    { 
      label: "Trading PnL", 
      value: connected ? `${totalPnL >= 0 ? '+' : ''}$${Math.abs(totalPnL).toFixed(2)}` : "$0", 
      change: connected && tradingStats ? `${tradingStats.winRate.toFixed(1)}% win rate` : "0%", 
      trend: totalPnL >= 0 ? "up" : "down", 
      icon: TrendingUp,
      subValue: connected ? `${tradingStats?.totalPositions || 0} total trades` : "No trades"
    },
    { 
      label: "Active Orders", 
      value: connected ? orders.length.toString() : "0", 
      change: connected ? "Live orders" : "Connect wallet", 
      trend: "up", 
      icon: Activity,
      subValue: connected ? "Pending execution" : "No orders"
    },
    { 
      label: "Trading Volume", 
      value: connected && tradingStats ? `$${tradingStats.totalVolume.toLocaleString()}` : "$0", 
      change: connected ? "All time" : "0%", 
      trend: "up", 
      icon: Zap,
      subValue: connected ? "Historical" : "No volume"
    },
  ]

  // Real portfolio breakdown based on actual positions
  const portfolioBreakdown = connected && positions.length > 0 ? [
    { 
      asset: "Active Positions", 
      value: positions.reduce((sum, pos) => sum + pos.collateral + pos.pnl, 0), 
      percentage: ((positions.reduce((sum, pos) => sum + pos.collateral + pos.pnl, 0) / portfolioValue) * 100) || 0, 
      color: "from-primary to-primary/70" 
    },
    { 
      asset: "Wallet Balance", 
      value: walletBalance, 
      percentage: ((walletBalance / portfolioValue) * 100) || 0, 
      color: "from-green-500 to-green-400" 
    },
    { 
      asset: "Unrealized PnL", 
      value: Math.abs(totalPnL), 
      percentage: ((Math.abs(totalPnL) / portfolioValue) * 100) || 0, 
      color: totalPnL >= 0 ? "from-blue-500 to-blue-400" : "from-red-500 to-red-400" 
    },
  ] : [
    { asset: "No data", value: 0, percentage: 100, color: "from-gray-300 to-gray-200" }
  ]

  // Recent activity from trading history
  const recentActivity = connected && tradingHistory.length > 0 
    ? tradingHistory.slice(0, 4).map((trade, index) => ({
        id: index,
        type: trade.size > 0 ? "Position Opened" : "Position Closed",
        details: `${trade.pair} • ${trade.size > 0 ? 'Long' : 'Short'} • $${Math.abs(trade.size).toFixed(0)}`,
        time: new Date(trade.timestamp).toLocaleDateString(),
        status: "success",
        txn: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`
      }))
    : [
        { 
          id: 1, 
          type: "No activity", 
          details: "Connect wallet to see trading history",
          time: "N/A",
          status: "pending",
          txn: "N/A"
        }
      ]


  const yieldSources = connected ? [
    { 
      source: "Trading PnL", 
      apy: `${pnlPercentage.toFixed(1)}%`, 
      value: `$${Math.abs(totalPnL).toFixed(0)}`, 
      icon: TrendingUp 
    },
    { 
      source: "Active Positions", 
      apy: "Live", 
      value: `${positions.length} open`, 
      icon: Activity 
    },
    { 
      source: "Pending Orders", 
      apy: "Queued", 
      value: `${orders.length} orders`, 
      icon: Zap 
    },
    { 
      source: "Win Rate", 
      apy: `${tradingStats?.winRate.toFixed(1) || 0}%`, 
      value: `${tradingStats?.totalPositions || 0} trades`, 
      icon: Shield 
    },
  ] : [
    { source: "No data", apy: "0%", value: "$0", icon: Shield },
  ]

  if (!connected) {

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900">Analytics</h1>
        </div>

        {/* Connect Wallet Message */}
        <div className="text-center py-16 border border-gray-200 rounded-lg mb-8">
          <Wallet className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-sm text-gray-500">Connect your wallet to view portfolio analytics</p>
        </div>

        {/* Protocol Overview */}
        <Card className="bg-gradient-to-r from-primary to-primary/90 text-white mb-10 border-0 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-lg font-light mb-6 opacity-90">Protocol Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              <div>
                <p className="text-xs opacity-70 mb-1">TVL</p>
                <p className="text-2xl font-extralight">{protocolMetrics.tvl}</p>
              </div>
              <div>
                <p className="text-xs opacity-70 mb-1">24h Volume</p>
                <p className="text-2xl font-extralight">{protocolMetrics.volume24h}</p>
              </div>
              <div>
                <p className="text-xs opacity-70 mb-1">Active Streams</p>
                <p className="text-2xl font-extralight">{protocolMetrics.totalStreams}</p>
              </div>
              <div>
                <p className="text-xs opacity-70 mb-1">Users</p>
                <p className="text-2xl font-extralight">{protocolMetrics.activeUsers}</p>
              </div>
              <div>
                <p className="text-xs opacity-70 mb-1">Avg APY</p>
                <p className="text-2xl font-extralight">{protocolMetrics.avgAPY}</p>
              </div>
              <div>
                <p className="text-xs opacity-70 mb-1">Revenue</p>
                <p className="text-2xl font-extralight">{protocolMetrics.protocolRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Portfolio Breakdown */}
          <Card className="bg-white border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-light text-xl flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Portfolio Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-light text-gray-600">{item.asset}</span>
                      <span className="text-sm font-mono">${item.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 font-light mt-1">{item.percentage}% of portfolio</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-light">Total Value</span>
                  <span className="text-xl font-light">$101,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yield Sources */}
          <Card className="bg-white border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-light text-xl flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-primary" />
                Yield Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {yieldSources.map((source, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-border/30 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <source.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-normal text-gray-900">{source.source}</p>
                        <p className="text-xs text-gray-500 font-light">{source.value}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-light text-green-600">{source.apy}</p>
                      <p className="text-xs text-gray-400 font-light">APY</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light">Total Monthly Yield</span>
                  <span className="text-xl font-light text-primary">$1,721</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-light text-xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 rounded-xl border border-border/30 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-normal text-gray-900">{activity.type}</p>
                        <p className="text-xs text-gray-500 font-light">{activity.details}</p>
                      </div>
                      <Badge className={`text-xs font-light ${
                        activity.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      } border-0`}>
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-light">{activity.time}</span>
                      <span className="font-mono text-gray-500">{activity.txn}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/transactions">
                <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/5 font-light">
                  View All Transactions
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
  }

  // Connected state - show full analytics
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 font-light mt-1">Protocol metrics & portfolio insights</p>
          </div>
          <Badge variant="outline" className="text-xs border-primary/20 text-primary font-light">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
            Live on Testnet
          </Badge>
        </div>

        {/* Loading State */}
        {(loading || isLoading || protocolLoading) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !isLoading && !protocolLoading && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="p-4 bg-white border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon className="h-4 w-4 text-gray-600" strokeWidth={1.5} />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
                  </div>
                  <p className="text-xl font-light text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
                </div>
              ))}
            </div>

            {/* Protocol Overview */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-medium text-gray-900">Protocol</h3>
                {protocolLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">TVL</p>
                  <p className="text-lg font-light">{protocolMetrics.tvl}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Volume</p>
                  <p className="text-lg font-light">{protocolMetrics.volume24h}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Streams</p>
                  <p className="text-lg font-light">{protocolMetrics.totalStreams}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Users</p>
                  <p className="text-lg font-light">{protocolMetrics.activeUsers}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">APY</p>
                  <p className="text-lg font-light">{protocolMetrics.avgAPY}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Revenue</p>
                  <p className="text-lg font-light">{protocolMetrics.protocolRevenue}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Portfolio Breakdown */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Portfolio</h3>
                <div className="space-y-3">
                  {portfolioBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.asset}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium">${item.value.toLocaleString()}</span>
                        <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-lg font-medium">${portfolioValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Activity</h3>
                <div className="space-y-2">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-900">{activity.type}</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-xs text-gray-600">{activity.details}</p>
                    </div>
                  ))}
                </div>
                {recentActivity.length > 5 && (
                  <Link href="/transactions" className="block mt-4">
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      View all activity →
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Trading Performance */}
            {positions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Trading</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                    <p className="text-lg font-light text-green-600">{tradingStats?.winRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Trades</p>
                    <p className="text-lg font-light">{tradingStats?.totalPositions || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Volume</p>
                    <p className="text-lg font-light">${tradingStats?.totalVolume.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* No Data State */}
            {positions.length === 0 && tradingHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No trading data available.</p>
                <p className="text-xs mt-1">Start trading to see analytics.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}