import { GoogleGenerativeAI } from "@google/generative-ai"

interface TradingIntent {
  type: 'trade' | 'stream' | 'vault' | 'query' | 'help'
  action?: string
  params?: {
    amount?: string
    token?: string
    recipient?: string
    duration?: string
    leverage?: number
    side?: 'long' | 'short'
    orderType?: 'market' | 'limit'
  }
  confidence: number
  explanation?: string
}

class GeminiAIService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null
  private initialized: boolean = false

  async initialize(apiKey?: string) {
    try {
      // Use environment variable or passed API key
      const key = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
      
      if (!key) {
        console.warn("Gemini API key not found. Using mock responses.")
        return false
      }

      this.genAI = new GoogleGenerativeAI(key)
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
      this.initialized = true
      
      console.log("Gemini AI initialized successfully")
      return true
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error)
      return false
    }
  }

  async parseUserIntent(message: string): Promise<TradingIntent> {
    if (!this.initialized || !this.model) {
      return this.mockParseIntent(message)
    }

    try {
      const prompt = `
        You are a DeFi trading assistant. Analyze this user message and extract their intent.
        Message: "${message}"
        
        Respond in JSON format with:
        {
          "type": "trade|stream|vault|query|help",
          "action": "buy|sell|deposit|withdraw|stream|info",
          "params": {
            "amount": "numeric amount if mentioned",
            "token": "token symbol (APT, USDC, etc)",
            "recipient": "wallet address if mentioned",
            "duration": "time period if mentioned",
            "leverage": "leverage amount if mentioned (1-150)",
            "side": "long|short for perpetual trades",
            "orderType": "market|limit"
          },
          "confidence": 0.0-1.0,
          "explanation": "brief explanation of what the user wants"
        }
        
        Examples:
        - "Buy 100 APT" → type: trade, action: buy, amount: 100, token: APT
        - "Open a 10x long on APT" → type: trade, action: buy, leverage: 10, side: long
        - "Stream 50 USDC to alice.apt for 30 days" → type: stream, amount: 50, token: USDC, recipient: alice.apt, duration: 30 days
        - "What's my portfolio worth?" → type: query, action: info
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          type: parsed.type || 'help',
          action: parsed.action,
          params: parsed.params,
          confidence: parsed.confidence || 0.7,
          explanation: parsed.explanation
        }
      }
    } catch (error) {
      console.error("Error parsing with Gemini:", error)
    }

    // Fallback to mock parsing
    return this.mockParseIntent(message)
  }

  async generateResponse(intent: TradingIntent, context?: any): Promise<string> {
    if (!this.initialized || !this.model) {
      return this.mockGenerateResponse(intent)
    }

    try {
      const prompt = `
        You are a helpful DeFi trading assistant. Generate a concise, friendly response for this trading intent:
        
        Intent: ${JSON.stringify(intent)}
        Context: ${JSON.stringify(context || {})}
        
        Guidelines:
        - Be concise and clear
        - Confirm the user's intent
        - Mention any important details or warnings
        - Use a friendly, professional tone
        - Include relevant emojis sparingly
        - For trades, mention current prices if available
        - For high leverage trades (>20x), include a risk warning
        
        Keep the response under 100 words.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error generating response:", error)
      return this.mockGenerateResponse(intent)
    }
  }

  async suggestActions(userMessage: string): Promise<string[]> {
    if (!this.initialized || !this.model) {
      return this.mockSuggestActions(userMessage)
    }

    try {
      const prompt = `
        Based on this user message: "${userMessage}"
        
        Suggest 3 relevant follow-up actions for a DeFi trading platform.
        Return as a JSON array of strings, each under 50 characters.
        
        Example: ["Check APT price", "View recent trades", "Set price alert"]
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error("Error suggesting actions:", error)
    }

    return this.mockSuggestActions(userMessage)
  }

  // Mock functions for when API is not available
  private mockParseIntent(message: string): TradingIntent {
    const lowerMessage = message.toLowerCase()
    
    // Trading intents
    if (lowerMessage.includes('buy') || lowerMessage.includes('long')) {
      const amountMatch = message.match(/(\d+)/g)
      const tokenMatch = message.match(/\b(APT|USDC|BTC|ETH)\b/i)
      const leverageMatch = message.match(/(\d+)x/)
      
      return {
        type: 'trade',
        action: 'buy',
        params: {
          amount: amountMatch?.[0],
          token: tokenMatch?.[0]?.toUpperCase() || 'APT',
          leverage: leverageMatch ? parseInt(leverageMatch[1]) : 1,
          side: 'long',
          orderType: 'market'
        },
        confidence: 0.8,
        explanation: 'Opening a long position'
      }
    }
    
    if (lowerMessage.includes('sell') || lowerMessage.includes('short')) {
      const amountMatch = message.match(/(\d+)/g)
      const tokenMatch = message.match(/\b(APT|USDC|BTC|ETH)\b/i)
      
      return {
        type: 'trade',
        action: 'sell',
        params: {
          amount: amountMatch?.[0],
          token: tokenMatch?.[0]?.toUpperCase() || 'APT',
          side: 'short',
          orderType: 'market'
        },
        confidence: 0.8,
        explanation: 'Opening a short position'
      }
    }
    
    // Stream intents - Enhanced parsing
    if (lowerMessage.includes('stream') || lowerMessage.includes('send') || lowerMessage.includes('pay')) {
      const amountMatch = message.match(/(\d+(?:\.\d+)?)/g)
      const tokenMatch = message.match(/\b(APT|USDC|USD)\b/i)
      const recipientMatch = message.match(/to\s+([^\s]+(?:\.[^\s]+)?)/i)
      const durationMatch = message.match(/(?:for|over)\s+(\d+)\s*(day|hour|month|week|year)s?/i)
      
      return {
        type: 'stream',
        action: 'stream',
        params: {
          amount: amountMatch?.[0] || '100',
          token: tokenMatch?.[0]?.toUpperCase() || 'APT',
          recipient: recipientMatch?.[1] || '',
          duration: durationMatch ? `${durationMatch[1]} ${durationMatch[2]}s` : '30 days'
        },
        confidence: recipientMatch ? 0.9 : 0.6,
        explanation: `Setting up a payment stream${recipientMatch ? ` to ${recipientMatch[1]}` : ''}${durationMatch ? ` for ${durationMatch[1]} ${durationMatch[2]}s` : ''}`
      }
    }
    
    // Vault intents
    if (lowerMessage.includes('deposit') || lowerMessage.includes('vault')) {
      const amountMatch = message.match(/(\d+)/g)
      
      return {
        type: 'vault',
        action: 'deposit',
        params: {
          amount: amountMatch?.[0],
          token: 'USDC'
        },
        confidence: 0.7,
        explanation: 'Depositing to vault'
      }
    }
    
    // Default help
    return {
      type: 'help',
      confidence: 0.5,
      explanation: 'How can I help you trade today?'
    }
  }

  private mockGenerateResponse(intent: TradingIntent): string {
    switch (intent.type) {
      case 'trade':
        const leverage = intent.params?.leverage || 1
        const riskWarning = leverage > 20 ? ' ⚠️ High leverage - trade carefully!' : ''
        return `I'll help you ${intent.action} ${intent.params?.amount || ''} ${intent.params?.token || 'APT'} ${leverage > 1 ? `with ${leverage}x leverage` : ''}.${riskWarning} Ready to execute?`
      
      case 'stream':
        return `Setting up a payment stream of ${intent.params?.amount} ${intent.params?.token} to ${intent.params?.recipient}. Please confirm the details.`
      
      case 'vault':
        return `Ready to ${intent.action} ${intent.params?.amount} ${intent.params?.token} ${intent.action === 'deposit' ? 'to' : 'from'} the vault. Current APY: 12.5%`
      
      case 'query':
        return `Let me check that information for you...`
      
      default:
        return `I can help you with:\n• Trading (Buy/Sell APT)\n• Perpetuals (up to 150x leverage)\n• Payment streams\n• Vault deposits\n\nWhat would you like to do?`
    }
  }

  private mockSuggestActions(message: string): string[] {
    const lower = message.toLowerCase()
    
    if (lower.includes('buy') || lower.includes('trade')) {
      return ['Check APT price', 'View order book', 'Set limit order']
    }
    
    if (lower.includes('portfolio') || lower.includes('balance')) {
      return ['View positions', 'Check P&L', 'Export history']
    }
    
    return ['Buy APT', 'Open perpetual', 'View analytics']
  }
}

export const geminiAI = new GeminiAIService()
export type { TradingIntent }