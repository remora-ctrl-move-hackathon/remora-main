"use client"

import { ArrowLeft, Edit, Settings, Shield, Bell, Wallet, History, TrendingUp, Send, Award } from "lucide-react"
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
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account</p>
          </div>
        </div>

        <Card className="mb-6 bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary text-background flex items-center justify-center text-2xl font-bold font-mono">
                  JD
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1 text-primary">John Doe</h2>
                  <p className="text-muted-foreground mb-2">john.doe@example.com</p>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Premium Member</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {userStats.map((stat, index) => (
                <div key={index} className="p-4 bg-accent rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <div className="text-xl font-bold mb-1 text-primary font-mono">{stat.value}</div>
                  <div className="text-xs text-success">{stat.change}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList className="bg-accent border border-border">
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-background">
              Activity
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-background">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-background">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div>
                        <div className="font-medium text-primary">{activity.type}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold font-mono ${activity.amount.startsWith('+') ? 'text-success' : 'text-foreground'}`}>
                          {activity.amount}
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-muted-foreground text-xs">
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className={`p-4 border rounded-lg ${achievement.earned ? 'border-primary bg-primary text-background' : 'border-border bg-accent'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-secondary text-card' : 'bg-accent text-muted-foreground'}`}>
                          <Award className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-semibold mb-1">{achievement.title}</div>
                          <div className={`text-sm ${achievement.earned ? 'text-secondary' : 'text-muted-foreground'}`}>
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Account Settings</div>
                      <div className="text-sm text-muted-foreground">Manage your account preferences</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Security</div>
                      <div className="text-sm text-muted-foreground">Two-factor authentication, password</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Notifications</div>
                      <div className="text-sm text-muted-foreground">Email, push, SMS preferences</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Connected Wallets</div>
                      <div className="text-sm text-muted-foreground">Manage your crypto wallets</div>
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
