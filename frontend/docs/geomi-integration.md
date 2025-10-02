# Geomi Platform Integration Documentation

## Overview

Geomi (거미, meaning "spider" in Korean) is a comprehensive blockchain development platform specifically designed for the Aptos ecosystem. Remora Finance leverages Geomi's infrastructure to provide enhanced API access, gas sponsorship, and improved rate limits.

## What is Geomi?

Geomi is an infrastructure platform that provides:
- **API Key Management**: Generate and manage API keys for Aptos services
- **Gas Station**: Sponsor user transactions (similar to our sponsored transactions)
- **No-Code Indexing**: Build custom data indexers without infrastructure management
- **NFT Studio**: Launch and analyze NFT collections
- **Keyless Onboarding**: Simplified user onboarding experience

## How Remora Uses Geomi

### 1. API Infrastructure

Our application uses Geomi-compatible API endpoints through the Aptos Labs infrastructure:

```typescript
// Configuration in src/config/aptos.ts
const config = new AptosConfig({
  network: getNetwork(),
  clientConfig: {
    API_KEY: process.env.NEXT_PUBLIC_APTOS_API_KEY,
    SPONSOR_KEY: process.env.NEXT_PUBLIC_APTOS_SPONSOR_KEY,
  },
});
```

### 2. Gas Station (Sponsored Transactions)

We implement sponsored transactions similar to Geomi's Gas Station:
- Users don't need to hold APT for gas fees
- Platform covers transaction costs
- Enhanced user experience with gasless transactions

### 3. Rate Limit Management

Using Geomi-compatible API keys provides:
- **Anonymous Access**: Low rate limits without authentication
- **Authenticated Access**: Higher rate limits with API keys
- **Premium Access**: Unlimited access with proper credentials

## API Key Configuration

### Environment Variables

```env
# General API Key (from Geomi/Aptos Labs)
NEXT_PUBLIC_APTOS_API_KEY=aptoslabs_VYUHRKuB2DD_LNkqP7j4L46CPJjh2hFiwAmTNNTefR2ni

# Sponsor Key for Gas Station
NEXT_PUBLIC_APTOS_SPONSOR_KEY=aptoslabs_Wyd5yg5GABP_MPt1Df2DWxmf6JsFHfQDZH4skGVWBjJG4

# Optional: Custom Aptos Node URL (Geomi or Aptos Labs endpoint)
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
```

### Headers Configuration

All API requests include proper authentication headers:

```typescript
headers: {
  "Authorization": `Bearer ${API_KEY}`,
  "X-Aptos-Key": API_KEY,
  "X-Aptos-Sponsor-Key": SPONSOR_KEY,
}
```

## Features Comparison

| Feature | Geomi Platform | Remora Implementation | Status |
|---------|---------------|----------------------|---------|
| API Keys | ✅ Dashboard Management | ✅ Environment Variables | Integrated |
| Gas Station | ✅ No-code Setup | ✅ Custom Implementation | Integrated |
| Rate Limiting | ✅ Automatic | ✅ With Caching & Retry | Integrated |
| Indexing | ✅ No-code Builder | ❌ Not Used | Not Needed |
| NFT Studio | ✅ Available | ❌ Not Used | Not Needed |

## Benefits of Geomi Integration

### For Users
- 🚀 **Faster Transactions**: Optimized API endpoints
- 💰 **Gas-Free Experience**: Sponsored transactions
- ⚡ **Better Performance**: Higher rate limits
- 🔒 **Enhanced Security**: Proper API authentication

### For Developers
- 📊 **Better Monitoring**: Track API usage
- 🛠️ **Simplified Infrastructure**: No node management
- 📈 **Scalability**: Automatic rate limit scaling
- 🔧 **Easy Configuration**: Simple API key setup

## Getting Started with Geomi

### Step 1: Create Account
1. Visit [geomi.dev](https://geomi.dev)
2. Sign up for an account
3. You'll automatically receive a personal organization

### Step 2: Generate API Keys
1. Navigate to API Resources
2. Create a new API resource
3. Configure rate limits and permissions
4. Copy your API keys

### Step 3: Configure Application
1. Add API keys to `.env.local`
2. Restart the application
3. Monitor usage in Geomi dashboard

## Rate Limits

### Without API Key (Anonymous)
- **Requests**: 5 per minute
- **Data**: Limited response size
- **Features**: Basic functionality only

### With API Key (Authenticated)
- **Requests**: 100+ per minute
- **Data**: Full response data
- **Features**: All features available

### With Premium (Enterprise)
- **Requests**: Unlimited
- **Data**: Full response data
- **Features**: Priority support

## Monitoring & Analytics

Track your Geomi usage:
1. API call volume
2. Gas sponsorship costs
3. Rate limit consumption
4. Error rates

## Best Practices

### 1. API Key Security
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor for unauthorized usage

### 2. Rate Limit Management
- Implement caching for repeated calls
- Use exponential backoff for retries
- Monitor rate limit headers
- Batch operations when possible

### 3. Gas Station Optimization
- Set daily limits per user
- Monitor sponsorship costs
- Implement fallback to user payment
- Track conversion metrics

## Troubleshooting

### Common Issues

#### Rate Limit Errors (429)
```typescript
// Solution: Implement caching
const cachedResult = apiCache.get(cacheKey);
if (cachedResult) return cachedResult;
```

#### API Key Not Working
- Verify key format: `aptoslabs_XXXXX`
- Check network configuration (testnet/mainnet)
- Ensure proper header format

#### Sponsored Transactions Failing
- Check sponsor key balance
- Verify transaction eligibility
- Monitor daily limits

## Migration Guide

### From Direct Aptos to Geomi
1. **Get Geomi Account**: Sign up at geomi.dev
2. **Generate Keys**: Create API resources
3. **Update Config**: Add keys to environment
4. **Test Integration**: Verify functionality
5. **Monitor Usage**: Track in dashboard

## Future Enhancements

### Planned Integrations
- 📊 **Custom Indexers**: Build specific data APIs
- 🎨 **NFT Collections**: Launch Remora NFTs
- 🔐 **Keyless Auth**: Simplified onboarding
- 📈 **Analytics Dashboard**: Enhanced monitoring

## Support & Resources

### Documentation
- [Geomi Docs](https://geomi.dev/docs)
- [Aptos Documentation](https://aptos.dev)
- [API Reference](https://aptos.dev/apis)

### Community
- [Aptos Discord](https://discord.gg/aptos)
- [GitHub Issues](https://github.com/aptos-labs/aptos-core/issues)

### Contact
- **Geomi Support**: support@geomi.dev
- **Remora Team**: team@remora.finance

## Conclusion

Geomi integration provides Remora Finance with robust infrastructure for Aptos development, eliminating the need for complex backend management while providing users with a seamless, gas-free experience. The platform's API management and Gas Station features align perfectly with our goal of making DeFi accessible to everyone.