"use client"

import { ArrowLeft, TrendingUp, Users, Activity, Calendar, BarChart3, ArrowUpRight, ArrowDownRight, Zap, Send, Receipt, DollarSign } from "lucide-react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function Analytics() {
  const stats = [
    { label: "Total Balance", value: "$12,459.83", change: "+12.3%", trend: "up", icon: DollarSign },
    { label: "Monthly Income", value: "$5,234.50", change: "+18.2%", trend: "up", icon: TrendingUp },
    { label: "Active Streams", value: "8", change: "+2", trend: "up", icon: Zap },
    { label: "Vault ROI", value: "+21.4%", change: "+3.1%", trend: "up", icon: BarChart3 },
  ]

  const transactions = [
    { id: 1, type: "Vault Profit", amount: 125.50, category: "Investment", date: "Jan 22", trend: "up" },
    { id: 2, type: "Remittance Sent", amount: -200.00, category: "Transfer", date: "Jan 21", trend: "down" },
    { id: 3, type: "Stream Payment", amount: 500.00, category: "Income", date: "Jan 20", trend: "up" },
    { id: 4, type: "Bill Payment", amount: -45.50, category: "Bills", date: "Jan 19", trend: "down" },
    { id: 5, type: "Vault Deposit", amount: -1000.00, category: "Investment", date: "Jan 18", trend: "down" },
  ]

  const categorySpending = [
    { category: "Investment", amount: 3500, percentage: 45, color: "bg-black" },
    { category: "Transfer", amount: 2400, percentage: 31, color: "bg-gray-600" },
    { category: "Bills", amount: 1200, percentage: 15, color: "bg-gray-400" },
    { category: "Income", amount: 700, percentage: 9, color: "bg-gray-300" },
  ]

  const upcomingPayments = [
    { title: "Electricity Bill", amount: 45.50, date: "Jan 25", category: "Bills" },
    { title: "Vault Investment", amount: 500.00, date: "Jan 27", category: "Investment" },
    { title: "Stream to Team", amount: 1200.00, date: "Jan 28", category: "Transfer" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Financial insights & metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="backdrop-blur-xl bg-card border-border hover:border-primary/50 hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-2">{stat.value}</div>
                <div className="flex items-center gap-1 text-sm">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-foreground" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-foreground" />
                  )}
                  <span className="text-foreground">
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2 backdrop-blur-xl bg-card border-border">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent">
                        {transaction.trend === "up" ? (
                          <ArrowUpRight className="h-5 w-5 text-foreground" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.type}</div>
                        <div className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-foreground">
                      {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card border-border">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categorySpending.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">${item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Payments
              </CardTitle>
              <CardDescription>Scheduled transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div>
                      <div className="font-medium">{payment.title}</div>
                      <div className="text-sm text-muted-foreground">{payment.category} • {payment.date}</div>
                    </div>
                    <div className="font-semibold">${payment.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-black/90 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">Manage your finances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/streams">
                <Button className="w-full bg-white text-foreground hover:bg-accent justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  Create Stream
                </Button>
              </Link>
              <Link href="/remit">
                <Button className="w-full bg-white text-foreground hover:bg-accent justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send Money
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="w-full bg-white text-foreground hover:bg-accent justify-start">
                  <Receipt className="h-4 w-4 mr-2" />
                  Pay Bills
                </Button>
              </Link>
              <Link href="/vault">
                <Button className="w-full bg-white text-foreground hover:bg-accent justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Invest in Vaults
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
