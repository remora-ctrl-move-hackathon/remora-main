import { aptosClient } from "@/lib/aptos-client";
import { 
  CONTRACTS, 
  MODULE_ADDRESS,
  formatAptAmount,
  parseAptAmount,
  OFFRAMP_STATUS
} from "@/config/aptos";
import type { InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";

export interface BankInfo {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  swiftCode: string;
  routingNumber: string;
  country: string;
}

export interface KYCInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  verified: boolean;
  verifiedAt: number;
  verificationLevel: number;
}

export interface OffRampRequest {
  requestId: number;
  user: string;
  aptAmount: number;
  fiatAmount: number;
  currency: string;
  exchangeRate: number;
  serviceFee: number;
  netFiatAmount: number;
  bankInfo: BankInfo;
  status: number;
  createdAt: number;
  processedAt: number;
  transactionHash: string;
  rejectionReason: string;
}

export interface CreateOffRampParams {
  aptAmount: number;
  currency: string;
  bankInfo: BankInfo;
}

export interface SubmitKYCParams {
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
}

export class OffRampService {
  private moduleOwner: string = MODULE_ADDRESS;

  /**
   * Get module owner address
   */
  getModuleOwner(): string {
    return this.moduleOwner;
  }

  /**
   * Initialize the off-ramp module (admin only)
   */
  async initialize(): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.INITIALIZE}` as `${string}::${string}::${string}`,
      functionArguments: [],
    });
  }

  /**
   * Submit KYC information
   */
  async submitKYC(params: SubmitKYCParams): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.SUBMIT_KYC}` as `${string}::${string}::${string}`,
      functionArguments: [
        params.fullName,
        params.email,
        params.phoneNumber,
        params.country,
        this.moduleOwner,
      ],
    });
  }

  /**
   * Verify KYC (processor only)
   */
  async verifyKYC(user: string, verificationLevel: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.VERIFY_KYC}` as `${string}::${string}::${string}`,
      functionArguments: [
        user,
        verificationLevel.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Update exchange rate (admin only)
   */
  async updateExchangeRate(currency: string, rate: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.UPDATE_EXCHANGE_RATE}` as `${string}::${string}::${string}`,
      functionArguments: [
        currency,
        Math.floor(rate * 1000000).toString(), // Convert to 6 decimal precision
        this.moduleOwner,
      ],
    });
  }

  /**
   * Create off-ramp request
   */
  async createOffRampRequest(params: CreateOffRampParams): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.CREATE_OFFRAMP_REQUEST}` as `${string}::${string}::${string}`,
      functionArguments: [
        formatAptAmount(params.aptAmount).toString(),
        params.currency,
        params.bankInfo.accountName,
        params.bankInfo.accountNumber,
        params.bankInfo.bankName,
        params.bankInfo.bankCode,
        params.bankInfo.swiftCode,
        params.bankInfo.routingNumber,
        params.bankInfo.country,
        this.moduleOwner,
      ],
    });
  }

  /**
   * Process off-ramp request (processor only)
   */
  async processOffRampRequest(
    requestId: number,
    status: number,
    transactionHash: string
  ): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.PROCESS_OFFRAMP_REQUEST}` as `${string}::${string}::${string}`,
      functionArguments: [
        requestId.toString(),
        status.toString(),
        transactionHash,
        this.moduleOwner,
      ],
    });
  }

  /**
   * Cancel off-ramp request
   */
  async cancelOffRampRequest(requestId: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.CANCEL_OFFRAMP_REQUEST}` as `${string}::${string}::${string}`,
      functionArguments: [
        requestId.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Reject off-ramp request (processor only)
   */
  async rejectOffRampRequest(requestId: number, reason: string): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.FUNCTIONS.REJECT_OFFRAMP_REQUEST}` as `${string}::${string}::${string}`,
      functionArguments: [
        requestId.toString(),
        reason,
        this.moduleOwner,
      ],
    });
  }

  /**
   * Get request information
   */
  async getRequestInfo(requestId: number): Promise<OffRampRequest | null> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.VIEWS.GET_REQUEST_INFO}` as `${string}::${string}::${string}`,
        functionArguments: [requestId.toString(), this.moduleOwner],
      });

      if (!result) return null;

      return {
        requestId: Number(result.request_id),
        user: result.user,
        aptAmount: parseAptAmount(result.apt_amount),
        fiatAmount: Number(result.fiat_amount) / 1000000, // Adjust for precision
        currency: result.currency,
        exchangeRate: Number(result.exchange_rate) / 1000000,
        serviceFee: parseAptAmount(result.service_fee),
        netFiatAmount: Number(result.net_fiat_amount) / 1000000,
        bankInfo: {
          accountName: result.bank_info.account_name,
          accountNumber: result.bank_info.account_number,
          bankName: result.bank_info.bank_name,
          bankCode: result.bank_info.bank_code,
          swiftCode: result.bank_info.swift_code,
          routingNumber: result.bank_info.routing_number,
          country: result.bank_info.country,
        },
        status: Number(result.status),
        createdAt: Number(result.created_at),
        processedAt: Number(result.processed_at),
        transactionHash: result.transaction_hash,
        rejectionReason: result.rejection_reason,
      };
    } catch (error) {
      console.error("Error fetching request info:", error);
      return null;
    }
  }

  /**
   * Get user's off-ramp requests
   */
  async getUserRequests(user: string): Promise<number[]> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.VIEWS.GET_USER_REQUESTS}` as `${string}::${string}::${string}`,
        functionArguments: [user, this.moduleOwner],
      });

      return result.map((id: string) => Number(id));
    } catch (error) {
      console.error("Error fetching user requests:", error);
      return [];
    }
  }

  /**
   * Get exchange rate for currency
   */
  async getExchangeRate(currency: string): Promise<number> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.VIEWS.GET_EXCHANGE_RATE}` as `${string}::${string}::${string}`,
        functionArguments: [currency, this.moduleOwner],
      });

      return Number(result) / 1000000; // Convert from 6 decimal precision
    } catch (error: any) {
      // E_RATE_NOT_SET is expected when rates haven't been initialized in the contract
      // Use default rates instead of logging error
      const defaultRates: Record<string, number> = {
        "USD": 1.0,
        "NGN": 1645.0,  // Updated to match the UI display
        "KES": 150.0,
        "GHS": 15.0,
        "ZAR": 18.5,
      };
      return defaultRates[currency] || 1.0;
    }
  }

  /**
   * Get user KYC status
   */
  async getUserKYCStatus(user: string): Promise<{ verified: boolean; level: number }> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.VIEWS.GET_USER_KYC_STATUS}` as `${string}::${string}::${string}`,
        functionArguments: [user, this.moduleOwner],
      });

      return {
        verified: result[0],
        level: Number(result[1]),
      };
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      return { verified: false, level: 0 };
    }
  }

  /**
   * Get user's daily volume
   */
  async getUserDailyVolume(user: string): Promise<number> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.VIEWS.GET_USER_DAILY_VOLUME}` as `${string}::${string}::${string}`,
        functionArguments: [user, this.moduleOwner],
      });

      return parseAptAmount(result);
    } catch (error) {
      console.error("Error fetching daily volume:", error);
      return 0;
    }
  }

  /**
   * Get treasury balance
   */
  async getTreasuryBalance(): Promise<number> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.VIEWS.GET_TREASURY_BALANCE}` as `${string}::${string}::${string}`,
        functionArguments: [this.moduleOwner],
      });

      return parseAptAmount(result);
    } catch (error) {
      console.error("Error fetching treasury balance:", error);
      return 0;
    }
  }

  /**
   * Get off-ramp statistics
   */
  async getStats(): Promise<{ totalRequests: number; totalVolumeAPT: number; totalFeesCollected: number }> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.OFFRAMP.MODULE}::${CONTRACTS.OFFRAMP.VIEWS.GET_STATS}` as `${string}::${string}::${string}`,
        functionArguments: [this.moduleOwner],
      });

      return {
        totalRequests: Number(result[0]),
        totalVolumeAPT: parseAptAmount(result[1]),
        totalFeesCollected: parseAptAmount(result[2]),
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return { totalRequests: 0, totalVolumeAPT: 0, totalFeesCollected: 0 };
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: number): string {
    switch (status) {
      case OFFRAMP_STATUS.PENDING:
        return "Pending";
      case OFFRAMP_STATUS.PROCESSING:
        return "Processing";
      case OFFRAMP_STATUS.COMPLETED:
        return "Completed";
      case OFFRAMP_STATUS.CANCELLED:
        return "Cancelled";
      case OFFRAMP_STATUS.REJECTED:
        return "Rejected";
      default:
        return "Unknown";
    }
  }

  /**
   * Get KYC level label
   */
  getKYCLevelLabel(level: number): string {
    switch (level) {
      case 1:
        return "Basic";
      case 2:
        return "Enhanced";
      case 3:
        return "Full";
      default:
        return "Unverified";
    }
  }

  /**
   * Calculate service fee
   */
  calculateServiceFee(aptAmount: number): number {
    return aptAmount * 0.01; // 1% service fee
  }

  /**
   * Calculate fiat amount
   */
  calculateFiatAmount(aptAmount: number, exchangeRate: number): number {
    const serviceFee = this.calculateServiceFee(aptAmount);
    const netApt = aptAmount - serviceFee;
    return netApt * exchangeRate;
  }
}

export const offRampService = new OffRampService();