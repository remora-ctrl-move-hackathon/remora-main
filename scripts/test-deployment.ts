#!/usr/bin/env ts-node

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import * as fs from "fs";
import * as path from "path";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

// Read deployment info
function getDeploymentInfo() {
  const deploymentFiles = fs.readdirSync(".")
    .filter(file => file.startsWith("deployment-") && file.endsWith(".json"))
    .sort()
    .reverse();

  if (deploymentFiles.length === 0) {
    console.error(`${colors.red}❌ No deployment file found. Run deploy.sh first.${colors.reset}`);
    process.exit(1);
  }

  const latestDeployment = deploymentFiles[0];
  console.log(`${colors.blue}📄 Using deployment file: ${latestDeployment}${colors.reset}`);
  
  return JSON.parse(fs.readFileSync(latestDeployment, "utf-8"));
}

async function main() {
  console.log(`${colors.green}🧪 Remora Contract Deployment Test${colors.reset}`);
  console.log("=====================================\n");

  // Get deployment info
  const deployment = getDeploymentInfo();
  const MODULE_ADDRESS = deployment.module_address;
  
  console.log(`${colors.blue}Module Address: ${MODULE_ADDRESS}${colors.reset}`);
  console.log(`${colors.blue}Network: ${deployment.network}${colors.reset}\n`);

  // Initialize Aptos client
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // Test functions
  const tests = [
    {
      name: "Check Streaming Module",
      test: async () => {
        try {
          const resource = await aptos.getAccountResource({
            accountAddress: MODULE_ADDRESS,
            resourceType: `${MODULE_ADDRESS}::streaming::StreamStore`,
          });
          console.log(`${colors.green}✅ Streaming module initialized${colors.reset}`);
          console.log(`   Total streams: ${resource.total_streams_created}`);
          console.log(`   Total locked: ${resource.total_value_streamed}`);
          return true;
        } catch (error: any) {
          if (error.status === 404) {
            console.log(`${colors.yellow}⚠️  Streaming module not initialized${colors.reset}`);
            return false;
          }
          throw error;
        }
      },
    },
    {
      name: "Check Vault Module",
      test: async () => {
        try {
          const resource = await aptos.getAccountResource({
            accountAddress: MODULE_ADDRESS,
            resourceType: `${MODULE_ADDRESS}::vault::VaultStore`,
          });
          console.log(`${colors.green}✅ Vault module initialized${colors.reset}`);
          console.log(`   Total vaults: ${resource.total_vaults_created}`);
          console.log(`   TVL: ${resource.total_value_locked}`);
          return true;
        } catch (error: any) {
          if (error.status === 404) {
            console.log(`${colors.yellow}⚠️  Vault module not initialized${colors.reset}`);
            return false;
          }
          throw error;
        }
      },
    },
    {
      name: "Check OffRamp Module",
      test: async () => {
        try {
          const resource = await aptos.getAccountResource({
            accountAddress: MODULE_ADDRESS,
            resourceType: `${MODULE_ADDRESS}::offramp::OffRampStore`,
          });
          console.log(`${colors.green}✅ OffRamp module initialized${colors.reset}`);
          console.log(`   Total requests: ${resource.total_requests}`);
          console.log(`   Total volume: ${resource.total_volume_apt}`);
          return true;
        } catch (error: any) {
          if (error.status === 404) {
            console.log(`${colors.yellow}⚠️  OffRamp module not initialized${colors.reset}`);
            return false;
          }
          throw error;
        }
      },
    },
    {
      name: "Test View Functions",
      test: async () => {
        try {
          // Test streaming view function
          const streamingLocked = await aptos.view({
            payload: {
              function: `${MODULE_ADDRESS}::streaming::get_total_locked_amount`,
              typeArguments: [],
              functionArguments: [MODULE_ADDRESS],
            },
          });
          console.log(`${colors.green}✅ Streaming view functions working${colors.reset}`);
          console.log(`   Total locked: ${streamingLocked[0]}`);

          // Test vault view function
          const vaultTVL = await aptos.view({
            payload: {
              function: `${MODULE_ADDRESS}::vault::get_total_value_locked`,
              typeArguments: [],
              functionArguments: [MODULE_ADDRESS],
            },
          });
          console.log(`${colors.green}✅ Vault view functions working${colors.reset}`);
          console.log(`   TVL: ${vaultTVL[0]}`);

          // Test offramp view function
          const offrampStats = await aptos.view({
            payload: {
              function: `${MODULE_ADDRESS}::offramp::get_stats`,
              typeArguments: [],
              functionArguments: [MODULE_ADDRESS],
            },
          });
          console.log(`${colors.green}✅ OffRamp view functions working${colors.reset}`);
          console.log(`   Stats: ${JSON.stringify(offrampStats)}`);

          return true;
        } catch (error: any) {
          console.log(`${colors.red}❌ View functions test failed: ${error.message}${colors.reset}`);
          return false;
        }
      },
    },
  ];

  // Run all tests
  console.log(`${colors.yellow}Running tests...${colors.reset}\n`);
  let passedTests = 0;
  let failedTests = 0;

  for (const { name, test } of tests) {
    console.log(`${colors.blue}Testing: ${name}${colors.reset}`);
    try {
      const result = await test();
      if (result) {
        passedTests++;
      } else {
        failedTests++;
      }
    } catch (error: any) {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
      failedTests++;
    }
    console.log();
  }

  // Summary
  console.log("=====================================");
  console.log(`${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
  if (failedTests > 0) {
    console.log(`${colors.red}❌ Failed: ${failedTests}${colors.reset}`);
  }

  // Generate frontend config update
  if (passedTests === tests.length) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}`);
    console.log(`\n${colors.yellow}Update your frontend config:${colors.reset}`);
    console.log(`${colors.blue}File: frontend/src/config/aptos.ts${colors.reset}`);
    console.log(`${colors.blue}Change: export const MODULE_ADDRESS = "${MODULE_ADDRESS}";${colors.reset}`);
    
    // Optionally auto-update the config
    console.log(`\n${colors.yellow}Auto-update frontend config? (y/n)${colors.reset}`);
    
    const configPath = path.join("frontend", "src", "config", "aptos.ts");
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, "utf-8");
      const updated = config.replace(
        /export const MODULE_ADDRESS = .*?;/,
        `export const MODULE_ADDRESS = "${MODULE_ADDRESS}";`
      );
      
      fs.writeFileSync(configPath, updated);
      console.log(`${colors.green}✅ Frontend config updated!${colors.reset}`);
    }
  }

  // Explorer link
  console.log(`\n${colors.blue}View on Explorer:${colors.reset}`);
  console.log(`https://explorer.aptoslabs.com/account/${MODULE_ADDRESS}?network=testnet`);
}

// Run the test
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});