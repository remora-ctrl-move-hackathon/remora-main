# 🚀 Remora Smart Contract Deployment Guide

This guide will walk you through deploying the Remora smart contracts to Aptos Testnet and integrating them with the frontend.

## 📋 Prerequisites

1. **Aptos CLI**: Install the Aptos CLI
   ```bash
   curl -fsSL https://aptos.dev/install.sh | sh
   ```

2. **Node.js & npm**: Required for the frontend (already installed if you can run the frontend)

3. **Testnet APT**: You'll need testnet APT for gas fees

## 🔧 Setup Steps

### Step 1: Account Setup

First, set up your Aptos account for deployment:

```bash
# Run the account setup script
./scripts/setup-account.sh
```

This script will help you:
- Create a new Aptos account OR import an existing one
- Fund your account with testnet APT
- Check your balance

**Save your account information securely!**

### Step 2: Compile Contracts

Before deployment, ensure all contracts compile successfully:

```bash
cd contracts
aptos move compile --skip-fetch-latest-git-deps
```

Fix any compilation errors before proceeding.

### Step 3: Run Tests (Optional but Recommended)

Test the contracts locally:

```bash
cd contracts
aptos move test --skip-fetch-latest-git-deps
```

All tests should pass before deployment.

### Step 4: Deploy Contracts

Run the deployment script:

```bash
./scripts/deploy.sh
```

The script will:
1. Check your account balance
2. Compile the contracts
3. Optionally run tests
4. Deploy to Aptos Testnet
5. Initialize all modules
6. Save deployment information

**Important**: Note down the MODULE_ADDRESS shown after deployment!

### Step 5: Verify Deployment

After deployment, verify everything is working:

```bash
# If you have ts-node installed
npx ts-node scripts/test-deployment.ts

# Or manually check on explorer
# https://explorer.aptoslabs.com/account/YOUR_MODULE_ADDRESS?network=testnet
```

### Step 6: Update Frontend Configuration

Update the MODULE_ADDRESS in your frontend:

1. Open `frontend/src/config/aptos.ts`
2. Replace the MODULE_ADDRESS with your deployed address:
   ```typescript
   export const MODULE_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS_HERE";
   ```

### Step 7: Test Frontend Integration

Start the frontend and test the integration:

```bash
cd frontend
npm run dev
```

Connect your wallet and test the features:
- Create a payment stream
- Create a trading vault
- Submit KYC for off-ramp

## 📝 Contract Addresses

After deployment, your contracts will be available at:

- **Streaming**: `MODULE_ADDRESS::streaming`
- **Vault**: `MODULE_ADDRESS::vault`
- **OffRamp**: `MODULE_ADDRESS::offramp`

## 🧪 Testing the Integration

### Test Streaming Module

```typescript
// Example: Create a stream
const { createStream } = useStreaming();

await createStream({
  receiver: "0xRECEIVER_ADDRESS",
  totalAmount: 10, // 10 APT
  durationSeconds: 86400, // 1 day
  streamName: "Test Stream"
});
```

### Test Vault Module

```typescript
// Example: Create a vault
const { createVault } = useVault();

await createVault({
  name: "Alpha Strategy",
  description: "High-yield trading vault",
  strategy: "Momentum trading",
  performanceFee: 20, // 20%
  managementFee: 2, // 2%
  minInvestment: 10, // 10 APT
  maxInvestors: 100
});
```

### Test Off-Ramp Module

```typescript
// Example: Submit KYC
const { submitKYC } = useOffRamp();

await submitKYC({
  fullName: "John Doe",
  email: "john@example.com",
  phoneNumber: "+1234567890",
  country: "Nigeria"
});
```

## 🔍 Troubleshooting

### Common Issues

1. **"Module not found" error**
   - Ensure the contracts are deployed successfully
   - Verify the MODULE_ADDRESS is correct in the frontend config

2. **"Not initialized" error**
   - Run the initialization functions for each module
   - Check that you're using the admin account for initialization

3. **"Insufficient balance" error**
   - Fund your account with more testnet APT
   - Use the faucet: `aptos account fund-with-faucet --profile testnet`

4. **Transaction failures**
   - Check gas limits
   - Ensure correct function arguments
   - Verify account has sufficient APT

### Getting Help

- Check transaction details on [Aptos Explorer](https://explorer.aptoslabs.com/?network=testnet)
- Review contract logs in the terminal
- Check browser console for frontend errors

## 📊 Monitoring

After deployment, monitor your contracts:

1. **Explorer**: View all transactions and contract state
   ```
   https://explorer.aptoslabs.com/account/MODULE_ADDRESS?network=testnet
   ```

2. **Frontend Dashboard**: Use the Analytics page to view:
   - Total Value Locked (TVL)
   - Active streams
   - Vault performance
   - Off-ramp requests

## 🔐 Security Considerations

1. **Private Keys**: Never commit private keys to git
2. **Admin Account**: Keep the admin account secure
3. **Testnet Only**: These contracts are for testnet only
4. **Audit**: Get a professional audit before mainnet deployment

## 📚 Additional Resources

- [Aptos Developer Docs](https://aptos.dev)
- [Move Language Book](https://move-book.com)
- [Aptos Explorer](https://explorer.aptoslabs.com)
- [Aptos Discord](https://discord.gg/aptos)

## ✅ Deployment Checklist

- [ ] Aptos CLI installed
- [ ] Account created and funded
- [ ] Contracts compiled successfully
- [ ] Tests passing
- [ ] Contracts deployed to testnet
- [ ] Modules initialized
- [ ] Frontend config updated
- [ ] Integration tested
- [ ] Explorer verification complete

## 🎉 Next Steps

Once deployed and tested:

1. **Create demo data**: Set up some example streams and vaults
2. **Test all features**: Go through the complete user flow
3. **Document issues**: Keep track of any bugs or improvements
4. **Optimize gas**: Monitor and optimize transaction costs
5. **Prepare for mainnet**: Plan security audit and mainnet deployment

---

**Need help?** Check the error logs, explorer, or reach out to the Aptos community!