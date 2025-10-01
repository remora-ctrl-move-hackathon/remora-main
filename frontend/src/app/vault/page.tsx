"use client"

import { useState } from "react"
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
import { 
  Plus, TrendingUp, Users, DollarSign, Shield,
  ArrowUpRight, ArrowDownRight, Loader2, PieChart,
  BarChart3, Activity, Wallet
} from "lucide-react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useVault } from "@/hooks/useVault"
import { VAULT_STATUS } from "@/config/aptos"
import toast from "react-hot-toast"
import Link from "next/link"

export default function Vault() {
  const { connected } = useWallet()
  const { 
    loading,
    userVaults,
    managedVaults,
    totalValueLocked,
    createVault,
    depositToVault,
    withdrawFromVault,
    fetchUserVaults
  } = useVault()

  const [openCreate, setOpenCreate] = useState(false)
  const [openDeposit, setOpenDeposit] = useState(false)
  const [selectedVault, setSelectedVault] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"all" | "invested" | "managed">("all")
  
  const [vaultForm, setVaultForm] = useState({
    name: "",
    description: "",
    managementFee: "2",
    performanceFee: "20",
    minDeposit: "100"
  })

  const [depositAmount, setDepositAmount] = useState("100")

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
        minDeposit: "100"
      })
      
      toast.success("Vault created successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to create vault")
    }
  }

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount) return

    try {
      await depositToVault(selectedVault.vaultId, parseFloat(depositAmount))
      setOpenDeposit(false)
      setDepositAmount("100")
      toast.success(`Deposited ${depositAmount} APT successfully!`)
    } catch (error: any) {
      toast.error(error.message || "Failed to deposit")
    }
  }

  const handleWithdraw = async (vaultId: number, shares: number) => {
    try {
      await withdrawFromVault(vaultId, shares)
      toast.success("Withdrawal successful!")
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw")
    }
  }

  const getStatusBadge = (status: number) => {
    switch(status) {
      case VAULT_STATUS.ACTIVE:
        return <Badge className="bg-green-50 text-green-600 border-0">Active</Badge>
      case VAULT_STATUS.PAUSED:
        return <Badge className="bg-yellow-50 text-yellow-600 border-0">Paused</Badge>
      case VAULT_STATUS.CLOSED:
        return <Badge className="bg-red-50 text-red-600 border-0">Closed</Badge>
      default:
        return null
    }
  }

  // Remove duplicates by vaultId when combining arrays
  const allVaults = [...userVaults, ...managedVaults.filter(mv => 
    !userVaults.some(uv => uv.vaultId === mv.vaultId)
  )]
  const displayVaults = activeTab === "all" ? allVaults : 
                       activeTab === "invested" ? userVaults : managedVaults

  // Calculate total stats
  const totalInvested = userVaults.reduce((acc, v) => acc + (v.totalValue || 0), 0)
  const totalReturns = userVaults.reduce((acc, v) => {
    // Since we don't have performance data, calculate based on totalValue for now
    const returns = (v.totalValue || 0) * 0.05 // Assume 5% for demo
    return acc + returns
  }, 0)
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
            <h1 className="text-3xl font-light text-gray-900">Copy Trading Vaults</h1>
            <p className="text-sm text-gray-500 font-light mt-1">Follow top traders automatically</p>
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
                <span className="text-sm text-gray-500 font-light">TVL</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">{totalValueLocked.toFixed(2)} APT</div>
              <div className="text-xs text-gray-400 mt-1">Total Value Locked</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-light">Active Vaults</span>
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">{allVaults.filter(v => v.status === VAULT_STATUS.ACTIVE).length}</div>
              <div className="text-xs text-gray-400 mt-1">Currently active</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-light">Your Investment</span>
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light text-gray-900">{totalInvested.toFixed(2)} APT</div>
              <div className="text-xs text-gray-400 mt-1">Across {userVaults.length} vaults</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-light">Avg APY</span>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-light text-green-600">{avgAPY.toFixed(2)}%</div>
              <div className="text-xs text-gray-400 mt-1">Average returns</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-white border border-border/30">
            <TabsTrigger value="all">All Vaults</TabsTrigger>
            <TabsTrigger value="invested">Your Investments</TabsTrigger>
            <TabsTrigger value="managed">Managed Vaults</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayVaults.length === 0 ? (
              <Card className="bg-white border-border/50">
                <CardContent className="pt-6 text-center py-8">
                  <p className="text-gray-500">
                    {activeTab === "all" ? "No vaults available" : 
                     activeTab === "invested" ? "You haven't invested in any vaults yet" :
                     "You haven't created any vaults yet"}
                  </p>
                  <Button 
                    onClick={() => activeTab === "managed" ? setOpenCreate(true) : null} 
                    className="mt-4"
                    disabled={!connected}
                  >
                    {activeTab === "managed" ? "Create your first vault" : "Explore vaults"}
                  </Button>
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
                        {getStatusBadge(vault.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">TVL</p>
                          <p className="font-semibold">{(vault.totalValue || 0).toFixed(2)} APT</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Performance</p>
                          <p className={`font-semibold text-green-600`}>
                            +8.5%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Investors</p>
                          <p className="font-semibold">{vault.currentInvestors || 0}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Management Fee</span>
                          <span>{((vault.managementFee || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Performance Fee</span>
                          <span>{((vault.performanceFee || 0) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Min Investment</span>
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
                              onClick={() => handleWithdraw(vault.vaultId, 100)}
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
                <p className="text-xs text-gray-500">
                  Minimum: {selectedVault?.minInvestment} APT
                </p>
              </div>
              
              {selectedVault && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected APY</span>
                    <span className="text-green-600">8.50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Management Fee</span>
                    <span>{((selectedVault.managementFee || 0) * 100).toFixed(1)}% annually</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Performance Fee</span>
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
      </div>
    </div>
  )
}