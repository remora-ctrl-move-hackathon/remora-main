#!/bin/bash

# Quick deployment script for testing
# This creates a new account and deploys immediately

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 Remora Quick Deploy (Testnet)${NC}"
echo "====================================="

# Step 1: Create new account
echo -e "\n${YELLOW}Creating new Aptos account...${NC}"
aptos init --profile remora-testnet --network testnet --assume-yes

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create account${NC}"
    exit 1
fi

# Step 2: Get account address
ACCOUNT=$(aptos account list --profile remora-testnet | grep "Account" | awk '{print $2}')
echo -e "${GREEN}✅ Account created: ${ACCOUNT}${NC}"

# Step 3: Fund account
echo -e "\n${YELLOW}Funding account with testnet APT...${NC}"
aptos account fund-with-faucet --profile remora-testnet --account $ACCOUNT --amount 100000000

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to fund account. Trying again...${NC}"
    sleep 2
    aptos account fund-with-faucet --profile remora-testnet --account $ACCOUNT --amount 100000000
fi

# Step 4: Check balance
echo -e "\n${YELLOW}Account balance:${NC}"
aptos account list --profile remora-testnet

# Step 5: Compile contracts
echo -e "\n${YELLOW}Compiling contracts...${NC}"
cd contracts
aptos move compile --skip-fetch-latest-git-deps

if [ $? -ne 0 ]; then
    echo -e "${RED}Compilation failed${NC}"
    exit 1
fi

# Step 6: Deploy contracts
echo -e "\n${YELLOW}Deploying contracts...${NC}"
aptos move publish \
    --profile remora-testnet \
    --assume-yes \
    --skip-fetch-latest-git-deps

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contracts deployed successfully!${NC}"

# Step 7: Initialize modules
echo -e "\n${YELLOW}Initializing modules...${NC}"

# Initialize streaming
aptos move run \
    --function-id ${ACCOUNT}::streaming::initialize \
    --profile remora-testnet \
    --assume-yes

# Initialize vault
aptos move run \
    --function-id ${ACCOUNT}::vault::initialize \
    --profile remora-testnet \
    --assume-yes

# Initialize offramp
aptos move run \
    --function-id ${ACCOUNT}::offramp::initialize \
    --profile remora-testnet \
    --assume-yes

echo -e "${GREEN}✅ Modules initialized!${NC}"

# Step 8: Save deployment info
cd ..
DEPLOYMENT_FILE="deployment-$(date +%Y%m%d-%H%M%S).json"

cat > $DEPLOYMENT_FILE <<EOF
{
  "network": "testnet",
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "module_address": "$ACCOUNT",
  "profile": "remora-testnet",
  "modules": {
    "streaming": {
      "address": "${ACCOUNT}::streaming",
      "initialized": true
    },
    "vault": {
      "address": "${ACCOUNT}::vault",
      "initialized": true
    },
    "offramp": {
      "address": "${ACCOUNT}::offramp",
      "initialized": true
    }
  }
}
EOF

echo -e "\n${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}Module Address: ${ACCOUNT}${NC}"
echo -e "${BLUE}Deployment info saved to: ${DEPLOYMENT_FILE}${NC}"

# Step 9: Update frontend config
echo -e "\n${YELLOW}Updating frontend configuration...${NC}"
if [ -f "frontend/src/config/aptos.ts" ]; then
    sed -i.bak "s|export const MODULE_ADDRESS = .*|export const MODULE_ADDRESS = \"${ACCOUNT}\";|" frontend/src/config/aptos.ts
    echo -e "${GREEN}✅ Frontend config updated!${NC}"
fi

# Create .env.local if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.local.example frontend/.env.local
    sed -i.bak "s|NEXT_PUBLIC_MODULE_ADDRESS=.*|NEXT_PUBLIC_MODULE_ADDRESS=${ACCOUNT}|" frontend/.env.local
    echo -e "${GREEN}✅ Created frontend/.env.local with module address${NC}"
fi

echo -e "\n${GREEN}📋 Next Steps:${NC}"
echo "1. cd frontend && npm run dev"
echo "2. Connect your wallet and test the features"
echo "3. View on explorer: https://explorer.aptoslabs.com/account/${ACCOUNT}?network=testnet"
echo ""
echo -e "${YELLOW}Account credentials saved in: .aptos/config.yaml${NC}"
echo -e "${YELLOW}Profile name: remora-testnet${NC}"