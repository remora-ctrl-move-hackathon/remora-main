import { MerkleClient, MerkleClientConfig } from "@merkletrade/ts-sdk";
import {
  Account,
  Aptos,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
  type InputEntryFunctionData,
} from "@aptos-labs/ts-sdk";
import dotenv from "dotenv";
import { VaultCopyTrader } from "./vault-copy-trader.js";

dotenv.config();

const {
  BOT_PRIVATE_KEY,
  MODULE_ADDRESS,
  VAULT_ID,
  APTOS_NETWORK = "testnet",
} = process.env;

if (!BOT_PRIVATE_KEY || !MODULE_ADDRESS || !VAULT_ID) {
  console.error("Missing required environment variables");
  console.error("Please set: BOT_PRIVATE_KEY, MODULE_ADDRESS, VAULT_ID");
  process.exit(1);
}

async function main() {
  console.log("🚀 Starting Remora Copy-Trading Bot...");
  console.log(`📊 Network: ${APTOS_NETWORK}`);
  console.log(`📍 Module Address: ${MODULE_ADDRESS}`);
  console.log(`🏦 Vault ID: ${VAULT_ID}`);

  // Initialize Merkle client
  const merkleConfig =
    APTOS_NETWORK === "mainnet"
      ? await MerkleClientConfig.mainnet()
      : await MerkleClientConfig.testnet();

  const merkle = new MerkleClient(merkleConfig);
  const aptos = new Aptos(merkle.config.aptosConfig);

  // Initialize bot account (vault manager)
  const account = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(
      PrivateKey.formatPrivateKey(BOT_PRIVATE_KEY, PrivateKeyVariants.Ed25519)
    ),
  });

  console.log(`🤖 Bot Address: ${account.accountAddress.toString()}`);

  // Get vault info to find lead trader
  console.log("\n📖 Fetching vault information...");
  const vaultInfo = await getVaultInfo(aptos, MODULE_ADDRESS, Number(VAULT_ID));

  if (!vaultInfo) {
    console.error("❌ Vault not found");
    process.exit(1);
  }

  const leadTrader = vaultInfo.lead_trader;
  console.log(`👨‍💼 Lead Trader: ${leadTrader}`);
  console.log(`💰 Vault Total Value: ${vaultInfo.total_value / 1e8} APT`);
  console.log(`📊 Strategy: ${vaultInfo.strategy}`);

  // Initialize copy trader
  const copyTrader = new VaultCopyTrader({
    merkle,
    aptos,
    account,
    vaultId: Number(VAULT_ID),
    moduleAddress: MODULE_ADDRESS,
    leadTrader,
  });

  // Start monitoring
  console.log("\n👀 Starting WebSocket monitoring...");
  await copyTrader.startMonitoring();
}

async function getVaultInfo(
  aptos: Aptos,
  moduleAddress: string,
  vaultId: number
): Promise<any> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::vault::get_vault_info` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [vaultId.toString(), moduleAddress],
      },
    });

    return result[0];
  } catch (error) {
    console.error("Error fetching vault info:", error);
    return null;
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down bot...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n👋 Shutting down bot...");
  process.exit(0);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
