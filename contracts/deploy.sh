#!/bin/bash

# Vault Contract Deployment Script
# This script deploys the Remora vault contract and initializes it

set -e

echo "🚀 Deploying Remora Vault Contract to Testnet..."

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Error: aptos CLI not found. Please install it first:"
    echo "   curl -fsSL \"https://aptos.dev/scripts/install_cli.py\" | python3"
    exit 1
fi

# Compile contract
echo "📦 Compiling contract..."
cd "$(dirname "$0")"
aptos move compile

# Deploy contract
echo "🔧 Deploying contract..."
DEPLOY_OUTPUT=$(aptos move publish --profile default --assume-yes)

echo "$DEPLOY_OUTPUT"

# Extract package address from output
PACKAGE_ADDR=$(echo "$DEPLOY_OUTPUT" | grep -o '"0x[a-f0-9]\{64\}"' | head -1 | tr -d '"')

if [ -z "$PACKAGE_ADDR" ]; then
    echo "❌ Failed to extract package address"
    exit 1
fi

echo "✅ Contract deployed at: $PACKAGE_ADDR"

# Initialize vault
echo "🔄 Initializing vault..."
aptos move run \
    --function-id "${PACKAGE_ADDR}::vault::initialize" \
    --profile default \
    --assume-yes

echo ""
echo "✅ Vault initialized successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update frontend/src/config/aptos.ts with new address:"
echo "   MODULE_ADDRESS: \"$PACKAGE_ADDR\""
echo ""
echo "2. Update contracts/Move.toml with new address:"
echo "   remora = \"$PACKAGE_ADDR\""
echo ""
