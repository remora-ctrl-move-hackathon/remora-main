# Aptos Integration Guide for Remora

## Overview

This guide covers the integration of Aptos blockchain features into the Remora DeFi Super App.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Wallet Integration](#wallet-integration)
3. [Smart Contract Interaction](#smart-contract-interaction)
4. [Transaction Management](#transaction-management)
5. [Best Practices](#best-practices)

## Environment Setup

### Prerequisites
- Node.js 16+
- Python 3.6+
- Git
- Aptos CLI

### Installation Steps

1. **Install Aptos CLI**
```bash
cd tools/cli
./install_aptos_cli.sh
```

2. **Initialize Account**
```bash
aptos init --network testnet
```

3. **Fund Account (Testnet)**
```bash
aptos account fund-with-faucet --account default --amount 100000000
```

## Wallet Integration

### Supported Wallets
- Petra Wallet
- Martian Wallet
- Pontem Wallet
- Rise Wallet
- MSafe
- Trust Wallet
- OKX Wallet

### Implementation Example

```typescript
import { WalletProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from '@petra/wallet-adapter-plugin';
import { MartianWallet } from '@martian/wallet-adapter-plugin';

const wallets = [
  new PetraWallet(),
  new MartianWallet(),
  // Add more wallets as needed
];

function App() {
  return (
    <WalletProvider wallets={wallets}>
      {/* Your app components */}
    </WalletProvider>
  );
}
```

## Smart Contract Interaction

### Key Modules

1. **Stream Module** - Payment streaming functionality
2. **Vault Module** - Copy-trading vaults
3. **Remittance Module** - Cross-border payments

### Calling Move Functions

```typescript
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Example: Create a payment stream
async function createStream(
  recipient: string,
  amount: number,
  duration: number
) {
  const transaction = await aptos.transaction.build.simple({
    sender: account.address,
    data: {
      function: `${MODULE_ADDRESS}::stream::create_stream`,
      functionArguments: [recipient, amount, duration],
    },
  });

  const response = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction,
  });

  return response;
}
```

## Transaction Management

### Submitting Transactions

```typescript
// Single signer transaction
const response = await aptos.signAndSubmitTransaction({
  signer: account,
  transaction: transaction,
});

// Wait for confirmation
await aptos.waitForTransaction({ 
  transactionHash: response.hash 
});
```

### Reading State

```typescript
// View function call (no gas required)
const [balance] = await aptos.view({
  function: `${MODULE_ADDRESS}::vault::get_balance`,
  functionArguments: [account.address],
});
```

### Event Listening

```typescript
// Subscribe to events
const events = await aptos.getEvents({
  moduleAddress: MODULE_ADDRESS,
  moduleName: "stream",
  eventType: "StreamCreated",
});
```

## Best Practices

### 1. Gas Estimation
Always estimate gas before submitting transactions:
```typescript
const simulation = await aptos.simulateTransaction({
  signerPublicKey: account.publicKey,
  transaction,
});
```

### 2. Error Handling
```typescript
try {
  const response = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction,
  });
} catch (error) {
  if (error.status === 400) {
    // Handle validation errors
  } else if (error.status === 500) {
    // Handle server errors
  }
}
```

### 3. Network Selection
```typescript
const getNetwork = () => {
  switch (process.env.NEXT_PUBLIC_NETWORK) {
    case 'mainnet':
      return Network.MAINNET;
    case 'testnet':
      return Network.TESTNET;
    default:
      return Network.DEVNET;
  }
};
```

### 4. Security Considerations
- Never expose private keys in frontend code
- Validate all user inputs before blockchain interaction
- Use proper access control in Move modules
- Implement rate limiting for faucet requests
- Audit smart contracts before mainnet deployment

## Useful Resources

### Official Documentation
- [Aptos Developer Docs](https://aptos.dev/)
- [Move Language Book](https://move-language.github.io/move/)
- [Aptos TypeScript SDK](https://github.com/aptos-labs/aptos-ts-sdk)

### Community Resources
- [Aptos Discord](https://discord.gg/aptoslabs)
- [Aptos Forum](https://forum.aptoslabs.com/)
- [Aptos GitHub](https://github.com/aptos-labs)

### Learning Platforms
- [Aptos Learn](https://learn.aptoslabs.com/)
- [Move Tutorials](https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/move-examples)

## Testing

### Local Testing
```bash
# Run Move tests
aptos move test

# Test with coverage
aptos move test --coverage

# Test specific module
aptos move test --filter stream
```

### Testnet Testing
1. Deploy to testnet
2. Get testnet APT from faucet
3. Test all features
4. Monitor transactions on explorer

### Explorer URLs
- Mainnet: https://explorer.aptoslabs.com/
- Testnet: https://explorer.aptoslabs.com/?network=testnet
- Devnet: https://explorer.aptoslabs.com/?network=devnet