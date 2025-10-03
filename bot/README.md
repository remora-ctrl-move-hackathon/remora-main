# Remora Copy-Trading Bot

Automated bot that monitors a lead trader's Merkle perpetual trades and replicates them proportionally to a Remora vault.

## Features

- ✅ **Real-time WebSocket monitoring** - Instant trade detection via Merkle WebSocket API
- ✅ **1:1 Trade replication** - Automatically copies lead trader's positions (scaled to vault size)
- ✅ **Position tracking** - Monitors opens, closes, and modifications
- ✅ **Vault integration** - Records all trades in the vault smart contract
- ✅ **Graceful error handling** - Auto-reconnects on WebSocket failures

## Architecture

```
┌─────────────────┐
│  Lead Trader    │ Makes trades on Merkle
│  (0xabc...123)  │
└────────┬────────┘
         │
         ↓ WebSocket updates
┌─────────────────┐
│  Copy Bot       │ TypeScript service
│  (This app)     │
└────────┬────────┘
         │
         ↓ Replicates trades
┌─────────────────┐
│  Vault Contract │ Holds investor funds
│  + Merkle SDK   │
└─────────────────┘
         │
         ↓ P&L distributed
┌─────────────────┐
│   Investors     │ Passive vault depositors
└─────────────────┘
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
# Bot wallet (must be vault manager)
BOT_PRIVATE_KEY=your-private-key-here

# Vault configuration
MODULE_ADDRESS=0x614c86a7ecbce646aabd87644f8655342a797606bf26888b2fb06177d957322f
VAULT_ID=1

# Network (testnet or mainnet)
APTOS_NETWORK=testnet
```

### 3. Run the Bot

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## How It Works

1. **Initialization**
   - Bot connects to Aptos network
   - Fetches vault info to get `lead_trader` address
   - Connects to Merkle WebSocket API

2. **Monitoring**
   - Subscribes to lead trader's account feed
   - Syncs initial positions
   - Listens for real-time trade events

3. **Trade Replication**
   - **New position**: Bot opens matching position via Merkle
   - **Position modified**: Bot adjusts position size
   - **Position closed**: Bot closes matching position

4. **Vault Recording**
   - All trades recorded in vault contract via `execute_trade()`
   - P&L tracked and distributed to investors

## Position Scaling

Currently uses **1:1 scaling** - vault copies exact same position sizes as lead trader.

Future enhancements could add:
- Risk percentage (e.g., use only 50% of vault funds)
- Max position size limits
- Stop-loss automation
- Position sizing based on vault TVL

## Error Handling

- Auto-reconnects on WebSocket disconnection (10s delay)
- Graceful shutdown on SIGINT/SIGTERM
- Comprehensive error logging
- Failed trades logged but don't crash bot

## Monitoring

The bot logs all activity:
- ✅ Position opens/closes
- 📊 Size calculations
- 💰 Transaction hashes
- ⚠️  Errors and warnings

## Security

- Private keys stored in `.env` (never commit!)
- Bot wallet should only have permissions to execute trades
- Vault manager role required
- All transactions signed by bot wallet

## Development

Build TypeScript:
```bash
npm run build
```

Run in development:
```bash
npm run dev
```

## Troubleshooting

**WebSocket keeps disconnecting:**
- Check network connectivity
- Verify Merkle API is accessible
- Check rate limits

**Trades not replicating:**
- Verify bot wallet has vault manager role
- Check vault has sufficient funds
- Verify lead trader address is correct

**Position sizes incorrect:**
- Review `calculateProportionalSize()` logic
- Check vault total value calculation
- Verify Merkle SDK position data format

## License

Apache 2.0
