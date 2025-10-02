# API Reference

## Overview

The Remora platform provides a comprehensive set of APIs and services for interacting with DeFi protocols on the Aptos blockchain. This section covers all available APIs, services, and integration patterns.

## Core Services

### Trading Service

The `PerpetualTradingService` handles all perpetual trading operations through the Merkle Trade Protocol.

```typescript
import { perpetualTradingService } from '@/services/perpetual-trading.service'
```

#### Methods

##### `placeMarketOrder(userAddress, params)`

Places a market order for immediate execution.

**Parameters:**
- `userAddress` (string): User's wallet address
- `params` (OrderParams): Order configuration

**Returns:** `Promise<InputGenerateTransactionPayloadData>`

**Example:**
```typescript
const order = await perpetualTradingService.placeMarketOrder(
  '0x123...', 
  {
    pair: 'BTC_USD',
    size: 1000,
    collateral: 100,
    isLong: true,
    isIncrease: true
  }
)
```

##### `placeLimitOrder(userAddress, params)`

Places a limit order to execute at a specific price.

**Parameters:**
- `userAddress` (string): User's wallet address  
- `params` (LimitOrderParams): Limit order configuration

**Returns:** `Promise<InputGenerateTransactionPayloadData>`

**Example:**
```typescript
const limitOrder = await perpetualTradingService.placeLimitOrder(
  '0x123...',
  {
    pair: 'ETH_USD',
    size: 500,
    collateral: 50,
    isLong: false,
    isIncrease: true,
    triggerPrice: 2800
  }
)
```

##### `getUserPositions(userAddress)`

Retrieves all active positions for a user.

**Parameters:**
- `userAddress` (string): User's wallet address

**Returns:** `Promise<Position[]>`

**Example:**
```typescript
const positions = await perpetualTradingService.getUserPositions('0x123...')
console.log('Active positions:', positions.length)
```

##### `getUserOrders(userAddress)`

Gets all pending orders for a user.

**Parameters:**
- `userAddress` (string): User's wallet address

**Returns:** `Promise<Order[]>`

##### `getTradingHistory(userAddress)`

Retrieves trading history for a user.

**Parameters:**
- `userAddress` (string): User's wallet address

**Returns:** `Promise<TradeHistory[]>`

##### `getMarketPrice(pair)`

Gets current market price for a trading pair.

**Parameters:**
- `pair` (TradingPair): Trading pair symbol

**Returns:** `Promise<number>`

**Example:**
```typescript
const btcPrice = await perpetualTradingService.getMarketPrice('BTC_USD')
console.log('BTC Price:', btcPrice)
```

##### `validateTradeParams(params)`

Validates order parameters before execution.

**Parameters:**
- `params` (OrderParams): Order parameters to validate

**Returns:** `{ isValid: boolean; error?: string }`

**Example:**
```typescript
const validation = perpetualTradingService.validateTradeParams(orderParams)
if (!validation.isValid) {
  console.error('Validation failed:', validation.error)
}
```

### Configuration Service

The configuration service manages all platform settings and constants.

```typescript
import { MERKLE_CONFIG } from '@/config/merkle'
```

#### Configuration Options

```typescript
export const MERKLE_CONFIG = {
  NETWORK: 'testnet' | 'mainnet',
  TRADING_PAIRS: {
    BTC_USD: 'BTC_USD',
    ETH_USD: 'ETH_USD',
    APT_USD: 'APT_USD',
    SOL_USD: 'SOL_USD',
    AVAX_USD: 'AVAX_USD',
    MATIC_USD: 'MATIC_USD',
    DOGE_USD: 'DOGE_USD'
  },
  DEFAULT_PARAMS: {
    SLIPPAGE_TOLERANCE: 0.01,    // 1%
    MIN_POSITION_SIZE: 2,        // $2 USDC
    DEFAULT_LEVERAGE: 2,         // 2x
    MAX_LEVERAGE: 150           // 150x
  },
  RISK_MANAGEMENT: {
    MAX_POSITION_SIZE_PERCENTAGE: 0.2,  // 20%
    STOP_LOSS_PERCENTAGE: 0.05,         // 5%
    TAKE_PROFIT_PERCENTAGE: 0.15        // 15%
  }
}
```

