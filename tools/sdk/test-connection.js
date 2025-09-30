const { Aptos, AptosConfig, Network } = require("@aptos-labs/ts-sdk");

async function testConnection() {
  console.log("Testing Aptos network connections...\n");

  const networks = [
    { name: "Mainnet", network: Network.MAINNET },
    { name: "Testnet", network: Network.TESTNET },
    { name: "Devnet", network: Network.DEVNET }
  ];

  for (const { name, network } of networks) {
    try {
      const config = new AptosConfig({ network });
      const aptos = new Aptos(config);
      
      const ledgerInfo = await aptos.getLedgerInfo();
      console.log(`✅ ${name} Connection Successful`);
      console.log(`   Chain ID: ${ledgerInfo.chain_id}`);
      console.log(`   Ledger Version: ${ledgerInfo.ledger_version}`);
      console.log(`   Ledger Timestamp: ${new Date(parseInt(ledgerInfo.ledger_timestamp) / 1000).toISOString()}\n`);
    } catch (error) {
      console.log(`❌ ${name} Connection Failed: ${error.message}\n`);
    }
  }
}

testConnection().catch(console.error);