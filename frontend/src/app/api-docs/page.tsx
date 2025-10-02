"use client"

import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import toast from "react-hot-toast"

const endpoints = {
  streaming: [
    {
      method: 'POST',
      path: '/api/v1/stream/create',
      description: 'Create a new payment stream',
      params: {
        recipient: 'string - Aptos address',
        amount: 'number - Total amount in USDC',
        duration: 'number - Duration in seconds',
        cancellable: 'boolean - Can sender cancel'
      },
      example: {
        recipient: '0x123...abc',
        amount: 1000,
        duration: 2592000,
        cancellable: true
      }
    },
    {
      method: 'GET',
      path: '/api/v1/stream/:streamId',
      description: 'Get stream details',
      params: {
        streamId: 'number - Stream ID'
      }
    },
    {
      method: 'DELETE',
      path: '/api/v1/stream/:streamId',
      description: 'Cancel a stream',
      params: {
        streamId: 'number - Stream ID'
      }
    }
  ],
  trading: [
    {
      method: 'POST',
      path: '/api/v1/perps/open',
      description: 'Open a perpetual position',
      params: {
        marketId: 'number - Market ID (0 for APT/USD)',
        isLong: 'boolean - Long or short position',
        collateral: 'number - Collateral amount',
        leverage: 'number - Leverage (1-150)'
      },
      example: {
        marketId: 0,
        isLong: true,
        collateral: 100,
        leverage: 10
      }
    },
    {
      method: 'POST',
      path: '/api/v1/perps/close',
      description: 'Close a perpetual position',
      params: {
        positionId: 'number - Position ID'
      }
    }
  ],
  vaults: [
    {
      method: 'POST',
      path: '/api/v1/vault/create',
      description: 'Create a new trading vault',
      params: {
        name: 'string - Vault name',
        managementFee: 'number - Annual fee (0-10%)',
        performanceFee: 'number - Profit fee (0-30%)',
        minDeposit: 'number - Minimum deposit in APT'
      },
      example: {
        name: 'Alpha Strategy Vault',
        managementFee: 2,
        performanceFee: 20,
        minDeposit: 100
      }
    },
    {
      method: 'POST',
      path: '/api/v1/vault/:vaultId/deposit',
      description: 'Deposit to a vault',
      params: {
        vaultId: 'number - Vault ID',
        amount: 'number - Amount in APT'
      }
    }
  ]
}

export default function APIDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const generateCurl = (endpoint: any) => {
    if (endpoint.method === 'GET') {
      return `curl -X GET https://api.remora.finance${endpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY"`
    }
    
    return `curl -X ${endpoint.method} https://api.remora.finance${endpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.example || {}, null, 2)}'`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
          <p className="text-muted-foreground">
            Integrate Remora's DeFi features into your application
          </p>
        </div>

        {/* API Key Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Get your API key to start building
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All API requests require authentication using a Bearer token in the Authorization header.
              </p>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                Authorization: Bearer YOUR_API_KEY
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Base URL</h3>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                https://api.remora.finance/api/v1
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Rate Limits</h3>
              <p className="text-sm text-muted-foreground">
                • Free tier: 100 requests/minute<br />
                • Pro tier: 1,000 requests/minute<br />
                • Enterprise: Unlimited
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Tabs defaultValue="streaming">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="streaming">Payment Streaming</TabsTrigger>
            <TabsTrigger value="trading">Perpetual Trading</TabsTrigger>
            <TabsTrigger value="vaults">Copy Trading Vaults</TabsTrigger>
          </TabsList>

          {Object.entries(endpoints).map(([key, endpointList]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {endpointList.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          endpoint.method === 'GET' ? 'secondary' : 
                          endpoint.method === 'POST' ? 'default' : 
                          'destructive'
                        }>
                          {endpoint.method}
                        </Badge>
                        <CardTitle className="text-lg font-mono">
                          {endpoint.path}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Parameters */}
                    <div>
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="space-y-1">
                        {Object.entries(endpoint.params).map(([param, desc]) => (
                          <div key={param} className="flex items-start gap-2 text-sm">
                            <code className="bg-muted px-2 py-1 rounded">{param}</code>
                            <span className="text-muted-foreground">{desc as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example */}
                    {endpoint.example && (
                      <div>
                        <h4 className="font-semibold mb-2">Example Request</h4>
                        <div className="relative">
                          <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                            <code>{JSON.stringify(endpoint.example, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* cURL */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">cURL</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyCode(generateCurl(endpoint), `curl-${key}-${index}`)}
                        >
                          {copiedCode === `curl-${key}-${index}` ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                        <code>{generateCurl(endpoint)}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* SDKs */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>SDKs & Libraries</CardTitle>
            <CardDescription>
              Official SDKs for popular languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Code className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">TypeScript</h4>
                <p className="text-xs text-muted-foreground">npm install @remora/sdk</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Code className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">Python</h4>
                <p className="text-xs text-muted-foreground">pip install remora-sdk</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Code className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">Rust</h4>
                <p className="text-xs text-muted-foreground">cargo add remora</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Code className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">Go</h4>
                <p className="text-xs text-muted-foreground">go get remora.finance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}