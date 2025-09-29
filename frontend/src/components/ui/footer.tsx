import Link from "next/link"
import { Github, Twitter, FileText } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/30 bg-background">
      <div className="max-w-screen-xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/docs" className="text-sm font-light text-muted-foreground hover:text-primary transition-all duration-200">
              Docs
            </Link>
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-primary transition-all duration-200">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link href="https://github.com" className="text-muted-foreground hover:text-primary transition-all duration-200">
              <Github className="h-4 w-4" />
            </Link>
          </div>
          <div className="text-sm font-light text-muted-foreground">
            © 2024 Remora. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}