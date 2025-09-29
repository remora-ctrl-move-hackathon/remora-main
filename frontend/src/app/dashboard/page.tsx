"use client"

import React, { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, Zap, Droplet, Wifi, GraduationCap, Home as HomeIcon, CheckCircle2, TrendingUp, Users, Activity, Calendar, Clock, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  const categories = [
    { id: "electricity", name: "Electricity", icon: Zap, color: "bg-yellow-500/10 text-yellow-500" },
    { id: "data", name: "Data", icon: Wifi, color: "bg-blue-500/10 text-blue-500" },
    { id: "tuition", name: "Tuition", icon: GraduationCap, color: "bg-purple-500/10 text-purple-500" },
    { id: "rent", name: "Rent", icon: HomeIcon, color: "bg-green-500/10 text-green-500" },
    { id: "water", name: "Water", icon: Droplet, color: "bg-cyan-500/10 text-cyan-500" },
  ]

  const recentBills = [
    { id: 1, provider: "Power Corp", logo: "⚡", amount: 45.50, due: "Due in 3 days" },
    { id: 2, provider: "Internet Plus", logo: "🌐", amount: 29.99, due: "Due in 5 days" },
    { id: 3, provider: "City Water", logo: "💧", amount: 22.00, due: "Due in 7 days" },
  ]

  const handlePayment = () => {
    setTimeout(() => {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setOpen(false)
      }, 2000)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extralight text-foreground">Bill Payments</h1>
            <p className="text-sm font-light text-muted-foreground mt-1">Pay with stablecoins</p>
          </div>
        </div>

        <Card className="mb-8 bg-white border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-light text-muted-foreground mb-2">Available Balance</div>
                <div className="text-3xl font-extralight text-foreground">$1,245.83</div>
                <div className="text-sm font-light text-muted-foreground mt-1">USDC</div>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-lg font-light mb-6">Categories</h2>
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className="bg-white border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="pt-8 pb-8 text-center">
                  <div className={`mx-auto w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center mb-4`}>
                    {React.createElement(category.icon, { className: "h-7 w-7" })}
                  </div>
                  <div className="text-sm font-light text-foreground">{category.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mb-8 bg-white border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-light text-xl">Recent Bills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {bill.logo}
                  </div>
                  <div>
                    <div className="font-medium">{bill.provider}</div>
                    <div className="text-xs text-muted-foreground">{bill.due}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${bill.amount}</div>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-1">
                        Pay Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      {success ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-10 w-10 text-foreground" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                          <p className="text-sm text-muted-foreground">Transaction confirmed on blockchain</p>
                          <p className="text-xs text-primary mt-2">0xabcd...ef1234</p>
                        </div>
                      ) : (
                        <>
                          <DialogHeader>
                            <DialogTitle>Pay Bill</DialogTitle>
                            <DialogDescription>
                              Confirm payment details
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Provider</Label>
                              <Input value={bill.provider} disabled />
                            </div>
                            <div className="space-y-2">
                              <Label>Amount (USDC)</Label>
                              <Input value={bill.amount} disabled />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="account">Account Number</Label>
                              <Input id="account" placeholder="Enter account number" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="billId">Bill ID</Label>
                              <Input id="billId" placeholder="Enter bill ID" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <Label htmlFor="autopay" className="cursor-pointer">
                                Enable Auto-Pay from Stream
                              </Label>
                              <Switch id="autopay" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handlePayment}>Confirm Payment</Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Power Corp - Electricity</span>
              </div>
              <span className="font-medium">$45.50</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Internet Plus - Data</span>
              </div>
              <span className="font-medium">$29.99</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>City Water - Water Bill</span>
              </div>
              <span className="font-medium">$22.00</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
