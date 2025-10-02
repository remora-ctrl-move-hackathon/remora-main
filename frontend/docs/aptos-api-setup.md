# Aptos API Key Setup Guide

## Why You Need an API Key

Without an API key, your app is limited to:
- **30,000 compute units per 300 seconds** (shared across all users from the same IP)
- This limit is quickly exhausted with multiple view function calls
- Results in `429 Rate Limit Exceeded` errors

With an API key:
- **Much higher rate limits** for your application
- Better performance and reliability
- No sharing limits with other applications

## How to Get an Aptos API Key

### Option 1: Aptos Labs Developer Portal (Recommended)
1. Visit [Aptos Developer Portal](https://developers.aptoslabs.com/)
2. Sign up for a developer account
3. Navigate to API Keys section
4. Create a new API key for your project
5. Copy the API key

### Option 2: Use a Node Provider
Several providers offer Aptos node access with API keys:
- [NodeReal](https://nodereal.io/)
- [BlockPI](https://blockpi.io/)
- [Ankr](https://www.ankr.com/)

## Configure Your Environment

Add the API key to your `.env.local` file:
```bash
NEXT_PUBLIC_APTOS_API_KEY=your_api_key_here
```

## How It Works

The app now includes:

### 1. **API Caching**
- Responses are cached for 30 seconds
- Reduces repeated calls for the same data
- Automatic cache invalidation

### 2. **Rate Limit Tracking**
- Monitors API call frequency
- Prevents hitting rate limits
- Provides fallback values when limits approach

### 3. **Automatic Retry with Backoff**
- Retries failed requests with exponential backoff
- Handles temporary network issues
- Graceful degradation for rate limits

### 4. **Fallback Values**
- Returns sensible defaults when API is unavailable
- Prevents app crashes from API errors
- Maintains user experience during outages

## Implementation Details

### Cache Layer (`src/lib/api-cache.ts`)
```typescript
// Caches API responses for 30 seconds
apiCache.get(key) // Returns cached data if available
apiCache.set(key, data, ttl) // Store data with TTL
```

### Rate Limit Tracking
```typescript
// Tracks API calls per minute
rateLimitTracker.canMakeCall('view') // Check if under limit
rateLimitTracker.trackCall('view') // Record a call
```

### Retry Logic
```typescript
// Automatic retry with exponential backoff
withRetry(async () => {
  // API call here
}, maxRetries, baseDelay)
```

## Default Values

When rate limited, the app returns:
- Empty arrays for list functions (`get_user_vaults`, etc.)
- "0" for balance/amount functions
- `null` for info functions
- `false` for status functions

## Monitoring

Check your rate limit usage:
1. Open browser console
2. Look for warnings: "Rate limit approaching..."
3. Monitor remaining calls in the rate limit tracker

## Best Practices

1. **Use API keys in production** - Essential for scalability
2. **Implement caching** - Reduce unnecessary API calls
3. **Batch operations** - Combine multiple calls when possible
4. **Handle errors gracefully** - Always provide fallback behavior
5. **Monitor usage** - Track your API consumption

## Troubleshooting

### Still Getting Rate Limit Errors?
- Verify API key is correctly set in `.env.local`
- Restart the development server after adding the key
- Check if the key has proper permissions
- Consider upgrading to a higher tier if needed

### Cache Not Working?
- Clear browser cache and localStorage
- Check cache TTL settings
- Verify cache key generation

### API Key Not Being Sent?
- Check environment variable is loaded
- Verify the key format (no extra spaces)
- Ensure proper authorization header format

## Support

For issues with:
- **Aptos API Keys**: Contact Aptos Labs support
- **Rate Limiting**: Check our caching implementation
- **Integration Issues**: Open a GitHub issue