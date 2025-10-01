// Script to set exchange rates for the off-ramp module
// This should be run by an admin/processor after module initialization

import { offRampService } from "@/services/offramp.service";
import { CONTRACTS } from "@/config/aptos";
import { aptosClient } from "@/lib/aptos-client";

export async function setExchangeRates(signAndSubmitTransaction: any) {
  const rates = [
    { currency: "USD", rate: 1.0 },
    { currency: "NGN", rate: 1550.0 },
    { currency: "KES", rate: 150.0 },
    { currency: "GHS", rate: 15.0 },
    { currency: "ZAR", rate: 18.5 },
  ];

  console.log("Setting exchange rates for off-ramp module...");

  for (const { currency, rate } of rates) {
    try {
      console.log(`Setting ${currency} rate to ${rate}...`);
      
      // Convert rate to 6 decimal precision integer
      const rateInPrecision = Math.floor(rate * 1000000);
      
      const payload = await aptosClient.buildTransaction({
        function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.UPDATE_EXCHANGE_RATE}` as `${string}::${string}::${string}`,
        functionArguments: [
          currency,
          rateInPrecision.toString(),
          offRampService.getModuleOwner(),
        ],
      });

      await signAndSubmitTransaction({
        data: payload,
      });

      console.log(`   ✅ ${currency} rate set successfully`);
    } catch (error: any) {
      console.error(`   ❌ Failed to set ${currency} rate:`, error.message);
    }
  }

  console.log("\nExchange rates setup complete!");
}