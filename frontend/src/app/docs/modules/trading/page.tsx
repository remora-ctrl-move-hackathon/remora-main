"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { 
  TrendingUp, 
  Target, 
  Shield, 
  ArrowRight,
  Code,
  Info,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  DollarSign,
  Zap
} from "lucide-react"

export default function TradingDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <Link href="/docs" className="text-primary hover:underline">Documentation</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/docs/modules" className="text-primary hover:underline">Modules</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">Perpetual Trading</span>
        </nav>

        <div className="max-w-6xl">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Perpetual Trading Module</h1>
                <p className="text-xl text-gray-600 mt-2">
                  Advanced derivatives trading with Merkle Trade integration
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Production Ready
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Merkle Trade SDK
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                150x Leverage
              </Badge>
            </div>
          </div>

          {/* Overview */}
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Overview</CardTitle>
                <CardDescription>
                  The Perpetual Trading module integrates with Merkle Trade Protocol to provide 
                  advanced derivatives trading capabilities on the Aptos blockchain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-900">Instant Execution</h3>
                    <p className="text-sm text-blue-700">Market orders execute immediately at current prices</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-900">Precision Trading</h3>
                    <p className="text-sm text-green-700">Limit orders and advanced order types</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-purple-900">Risk Management</h3>
                    <p className="text-sm text-purple-700">Built-in leverage and exposure controls</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Features */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Core Trading Functions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Market Orders - Instant execution at current price
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Limit Orders - Execute at specific price levels
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Position Management - Open, close, and modify positions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Real-time Data - Live price feeds and updates
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Supported Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>BTC/USD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>ETH/USD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>APT/USD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>SOL/USD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>AVAX/USD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span>MATIC/USD</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Code Examples */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Usage Examples</h2>
            
            <Tabs defaultValue="market-order" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="market-order">Market Order</TabsTrigger>
                <TabsTrigger value="limit-order">Limit Order</TabsTrigger>
                <TabsTrigger value="position-management">Position Management</TabsTrigger>
              </TabsList>
              
              <TabsContent value="market-order" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Placing a Market Order
                    </CardTitle>
                    <CardDescription>
                      Execute a trade immediately at the current market price
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
{`import { usePerpetualTrading } from '@/hooks/usePerpetualTrading'

const { placeMarketOrder } = usePerpetualTrading()

const orderParams = {
  pair: 'BTC_USD',
  size: 1000,        // $1000 position
  collateral: 100,   // $100 collateral (10x leverage)
  isLong: true,      // Buy/Long position
  isIncrease: true   // Opening new position
}

await placeMarketOrder(orderParams)`}
                      </pre>
                    </div>
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This example opens a $1000 BTC long position with $100 collateral, 
                        resulting in 10x leverage.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="limit-order" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Placing a Limit Order
                    </CardTitle>
                    <CardDescription>
                      Set an order to execute when the price reaches a specific level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
{`const limitOrderParams = {
  pair: 'ETH_USD',
  size: 500,
  collateral: 50,
  isLong: false,      // Short position
  isIncrease: true,
  triggerPrice: 2800  // Execute when ETH hits $2800
}

await placeLimitOrder(limitOrderParams)`}
                      </pre>
                    </div>
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This limit order will open a $500 ETH short position when the price 
                        reaches $2800.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="position-management" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Managing Positions
                    </CardTitle>
                    <CardDescription>
                      View and close your active trading positions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
{`const { positions, closePosition } = usePerpetualTrading()

// View all positions
console.log('Active positions:', positions)

// Close a specific position
const position = positions[0]
await closePosition(position)

// Position data structure:
// {
//   pair: 'BTC_USD',
//   size: 1000,
//   collateral: 100,
//   isLong: true,
//   entryPrice: 50000,
//   markPrice: 51000,
//   pnl: 20,  // $20 profit
//   liquidationPrice: 45000
// }`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Risk Management */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Risk Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Position Limits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Minimum Position Size:</span>
                      <span className="font-medium">$2 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maximum Leverage:</span>
                      <span className="font-medium">150x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trading Fees:</span>
                      <span className="font-medium">3-8 bps (0.03-0.08%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Liquidation Buffer:</span>
                      <span className="font-medium">1% maintenance margin</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Safety Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Real-time liquidation price monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Automatic position validation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Stop-loss and take-profit orders
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Portfolio risk assessment
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Higher leverage increases both potential profits and losses. 
                Never trade with more than you can afford to lose. Always set stop-losses and 
                monitor your positions regularly.
              </AlertDescription>
            </Alert>
          </section>

          {/* Configuration */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuration</h2>
            <Card>
              <CardHeader>
                <CardTitle>Merkle Trade Integration</CardTitle>
                <CardDescription>
                  The trading module uses the official Merkle Trade SDK for seamless integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`// src/config/merkle.ts
export const MERKLE_CONFIG = {
  NETWORK: 'mainnet', // or 'testnet'
  TRADING_PAIRS: {
    BTC_USD: 'BTC_USD',
    ETH_USD: 'ETH_USD',
    APT_USD: 'APT_USD',
    // ... other pairs
  },
  DEFAULT_PARAMS: {
    MIN_POSITION_SIZE: 2,    // $2 minimum
    MAX_LEVERAGE: 150,       // 150x max leverage
    SLIPPAGE_TOLERANCE: 0.01 // 1%
  }
}

// Client initialization
export async function createMerkleClient() {
  const config = MERKLE_CONFIG.NETWORK === 'mainnet' 
    ? await MerkleClientConfig.mainnet()
    : await MerkleClientConfig.testnet()
  
  return new MerkleClient(config)
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Try It Out */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Ready to Start Trading?</CardTitle>
                <CardDescription className="text-base">
                  Connect your wallet and make your first trade
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/vault/trading">
                    <Button size="lg">
                      Open Trading Terminal
                    </Button>
                  </Link>
                  <a 
                    href="https://app.testnet.merkle.trade/trade/BTC_USD" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="lg">
                      Try on Testnet <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Related Links */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related Documentation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/docs/api">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">API Reference</CardTitle>
                    <CardDescription>
                      Complete trading API documentation with examples
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/docs/modules/vaults">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Vault Integration</CardTitle>
                    <CardDescription>
                      Combine trading with automated vault strategies
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <a 
                href="https://docs.merkle.trade/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Merkle Trade Docs <ExternalLink className="h-4 w-4" />
                    </CardTitle>
                    <CardDescription>
                      Official Merkle Trade protocol documentation
                    </CardDescription>
                  </CardHeader>
                </Card>
              </a>

              <Link href="/docs/deployment/production">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">Production Deployment</CardTitle>
                    <CardDescription>
                      Deploy trading features to production
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t">
            <Link href="/docs/getting-started">
              <Button variant="ghost">
                ← Getting Started
              </Button>
            </Link>
            <Link href="/docs/modules/vaults">
              <Button>
                Next: Vault Management →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}