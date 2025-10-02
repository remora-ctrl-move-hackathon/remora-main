# Sponsored Transactions Documentation

## Overview

Sponsored transactions allow users to interact with Remora Finance without paying gas fees. The platform covers transaction costs, making DeFi accessible to everyone.

## How It Works

### Architecture
1. **Two API Keys**:
   - **General API Key**: `NEXT_PUBLIC_APTOS_API_KEY` - For standard API calls and rate limit management
   - **Sponsor Key**: `NEXT_PUBLIC_APTOS_SPONSOR_KEY` - For sponsoring gas fees

2. **Transaction Flow**:
   ```
   User → Signs Transaction → Sponsor Pays Gas → Transaction Executes
   ```

3. **User Experience**:
   - Users see a "Gas-Free" indicator in the header
   - Transactions show "Sponsored" badge
   - No APT required for gas fees
   - Same security (users still sign transactions)

## Configuration

### Environment Variables
```env
# General API Key (for rate limits)
NEXT_PUBLIC_APTOS_API_KEY=aptoslabs_VYUHRKuB2DD_LNkqP7j4L46CPJjh2hFiwAmTNNTefR2ni

# Sponsor Key (for gas sponsorship)
NEXT_PUBLIC_APTOS_SPONSOR_KEY=aptoslabs_Wyd5yg5GABP_MPt1Df2DWxmf6JsFHfQDZH4skGVWBjJG4
```

## Eligible Transactions

The following transactions are sponsored:
- ✅ **Create Stream** - Set up payment streams
- ✅ **Withdraw from Stream** - Claim streamed funds
- ✅ **Deposit to Vault** - Add funds to trading vaults
- ✅ **Create Off-ramp Request** - Convert crypto to fiat
- ✅ **Submit KYC** - Complete verification

## Usage in Components

### Using the Hook
```typescript
import { useSponsoredTransactions } from "@/hooks/useSponsoredTransactions";

function MyComponent() {
  const { 
    sponsorStats, 
    executeSponsoredTransaction, 
    isSponsored 
  } = useSponsoredTransactions();

  const handleTransaction = async () => {
    // Check if sponsored
    if (isSponsored) {
      // Execute sponsored transaction
      const txHash = await executeSponsoredTransaction(
        payload,
        { 
          showToast: true,
          functionName: "create_stream" 
        }
      );
    } else {
      // Fallback to regular transaction
      // ...
    }
  };

  return (
    <div>
      {isSponsored && (
        <Badge>Gas-Free Transaction</Badge>
      )}
      <Button onClick={handleTransaction}>
        Create Stream (Gas-Free)
      </Button>
    </div>
  );
}
```

### Visual Indicators

#### Header Indicator
- Shows "Gas-Free" badge when active
- Click to see savings and stats
- Displays daily limits

#### Transaction Toast
```typescript
toast.success(
  <div>
    <div>Transaction successful!</div>
    <div className="text-xs">Gas fees sponsored ✨</div>
  </div>
);
```

## Sponsor Stats

The system tracks:
- **Total Sponsored**: Number of sponsored transactions
- **Gas Spent**: Total APT spent on gas
- **Daily Limit**: Maximum APT per day
- **Daily Used**: Current day's usage
- **Savings**: User's total savings in APT and USD

## Daily Limits

- **Default Limit**: 1000 APT per day
- **Per-User Limit**: Configurable based on:
  - KYC status
  - Account age
  - Transaction history
  - Total volume

## Security

### User Protection
- Users still sign all transactions
- Private keys never leave the wallet
- Same security as regular transactions

### Sponsor Protection
- Function whitelist (only specific functions)
- Daily limits prevent abuse
- Per-user limits available
- Monitoring and alerts

## Benefits

### For Users
- 🎁 **No Gas Fees**: Trade without holding APT
- 🚀 **Better UX**: No failed transactions due to insufficient gas
- 💰 **Cost Savings**: Save on transaction fees
- ⚡ **Instant Access**: Start using DeFi immediately

### For Platform
- 📈 **Higher Adoption**: Lower barrier to entry
- 🔄 **More Activity**: Users transact more frequently
- 🎯 **User Retention**: Better experience = loyal users
- 📊 **Analytics**: Track sponsored transaction metrics

## Implementation Details

### Service Layer
`src/services/sponsored-transactions.service.ts`
- Handles transaction creation
- Manages sponsor keys
- Tracks statistics

### Hook Layer
`src/hooks/useSponsoredTransactions.ts`
- React integration
- State management
- Toast notifications

### UI Components
`src/components/ui/sponsor-indicator.tsx`
- Visual indicators
- Stats display
- User notifications

## Error Handling

### Fallback Behavior
If sponsorship fails:
1. Automatically fallback to regular transaction
2. User pays gas as normal
3. No interruption in service

### Common Issues
- **Sponsor limit reached**: Falls back to user payment
- **Invalid sponsor key**: Regular transaction mode
- **Network issues**: Retry with exponential backoff

## Monitoring

### Metrics to Track
- Total sponsored transactions
- Gas costs per day/month
- User adoption rate
- Transaction success rate
- Average savings per user

### Alerts
- Daily limit approaching (80%)
- Unusual activity patterns
- Failed sponsorship rate > 5%
- API key issues

## Future Enhancements

### Planned Features
- 🎮 **Gamification**: Rewards for frequent users
- 🏆 **Tiers**: Different sponsorship levels
- 💎 **NFT Holders**: Special benefits
- 🤝 **Referrals**: Earn sponsored transactions

### Optimization
- Dynamic limit adjustment
- Smart contract sponsorship
- Batch transaction sponsorship
- Cross-chain sponsorship

## Testing

### Test Scenarios
1. **Happy Path**: Transaction succeeds with sponsorship
2. **Limit Exceeded**: Fallback to user payment
3. **Network Error**: Retry logic works
4. **Invalid Key**: Graceful degradation

### Test Commands
```bash
# Test with sponsorship enabled
npm run test:sponsored

# Test without sponsorship (fallback)
npm run test:no-sponsor
```

## Support

For issues or questions:
- Check sponsor stats in the header indicator
- View console logs for detailed errors
- Contact support with transaction hash
- Report issues on GitHub

## Conclusion

Sponsored transactions make DeFi accessible to everyone by removing gas fee barriers. With proper configuration and monitoring, this feature significantly improves user experience while maintaining security and control.