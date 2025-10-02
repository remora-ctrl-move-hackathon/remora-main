# Perpetual Trading Module

## Overview

The Perpetual Trading module integrates with Merkle Trade Protocol to provide advanced derivatives trading capabilities on the Aptos blockchain. Users can trade crypto perpetuals with leverage up to 150x using USDC collateral.

## Features

### Core Trading Functions
- **Market Orders** - Instant execution at current market price
- **Limit Orders** - Execute at specific price levels
- **Position Management** - Open, close, and modify positions
- **Real-time Data** - Live price feeds and position updates
- **Risk Management** - Built-in leverage and exposure controls

### Supported Assets
- BTC/USD
- ETH/USD  
- APT/USD
- SOL/USD
- AVAX/USD
- MATIC/USD
- DOGE/USD

## Technical Implementation

### Service Architecture

```typescript
// Trading Service Structure
class PerpetualTradingService {
  private merkleClient: MerkleClient
  
  // Order Management
  async placeMarketOrder(params: OrderParams)
  async placeLimitOrder(params: LimitOrderParams) 
  async cancelOrder(orderId: string)
  
  // Position Management
  async getUserPositions(userAddress: string)
  async closePosition(position: Position)
  
  // Data Retrieval
  async getTradingHistory(userAddress: string)
  async getMarketPrice(pair: TradingPair)
}
```

### Key Interfaces

```typescript
interface OrderParams {
  pair: TradingPair
  size: number        // Position size in USDC
  collateral: number  // Collateral in USDC
  isLong: boolean     // Long (buy) or Short (sell)
  isIncrease: boolean // Increase or decrease position
  leverage?: number   // Optional leverage multiplier
}

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
```

## Usage Examples

### Placing a Market Order

```typescript
import { usePerpetualTrading } from '@/hooks/usePerpetualTrading'

const { placeMarketOrder } = usePerpetualTrading()

const orderParams = {
  pair: 'BTC_USD',
  size: 1000,        // $1000 position
  collateral: 100,   // $100 collateral (10x leverage)
  isLong: true,      // Buy/Long position
  isIncrease: true   // Opening new position
}

await placeMarketOrder(orderParams)
```

### Placing a Limit Order

```typescript
const limitOrderParams = {
  pair: 'ETH_USD',
  size: 500,
  collateral: 50,
  isLong: false,      // Short position
  isIncrease: true,
  triggerPrice: 2800  // Execute when ETH hits $2800
}

await placeLimitOrder(limitOrderParams)
```

### Closing a Position

```typescript
const { positions, closePosition } = usePerpetualTrading()

// Close a specific position
const position = positions[0]
await closePosition(position)
```

## Configuration

### Merkle Trade Setup

```typescript
// src/config/merkle.ts
export const MERKLE_CONFIG = {
  NETWORK: 'testnet', // or 'mainnet'
  TRADING_PAIRS: {
    BTC_USD: 'BTC_USD',
    ETH_USD: 'ETH_USD',
    APT_USD: 'APT_USD',
    // ... other pairs
  },
  DEFAULT_PARAMS: {
    MIN_POSITION_SIZE: 2,    // $2 minimum
    MAX_LEVERAGE: 150,       // 150x max leverage
    SLIPPAGE_TOLERANCE: 0.01 // 1%
  }
}
```

### Client Initialization

```typescript
export async function createMerkleClient(): Promise<MerkleClient> {
  const config = MERKLE_CONFIG.NETWORK === 'mainnet' 
    ? await MerkleClientConfig.mainnet()
    : await MerkleClientConfig.testnet()
  
  return new MerkleClient(config)
}
```

## Amount Formatting

The module uses USDC as the standard collateral with 6 decimal precision:

```typescript
// Convert UI amounts to blockchain format
export function formatMerkleAmount(amount: number): bigint {
  // 300 USDC -> 300_000_000n (micro USDC)
  return BigInt(Math.floor(amount * 1_000_000))
}

// Convert blockchain amounts to UI format  
export function parseMerkleAmount(amount: bigint): number {
  // 300_000_000n -> 300 USDC
  return Number(amount) / 1_000_000
}
```

## Risk Management

### Position Validation

```typescript
validateTradeParams(params: OrderParams) {
  // Minimum position size check
  if (params.size < MERKLE_CONFIG.DEFAULT_PARAMS.MIN_POSITION_SIZE) {
    return { isValid: false, error: 'Position too small' }
  }
  
  // Maximum leverage check
  const leverage = params.size / params.collateral
  if (leverage > MERKLE_CONFIG.DEFAULT_PARAMS.MAX_LEVERAGE) {
    return { isValid: false, error: 'Leverage too high' }
  }
  
  // Collateral validation
  if (params.collateral <= 0) {
    return { isValid: false, error: 'Invalid collateral' }
  }
  
  return { isValid: true }
}
```

