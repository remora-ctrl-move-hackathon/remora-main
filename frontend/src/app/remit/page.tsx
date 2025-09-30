"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { ArrowLeft, ArrowRight, Banknote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function Remit() {
  const [toCurrency, setToCurrency] = useState("NGN")
  const [amount, setAmount] = useState("100")
  const [convertedAmount, setConvertedAmount] = useState("185,000")
  const [bankAccount, setBankAccount] = useState("")
  const [bankName, setBankName] = useState("")
  const [step, setStep] = useState<"form" | "bank" | "confirm" | "success">("form")

  const currencies = [
    { code: "NGN", name: "Nigeria", flag: "🇳🇬", symbol: "₦", rate: 1850, available: true },
    { code: "USD", name: "United States", flag: "🇺🇸", symbol: "$", rate: 2.50, available: false },
    { code: "MXN", name: "Mexico", flag: "🇲🇽", symbol: "$", rate: 42.5, available: false },
    { code: "INR", name: "India", flag: "🇮🇳", symbol: "₹", rate: 207, available: false },
    { code: "PHP", name: "Philippines", flag: "🇵🇭", symbol: "₱", rate: 139, available: false },
  ]

  const banks = [
    { code: "GTB", name: "Guaranty Trust Bank" },
    { code: "FBN", name: "First Bank of Nigeria" },
    { code: "UBA", name: "United Bank for Africa" },
    { code: "ACCESS", name: "Access Bank" },
    { code: "ZENITH", name: "Zenith Bank" },
  ]

  const handleAmountChange = (value: string) => {
    setAmount(value)
    const currency = currencies.find(c => c.code === toCurrency)
    if (currency) {
      const converted = (parseFloat(value) * currency.rate).toFixed(2)
      setConvertedAmount(converted)
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 flex flex-col">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12 w-full">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 animate-pulse">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-extralight text-gray-900 mb-2">Off-Ramp Initiated!</h2>
              <p className="text-gray-500 font-light text-center">Your funds are being processed</p>
            </div>
            
            <Card className="w-full max-w-2xl mb-6 bg-white border-border/50 shadow-sm rounded-xl">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-light">APT Sold</span>
                    <span className="font-light text-gray-900">{amount} APT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-light">You'll Receive</span>
                    <span className="font-light text-gray-900">
                      {currencies.find(c => c.code === toCurrency)?.symbol}{convertedAmount} {toCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-light">Bank Account</span>
                    <span className="font-light text-gray-900">****{bankAccount.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-light">Processing Time</span>
                    <span className="font-light text-gray-900">1-3 business days</span>
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

            <div className="w-full max-w-2xl space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300 font-light">
                  Back to Dashboard
                </Button>
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
        <div className="max-w-screen-xl mx-auto px-8 py-12 w-full">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => setStep("bank")} className="hover:bg-primary/10 transition-all duration-300">
              <ArrowLeft className="h-5 w-5 text-primary/70" />
            </Button>
            <div>
              <h1 className="text-2xl font-extralight text-gray-900">Confirm Off-Ramp</h1>
              <p className="text-sm text-gray-500 font-light">Review transaction details</p>
            </div>
          </div>

          <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-light text-gray-900">Transaction Summary</CardTitle>
              <CardDescription className="text-gray-500 font-light">Please review your off-ramp details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border/30">
                <div>
                  <div className="text-sm text-gray-500 font-light mb-1">You're Selling</div>
                  <div className="text-2xl font-extralight">{amount} APT</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-light mb-1">From</div>
                  <div className="font-light">Aptos Wallet</div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-primary/70" />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border/30">
                <div>
                  <div className="text-sm text-gray-500 font-light mb-1">You'll Receive</div>
                  <div className="text-2xl font-extralight">
                    {currencies.find(c => c.code === toCurrency)?.symbol}{convertedAmount} {toCurrency}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-light mb-1">To Bank</div>
                  <div className="font-light">{bankName}</div>
                  <div className="text-xs text-gray-400">****{bankAccount.slice(-4)}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-light">Exchange Rate</span>
                  <span className="font-light text-gray-900">
                    1 APT = {currencies.find(c => c.code === toCurrency)?.symbol}
                    {currencies.find(c => c.code === toCurrency)?.rate} {toCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-light">Processing Fee</span>
                  <span className="font-light text-gray-900">0.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-light">Processing Time</span>
                  <span className="font-light text-gray-900">1-3 business days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300 font-light" size="lg" onClick={() => setStep("success")}>
              Execute Transaction
            </Button>
            <Button variant="outline" className="w-full border-border/30 hover:bg-primary/5 font-light transition-all duration-300" onClick={() => setStep("bank")}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "bank") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 flex flex-col">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12 w-full">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => setStep("form")} className="hover:bg-primary/10 transition-all duration-300">
              <ArrowLeft className="h-5 w-5 text-primary/70" />
            </Button>
            <div>
              <h1 className="text-2xl font-extralight text-gray-900">Bank Details</h1>
              <p className="text-sm text-gray-500 font-light">Enter your bank account information</p>
            </div>
          </div>

          <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Select Bank</Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map(bank => (
                      <SelectItem key={bank.code} value={bank.name}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input 
                  type="text" 
                  value={bankAccount} 
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Enter account number"
                />
              </div>

              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input 
                  type="text" 
                  placeholder="Enter account holder name"
                />
              </div>

              <div className="space-y-2">
                <Label>Routing Number</Label>
                <Input 
                  type="text" 
                  placeholder="Enter routing number"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Important</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Ensure your bank account details are correct. Incorrect information may result in delays or loss of funds.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300 font-light" 
            size="lg" 
            onClick={() => setStep("confirm")}
            disabled={!bankName || !bankAccount}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 ">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-extralight text-gray-900">Off Ramp</h1>
          <p className="text-sm text-gray-500 font-light">Convert APT to fiat currency</p>
        </div>

        <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Banknote className="h-8 w-8 text-primary/70" />
              <div>
                <div className="font-light text-lg text-gray-900">Instant Fiat Conversion</div>
                <div className="text-sm text-gray-500 font-light">Best rates, direct to your bank</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>From (Cryptocurrency)</Label>
              <div className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-gray-50">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWzRh7Mpizqm0eqIVzNzrmMZlBH52NzItVwQ&s"
                  alt="Aptos Logo"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium">Aptos</div>
                  <div className="text-xs text-gray-500">APT</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>To (Fiat Currency)</Label>
              <div className="grid grid-cols-2 gap-3">
                {currencies.map(currency => (
                  <button
                    key={currency.code}
                    onClick={() => {
                      if (currency.available) {
                        setToCurrency(currency.code)
                        if (amount) {
                          const converted = (parseFloat(amount) * currency.rate).toLocaleString()
                          setConvertedAmount(converted)
                        }
                      }
                    }}
                    disabled={!currency.available}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                      currency.available && toCurrency === currency.code 
                        ? 'border-primary bg-primary/5' 
                        : currency.available 
                        ? 'border-border/50 hover:border-primary/50 bg-white cursor-pointer' 
                        : 'border-border/30 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{currency.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{currency.name}</div>
                      <div className="text-xs text-gray-500">
                        {currency.available ? currency.code : 'Coming Soon'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount of APT to Sell</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="100"
              />
              <p className="text-sm text-gray-500 font-light">Available balance: 86.4 APT</p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4">
              <div className="text-sm text-gray-500 font-light mb-1">You'll receive</div>
              <div className="text-2xl font-extralight">
                {currencies.find(c => c.code === toCurrency)?.symbol}{convertedAmount} {toCurrency}
              </div>
              <div className="text-xs text-gray-400 font-light mt-1">
                Rate: 1 APT = {currencies.find(c => c.code === toCurrency)?.symbol}
                {currencies.find(c => c.code === toCurrency)?.rate} {toCurrency}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-md transition-all duration-300 font-light" size="lg" onClick={() => setStep("bank")}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}