import { GasStationClient, GasStationTransactionSubmitter } from "@aptos-labs/gas-station-client";
import { Network } from "@aptos-labs/ts-sdk";

/**
 * Gas Station Service for sponsoring vault transactions
 * Uses Geomi Gas Station to pay for user's gas fees
 */
class GasStationService {
  private gasStationClient: GasStationClient | null = null;
  private transactionSubmitter: GasStationTransactionSubmitter | null = null;
  
  // Vault contract address
  private readonly VAULT_MODULE = "0xe95e7998587e360db1185b3aa020dd07d77429ec340bbcd2bc8bc455e71d0e1a::vault";
  
  constructor() {
    this.initialize();
  }
  
  private initialize() {
    const apiKey = process.env.NEXT_PUBLIC_GEOMI_GAS_STATION_API_KEY;
    
    if (!apiKey) {
      console.warn("Gas Station API key not configured. Sponsored transactions will not be available.");
      return;
    }
    
    try {
      // Initialize Gas Station Client
      this.gasStationClient = new GasStationClient({
        network: this.getNetwork(),
        apiKey: apiKey,
      });
      
      // Initialize Transaction Submitter
      this.transactionSubmitter = new GasStationTransactionSubmitter(this.gasStationClient);
      
      console.log("Gas Station initialized successfully for vault contract");
    } catch (error) {
      console.error("Failed to initialize Gas Station:", error);
    }
  }
  
  private getNetwork(): Network {
    const network = process.env.NEXT_PUBLIC_APTOS_NETWORK || "testnet";
    switch (network.toLowerCase()) {
      case "mainnet":
        return Network.MAINNET;
      case "testnet":
        return Network.TESTNET;
      case "devnet":
        return Network.DEVNET;
      default:
        return Network.TESTNET;
    }
  }
  
  /**
   * Check if gas station is enabled and initialized
   */
  isEnabled(): boolean {
    return this.gasStationClient !== null && this.transactionSubmitter !== null;
  }
  
  /**
   * Get the gas station client for direct usage
   */
  getClient(): GasStationClient | null {
    return this.gasStationClient;
  }
  
  /**
   * Get the transaction submitter for signing and submitting sponsored transactions
   */
  getSubmitter(): GasStationTransactionSubmitter | null {
    return this.transactionSubmitter;
  }
  
  /**
   * Check if a function is eligible for gas sponsorship
   * @param functionName - The full function identifier (address::module::function)
   */
  isFunctionSponsored(functionName: string): boolean {
    // Check if the function belongs to the vault module
    return functionName.startsWith(this.VAULT_MODULE);
  }
  
  /**
   * Get sponsored functions for the vault contract
   */
  getSponsoredFunctions(): string[] {
    return [
      `${this.VAULT_MODULE}::create_vault`,
      `${this.VAULT_MODULE}::deposit_to_vault`,
      `${this.VAULT_MODULE}::withdraw_from_vault`,
      `${this.VAULT_MODULE}::execute_trade`,
      `${this.VAULT_MODULE}::update_vault_status`,
      `${this.VAULT_MODULE}::claim_management_fee`,
      `${this.VAULT_MODULE}::claim_performance_fee`,
    ];
  }
  
  /**
   * Submit a sponsored transaction for vault operations
   * @param transaction - The transaction to submit
   * @param signer - The wallet signer
   * @param options - Additional options like reCAPTCHA token
   */
  async submitSponsoredTransaction(
    transaction: any,
    signer: any,
    options?: {
      recaptchaToken?: string;
    }
  ) {
    if (!this.isEnabled()) {
      throw new Error("Gas Station is not enabled. Please configure NEXT_PUBLIC_GEOMI_GAS_STATION_API_KEY");
    }
    
    try {
      // Submit transaction with fee payer
      const pendingTxn = await signer.signAndSubmitTransaction({
        data: transaction,
        options: {
          withFeePayer: true,
          ...(options?.recaptchaToken && { recaptchaToken: options.recaptchaToken }),
        },
      });
      
      return pendingTxn.hash;
    } catch (error: any) {
      console.error("Failed to submit sponsored transaction:", error);
      throw new Error(error.message || "Failed to submit sponsored transaction");
    }
  }
  
  /**
   * Get gas station statistics
   */
  async getStats() {
    if (!this.gasStationClient) {
      return null;
    }
    
    try {
      // This would fetch stats from the gas station API
      // Implementation depends on Geomi's API endpoints
      return {
        totalSponsored: 0,
        dailyLimit: 1000,
        dailyUsed: 0,
        isEnabled: true,
      };
    } catch (error) {
      console.error("Failed to fetch gas station stats:", error);
      return null;
    }
  }
}

// Export singleton instance
export const gasStation = new GasStationService();