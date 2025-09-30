"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, Plus, Zap, CheckCircle2, Clock, XCircle, Play, Pause, X, DollarSign, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useStreaming } from "@/hooks/useStreaming"
import { parseAptAmount, STREAM_STATUS } from "@/config/aptos"
import toast from "react-hot-toast"

export default function Streams() {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("sent")
  const { connected, account } = useWallet()
  const {
    sentStreams,
    receivedStreams,
    createStream,
    withdrawFromStream,
    pauseStream,
    resumeStream,
    cancelStream,
    loading,
    fetchUserStreams
  } = useStreaming()

  // Form states
  const [formData, setFormData] = useState({
    receiver: "",
    amount: "",
    duration: "30", // days
    name: ""
  })

  useEffect(() => {
    if (connected) {
      fetchUserStreams()
    }
  }, [connected, fetchUserStreams])

  const handleCreateStream = async () => {
    if (!connected) {
      toast.error("Please connect your wallet to create a stream")
      return
    }

    setIsCreating(true)
    try {
      const totalAmount = parseFloat(formData.amount)
      const durationInSeconds = parseInt(formData.duration) * 24 * 60 * 60
      
      await createStream({
        receiver: formData.receiver,
        totalAmount: totalAmount,
        durationSeconds: durationInSeconds,
        streamName: formData.name || `Stream to ${formData.receiver.slice(0, 6)}...`
      })
      
      toast.success(`Stream created! Streaming ${formData.amount} APT over ${formData.duration} days`)
      
      setOpen(false)
      setFormData({ receiver: "", amount: "", duration: "30", name: "" })
      fetchUserStreams()
    } catch (error: any) {
      toast.error(error.message || "Failed to create stream")
    } finally {
      setIsCreating(false)
    }
  }

  const handleWithdraw = async (streamId: number) => {
    try {
      await withdrawFromStream(streamId)
      toast.success("Withdrawal successful!")
      fetchUserStreams()
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed")
    }
  }

  const handlePause = async (streamId: number) => {
    try {
      await pauseStream(streamId)
      toast.success("Stream paused successfully")
      fetchUserStreams()
    } catch (error: any) {
      toast.error(error.message || "Failed to pause stream")
    }
  }

  const handleResume = async (streamId: number) => {
    try {
      await resumeStream(streamId)
      toast.success("Stream resumed successfully")
      fetchUserStreams()
    } catch (error: any) {
      toast.error(error.message || "Failed to resume stream")
    }
  }

  const handleCancel = async (streamId: number) => {
    try {
      await cancelStream(streamId)
      toast.success("Stream cancelled and funds returned")
      fetchUserStreams()
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel stream")
    }
  }

  const getStreamProgress = (stream: any) => {
    const now = Date.now() / 1000
    const duration = stream.endTime - stream.startTime
    const elapsed = Math.min(now - stream.startTime, duration)
    return (elapsed / duration) * 100
  }

  const getStreamStatus = (status: number) => {
    switch(status) {
      case STREAM_STATUS.ACTIVE: return { text: "Active", color: "text-green-500" }
      case STREAM_STATUS.PAUSED: return { text: "Paused", color: "text-yellow-500" }
      case STREAM_STATUS.CANCELLED: return { text: "Cancelled", color: "text-red-500" }
      case STREAM_STATUS.COMPLETED: return { text: "Completed", color: "text-gray-500" }
      default: return { text: "Unknown", color: "text-gray-500" }
    }
  }

  // Calculate total streaming value
  const totalStreamingValue = sentStreams.reduce((acc, stream) => {
    if (stream.status === STREAM_STATUS.ACTIVE) {
      return acc + stream.totalAmount
    }
    return acc
  }, 0)

  const totalReceivedValue = receivedStreams.reduce((acc, stream) => {
    if (stream.status === STREAM_STATUS.ACTIVE) {
      const withdrawable = stream.totalAmount - stream.withdrawnAmount
      return acc + withdrawable
    }
    return acc
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 flex flex-col">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-300">
                <ArrowLeft className="h-5 w-5 text-primary/70" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-extralight text-gray-900">Payroll Streams</h1>
              <p className="text-sm text-gray-500 font-light">Real-time salary streaming</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                className="gap-2 bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300"
                disabled={!connected}
              >
                <Plus className="h-4 w-4" />
                Create Stream
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Stream</DialogTitle>
                <DialogDescription>
                  Stream APT tokens over time to any wallet
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="receiver">Recipient Wallet Address</Label>
                  <Input 
                    id="receiver" 
                    placeholder="0x..." 
                    value={formData.receiver}
                    onChange={(e) => setFormData({...formData, receiver: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount (APT)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="100" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Stream Duration</Label>
                  <Select 
                    value={formData.duration} 
                    onValueChange={(value) => setFormData({...formData, duration: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Stream Name (Optional)</Label>
                  <Input 
                    id="name" 
                    placeholder="Monthly salary, Freelance payment, etc." 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                {formData.amount && formData.duration && (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Stream rate: ~{(parseFloat(formData.amount) / parseInt(formData.duration)).toFixed(4)} APT per day
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateStream} disabled={isCreating || !formData.receiver || !formData.amount}>
                  {isCreating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
                  ) : (
                    "Create Stream"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {connected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary/70 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="font-light text-lg text-gray-900">Total Streaming Out</div>
                    <div className="text-2xl font-light text-primary">{totalStreamingValue.toFixed(2)} APT</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-light">
                  {sentStreams.filter(s => s.status === STREAM_STATUS.ACTIVE).length} active streams
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-light text-lg text-gray-900">Available to Withdraw</div>
                    <div className="text-2xl font-light text-green-600">{totalReceivedValue.toFixed(2)} APT</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-light">
                  {receivedStreams.filter(s => s.status === STREAM_STATUS.ACTIVE).length} incoming streams
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-border/30 rounded-xl">
            <TabsTrigger value="sent" className="font-light">Sent Streams</TabsTrigger>
            <TabsTrigger value="received" className="font-light">Received Streams</TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="space-y-4">
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
              sentStreams.map((stream) => {
                const status = getStreamStatus(stream.status)
                const progress = getStreamProgress(stream)
                return (
                  <Card key={stream.streamId} className="bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-light mb-1 text-gray-900">
                            {stream.streamName || `Stream to ${stream.receiver.slice(0, 6)}...${stream.receiver.slice(-4)}`}
                          </div>
                          <div className="text-sm text-gray-500 font-light">To: {stream.receiver.slice(0, 8)}...{stream.receiver.slice(-6)}</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {stream.status === STREAM_STATUS.ACTIVE && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          )}
                          <span className={`font-light ${status.color}`}>{status.text}</span>
                        </div>
                      </div>
                      
                      {stream.status === STREAM_STATUS.ACTIVE && (
                        <>
                          <Progress value={progress} className="mb-2" />
                          <div className="flex justify-between text-sm mb-4">
                            <span className="text-gray-500 font-light">
                              {stream.withdrawnAmount.toFixed(2)} of {stream.totalAmount.toFixed(2)} APT
                            </span>
                            <span className="font-light text-gray-900">{progress.toFixed(1)}%</span>
                          </div>
                        </>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                        <div>
                          <span className="font-light">Rate: </span>
                          <span>{(stream.amountPerSecond * 86400).toFixed(4)} APT/day</span>
                        </div>
                        <div>
                          <span className="font-light">End: </span>
                          <span>{new Date(stream.endTime * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {stream.status === STREAM_STATUS.ACTIVE && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 border-border/30 hover:bg-primary/5 font-light transition-all duration-300"
                              onClick={() => handlePause(stream.streamId)}
                            >
                              <Pause className="h-3 w-3 mr-1" /> Pause
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 border-red-200 hover:bg-red-50 text-red-600 font-light transition-all duration-300"
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
                              className="flex-1 border-border/30 hover:bg-primary/5 font-light transition-all duration-300"
                              onClick={() => handleResume(stream.streamId)}
                            >
                              <Play className="h-3 w-3 mr-1" /> Resume
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 border-red-200 hover:bg-red-50 text-red-600 font-light transition-all duration-300"
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
              })
            )}
          </TabsContent>

          <TabsContent value="received" className="space-y-4">
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
              receivedStreams.map((stream) => {
                const status = getStreamStatus(stream.status)
                const progress = getStreamProgress(stream)
                const withdrawable = Math.max(0, 
                  (stream.totalAmount * progress / 100) - stream.withdrawnAmount
                )
                
                return (
                  <Card key={stream.streamId} className="bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-light mb-1 text-gray-900">
                            {stream.streamName || `Stream from ${stream.sender.slice(0, 6)}...${stream.sender.slice(-4)}`}
                          </div>
                          <div className="text-sm text-gray-500 font-light">From: {stream.sender.slice(0, 8)}...{stream.sender.slice(-6)}</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {stream.status === STREAM_STATUS.ACTIVE && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          )}
                          <span className={`font-light ${status.color}`}>{status.text}</span>
                        </div>
                      </div>
                      
                      {stream.status === STREAM_STATUS.ACTIVE && (
                        <>
                          <Progress value={progress} className="mb-2" />
                          <div className="flex justify-between text-sm mb-4">
                            <span className="text-gray-500 font-light">
                              Withdrawn: {stream.withdrawnAmount.toFixed(2)} of {stream.totalAmount.toFixed(2)} APT
                            </span>
                            <span className="font-light text-gray-900">{progress.toFixed(1)}%</span>
                          </div>
                        </>
                      )}
                      
                      <div className="p-3 bg-green-50 rounded-lg mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Available to withdraw:</span>
                          <span className="font-semibold text-green-600">{withdrawable.toFixed(4)} APT</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-green-200 hover:bg-green-50 text-green-600 font-light transition-all duration-300"
                          onClick={() => handleWithdraw(stream.streamId)}
                          disabled={withdrawable <= 0 || stream.status !== STREAM_STATUS.ACTIVE}
                        >
                          <DollarSign className="h-3 w-3 mr-1" /> Withdraw
                        </Button>
                        <Link href="/vault" className="flex-1">
                          <Button variant="ghost" size="sm" className="w-full text-xs font-light hover:bg-primary/5 transition-all duration-300">
                            Move to Vault
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}