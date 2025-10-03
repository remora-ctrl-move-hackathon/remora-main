# Merkle Trade Documentation Overview

**Source:** https://docs.merkle.trade/
**MCP Server:** https://docs.merkle.trade/~gitbook/mcp

## Documentation Structure

### 1. Getting Started
- **Link:** https://docs.merkle.trade/getting-started
- **Content:** Initial setup guide for using Merkle Trade platform
- **Action:** Start trading on app.merkle.trade

### 2. Trading Section

#### Opening a Trade
- **Link:** https://docs.merkle.trade/trading/opening-a-trade

**Key Concepts:**

1. **Collateral (#1)**: The amount of funds used to open a trading position
2. **Leverage (#2)**: Multiplier for exposure to the underlying asset
   - Allows opening larger positions with smaller initial capital
   - Magnifies both profits and losses
3. **Position Size (#3)**: Extent of position's exposure
   - Formula: `Position Size = Collateral × Leverage`
4. **Position Details (#4)**:
   - Entry price (for market orders)
   - Liquidation price

**Risk Management Features:**

- **Take Profit (TP)**: Pre-determined price level to automatically close position and lock in profits
  - Maximum TP: Limited to 900%

- **Stop Loss (SL)**: Pre-determined price level to automatically close position and limit losses

**Important Note for Forex & Commodities:**
- TP and SL may execute at prices significantly different from specified due to price gaps between market closing and opening

## Next Documentation Needed

- [ ] Position Management details
- [ ] Fees & Price Impact
- [ ] Liquidation mechanics
- [ ] Trading pairs supported
- [ ] Contract addresses (testnet/mainnet)
- [ ] TypeScript SDK documentation
- [ ] API reference

## Search Results Status

✅ Getting Started - Found
✅ Opening a Trade - Found
⏳ TypeScript SDK - Not found yet
⏳ Contract Addresses - Not found yet
⏳ Position Management - Partial info
⏳ Fees - Not found yet
