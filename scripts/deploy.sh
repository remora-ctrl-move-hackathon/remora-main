#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Remora Smart Contract Deployment Script${NC}"
echo "================================================"

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo -e "${RED}❌ Aptos CLI not found. Please install it first.${NC}"
    echo "Run: curl -fsSL https://aptos.dev/install.sh | sh"
    exit 1
fi

# Configuration
NETWORK="testnet"
CONTRACTS_DIR="contracts"

echo -e "\n${YELLOW}📋 Pre-deployment checklist:${NC}"
echo "1. Make sure you have an Aptos account with testnet funds"
echo "2. Update .aptos/config.yaml with your account details"
echo "3. Ensure all contracts compile successfully"
echo ""

read -p "Have you completed the checklist? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Please complete the checklist first.${NC}"
    exit 1
fi

# Function to check account balance
check_balance() {
    echo -e "\n${YELLOW}💰 Checking account balance...${NC}"
    aptos account list --profile $NETWORK
}

# Function to compile contracts
compile_contracts() {
    echo -e "\n${YELLOW}🔨 Compiling contracts...${NC}"
    cd $CONTRACTS_DIR
    aptos move compile --skip-fetch-latest-git-deps
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Compilation failed. Please fix errors and try again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Contracts compiled successfully!${NC}"
    cd ..
}

# Function to run tests
run_tests() {
    echo -e "\n${YELLOW}🧪 Running contract tests...${NC}"
    cd $CONTRACTS_DIR
    aptos move test --skip-fetch-latest-git-deps
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ Some tests failed. Continue anyway? (y/n)${NC}"
        read -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✅ All tests passed!${NC}"
    fi
    cd ..
}

# Function to deploy contracts
deploy_contracts() {
    echo -e "\n${YELLOW}🚀 Deploying contracts to $NETWORK...${NC}"
    cd $CONTRACTS_DIR
    
    # Deploy the package
    aptos move publish \
        --profile $NETWORK \
        --assume-yes \
        --skip-fetch-latest-git-deps
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Deployment failed. Please check errors above.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Contracts deployed successfully!${NC}"
    cd ..
}

# Function to initialize modules
initialize_modules() {
    echo -e "\n${YELLOW}🔧 Initializing modules...${NC}"
    
    # Get the deployed address
    echo "Please enter the deployed module address (e.g., 0x...):"
    read MODULE_ADDRESS
    
    # Initialize streaming module
    echo -e "${YELLOW}Initializing streaming module...${NC}"
    aptos move run \
        --function-id ${MODULE_ADDRESS}::streaming::initialize \
        --profile $NETWORK \
        --assume-yes
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Streaming module initialized${NC}"
    else
        echo -e "${YELLOW}⚠️ Streaming module may already be initialized${NC}"
    fi
    
    # Initialize vault module
    echo -e "${YELLOW}Initializing vault module...${NC}"
    aptos move run \
        --function-id ${MODULE_ADDRESS}::vault::initialize \
        --profile $NETWORK \
        --assume-yes
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Vault module initialized${NC}"
    else
        echo -e "${YELLOW}⚠️ Vault module may already be initialized${NC}"
    fi
    
    # Initialize offramp module
    echo -e "${YELLOW}Initializing offramp module...${NC}"
    aptos move run \
        --function-id ${MODULE_ADDRESS}::offramp::initialize \
        --profile $NETWORK \
        --assume-yes
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Offramp module initialized${NC}"
    else
        echo -e "${YELLOW}⚠️ Offramp module may already be initialized${NC}"
    fi
}

# Function to save deployment info
save_deployment_info() {
    echo -e "\n${YELLOW}💾 Saving deployment information...${NC}"
    
    DEPLOYMENT_FILE="deployment-$(date +%Y%m%d-%H%M%S).json"
    
    cat > $DEPLOYMENT_FILE <<EOF
{
  "network": "$NETWORK",
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "module_address": "$MODULE_ADDRESS",
  "modules": {
    "streaming": {
      "address": "${MODULE_ADDRESS}::streaming",
      "initialized": true
    },
    "vault": {
      "address": "${MODULE_ADDRESS}::vault",
      "initialized": true
    },
    "offramp": {
      "address": "${MODULE_ADDRESS}::offramp",
      "initialized": true
    }
  }
}
EOF
    
    echo -e "${GREEN}✅ Deployment info saved to $DEPLOYMENT_FILE${NC}"
    echo -e "\n${GREEN}📝 Next steps:${NC}"
    echo "1. Update frontend/src/config/aptos.ts with MODULE_ADDRESS: $MODULE_ADDRESS"
    echo "2. Test the integration with: npm run dev"
    echo "3. Verify contracts on explorer: https://explorer.aptoslabs.com/account/${MODULE_ADDRESS}?network=testnet"
}

# Main execution flow
main() {
    echo -e "\n${GREEN}Starting deployment process...${NC}\n"
    
    # Step 1: Check balance
    check_balance
    
    # Step 2: Compile contracts
    compile_contracts
    
    # Step 3: Run tests (optional)
    echo -e "\n${YELLOW}Run tests before deployment? (y/n):${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    fi
    
    # Step 4: Deploy contracts
    deploy_contracts
    
    # Step 5: Initialize modules
    echo -e "\n${YELLOW}Initialize modules now? (y/n):${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        initialize_modules
        save_deployment_info
    fi
    
    echo -e "\n${GREEN}🎉 Deployment process completed!${NC}"
}

# Run the main function
main