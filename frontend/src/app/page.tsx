"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { 
  Users, 
  Building2,
  Globe2,
  Landmark,
  Loader2
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Badge } from "@/components/ui/badge"
import { useStreaming } from "@/hooks/useStreaming"
import { STREAM_STATUS } from "@/config/aptos"
import Link from "next/link"
import { LiveIndicator, AnimatedNumber } from "@/components/ui/live-indicator"

interface DisplayStream {
  id: number
  recipient: string
  address: string
  icon: any
  amount: string
  currency: string
  totalAmount: string
  rate: string
  status: string
  progress: number
  endDate: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("streams")
  const { account } = useWallet()
  const { 
    sentStreams, 
    receivedStreams, 
    loading, 
    fetchUserStreams
  } = useStreaming()

  // Convert blockchain stream data to display format
  const formatStreamForDisplay = (stream: any, index: number): DisplayStream => {
    const icons = [Building2, Users, Globe2, Landmark]
    const getIcon = () => icons[index % icons.length]
    
    const getStatusString = (status: number): string => {
      switch (status) {
        case STREAM_STATUS.ACTIVE: return "active"
        case STREAM_STATUS.PAUSED: return "paused"
        case STREAM_STATUS.CANCELLED: return "cancelled"
        case STREAM_STATUS.COMPLETED: return "completed"
        default: return "unknown"
      }
    }

    const formatAddress = (addr: string): string => {
      if (addr.length < 12) return addr
      return `${addr.slice(0, 8)}...${addr.slice(-6)}`
    }

    const formatDate = (timestamp: number): string => {
      const date = new Date(timestamp * 1000)
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    }

    const calculateProgress = (): number => {
      const now = Date.now() / 1000
      const duration = stream.endTime - stream.startTime
      const elapsed = Math.min(now - stream.startTime, duration)
      return Math.max(0, Math.min(100, (elapsed / duration) * 100))
    }

    return {
      id: stream.streamId,
      recipient: stream.streamName || `Stream ${stream.streamId}`,
      address: formatAddress(stream.receiver),
      icon: getIcon(),
      amount: stream.withdrawnAmount.toFixed(4),
      currency: "APT",
      totalAmount: stream.totalAmount.toFixed(4),
      rate: `${(stream.amountPerSecond * 86400).toFixed(4)} APT/day`,
      status: getStatusString(stream.status),
      progress: calculateProgress(),
      endDate: formatDate(stream.endTime)
    }
  }

  // Calculate stats from real blockchain data
  const calculateStats = () => {
    const totalStreamingOut = sentStreams.reduce((sum, stream) => sum + stream.totalAmount, 0)
    const activeStreamCount = sentStreams.filter(stream => stream.status === STREAM_STATUS.ACTIVE).length
    const availableToWithdraw = receivedStreams.reduce((sum, stream) => {
      // This would need to be calculated with withdrawable amounts
      return sum + (stream.totalAmount - stream.withdrawnAmount)
    }, 0)

    return {
      totalVolume: totalStreamingOut,
      activeStreams: activeStreamCount,
      totalRemittance: availableToWithdraw
    }
  }

  const stats = account ? calculateStats() : {
    totalVolume: 0,
    activeStreams: 0,
    totalRemittance: 0
  }

  // Format streams for display
  const displayStreams = sentStreams.map((stream, index) => formatStreamForDisplay(stream, index))

  // Refresh data periodically with reduced frequency
  useEffect(() => {
    if (account) {
      const interval = setInterval(() => {
        fetchUserStreams(false) // Don't force, respect cooldown
      }, 60000) // Refresh every 60 seconds (reduced from 30)

      return () => clearInterval(interval)
    }
  }, [account, fetchUserStreams])


  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1">
        {/* Stats Header */}
        <div className="bg-teal-800">
          <div className="max-w-screen-xl mx-auto px-8 py-12">
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-base font-light text-slate-300 uppercase tracking-widest">MAIN MARKET</h1>
              <LiveIndicator className="text-white" />
            </div>
            
