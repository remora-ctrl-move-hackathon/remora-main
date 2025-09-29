"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, ArrowRight, Smartphone, Building2, Wallet, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function Remit() {
  const [fromCountry, setFromCountry] = useState("US")
  const [toCountry, setToCountry] = useState("NG")
  const [amount, setAmount] = useState("100")
  const [convertedAmount, setConvertedAmount] = useState("164,500")
  const [step, setStep] = useState<"form" | "confirm" | "success">("form")

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN" },
    { code: "MX", name: "Mexico", flag: "🇲🇽", currency: "MXN" },
    { code: "IN", name: "India", flag: "🇮🇳", currency: "INR" },
    { code: "PH", name: "Philippines", flag: "🇵🇭", currency: "PHP" },
  ]

  const recipients = [
    { id: 1, name: "John Doe", wallet: "0x1234...5678", avatar: "JD" },
    { id: 2, name: "Jane Smith", wallet: "0xabcd...ef12", avatar: "JS" },
    { id: 3, name: "Bob Wilson", wallet: "0x9876...5432", avatar: "BW" },
  ]

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
            <p className="text-muted-foreground mb-8 text-center">Your money is on its way</p>
            
            <Card className="w-full max-w-md mb-6 backdrop-blur-xl bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Sent</span>
                    <span className="font-semibold text-foreground">{amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient Gets</span>
                    <span className="font-semibold text-foreground">₦{convertedAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ETA</span>
                    <span className="font-semibold text-foreground">2-5 minutes</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Transaction Hash</span>
                    </div>
                    <span className="text-xs text-primary">0xabcd...ef1234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="w-full max-w-md space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/vault" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Move to Vault
                  </Button>
                </Link>
                <Link href="/offramp" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Off-Ramp
                  </Button>
                </Link>
              </div>
              <Link href="/" className="block">
                <Button className="w-full">Done</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setStep("form")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Confirm Transfer</h1>
              <p className="text-sm text-muted-foreground">Review before sending</p>
            </div>
          </div>

          <Card className="mb-6 backdrop-blur-xl bg-card border-border">
            <CardHeader>
              <CardTitle>Transfer Summary</CardTitle>
              <CardDescription>Please review your transaction details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">You Send</div>
                  <div className="text-2xl font-bold">{amount} USDC</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">From</div>
                  <div className="font-semibold">{countries.find(c => c.code === fromCountry)?.flag} {countries.find(c => c.code === fromCountry)?.name}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Recipient Gets</div>
                  <div className="text-2xl font-bold">₦{convertedAmount}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">To</div>
                  <div className="font-semibold">{countries.find(c => c.code === toCountry)?.flag} {countries.find(c => c.code === toCountry)?.name}</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-medium">1 USD = 1,645 NGN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Fee</span>
                  <span className="font-medium">0.50 USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Arrival</span>
                  <span className="font-medium">2-5 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => setStep("success")}>
              Confirm & Send
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setStep("form")}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5 ">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Send Money Abroad</h1>
            <p className="text-sm text-muted-foreground">Fast & secure transfers</p>
          </div>
        </div>

        <Card className="mb-6 backdrop-blur-xl bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold text-lg">Send Money in Seconds</div>
                <div className="text-sm text-muted-foreground">Low fees, real-time delivery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromCountry} onValueChange={setFromCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name} ({country.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toCountry} onValueChange={setToCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name} ({country.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (USDC)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
              />
              <p className="text-sm text-muted-foreground">
                Recipient gets: ≈ ₦{convertedAmount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Delivery Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Mobile Money</div>
                <div className="text-xs text-muted-foreground">Instant delivery</div>
              </div>
              <div className="text-sm font-medium text-green-500">Free</div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Bank Transfer</div>
                <div className="text-xs text-muted-foreground">1-2 business days</div>
              </div>
              <div className="text-sm font-medium">$0.50</div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">In-App Wallet</div>
                <div className="text-xs text-muted-foreground">Instant</div>
              </div>
              <div className="text-sm font-medium text-green-500">Free</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Send</CardTitle>
            <CardDescription>Recent recipients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recipients.map(recipient => (
                <div key={recipient.id} className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-semibold group-hover:bg-primary/20 transition-colors">
                    {recipient.avatar}
                  </div>
                  <div className="text-xs text-center">
                    <div className="font-medium">{recipient.name}</div>
                    <div className="text-muted-foreground text-[10px]">{recipient.wallet}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={() => setStep("confirm")}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

    </div>
  )
}
