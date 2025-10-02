"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, TrendingUp, Users, DollarSign, Shield,
  ArrowUpRight, ArrowDownRight, Loader2, PieChart,
  BarChart3, Activity, Wallet, Trophy, UserPlus, Minus
} from "lucide-react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useVault } from "@/hooks/useVault"
import { VAULT_STATUS } from "@/config/aptos"
import toast from "react-hot-toast"
import Link from "next/link"
import { AnimatedNumber } from "@/components/ui/live-indicator"

export default function Vault() {
  const { connected } = useWallet()
  const {
    loading,
    userVaults,
    managedVaults,
    allVaults,
    totalValueLocked,
    createVault,
    depositToVault,
    withdrawFromVault,
    getInvestorShares,
    fetchUserVaults
  } = useVault()

  const [openCreate, setOpenCreate] = useState(false)
  const [openDeposit, setOpenDeposit] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [selectedVault, setSelectedVault] = useState<any>(null)
  const [userShares, setUserShares] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<"all" | "invested" | "managed" | "leaderboard">("all")
  
  const [vaultForm, setVaultForm] = useState({
    name: "",
    description: "",
    managementFee: "2",
    performanceFee: "20",
    minDeposit: "100",
    isMultiSig: false,
    signers: [""],
    threshold: "1"
  })

  const [depositAmount, setDepositAmount] = useState("100")
  const [withdrawAmount, setWithdrawAmount] = useState("0")
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)

  // Cooldown timer effect
  useEffect(() => {
    if (!cooldownEndTime) return

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownEndTime - Date.now()) / 1000))
      setCooldownSeconds(remaining)

      if (remaining === 0) {
        setCooldownEndTime(null)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldownEndTime])

  const handleCreateVault = async () => {
    if (!connected) {
      toast.error("Please connect your wallet")
      return
    }

    try {
      await createVault({
        name: vaultForm.name,
        description: vaultForm.description,
        strategy: "Multi-strategy",
        managementFee: parseFloat(vaultForm.managementFee) / 100,
        performanceFee: parseFloat(vaultForm.performanceFee) / 100,
        minInvestment: parseFloat(vaultForm.minDeposit),
        maxInvestors: 100
      })

      setOpenCreate(false)
      setVaultForm({
        name: "",
        description: "",
        managementFee: "2",
        performanceFee: "20",
        minDeposit: "100",
        isMultiSig: false,
        signers: [""],
        threshold: "1"
      })
      
      toast.success("Vault created successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to create vault")
    }
  }

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount) return

    const amount = parseFloat(depositAmount)
    const minInvestment = selectedVault.minInvestment || 0

    if (amount < minInvestment) {
      toast.error(`Minimum deposit is ${minInvestment} APT`)
      return
    }

    try {
      await depositToVault(selectedVault.vaultId, amount)

      // Start 1-minute cooldown timer
      const endTime = Date.now() + 60000 // 60 seconds
      setCooldownEndTime(endTime)

      setOpenDeposit(false)
      setDepositAmount("100")
      toast.success(`Deposited ${depositAmount} APT successfully! You can withdraw after 1 minute.`)
    } catch (error: any) {
      toast.error(error.message || "Failed to deposit")
    }
  }

  const openWithdrawDialog = async (vault: any) => {
    try {
      setSelectedVault(vault)
      // Get user's shares in this vault
      const shares = await getInvestorShares(vault.vaultId)
      setUserShares(shares)
      setWithdrawAmount(shares.toString())
      setOpenWithdraw(true)
    } catch (error: any) {
      toast.error("Failed to get shares information")
    }
  }

  const handleWithdraw = async () => {
    if (!selectedVault || !withdrawAmount) return

    const sharesToWithdraw = parseFloat(withdrawAmount)
    if (sharesToWithdraw <= 0 || sharesToWithdraw > userShares) {
      toast.error("Invalid withdrawal amount")
      return
    }

    try {
      await withdrawFromVault(selectedVault.vaultId, sharesToWithdraw)
      setOpenWithdraw(false)
      setWithdrawAmount("0")
      toast.success("Withdrawal successful!")
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw")
    }
  }

  const getStatusBadge = (status: number) => {
    switch(status) {
      case VAULT_STATUS.ACTIVE:
        return <Badge className="bg-primary/10 text-primary border-0">Active</Badge>
      case VAULT_STATUS.PAUSED:
        return <Badge className="bg-muted text-muted-foreground border-0">Paused</Badge>
      case VAULT_STATUS.CLOSED:
        return <Badge className="bg-foreground/10 text-foreground border-0">Closed</Badge>
      default:
        return null
    }
  }

  // Display vaults based on active tab
  const displayVaults = activeTab === "all" ? allVaults :
                       activeTab === "invested" ? userVaults :
                       activeTab === "managed" ? managedVaults : []

  // Calculate total stats
  const totalInvested = userVaults.reduce((acc, v) => acc + (v.totalValue || 0), 0)
  const avgAPY = userVaults.length > 0
    ? 8.5 // Static demo value since performance not in interface
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-foreground">Copy Trading Vaults</h1>
            <p className="text-sm text-muted-foreground font-light mt-1">Follow top traders automatically</p>
          </div>
          <div className="flex gap-3">
            <Link href="/vault/trading">
              <Button variant="outline" className="bg-white">
                <BarChart3 className="h-4 w-4 mr-2" />
                Perpetual Trading
              </Button>
            </Link>
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Vault
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Trading Vault</DialogTitle>
                <DialogDescription>
                  Set up a new vault for others to invest in your strategy
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vault Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., DeFi Yield Strategy" 
                    value={vaultForm.name}
                    onChange={(e) => setVaultForm({...vaultForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your investment strategy..." 
                    value={vaultForm.description}
                    onChange={(e) => setVaultForm({...vaultForm, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mgmtFee">Management Fee (%)</Label>
                    <Input 
                      id="mgmtFee" 
                      type="number" 
                      placeholder="2" 
                      value={vaultForm.managementFee}
                      onChange={(e) => setVaultForm({...vaultForm, managementFee: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perfFee">Performance Fee (%)</Label>
                    <Input 
                      id="perfFee" 
                      type="number" 
                      placeholder="20" 
                      value={vaultForm.performanceFee}
                      onChange={(e) => setVaultForm({...vaultForm, performanceFee: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minDeposit">Minimum Deposit (APT)</Label>
                  <Input 
                    id="minDeposit" 
                    type="number" 
                    placeholder="100" 
                    value={vaultForm.minDeposit}
                    onChange={(e) => setVaultForm({...vaultForm, minDeposit: e.target.value})}
                  />
                </div>
                
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Shield className="h-4 w-4" />
                    Advanced Security Options
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="multisig" className="text-sm">Enable Multi-Signature</Label>
                      <Switch
                        id="multisig"
                        checked={vaultForm.isMultiSig}
                        onCheckedChange={(checked) => setVaultForm({...vaultForm, isMultiSig: checked})}
                      />
                    </div>
                    
                    {vaultForm.isMultiSig && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm">Signers (Wallet Addresses)</Label>
                          {vaultForm.signers.map((signer, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={signer}
                                onChange={(e) => {
                                  const newSigners = [...vaultForm.signers]
                                  newSigners[index] = e.target.value
                                  setVaultForm({...vaultForm, signers: newSigners})
                                }}
                                placeholder="0x..."
                              />
                              {index === vaultForm.signers.length - 1 ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setVaultForm({...vaultForm, signers: [...vaultForm.signers, ""]})}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newSigners = vaultForm.signers.filter((_, i) => i !== index)
                                    setVaultForm({...vaultForm, signers: newSigners})
                                  }}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="threshold" className="text-sm">Required Signatures</Label>
                          <Input
                            id="threshold"
                            type="number"
                            min="1"
                            max={vaultForm.signers.length}
                            value={vaultForm.threshold}
                            onChange={(e) => setVaultForm({...vaultForm, threshold: e.target.value})}
                          />
                          <p className="text-xs text-muted-foreground">
                            {vaultForm.threshold} out of {vaultForm.signers.filter(s => s).length} signatures required
                          </p>
                        </div>
                      </>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpenCreate(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateVault} disabled={!vaultForm.name}>
                  Create Vault
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-light">TVL</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <AnimatedNumber 
                value={totalValueLocked} 
                decimals={2} 
                suffix=" APT"
                className="text-2xl font-light text-foreground"
              />
              <div className="text-xs text-muted-foreground mt-1">Total Value Locked</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-light">Active Vaults</span>
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light text-foreground">{allVaults.filter(v => v.status === VAULT_STATUS.ACTIVE).length}</div>
              <div className="text-xs text-muted-foreground mt-1">Currently active</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-light">Your Investment</span>
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <AnimatedNumber 
                value={totalInvested} 
                decimals={2} 
                suffix=" APT"
                className="text-2xl font-light text-foreground"
              />
              <div className="text-xs text-muted-foreground mt-1">Across {userVaults.length} vaults</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-light">Avg APY</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <AnimatedNumber 
                value={avgAPY} 
                decimals={2} 
                suffix="%"
                className="text-2xl font-light text-primary"
              />
              <div className="text-xs text-muted-foreground mt-1">Average returns</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-white border border-border/30">
            <TabsTrigger value="all">All Vaults</TabsTrigger>
            <TabsTrigger value="invested">Your Investments</TabsTrigger>
            <TabsTrigger value="managed">Managed Vaults</TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Top Traders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayVaults.length === 0 ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-muted-foreground">No vaults available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayVaults.map((vault, index) => (
                  <Card key={`${vault.vaultId}-${index}`} className="bg-white border-border/50 hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-semibold">{vault.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Manager: {vault.manager.slice(0, 8)}...{vault.manager.slice(-6)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(vault.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">TVL</p>
                          <p className="font-semibold">{(vault.totalValue || 0).toFixed(2)} APT</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Performance</p>
                          <p className={`font-semibold text-primary`}>
                            +8.5%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Investors</p>
                          <p className="font-semibold">{vault.currentInvestors || 0}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Management Fee</span>
                          <span>{((vault.managementFee || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Performance Fee</span>
                          <span>{((vault.performanceFee || 0) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Investment</span>
                          <span>{vault.minInvestment || 0} APT</span>
                        </div>
                      </div>

                      {vault.status === VAULT_STATUS.ACTIVE && (
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => {
                              setSelectedVault(vault)
                              setOpenDeposit(true)
                            }}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            Deposit
                          </Button>
                          {userVaults.some(v => v.vaultId === vault.vaultId) && (
                            <Button 
                              variant="outline"
                              className="flex-1"
                              onClick={() => openWithdrawDialog(vault)}
                            >
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                              Withdraw
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="invested" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userVaults.length === 0 ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-muted-foreground">You haven't invested in any vaults yet</p>
                  <Button className="mt-4" disabled={!connected}>
                    Explore vaults
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userVaults.map((vault, index) => (
                  <Card key={`${vault.vaultId}-${index}`} className="bg-white border-border/50 hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-semibold">{vault.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Manager: {vault.manager.slice(0, 8)}...{vault.manager.slice(-6)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(vault.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">TVL</p>
                          <p className="font-semibold">{(vault.totalValue || 0).toFixed(2)} APT</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Performance</p>
                          <p className={`font-semibold text-primary`}>
                            +8.5%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Investors</p>
                          <p className="font-semibold">{vault.currentInvestors || 0}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Management Fee</span>
                          <span>{((vault.managementFee || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Performance Fee</span>
                          <span>{((vault.performanceFee || 0) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Investment</span>
                          <span>{vault.minInvestment || 0} APT</span>
                        </div>
                      </div>

                      {vault.status === VAULT_STATUS.ACTIVE && (
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => {
                              setSelectedVault(vault)
                              setOpenDeposit(true)
                            }}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            Deposit
                          </Button>
                          <Button 
                            variant="outline"
                            className="flex-1"
                            onClick={() => openWithdrawDialog(vault)}
                          >
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            Withdraw
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="managed" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : managedVaults.length === 0 ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-muted-foreground">You haven't created any vaults yet</p>
                  <Button 
                    onClick={() => setOpenCreate(true)} 
                    className="mt-4"
                    disabled={!connected}
                  >
                    Create your first vault
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {managedVaults.map((vault, index) => (
                  <Card key={`${vault.vaultId}-${index}`} className="bg-white border-border/50 hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-semibold">{vault.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Manager: {vault.manager.slice(0, 8)}...{vault.manager.slice(-6)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(vault.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">TVL</p>
                          <p className="font-semibold">{(vault.totalValue || 0).toFixed(2)} APT</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Performance</p>
                          <p className={`font-semibold text-primary`}>
                            +8.5%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Investors</p>
                          <p className="font-semibold">{vault.currentInvestors || 0}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Management Fee</span>
                          <span>{((vault.managementFee || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Performance Fee</span>
                          <span>{((vault.performanceFee || 0) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Investment</span>
                          <span>{vault.minInvestment || 0} APT</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="leaderboard" className="mt-6">
            <div className="grid gap-4">
              {/* Top Traders List */}
              {[1, 2, 3, 4, 5].map((rank) => (
                <Card key={rank} className="p-6 bg-white border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                        #{rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Trader{rank}</span>
                          {rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          0x{Math.random().toString(36).substring(2, 8)}...{Math.random().toString(36).substring(2, 6)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-medium text-primary">+{(Math.random() * 50 + 10).toFixed(2)}%</div>
                        <div className="text-sm text-muted-foreground">30d ROI</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{(Math.random() * 200 + 50).toFixed(0)}</div>
                        <div className="text-sm text-muted-foreground">Followers</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Deposit Dialog */}
        <Dialog open={openDeposit} onOpenChange={setOpenDeposit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit to Vault</DialogTitle>
              <DialogDescription>
                Invest in {selectedVault?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Amount (APT)</Label>
                <Input 
                  id="depositAmount" 
                  type="number" 
                  placeholder="100" 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: {selectedVault?.minInvestment} APT
                </p>
              </div>
              
              {selectedVault && (
                <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected APY</span>
                    <span className="text-primary">8.50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Management Fee</span>
                    <span>{((selectedVault.managementFee || 0) * 100).toFixed(1)}% annually</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Performance Fee</span>
                    <span>{((selectedVault.performanceFee || 0) * 100).toFixed(0)}% of profits</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpenDeposit(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeposit} 
                disabled={!depositAmount || parseFloat(depositAmount) < (selectedVault?.minInvestment || 0)}
              >
                Deposit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw from Vault</DialogTitle>
              <DialogDescription>
                Withdraw your investment from {selectedVault?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Cooldown Warning */}
              {cooldownSeconds > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    ⏱️ Withdrawal Cooldown Active
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can withdraw in {cooldownSeconds} second{cooldownSeconds !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Shares to Withdraw</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={userShares}
                  disabled={cooldownSeconds > 0}
                />
                <p className="text-xs text-muted-foreground">
                  Your shares: {userShares.toFixed(6)}
                </p>
              </div>

              {selectedVault && userShares > 0 && (
                <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Shares</span>
                    <span>{userShares.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Value</span>
                    <span>
                      {selectedVault.totalShares > 0 
                        ? ((parseFloat(withdrawAmount || "0") * selectedVault.totalValue) / selectedVault.totalShares).toFixed(2)
                        : "0.00"
                      } APT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">% of Total Shares</span>
                    <span>
                      {userShares > 0 
                        ? ((parseFloat(withdrawAmount || "0") / userShares) * 100).toFixed(1)
                        : "0"
                      }%
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setWithdrawAmount((userShares * 0.25).toString())}
                >
                  25%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setWithdrawAmount((userShares * 0.5).toString())}
                >
                  50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setWithdrawAmount((userShares * 0.75).toString())}
                >
                  75%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setWithdrawAmount(userShares.toString())}
                >
                  100%
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpenWithdraw(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > userShares || cooldownSeconds > 0}
              >
                Withdraw
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}