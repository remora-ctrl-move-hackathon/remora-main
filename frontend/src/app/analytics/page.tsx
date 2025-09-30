"use client"

import { TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Zap, Wallet, Shield, PieChart, CircleDollarSign, Layers } from "lucide-react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function Analytics() {
  const stats = [
    { 
      label: "Portfolio Value", 
      value: "$892,459", 
      change: "+12.3%", 
      trend: "up", 
      icon: Wallet,
      subValue: "86.4M APT"
    },
    { 
      label: "Streaming Income", 
      value: "$5,234/mo", 
      change: "+18.2%", 
      trend: "up", 
      icon: Zap,
      subValue: "8 active"
    },
    { 
      label: "Vault Returns", 
      value: "+21.4%", 
      change: "+3.1%", 
      trend: "up", 
      icon: TrendingUp,
      subValue: "3 positions"
    },
    { 
      label: "Total Volume", 
      value: "$12.4M", 
      change: "+45.8%", 
      trend: "up", 
      icon: Activity,
      subValue: "This epoch"
    },
  ]

  const protocolMetrics = {
    tvl: "$892M",
    volume24h: "$124M",
    totalStreams: "1,248",
    activeUsers: "8,429",
    avgAPY: "12.8%",
    protocolRevenue: "$2.4M"
  }

  const recentActivity = [
    { 
      id: 1, 
      type: "Stream Created", 
      details: "Team Payroll • $3,500/mo",
      time: "2 min ago",
      status: "success",
      txn: "0x742d...8f9a"
    },
    { 
      id: 2, 
      type: "Vault Harvest", 
      details: "Alpha Strategy • +125.5 APT",
      time: "15 min ago",
      status: "success",
      txn: "0x9fc1...3e2d"
    },
    { 
      id: 3, 
      type: "Remittance Sent", 
      details: "US → Nigeria • 200 USDC",
      time: "1 hour ago",
      status: "success",
      txn: "0x1a3b...7c5e"
    },
    { 
      id: 4, 
      type: "Liquidity Added", 
      details: "APT/USDC Pool • $1,000",
      time: "2 hours ago",
      status: "pending",
      txn: "0x8df2...1b4c"
    },
  ]

  const portfolioBreakdown = [
    { asset: "Streams", value: 45234, percentage: 45, color: "from-primary to-primary/70" },
    { asset: "Vaults", value: 32100, percentage: 32, color: "from-green-500 to-green-400" },
    { asset: "Liquidity", value: 15600, percentage: 15, color: "from-blue-500 to-blue-400" },
    { asset: "Staking", value: 8066, percentage: 8, color: "from-purple-500 to-purple-400" },
  ]

  const yieldSources = [
    { source: "Streaming APY", apy: "3.36%", value: "$186/mo", icon: Zap },
    { source: "Vault Returns", apy: "21.4%", value: "$573/mo", icon: TrendingUp },
    { source: "LP Rewards", apy: "45.2%", value: "$892/mo", icon: Layers },
    { source: "Staking Rewards", apy: "8.7%", value: "$70/mo", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extralight text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 font-light mt-1">Protocol metrics & portfolio insights</p>
          </div>
          <Badge variant="outline" className="text-xs border-primary/20 text-primary font-light">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
            Live on Testnet
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-light ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-light">{stat.label}</p>
                  <p className="text-2xl font-extralight text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-light mt-1">{stat.subValue}</p>
                </div>
              </CardContent>
            </Card>
          ))}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/streams">
            <Card className="bg-white border-border/50 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-light text-gray-900">Create Stream</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/vault">
            <Card className="bg-white border-border/50 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-light text-gray-900">Manage Vaults</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}