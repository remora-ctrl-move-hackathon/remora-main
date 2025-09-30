# Aptos Development Tools

This directory contains all the essential tools and resources for developing on the Aptos blockchain.

## Directory Structure

```
tools/
├── cli/          # Aptos CLI tools and binaries
├── sdk/          # Aptos SDK and TypeScript/JavaScript libraries
├── move/         # Move language tools and packages
├── scripts/      # Setup and utility scripts
└── docs/         # Documentation and guides
```

## Quick Start

### 1. Install Aptos CLI
```bash
cd cli
./install_aptos_cli.sh
```

### 2. Install Node Dependencies
```bash
cd ../sdk
npm install
```

### 3. Initialize Aptos Account
```bash
aptos init
```

## Resources

- [Aptos Developer Documentation](https://aptos.dev/)
- [Aptos Learn Platform](https://learn.aptoslabs.com/en)
- [Create Aptos Dapp](https://github.com/aptos-labs/create-aptos-dapp/)
- [Aptos Build MCP](https://aptoslabs.notion.site/Welcome-to-Aptos-Build-MCP-23b8b846eb728009ad99e8106f35700b)

## Essential Tools Included

### CLI Tools
- Aptos CLI for blockchain interaction
- Move compiler and package manager
- Account management tools
- Faucet integration

### SDKs & Libraries
- Aptos TypeScript SDK
- Aptos Wallet Adapter
- Move.js for smart contract interaction
- Aptos Framework

### Development Tools
- Move Prover
- Move Formatter
- Testing frameworks
- Debugging tools

### Templates & Boilerplates
- DApp templates
- Smart contract examples
- Integration patterns
- Best practices

## Network Information

### Mainnet
- REST API: https://fullnode.mainnet.aptoslabs.com/v1
- Indexer API: https://indexer.mainnet.aptoslabs.com/v1/graphql
- Faucet: N/A (Mainnet requires real APT)

### Testnet
- REST API: https://fullnode.testnet.aptoslabs.com/v1
- Indexer API: https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql
- Faucet: https://faucet.testnet.aptoslabs.com

### Devnet
- REST API: https://fullnode.devnet.aptoslabs.com/v1
- Indexer API: https://indexer-devnet.staging.gcp.aptosdev.com/v1/graphql
- Faucet: https://faucet.devnet.aptoslabs.com