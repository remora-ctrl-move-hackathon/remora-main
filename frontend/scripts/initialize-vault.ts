import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

const MODULE_ADDRESS = "0xf8a774edce1e7d3bb1c9caf366d17e5bd7800f0def09c179f3d4e5cebfa6048a";

async function initializeVault() {
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);

  // You need to provide the private key of the account that deployed the contract
  const privateKeyHex = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKeyHex) {
    console.error("ERROR: DEPLOYER_PRIVATE_KEY environment variable not set");
    console.log("\nUsage:");
    console.log("  DEPLOYER_PRIVATE_KEY=0x... npm run initialize-vault");
    console.log("\nThe private key should be for the account that deployed the contract at:");
    console.log(`  ${MODULE_ADDRESS}`);
    process.exit(1);
  }

  try {
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const account = Account.fromPrivateKey({ privateKey });

    console.log("Deployer Account:", account.accountAddress.toString());
    console.log("Module Address:", MODULE_ADDRESS);

    // Check if already initialized
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::vault::VaultStore`,
      });
      console.log("\n✅ Vault already initialized!");
      console.log("VaultStore resource:", JSON.stringify(resource, null, 2));
      process.exit(0);
    } catch (e) {
      console.log("\n⏳ Vault not initialized yet. Initializing...");
    }

    // Build transaction payload
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ADDRESS}::vault::initialize`,
        functionArguments: [],
      },
    });

    console.log("\n📝 Submitting initialization transaction...");

    // Sign and submit transaction
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    console.log("Transaction hash:", committedTxn.hash);
    console.log("Waiting for transaction confirmation...");

    // Wait for transaction
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash,
    });

    console.log("\n✅ Vault initialized successfully!");
    console.log("Transaction details:", JSON.stringify(executedTransaction, null, 2));

    // Verify initialization
    const resource = await aptos.getAccountResource({
      accountAddress: MODULE_ADDRESS,
      resourceType: `${MODULE_ADDRESS}::vault::VaultStore`,
    });

    console.log("\nVaultStore resource created:", JSON.stringify(resource, null, 2));

  } catch (error) {
    console.error("\n❌ Error initializing vault:", error);
    process.exit(1);
  }
}

initializeVault();