### PnL Calculations

```typescript
// Calculate unrealized PnL
calculatePnL(
  entryPrice: number,
  currentPrice: number, 
  size: number,
  isLong: boolean
): number {
  const priceDiff = isLong 
    ? currentPrice - entryPrice 
    : entryPrice - currentPrice
    
  return (priceDiff / entryPrice) * size
}

// Calculate liquidation price
calculateLiquidationPrice(
  entryPrice: number,
  collateral: number,
  size: number,
  isLong: boolean
): number {
  const leverage = size / collateral
  const maintenanceMargin = 0.01 // 1%
  const liquidationDistance = collateral * maintenanceMargin / size
  
  return isLong 
    ? entryPrice * (1 - liquidationDistance)
    : entryPrice * (1 + liquidationDistance)
}
```

## Error Handling

### Common Error Scenarios

```typescript
try {
  await placeMarketOrder(params)
} catch (error) {
  switch (error.code) {
    case 'INSUFFICIENT_COLLATERAL':
      toast.error('Insufficient collateral for this trade')
      break
    case 'INVALID_PAIR':
      toast.error('Trading pair not supported')
      break
    case 'MARKET_CLOSED':
      toast.error('Market is currently closed')
      break
    default:
      toast.error('Trade execution failed')
  }
}
```

### Network Error Handling

```typescript
// Automatic retry logic with exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      )
    }
  }
  throw new Error('Max retries exceeded')
}
```

## Performance Optimization

### Data Fetching

```typescript
// Throttled API calls to prevent rate limiting
const [lastFetchTime, setLastFetchTime] = useState<number>(0)
const FETCH_COOLDOWN = 15000 // 15 seconds

const fetchTradingData = useCallback(async (force = false) => {
  const now = Date.now()
  if (!force && (now - lastFetchTime) < FETCH_COOLDOWN) {
    return // Skip fetch due to cooldown
  }
  
  setLastFetchTime(now)
  // ... fetch logic
}, [lastFetchTime])
```

### Real-time Updates

```typescript
// Periodic data refresh
useEffect(() => {
  if (account) {
    const interval = setInterval(() => {
      fetchTradingData(false) // Respect cooldown
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }
}, [account, fetchTradingData])
```

## Testing

### Unit Tests

```typescript
// Test order validation
describe('Order Validation', () => {
  it('should reject orders below minimum size', () => {
    const params = { size: 1, collateral: 1, /* ... */ }
    const result = service.validateTradeParams(params)
    expect(result.isValid).toBe(false)
  })
  
  it('should reject excessive leverage', () => {
    const params = { size: 15000, collateral: 100, /* ... */ }
    const result = service.validateTradeParams(params)
    expect(result.isValid).toBe(false)
  })
})
```

### Integration Tests

```typescript
// Test order placement flow
describe('Order Placement', () => {
  it('should place market order successfully', async () => {
    const mockParams = createValidOrderParams()
    const result = await service.placeMarketOrder(
      '0x123...', 
      mockParams
    )
    expect(result).toBeDefined()
    expect(result.hash).toBeDefined()
  })
})
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Position size too small" | Order below $2 minimum | Increase position size |
| "Leverage too high" | Exceeding 150x limit | Reduce leverage or increase collateral |
| "Insufficient balance" | Not enough USDC | Add more USDC to wallet |
| "Market closed" | Trading outside hours | Wait for market to open |
| "Price impact too high" | Large order size | Split into smaller orders |

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('MERKLE_DEBUG', 'true')

// View detailed error information
console.log('Order params:', params)
console.log('Validation result:', validation)
console.log('Merkle response:', response)
```

## Best Practices

1. **Always validate parameters** before sending transactions
2. **Use appropriate position sizing** relative to account balance
3. **Monitor positions regularly** for PnL and liquidation risk
4. **Implement proper error handling** for all trading operations
5. **Test thoroughly** on testnet before mainnet deployment
6. **Keep collateral buffers** to avoid unexpected liquidations
7. **Use stop-losses** to limit downside risk

## Related Documentation

- [Merkle Trade Protocol Docs](https://docs.merkle.trade/)
- [Aptos Wallet Integration](../api/wallet.md)
- [Smart Contract Interactions](../contracts/trading.md)
- [UI Components](../frontend/trading-components.md)