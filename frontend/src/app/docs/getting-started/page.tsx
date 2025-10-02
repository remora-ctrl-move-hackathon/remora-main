"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink
} from "lucide-react"

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <Link href="/docs" className="text-primary hover:underline">Documentation</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Getting Started</span>
        </nav>

        <div className="max-w-4xl">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Getting Started</h1>
            <p className="text-xl text-gray-600 mb-6">
              Welcome to Remora Finance! This guide will help you get started with the platform 
              and understand its core features.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Beginner Friendly
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                5 min read
              </Badge>
            </div>
          </div>

          {/* What is Remora */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What is Remora?</h2>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">
                  Remora is a comprehensive DeFi platform built on Aptos blockchain that provides:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Perpetual Trading</p>
                      <p className="text-sm text-blue-700">Trade derivatives with up to 150x leverage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Smart Vaults</p>
                      <p className="text-sm text-green-700">Automated yield generation strategies</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">Streaming Payments</p>
                      <p className="text-sm text-purple-700">Real-time money flows</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <ArrowRight className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-900">Global Remittance</p>
                      <p className="text-sm text-orange-700">Cross-border payment solutions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* First Steps */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">First Steps</h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Connect Your Wallet
                      </CardTitle>
                      <CardDescription>
                        Before using Remora, you'll need an Aptos-compatible wallet
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="border rounded-lg p-4 text-center">
                      <h4 className="font-medium mb-2">Petra Wallet</h4>
                      <p className="text-sm text-gray-600 mb-3">Most popular Aptos wallet</p>
                      <a href="https://petra.app/" target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="w-full">
                          Download <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      </a>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <h4 className="font-medium mb-2">Martian Wallet</h4>
                      <p className="text-sm text-gray-600 mb-3">Feature-rich alternative</p>
                      <a href="https://martianwallet.xyz/" target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="w-full">
                          Download <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      </a>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <h4 className="font-medium mb-2">Pontem Wallet</h4>
                      <p className="text-sm text-gray-600 mb-3">Developer-focused wallet</p>
                      <a href="https://pontem.network/wallet" target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="w-full">
                          Download <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      </a>
                    </div>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>To connect:</strong> Install your preferred wallet → Create or import wallet → 
                      Visit app.remora.finance → Click "Connect Wallet" → Select your wallet and approve
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Fund Your Wallet
                      </CardTitle>
                      <CardDescription>
                        You'll need APT and USDC tokens to use Remora features
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-blue-900">Getting APT:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Buy on centralized exchanges (Binance, Coinbase, etc.)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Use cross-chain bridges from other networks
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Receive from other Aptos users
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-green-900">Getting USDC:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Bridge from other networks using LayerZero
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Swap APT for USDC on Aptos DEXs
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Receive from other users
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <CardTitle>Explore the Dashboard</CardTitle>
                      <CardDescription>
                        Once connected, you'll see the main dashboard with key features
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm"><strong>Portfolio Overview</strong> - Your total balance and performance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm"><strong>Quick Actions</strong> - Fast access to key features</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm"><strong>Market Data</strong> - Real-time prices and trends</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm"><strong>Recent Activity</strong> - Your transaction history</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Your First Transaction */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your First Transaction</h2>
            <Card>
              <CardHeader>
                <CardTitle>Let's walk through making your first trade:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-blue-900 mb-2">Step 1: Navigate to Trading</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Click "Trading" in the main navigation</li>
                      <li>2. Select a trading pair (e.g., BTC/USD)</li>
                      <li>3. Review the current price and market data</li>
                    </ol>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-green-900 mb-2">Step 2: Place Your First Order</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>1. Choose "Market Order" for instant execution</p>
                      <p>2. Set your position parameters:</p>
                      <div className="ml-4 bg-gray-50 p-3 rounded">
                        <p><strong>Size:</strong> $100 (your position value)</p>
                        <p><strong>Collateral:</strong> $20 (your risk amount)</p>
                        <p><strong>Direction:</strong> Long (betting price goes up)</p>
                      </div>
                      <p>3. Review the order details:</p>
                      <div className="ml-4 bg-blue-50 p-3 rounded">
                        <p><strong>Leverage:</strong> 5x ($100 position ÷ $20 collateral)</p>
                        <p><strong>Liquidation price:</strong> ~$48,000 (if BTC at $50,000)</p>
                      </div>
                      <p>4. Click "Place Order" and confirm in your wallet</p>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-purple-900 mb-2">Step 3: Monitor Your Position</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• View your position in the "Positions" tab</li>
                      <li>• Monitor real-time PnL</li>
                      <li>• Set stop-loss or take-profit if desired</li>
                      <li>• Close when ready by clicking "Close Position"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Safety Tips */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Safety Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Start Small
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Begin with small amounts while learning</li>
                    <li>• Use lower leverage (2-5x) initially</li>
                    <li>• Practice on testnet first if available</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Risk Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Never invest more than you can afford to lose</li>
                    <li>• Set stop-losses to limit downside</li>
                    <li>• Diversify across different strategies</li>
                    <li>• Keep emergency funds outside DeFi</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> DeFi protocols carry inherent risks including smart contract bugs, 
                market volatility, and potential loss of funds. Always do your own research and start with 
                amounts you can afford to lose.
              </AlertDescription>
            </Alert>
          </section>

          {/* What's Next */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What's Next?</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-6">
                  Now that you're set up, explore these advanced features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/docs/modules/vaults">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Create a Vault</p>
                        <p className="text-sm text-gray-600">Set up automated yield strategies</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/docs/modules/streaming">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Set Up Streaming</p>
                        <p className="text-sm text-gray-600">Create recurring payment flows</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/docs/modules/trading">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Advanced Trading</p>
                        <p className="text-sm text-gray-600">Use limit orders and stop-losses</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <a href="https://discord.gg/remora" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                      <div className="text-left">
                        <p className="font-medium">Join the Community</p>
                        <p className="text-sm text-gray-600">Connect with other users on Discord</p>
                      </div>
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t">
            <Link href="/docs">
              <Button variant="ghost">
                ← Back to Documentation
              </Button>
            </Link>
            <Link href="/docs/modules/trading">
              <Button>
                Next: Trading Guide →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}