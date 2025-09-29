"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ArrowLeft, ArrowRight, Globe } from "lucide-react"
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

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 flex flex-col">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 animate-pulse">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extralight text-gray-900 mb-2">Transfer Successful!</h2>
            <p className="text-gray-500 font-light mb-8 text-center">Your money is on its way</p>
            
            <Card className="w-full max-w-md mb-6 bg-white border-border/50 shadow-sm rounded-xl">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-light">Amount Sent</span>
                    <span className="font-light text-gray-900">{amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-light">Recipient Gets</span>
                    <span className="font-light text-gray-900">₦{convertedAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-light">ETA</span>
                    <span className="font-light text-gray-900">2-5 minutes</span>
                  </div>
                  <div className="border-t border-border/30 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-light text-sm">Transaction Hash</span>
                    </div>
                    <span className="text-xs text-primary font-light">0xabcd...ef1234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="w-full max-w-md space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/vault" className="flex-1">
                  <Button variant="outline" className="w-full border-border/30 hover:bg-primary/5 font-light transition-all duration-300">
                    Move to Vault
                  </Button>
                </Link>
                <Link href="/offramp" className="flex-1">
                  <Button variant="outline" className="w-full border-border/30 hover:bg-primary/5 font-light transition-all duration-300">
                    Off-Ramp
                  </Button>
                </Link>
              </div>
              <Link href="/" className="block">
                <Button className="w-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300 font-light">Done</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 flex flex-col">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => setStep("form")} className="hover:bg-primary/10 transition-all duration-300">
              <ArrowLeft className="h-5 w-5 text-primary/70" />
            </Button>
            <div>
              <h1 className="text-2xl font-extralight text-gray-900">Confirm Transfer</h1>
              <p className="text-sm text-gray-500 font-light">Review before sending</p>
            </div>
          </div>

          <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-light text-gray-900">Transfer Summary</CardTitle>
              <CardDescription className="text-gray-500 font-light">Please review your transaction details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border/30">
                <div>
                  <div className="text-sm text-gray-500 font-light mb-1">You Send</div>
                  <div className="text-2xl font-extralight">{amount} USDC</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-light mb-1">From</div>
                  <div className="font-light">{countries.find(c => c.code === fromCountry)?.flag} {countries.find(c => c.code === fromCountry)?.name}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-primary/70" />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border/30">
                <div>
                  <div className="text-sm text-gray-500 font-light mb-1">Recipient Gets</div>
                  <div className="text-2xl font-extralight">₦{convertedAmount}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-light mb-1">To</div>
                  <div className="font-light">{countries.find(c => c.code === toCountry)?.flag} {countries.find(c => c.code === toCountry)?.name}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-light">Exchange Rate</span>
                  <span className="font-light text-gray-900">1 USD = 1,645 NGN</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-light">Transaction Fee</span>
                  <span className="font-light text-gray-900">0.50 USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-light">Estimated Arrival</span>
                  <span className="font-light text-gray-900">2-5 minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300 font-light" size="lg" onClick={() => setStep("success")}>
              Confirm & Send
            </Button>
            <Button variant="outline" className="w-full border-border/30 hover:bg-primary/5 font-light transition-all duration-300" onClick={() => setStep("form")}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 ">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-300">
              <ArrowLeft className="h-5 w-5 text-primary/70" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extralight text-gray-900">Send Money Abroad</h1>
            <p className="text-sm text-gray-500 font-light">Fast & secure transfers</p>
          </div>
        </div>

        <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-8 w-8 text-primary/70" />
              <div>
                <div className="font-light text-lg text-gray-900">Send Money in Seconds</div>
                <div className="text-sm text-gray-500 font-light">Low fees, real-time delivery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl">
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

        <Button className="w-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300 font-light" size="lg" onClick={() => setStep("confirm")}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

    </div>
  )
}
