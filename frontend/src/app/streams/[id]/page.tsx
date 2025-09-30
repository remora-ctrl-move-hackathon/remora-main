"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Building2, Users, Box, Building, ChartBar, Pause, Play, Wallet } from "lucide-react"
import Link from "next/link"
import { useParams } from 'next/navigation'

// Stream data - in production this would come from your backend
const streamsData = [
  { 
    id: 1,
    recipient: "Team Payroll",
    icon: Building2,
    amount: "86.4M",
    currency: "USDC",
    value: "$286M",
    rate: "$3,500/mo",
    status: "active",
    progress: 28,
    apy: "3.36%",
    details: {
      totalStreamed: "$54.23",
      totalAmount: "$500.00",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      nextPayment: "2024-02-01",
      recipientAddress: "0x742d...8f9a"
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
    icon: ChartBar,
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
  const streamId = parseInt(params.id as string)
  const stream = streamsData.find(s => s.id === streamId) || streamsData[0]
  
  const [isPaused, setIsPaused] = useState(stream.status === "paused")

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
                  <stream.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-light text-gray-900">{stream.recipient}</h2>
                  <p className="text-sm text-gray-500 font-light">Stream #{stream.id}</p>
                </div>
              </div>
              <Badge className={`${isPaused ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'} border-0`}>
                {isPaused ? 'Paused' : 'Active'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">Total Amount</div>
                <div className="text-2xl font-extralight text-gray-900">{stream.amount} {stream.currency}</div>
                <div className="text-sm text-gray-400 font-light">{stream.value}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">Streaming Rate</div>
                <div className="text-2xl font-extralight text-gray-900">{stream.rate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">APY</div>
                <div className="text-2xl font-extralight text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" />
                  {stream.apy}
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
                    <span className="text-sm font-light">{stream.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all rounded-full"
                      style={{ width: `${stream.progress}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-light">Streamed</span>
                    <span className="text-sm font-light">{stream.details.totalStreamed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 font-light">Remaining</span>
                    <span className="text-sm font-light">
                      ${(parseFloat(stream.details.totalAmount.replace('$', '').replace(',', '')) - 
                         parseFloat(stream.details.totalStreamed.replace('$', '').replace(',', ''))).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm rounded-xl">
            <CardContent className="pt-6">
              <h3 className="text-lg font-light mb-6">Stream Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Recipient</span>
                  <span className="text-sm font-mono">{stream.details.recipientAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Start Date</span>
                  <span className="text-sm font-light">{stream.details.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">End Date</span>
                  <span className="text-sm font-light">{stream.details.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-light">Next Payment</span>
                  <span className="text-sm font-light">{stream.details.nextPayment}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => setIsPaused(!isPaused)}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-light"
          >
            {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
            {isPaused ? 'Resume Stream' : 'Pause Stream'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-primary/50 text-primary hover:bg-primary/5 font-light"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Withdraw Funds
          </Button>
          <Link href="/remit" className="flex-1">
            <Button variant="outline" className="w-full border-border/50 hover:bg-gray-50 font-light">
              Route to Bill Pay
            </Button>
          </Link>
          <Link href="/vault" className="flex-1">
            <Button variant="outline" className="w-full border-border/50 hover:bg-gray-50 font-light">
              Move to Vault
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}