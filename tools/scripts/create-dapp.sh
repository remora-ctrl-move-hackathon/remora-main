#!/bin/bash

# Create Aptos DApp Script
# Based on create-aptos-dapp tool

echo "======================================="
echo "Create Aptos DApp - Quick Setup"
echo "======================================="
echo ""

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "This script will help you create a new Aptos DApp using create-aptos-dapp"
echo ""

# Get project details
read -p "Enter project name: " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
    PROJECT_NAME="my-aptos-dapp"
fi

echo ""
echo "Select a template:"
echo "1) Boilerplate (Basic template with wallet integration)"
echo "2) NFT Minting DApp"
echo "3) Token Staking DApp"
echo "4) Token Swap DApp"
echo "5) Custom Template"
read -p "Enter your choice (1-5): " TEMPLATE_CHOICE

case $TEMPLATE_CHOICE in
    1)
        TEMPLATE="boilerplate"
        ;;
    2)
        TEMPLATE="nft-minting"
        ;;
    3)
        TEMPLATE="token-staking"
        ;;
    4)
        TEMPLATE="token-swap"
        ;;
    5)
        TEMPLATE=""
        ;;
    *)
        echo "Invalid choice. Using boilerplate template."
        TEMPLATE="boilerplate"
        ;;
esac

echo ""
echo "Select network:"
echo "1) Testnet (recommended for development)"
echo "2) Devnet"
echo "3) Mainnet"
read -p "Enter your choice (1-3): " NETWORK_CHOICE

case $NETWORK_CHOICE in
    1)
        NETWORK="testnet"
        ;;
    2)
        NETWORK="devnet"
        ;;
    3)
        NETWORK="mainnet"
        ;;
    *)
        echo "Invalid choice. Using testnet."
        NETWORK="testnet"
        ;;
esac

echo ""
echo "Creating Aptos DApp..."
echo "Project: $PROJECT_NAME"
echo "Template: ${TEMPLATE:-custom}"
echo "Network: $NETWORK"
echo ""

# Create the project
if [ -z "$TEMPLATE" ]; then
    npx create-aptos-dapp@latest $PROJECT_NAME
else
    npx create-aptos-dapp@latest $PROJECT_NAME --template $TEMPLATE --network $NETWORK
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Project created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. cd $PROJECT_NAME"
    echo "2. npm install"
    echo "3. npm run move:init      # Initialize Move account"
    echo "4. npm run move:compile   # Compile Move contracts"
    echo "5. npm run move:deploy    # Deploy contracts"
    echo "6. npm run dev           # Start development server"
    echo ""
    echo "For more information, visit:"
    echo "https://github.com/aptos-labs/create-aptos-dapp"
else
    echo ""
    echo "❌ Failed to create project. Please check the error messages above."
fi