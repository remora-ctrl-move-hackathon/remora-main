"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, Landmark, Smartphone, CreditCard, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function OffRamp() {
  const [amount, setAmount] = useState("100")
  const [fiatAmount, setFiatAmount] = useState("164,500")
  const currency = "NGN" // Fixed to Nigerian Naira
  const [step, setStep] = useState<"form" | "success">("form")

  const currencies = [
    { code: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 1645 },
  ]

  const transactions = [
    { id: 1, amount: 200, currency: "NGN", fiat: 329000, status: "Completed", date: "2025-01-20", method: "Bank" },
    { id: 2, amount: 150, currency: "NGN", fiat: 246750, status: "Completed", date: "2025-01-18", method: "Bank" },
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
                        <div className="px-4 py-2 bg-muted rounded-lg font-semibold text-sm">GTBank</div>
                        <div className="px-4 py-2 bg-muted rounded-lg font-semibold text-sm">FirstBank</div>
                        <div className="px-4 py-2 bg-muted rounded-lg font-semibold text-sm">Access Bank</div>
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
                <div className="font-semibold text-lg">Nigerian Bank Withdrawals</div>
                <div className="text-sm text-muted-foreground">Direct USDC to NGN conversion to your Nigerian bank account</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 backdrop-blur-xl bg-card border-border">
          <CardHeader>
            <CardTitle>Convert to Nigerian Naira</CardTitle>
            <CardDescription>Withdraw USDC directly to your Nigerian bank account</CardDescription>
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
              <Label>Receiving Currency</Label>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🇳🇬</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Nigerian Naira (NGN)</div>
                  <div className="text-xs text-muted-foreground">Direct bank transfer</div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">You will receive</span>
                <span className="text-2xl text-foreground/70">
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
            <CardTitle>Nigerian Bank Details</CardTitle>
            <CardDescription>Enter your bank account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <select className="w-full p-2 border rounded-lg bg-background">
                <option>GTBank (Guaranty Trust Bank)</option>
                <option>First Bank of Nigeria</option>
                <option>Access Bank</option>
                <option>Zenith Bank</option>
                <option>UBA (United Bank for Africa)</option>
                <option>Sterling Bank</option>
                <option>Fidelity Bank</option>
                <option>Union Bank</option>
                <option>FCMB (First City Monument Bank)</option>
                <option>Wema Bank</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input 
                type="text" 
                placeholder="1234567890"
                maxLength={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input 
                type="text" 
                placeholder="John Doe"
                disabled
                className="bg-muted"
                value="Auto-verified after account number"
              />
              <p className="text-xs text-muted-foreground">Account name will be verified automatically</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 backdrop-blur-xl bg-card border-border">
          <CardHeader>
            <CardTitle>Withdrawal Method</CardTitle>
            <CardDescription>Available withdrawal options for Nigeria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Nigerian Bank Transfer</div>
                <div className="text-xs text-muted-foreground">1-2 hours (GTBank, FirstBank, Access Bank)</div>
              </div>
              <div className="text-sm font-medium text-foreground">Free</div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50 cursor-not-allowed">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Mobile Money</div>
                <div className="text-xs text-muted-foreground">Coming soon</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">-</div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50 cursor-not-allowed">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Debit Card</div>
                <div className="text-xs text-muted-foreground">Coming soon</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">-</div>
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
                          tx.status === "Completed" ? "bg-primary/10" : "bg-muted"
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
