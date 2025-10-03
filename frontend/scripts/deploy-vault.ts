import { Aptos, AptosConfig, Network, Account } from "@aptos-labs/ts-sdk";
import * as fs from "fs";
import * as path from "path";

const CONFIG_PATH = path.join(process.env.HOME!, ".aptos", "config.yaml");

async function deployVault() {
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // Read the private key from .aptos/config.yaml
  const configContent = fs.readFileSync(CONFIG_PATH, "utf8");
  const privateKeyMatch = configContent.match(/private_key:\s*"(0x[a-f0-9]+)"/);

  if (!privateKeyMatch) {
    console.error("❌ Could not find private key in", CONFIG_PATH);
    process.exit(1);
  }

  const privateKeyHex = privateKeyMatch[1];
  const account = Account.fromPrivateKey({
    privateKey: { hexString: privateKeyHex },
  });

  console.log("📍 Deployer Account:", account.accountAddress.toString());

  // Fund account
  console.log("💰 Funding account with testnet APT...");
  try {
    await aptos.fundAccount({
      accountAddress: account.accountAddress,
      amount: 100000000, // 1 APT
    });
    console.log("✅ Account funded!");
  } catch (error) {
    console.log("⚠️  Funding failed, account may already have funds:", error);
  }

  // Read compiled module
  const modulePath = path.join(__dirname, "../../contracts/build/Remora/bytecode_modules");

  if (!fs.existsSync(modulePath)) {
    console.error("❌ Compiled modules not found. Please run:");
    console.error("   cd ../contracts && aptos move compile");
    process.exit(1);
  }

  const modules = fs.readdirSync(modulePath)
    .filter(f => f.endsWith(".mv"))
    .map(f => fs.readFileSync(path.join(modulePath, f)));

  console.log(`📦 Found ${modules.length} modules to deploy`);

  // Deploy contract
  console.log("🚀 Deploying contract...");

  const transaction = await aptos.publishPackageTransaction({
    account: account.accountAddress,
    metadataBytes: fs.readFileSync(
      path.join(modulePath, "../package-metadata.bcs")
    ),
    moduleBytecode: modules,
  });

  const response = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction,
  });

  console.log("⏳ Waiting for deployment confirmation...");
  const result = await aptos.waitForTransaction({
    transactionHash: response.hash,
  });

  console.log("✅ Contract deployed!");
  console.log("   Transaction:", response.hash);
  console.log("   Package Address:", account.accountAddress.toString());

  // Initialize vault
  console.log("\n🔄 Initializing vault...");

  const initTx = await aptos.transaction.build.simple({
    sender: account.accountAddress,
    data: {
      function: `${account.accountAddress.toString()}::vault::initialize`,
      functionArguments: [],
    },
  });

  const initResponse = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction: initTx,
  });

  await aptos.waitForTransaction({
    transactionHash: initResponse.hash,
  });

  console.log("✅ Vault initialized!");
  console.log("   Transaction:", initResponse.hash);

  // Verify
  const resource = await aptos.getAccountResource({
    accountAddress: account.accountAddress,
    resourceType: `${account.accountAddress.toString()}::vault::VaultStore`,
  });

  console.log("\n✅ Deployment Complete!");
  console.log("\n📝 Update these files:");
  console.log(`\n1. frontend/src/config/aptos.ts:`);
  console.log(`   MODULE_ADDRESS: "${account.accountAddress.toString()}"`);
  console.log(`\n2. contracts/Move.toml:`);
  console.log(`   remora = "${account.accountAddress.toString()}"`);
  console.log(`\nVaultStore:`, JSON.stringify(resource.data, null, 2));
}

deployVault().catch(console.error);
