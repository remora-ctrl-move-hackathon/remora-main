"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, Plus, Zap, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function Streams() {
  const [open, setOpen] = useState(false)

  const activeStreams = [
    { id: 1, recipient: "0x1234...5678", streamed: 54.23, total: 500, progress: 10.85, status: "active" },
    { id: 2, recipient: "0xabcd...ef12", streamed: 450, total: 1000, progress: 45, status: "active" },
  ]

  const invoices = [
    { id: "INV-001", client: "Acme Corp", amount: 2500, status: "Paid", color: "text-green-500" },
    { id: "INV-002", client: "Tech Startup", amount: 1200, status: "Approved", color: "text-blue-500" },
    { id: "INV-003", client: "Design Agency", amount: 800, status: "Pending", color: "text-yellow-500" },
  ]

  const history = [
    { id: 1, recipient: "0x9876...5432", amount: 1000, date: "2025-01-15", status: "Completed" },
    { id: 2, recipient: "0x1111...2222", amount: 750, date: "2025-01-10", status: "Completed" },
  ]

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
              <Button className="gap-2 bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Generate an invoice for your client
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet">Client Wallet</Label>
                  <Input id="wallet" placeholder="0x..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <Input id="amount" type="number" placeholder="1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Web development services" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due">Due Date</Label>
                  <Input id="due" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => setOpen(false)}>Create Invoice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary/70 animate-pulse" />
              </div>
              <div>
                <div className="font-light text-lg text-gray-900">Salary Stream Active</div>
                <div className="text-sm text-gray-500 font-light">Streaming in real-time</div>
              </div>
            </div>
            <Progress value={10.85} className="h-3 mb-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-light">$54.23 streamed</span>
              <span className="font-light text-gray-900">$500.00 total</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-border/30 rounded-xl">
            <TabsTrigger value="active" className="font-light">Active Streams</TabsTrigger>
            <TabsTrigger value="invoices" className="font-light">Invoices</TabsTrigger>
            <TabsTrigger value="history" className="font-light">History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeStreams.map((stream) => (
              <Card key={stream.id} className="bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-light mb-1 text-gray-900">{stream.recipient}</div>
                      <div className="text-sm text-gray-500 font-light">Stream #{stream.id}</div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="font-light">Active</span>
                    </div>
                  </div>
                  <Progress value={stream.progress} className="mb-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-light">${stream.streamed.toFixed(2)} of ${stream.total}</span>
                    <span className="font-light text-gray-900">{stream.progress.toFixed(1)}%</span>
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-border/30 hover:bg-primary/5 font-light transition-all duration-300">Pause</Button>
                      <Button variant="outline" size="sm" className="flex-1 border-border/30 hover:bg-primary/5 font-light transition-all duration-300">Withdraw</Button>
                    </div>
                    <div className="flex gap-2">
                      <Link href="/dashboard" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs font-light hover:bg-primary/5 transition-all duration-300">
                          Route to Bill Pay
                        </Button>
                      </Link>
                      <Link href="/vault" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs font-light hover:bg-primary/5 transition-all duration-300">
                          Move to Vault
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                        {invoice.status === "Paid" && <CheckCircle2 className="h-5 w-5 text-primary/70" />}
                        {invoice.status === "Approved" && <Clock className="h-5 w-5 text-primary/70" />}
                        {invoice.status === "Pending" && <Clock className="h-5 w-5 text-primary/70" />}
                      </div>
                      <div>
                        <div className="font-light text-gray-900">{invoice.client}</div>
                        <div className="text-sm text-gray-500 font-light">{invoice.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-light text-gray-900">${invoice.amount}</div>
                      <div className={`text-sm ${invoice.color} font-light`}>{invoice.status}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-light mb-1 text-gray-900">{item.recipient}</div>
                      <div className="text-sm text-gray-500 font-light">{item.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-light text-gray-900">${item.amount}</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1 font-light">
                        <CheckCircle2 className="h-3 w-3 text-primary/70" />
                        {item.status}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}
