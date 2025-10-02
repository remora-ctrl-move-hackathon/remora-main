"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Info, X, Zap, TrendingUp, Gift } from "lucide-react"
import { useSponsoredTransactions } from "@/hooks/useSponsoredTransactions"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function SponsorIndicator() {
  const { sponsorStats, getGasSavings, isSponsored } = useSponsoredTransactions()
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Show banner for new users
    const hasSeenBanner = localStorage.getItem("sponsor-banner-seen")
    if (isSponsored && !hasSeenBanner) {
      setShowBanner(true)
    }
  }, [isSponsored])

  const dismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem("sponsor-banner-seen", "true")
  }

  if (!isSponsored) {
    return null
  }

  const savings = getGasSavings(sponsorStats.totalSponsored)
  const percentUsed = (sponsorStats.dailyUsed / sponsorStats.dailyLimit) * 100

  return (
    <>
      {/* Welcome Banner for New Users */}
      {showBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
          <Card className="bg-primary/10 border-primary/20 backdrop-blur-lg p-4 pr-12 max-w-md">
            <button
              onClick={dismissBanner}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  🎉 Gas-Free Transactions Enabled!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your transactions are sponsored. Trade, stream, and manage vaults without paying gas fees.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary/20 text-primary border-0">
                    <Zap className="h-3 w-3 mr-1" />
                    Sponsored Mode
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Powered by Aptos
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Persistent Indicator */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:bg-primary/10 group"
          >
            <div className="relative">
              <Sparkles className="h-4 w-4 text-primary group-hover:animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-medium">Gas-Free</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 border-primary/20" align="end">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Sponsored Transactions</h4>
              </div>
              <Badge className="bg-primary/10 text-primary border-0">Active</Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-muted/50 border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Total Saved</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-lg font-semibold">{savings.aptSaved.toFixed(3)} APT</p>
                  <p className="text-xs text-muted-foreground">≈ ${savings.usdSaved.toFixed(2)}</p>
                </div>
              </Card>

              <Card className="p-3 bg-muted/50 border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Transactions</span>
                </div>
                <div className="space-y-0.5">
                  <p className="text-lg font-semibold">{sponsorStats.totalSponsored}</p>
                  <p className="text-xs text-muted-foreground">Sponsored</p>
                </div>
              </Card>
            </div>

            {/* Daily Limit Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Limit</span>
                <span className="font-medium">
                  {sponsorStats.dailyUsed.toFixed(2)} / {sponsorStats.dailyLimit} APT
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
              {percentUsed > 80 && (
                <p className="text-xs text-yellow-600 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Approaching daily limit
                </p>
              )}
            </div>

            {/* Eligible Actions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Sponsored Actions:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  ✓ Create Stream
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ✓ Vault Deposits
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ✓ Withdrawals
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ✓ KYC Submit
                </Badge>
              </div>
            </div>

            {/* Info */}
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Your gas fees are being covered by Remora Finance. This allows you to interact 
                with the platform without holding APT for transaction fees.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}