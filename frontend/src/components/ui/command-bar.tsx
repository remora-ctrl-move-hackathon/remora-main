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
import { geminiAI, TradingIntent } from "@/services/gemini-ai.service"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

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
  const [aiSuggestion, setAiSuggestion] = useState<string>("") 
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  // Initialize Gemini AI on mount
  useEffect(() => {
    geminiAI.initialize()
  }, [])

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

  const handleSelect = async (option: CommandOption) => {
    console.log("Selected:", option)
    
    // Handle navigation
    switch (option.id) {
      case "ai-trade":
        setSearch("Buy 100 APT with 10x leverage")
        handleAICommand("Buy 100 APT with 10x leverage")
        break
      case "buy-apt":
        router.push("/trading")
        setIsOpen(false)
        break
      case "create-stream":
        router.push("/streaming")
        setIsOpen(false)
        break
      case "view-vaults":
        router.push("/vault")
        setIsOpen(false)
        break
      default:
        setIsOpen(false)
    }
    setSearch("")
  }
  
  const handleAICommand = async (query: string) => {
    if (!query.trim()) return
    
    setIsProcessingAI(true)
    try {
      const intent = await geminiAI.parseUserIntent(query)
      const response = await geminiAI.generateResponse(intent)
      
      // Show AI response
      setAiSuggestion(response)
      
      // Handle specific actions based on intent type
      if (intent.confidence > 0.7) {
        if (intent.type === 'trade') {
          toast.success(`Ready to ${intent.action} ${intent.params?.amount} ${intent.params?.token}`)
          router.push(`/trading/advanced?action=${intent.action}&amount=${intent.params?.amount}`)
          setIsOpen(false)
        } else if (intent.type === 'stream') {
          // Navigate to streaming page with pre-filled parameters
          const params = new URLSearchParams({
            ai: 'true',
            action: 'create',
            ...(intent.params?.recipient && { recipient: intent.params.recipient }),
            ...(intent.params?.amount && { amount: intent.params.amount }),
            ...(intent.params?.duration && { duration: intent.params.duration }),
            ...(intent.params?.token && { token: intent.params.token })
          })
          
          toast.success(`Setting up stream: ${intent.params?.amount} ${intent.params?.token} to ${intent.params?.recipient || 'recipient'}`)
          router.push(`/streams?${params.toString()}`)
          setIsOpen(false)
        } else if (intent.type === 'vault') {
          toast.success(`Ready to ${intent.action} ${intent.params?.amount} ${intent.params?.token}`)
          router.push(`/vault?action=${intent.action}&amount=${intent.params?.amount}`)
          setIsOpen(false)
        }
      }
    } catch (error) {
      console.error("AI processing error:", error)
      setAiSuggestion("I can help you trade APT, set up payment streams, or manage vaults. Try: 'Stream 50 APT to alice.apt for 30 days'")
    } finally {
      setIsProcessingAI(false)
    }
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
      case "ai": return "bg-primary/10 text-primary" // Teal for AI
      case "action": return "bg-primary/20 text-primary" // Teal variations
      case "navigation": return "bg-muted/50 text-foreground" // Black/white
      case "recent": return "bg-muted/30 text-muted-foreground" // Muted
      default: return "bg-muted/30 text-muted-foreground"
    }
  }

  return (
    <>
      {/* Trigger Button (Optional - can be triggered with Cmd+K) */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-foreground border border-border rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Search or ask AI...</span>
        <kbd className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">⌘K</kbd>
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
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <Input
                      ref={inputRef}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        // Debounced AI processing
                        if (e.target.value.length > 3) {
                          const timer = setTimeout(() => handleAICommand(e.target.value), 500)
                          return () => clearTimeout(timer)
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && search) {
                          handleAICommand(search)
                        }
                      }}
                      placeholder="Ask AI anything or search..."
                      className="flex-1 border-0 p-0 text-lg focus-visible:ring-0 placeholder:text-muted-foreground"
                    />
                    <kbd className="text-xs bg-muted px-2 py-1 rounded border border-border">ESC</kbd>
                  </div>
                </div>

                {/* AI Suggestion Banner */}
                {search && (
                  <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm text-foreground">
                          {isProcessingAI ? (
                            "AI is thinking..."
                          ) : aiSuggestion ? (
                            aiSuggestion
                          ) : (
                            `AI: Try "${search.toLowerCase().includes('buy') ? 'Buy 100 APT with 10x leverage' : 'Show my portfolio'}"`
                          )}
                        </span>
                      </div>
                      <kbd className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">↵</kbd>
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
                              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                              ${isSelected ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-muted/50'}
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
                              <kbd className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
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
                <div className="border-t px-4 py-2 bg-background">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">↑↓</kbd>
                        Navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="bg-muted px-1.5 py-0.5 rounded border border-border">↵</kbd>
                        Select
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-primary font-medium">Gemini AI Powered</span>
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