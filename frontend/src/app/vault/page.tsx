"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { TrendingUp, TrendingDown, Plus, Users, Lock, Unlock, Play, Pause, DollarSign, Loader2, Info, Copy, Award, ArrowUpRight, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useVault } from "@/hooks/useVault"
import { parseAptAmount, formatAptAmount, VAULT_STATUS } from "@/config/aptos"
import toast from "react-hot-toast"
import Link from "next/link"

export default function Vault() {
  const [createOpen, setCreateOpen] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)
  const [selectedVault, setSelectedVault] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [activeTab, setActiveTab] = useState("explore")
  const [amount, setAmount] = useState("100")
  
  const { connected, account } = useWallet()
  const {
    loading,
    userVaults,
    managedVaults,
    totalValueLocked,
    createVault,
    depositToVault,
    withdrawFromVault,
    pauseVault,
    resumeVault,
    fetchUserVaults,
  } = useVault()

  // Form states for creating vault
  const [vaultForm, setVaultForm] = useState({
    name: "",
    description: "",
    managementFee: "200", // 2% in basis points
    performanceFee: "2000", // 20% in basis points
    minDeposit: "10",
    maxCapacity: "10000"
  })

  // Form state for deposit
  const [depositAmount, setDepositAmount] = useState("")

  useEffect(() => {
    if (connected) {
      fetchUserVaults()
    }
  }, [connected])

  const handleCreateVault = async () => {
    if (!connected) {
      toast.error("Please connect your wallet to create a vault")
      return
    }

    setIsCreating(true)
    try {
      await createVault({
        name: vaultForm.name,
        description: vaultForm.description,
        strategy: "Multi-strategy", // Default strategy
        managementFee: parseFloat(vaultForm.managementFee) / 100,
        performanceFee: parseFloat(vaultForm.performanceFee) / 100,
        minInvestment: parseFloat(vaultForm.minDeposit),
        maxInvestors: 100 // Default max investors
      })
      
      toast.success(`Vault created! ${vaultForm.name} is now live`)
      
      setCreateOpen(false)
      setVaultForm({
        name: "",
        description: "",
        managementFee: "200",
        performanceFee: "2000",
        minDeposit: "10",
        maxCapacity: "10000"
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to create vault")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount) return

    setIsDepositing(true)
    try {
      await depositToVault(selectedVault.id, parseFloat(depositAmount))
      
      toast.success(`Deposited ${depositAmount} APT successfully!`)
      
      setDepositOpen(false)
      setDepositAmount("")
      setSelectedVault(null)
    } catch (error: any) {
      toast.error(error.message || "Deposit failed")
    } finally {
      setIsDepositing(false)
    }
  }

  const handleWithdraw = async (vaultId: number, shares: number) => {
    try {
      await withdrawFromVault(vaultId, shares)
      toast.success("Withdrawal successful!")
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed")
    }
  }

  const topTraders = [
    { 
      id: 1, 
      name: "0x742d...8f9a", 
      pnl: "+45.2%", 
      return7d: "+12.3%", 
      return30d: "+45.2%", 
      followers: 1234,
      strategy: "Swing Trading"
    },
    { 
      id: 2, 
      name: "0x9fc1...3e2d", 
      pnl: "+38.5%", 
      return7d: "+8.5%", 
      return30d: "+38.5%", 
      followers: 892,
      strategy: "Yield Farming"
    },
    { 
      id: 3, 
      name: "0x1a3b...7c5e", 
      pnl: "+62.1%", 
      return7d: "+18.4%", 
      return30d: "+62.1%", 
      followers: 2156,
      strategy: "Scalping"
    },
  ]

  const myVaults = [
    { id: 1, trader: "0x742d...8f9a", invested: 1000, current: 1234, pnl: "+23.4%", allocation: "45%" },
    { id: 2, trader: "0x9fc1...3e2d", invested: 500, current: 585, pnl: "+17.0%", allocation: "25%" },
    { id: 3, trader: "0x1a3b...7c5e", invested: 750, current: 912, pnl: "+21.6%", allocation: "30%" },
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-extralight text-gray-900">Copy Trading Vaults</h1>
          <p className="text-sm text-gray-500 font-light">Follow top traders automatically</p>
        </div>

        <Card className="mb-8 bg-white border-border/50 shadow-sm rounded-xl hover:shadow-md transition-all duration-300">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">DEPOSITS</div>
                <div className="text-2xl font-extralight text-gray-900">$2,250</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">Current Value</div>
                <div className="text-2xl font-extralight text-green-600">$2,731</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-light mb-1">Total P&L</div>
                <div className="text-2xl font-extralight text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-5 w-5" />
                  +21.4%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-border/30 rounded-xl">
            <TabsTrigger value="leaderboard" className="font-light">Top Traders</TabsTrigger>
            <TabsTrigger value="myvaults" className="font-light">My Vaults</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            {topTraders.map((trader, index) => (
              <Card key={trader.id} className="bg-white border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-light text-lg text-foreground font-mono">{trader.name}</div>
                        <div className="flex items-center gap-2 text-sm font-light text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {trader.followers.toLocaleString()} followers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extralight text-success">{trader.pnl}</div>
                      <div className="text-xs font-light text-muted-foreground">30d return</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-white to-primary/5 rounded-xl p-4 border border-border/30">
                      <div className="text-xs font-light text-muted-foreground mb-2">7d Return</div>
                      <div className="text-lg font-light text-success">{trader.return7d}</div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-primary/5 rounded-xl p-4 border border-border/30">
                      <div className="text-xs font-light text-muted-foreground mb-2">Strategy</div>
                      <div className="text-sm font-light text-foreground">{trader.strategy}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Dialog open={depositOpen && selectedVault?.id === trader.id} onOpenChange={(open) => {
                      setDepositOpen(open)
                      if (!open) setSelectedVault(null)
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-primary hover:bg-primary/90 text-white font-light transition-all duration-200 shadow-sm hover:shadow-md"
                          onClick={() => {
                            setSelectedVault(trader)
                            setDepositOpen(true)
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Follow Trader
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-border/50">
                        <DialogHeader>
                          <DialogTitle className="font-light">Follow {trader.name}</DialogTitle>
                          <DialogDescription className="font-light">
                            Allocate funds to copy this trader's strategy
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label className="font-light">Amount (USDC)</Label>
                            <Input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="border-border/50 font-light"
                            />
                          </div>
                          <div className="bg-gradient-to-br from-white to-primary/5 rounded-xl p-4 space-y-2 border border-border/30">
                            <div className="flex justify-between text-sm">
                              <span className="font-light text-muted-foreground">Trader</span>
                              <span className="font-light">{trader.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-light text-muted-foreground">Expected ROI</span>
                              <span className="font-light text-success">{trader.pnl}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-light text-muted-foreground">Strategy</span>
                              <span className="font-light">{trader.strategy}</span>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setDepositOpen(false)
                            setSelectedVault(null)
                            setAmount("100")
                          }} className="border-border/50 font-light">Cancel</Button>
                          <Button onClick={() => {
                            handleDeposit()
                          }} className="bg-primary hover:bg-primary/90 text-white font-light">
                            Confirm & Follow
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="myvaults" className="space-y-4">
            {myVaults.map((vault) => (
              <Card key={vault.id} className="bg-white border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="font-light text-lg mb-1">{vault.trader}</div>
                      <div className="text-sm font-light text-muted-foreground">Allocation: {vault.allocation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extralight text-success">{vault.pnl}</div>
                      <div className="text-xs font-light text-muted-foreground">P&L</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-white to-primary/5 rounded-xl p-4 border border-border/30">
                      <div className="text-xs font-light text-muted-foreground mb-2">Invested</div>
                      <div className="text-lg font-light">${vault.invested}</div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-primary/5 rounded-xl p-4 border border-border/30">
                      <div className="text-xs font-light text-muted-foreground mb-2">Current Value</div>
                      <div className="text-lg font-light text-success">${vault.current}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="flex-1 border-primary/50 text-primary hover:bg-primary/5 font-light transition-all duration-200">
                        Withdraw
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-primary/50 text-primary hover:bg-primary/5 font-light transition-all duration-200">
                        Add Funds
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/streams">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white">
                          Stream Profits
                        </Button>
                      </Link>
                      <Link href="/remit">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-white">
                          Send as Remit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="backdrop-blur-xl bg-card border-border">
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                <h3 className="font-bold text-lg mb-2">Portfolio Summary</h3>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-2xl font-bold text-green-400">+$481</div>
                    <div className="text-xs text-muted-foreground">Total Earnings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-xs text-muted-foreground">Active Vaults</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">+21.4%</div>
                    <div className="text-xs text-muted-foreground">Avg Return</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}
