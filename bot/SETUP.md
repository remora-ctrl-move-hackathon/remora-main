# Copy-Trading Bot Setup Guide

## Prerequisites
- Node.js installed
- A wallet with funds (will be the vault manager)
- A vault created with a `lead_trader` address set

## Step 1: Install Dependencies

```bash
cd /Users/cyber/Downloads/Remora/remora-main/bot
npm install
```

## Step 2: Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Aptos Network
APTOS_NETWORK=testnet
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1

# Bot Wallet (Manager of the vault) - CRITICAL: Must be the vault manager address
BOT_PRIVATE_KEY=0x<your-private-key>

# Vault Configuration
MODULE_ADDRESS=<your-deployed-contract-address>
VAULT_ID=<your-vault-id>

# Merkle Configuration (these are correct for testnet)
MERKLE_API_URL=https://api.testnet.merkle.trade
MERKLE_WS_URL=wss://ws.testnet.merkle.trade

# Monitoring
POLL_INTERVAL_MS=5000
LOG_LEVEL=info
```

## Step 3: Get Your Configuration Values

### Get Module Address:
The contract address where your vault is deployed.

### Get Vault ID:
When you create a vault, you get back a vault ID. Use that number.

### Get Bot Private Key:
⚠️ **IMPORTANT**: This must be the private key of the vault **manager** address.

To export your private key from Petra wallet:
1. Open Petra
2. Go to Settings → Security & Privacy
3. Export Private Key
4. **Keep this secure! Never share it!**

## Step 4: Run the Bot

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

## How It Works

1. **Monitors Lead Trader**: The bot connects to Merkle's WebSocket and watches the `lead_trader` address
2. **Detects Trades**: When the lead trader opens/closes/modifies a position, the bot detects it
3. **Replicates**: The bot executes the same trade using the vault's funds
4. **Records**: The trade is recorded in the vault contract for tracking

## Bot Output Example

```
🚀 Starting Remora Copy-Trading Bot...
📍 Module Address: 0x614c86a7...
🏦 Vault ID: 1
👨‍💼 Lead Trader: 0xabc...123
💰 Vault Total Value: 5000 APT
👀 Starting WebSocket monitoring...
✅ Connected to Merkle WebSocket
✅ Subscribed to account feed
📊 Syncing initial positions...
Found 2 open positions
  📍 BTC_USD: LONG 1000 USDC
  📍 ETH_USD: SHORT 500 USDC

🆕 NEW POSITION: APT_USD LONG
  💰 Lead trader size: 300 USDC
  💰 Vault proportional size: 300 USDC
  ✅ Position replicated! Tx: 0xdef...456
```

## Troubleshooting

### Error: "Vault not found"
- Check that VAULT_ID is correct
- Ensure the vault exists and is active

### Error: "Unauthorized"
- Verify BOT_PRIVATE_KEY is the vault manager's private key
- Check that the manager address matches

### Error: "WebSocket disconnected"
- The bot will auto-reconnect after 10 seconds
- Check your internet connection
- Verify Merkle is accessible

### Error: "Insufficient balance"
- The vault needs funds to execute trades
- Ensure investors have deposited to the vault

## Monitoring

The bot logs all activity to console. In production, you can:

1. **Use PM2** for process management:
```bash
npm install -g pm2
pm2 start npm --name "copy-trader" -- start
pm2 logs copy-trader
```

2. **Use Docker**:
```bash
docker build -t copy-trader-bot .
docker run -d --env-file .env copy-trader-bot
```

## Security Notes

⚠️ **CRITICAL SECURITY**:
- Never commit `.env` to git
- Store BOT_PRIVATE_KEY securely
- Use a dedicated wallet for the bot
- Monitor bot activity regularly
- Set up alerts for errors

## Next Steps

1. Test with small amounts first
2. Monitor bot behavior closely
3. Set up proper logging/alerts
4. Consider adding risk management (max position size, stop-loss)
