"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletButton } from "@/components/ui/wallet-button"

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
            <h1 className="text-2xl font-bold tracking-wide text-foreground">Remora</h1>
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
            </nav>
          </div>
          <WalletButton />
        </div>
      </div>
    </header>
  )
}