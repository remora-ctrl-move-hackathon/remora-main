import Link from "next/link"
import { Home, TrendingUp, CreditCard, BarChart3, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: TrendingUp, label: "Vaults", href: "/vault" },
  { icon: CreditCard, label: "Payments", href: "/remit" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}