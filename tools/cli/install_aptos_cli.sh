#!/bin/bash

# Aptos CLI Installation Script
# Supports macOS, Linux, and Windows (WSL)

echo "Installing Aptos CLI..."

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Darwin*)
        echo "Detected macOS..."
        if command -v brew &> /dev/null; then
            echo "Installing via Homebrew..."
            brew install aptos
        else
            echo "Installing directly..."
            curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
        fi
        ;;
    Linux*)
        echo "Detected Linux..."
        curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
        ;;
    *)
        echo "Unsupported OS: $OS"
        echo "Please install manually from: https://aptos.dev/tools/aptos-cli/install-cli"
        exit 1
        ;;
esac

# Verify installation
if command -v aptos &> /dev/null; then
    echo "Aptos CLI installed successfully!"
    aptos --version
else
    echo "Installation failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Run 'aptos init' to initialize your account"
echo "2. Run 'aptos account fund-with-faucet' to get testnet tokens"
echo "3. Run 'aptos move compile' in the contracts directory to compile Move modules"