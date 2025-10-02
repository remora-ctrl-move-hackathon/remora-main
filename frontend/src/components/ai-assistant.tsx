"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bot, Send, Sparkles, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { geminiAI } from "@/services/gemini-ai.service"
import { useRouter } from "next/navigation"

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
    { role: 'assistant', content: 'Hi! I\'m powered by Gemini AI. I can help you trade APT, open perpetuals up to 150x leverage, stream payments, or manage vaults. Try "Open a 10x long on APT" or "Buy 100 APT"' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Initialize Gemini AI
  useEffect(() => {
    geminiAI.initialize()
  }, [])

  const parseWithGemini = async (text: string) => {
    try {
      const intent = await geminiAI.parseUserIntent(text)
      const response = await geminiAI.generateResponse(intent)
      
      return {
        intent,
        response,
        suggestions: await geminiAI.suggestActions(text)
      }
    } catch (error) {
      console.error('Gemini AI error:', error)
      return null
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Use Gemini AI to parse and respond
    const result = await parseWithGemini(input)
    
    if (result && result.intent) {
      const response: AIMessage = {
        role: 'assistant',
        content: result.response || `I'll help you ${result.intent.type}. Ready to proceed?`,
        action: {
          type: result.intent.type as any,
          params: result.intent.params as any
        }
      }
      setMessages(prev => [...prev, response])
      
      // Auto-navigate for high confidence actions
      if (result.intent.confidence > 0.8) {
        if (result.intent.type === 'trade') {
          setTimeout(() => {
            router.push('/trading/advanced')
          }, 1500)
        } else if (result.intent.type === 'stream') {
          // Navigate to streaming page with AI parameters
          setTimeout(() => {
            const params = new URLSearchParams({
              ai: 'true',
              action: 'create',
              ...(result.intent.params?.recipient && { recipient: result.intent.params.recipient }),
              ...(result.intent.params?.amount && { amount: result.intent.params.amount }),
              ...(result.intent.params?.duration && { duration: result.intent.params.duration })
            })
            router.push(`/streams?${params.toString()}`)
          }, 1500)
        }
      }
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I can help you with:\n• Perpetual Trading: "Open 10x long on APT"\n• Spot Trading: "Buy 100 APT"\n• Payment Streams: "Stream 50 USDC to alice.apt"\n• Vault Management: "Deposit 1000 USDC"'
      }])
    }
    setLoading(false)
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col shadow-xl z-50 border-2 border-primary/20">
      <div className="p-4 border-b border-border flex items-center gap-2 bg-primary/5">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <h3 className="font-semibold text-foreground">Gemini AI Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-primary text-white' : 'bg-muted/50 border border-border'
            }`}>
              <p className="text-sm">{msg.content}</p>
              {msg.action && (
                <Button 
                  size="sm" 
                  className="mt-2 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => {
                    toast.success(`Executing ${msg.action?.type}...`)
                    if (msg.action?.type === 'trade') {
                      router.push('/trading/advanced')
                    } else if (msg.action?.type === 'stream') {
                      router.push('/streaming')
                    } else if (msg.action?.type === 'vault') {
                      router.push('/vault')
                    }
                  }}
                >
                  Confirm & Execute
                </Button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted/50 p-3 rounded-lg border border-border flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gemini is thinking...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini AI..."
            disabled={loading}
            className="border-border focus:border-primary"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}