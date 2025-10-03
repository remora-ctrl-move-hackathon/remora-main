# Vault Initialization Guide

The vault contract has been deployed but needs to be initialized by the original deployer.

## Contract Address
```
0xf8a774edce1e7d3bb1c9caf366d17e5bd7800f0def09c179f3d4e5cebfa6048a
```

## Method 1: Using TypeScript Script (Recommended)

We already have an initialization script ready. Just run:

```bash
cd frontend
DEPLOYER_PRIVATE_KEY=0x... npm run initialize-vault
```

Replace `0x...` with the private key of the account that deployed the contract.

### What the script does:
- Checks if vault is already initialized
- Calls `vault::initialize()` function
- Creates the VaultStore resource at the contract address
- Verifies successful initialization

## Method 2: Using Aptos CLI

If you prefer using the CLI:

```bash
aptos move run \
  --function-id 0xf8a774edce1e7d3bb1c9caf366d17e5bd7800f0def09c179f3d4e5cebfa6048a::vault::initialize \
  --profile <your-profile-name> \
  --assume-yes
```

Or if you have a default profile configured:

```bash
aptos move run \
  --function-id 0xf8a774edce1e7d3bb1c9caf366d17e5bd7800f0def09c179f3d4e5cebfa6048a::vault::initialize \
  --assume-yes
```

## After Initialization

Once initialized:
1. You'll see a success message with a transaction hash
2. The VaultStore resource will be created at the contract address
3. Users can immediately start:
   - Creating vaults
   - Depositing funds
   - Executing trades
   - Withdrawing from vaults

## Verification

To verify the vault was initialized successfully, check for the VaultStore resource:

```bash
aptos account list --account 0xf8a774edce1e7d3bb1c9caf366d17e5bd7800f0def09c179f3d4e5cebfa6048a
```

You should see `VaultStore` in the resources list.

## Troubleshooting

### Error: E_NOT_INITIALIZED
This means the initialization hasn't been run yet. Follow the steps above.

### Error: Permission Denied
Only the account that deployed the contract can initialize it. Make sure you're using the correct deployer account.

### Error: Already Initialized
The vault is already initialized! You're good to go.

## Questions?

If you encounter any issues, check the transaction on the Aptos Explorer:
https://explorer.aptoslabs.com/?network=testnet
