"use client"

import { useState, useEffect, useRef } from "react"
import { Command } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, TrendingUp, Zap, Wallet, 
  Search, ArrowRight, History, Star 
} from "lucide-react"

interface CommandOption {
  id: string
  label: string
  description: string
  category: "ai" | "action" | "navigation" | "recent"
  icon: React.ElementType
  shortcut?: string
}

const commandOptions: CommandOption[] = [
  {
    id: "ai-trade",
    label: "Ask AI to trade",
    description: "Natural language trading assistant",
    category: "ai",
    icon: Sparkles,
    shortcut: "T"
  },
  {
    id: "buy-apt",
    label: "Buy APT",
    description: "Quick market buy order",
    category: "action",
    icon: TrendingUp,
    shortcut: "B"
  },
  {
    id: "create-stream",
    label: "Create payment stream",
    description: "Start streaming payments",
    category: "action",
    icon: Zap,
    shortcut: "S"
  },
  {
    id: "view-vaults",
    label: "View vaults",
    description: "Browse trading vaults",
    category: "navigation",
    icon: Wallet,
    shortcut: "V"
  }
]

export function CommandBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search
  const filteredOptions = commandOptions.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    option.description.toLowerCase().includes(search.toLowerCase())
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      
      // Close with Escape
      if (e.key === "Escape") {
        setIsOpen(false)
      }
      
      // Navigate with arrow keys
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setSelectedIndex((prev) => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
        }
        if (e.key === "ArrowUp") {
          e.preventDefault()
          setSelectedIndex((prev) => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
        }
        if (e.key === "Enter" && filteredOptions[selectedIndex]) {
          e.preventDefault()
          handleSelect(filteredOptions[selectedIndex])
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filteredOptions, selectedIndex])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (option: CommandOption) => {
    console.log("Selected:", option)
    setIsOpen(false)
    setSearch("")
    // Add functionality here
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "ai": return "AI Assistant"
      case "action": return "Quick Actions"
      case "navigation": return "Navigate"
      case "recent": return "Recent"
      default: return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ai": return "bg-purple-500/10 text-purple-600"
      case "action": return "bg-blue-500/10 text-blue-600"
      case "navigation": return "bg-green-500/10 text-green-600"
      case "recent": return "bg-gray-500/10 text-gray-600"
      default: return "bg-gray-500/10 text-gray-600"
    }
  }

  return (
    <>
      {/* Trigger Button (Optional - can be triggered with Cmd+K) */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search or ask AI...</span>
        <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      {/* Command Bar Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Command Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
            >
              <Card className="overflow-hidden shadow-2xl border-2">
                {/* Search Input */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Ask AI anything or search..."
                      className="flex-1 border-0 p-0 text-lg focus-visible:ring-0"
                    />
                    <kbd className="text-xs bg-muted px-2 py-1 rounded">ESC</kbd>
                  </div>
                </div>

                {/* AI Suggestion Banner */}
                {search && (
                  <div className="px-4 py-3 bg-purple-50 dark:bg-purple-950/20 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          AI: Try "{search.toLowerCase().includes('buy') ? 'Buy 100 USDC of APT' : 'Show my portfolio'}"
                        </span>
                      </div>
                      <kbd className="text-xs bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">↵</kbd>
                    </div>
                  </div>
                )}

                {/* Options List */}
                <div className="max-h-96 overflow-y-auto p-2">
                  {Object.entries(
                    filteredOptions.reduce((acc, option) => {
                      if (!acc[option.category]) acc[option.category] = []
                      acc[option.category].push(option)
                      return acc
                    }, {} as Record<string, CommandOption[]>)
                  ).map(([category, options]) => (
                    <div key={category} className="mb-4">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground mb-1">
                        {getCategoryLabel(category)}
                      </div>
                      {options.map((option, index) => {
                        const globalIndex = filteredOptions.indexOf(option)
                        const isSelected = selectedIndex === globalIndex
                        const Icon = option.icon

                        return (
                          <button
                            key={option.id}
                            onClick={() => handleSelect(option)}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                              ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'}
                            `}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                            {option.shortcut && (
                              <kbd className="text-xs bg-muted px-2 py-1 rounded">
                                {option.shortcut}
                              </kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}

                  {/* Empty State */}
                  {filteredOptions.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No results found</p>
                      <p className="text-xs mt-1">Try asking the AI assistant</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t px-4 py-2 bg-muted/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="bg-muted px-1.5 py-0.5 rounded">↑↓</kbd>
                        Navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="bg-muted px-1.5 py-0.5 rounded">↵</kbd>
                        Select
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Command className="h-3 w-3" />
                      <span>AI Powered</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}