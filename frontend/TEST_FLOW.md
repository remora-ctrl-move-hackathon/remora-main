# Complete Merkle + Vault Integration Test Flow

## ✅ What's Been Set Up

1. **Merkle SDK** - Installed and tested (`@merkletrade/ts-sdk@1.0.3`)
2. **Vault Contract** - Has `lead_trader` field and `execute_trade` function
3. **Integrated Service** - `VaultMerkleTradingService` connects Merkle trades to vault recording
4. **Hook** - `useVaultMerkleTrading` for UI integration
5. **Copy-Trading Bot** - Automated trade replication via WebSocket

## 🧪 Testing Flow

### Step 1: Create a Vault
1. Go to http://localhost:3000/vault
2. Click "Create Vault"
3. Fill in details:
   - **Name**: "Merkle Trading Vault"
   - **Description**: "Automated Merkle perpetual trading"
   - **Lead Trader Address**: `0x<address-to-copy>` (or leave empty for manual)
   - **Management Fee**: 2%
   - **Performance Fee**: 20%
   - **Min Deposit**: 100 APT

4. Click "Create Vault"
5. **Note the Vault ID** from the success message

### Step 2: Deposit to Vault
1. In the vault list, find your vault
2. Click "Deposit"
3. Enter amount (e.g., 1000 APT)
4. Confirm transaction
5. Verify your shares are shown

### Step 3: Execute Merkle Trade (Manual)

#### Option A: Using Vault UI (if integrated)
1. Go to vault management page
2. Click "Execute Trade"
3. Select trading pair (e.g., BTC/USD)
4. Enter:
   - Position Size: 300 USDC
   - Collateral: 100 USDC
   - Direction: Long/Short
5. Click "Place Trade"
6. **Two transactions will execute**:
   - Transaction 1: Merkle trade execution
   - Transaction 2: Vault trade recording

#### Option B: Using Perpetual Trading Page
1. Go to http://localhost:3000/vault/trading
2. Click "Market Order"
3. Select pair: BTC/USD
4. Enter:
   - Position Size: 300 USDC
   - Collateral: 100 USDC
5. Choose Long/Short
6. Click "Place Market Order"

### Step 4: Verify Trade Execution

#### Check Merkle Position:
1. Go to "Active Positions" tab
2. Should see your position with:
   - Entry price
   - Current P&L
   - Liquidation price

#### Check Vault Record:
1. Go back to /vault
2. Open your vault details
3. Check "Trading History" (if implemented)
4. Should see the trade recorded

### Step 5: Test Copy-Trading Bot (Optional)

#### Setup:
1. `cd /Users/cyber/Downloads/Remora/remora-main/bot`
2. `cp .env.example .env`
3. Edit `.env`:
   ```env
   BOT_PRIVATE_KEY=<your-vault-manager-private-key>
   VAULT_ID=<your-vault-id>
   MODULE_ADDRESS=<deployed-contract-address>
   ```
4. `npm install`
5. `npm run dev`

#### Test Flow:
1. Bot starts monitoring lead trader
2. Lead trader executes trade (or you simulate)
3. Bot detects and replicates
4. Verify both:
   - Merkle position created
   - Vault trade recorded

### Step 6: Close Position

1. Go to Active Positions
2. Click "Close Position" on your trade
3. Verify:
   - Position closed on Merkle
   - P&L calculated
   - Vault updated with profit/loss

## 🔍 Verification Checklist

### Merkle Integration:
- [ ] SDK initializes successfully
- [ ] Can fetch market data (66 trading pairs)
- [ ] Can place market orders
- [ ] Can place limit orders
- [ ] Positions show correct P&L
- [ ] Can close positions

### Vault Integration:
- [ ] Vault stores lead_trader address
- [ ] execute_trade records Merkle trades
- [ ] Trades show in vault history
- [ ] P&L updates vault total_value
- [ ] Shares adjust based on performance

### Copy-Trading Bot:
- [ ] Connects to Merkle WebSocket
- [ ] Monitors lead trader
- [ ] Detects new positions
- [ ] Replicates trades proportionally
- [ ] Records in vault contract
- [ ] Auto-reconnects on disconnect

## 🐛 Known Issues to Test

1. **Transaction Ordering**: Ensure Merkle trade executes BEFORE vault record
2. **P&L Calculation**: Verify correct profit/loss amounts
3. **Collateral Handling**: Check APT ↔ USDC conversions
4. **Error Handling**: Test failed trades, insufficient balance
5. **WebSocket Stability**: Test bot reconnection

## 📊 Expected Results

### Successful Flow:
1. Vault created with ID
2. Deposit increases vault total_value
3. Merkle trade executes successfully
4. Trade recorded in vault with correct details
5. Position shows in Merkle UI
6. Vault P&L updates in real-time
7. Bot replicates trades (if lead_trader set)

### Transaction Hashes:
- Vault Creation: `0x...`
- Deposit: `0x...`
- Merkle Trade: `0x...`
- Vault Record: `0x...`
- Close Position: `0x...`

## 🚨 Error Scenarios to Test

1. **Insufficient Vault Balance**: Try trade larger than vault funds
2. **Invalid Trading Pair**: Use unsupported pair
3. **Max Leverage Exceeded**: Try >150x leverage
4. **Unauthorized**: Non-manager tries to execute_trade
5. **Vault Paused**: Try trading when vault is paused
6. **WebSocket Disconnect**: Stop/restart Merkle service

## 📝 Next Steps After Testing

1. Add UI for vault Merkle trading
2. Implement trade history display
3. Add P&L charts
4. Set up risk management (stop-loss, take-profit)
5. Deploy to testnet for public testing
6. Add monitoring/alerts for bot

## 🔗 Useful Links

- **Local Frontend**: http://localhost:3000
- **Vaults Page**: http://localhost:3000/vault
- **Trading Page**: http://localhost:3000/vault/trading
- **Merkle Testnet**: https://app.testnet.merkle.trade
- **Aptos Explorer**: https://explorer.aptoslabs.com/?network=testnet