#### Utility Functions

##### `formatMerkleAmount(amount)`

Converts UI amounts to blockchain format.

**Parameters:**
- `amount` (number): Amount in USDC

**Returns:** `bigint`

**Example:**
```typescript
const formatted = formatMerkleAmount(300) // 300_000_000n
```

##### `parseMerkleAmount(amount)`

Converts blockchain amounts to UI format.

**Parameters:**
- `amount` (bigint | string | number): Amount in micro USDC

**Returns:** `number`

##### `getMinPositionSize()`

Returns minimum position size in USDC.

**Returns:** `number`

##### `getCollateralSymbol()`

Returns the collateral token symbol.

**Returns:** `string` ('USDC')

## React Hooks

### usePerpetualTrading

The main hook for trading functionality.

```typescript
import { usePerpetualTrading } from '@/hooks/usePerpetualTrading'

const {
  loading,
  positions,
  orders,
  tradingHistory,
  tradingStats,
  placeMarketOrder,
  placeLimitOrder,
  cancelOrder,
  closePosition,
  getMarketPrice,
  calculatePnL,
  calculateLiquidationPrice,
  fetchTradingData
} = usePerpetualTrading()
```

#### State Variables

- `loading` (boolean): Loading state for operations
- `positions` (Position[]): User's active positions
- `orders` (Order[]): User's pending orders  
- `tradingHistory` (TradeHistory[]): Historical trades
- `tradingStats` (TradingStats): Trading statistics

#### Functions

- `placeMarketOrder(params)`: Place market order
- `placeLimitOrder(params)`: Place limit order
- `cancelOrder(orderId, pair)`: Cancel pending order
- `closePosition(position)`: Close active position
- `getMarketPrice(pair)`: Get current price
- `calculatePnL(...)`: Calculate position PnL
- `calculateLiquidationPrice(...)`: Calculate liquidation price
- `fetchTradingData(force?)`: Refresh trading data

### useWallet Integration

Wallet connectivity is handled through the Aptos Wallet Adapter.

```typescript
import { useWallet } from '@aptos-labs/wallet-adapter-react'

const { 
  connected, 
  account, 
  signAndSubmitTransaction 
} = useWallet()
```

## Type Definitions

### Core Types

```typescript
// Trading pair identifiers
type TradingPair = 'BTC_USD' | 'ETH_USD' | 'APT_USD' | 'SOL_USD' | 'AVAX_USD' | 'MATIC_USD' | 'DOGE_USD'

// Order parameters for market/limit orders
interface OrderParams {
  pair: TradingPair
  size: number        // Position size in USDC
  collateral: number  // Collateral in USDC  
  isLong: boolean     // Long (buy) or Short (sell)
  isIncrease: boolean // Increase or decrease position
  leverage?: number   // Optional leverage multiplier
}

// Limit order extends OrderParams
interface LimitOrderParams extends OrderParams {
  triggerPrice: number // Execution price
}

// Position data structure
interface Position {
  pair: TradingPair
  size: number
  collateral: number
  isLong: boolean
  entryPrice: number
  markPrice: number
  pnl: number
  liquidationPrice: number
  timestamp: number
}

// Trading statistics
interface TradingStats {
  totalPnl: number
  totalVolume: number
  winRate: number
  activePositions: number
  totalPositions: number
}
```

## Error Handling

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INSUFFICIENT_COLLATERAL` | Not enough collateral | Add more USDC |
| `INVALID_PAIR` | Trading pair not supported | Use supported pair |
| `POSITION_TOO_SMALL` | Below minimum size | Increase position size |
| `LEVERAGE_TOO_HIGH` | Exceeding max leverage | Reduce leverage |
| `MARKET_CLOSED` | Trading unavailable | Wait for market open |
| `NETWORK_ERROR` | Connection issue | Check network |
| `WALLET_NOT_CONNECTED` | Wallet disconnected | Connect wallet |

### Error Response Format

```typescript
interface ApiError {
  code: string
  message: string
  details?: any
}
```

### Example Error Handling

```typescript
try {
  await placeMarketOrder(params)
} catch (error) {
  if (error.code === 'INSUFFICIENT_COLLATERAL') {
    toast.error('Please add more USDC to your wallet')
  } else if (error.code === 'POSITION_TOO_SMALL') {
    toast.error(`Minimum position size is ${getMinPositionSize()} USDC`)
  } else {
    toast.error('Transaction failed. Please try again.')
  }
}
```

## Rate Limiting

### API Call Throttling

```typescript
// Built-in rate limiting (15 second cooldown)
const FETCH_COOLDOWN = 15000

