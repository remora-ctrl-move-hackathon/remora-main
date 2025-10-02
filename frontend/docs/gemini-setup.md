# Gemini AI Setup Guide

## Overview
The Remora Finance platform uses Google's Gemini AI to provide intelligent trading assistance through natural language processing.

## Features
- Natural language trading commands ("Buy 100 APT with 10x leverage")
- Smart intent detection for trading, streaming, and vault operations
- Context-aware suggestions and responses
- Seamless integration with the trading interface

## Setup Instructions

### 1. Get a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use an existing one
5. Copy the API key

### 2. Configure Environment Variable
Add your API key to the `.env.local` file:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### 3. Test the Integration
1. Start the development server: `npm run dev`
2. Open the command palette with `Cmd+K` (Mac) or `Ctrl+K` (Windows)
3. Try these example commands:
   - "Buy 100 APT"
   - "Open a 10x long position on APT"
   - "Stream 50 USDC to alice.apt for 30 days"
   - "Deposit 1000 USDC to vault"

## How It Works

### Command Processing Flow
1. User enters a natural language command
2. Gemini AI parses the intent and extracts parameters
3. The system generates an appropriate response
4. For high-confidence matches, actions are automatically suggested
5. User can confirm and execute the action

### Supported Commands

#### Trading Commands
- "Buy [amount] [token]" - Market buy order
- "Sell [amount] [token]" - Market sell order
- "Open [leverage]x long/short on [token]" - Perpetual position
- "Set limit order at [price]" - Limit order

#### Streaming Commands
- "Stream [amount] [token] to [recipient]" - Payment stream
- "Send [amount] to [address] over [duration]" - Scheduled payment

#### Vault Commands
- "Deposit [amount] to vault" - Vault deposit
- "Withdraw [amount] from vault" - Vault withdrawal
- "Show vault APY" - Query vault information

## API Usage Limits
- Free tier: 60 requests per minute
- Rate limiting is handled automatically
- Fallback to local parsing when API is unavailable

## Troubleshooting

### API Key Not Working
- Ensure the key is correctly copied without spaces
- Check that the key has the correct permissions
- Verify your Google Cloud project has the Gemini API enabled

### No AI Responses
- Check browser console for errors
- Verify the environment variable is loaded (restart dev server)
- Test with simple commands first

### Slow Responses
- Normal response time: 500-1500ms
- Check your internet connection
- Consider upgrading to a paid tier for better performance

## Security Notes
- Never commit your API key to version control
- Use environment variables for all sensitive data
- The API key is only used client-side for demo purposes
- For production, implement a backend proxy for API calls

## Color Theme
The AI interface uses the Remora Finance brand colors:
- Primary (Teal): `#14b8a6`
- Background: Pure black/white based on theme
- Accents: Muted grays for secondary elements

## Support
For issues or questions about the Gemini AI integration, please open an issue on GitHub or contact the development team.