"use client"

import { useState } from "react"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Key, Copy, Eye, EyeOff, RefreshCw, Trash2,
  Activity, Zap, DollarSign, Clock,
  CheckCircle, XCircle, AlertCircle, Code
} from "lucide-react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import toast from "react-hot-toast"

export default function APIDashboard() {
  const { connected, account } = useWallet()
  const [showKey, setShowKey] = useState(false)
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "Production API Key",
      key: "pk_live_1234567890abcdef",
      created: "2024-01-15",
      lastUsed: "2024-02-20",
      status: "active",
      requests: 15420,
      rateLimit: "1000/hour"
    },
    {
      id: 2,
      name: "Development API Key",
      key: "pk_test_abcdef1234567890",
      created: "2024-02-01",
      lastUsed: "2024-02-19",
      status: "active",
      requests: 3250,
      rateLimit: "100/hour"
    }
  ])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("API key copied to clipboard")
  }

  const generateNewKey = () => {
    const newKey = {
      id: apiKeys.length + 1,
      name: `API Key ${apiKeys.length + 1}`,
      key: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never",
      status: "active",
      requests: 0,
      rateLimit: "1000/hour"
    }
    setApiKeys([...apiKeys, newKey])
    toast.success("New API key generated")
  }

  const revokeKey = (id: number) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, status: "revoked" } : key
    ))
    toast.success("API key revoked")
  }

  // Mock usage data
  const usageData = {
    today: 342,
    week: 2150,
    month: 15420,
    successRate: 99.2
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">API Dashboard</h1>
            <p className="text-sm text-gray-500 font-light mt-1">Manage your API keys and monitor usage</p>
          </div>
          <Button onClick={generateNewKey} className="bg-primary hover:bg-primary/90">
            <Key className="h-4 w-4 mr-2" />
            Generate New Key
          </Button>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Requests Today</span>
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light">{usageData.today}</div>
              <div className="text-xs text-green-600 mt-1">+12% from yesterday</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">This Week</span>
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light">{usageData.week.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">7 day total</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">This Month</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-light">{usageData.month.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">30 day total</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Success Rate</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-light text-green-600">{usageData.successRate}%</div>
              <div className="text-xs text-gray-400 mt-1">Last 24 hours</div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Management */}
        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="bg-white border border-border/30">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="logs">Request Logs</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className="bg-white border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <Badge 
                          variant={apiKey.status === "active" ? "default" : "secondary"}
                          className={apiKey.status === "active" ? "bg-green-50 text-green-600" : ""}
                        >
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          {showKey ? apiKey.key : `${apiKey.key.substring(0, 10)}${'•'.repeat(20)}`}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Created: {apiKey.created}</span>
                        <span>Last used: {apiKey.lastUsed}</span>
                        <span>Requests: {apiKey.requests.toLocaleString()}</span>
                        <span>Rate limit: {apiKey.rateLimit}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={apiKey.status === "revoked"}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Regenerate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => revokeKey(apiKey.id)}
                        disabled={apiKey.status === "revoked"}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card className="bg-white border-border/50">
              <CardHeader>
                <CardTitle>API Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Usage chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-border/50">
                <CardHeader>
                  <CardTitle>Top Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { endpoint: "/api/v1/stream/create", calls: 5420, percentage: 35 },
                    { endpoint: "/api/v1/vault/deposit", calls: 3210, percentage: 21 },
                    { endpoint: "/api/v1/stream/status", calls: 2890, percentage: 19 },
                    { endpoint: "/api/v1/vault/withdraw", calls: 2150, percentage: 14 },
                    { endpoint: "/api/v1/user/balance", calls: 1750, percentage: 11 }
                  ].map((endpoint, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <code className="text-xs">{endpoint.endpoint}</code>
                        <span className="text-gray-500">{endpoint.calls.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${endpoint.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white border-border/50">
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Average</p>
                      <p className="text-2xl font-light">142ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">95th percentile</p>
                      <p className="text-2xl font-light">289ms</p>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>&lt; 100ms</span>
                      <span className="text-gray-500">62%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>100-300ms</span>
                      <span className="text-gray-500">33%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>&gt; 300ms</span>
                      <span className="text-gray-500">5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card className="bg-white border-border/50">
              <CardHeader>
                <CardTitle>Recent API Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { time: "2024-02-20 14:32:15", method: "POST", endpoint: "/api/v1/stream/create", status: 200, duration: "123ms" },
                    { time: "2024-02-20 14:31:42", method: "GET", endpoint: "/api/v1/vault/list", status: 200, duration: "87ms" },
                    { time: "2024-02-20 14:30:58", method: "POST", endpoint: "/api/v1/vault/deposit", status: 200, duration: "156ms" },
                    { time: "2024-02-20 14:30:21", method: "GET", endpoint: "/api/v1/stream/status/123", status: 404, duration: "45ms" },
                    { time: "2024-02-20 14:29:15", method: "DELETE", endpoint: "/api/v1/stream/cancel", status: 200, duration: "201ms" }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{log.time}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.method}
                        </Badge>
                        <code className="text-sm">{log.endpoint}</code>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${log.status === 200 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {log.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{log.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card className="bg-white border-border/50">
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Get started with Remora API in minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Installation</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <code className="text-sm">npm install @remora/sdk</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Authentication</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`import { RemoraSDK } from '@remora/sdk'

const remora = new RemoraSDK({
  apiKey: 'pk_live_your_api_key_here'
})`}</pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Create a Payment Stream</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`const stream = await remora.streams.create({
  recipient: '0x123...',
  amount: 1000, // USDC
  duration: 30 * 24 * 60 * 60, // 30 days in seconds
  startTime: Date.now()
})`}</pre>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    <Code className="h-4 w-4 mr-2" />
                    View Full Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-border/50">
                <CardHeader>
                  <CardTitle>Available Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <h5 className="font-medium text-sm">Streams</h5>
                    <div className="pl-4 space-y-1 text-sm text-gray-600">
                      <p>POST /api/v1/stream/create</p>
                      <p>GET /api/v1/stream/list</p>
                      <p>GET /api/v1/stream/status/:id</p>
                      <p>DELETE /api/v1/stream/cancel/:id</p>
                    </div>
                  </div>
                  <div className="space-y-1 pt-2">
                    <h5 className="font-medium text-sm">Vaults</h5>
                    <div className="pl-4 space-y-1 text-sm text-gray-600">
                      <p>POST /api/v1/vault/create</p>
                      <p>GET /api/v1/vault/list</p>
                      <p>POST /api/v1/vault/deposit</p>
                      <p>POST /api/v1/vault/withdraw</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-border/50">
                <CardHeader>
                  <CardTitle>Rate Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Development</span>
                      <span className="text-sm text-gray-500">100 requests/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Production</span>
                      <span className="text-sm text-gray-500">1,000 requests/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Enterprise</span>
                      <span className="text-sm text-gray-500">Custom limits</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">
                      Rate limits are applied per API key. Contact support for higher limits.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}