#!/bin/bash

# Aptos Smart Contract Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo "======================================"
echo "Aptos Smart Contract Deployment Script"
echo "======================================"
echo ""

# Check if in contracts directory
CONTRACTS_DIR="../../contracts"
if [ ! -d "$CONTRACTS_DIR" ]; then
    print_error "Contracts directory not found. Please run from tools/scripts directory."
    exit 1
fi

cd $CONTRACTS_DIR

# Check for Move.toml
if [ ! -f "Move.toml" ]; then
    print_error "Move.toml not found in contracts directory."
    exit 1
fi

# Select network
echo "Select deployment network:"
echo "1) Testnet (recommended for testing)"
echo "2) Devnet (for development)"
echo "3) Mainnet (production - requires real APT)"
read -p "Enter your choice (1-3): " network_choice

case $network_choice in
    1)
        NETWORK="testnet"
        ;;
    2)
        NETWORK="devnet"
        ;;
    3)
        NETWORK="mainnet"
        echo -e "${YELLOW}Warning: Mainnet deployment requires real APT tokens!${NC}"
        read -p "Are you sure you want to deploy to mainnet? (y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo "Deployment cancelled."
            exit 0
        fi
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

print_info "Selected network: $NETWORK"
echo ""

# Compile contracts
echo "Compiling Move modules..."
aptos move compile --named-addresses remora=default

if [ $? -eq 0 ]; then
    print_status "Compilation successful!"
else
    print_error "Compilation failed. Please fix errors and try again."
    exit 1
fi

echo ""

# Run tests
echo "Running Move tests..."
aptos move test

if [ $? -eq 0 ]; then
    print_status "All tests passed!"
else
    print_error "Tests failed. Please fix the failing tests."
    exit 1
fi

echo ""

# Deploy
echo "Deploying to $NETWORK..."
read -p "Proceed with deployment? (y/N): " deploy_confirm

if [ "$deploy_confirm" == "y" ] || [ "$deploy_confirm" == "Y" ]; then
    aptos move publish \
        --named-addresses remora=default \
        --assume-yes \
        --network $NETWORK
    
    if [ $? -eq 0 ]; then
        print_status "Deployment successful!"
        echo ""
        echo "Contract deployed to $NETWORK"
        echo "Check your account for the transaction details:"
        echo "aptos account list --network $NETWORK"
    else
        print_error "Deployment failed. Please check the error messages."
        exit 1
    fi
else
    echo "Deployment cancelled."
fi