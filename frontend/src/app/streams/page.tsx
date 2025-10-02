"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, Users, Box, Building, BarChart3,
  Plus, Pause, Play, X, DollarSign, Zap,
  TrendingUp, Clock, ArrowLeft, Loader2
} from "lucide-react"
import Link from "next/link"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useStreaming } from "@/hooks/useStreaming"
import { STREAM_STATUS } from "@/config/aptos"
import toast from "react-hot-toast"

function StreamsContent() {
  const { connected } = useWallet()
  const searchParams = useSearchParams()
  const { 
    loading,
    sentStreams,
    receivedStreams,
    createStream,
    pauseStream,
    resumeStream,
    cancelStream,
    withdrawFromStream
  } = useStreaming()

  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent")
  const [formData, setFormData] = useState({
    receiver: "",
    amount: "100",
    duration: "30",
    durationType: "days",
    name: ""
  })

  // Handle AI-driven parameters from URL
  useEffect(() => {
    const action = searchParams.get('action')
    const recipient = searchParams.get('recipient')
    const amount = searchParams.get('amount')
    const duration = searchParams.get('duration')
    const token = searchParams.get('token')
    const aiIntent = searchParams.get('ai')

    if (aiIntent === 'true' || action === 'create') {
      // Parse duration string (e.g., "30 days", "2 months")
      let durationValue = "30"
      let durationType = "days"
      
      if (duration) {
        const durationMatch = duration.match(/(\d+)\s*(day|hour|month|week|year)/i)
        if (durationMatch) {
          durationValue = durationMatch[1]
          const unit = durationMatch[2].toLowerCase()
          // Map to select options
          if (unit === 'day' || unit === 'week') {
            durationType = 'days'
            if (unit === 'week') {
              durationValue = String(parseInt(durationMatch[1]) * 7)
            }
          } else if (unit === 'hour') {
            durationType = 'hours'
          } else if (unit === 'month' || unit === 'year') {
            durationType = 'months'
            if (unit === 'year') {
              durationValue = String(parseInt(durationMatch[1]) * 12)
            }
          }
        }
      }

      setFormData({
        receiver: recipient || "",
        amount: amount || "100",
        duration: durationValue,
        durationType: durationType as any,
        name: `AI Stream to ${recipient?.slice(0, 6) || 'recipient'}...`
      })
      
      // Auto-open the dialog if AI sent the user here
      if (aiIntent === 'true') {
        setOpen(true)
        toast.success("AI has pre-filled the stream details. Please review and confirm.")
      }
    }
  }, [searchParams])

  const handleCreateStream = async () => {
    if (!connected) {
      toast.error("Please connect your wallet")
      return
    }

    try {
      const durationInSeconds = formData.durationType === "days" 
        ? parseInt(formData.duration) * 86400
        : formData.durationType === "hours"
        ? parseInt(formData.duration) * 3600
        : parseInt(formData.duration) * 2592000 // months

      const totalAmount = parseFloat(formData.amount)

      await createStream({
        receiver: formData.receiver,
        totalAmount: totalAmount,
        durationSeconds: durationInSeconds,
        streamName: formData.name || `Stream to ${formData.receiver.slice(0, 6)}...`
      })

      setOpen(false)
      setFormData({
        receiver: "",
        amount: "100",
        duration: "30",
        durationType: "days",
        name: ""
      })
    } catch (error: any) {
      console.error("Failed to create stream:", error)
      toast.error(error.message || "Failed to create stream")
    }
  }

  const handlePause = async (streamId: number) => {
    try {
      await pauseStream(streamId)
    } catch (error: any) {
      toast.error(error.message || "Failed to pause stream")
    }
  }

  const handleResume = async (streamId: number) => {
    try {
      await resumeStream(streamId)
    } catch (error: any) {
      toast.error(error.message || "Failed to resume stream")
    }
  }

  const handleCancel = async (streamId: number) => {
    try {
      await cancelStream(streamId)
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel stream")
    }
  }

  const handleWithdraw = async (streamId: number) => {
    try {
      await withdrawFromStream(streamId)
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw")
    }
  }

  const getStreamProgress = (stream: any) => {
    const now = Date.now() / 1000
    const duration = stream.endTime - stream.startTime
    const elapsed = Math.min(now - stream.startTime, duration)
    return (elapsed / duration) * 100
  }

  const getStatusBadge = (status: number) => {
    switch(status) {
      case STREAM_STATUS.ACTIVE:
        return <Badge className="bg-green-50 text-green-600 border-0">Active</Badge>
      case STREAM_STATUS.PAUSED:
        return <Badge className="bg-yellow-50 text-yellow-600 border-0">Paused</Badge>
      case STREAM_STATUS.CANCELLED:
        return <Badge className="bg-red-50 text-red-600 border-0">Cancelled</Badge>
      case STREAM_STATUS.COMPLETED:
        return <Badge className="bg-gray-50 text-gray-600 border-0">Completed</Badge>
      default:
        return null
    }
  }

  const getStreamIcon = (name: string) => {
    if (name.toLowerCase().includes("payroll") || name.toLowerCase().includes("team")) {
      return Building2
    } else if (name.toLowerCase().includes("contractor")) {
      return Users
    } else if (name.toLowerCase().includes("dao") || name.toLowerCase().includes("treasury")) {
      return Building
    } else if (name.toLowerCase().includes("marketing")) {
      return BarChart3
    } else {
      return Box
    }
  }

  const totalStreamingOut = sentStreams
    .filter(s => s.status === STREAM_STATUS.ACTIVE)
    .reduce((acc, s) => acc + s.totalAmount, 0)

  const totalAvailableWithdraw = receivedStreams
    .filter(s => s.status === STREAM_STATUS.ACTIVE)
    .reduce((acc, s) => {
      const progress = getStreamProgress(s)
      return acc + (s.totalAmount * progress / 100) - s.withdrawnAmount
    }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Payroll Streams</h1>
            <p className="text-sm text-gray-500 font-light mt-1">Real-time salary streaming</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Stream
              </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create New Stream</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Stream APT tokens over time to any wallet
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="receiver" className="text-foreground">Recipient Wallet Address</Label>
                  <Input 
                    id="receiver" 
                    placeholder="0x..." 
                    value={formData.receiver}
                    onChange={(e) => setFormData({...formData, receiver: e.target.value})}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-foreground">Total Amount (APT)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="100" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-foreground">Stream Duration</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="duration" 
                      type="number" 
                      placeholder="30" 
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="flex-1 border-border focus:border-primary"
                    />
                    <Select 
                      value={formData.durationType}
                      onValueChange={(value) => setFormData({...formData, durationType: value})}
                    >
                      <SelectTrigger className="w-[120px] border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Stream Name (Optional)</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Team Payroll" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="border-border focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)} className="border-border">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateStream} 
                  disabled={!formData.receiver || !formData.amount}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Create Stream
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-light">Total Streaming Out</div>
                  <div className="text-2xl font-light text-gray-900">{totalStreamingOut.toFixed(2)} APT</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {sentStreams.filter(s => s.status === STREAM_STATUS.ACTIVE).length} active streams
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-light">Available to Withdraw</div>
                  <div className="text-2xl font-light text-gray-900">{totalAvailableWithdraw.toFixed(2)} APT</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {receivedStreams.filter(s => s.status === STREAM_STATUS.ACTIVE).length} incoming streams
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sent" | "received")}>
          <TabsList className="bg-white border border-border/30">
            <TabsTrigger value="sent">Sent Streams</TabsTrigger>
            <TabsTrigger value="received">Received Streams</TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sentStreams.length === 0 ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-gray-500">No streams created yet</p>
                  <Button 
                    onClick={() => setOpen(true)} 
                    className="mt-4"
                    disabled={!connected}
                  >
                    Create your first stream
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sentStreams.map((stream) => {
                  const progress = getStreamProgress(stream)
                  const Icon = getStreamIcon(stream.streamName)
                  const ratePerDay = stream.amountPerSecond * 86400

                  return (
                    <Card key={stream.streamId} className="bg-white border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {stream.streamName || `Stream to ${stream.receiver.slice(0, 6)}...`}
                              </h3>
                              <p className="text-sm text-gray-500">To: {stream.receiver.slice(0, 8)}...{stream.receiver.slice(-6)}</p>
                            </div>
                          </div>
                          {getStatusBadge(stream.status)}
                        </div>

                        {stream.status === STREAM_STATUS.ACTIVE && (
                          <>
                            <Progress value={progress} className="h-2 mb-3" />
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-sm text-gray-500">
                                {stream.withdrawnAmount.toFixed(2)} of {stream.totalAmount.toFixed(2)} APT
                              </span>
                              <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                            </div>
                          </>
                        )}

                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                          <span>Rate: {ratePerDay.toFixed(4)} APT/day</span>
                          <span>End: {new Date(stream.endTime * 1000).toLocaleDateString()}</span>
                        </div>

                        <div className="flex gap-2">
                          {stream.status === STREAM_STATUS.ACTIVE && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handlePause(stream.streamId)}
                              >
                                <Pause className="h-3 w-3 mr-1" /> Pause
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-red-600 hover:bg-red-50"
                                onClick={() => handleCancel(stream.streamId)}
                              >
                                <X className="h-3 w-3 mr-1" /> Cancel
                              </Button>
                            </>
                          )}
                          {stream.status === STREAM_STATUS.PAUSED && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleResume(stream.streamId)}
                              >
                                <Play className="h-3 w-3 mr-1" /> Resume
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 text-red-600 hover:bg-red-50"
                                onClick={() => handleCancel(stream.streamId)}
                              >
                                <X className="h-3 w-3 mr-1" /> Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : receivedStreams.length === 0 ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-gray-500">No incoming streams</p>
                  <p className="text-sm text-gray-400 mt-2">Share your wallet address to receive streams</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {receivedStreams.map((stream) => {
                  const progress = getStreamProgress(stream)
                  const Icon = getStreamIcon(stream.streamName)
                  const withdrawable = Math.max(0, 
                    (stream.totalAmount * progress / 100) - stream.withdrawnAmount
                  )

                  return (
                    <Card key={stream.streamId} className="bg-white border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/20 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {stream.streamName || `Stream from ${stream.sender.slice(0, 6)}...`}
                              </h3>
                              <p className="text-sm text-gray-500">From: {stream.sender.slice(0, 8)}...{stream.sender.slice(-6)}</p>
                            </div>
                          </div>
                          {getStatusBadge(stream.status)}
                        </div>

                        {stream.status === STREAM_STATUS.ACTIVE && (
                          <>
                            <Progress value={progress} className="h-2 mb-3" />
                            <div className="p-3 bg-green-50 rounded-lg mb-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Available to withdraw:</span>
                                <span className="font-semibold text-green-600">{withdrawable.toFixed(4)} APT</span>
                              </div>
                            </div>
                          </>
                        )}

                        <Button 
                          className="w-full"
                          onClick={() => handleWithdraw(stream.streamId)}
                          disabled={withdrawable <= 0 || stream.status !== STREAM_STATUS.ACTIVE}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Withdraw Funds
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function Streams() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StreamsContent />
    </Suspense>
  )
}