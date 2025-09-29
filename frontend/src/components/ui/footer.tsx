import Link from "next/link"
import { Github, Twitter, FileText } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="max-w-screen-xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/docs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="https://twitter.com" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-3 w-3" />
            </Link>
            <Link href="https://github.com" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-3 w-3" />
            </Link>
          </div>
          <div className="text-xs text-muted-foreground">
            © 2024 Remora. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}