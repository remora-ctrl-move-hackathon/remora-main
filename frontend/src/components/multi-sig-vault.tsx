"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Shield, Users, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

interface MultiSigTransaction {
  id: string
  type: 'deposit' | 'withdraw' | 'trade'
  amount: number
  token: string
  description: string
  requiredSignatures: number
  currentSignatures: number
  signers: string[]
  status: 'pending' | 'executed' | 'rejected'
  timestamp: Date
}

export function MultiSigVault() {
  const [transactions, setTransactions] = useState<MultiSigTransaction[]>([
    {
      id: '1',
      type: 'withdraw',
      amount: 10000,
      token: 'USDC',
      description: 'Monthly operational expenses',
      requiredSignatures: 3,
      currentSignatures: 2,
      signers: ['0x1234...5678', '0x8765...4321'],
      status: 'pending',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      type: 'trade',
      amount: 5000,
      token: 'APT',
      description: 'Buy APT for liquidity provision',
      requiredSignatures: 2,
      currentSignatures: 2,
      signers: ['0x1234...5678', '0xabcd...efgh'],
      status: 'executed',
      timestamp: new Date(Date.now() - 86400000)
    }
  ])
  
  const [signers, setSigners] = useState([
    { address: '0x1234...5678', name: 'Alice', role: 'Admin' },
    { address: '0x8765...4321', name: 'Bob', role: 'Treasurer' },
    { address: '0xabcd...efgh', name: 'Charlie', role: 'Member' }
  ])
  
  const [newSigner, setNewSigner] = useState('')
  const [threshold, setThreshold] = useState(2)

  const handleSign = (txId: string) => {
    setTransactions(transactions.map(tx => {
      if (tx.id === txId) {
        const newSignatures = tx.currentSignatures + 1
        return {
          ...tx,
          currentSignatures: newSignatures,
          status: newSignatures >= tx.requiredSignatures ? 'executed' : 'pending'
        }
      }
      return tx
    }))
    toast.success("Transaction signed successfully!")
  }

  const handleAddSigner = () => {
    if (newSigner) {
      setSigners([...signers, {
        address: newSigner,
        name: `User ${signers.length + 1}`,
        role: 'Member'
      }])
      setNewSigner('')
      toast.success("Signer added successfully!")
    }
  }

  return (
    <div className="space-y-6">
      {/* Multi-Sig Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-Signature Settings
          </CardTitle>
          <CardDescription>
            Manage vault security with multiple signers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Signature Threshold</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input 
                type="number" 
                value={threshold} 
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-24"
                min={1}
                max={signers.length}
              />
              <span className="text-sm text-muted-foreground">
                of {signers.length} signers required
              </span>
            </div>
          </div>
          
          <div>
            <Label className="mb-3 block">Current Signers</Label>
            <div className="space-y-2">
              {signers.map((signer) => (
                <div key={signer.address} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{signer.name}</p>
                      <p className="text-xs text-muted-foreground">{signer.address}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{signer.role}</Badge>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Add signer address (0x...)" 
              value={newSigner}
              onChange={(e) => setNewSigner(e.target.value)}
            />
            <Button onClick={handleAddSigner}>Add Signer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
          <CardDescription>
            Transactions waiting for signatures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.type === 'withdraw' ? 'destructive' : 'default'}>
                      {tx.type}
                    </Badge>
                    <span className="font-semibold">
                      {tx.amount} {tx.token}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{tx.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {tx.timestamp.toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={
                    tx.status === 'executed' ? 'default' : 
                    tx.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }
                >
                  {tx.status === 'pending' && (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {tx.status === 'executed' && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {tx.status === 'rejected' && (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {tx.status}
                </Badge>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Signatures</span>
                  <span className="text-sm font-medium">
                    {tx.currentSignatures} / {tx.requiredSignatures}
                  </span>
                </div>
                <Progress 
                  value={(tx.currentSignatures / tx.requiredSignatures) * 100} 
                  className="h-2"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {tx.signers.map((signer) => (
                    <Badge key={signer} variant="outline" className="text-xs">
                      {signer}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {tx.status === 'pending' && tx.currentSignatures < tx.requiredSignatures && (
                <Button 
                  onClick={() => handleSign(tx.id)} 
                  size="sm" 
                  className="w-full"
                >
                  Sign Transaction
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}