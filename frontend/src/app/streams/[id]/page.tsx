"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Header } from "@/components/ui/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Building2, Users, Box, Building, BarChart3, Pause, Play, Wallet, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useParams } from 'next/navigation'
import { useStreaming } from "@/hooks/useStreaming"
import { STREAM_STATUS } from "@/config/aptos"
import { Stream } from "@/services/streaming.service"
import toast from "react-hot-toast"

// Fallback stream data for demo purposes
const fallbackStreamsData = [
  { 
    id: 1,
    recipient: "Sole",
    icon: Building2,
    amount: "0.00",
    currency: "APT",
    totalAmount: "0.01",
    rate: "0.0000 APT/day",
    status: "active",
    progress: 0,
    details: {
      totalStreamed: "0.00 APT",
      totalAmount: "0.01 APT",
      remaining: "0.01 APT",
      startDate: "2024-01-15",
      endDate: "30/10/2025",
      nextPayment: "2024-02-01",
      recipientAddress: "0xdf8921...c2c568"
    }
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
    apy: "3.58%",
    details: {
      totalStreamed: "$450.00",
      totalAmount: "$1000.00",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      nextPayment: "2024-02-15",
      recipientAddress: "0x9fc1...3e2d"
    }
  },
  { 
    id: 3,
    recipient: "Remote Workers",
    icon: Box,
    amount: "65.2M",
    currency: "USDC",
    value: "$65.2M",
    rate: "$8,200/mo",
    status: "active",
    progress: 77,
    apy: "10.61%",
    details: {
      totalStreamed: "$65.20",
      totalAmount: "$82.00",
      startDate: "2024-01-10",
      endDate: "2024-04-10",
      nextPayment: "2024-02-10",
      recipientAddress: "0x1a3b...7c5e"
    }
  },
  { 
    id: 4,
    recipient: "DAO Treasury",
    icon: Building,
    amount: "7.56M",
    currency: "suiUSDT",
    value: "$7.56M",
    rate: "$50,000/mo",
    status: "active",
    progress: 77,
    apy: "27.27%",
    details: {
      totalStreamed: "$756.00",
      totalAmount: "$5000.00",
      startDate: "2023-12-01",
      endDate: "2024-12-01",
      nextPayment: "2024-03-01",
      recipientAddress: "0x8df2...1b4c"
    }
  },
  { 
    id: 5,
    recipient: "Marketing Fund",
    icon: BarChart3,
    amount: "7.32M",
    currency: "AUSD",
    value: "$7.32M",
    rate: "$25,000/wk",
    status: "paused",
    progress: 0,
    apy: "7.65%",
    details: {
      totalStreamed: "$0.00",
      totalAmount: "$25000.00",
      startDate: "2024-03-01",
      endDate: "2024-12-31",
      nextPayment: "Paused",
      recipientAddress: "0x5ea9...9d2f"
    }
  }
]

