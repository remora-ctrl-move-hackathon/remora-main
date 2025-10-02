import { 
  aptos, 
  MODULE_ADDRESS,
  parseAptAmount 
} from "@/config/aptos";
import type { 
  InputGenerateTransactionPayloadData
} from "@aptos-labs/ts-sdk";
import { apiCache, rateLimitTracker, withRetry } from "./api-cache";

/**
 * AptosClient - Main client for interacting with Remora smart contracts
 */
export class AptosClient {
  /**
   * Get account balance in APT
   */
  async getBalance(address: string): Promise<number> {
    try {
      const resources = await aptos.getAccountResources({
        accountAddress: address,
      });
      
      const accountResource = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      
      if (!accountResource) return 0;
      
      const balance = (accountResource.data as any).coin.value;
      return parseAptAmount(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return 0;
    }
  }

  /**
   * View function caller - for read-only operations
   */
  async viewFunction(payload: {
    function: `${string}::${string}::${string}`;
    typeArguments?: string[];
    functionArguments: any[];
  }): Promise<any> {
    // Create cache key from payload
    const cacheKey = `view:${payload.function}:${JSON.stringify(payload.functionArguments)}`;
    
    // Check cache first
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // Check rate limit
    if (!rateLimitTracker.canMakeCall('view')) {
      console.warn('Rate limit approaching, using cached data or defaults');
      // Return default values based on function type
      return this.getDefaultValue(payload.function);
    }

    try {
      // Track the API call
      rateLimitTracker.trackCall('view');

      // Prepare headers with optional API key
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add API keys if available
      if (process.env.NEXT_PUBLIC_APTOS_API_KEY) {
        headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_APTOS_API_KEY}`;
        headers["X-Aptos-Key"] = process.env.NEXT_PUBLIC_APTOS_API_KEY;
      }
      
      // Add sponsor key for sponsored transactions
      if (process.env.NEXT_PUBLIC_APTOS_SPONSOR_KEY) {
        headers["X-Aptos-Sponsor-Key"] = process.env.NEXT_PUBLIC_APTOS_SPONSOR_KEY;
      }

      // Use the correct API for view function with retry
      const response = await withRetry(async () => {
        return await fetch(
          `${process.env.NEXT_PUBLIC_APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com/v1"}/view`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              function: payload.function,
              type_arguments: payload.typeArguments || [],
              arguments: payload.functionArguments,
            }),
          }
        );
      }, 2, 2000); // 2 retries with 2 second initial delay

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle rate limit errors more gracefully
        if (response.status === 429) {
          console.warn("Rate limit exceeded, using fallback values");
          // Return default fallback values instead of throwing
          if (payload.function.includes("get_user_vaults") || 
              payload.function.includes("get_user_sent_streams") ||
              payload.function.includes("get_user_received_streams")) {
            return [];
          }
          if (payload.function.includes("get_total") || 
              payload.function.includes("get_balance") ||
              payload.function.includes("get_withdrawable")) {
            return "0";
          }
          if (payload.function.includes("get_stream_info")) {
            return null;
          }
        }
        
        // Handle exchange rate not set error gracefully
        if (errorText.includes("E_RATE_NOT_SET")) {
          // Rate not set is expected when exchange rates haven't been initialized
          // Don't log this as an error, the service layer will handle with default rates
          throw new Error("Exchange rate not initialized");
        }
        
        console.error("View function error response:", errorText);
        throw new Error(`Failed to call view function: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const data = result[0];
      
      // Cache successful result
      apiCache.set(cacheKey, data, 30000); // Cache for 30 seconds
      
      return data;
    } catch (error) {
      console.error("Error calling view function:", error);
      // Return default values for common view functions to prevent app crashes
      return this.getDefaultValue(payload.function);
    }
  }

  /**
   * Get default value based on function name
   */
  private getDefaultValue(functionName: string): any {
    if (functionName.includes("get_user_vaults") || 
        functionName.includes("get_user_sent_streams") ||
        functionName.includes("get_user_received_streams") ||
        functionName.includes("get_user_requests")) {
      return [];
    }
    if (functionName.includes("get_total") || 
        functionName.includes("get_balance") ||
        functionName.includes("get_withdrawable") ||
        functionName.includes("get_exchange_rate")) {
      return "0";
    }
    if (functionName.includes("get_stream_info") ||
        functionName.includes("get_vault_info") ||
        functionName.includes("get_request_info")) {
      return null;
    }
    if (functionName.includes("get_user_kyc_status")) {
      return false;
    }
    return null;
  }

  /**
   * Build transaction for signing
   */
  async buildTransaction(payload: {
    function: `${string}::${string}::${string}`;
    typeArguments?: string[];
    functionArguments: any[];
  }): Promise<InputGenerateTransactionPayloadData> {
    return {
      function: payload.function,
      typeArguments: payload.typeArguments || [],
      functionArguments: payload.functionArguments,
    };
  }

  /**
   * Submit signed transaction
   */
  async submitTransaction(signedTxn: any): Promise<string> {
    try {
      const pendingTxn = await aptos.transaction.submit.simple({
        transaction: signedTxn,
        senderAuthenticator: signedTxn.senderAuthenticator,
      });
      
      // Wait for transaction
      await aptos.waitForTransaction({
        transactionHash: pendingTxn.hash,
      });
      
      return pendingTxn.hash;
    } catch (error) {
      console.error("Error submitting transaction:", error);
      throw error;
    }
  }

  /**
   * Check if module is initialized for address
   */
  async isModuleInitialized(
    moduleOwner: string,
    moduleName: "streaming" | "vault" | "offramp"
  ): Promise<boolean> {
    try {
      const resources = await aptos.getAccountResources({
        accountAddress: moduleOwner,
      });
      
      const resourceType = `${MODULE_ADDRESS}::${moduleName}::${
        moduleName === "streaming" ? "StreamStore" :
        moduleName === "vault" ? "VaultStore" :
        "OffRampStore"
      }`;
      
      return resources.some((r) => r.type === resourceType);
    } catch (error) {
      console.error("Error checking module initialization:", error);
      return false;
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(txnHash: string): Promise<any> {
    try {
      return await aptos.getTransactionByHash({ transactionHash: txnHash });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw error;
    }
  }

  /**
   * Get account transactions
   */
  async getAccountTransactions(
    address: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      return await aptos.getAccountTransactions({
        accountAddress: address,
        options: { limit },
      });
    } catch (error) {
      console.error("Error fetching account transactions:", error);
      return [];
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(_payload: InputGenerateTransactionPayloadData): Promise<number> {
    try {
      // For now, return a default gas estimate
      // Actual simulation requires a valid account
      return 100000;
    } catch (error) {
      console.error("Error estimating gas:", error);
      return 100000; // Default gas estimate
    }
  }
}

// Export singleton instance
export const aptosClient = new AptosClient();