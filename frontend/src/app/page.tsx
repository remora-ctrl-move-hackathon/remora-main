"use client"

import { useState } from "react"
import { 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Users, 
  Building2,
  Briefcase,
  Globe2,
  Landmark,
  BarChart3,
  Wallet,
  ArrowRightLeft,
  Shield,
  Activity,
  Coins,
  CircleDollarSign,
  Banknote
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function Home() {
  const [activeTab, setActiveTab] = useState("streams")

  const stats = {
    totalVolume: "$892M",
    activeStreams: "248",
    totalRemittance: "$644M"
  }

  const streams = [
    { 
      id: 1,
      recipient: "Team Payroll",
      icon: Building2,
      amount: "86.4M",
      currency: "USDC",
      value: "$286M",
      rate: "$3,500/mo",
      status: "active",
      progress: 78,
      apy: "3.36%"
    },
    {
      id: 2,
      recipient: "Contractor Pool",
      icon: Users,
      amount: "74.5M",
      currency: "USDT",
      value: "$247M",
      rate: "$15,000/wk",
      status: "active", 
      progress: 70,
      apy: "3.58%"
    },
    {
      id: 3,
      recipient: "Remote Workers",
      icon: Globe2,
      amount: "65.2M",
      currency: "USDC",
      value: "$65.2M",
      rate: "$8,200/mo",
      status: "active",
      progress: 77,
      apy: "10.61%"
    },
    {
      id: 4,
      recipient: "DAO Treasury",
      icon: Landmark,
      amount: "7.56M",
      currency: "suiUSDT",
      value: "$7.56M",
      rate: "$50,000/mo",
      status: "active",
      progress: 77,
      apy: "27.27%"
    },
    {
      id: 5,
      recipient: "Marketing Fund",
      icon: BarChart3,
      amount: "7.37M",
      currency: "AUSD",
      value: "$7.37M",
      rate: "$25,000/wk",
      status: "paused",
      progress: 0,
      apy: "7.65%"
    }
  ]

  const remittances = [
    {
      id: 1,
      corridor: "US → Nigeria",
      fromIcon: CircleDollarSign,
      toIcon: Banknote,
      volume: "453M",
      currency: "NGN",
      value: "$50.7M",
      transactions: "1.8K",
      fee: "0.02%",
      speed: "2 min"
    },
    {
      id: 2,
      corridor: "UK → India",
      fromIcon: Banknote,
      toIcon: Coins,
      volume: "221M",
      currency: "INR",
      value: "$24.7M",
      transactions: "1.85K",
      fee: "0.04%",
      speed: "4 min"
    },
    {
      id: 3,
      corridor: "US → Mexico",
      fromIcon: CircleDollarSign,
      toIcon: Wallet,
      volume: "8.2M",
      currency: "MXN",
      value: "$37.8M",
      transactions: "401",
      fee: "0.11%",
      speed: "5 min"
    }
  ]

  const vaults = [
    {
      id: 1,
      name: "Alpha Strategy",
      manager: "CryptoWhale",
      icon: TrendingUp,
      tvl: "$16.4M",
      apy: "7.68%",
      risk: "Low",
      investors: 286
    },
    {
      id: 2,
      name: "DeFi Yield Plus",
      manager: "YieldMaster",
      icon: Activity,
      tvl: "$483K",
      apy: "14.39%", 
      risk: "Medium",
      investors: 124
    },
    {
      id: 3,
      name: "Stable Growth",
      manager: "SafeHands",
      icon: Shield,
      tvl: "$2.13M",
      apy: "7.43%",
      risk: "Low",
      investors: 89
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1">
        {/* Stats Header */}
        <div className="border-b border-border">
          <div className="max-w-screen-xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-sm font-medium text-primary uppercase tracking-wider">MAIN MARKET</h1>
              <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                <Clock className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Total Volume</p>
                <p className="text-3xl font-bold font-mono">{stats.totalVolume}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Active Streams</p>
                <p className="text-3xl font-bold font-mono">{stats.activeStreams}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">TVL</p>
                <p className="text-3xl font-bold font-mono">{stats.totalRemittance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <div className="max-w-screen-xl mx-auto px-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("streams")}
                className={`py-4 text-xs font-medium border-b-2 transition-colors uppercase tracking-wider ${
                  activeTab === "streams" 
                    ? "text-primary border-primary" 
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                Payment Streams
              </button>
              <button
                onClick={() => setActiveTab("remittance")}
                className={`py-4 text-xs font-medium border-b-2 transition-colors uppercase tracking-wider ${
                  activeTab === "remittance"
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                Remittance Corridors
              </button>
              <button
                onClick={() => setActiveTab("vaults")}
                className={`py-4 text-xs font-medium border-b-2 transition-colors uppercase tracking-wider ${
                  activeTab === "vaults"
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                Copy Trading Vaults
              </button>
            </div>
          </div>
        </div>

        {/* Content Tables */}
        <div className="max-w-screen-xl mx-auto px-8 py-8">
          {activeTab === "streams" && (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-8 py-3 text-xs text-muted-foreground uppercase tracking-wider">
                <div className="col-span-3">Recipient</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-2 text-right">APY</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              {streams.map((stream) => (
                <Link href="/streams" key={stream.id}>
                  <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer p-4 mb-2">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <stream.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{stream.recipient}</p>
                          <p className="text-xs text-muted-foreground">{stream.currency}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-mono font-bold text-primary">{stream.amount} {stream.currency}</p>
                        <p className="text-xs text-muted-foreground font-mono">{stream.value}</p>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-mono text-foreground">{stream.rate}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all rounded-full"
                              style={{ width: `${stream.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-primary">{stream.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-success" />
                          <span className="text-sm font-mono text-success">{stream.apy}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        {stream.status === "active" ? (
                          <Badge className="bg-success/10 text-success border-success/20 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-accent text-muted-foreground border-border text-xs">
                            Paused
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "remittance" && (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-8 py-3 text-xs text-muted-foreground uppercase tracking-wider">
                <div className="col-span-3">Corridor</div>
                <div className="col-span-2 text-right">Volume</div>
                <div className="col-span-2 text-right">Transactions</div>
                <div className="col-span-2 text-center">Speed</div>
                <div className="col-span-2 text-right">Fee</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              {remittances.map((corridor) => (
                <Link href="/remit" key={corridor.id}>
                  <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer p-4 mb-2">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <corridor.fromIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <corridor.toIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{corridor.corridor}</p>
                          <p className="text-xs text-muted-foreground">{corridor.currency}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-mono font-bold text-primary">{corridor.volume}</p>
                        <p className="text-xs text-muted-foreground font-mono">{corridor.value}</p>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-mono text-foreground">{corridor.transactions}</p>
                        <p className="text-xs text-muted-foreground">this month</p>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <Badge variant="outline" className="text-xs font-mono border-primary/20">
                          <Clock className="h-3 w-3 mr-1" />
                          {corridor.speed}
                        </Badge>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-mono text-success">{corridor.fee}</p>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "vaults" && (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-8 py-3 text-xs text-muted-foreground uppercase tracking-wider">
                <div className="col-span-3">Vault</div>
                <div className="col-span-2 text-right">TVL</div>
                <div className="col-span-2 text-right">APY</div>
                <div className="col-span-2 text-center">Risk</div>
                <div className="col-span-2 text-right">Investors</div>
                <div className="col-span-1"></div>
              </div>

              {/* Table Rows */}
              {vaults.map((vault) => (
                <Link href="/vault" key={vault.id}>
                  <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer p-4 mb-2">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <vault.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{vault.name}</p>
                          <p className="text-xs text-muted-foreground">by {vault.manager}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-mono font-bold text-foreground">{vault.tvl}</p>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-success" />
                          <span className="text-sm font-mono text-success">{vault.apy}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            vault.risk === "Low" 
                              ? "border-success/20 text-success" 
                              : "border-warning/20 text-warning"
                          }`}
                        >
                          {vault.risk}
                        </Badge>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono">{vault.investors}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}