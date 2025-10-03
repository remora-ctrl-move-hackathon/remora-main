"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletButton } from "@/components/ui/wallet-button"
import { CommandBar } from "@/components/ui/command-bar"

export function Header() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link href="/landing">
              <h1 className="text-2xl font-bold tracking-wide text-foreground hover:text-primary transition-colors cursor-pointer">Remora</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/"
                className={`text-sm font-light ${isActive("/") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                Streams
              </Link>
              <Link
                href="/vault"
                className={`text-sm font-light ${isActive("/vault") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                Vaults
              </Link>
              <Link
                href="/coaches"
                className={`text-sm font-light ${isActive("/coaches") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                AI Coaches
              </Link>
              <Link
                href="/remit"
                className={`text-sm font-light ${isActive("/remit") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                Off Ramp
              </Link>
              <Link 
                href="/analytics"
                className={`text-sm font-light ${isActive("/analytics") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                Analytics
              </Link>
              <Link 
                href="/trading/advanced"
                className={`text-sm font-light ${isActive("/trading/advanced") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                Advanced
              </Link>
              <Link 
                href="/api/dashboard"
                className={`text-sm font-light ${isActive("/api/dashboard") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                API
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <CommandBar />
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  )
}