import { 
  AccountAuthenticator,
  RawTransaction,
  TransactionPayloadEntryFunction,
  AccountAddress,
  SimpleTransaction,
  InputGenerateTransactionPayloadData
} from "@aptos-labs/ts-sdk";
import { aptos, MODULE_ADDRESS } from "@/config/aptos";

/**
 * Service for handling sponsored transactions on Aptos
 * This allows users to interact with the dApp without paying gas fees
 */
class SponsoredTransactionService {
  private sponsorKey: string | undefined;
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.sponsorKey = process.env.NEXT_PUBLIC_APTOS_SPONSOR_KEY;
    this.apiKey = process.env.NEXT_PUBLIC_APTOS_API_KEY;
    this.baseUrl = process.env.NEXT_PUBLIC_APTOS_NODE_URL || "https://fullnode.testnet.aptoslabs.com/v1";
  }

  /**
   * Check if sponsored transactions are enabled
   */
  isEnabled(): boolean {
    return !!this.sponsorKey;
  }

  /**
   * Create a sponsored transaction
   * The sponsor pays the gas fees instead of the user
   */
  async createSponsoredTransaction(
    payload: InputGenerateTransactionPayloadData,
    senderAddress: string,
    options?: {
      maxGasAmount?: number;
      gasUnitPrice?: number;
      expirationSeconds?: number;
    }
  ): Promise<SimpleTransaction | null> {
    if (!this.isEnabled()) {
      console.log("Sponsored transactions not enabled");
      return null;
    }

    try {
      // Build the transaction with fee payer
      const transaction = await aptos.transaction.build.simple({
        sender: senderAddress,
        data: payload,
        options: {
          maxGasAmount: options?.maxGasAmount || 100000,
          gasUnitPrice: options?.gasUnitPrice || 100,
          expireTimestamp: Math.floor(Date.now() / 1000) + (options?.expirationSeconds || 600),
        },
        withFeePayer: true, // Enable fee payer mode
      });

      return transaction;
    } catch (error) {
      console.error("Error creating sponsored transaction:", error);
      return null;
    }
  }

  /**
   * Submit a sponsored transaction
   */
  async submitSponsoredTransaction(
    signedTxn: any,
    senderAuthenticator: AccountAuthenticator
  ): Promise<string | null> {
    if (!this.isEnabled()) {
      console.log("Sponsored transactions not enabled");
      return null;
    }

    try {
      // For sponsored transactions, we need to use the Aptos SDK's fee payer flow
      // The sponsor key should be configured in the SDK's client config
      
      // Submit the transaction with the fee payer signature
      const pendingTxn = await aptos.transaction.submit.simple({
        transaction: signedTxn,
        senderAuthenticator: senderAuthenticator,
      });

      // Wait for transaction confirmation
      await aptos.waitForTransaction({
        transactionHash: pendingTxn.hash,
      });

      return pendingTxn.hash;
    } catch (error) {
      console.error("Error submitting sponsored transaction:", error);
      return null;
    }
  }

  /**
   * Check if a transaction can be sponsored
   * Based on transaction type and user eligibility
   */
  async canSponsorTransaction(
    functionName: string,
    userAddress: string
  ): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    // Define which functions can be sponsored for the Remora module
    const sponsorableFunctions = [
      // Streaming functions
      `${MODULE_ADDRESS}::streaming::create_stream`,
      `${MODULE_ADDRESS}::streaming::withdraw_from_stream`,
      `${MODULE_ADDRESS}::streaming::pause_stream`,
      `${MODULE_ADDRESS}::streaming::resume_stream`,
      // Vault functions
      `${MODULE_ADDRESS}::vault::create_vault`,
      `${MODULE_ADDRESS}::vault::deposit_to_vault`,
      `${MODULE_ADDRESS}::vault::withdraw_from_vault`,
      // Off-ramp functions
      `${MODULE_ADDRESS}::offramp::submit_kyc`,
      `${MODULE_ADDRESS}::offramp::create_offramp_request`,
      // Also support partial function names
      "create_stream",
      "withdraw_from_stream",
      "deposit_to_vault",
      "create_offramp_request",
      "submit_kyc",
    ];

    // Check if function is sponsorable
    const isSponsorable = sponsorableFunctions.some(f => 
      functionName.includes(f)
    );

    if (!isSponsorable) {
      return false;
    }

    // Additional checks can be added here:
    // - User transaction count limits
    // - Daily sponsorship limits
    // - User reputation/KYC status
    
    return true;
  }

  /**
   * Get sponsor statistics
   */
  async getSponsorStats(): Promise<{
    totalSponsored: number;
    gasSpent: number;
    dailyLimit: number;
    dailyUsed: number;
  }> {
    // This would typically call an API endpoint to get sponsor stats
    // For now, return mock data
    return {
      totalSponsored: 0,
      gasSpent: 0,
      dailyLimit: 1000, // Daily limit in APT
      dailyUsed: 0,
    };
  }

  /**
   * Helper: Get account info
   */
  private async getAccountInfo(address: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(
      `${this.baseUrl}/accounts/${address}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error("Failed to get account info");
    }

    return response.json();
  }

  /**
   * Helper: Get chain ID
   */
  private async getChainId(): Promise<number> {
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(
      `${this.baseUrl}/`,
      { headers }
    );

    if (!response.ok) {
      throw new Error("Failed to get chain ID");
    }

    const data = await response.json();
    return data.chain_id;
  }

  /**
   * Get sponsor address from the key
   * This is a simplified version - in production, use proper key management
   */
  private getSponsorAddress(): string {
    // For demo purposes, return a default sponsor address
    // In production, derive this from the sponsor key or configuration
    return "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  }

  /**
   * Estimate gas savings for a user
   */
  estimateGasSavings(transactionCount: number): {
    aptSaved: number;
    usdSaved: number;
  } {
    const avgGasPerTx = 0.005; // Average 0.005 APT per transaction
    const aptToUsd = 10; // Approximate APT price in USD

    const aptSaved = transactionCount * avgGasPerTx;
    const usdSaved = aptSaved * aptToUsd;

    return {
      aptSaved,
      usdSaved,
    };
  }
}

// Export singleton instance
export const sponsoredTransactions = new SponsoredTransactionService();

// Export types
export type { SimpleTransaction };