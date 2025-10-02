import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface WebSocketMessage {
  type: 'price_update' | 'transaction_status' | 'vault_update' | 'stream_update'
  data: any
}

export function useWebSocket(url?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)

  const connect = useCallback(() => {
    try {
      const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'wss://api.remora.finance/ws'
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        setIsConnected(true)
        reconnectAttempts.current = 0
        console.log('WebSocket connected')
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          
          // Handle different message types
          switch (message.type) {
            case 'price_update':
              // Update price in real-time
              window.dispatchEvent(new CustomEvent('price_update', { detail: message.data }))
              break
            case 'transaction_status':
              // Show transaction status
              if (message.data.status === 'confirmed') {
                toast.success(`Transaction confirmed: ${message.data.hash}`)
              } else if (message.data.status === 'failed') {
                toast.error(`Transaction failed: ${message.data.reason}`)
              }
              break
            case 'vault_update':
              // Refresh vault data
              window.dispatchEvent(new CustomEvent('vault_update', { detail: message.data }))
              break
            case 'stream_update':
              // Update stream progress
              window.dispatchEvent(new CustomEvent('stream_update', { detail: message.data }))
              break
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }

      ws.current.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
        
        // Reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, timeout)
        }
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    }
  }, [url])

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }, [])

  const subscribe = useCallback((channel: string, params?: any) => {
    sendMessage({
      type: 'subscribe',
      channel,
      params
    })
  }, [sendMessage])

  const unsubscribe = useCallback((channel: string) => {
    sendMessage({
      type: 'unsubscribe',
      channel
    })
  }, [sendMessage])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe
  }
}

// Hook for real-time price updates
export function useRealtimePrices(tokens: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const { subscribe, unsubscribe, lastMessage } = useWebSocket()

  useEffect(() => {
    tokens.forEach(token => {
      subscribe('price', { token })
    })

    const handlePriceUpdate = (event: CustomEvent) => {
      setPrices(prev => ({
        ...prev,
        [event.detail.token]: event.detail.price
      }))
    }

    window.addEventListener('price_update', handlePriceUpdate as EventListener)

    return () => {
      tokens.forEach(token => {
        unsubscribe(`price:${token}`)
      })
      window.removeEventListener('price_update', handlePriceUpdate as EventListener)
    }
  }, [tokens, subscribe, unsubscribe])

  return prices
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [data, setData] = useState(initialData)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const update = useCallback(async (optimisticData: T) => {
    setIsUpdating(true)
    setError(null)
    
    // Optimistically update UI
    setData(optimisticData)

    try {
      // Perform actual update
      const result = await updateFn(optimisticData)
      setData(result)
      return result
    } catch (err) {
      // Revert on error
      setData(initialData)
      setError(err as Error)
      toast.error('Update failed, reverting changes')
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [initialData, updateFn])

  return {
    data,
    isUpdating,
    error,
    update
  }
}