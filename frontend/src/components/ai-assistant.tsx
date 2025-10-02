"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bot, Send } from "lucide-react"
import toast from "react-hot-toast"

interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  action?: {
    type: 'trade' | 'stream' | 'vault'
    params: any
  }
}

export function AIAssistant() {
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'assistant', content: 'Hi! I can help you trade, stream payments, or manage vaults. Try "Buy 100 USDC of APT" or "Stream 50 USDC to alice.apt for 30 days"' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const parseNaturalLanguage = (text: string) => {
    const lowerText = text.toLowerCase()
    
    // Trading intents
    if (lowerText.includes('buy') || lowerText.includes('sell') || lowerText.includes('trade')) {
      const match = text.match(/(\d+)\s*(usdc|apt|usd)/i)
      if (match) {
        return {
          type: 'trade' as const,
          params: {
            action: lowerText.includes('sell') ? 'sell' : 'buy',
            amount: match[1],
            token: match[2].toUpperCase()
          }
        }
      }
    }
    
    // Streaming intents
    if (lowerText.includes('stream') || lowerText.includes('send')) {
      const match = text.match(/(\d+)\s*(usdc|apt|usd)\s*to\s*(\S+)/i)
      if (match) {
        return {
          type: 'stream' as const,
          params: {
            amount: match[1],
            token: match[2].toUpperCase(),
            recipient: match[3]
          }
        }
      }
    }
    
    // Vault intents
    if (lowerText.includes('deposit') || lowerText.includes('withdraw')) {
      const match = text.match(/(\d+)\s*(usdc|apt|usd)/i)
      if (match) {
        return {
          type: 'vault' as const,
          params: {
            action: lowerText.includes('withdraw') ? 'withdraw' : 'deposit',
            amount: match[1],
            token: match[2].toUpperCase()
          }
        }
      }
    }
    
    return null
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Parse intent
    const action = parseNaturalLanguage(input)
    
    setTimeout(() => {
      if (action) {
        const response: AIMessage = {
          role: 'assistant',
          content: `I'll help you ${action.type} ${action.params.amount} ${action.params.token}. Please confirm this transaction:`,
          action
        }
        setMessages(prev => [...prev, response])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I can help you with:\n• Trading: "Buy 100 USDC of APT"\n• Streaming: "Stream 50 USDC to alice.apt"\n• Vaults: "Deposit 1000 USDC to vault"'
        }])
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-xl z-50">
      <div className="p-4 border-b flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <h3 className="font-semibold">Remora AI Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <p className="text-sm">{msg.content}</p>
              {msg.action && (
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => toast.success(`Executing ${msg.action?.type}...`)}
                >
                  Confirm Transaction
                </Button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}