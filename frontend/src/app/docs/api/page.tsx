"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { 
  Code2, 
  Database, 
  Settings, 
  Zap,
  ArrowRight,
  Code,
  Info,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink
} from "lucide-react"

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <Link href="/docs" className="text-primary hover:underline">Documentation</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">API Reference</span>
        </nav>

        <div className="max-w-6xl">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">API Reference</h1>
                <p className="text-xl text-gray-600 mt-2">
                  Complete API documentation for integrating with Remora Finance
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                REST API
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                TypeScript SDK
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Real-time WebSocket
              </Badge>
            </div>
          </div>

          {/* Overview */}
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Overview</CardTitle>
                <CardDescription>
                  The Remora platform provides a comprehensive set of APIs and services for 
                  interacting with DeFi protocols on the Aptos blockchain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-900">Trading Services</h3>
                    <p className="text-sm text-blue-700">Perpetual trading with Merkle Trade integration</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-900">Vault Management</h3>
                    <p className="text-sm text-green-700">Automated yield strategies and portfolio management</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-purple-900">Real-time Data</h3>
                    <p className="text-sm text-purple-700">Live price feeds and position updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Quick Start */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Start</h2>
            
            <Tabs defaultValue="installation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="installation">Installation</TabsTrigger>
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="first-request">First Request</TabsTrigger>
              </TabsList>
              
              <TabsContent value="installation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Install Dependencies</CardTitle>
                    <CardDescription>
                      Get started with the required packages for Remora integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
{`# Install core dependencies
npm install @merkletrade/ts-sdk @aptos-labs/ts-sdk @aptos-labs/wallet-adapter-react

# Install additional utilities
npm install react-hot-toast

# TypeScript types (if needed)
npm install -D @types/react`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="authentication" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Wallet Authentication</CardTitle>
                    <CardDescription>
                      Connect and authenticate with Aptos wallets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
{`import { useWallet } from '@aptos-labs/wallet-adapter-react'

function YourComponent() {
  const { 
    connected, 
    account, 
    signAndSubmitTransaction 
  } = useWallet()
  
  if (!connected) {
    return <WalletSelector />
  }
  
  // Use wallet for transactions
  const userAddress = account.address
  return <TradingInterface />
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="first-request" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Make Your First API Call</CardTitle>
                    <CardDescription>
                      Get user positions using the trading service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">
{`import { perpetualTradingService } from '@/services/perpetual-trading.service'

async function getUserData(userAddress: string) {
  try {
    // Get user positions
    const positions = await perpetualTradingService
      .getUserPositions(userAddress)
    
    console.log('User positions:', positions)
    return positions
  } catch (error) {
    console.error('API Error:', error)
  }
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Core Services */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Core Services</h2>
            
            <div className="space-y-6">
              {/* Trading Service */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    PerpetualTradingService
                  </CardTitle>
                  <CardDescription>
                    Handles all perpetual trading operations through the Merkle Trade Protocol
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Order Management</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• <code className="text-xs bg-gray-100 px-1 rounded">placeMarketOrder()</code></li>
                        <li>• <code className="text-xs bg-gray-100 px-1 rounded">placeLimitOrder()</code></li>
                        <li>• <code className="text-xs bg-gray-100 px-1 rounded">cancelOrder()</code></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Data Retrieval</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• <code className="text-xs bg-gray-100 px-1 rounded">getUserPositions()</code></li>
                        <li>• <code className="text-xs bg-gray-100 px-1 rounded">getTradingHistory()</code></li>
                        <li>• <code className="text-xs bg-gray-100 px-1 rounded">getMarketPrice()</code></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-3 rounded">
                    <div className="text-sm">
                      <span className="font-medium">Import:</span>
                      <code className="ml-2 text-xs bg-white px-2 py-1 rounded">
                        import {`{perpetualTradingService}`} from '@/services/perpetual-trading.service'
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* React Hook */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    usePerpetualTrading Hook
                  </CardTitle>
                  <CardDescription>
                    React hook for managing trading state and operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
                    <pre className="text-sm">
{`const {
  loading,              // Loading state
  positions,            // User's active positions
  orders,               // User's pending orders
  tradingHistory,       // Historical trades
  tradingStats,         // Trading statistics
  placeMarketOrder,     // Place market order function
  placeLimitOrder,      // Place limit order function
  cancelOrder,          // Cancel order function
  closePosition,        // Close position function
  fetchTradingData      // Refresh data function
} = usePerpetualTrading()`}
                    </pre>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      The hook automatically handles wallet state, data fetching, and error management.
                      It also includes built-in throttling to prevent API rate limiting.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* API Methods */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">API Methods</h2>
            
            <div className="space-y-6">
              {/* Place Market Order */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      placeMarketOrder()
                    </span>
                    <Badge variant="secondary">POST</Badge>
                  </CardTitle>
                  <CardDescription>
                    Places a market order for immediate execution at current market price
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Parameters</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p><strong>userAddress</strong> (string): User's wallet address</p>
                        <p><strong>params</strong> (OrderParams): Order configuration object</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">OrderParams Interface</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                        <pre className="text-sm">
{`interface OrderParams {
  pair: TradingPair     // e.g., 'BTC_USD'
  size: number          // Position size in USDC
  collateral: number    // Collateral in USDC
  isLong: boolean       // true for long, false for short
  isIncrease: boolean   // true for new position
  leverage?: number     // Optional leverage multiplier
}`}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Example Usage</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                        <pre className="text-sm">
{`const orderParams = {
  pair: 'BTC_USD',
  size: 1000,      // $1000 position
  collateral: 100, // $100 collateral (10x leverage)
  isLong: true,    // Long position
  isIncrease: true // Opening new position
}

const result = await placeMarketOrder(orderParams)
console.log('Transaction hash:', result.hash)`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Get User Positions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      getUserPositions()
                    </span>
                    <Badge variant="secondary">GET</Badge>
                  </CardTitle>
                  <CardDescription>
                    Retrieves all active positions for a user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Response Format</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                        <pre className="text-sm">
{`// Returns: Position[]
[
  {
    pair: 'BTC_USD',
    size: 1000,           // Position size in USDC
    collateral: 100,      // Collateral amount
    isLong: true,         // Position direction
    entryPrice: 50000,    // Entry price
    markPrice: 51000,     // Current market price
    pnl: 20,              // Unrealized PnL
    liquidationPrice: 45000, // Liquidation price
    timestamp: 1640995200000 // Position open time
  }
]`}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Usage Example</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                        <pre className="text-sm">
{`const positions = await getUserPositions(userAddress)

positions.forEach(position => {
  console.log(\`\${position.pair}: \$\${position.pnl} PnL\`)
})`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Error Handling */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Error Handling</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Common Error Codes</CardTitle>
                <CardDescription>
                  Handle these error scenarios in your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Error Code</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Solution</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b">
                        <td className="p-2"><code className="bg-red-50 text-red-700 px-2 py-1 rounded">INSUFFICIENT_COLLATERAL</code></td>
                        <td className="p-2">Not enough collateral for trade</td>
                        <td className="p-2">Add more USDC to wallet</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><code className="bg-red-50 text-red-700 px-2 py-1 rounded">POSITION_TOO_SMALL</code></td>
                        <td className="p-2">Below minimum position size</td>
                        <td className="p-2">Increase position size to $2+</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><code className="bg-red-50 text-red-700 px-2 py-1 rounded">LEVERAGE_TOO_HIGH</code></td>
                        <td className="p-2">Exceeding maximum leverage</td>
                        <td className="p-2">Reduce leverage below 150x</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2"><code className="bg-red-50 text-red-700 px-2 py-1 rounded">WALLET_NOT_CONNECTED</code></td>
                        <td className="p-2">Wallet not connected</td>
                        <td className="p-2">Connect wallet first</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Error Handling Example</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre className="text-sm">
{`try {
  await placeMarketOrder(params)
  toast.success('Order placed successfully!')
} catch (error) {
  switch (error.code) {
    case 'INSUFFICIENT_COLLATERAL':
      toast.error('Please add more USDC to your wallet')
      break
    case 'POSITION_TOO_SMALL':
      toast.error('Minimum position size is $2 USDC')
      break
    default:
      toast.error('Transaction failed. Please try again.')
  }
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Rate Limiting */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rate Limiting & Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Built-in Throttling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>API Call Cooldown:</span>
                      <span className="font-medium">15 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Refresh:</span>
                      <span className="font-medium">Every 30 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Concurrent:</span>
                      <span className="font-medium">5 requests</span>
                    </div>
                  </div>
                  
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      The usePerpetualTrading hook includes automatic throttling to prevent rate limiting.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Use batch operations when possible
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Cache frequently accessed data
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Implement proper error boundaries
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Use WebSocket for real-time updates
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SDKs */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">SDKs & Dependencies</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Core Dependencies</CardTitle>
                <CardDescription>
                  Required packages for full Remora integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                  <pre className="text-sm">
{`{
  "@merkletrade/ts-sdk": "^1.0.3",
  "@aptos-labs/ts-sdk": "latest", 
  "@aptos-labs/wallet-adapter-react": "latest",
  "next": "15.5.4",
  "react": "18.x",
  "typescript": "5.x",
  "react-hot-toast": "^2.4.1"
}`}
                  </pre>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Official SDKs</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Merkle Trade TypeScript SDK</li>
                      <li>• Aptos TypeScript SDK</li>
                      <li>• Aptos Wallet Adapter</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Additional Tools</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• React Hot Toast (notifications)</li>
                      <li>• Next.js (framework)</li>
                      <li>• TypeScript (type safety)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Try It Out */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Ready to Integrate?</CardTitle>
                <CardDescription className="text-base">
                  Start building with the Remora API
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="https://github.com/remora-ctrl-move-hackathon/remora-main" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="lg">
                      View Source Code <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                  <Link href="/docs/modules/trading">
                    <Button variant="outline" size="lg">
                      Trading Examples
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t">
            <Link href="/docs/modules/trading">
              <Button variant="ghost">
                ← Trading Module
              </Button>
            </Link>
            <Link href="/docs/deployment/production">
              <Button>
                Next: Deployment →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}