// Script to initialize all Remora modules
// Run this once after deploying the contracts

import { streamingService } from "@/services/streaming.service";
import { vaultService } from "@/services/vault.service";
import { offRampService } from "@/services/offramp.service";

export async function initializeModules(signAndSubmitTransaction: any) {
  const results = {
    streaming: false,
    vault: false,
    offramp: false,
  };

  try {
    console.log("Initializing Remora modules...");

    // Initialize Streaming Module
    try {
      console.log("1. Initializing Streaming module...");
      const streamingPayload = await streamingService.initialize();
      await signAndSubmitTransaction({
        data: streamingPayload,
      });
      results.streaming = true;
      console.log("   ✅ Streaming module initialized");
    } catch (error: any) {
      if (error.message?.includes("EALREADY_INITIALIZED") || 
          error.message?.includes("already initialized")) {
        console.log("   ℹ️ Streaming module already initialized");
        results.streaming = true;
      } else {
        console.error("   ❌ Failed to initialize Streaming:", error.message);
      }
    }

    // Initialize Vault Module
    try {
      console.log("2. Initializing Vault module...");
      const vaultPayload = await vaultService.initialize();
      await signAndSubmitTransaction({
        data: vaultPayload,
      });
      results.vault = true;
      console.log("   ✅ Vault module initialized");
    } catch (error: any) {
      if (error.message?.includes("EALREADY_INITIALIZED") || 
          error.message?.includes("already initialized")) {
        console.log("   ℹ️ Vault module already initialized");
        results.vault = true;
      } else {
        console.error("   ❌ Failed to initialize Vault:", error.message);
      }
    }

    // Initialize OffRamp Module
    try {
      console.log("3. Initializing OffRamp module...");
      const offRampPayload = await offRampService.initialize();
      await signAndSubmitTransaction({
        data: offRampPayload,
      });
      results.offramp = true;
      console.log("   ✅ OffRamp module initialized");
    } catch (error: any) {
      if (error.message?.includes("EALREADY_INITIALIZED") || 
          error.message?.includes("already initialized")) {
        console.log("   ℹ️ OffRamp module already initialized");
        results.offramp = true;
      } else {
        console.error("   ❌ Failed to initialize OffRamp:", error.message);
      }
    }

    console.log("\n-----------------------------------");
    console.log("Module initialization complete!");
    console.log("Streaming:", results.streaming ? "✅" : "❌");
    console.log("Vault:", results.vault ? "✅" : "❌");
    console.log("OffRamp:", results.offramp ? "✅" : "❌");

    return results;
  } catch (error) {
    console.error("Error during module initialization:", error);
    throw error;
  }
}