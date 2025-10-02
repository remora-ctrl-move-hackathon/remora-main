"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { 
  BookOpen, 
  Code2, 
  Zap, 
  Shield, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Github,
  ExternalLink
} from "lucide-react"

export default function DocsHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Remora Finance Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive guides, API references, and tutorials for building on the 
            next-generation DeFi platform on Aptos blockchain.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              v1.0.0
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Aptos Mainnet
            </Badge>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Start</h2>
            <p className="text-gray-600">Get up and running in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">1. Connect Wallet</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Connect your Aptos wallet (Petra, Martian, or Pontem) to get started.
                </p>
                <Link href="/docs/getting-started">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Learn more <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">2. Start Trading</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Place your first perpetual trade with up to 150x leverage.
                </p>
                <Link href="/docs/modules/trading">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Trading guide <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">3. Create Vaults</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Set up automated yield strategies with smart vaults.
                </p>
                <Link href="/docs/modules/vaults">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Vault guide <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Core Modules */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Core Modules
            </h3>
            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    Perpetual Trading
                    <Badge variant="secondary">Popular</Badge>
                  </CardTitle>
                  <CardDescription>
                    Advanced derivatives trading with Merkle Trade integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/docs/modules/trading">
                    <Button variant="outline" size="sm">
                      Read docs <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Vault Management</CardTitle>
                  <CardDescription>
                    Automated yield strategies and portfolio management
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/docs/modules/vaults">
                    <Button variant="outline" size="sm">
                      Read docs <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Streaming Payments</CardTitle>
                  <CardDescription>
                    Real-time money flows and payment automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/docs/modules/streaming">
                    <Button variant="outline" size="sm">
                      Read docs <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Global Remittance</CardTitle>
                  <CardDescription>
                    Cross-border payments and fiat integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/docs/modules/remittance">
                    <Button variant="outline" size="sm">
                      Read docs <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Developer Resources */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Developer Resources
            </h3>
            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    API Reference
                    <Badge variant="secondary">Complete</Badge>
                  </CardTitle>
                  <CardDescription>
                    Complete API documentation with examples
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/docs/api">
                    <Button variant="outline" size="sm">
                      View API <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Smart Contracts</CardTitle>
                  <CardDescription>
                    Contract interfaces and deployment guides
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/docs/contracts">
                    <Button variant="outline" size="sm">
                      View contracts <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Frontend Components</CardTitle>
                  <CardDescription>
                    UI components and integration patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/docs/frontend">
                    <Button variant="outline" size="sm">
                      Components <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Deployment Guide</CardTitle>
                  <CardDescription>
                    Production deployment and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/docs/deployment/production">
                    <Button variant="outline" size="sm">
                      Deploy <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <div className="bg-blue-50 p-3 rounded-full">
                  <Github className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-lg">GitHub Repository</CardTitle>
              <CardDescription>
                View source code and contribute to the project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="https://github.com/remora-ctrl-move-hackathon/remora-main" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="w-full">
                  View on GitHub <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <div className="bg-purple-50 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-lg">Security Audits</CardTitle>
              <CardDescription>
                Review our security practices and audit reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs/security/audits">
                <Button variant="outline" className="w-full">
                  Security docs
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <div className="bg-green-50 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-lg">Community Support</CardTitle>
              <CardDescription>
                Join our Discord and get help from the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="https://discord.gg/remora" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  Join Discord <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Getting Help */}
        <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Need Help?</CardTitle>
            <CardDescription className="text-base">
              We're here to help you succeed with Remora Finance
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/docs/getting-started">
                <Button>
                  Getting Started Guide
                </Button>
              </Link>
              <a 
                href="https://discord.gg/remora" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  Community Support
                </Button>
              </a>
              <a 
                href="mailto:support@remora.finance"
              >
                <Button variant="outline">
                  Contact Support
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}