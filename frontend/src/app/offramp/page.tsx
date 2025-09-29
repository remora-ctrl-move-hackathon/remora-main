"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, Landmark, Smartphone, CreditCard, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function OffRamp() {
  const [amount, setAmount] = useState("100")
  const [fiatAmount, setFiatAmount] = useState("164,500")
  const [currency, setCurrency] = useState("NGN")
  const [step, setStep] = useState<"form" | "success">("form")

  const currencies = [
    { code: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 1645 },
    { code: "MXN", name: "Mexican Peso", symbol: "$", rate: 17.5 },
    { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 83.2 },
    { code: "PHP", name: "Philippine Peso", symbol: "₱", rate: 56.8 },
  ]

  const transactions = [
    { id: 1, amount: 200, currency: "NGN", fiat: 329000, status: "Completed", date: "2025-01-20", method: "Bank" },
    { id: 2, amount: 150, currency: "MXN", fiat: 2625, status: "Completed", date: "2025-01-18", method: "Mobile" },
    { id: 3, amount: 100, currency: "NGN", fiat: 164500, status: "Pending", date: "2025-01-22", method: "Bank" },
  ]

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 rounded-full bg-black/10 flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle2 className="h-12 w-12 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Withdrawal Successful!</h2>
            <p className="text-muted-foreground mb-8 text-center">Your funds are being processed</p>
            
            <Card className="w-full max-w-md mb-6 backdrop-blur-xl bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">USDC Converted</span>
                    <span className="font-semibold">{amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You Receive</span>
                    <span className="font-semibold">₦{fiatAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span className="font-semibold">1 USD = 1,645 NGN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fees</span>
                    <span className="font-semibold text-foreground">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ETA</span>
                    <span className="font-semibold">1-2 hours</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">Partnered with</div>
                      <div className="flex justify-center gap-4">
                        <div className="px-8 py-2 bg-muted rounded-lg font-semibold">GTBank</div>
                        <div className="px-8 py-2 bg-muted rounded-lg font-semibold">FirstBank</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/offramp" className="w-full max-w-md">
              <Button className="w-full" onClick={() => setStep("form")}>Done</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-green-500/5 ">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Off-Ramp</h1>
            <p className="text-sm text-muted-foreground">Convert crypto to fiat</p>
          </div>
        </div>

        <Card className="mb-6 backdrop-blur-xl bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Landmark className="h-8 w-8 text-foreground" />
              <div>
                <div className="font-semibold text-lg">Cash Out Instantly</div>
                <div className="text-sm text-muted-foreground">Low fees, fast delivery to your bank</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 backdrop-blur-xl bg-card border-border">
          <CardHeader>
            <CardTitle>Convert to Fiat</CardTitle>
            <CardDescription>Enter the amount you want to withdraw</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (USDC)</Label>
              <Input 
                type="number" 
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  const rate = currencies.find(c => c.code === currency)?.rate || 1
                  setFiatAmount((parseFloat(e.target.value) * rate).toLocaleString())
                }}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(curr => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.name} ({curr.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">You will receive</span>
                <span className="text-2xl font-bold text-foreground">
                  {currencies.find(c => c.code === currency)?.symbol}{fiatAmount}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Rate: 1 USD = {currencies.find(c => c.code === currency)?.rate} {currency}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 backdrop-blur-xl bg-card border-border">
          <CardHeader>
            <CardTitle>Withdrawal Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Bank Account</div>
                <div className="text-xs text-muted-foreground">1-2 hours</div>
              </div>
              <div className="text-sm font-medium text-foreground">Free</div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Mobile Money</div>
                <div className="text-xs text-muted-foreground">Instant</div>
              </div>
              <div className="text-sm font-medium text-foreground">Free</div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Debit Card</div>
                <div className="text-xs text-muted-foreground">Instant</div>
              </div>
              <div className="text-sm font-medium">$0.50</div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full mb-6" size="lg" onClick={() => setStep("success")}>
          Confirm Withdrawal
        </Button>

        <Tabs defaultValue="history">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-3 mt-4">
            <Card className="backdrop-blur-xl bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.status === "Completed" ? "bg-green-500/10" : "bg-yellow-500/10"
                        }`}>
                          {tx.status === "Completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-foreground" />
                          ) : (
                            <Clock className="h-5 w-5 text-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{tx.method} Transfer</div>
                          <div className="text-xs text-muted-foreground">{tx.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{tx.amount} USDC</div>
                        <div className="text-xs text-muted-foreground">
                          {currencies.find(c => c.code === tx.currency)?.symbol}{tx.fiat.toLocaleString()}
                        </div>
                        <Badge variant={tx.status === "Completed" ? "default" : "secondary"} className="mt-1">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}