// Automatic throttling in usePerpetualTrading hook
const fetchTradingData = useCallback(async (force = false) => {
  const now = Date.now()
  if (!force && (now - lastFetchTime) < FETCH_COOLDOWN) {
    console.log('Skipping fetch due to cooldown')
    return
  }
  // ... fetch logic
}, [lastFetchTime])
```

## Authentication

### Wallet Connection

```typescript
// Check if wallet is connected
if (!connected || !account) {
  throw new Error('Wallet not connected')
}

// Use wallet address for API calls
const userAddress = account.address
const positions = await getUserPositions(userAddress)
```

### Transaction Signing

```typescript
// Sign and submit transaction
const response = await signAndSubmitTransaction({
  data: payload
})

// Wait for confirmation
await new Promise(resolve => setTimeout(resolve, 2000))
```

## Environment Configuration

### Development

```env
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_MODULE_ADDRESS=0x...
```

### Production

```env
NEXT_PUBLIC_APTOS_NETWORK=mainnet
NEXT_PUBLIC_MODULE_ADDRESS=0x...
```

## SDKs and Dependencies

### Core Dependencies

```json
{
  "@merkletrade/ts-sdk": "^1.0.3",
  "@aptos-labs/ts-sdk": "latest",
  "@aptos-labs/wallet-adapter-react": "latest",
  "next": "15.5.4",
  "react": "18.x",
  "typescript": "5.x"
}
```

### Integration Examples

```typescript
// Initialize Merkle client
const merkle = new MerkleClient(await MerkleClientConfig.testnet())

// Create Aptos client
const aptos = new Aptos(merkle.config.aptosConfig)

// Example transaction
const payload = await merkle.payloads.placeMarketOrder({
  pair: "BTC_USD",
  userAddress: account.accountAddress,
  sizeDelta: 300_000_000n, // 300 USDC
  collateralDelta: 5_000_000n, // 5 USDC
  isLong: true,
  isIncrease: true
})
```

## Testing

### Mock Services

```typescript
// Mock trading service for testing
const mockTradingService = {
  placeMarketOrder: jest.fn().mockResolvedValue({ hash: '0x123...' }),
  getUserPositions: jest.fn().mockResolvedValue([]),
  getMarketPrice: jest.fn().mockResolvedValue(50000)
}
```

### Integration Testing

```typescript
// Test API integration
describe('Trading API', () => {
  it('should place market order', async () => {
    const result = await placeMarketOrder(mockParams)
    expect(result.hash).toBeDefined()
  })
  
  it('should fetch user positions', async () => {
    const positions = await getUserPositions('0x123...')
    expect(Array.isArray(positions)).toBe(true)
  })
})
```

## Performance Optimization

### Caching Strategy

```typescript
// Cache market prices for 30 seconds
const priceCache = new Map<TradingPair, { price: number; timestamp: number }>()

const getCachedPrice = (pair: TradingPair) => {
  const cached = priceCache.get(pair)
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached.price
  }
  return null
}
```

### Batch Operations

```typescript
// Fetch multiple data points in parallel
const [positions, orders, history, stats] = await Promise.all([
  getUserPositions(userAddress),
  getUserOrders(userAddress), 
  getTradingHistory(userAddress),
  getTradingStats(userAddress)
])
```

## Related Documentation

- [Trading Module Guide](../modules/trading.md)
- [Frontend Components](../frontend/README.md)
- [Smart Contracts](../contracts/README.md)
- [Deployment Guide](../deployment/production.md)