"use client"

import { useState } from "react"
import { 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Users, 
  Building2,
  Globe2,
  Landmark,
  BarChart3,
  Wallet,
  ArrowRightLeft,
  Shield,
  Activity,
  Zap
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
      fromIcon: Wallet,
      toIcon: Wallet,
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
      fromIcon: Wallet,
      toIcon: Wallet,
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
      fromIcon: Wallet,
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1">
        {/* Stats Header */}
        <div className="bg-gradient-to-r from-white to-gray-50/50">
          <div className="max-w-screen-xl mx-auto px-8 py-12">
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-base font-light text-gray-500 uppercase tracking-widest">MAIN MARKET</h1>
              <Badge variant="outline" className="text-xs border-primary/20 text-primary font-light">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
                Live
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-12">
              <div>
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-light">Total Volume</p>
                <p className="text-4xl font-extralight tracking-tight">{stats.totalVolume}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-light">Active Streams</p>
                <p className="text-4xl font-extralight tracking-tight">{stats.activeStreams}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-light">TVL</p>
                <p className="text-4xl font-extralight tracking-tight">{stats.totalRemittance}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white sticky top-16 z-10">
          <div className="max-w-screen-xl mx-auto px-8">
            <div className="flex gap-12 border-b border-gray-100">
              <button
                onClick={() => setActiveTab("streams")}
                className={`py-6 text-xs font-light border-b-2 transition-all uppercase tracking-wider ${
                  activeTab === "streams" 
                    ? "text-primary border-primary" 
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                Payment Streams
              </button>
              <button
                onClick={() => setActiveTab("remittance")}
                className={`py-6 text-xs font-light border-b-2 transition-all uppercase tracking-wider ${
                  activeTab === "remittance"
                    ? "text-primary border-primary"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                Remittance Corridors
              </button>
              <button
                onClick={() => setActiveTab("vaults")}
                className={`py-6 text-xs font-light border-b-2 transition-all uppercase tracking-wider ${
                  activeTab === "vaults"
                    ? "text-primary border-primary"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                Copy Trading Vaults
              </button>
            </div>
          </div>
        </div>

        {/* Content Tables */}
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          {activeTab === "streams" && (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-gray-400 uppercase tracking-wider font-light">
                <div className="col-span-4">Recipient</div>
                <div className="col-span-3 text-right">Amount</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-1 text-right">APY</div>
              </div>

              {/* Table Rows */}
              {streams.map((stream) => (
                <Link href={`/streams/${stream.id}`} key={stream.id}>
                  <Card className="bg-white border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer p-6 mb-3">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                          <stream.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-normal text-gray-900">{stream.recipient}</p>
                          <p className="text-xs text-gray-400 font-light">{stream.currency}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-3 text-right">
                        <p className="text-sm font-light text-gray-900">{stream.amount} {stream.currency}</p>
                        <p className="text-xs text-gray-400 font-light">{stream.value}</p>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-light text-gray-600">{stream.rate}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all rounded-full"
                              style={{ width: `${stream.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-light text-gray-500">{stream.progress}%</span>
                        </div>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" strokeWidth={1.5} />
                          <span className="text-sm font-light text-primary">{stream.apy}</span>
                        </div>
                        {stream.status === "active" ? (
                          <div className="text-xs text-green-600 mt-1">Active</div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-1">Paused</div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "remittance" && (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-gray-400 uppercase tracking-wider font-light">
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
                  <Card className="bg-white border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer p-6 mb-3">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                            <corridor.fromIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                          </div>
                          <ArrowRightLeft className="h-3 w-3 text-gray-300" strokeWidth={1.5} />
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 flex items-center justify-center">
                            <corridor.toIcon className="h-4 w-4 text-secondary" strokeWidth={1.5} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-normal text-gray-900">{corridor.corridor}</p>
                          <p className="text-xs text-gray-400 font-light">{corridor.currency}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-light text-gray-900">{corridor.volume}</p>
                        <p className="text-xs text-gray-400 font-light">{corridor.value}</p>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-light text-gray-600">{corridor.transactions}</p>
                        <p className="text-xs text-gray-400 font-light">this month</p>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <Badge variant="outline" className="text-xs font-light border-gray-200">
                          <Zap className="h-3 w-3 mr-1" strokeWidth={1.5} />
                          {corridor.speed}
                        </Badge>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-light text-primary">{corridor.fee}</p>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        <ArrowUpRight className="h-4 w-4 text-gray-300" strokeWidth={1.5} />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "vaults" && (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-gray-400 uppercase tracking-wider font-light">
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
                  <Card className="bg-white border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer p-6 mb-3">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                          <vault.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-normal text-gray-900">{vault.name}</p>
                          <p className="text-xs text-gray-400 font-light">by {vault.manager}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-light text-gray-900">{vault.tvl}</p>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" strokeWidth={1.5} />
                          <span className="text-sm font-light text-primary">{vault.apy}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-center">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-light ${
                            vault.risk === "Low" 
                              ? "border-green-200 text-green-600 bg-green-50" 
                              : "border-yellow-200 text-yellow-600 bg-yellow-50"
                          }`}
                        >
                          {vault.risk}
                        </Badge>
                      </div>
                      
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="h-3 w-3 text-gray-400" strokeWidth={1.5} />
                          <span className="text-sm font-light text-gray-600">{vault.investors}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-1 text-right">
                        <ArrowUpRight className="h-4 w-4 text-gray-300" strokeWidth={1.5} />
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