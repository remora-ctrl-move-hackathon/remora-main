import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AIAssistant } from '@/components/ai-assistant'
import toast from 'react-hot-toast'

jest.mock('react-hot-toast')

describe('AIAssistant', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with initial greeting message', () => {
    render(<AIAssistant />)
    
    expect(screen.getByText(/Hi! I can help you trade/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument()
  })

  describe('Natural Language Processing', () => {
    it('recognizes buy commands', async () => {
      const user = userEvent.setup()
      render(<AIAssistant />)
      
      const input = screen.getByPlaceholderText('Ask me anything...')
      await user.type(input, 'Buy 100 USDC of APT')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.getByText(/I'll help you trade 100 USDC/)).toBeInTheDocument()
        expect(screen.getByText('Confirm Transaction')).toBeInTheDocument()
      })
    })

    it('recognizes stream commands', async () => {
      const user = userEvent.setup()
      render(<AIAssistant />)
      
      const input = screen.getByPlaceholderText('Ask me anything...')
      await user.type(input, 'Stream 50 USDC to alice.apt')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.getByText(/I'll help you stream 50 USDC/)).toBeInTheDocument()
      })
    })

    it('recognizes vault commands', async () => {
      const user = userEvent.setup()
      render(<AIAssistant />)
      
      const input = screen.getByPlaceholderText('Ask me anything...')
      await user.type(input, 'Deposit 1000 USDC')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.getByText(/I'll help you vault 1000 USDC/)).toBeInTheDocument()
      })
    })

    it('provides help for unrecognized commands', async () => {
      const user = userEvent.setup()
      render(<AIAssistant />)
      
      const input = screen.getByPlaceholderText('Ask me anything...')
      await user.type(input, 'What can you do?')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.getByText(/I can help you with:/)).toBeInTheDocument()
        expect(screen.getByText(/Trading:/)).toBeInTheDocument()
        expect(screen.getByText(/Streaming:/)).toBeInTheDocument()
        expect(screen.getByText(/Vaults:/)).toBeInTheDocument()
      })
    })
  })

  describe('Transaction Confirmation', () => {
    it('shows success message when transaction is confirmed', async () => {
      const user = userEvent.setup()
      render(<AIAssistant />)
      
      const input = screen.getByPlaceholderText('Ask me anything...')
      await user.type(input, 'Buy 100 USDC')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.getByText('Confirm Transaction')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Confirm Transaction'))
      
      expect(toast.success).toHaveBeenCalledWith('Executing trade...')
    })
  })

  describe('UI Interactions', () => {
    it('clears input after sending message', async () => {
      const user = userEvent.setup()
      render(<AIAssistant />)
      
      const input = screen.getByPlaceholderText('Ask me anything...') as HTMLInputElement
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('shows loading state while processing', async () => {
      const user = userEvent.setup()
      render(<AIAssistant />)
      
      await user.type(screen.getByPlaceholderText('Ask me anything...'), 'Buy APT')
      await user.click(screen.getByRole('button', { name: /send/i }))

      expect(screen.getByText('Thinking...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.queryByText('Thinking...')).not.toBeInTheDocument()
      })
    })

    it('prevents empty messages', async () => {
      const user = userEvent.setup()
      render(<AIAssistant />)
      
      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      // Should not add any new messages
      const messages = screen.queryAllByText(/I'll help you/)
      expect(messages).toHaveLength(0)
    })
  })
})