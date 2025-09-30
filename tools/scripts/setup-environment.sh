#!/bin/bash

# Aptos Development Environment Setup Script

set -e

echo "==================================="
echo "Aptos Development Environment Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Python3
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python3 installed: $PYTHON_VERSION"
else
    print_error "Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_status "Git installed: $GIT_VERSION"
else
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

echo ""
echo "Installing Aptos CLI..."
cd ../cli
./install_aptos_cli.sh

echo ""
echo "Installing SDK dependencies..."
cd ../sdk
npm install

echo ""
echo "Setting up Move environment..."
cd ../move

# Check if aptos CLI is installed
if command -v aptos &> /dev/null; then
    print_status "Aptos CLI is ready"
    
    echo ""
    echo "Initializing Aptos account (if not already done)..."
    if [ ! -f "$HOME/.aptos/config.yaml" ]; then
        aptos init --network testnet
    else
        print_status "Aptos account already configured"
    fi
else
    print_warning "Aptos CLI not found. Please run the CLI installation script."
fi

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Run 'aptos account fund-with-faucet' to get testnet tokens"
echo "2. Navigate to the contracts folder to compile Move modules"
echo "3. Check the docs folder for additional guides and resources"
echo ""
echo "Useful commands:"
echo "- aptos account list         # View your account"
echo "- aptos move compile         # Compile Move modules"
echo "- aptos move test           # Run Move tests"
echo "- aptos move publish        # Deploy contracts"