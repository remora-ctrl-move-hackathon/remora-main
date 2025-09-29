"use client"

import { Search, Bell, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-medium text-foreground">Remora</h1>
            <nav className="hidden md:flex items-center gap-4">
              <Link 
                href="/"
                className={`text-xs ${isActive("/") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              >
                Home
              </Link>
              <Link 
                href="/vault"
                className={`text-xs ${isActive("/vault") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              >
                Vaults
              </Link>
              <Link 
                href="/remit"
                className={`text-xs ${isActive("/remit") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              >
                Payments
              </Link>
              <Link 
                href="/analytics"
                className={`text-xs ${isActive("/analytics") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              >
                Analytics
              </Link>
              <Link 
                href="/profile"
                className={`text-xs ${isActive("/profile") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input 
                placeholder="Search..."
                className="pl-8 bg-accent border-border text-foreground placeholder:text-muted-foreground w-48 h-8 text-xs focus:border-primary/50"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-background border-0 h-8 px-3 text-xs">
              <Wallet className="h-3 w-3 mr-2" />
              0xbf63...e6b7
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}