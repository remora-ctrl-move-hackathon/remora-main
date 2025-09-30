// Test script to verify Aptos connection
const MODULE_ADDRESS = "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a";

async function testAptosConnection() {
  const nodeUrl = "https://fullnode.testnet.aptoslabs.com/v1";
  
  console.log("Testing Aptos Testnet connection...");
  console.log("Node URL:", nodeUrl);
  console.log("Module Address:", MODULE_ADDRESS);
  console.log("-----------------------------------");

  try {
    // Test 1: Check node health
    console.log("\n1. Testing node health...");
    const healthResponse = await fetch(`${nodeUrl}/-/healthy`);
    console.log("   Health check status:", healthResponse.status === 200 ? "✅ OK" : `❌ Failed (${healthResponse.status})`);

    // Test 2: Get ledger info
    console.log("\n2. Getting ledger info...");
    const ledgerResponse = await fetch(`${nodeUrl}/`);
    const ledgerInfo = await ledgerResponse.json();
    console.log("   Chain ID:", ledgerInfo.chain_id);
    console.log("   Ledger version:", ledgerInfo.ledger_version);
    console.log("   Block height:", ledgerInfo.block_height);

    // Test 3: Check if account exists
    console.log("\n3. Checking module account...");
    const accountResponse = await fetch(`${nodeUrl}/accounts/${MODULE_ADDRESS}`);
    if (accountResponse.ok) {
      const accountInfo = await accountResponse.json();
      console.log("   Account exists: ✅");
      console.log("   Sequence number:", accountInfo.sequence_number);
    } else {
      console.log("   Account exists: ❌ Account not found");
    }

    // Test 4: Try to call a view function
    console.log("\n4. Testing view function call...");
    const viewPayload = {
      function: `${MODULE_ADDRESS}::vault::get_total_value_locked`,
      type_arguments: [],
      arguments: [MODULE_ADDRESS]
    };
    
    const viewResponse = await fetch(`${nodeUrl}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(viewPayload),
    });

    if (viewResponse.ok) {
      const viewResult = await viewResponse.json();
      console.log("   View function call: ✅ Success");
      console.log("   Result:", viewResult);
    } else {
      const errorText = await viewResponse.text();
      console.log("   View function call: ❌ Failed");
      console.log("   Error:", errorText);
    }

    console.log("\n-----------------------------------");
    console.log("Connection test completed!");

  } catch (error) {
    console.error("\n❌ Error during testing:", error.message);
  }
}

// Run the test
testAptosConnection();