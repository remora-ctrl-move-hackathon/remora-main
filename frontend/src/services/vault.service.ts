import { aptosClient } from "@/lib/aptos-client";
import { 
  CONTRACTS, 
  MODULE_ADDRESS,
  formatAptAmount,
  parseAptAmount,
  VAULT_STATUS
} from "@/config/aptos";
import type { InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";

export interface Vault {
  vaultId: number;
  manager: string;
  name: string;
  description: string;
  strategy: string;
  totalShares: number;
  totalValue: number;
  highWaterMark: number;
  performanceFee: number; // in basis points
  managementFee: number; // in basis points
  lastFeeCollection: number;
  status: number;
  createdAt: number;
  minInvestment: number;
  maxInvestors: number;
  currentInvestors: number;
}

export interface CreateVaultParams {
  name: string;
  description: string;
  strategy: string;
  performanceFee: number; // in percentage (e.g., 20 for 20%)
  managementFee: number; // in percentage (e.g., 2 for 2%)
  minInvestment: number; // in APT
  maxInvestors: number;
}

export interface ExecuteTradeParams {
  vaultId: number;
  action: string;
  amount: number;
  price: number;
  profitAmount: number;
  isProfit: boolean;
  description: string;
}

export class VaultService {
  private moduleOwner: string = MODULE_ADDRESS;

  /**
   * Initialize the vault module (admin only)
   */
  async initialize(): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.FUNCTIONS.INITIALIZE}` as `${string}::${string}::${string}`,
      functionArguments: [],
    });
  }

  /**
   * Create a new trading vault
   */
  async createVault(params: CreateVaultParams): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.FUNCTIONS.CREATE_VAULT}` as `${string}::${string}::${string}`,
      functionArguments: [
        params.name,
        params.description,
        params.strategy,
        Math.floor(params.performanceFee * 100).toString(), // Convert to basis points
        Math.floor(params.managementFee * 100).toString(), // Convert to basis points
        formatAptAmount(params.minInvestment).toString(),
        params.maxInvestors.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Deposit funds into a vault
   */
  async depositToVault(vaultId: number, amount: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.FUNCTIONS.DEPOSIT_TO_VAULT}` as `${string}::${string}::${string}`,
      functionArguments: [
        vaultId.toString(),
        formatAptAmount(amount).toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Withdraw funds from a vault
   */
  async withdrawFromVault(vaultId: number, sharesToRedeem: number): Promise<InputGenerateTransactionPayloadData> {
    // sharesToRedeem is already in decimal format (e.g., 0.5 for 0.5 shares)
    // Convert to the smallest unit (8 decimals for APT)
    const sharesInSmallestUnit = Math.floor(sharesToRedeem * 1e8);
    
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.FUNCTIONS.WITHDRAW_FROM_VAULT}` as `${string}::${string}::${string}`,
      functionArguments: [
        vaultId.toString(),
        sharesInSmallestUnit.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Execute a trade (manager only)
   */
  async executeTrade(params: ExecuteTradeParams): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.FUNCTIONS.EXECUTE_TRADE}` as `${string}::${string}::${string}`,
      functionArguments: [
        params.vaultId.toString(),
        params.action,
        formatAptAmount(params.amount).toString(),
        params.price.toString(),
        formatAptAmount(params.profitAmount).toString(),
        params.isProfit,
        params.description,
        this.moduleOwner,
      ],
    });
  }

  /**
   * Pause vault (manager only)
   */
  async pauseVault(vaultId: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.FUNCTIONS.PAUSE_VAULT}` as `${string}::${string}::${string}`,
      functionArguments: [
        vaultId.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Resume vault (manager only)
   */
  async resumeVault(vaultId: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.FUNCTIONS.RESUME_VAULT}` as `${string}::${string}::${string}`,
      functionArguments: [
        vaultId.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Collect fees from vault
   */
  async collectFees(vaultId: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.FUNCTIONS.COLLECT_FEES}` as `${string}::${string}::${string}`,
      functionArguments: [
        vaultId.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Get vault information
   */
  async getVaultInfo(vaultId: number): Promise<Vault | null> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.VIEWS.GET_VAULT_INFO}` as `${string}::${string}::${string}`,
        functionArguments: [vaultId.toString(), this.moduleOwner],
      });

      if (!result) return null;

      return {
        vaultId: Number(result.vault_id),
        manager: result.manager,
        name: result.name,
        description: result.description,
        strategy: result.strategy,
        totalShares: parseAptAmount(result.total_shares),
        totalValue: parseAptAmount(result.total_value),
        highWaterMark: parseAptAmount(result.high_water_mark),
        performanceFee: Number(result.performance_fee) / 100, // Convert from basis points
        managementFee: Number(result.management_fee) / 100, // Convert from basis points
        lastFeeCollection: Number(result.last_fee_collection),
        status: Number(result.status),
        createdAt: Number(result.created_at),
        minInvestment: parseAptAmount(result.min_investment),
        maxInvestors: Number(result.max_investors),
        currentInvestors: Number(result.current_investors),
      };
    } catch (error) {
      console.error("Error fetching vault info:", error);
      return null;
    }
  }

  /**
   * Get vault balance
   */
  async getVaultBalance(vaultId: number): Promise<number> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.VIEWS.GET_VAULT_BALANCE}` as `${string}::${string}::${string}`,
        functionArguments: [vaultId.toString(), this.moduleOwner],
      });

      return parseAptAmount(result);
    } catch (error) {
      console.error("Error fetching vault balance:", error);
      return 0;
    }
  }

  /**
   * Get investor shares in a vault
   */
  async getInvestorShares(vaultId: number, investor: string): Promise<number> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.VIEWS.GET_INVESTOR_SHARES}` as `${string}::${string}::${string}`,
        functionArguments: [vaultId.toString(), investor, this.moduleOwner],
      });

      return parseAptAmount(result);
    } catch (error) {
      console.error("Error fetching investor shares:", error);
      return 0;
    }
  }

  /**
   * Get user's invested vaults
   */
  async getUserVaults(user: string): Promise<number[]> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.VIEWS.GET_USER_VAULTS}` as `${string}::${string}::${string}`,
        functionArguments: [user, this.moduleOwner],
      });

      return result.map((id: string) => Number(id));
    } catch (error) {
      console.error("Error fetching user vaults:", error);
      return [];
    }
  }

  /**
   * Get manager's vaults
   */
  async getManagerVaults(manager: string): Promise<number[]> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.VIEWS.GET_MANAGER_VAULTS}` as `${string}::${string}::${string}`,
        functionArguments: [manager, this.moduleOwner],
      });

      return result.map((id: string) => Number(id));
    } catch (error) {
      console.error("Error fetching manager vaults:", error);
      return [];
    }
  }

  /**
   * Get total value locked in all vaults
   */
  async getTotalValueLocked(): Promise<number> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.VIEWS.GET_TOTAL_VALUE_LOCKED}` as `${string}::${string}::${string}`,
        functionArguments: [this.moduleOwner],
      });

      return parseAptAmount(result);
    } catch (error) {
      console.error("Error fetching TVL:", error);
      return 0;
    }
  }

  /**
   * Get vault performance
   */
  async getVaultPerformance(vaultId: number): Promise<{ totalValue: number; pnl: number; isPositive: boolean }> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.VAULT.MODULE}::${CONTRACTS.VAULT.VIEWS.GET_VAULT_PERFORMANCE}` as `${string}::${string}::${string}`,
        functionArguments: [vaultId.toString(), this.moduleOwner],
      });

      return {
        totalValue: parseAptAmount(result[0]),
        pnl: parseAptAmount(result[1]),
        isPositive: result[2],
      };
    } catch (error) {
      console.error("Error fetching vault performance:", error);
      return { totalValue: 0, pnl: 0, isPositive: false };
    }
  }

  /**
   * Calculate investor value in vault
   */
  calculateInvestorValue(shares: number, vault: Vault): number {
    if (vault.totalShares === 0) return 0;
    return (shares * vault.totalValue) / vault.totalShares;
  }

  /**
   * Get vault status label
   */
  getStatusLabel(status: number): string {
    switch (status) {
      case VAULT_STATUS.ACTIVE:
        return "Active";
      case VAULT_STATUS.PAUSED:
        return "Paused";
      case VAULT_STATUS.CLOSED:
        return "Closed";
      default:
        return "Unknown";
    }
  }

  /**
   * Calculate APY based on performance
   */
  calculateAPY(vault: Vault, performance: { pnl: number; isPositive: boolean }): number {
    if (!performance.isPositive || vault.totalValue === 0) return 0;
    
    const daysSinceCreation = (Date.now() / 1000 - vault.createdAt) / 86400;
    if (daysSinceCreation === 0) return 0;
    
    const dailyReturn = performance.pnl / vault.totalValue / daysSinceCreation;
    return Math.pow(1 + dailyReturn, 365) - 1;
  }
}

export const vaultService = new VaultService();