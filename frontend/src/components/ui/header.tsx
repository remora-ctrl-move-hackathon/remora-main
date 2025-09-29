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
    <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-extralight tracking-wide text-foreground">Remora</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/"
                className={`text-sm font-light ${isActive("/") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                Home
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
                Payments
              </Link>
              <Link 
                href="/analytics"
                className={`text-sm font-light ${isActive("/analytics") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                Analytics
              </Link>
              <Link 
                href="/profile"
                className={`text-sm font-light ${isActive("/profile") ? "text-primary font-normal" : "text-muted-foreground hover:text-foreground"} transition-all duration-200`}
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search..."
                className="pl-10 bg-background border-border/50 text-foreground placeholder:text-muted-foreground w-56 h-9 text-sm font-light focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-9 w-9 transition-all duration-200">
              <Bell className="h-4 w-4" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white border-0 h-9 px-4 text-sm font-light transition-all duration-200 shadow-sm hover:shadow-md">
              <Wallet className="h-4 w-4 mr-2" />
              0xbf63...e6b7
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}