export default function StreamDetails() {
  const params = useParams()
  const { account } = useWallet()
  const streamId = parseInt(params.id as string)
  const { 
    sentStreams, 
    receivedStreams, 
    loading, 
    pauseStream, 
    resumeStream, 
    withdrawFromStream, 
    cancelStream,
    streamingService 
  } = useStreaming()
  
  const [stream, setStream] = useState<Stream | null>(null)
  const [withdrawableAmount, setWithdrawableAmount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Find stream from user's streams or fetch from blockchain
  useEffect(() => {
    const findStream = async () => {
      if (!account) {
        setIsLoading(false)
        return
      }

      // First try to find in user's sent/received streams
      let foundStream: Stream | null = sentStreams.find(s => s.streamId === streamId) || 
                                      receivedStreams.find(s => s.streamId === streamId) || null

      if (!foundStream && streamId) {
        // If not found, try to fetch directly from blockchain
        try {
          foundStream = await streamingService.getStreamInfo(streamId)
        } catch (error) {
          console.error("Error fetching stream:", error)
        }
      }

      setStream(foundStream || null)
      
      if (foundStream) {
        // Get withdrawable amount
        try {
          const withdrawable = await streamingService.getWithdrawableAmount(streamId)
          setWithdrawableAmount(withdrawable)
        } catch (error) {
          console.error("Error fetching withdrawable amount:", error)
        }
      }
      
      setIsLoading(false)
    }

    findStream()
  }, [account, streamId, sentStreams, receivedStreams, streamingService])

  const handlePauseResume = async () => {
    if (!stream || !account) return
    
    try {
      setActionLoading(true)
      if (stream.status === STREAM_STATUS.ACTIVE) {
        await pauseStream(streamId)
        toast.success("Stream paused successfully")
      } else if (stream.status === STREAM_STATUS.PAUSED) {
        await resumeStream(streamId)
        toast.success("Stream resumed successfully")
      }
    } catch (error) {
      console.error("Error toggling stream:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!stream || !account) return
    
    try {
      setActionLoading(true)
      await withdrawFromStream(streamId)
      toast.success("Withdrawal successful")
    } catch (error) {
      console.error("Error withdrawing:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!stream || !account) return
    
    try {
      setActionLoading(true)
      await cancelStream(streamId)
      toast.success("Stream cancelled successfully")
    } catch (error) {
      console.error("Error cancelling stream:", error)
    } finally {
      setActionLoading(false)
    }
  }

  // Format helpers
  const formatAptAmount = (amount: number) => amount.toFixed(4)
  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString()
  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`
  
  const calculateProgress = () => {
    if (!stream) return 0
    const now = Date.now() / 1000
    const duration = stream.endTime - stream.startTime
    const elapsed = Math.min(now - stream.startTime, duration)
    return Math.max(0, Math.min(100, (elapsed / duration) * 100))
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case STREAM_STATUS.ACTIVE: return "Active"
      case STREAM_STATUS.PAUSED: return "Paused"
      case STREAM_STATUS.CANCELLED: return "Cancelled"
      case STREAM_STATUS.COMPLETED: return "Completed"
      default: return "Unknown"
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case STREAM_STATUS.ACTIVE: return "bg-green-50 text-green-600"
      case STREAM_STATUS.PAUSED: return "bg-yellow-50 text-yellow-600"
      case STREAM_STATUS.CANCELLED: return "bg-red-50 text-red-600"
      case STREAM_STATUS.COMPLETED: return "bg-blue-50 text-blue-600"
      default: return "bg-gray-50 text-gray-600"
    }
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Connect your wallet to view stream details</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Stream not found</p>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()
  const isUserSender = stream.sender === account.address
  const isUserReceiver = stream.receiver === account.address

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-300">
              <ArrowLeft className="h-5 w-5 text-primary/70" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">Stream Details</h1>
            <p className="text-sm text-gray-500 font-light">Manage your payment stream</p>
          </div>
        </div>

        <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-light text-gray-900">{stream.streamName || `Stream ${stream.streamId}`}</h2>
                  <p className="text-sm text-gray-500 font-light">Stream #{stream.streamId}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(stream.status)} border-0`}>
                {getStatusLabel(stream.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">Total Amount</div>
                <div className="text-2xl font-extralight text-gray-900">{formatAptAmount(stream.totalAmount)} APT</div>
                <div className="text-sm text-gray-400 font-light">Streaming Amount</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">Streaming Rate</div>
                <div className="text-2xl font-extralight text-gray-900">{formatAptAmount(stream.amountPerSecond * 86400)} APT/day</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">Progress</div>
                <div className="text-2xl font-extralight text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" />
                  {progress.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-border/50 shadow-sm rounded-xl">
            <CardContent className="pt-6">
              <h3 className="text-lg font-light mb-6">Stream Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500 font-light">Progress</span>
                    <span className="text-sm font-light">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-light">Streamed</span>
                    <span className="text-sm font-light">{formatAptAmount(stream.withdrawnAmount)} APT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-light">Remaining</span>
                    <span className="text-sm font-light">{formatAptAmount(stream.totalAmount - stream.withdrawnAmount)} APT</span>
                  </div>
                  {isUserReceiver && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 font-light">Available to Withdraw</span>
                      <span className="text-sm font-light text-green-600">{formatAptAmount(withdrawableAmount)} APT</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm rounded-xl">
            <CardContent className="pt-6">
              <h3 className="text-lg font-light mb-6">Stream Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Sender</span>
                  <span className="text-sm font-mono">{formatAddress(stream.sender)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Recipient</span>
                  <span className="text-sm font-mono">{formatAddress(stream.receiver)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Start Date</span>
                  <span className="text-sm font-light">{formatDate(stream.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">End Date</span>
                  <span className="text-sm font-light">{formatDate(stream.endTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Last Withdrawal</span>
                  <span className="text-sm font-light">{formatDate(stream.lastWithdrawalTime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          {/* Withdraw Button - Only show for receiver with withdrawable amount */}
          {isUserReceiver && withdrawableAmount > 0 && (
            <Button 
              onClick={handleWithdraw}
              disabled={actionLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-light"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              Withdraw Funds
            </Button>
          )}
          
          {/* Pause Button - Only show for sender with active streams */}
          {isUserSender && stream.status === STREAM_STATUS.ACTIVE && (
            <Button 
              onClick={handlePauseResume}
              disabled={actionLoading}
              variant="outline" 
              className="flex-1 border-border/50 hover:bg-gray-50 font-light"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Pause className="h-4 w-4 mr-2" />
              )}
              Pause
            </Button>
          )}
          
          {/* Resume Button - Only show for sender with paused streams */}
          {isUserSender && stream.status === STREAM_STATUS.PAUSED && (
            <Button 
              onClick={handlePauseResume}
              disabled={actionLoading}
              variant="outline" 
              className="flex-1 border-border/50 hover:bg-gray-50 font-light"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Resume
            </Button>
          )}
          
          {/* Cancel Button - Only show for sender if stream is not cancelled/completed */}
          {isUserSender && (stream.status === STREAM_STATUS.ACTIVE || stream.status === STREAM_STATUS.PAUSED) && (
            <Button 
              onClick={handleCancel}
              disabled={actionLoading}
              variant="outline" 
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-light"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}