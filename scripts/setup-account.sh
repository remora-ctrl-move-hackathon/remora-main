#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Aptos Account Setup Script${NC}"
echo "====================================="

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo -e "${RED}❌ Aptos CLI not found. Installing...${NC}"
    curl -fsSL https://aptos.dev/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
    source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null
fi

echo -e "${GREEN}✅ Aptos CLI is installed${NC}"
aptos --version

# Function to create new account
create_account() {
    echo -e "\n${YELLOW}Creating new Aptos account...${NC}"
    
    # Initialize aptos config
    aptos init --profile testnet --network testnet
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Account created successfully!${NC}"
        
        # Display account info
        echo -e "\n${BLUE}Account Information:${NC}"
        aptos account list --profile testnet
        
        # Fund the account
        echo -e "\n${YELLOW}Funding account with testnet APT...${NC}"
        aptos account fund-with-faucet --profile testnet --amount 100000000
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Account funded with 1 APT${NC}"
        else
            echo -e "${RED}❌ Failed to fund account. You may need to try again later.${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to create account${NC}"
        exit 1
    fi
}

# Function to import existing account
import_account() {
    echo -e "\n${YELLOW}Importing existing account...${NC}"
    echo "Please enter your private key (it will be hidden):"
    read -s PRIVATE_KEY
    
    # Create config manually
    mkdir -p .aptos
    cat > .aptos/config.yaml <<EOF
---
profiles:
  testnet:
    private_key: "$PRIVATE_KEY"
    public_key: ""
    account: ""
    rest_url: "https://fullnode.testnet.aptoslabs.com"
    faucet_url: "https://faucet.testnet.aptoslabs.com"
EOF
    
    echo -e "\n${GREEN}✅ Account imported${NC}"
    
    # Display account info
    echo -e "\n${BLUE}Account Information:${NC}"
    aptos account list --profile testnet
}

# Function to check balance
check_balance() {
    echo -e "\n${YELLOW}Checking account balance...${NC}"
    aptos account list --profile testnet
}

# Main menu
main() {
    echo -e "\n${BLUE}What would you like to do?${NC}"
    echo "1) Create a new Aptos account"
    echo "2) Import existing account"
    echo "3) Check account balance"
    echo "4) Fund existing account"
    echo "5) Exit"
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            create_account
            ;;
        2)
            import_account
            ;;
        3)
            check_balance
            ;;
        4)
            echo -e "\n${YELLOW}Funding account...${NC}"
            aptos account fund-with-faucet --profile testnet --amount 100000000
            check_balance
            ;;
        5)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            main
            ;;
    esac
    
    # Ask if user wants to continue
    echo -e "\n${YELLOW}Do you want to perform another action? (y/n)${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        main
    else
        echo -e "\n${GREEN}Setup complete!${NC}"
        echo -e "${BLUE}Your account is ready for deployment.${NC}"
        echo -e "${BLUE}Run './scripts/deploy.sh' to deploy the contracts.${NC}"
    fi
}

# Run main function
main