"use client"

import { Settings, Shield, Bell, Wallet, History, TrendingUp, Send, Award } from "lucide-react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function Profile() {
  const userStats = [
    { label: "Total Balance", value: "$12,459.83", change: "+12.3%", icon: Wallet },
    { label: "Total Sent", value: "$8,234.50", change: "+5.2%", icon: Send },
    { label: "Vault ROI", value: "+21.4%", change: "+3.1%", icon: TrendingUp },
    { label: "Transactions", value: "147", change: "+23", icon: History },
  ]

  const recentActivity = [
    { type: "Vault Profit", amount: "+$125.50", date: "2 hours ago", status: "completed" },
    { type: "Remittance", amount: "-$200.00", date: "1 day ago", status: "completed" },
    { type: "Stream Payment", amount: "+$500.00", date: "2 days ago", status: "completed" },
    { type: "Bill Payment", amount: "-$45.50", date: "3 days ago", status: "completed" },
  ]

  const achievements = [
    { title: "Early Adopter", description: "First 100 users", earned: true },
    { title: "Power Trader", description: "10+ vault investments", earned: true },
    { title: "Global Sender", description: "Sent to 5+ countries", earned: true },
    { title: "Stream Master", description: "Created 20+ streams", earned: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary/5 flex flex-col">
      <Header />
      <div className="max-w-screen-xl mx-auto px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-extralight text-foreground">Profile</h1>
          <p className="text-sm font-light text-muted-foreground mt-1">Manage your account</p>
        </div>

        <Card className="mb-8 bg-white border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWzRh7Mpizqm0eqIVzNzrmMZlBH52NzItVwQ&s"
                    alt="Aptos Logo"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-mono font-extralight mb-2 text-foreground">0x742d...8f9a</h2>
                  <p className="text-muted-foreground font-light mb-3">Connected via Aptos Wallet</p>
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-light">Active on Testnet</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {userStats.map((stat, index) => (
                <div key={index} className="p-6 bg-gradient-to-br from-white to-primary/5 rounded-xl border border-border/30 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <stat.icon className="h-4 w-4 text-primary/70" />
                    <span className="text-xs font-light text-muted-foreground">{stat.label}</span>
                  </div>
                  <div className="text-xl font-light mb-2 text-foreground">{stat.value}</div>
                  <div className="text-xs font-light text-success">{stat.change}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="bg-white border border-border/50 p-1">
            <TabsTrigger value="activity" className="font-light data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">
              Activity
            </TabsTrigger>
            <TabsTrigger value="achievements" className="font-light data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-light data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card className="bg-white border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="font-light text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border/30 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                      <div>
                        <div className="font-light text-foreground">{activity.type}</div>
                        <div className="text-sm font-light text-muted-foreground mt-1">{activity.date}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-light text-lg ${activity.amount.startsWith('+') ? 'text-success' : 'text-foreground'}`}>
                          {activity.amount}
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-muted-foreground text-xs font-light">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-white border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="font-light text-xl">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className={`p-6 rounded-xl transition-all duration-300 ${achievement.earned ? 'border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm' : 'border border-border/30 bg-white'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground'}`}>
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <div className={`font-light mb-2 ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>{achievement.title}</div>
                          <div className={`text-sm font-light ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`}>
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="font-light text-xl">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-5 border border-border/30 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Settings className="h-5 w-5 text-primary/70" />
                    <div>
                      <div className="font-light text-foreground">Account Settings</div>
                      <div className="text-sm font-light text-muted-foreground mt-1">Manage your account preferences</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 border border-border/30 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Shield className="h-5 w-5 text-primary/70" />
                    <div>
                      <div className="font-light text-foreground">Security</div>
                      <div className="text-sm font-light text-muted-foreground mt-1">Two-factor authentication, password</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 border border-border/30 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Bell className="h-5 w-5 text-primary/70" />
                    <div>
                      <div className="font-light text-foreground">Notifications</div>
                      <div className="text-sm font-light text-muted-foreground mt-1">Email, push, SMS preferences</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 border border-border/30 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Wallet className="h-5 w-5 text-primary/70" />
                    <div>
                      <div className="font-light text-foreground">Connected Wallets</div>
                      <div className="text-sm font-light text-muted-foreground mt-1">Manage your crypto wallets</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}
