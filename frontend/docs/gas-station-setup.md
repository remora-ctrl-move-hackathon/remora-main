# Geomi Gas Station Integration for Vault Contract

This guide explains how to set up and use Geomi Gas Station to sponsor gas fees for the vault contract transactions.

## Vault Contract Address
```
0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault
```

## Setup Instructions

### 1. Create a Gas Station on Geomi

1. Go to [Geomi.dev](https://geomi.dev)
2. Navigate to your project dashboard
3. Click "Add Resource" > "Gas Station"
4. Configure the following:
   - **Name**: Vault Gas Station
   - **Network**: Testnet (or your target network)
   - **API Key**: Will be auto-generated

### 2. Configure Contract Rules

Add rules for the vault contract functions you want to sponsor:

```javascript
// Sponsored Functions
const sponsoredFunctions = [
  "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault::create_vault",
  "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault::deposit_to_vault",
  "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault::withdraw_from_vault",
  "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault::execute_trade",
  "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault::update_vault_status",
  "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault::claim_management_fee",
  "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault::claim_performance_fee",
];
```

### 3. Set Spending Limits

Configure spending limits per function:
- `create_vault`: 0.1 APT per transaction
- `deposit_to_vault`: 0.05 APT per transaction
- `withdraw_from_vault`: 0.05 APT per transaction
- `execute_trade`: 0.1 APT per transaction
- Other functions: 0.02 APT per transaction

### 4. Environment Configuration

Add the Gas Station API key to your `.env.local`:

```bash
# Geomi Gas Station API Key
NEXT_PUBLIC_GEOMI_GAS_STATION_API_KEY=your_api_key_here
```

## Implementation

### Gas Station Service

The gas station service (`src/services/gas-station.service.ts`) handles:
- Initialization with API key
- Transaction sponsoring
- Function eligibility checks

```typescript
import { gasStation } from "@/services/gas-station.service";

// Check if gas station is enabled
if (gasStation.isEnabled()) {
  // Transaction will be sponsored
  const txHash = await gasStation.submitSponsoredTransaction(
    payload,
    signer
  );
}
```

### Updated Vault Hook

The vault hook (`src/hooks/useVault-with-gas-station.ts`) automatically:
1. Detects if gas station is enabled
2. Attempts to sponsor eligible transactions
3. Falls back to regular transactions if sponsoring fails
4. Shows success messages with sponsorship indicator

```typescript
const { 
  createVault, 
  depositToVault, 
  withdrawFromVault,
  isGasStationEnabled 
} = useVault();

// All vault operations automatically use gas station when available
await createVault({
  name: "My Vault",
  description: "Test vault",
  managementFee: 2,
  performanceFee: 20,
  minInvestment: 100,
  maxInvestors: 100
});
```

## User Experience

When gas station is enabled:
- Users see "✨ Gas fees sponsored" in success messages
- Transactions are submitted without requiring gas from user wallets
- Seamless fallback to regular transactions if sponsoring fails

## Monitoring

Monitor gas station usage through:
1. Geomi Dashboard - View transaction history and spending
2. Application logs - Check console for sponsoring status
3. Gas station stats API - Track usage programmatically

```typescript
const stats = await gasStation.getStats();
// Returns: { totalSponsored, dailyLimit, dailyUsed, isEnabled }
```

## Security Considerations

1. **API Key Security**: Never expose API keys in client-side code
2. **Function Allowlist**: Only sponsor specific vault functions
3. **Rate Limiting**: Configure appropriate rate limits
4. **Spending Caps**: Set daily and per-transaction limits
5. **ReCAPTCHA**: Consider adding ReCAPTCHA for public-facing apps

## Troubleshooting

### Gas Station Not Working
1. Check API key is correctly configured
2. Verify network matches (testnet/mainnet)
3. Check spending limits haven't been exceeded
4. Review function allowlist configuration

### Transaction Fallback
If sponsoring fails, transactions automatically fall back to regular submission. Check console logs for specific error messages.

## Cost Optimization

1. **Selective Sponsoring**: Only sponsor high-value operations
2. **User Tiers**: Implement different sponsorship levels
3. **Time-based Limits**: Set hourly/daily limits per user
4. **Smart Routing**: Use gas station for onboarding, regular transactions for power users

## Next Steps

1. Configure gas station rules on Geomi dashboard
2. Add API key to environment variables
3. Replace `useVault` import with gas-station enabled version
4. Test sponsored transactions on testnet
5. Monitor usage and adjust limits as needed