            <div className="grid grid-cols-3 gap-12">
              <div>
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-light">Total Streaming Out</p>
                <AnimatedNumber 
                  value={stats.totalVolume} 
                  decimals={4} 
                  suffix=" APT"
                  className="text-4xl font-extralight tracking-tight text-white"
                />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-light">Active Streams</p>
                <AnimatedNumber 
                  value={stats.activeStreams} 
                  decimals={0}
                  className="text-4xl font-extralight tracking-tight text-white"
                />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-light">Available to Withdraw</p>
                <AnimatedNumber 
                  value={stats.totalRemittance} 
                  decimals={4} 
                  suffix=" APT"
                  className="text-4xl font-extralight tracking-tight text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-teal-800 sticky top-16 z-10">
          <div className="max-w-screen-xl mx-auto px-8">
            <div className="flex justify-between items-center border-b border-teal-700">
              <div className="flex gap-12">
                <button
                  onClick={() => setActiveTab("streams")}
                  className={`py-6 text-xs font-light border-b-2 transition-all uppercase tracking-wider ${
                    activeTab === "streams" 
                      ? "text-white border-white" 
                      : "text-white/70 border-transparent hover:text-white"
                  }`}
                >
                  Payment Streams
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`py-6 text-xs font-light border-b-2 transition-all uppercase tracking-wider ${
                    activeTab === "history"
                      ? "text-white border-white"
                      : "text-white/70 border-transparent hover:text-white"
                  }`}
                >
                  History
                </button>
              </div>
              {activeTab === "streams" && (
                <Link href="/streams">
                  <button className="bg-white text-teal-800 px-4 py-2 rounded-lg text-sm font-light hover:bg-gray-100 transition-colors uppercase tracking-wider">
                    Create Stream
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>


        {/* Content Tables */}
        <div className="max-w-screen-xl mx-auto px-8 py-6">
          {!account ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Connect your wallet to view your streams</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activeTab === "streams" ? (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-gray-400 uppercase tracking-wider font-light">
                <div className="col-span-4">Recipient</div>
                <div className="col-span-3 text-right">Amount</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-1 text-right">Status</div>
              </div>

              {/* Table Rows */}
              {displayStreams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No streams found</p>
                </div>
              ) : (
                displayStreams.map((stream) => (
                  <Link href={`/streams/${stream.id}`} key={stream.id}>
                    <Card className="bg-white border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer p-6 mb-3">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                            <stream.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm font-normal text-gray-900">{stream.recipient}</p>
                            <p className="text-xs text-gray-400 font-light">{stream.address}</p>
                          </div>
                        </div>
                        
                        <div className="col-span-3 text-right">
                          <p className="text-sm font-light text-gray-900">{stream.amount} of {stream.totalAmount} {stream.currency}</p>
                          <p className="text-xs text-gray-400 font-light">Total Amount</p>
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
                            <span className="text-xs font-light text-gray-500">{stream.progress.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className="col-span-1 text-right">
                          <p className="text-xs text-gray-400 font-light">End: {stream.endDate}</p>
                          {stream.status === "active" ? (
                            <div className="text-xs text-green-600 mt-1">Active</div>
                          ) : stream.status === "paused" ? (
                            <div className="text-xs text-yellow-600 mt-1">Paused</div>
                          ) : stream.status === "cancelled" ? (
                            <div className="text-xs text-red-600 mt-1">Cancelled</div>
                          ) : (
                            <div className="text-xs text-blue-600 mt-1">Completed</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Sent Streams Section */}
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4">Sent Streams</h3>
                <div className="space-y-3">
                  {sentStreams.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No sent streams found</p>
                    </div>
                  ) : (
                    sentStreams.map((stream, index) => {
                      const displayStream = formatStreamForDisplay(stream, index)
                      return (
                        <Card key={`sent-${stream.streamId}`} className="bg-white border-gray-100 p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                                <displayStream.icon className="h-5 w-5 text-red-600" strokeWidth={1.5} />
                              </div>
                              <div>
                                <p className="text-sm font-normal text-gray-900">{displayStream.recipient}</p>
                                <p className="text-xs text-gray-400 font-light">{displayStream.address}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-light text-gray-900">{displayStream.totalAmount} {displayStream.currency}</p>
                              <p className="text-xs text-gray-400 font-light">Sent</p>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Received Streams Section */}
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4">Received Streams</h3>
                <div className="space-y-3">
                  {receivedStreams.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No received streams found</p>
                    </div>
                  ) : (
                    receivedStreams.map((stream, index) => {
                      const displayStream = formatStreamForDisplay(stream, index)
                      return (
                        <Card key={`received-${stream.streamId}`} className="bg-white border-gray-100 p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                                <displayStream.icon className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                              </div>
                              <div>
                                <p className="text-sm font-normal text-gray-900">From {displayStream.recipient}</p>
                                <p className="text-xs text-gray-400 font-light">{displayStream.address}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-light text-gray-900">{displayStream.totalAmount} {displayStream.currency}</p>
                              <p className="text-xs text-gray-400 font-light">Received</p>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}