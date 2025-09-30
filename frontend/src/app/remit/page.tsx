"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { ArrowLeft, ArrowRight, Banknote, CheckCircle2, Loader2, AlertCircle, Clock, DollarSign, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useOffRamp } from "@/hooks/useOffRamp"
import { parseAptAmount, OFFRAMP_STATUS } from "@/config/aptos"
import toast from "react-hot-toast"

export default function Remit() {
  const [step, setStep] = useState<"kyc" | "form" | "bank" | "confirm" | "processing">("form")
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  
  const { connected } = useWallet()
  const {
    loading,
    kycStatus,
    exchangeRates,
    userRequests,
    submitKYC,
    createOffRampRequest,
    fetchUserData
  } = useOffRamp()

  // Form states
  const [formData, setFormData] = useState({
    amount: "100",
    currency: "NGN",
    bankName: "",
    accountNumber: "",
    accountName: "",
    swiftCode: "",
    reason: "Personal remittance"
  })

  // KYC form states
  const [kycData, setKycData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    country: "NG"
  })

  const currencies = [
    { code: "NGN", name: "Nigeria", flag: "🇳🇬", symbol: "₦", available: true },
    { code: "USD", name: "United States", flag: "🇺🇸", symbol: "$", available: true },
    { code: "EUR", name: "Europe", flag: "🇪🇺", symbol: "€", available: false },
    { code: "GBP", name: "United Kingdom", flag: "🇬🇧", symbol: "£", available: false },
    { code: "INR", name: "India", flag: "🇮🇳", symbol: "₹", available: false },
  ]

  const nigerianBanks = [
    "Guaranty Trust Bank",
    "First Bank of Nigeria", 
    "United Bank for Africa",
    "Access Bank",
    "Zenith Bank",
    "Stanbic IBTC Bank",
    "Fidelity Bank",
    "Union Bank",
    "Sterling Bank",
    "Wema Bank"
  ]

  useEffect(() => {
    if (connected) {
      fetchUserData()
    }
  }, [connected, fetchUserData])

  const getExchangeRate = () => {
    const rate = exchangeRates[formData.currency]
    return rate || 1850 // Default rate for NGN
  }

  const getConvertedAmount = () => {
    const rate = getExchangeRate()
    return (parseFloat(formData.amount || "0") * rate).toFixed(2)
  }

  const handleSubmitKYC = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSubmittingKYC(true)
    try {
      await submitKYC({
        fullName: kycData.fullName,
        email: kycData.email,
        phoneNumber: kycData.phoneNumber,
        country: kycData.country
      })
      
      toast.success("KYC submitted! Your verification is being processed")
      
      setStep("form")
    } catch (error: any) {
      toast.error(error.message || "KYC submission failed")
    } finally {
      setIsSubmittingKYC(false)
    }
  }

  const handleCreateRequest = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!kycStatus?.verified) {
      toast.error("Please complete KYC verification first")
      setStep("kyc")
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

  // KYC Step
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

  if (step === "kyc" && (!kycStatus || !kycStatus.verified)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>KYC Verification Required</CardTitle>
              <CardDescription>Complete your verification to start using off-ramp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  placeholder="John Doe"
                  value={kycData.fullName}
                  onChange={(e) => setKycData({...kycData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  placeholder="john.doe@example.com"
                  value={kycData.email}
                  onChange={(e) => setKycData({...kycData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={kycData.phoneNumber}
                  onChange={(e) => setKycData({...kycData, phoneNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select 
                  value={kycData.country}
                  onValueChange={(value) => setKycData({...kycData, country: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NG">Nigeria</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="KE">Kenya</SelectItem>
                    <SelectItem value="GH">Ghana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full"
                onClick={handleSubmitKYC}
                disabled={isSubmittingKYC || !kycData.fullName || !kycData.email || !kycData.phoneNumber}
              >
                {isSubmittingKYC ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                ) : (
                  "Submit KYC"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
        <Header />
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">Processing Your Request</h3>
              <p className="text-gray-500">This may take a few moments...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-extralight">Off-Ramp to Bank</h1>
              <p className="text-sm text-gray-500">Convert APT to fiat currency</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {kycStatus?.verified && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">KYC Status</p>
                    <p className="text-lg font-semibold text-green-600">Verified</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Daily Limit</p>
                    <p className="text-lg font-semibold">5,000 APT</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Off-ramped</p>
                    <p className="text-lg font-semibold">
                      {userRequests.reduce((acc, req) => {
                        if (req.status === OFFRAMP_STATUS.COMPLETED) {
                          return acc + req.aptAmount / 100_000_000
                        }
                        return acc
                      }, 0).toFixed(2)} APT
                    </p>
                  </div>
                  <Banknote className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white border">
            <TabsTrigger value="create">Create Request</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            {step === "form" && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Convert APT to Fiat</CardTitle>
                  <CardDescription>Send money directly to your bank account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
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
                          {currencies.map((currency) => (
                            <SelectItem 
                              key={currency.code} 
                              value={currency.code}
                              disabled={!currency.available}
                            >
                              <span className="flex items-center gap-2">
                                {currency.flag} {currency.name} ({currency.code})
                                {!currency.available && <span className="text-xs text-gray-400">Coming soon</span>}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        You will receive approximately {currencies.find(c => c.code === formData.currency)?.symbol}
                        {getConvertedAmount()} at current rate (1 APT = {currencies.find(c => c.code === formData.currency)?.symbol}{getExchangeRate()})
                      </AlertDescription>
                    </Alert>

                    <Button 
                      className="w-full"
                      onClick={() => setStep("bank")}
                      disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                    >
                      Continue to Bank Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "bank" && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Bank Account Details</CardTitle>
                  <CardDescription>Where should we send the money?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {formData.currency === "NGN" ? (
                      <>
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Select 
                            value={formData.bankName}
                            onValueChange={(value) => setFormData({...formData, bankName: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your bank" />
                            </SelectTrigger>
                            <SelectContent>
                              {nigerianBanks.map((bank) => (
                                <SelectItem key={bank} value={bank}>
                                  {bank}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input 
                            placeholder="0123456789"
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
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Input 
                            placeholder="Bank of America"
                            value={formData.bankName}
                            onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Account/IBAN</Label>
                          <Input 
                            placeholder="US12345678901234567890"
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
                        
                        <div className="space-y-2">
                          <Label>SWIFT Code</Label>
                          <Input 
                            placeholder="CHASUS33"
                            value={formData.swiftCode}
                            onChange={(e) => setFormData({...formData, swiftCode: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep("form")}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setStep("confirm")}
                      disabled={!formData.bankName || !formData.accountNumber || !formData.accountName}
                    >
                      Review Transaction
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "confirm" && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Confirm Transaction</CardTitle>
                  <CardDescription>Review your off-ramp details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-semibold">{formData.amount} APT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">You'll receive</span>
                        <span className="font-semibold">
                          {currencies.find(c => c.code === formData.currency)?.symbol}
                          {getConvertedAmount()} {formData.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank</span>
                        <span className="font-semibold">{formData.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account</span>
                        <span className="font-semibold">{formData.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name</span>
                        <span className="font-semibold">{formData.accountName}</span>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Processing time: 1-3 business days. You'll receive an email confirmation once the transfer is complete.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => setStep("bank")}
                        className="flex-1"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleCreateRequest}
                        disabled={isCreatingRequest}
                      >
                        {isCreatingRequest ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                        ) : (
                          <>Confirm & Submit</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-gray-500">No off-ramp requests yet</p>
                  <Button 
                    onClick={() => setActiveTab("create")} 
                    className="mt-4"
                  >
                    Create your first request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              userRequests.map((request) => {
                const status = getStatusBadge(request.status)
                const StatusIcon = status.icon
                
                return (
                  <Card key={request.requestId} className="bg-white">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                            <span className={`text-sm font-semibold ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          <p className="text-lg">{(request.aptAmount / 100_000_000).toFixed(2)} APT → {request.currency}</p>
                          <p className="text-sm text-gray-500">
                            {request.bankInfo.bankName} - {request.bankInfo.accountNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(request.createdAt * 1000).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: #{request.requestId}
                          </p>
                        </div>
                      </div>
                      
                      {request.status === OFFRAMP_STATUS.PROCESSING && (
                        <Alert>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <AlertDescription>
                            Your request is being processed. Expected completion: 1-3 business days.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {request.status === OFFRAMP_STATUS.COMPLETED && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            Transfer completed successfully!
                          </AlertDescription>
                        </Alert>
                      )}
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