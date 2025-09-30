"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, ArrowRight, Building, DollarSign, 
  CheckCircle2, AlertCircle, Clock, Info, 
  Loader2, CreditCard, Wallet, TrendingDown
} from "lucide-react"
import Link from "next/link"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useOffRamp } from "@/hooks/useOffRamp"
import toast from "react-hot-toast"
import { OFFRAMP_STATUS } from "@/config/aptos"

export default function Remit() {
  const { connected, account } = useWallet()
  const { 
    loading,
    userRequests,
    exchangeRates,
    createOffRampRequest,
    fetchUserData
  } = useOffRamp()

  const [activeTab, setActiveTab] = useState<"new" | "history">("new")
  const [step, setStep] = useState<"form" | "confirm" | "processing">("form")
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  
  const [formData, setFormData] = useState({
    amount: "100",
    currency: "NGN",
    bankName: "",
    accountNumber: "",
    accountName: "",
    swiftCode: "",
    reason: "Personal remittance"
  })

  const banks = {
    NGN: [
      { name: "GTBank", code: "058" },
      { name: "First Bank", code: "011" },
      { name: "Access Bank", code: "044" },
      { name: "UBA", code: "033" },
      { name: "Zenith Bank", code: "057" }
    ],
    USD: [
      { name: "Chase Bank", code: "021" },
      { name: "Bank of America", code: "026" },
      { name: "Wells Fargo", code: "121" },
      { name: "Citibank", code: "021" }
    ]
  }

  const getFiatAmount = () => {
    const rate = exchangeRates[formData.currency] || 1
    return (parseFloat(formData.amount) * rate).toFixed(2)
  }

  const handleCreateRequest = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsCreatingRequest(true)
    setStep("processing")
    
    try {
      await createOffRampRequest({
        aptAmount: parseFloat(formData.amount),
        currency: formData.currency,
        bankInfo: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          bankCode: "",
          swiftCode: formData.swiftCode,
          routingNumber: "",
          country: formData.currency === "NGN" ? "NG" : "US"
        }
      })
      
      toast.success(`Off-ramp request created! Converting ${formData.amount} APT to ${formData.currency}`)
      
      // Reset form
      setFormData({
        amount: "100",
        currency: "NGN",
        bankName: "",
        accountNumber: "",
        accountName: "",
        swiftCode: "",
        reason: "Personal remittance"
      })
      
      setStep("form")
      setActiveTab("history")
      fetchUserData()
    } catch (error: any) {
      toast.error(error.message || "Request failed")
      setStep("confirm")
    } finally {
      setIsCreatingRequest(false)
    }
  }

  const getStatusBadge = (status: number) => {
    switch(status) {
      case OFFRAMP_STATUS.PENDING:
        return { text: "Pending", color: "text-yellow-500", icon: Clock }
      case OFFRAMP_STATUS.PROCESSING:
        return { text: "Processing", color: "text-blue-500", icon: Loader2 }
      case OFFRAMP_STATUS.COMPLETED:
        return { text: "Completed", color: "text-green-500", icon: CheckCircle2 }
      case OFFRAMP_STATUS.CANCELLED:
        return { text: "Cancelled", color: "text-red-500", icon: AlertCircle }
      case OFFRAMP_STATUS.REJECTED:
        return { text: "Rejected", color: "text-red-500", icon: AlertCircle }
      default:
        return { text: "Unknown", color: "text-gray-500", icon: Info }
    }
  }

  // Not connected state
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
              <p className="text-gray-500 mb-4">Please connect your wallet to use the off-ramp service</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Processing state
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Processing Request</h3>
              <p className="text-gray-500">Please wait while we process your off-ramp request...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Confirmation step
  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Confirm Transfer Details</CardTitle>
              <CardDescription>Review your bank transfer information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount (APT)</span>
                  <span className="font-semibold">{formData.amount} APT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">You Receive</span>
                  <span className="font-semibold">
                    {formData.currency === "NGN" ? "₦" : "$"}
                    {getFiatAmount()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exchange Rate</span>
                  <span className="text-sm">1 APT = {exchangeRates[formData.currency] || 1} {formData.currency}</span>
                </div>
              </div>

              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="font-semibold">Bank Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank</span>
                    <span>{formData.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name</span>
                    <span>{formData.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number</span>
                    <span>{formData.accountNumber}</span>
                  </div>
                  {formData.swiftCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">SWIFT Code</span>
                      <span>{formData.swiftCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Funds will be sent to your bank account within 1-2 business hours after confirmation.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setStep("form")}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleCreateRequest}
                  disabled={isCreatingRequest}
                >
                  {isCreatingRequest ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Transfer"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Off Ramp</h1>
          <p className="text-sm text-gray-500 font-light mt-1">Convert APT to fiat and send to bank account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary font-light">Total Converted</span>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">
                {userRequests.reduce((sum, r) => sum + r.aptAmount, 0).toFixed(2)} APT
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary font-light">Completed</span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">
                {userRequests.filter(r => r.status === OFFRAMP_STATUS.COMPLETED).length} Transfers
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary font-light">Exchange Rate</span>
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">
                Live Rates
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "new" | "history")}>
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="new">New Transfer</TabsTrigger>
            <TabsTrigger value="history">Transfer History</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-light">Create Bank Transfer</CardTitle>
                <CardDescription>Send APT to your bank account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Amount (APT)</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={formData.currency}
                      onValueChange={(value) => setFormData({...formData, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">You will receive:</span>
                    <span className="text-2xl font-semibold">
                      {formData.currency === "NGN" ? "₦" : "$"}
                      {getFiatAmount()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Exchange rate: 1 APT = {exchangeRates[formData.currency] || 1} {formData.currency}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Bank Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Select
                        value={formData.bankName}
                        onValueChange={(value) => setFormData({...formData, bankName: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {banks[formData.currency as keyof typeof banks]?.map((bank) => (
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
                        placeholder={formData.currency === "NGN" ? "0123456789" : "123456789"}
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={formData.accountName}
                        onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                      />
                    </div>

                    {formData.currency === "USD" && (
                      <div className="space-y-2">
                        <Label>SWIFT Code (Optional)</Label>
                        <Input
                          placeholder="CHASUS33"
                          value={formData.swiftCode}
                          onChange={(e) => setFormData({...formData, swiftCode: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setStep("confirm")}
                  disabled={
                    !formData.amount || 
                    !formData.bankName || 
                    !formData.accountNumber || 
                    !formData.accountName ||
                    loading
                  }
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Continue to Confirmation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-light">Transfer History</CardTitle>
                <CardDescription>Your recent bank transfers</CardDescription>
              </CardHeader>
              <CardContent>
                {userRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No transfers yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userRequests.map((request) => {
                      const status = getStatusBadge(request.status)
                      const StatusIcon = status.icon
                      
                      return (
                        <div key={request.requestId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <StatusIcon className={`h-5 w-5 ${status.color}`} />
                              </div>
                              <div>
                                <div className="font-semibold">{request.aptAmount} APT → {request.currency}</div>
                                <div className="text-sm text-gray-500">
                                  {request.bankInfo.bankName} - {request.bankInfo.accountNumber}
                                </div>
                              </div>
                            </div>
                            <Badge className={status.color}>
                              {status.text}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 mt-3">
                            <span>{new Date(request.createdAt * 1000).toLocaleDateString()}</span>
                            <span>{request.fiatAmount.toFixed(2)} {request.currency}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}