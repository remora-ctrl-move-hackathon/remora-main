"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { vaultService, Vault, CreateVaultParams, ExecuteTradeParams } from "@/services/vault.service";
import toast from "react-hot-toast";

export function useVault() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [userVaults, setUserVaults] = useState<Vault[]>([]);
  const [managedVaults, setManagedVaults] = useState<Vault[]>([]);
  const [allVaults, setAllVaults] = useState<Vault[]>([]);
  const [totalValueLocked, setTotalValueLocked] = useState<number>(0);

  // Fetch all vaults globally
  const fetchAllVaults = useCallback(async () => {
    try {
      setLoading(true);
      const vaults = await vaultService.getAllVaults(100);
      setAllVaults(vaults);

      const tvl = await vaultService.getTotalValueLocked();
      setTotalValueLocked(tvl);
    } catch (error) {
      console.error("Error fetching all vaults:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's vaults
  const fetchUserVaults = useCallback(async () => {
    if (!account) return;

    try {
      setLoading(true);
      
      // Get user's invested vaults
      const investedIds = await vaultService.getUserVaults(account.address);
      const investedVaultsData = await Promise.all(
        investedIds.map(id => vaultService.getVaultInfo(id))
      );
      setUserVaults(investedVaultsData.filter(v => v !== null) as Vault[]);

      // Get managed vaults
      const managedIds = await vaultService.getManagerVaults(account.address);
      const managedVaultsData = await Promise.all(
        managedIds.map(id => vaultService.getVaultInfo(id))
      );
      setManagedVaults(managedVaultsData.filter(v => v !== null) as Vault[]);

      // Get TVL
      const tvl = await vaultService.getTotalValueLocked();
      setTotalValueLocked(tvl);
    } catch (error) {
      console.error("Error fetching vaults:", error);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Create a new vault
  const createVault = useCallback(async (params: CreateVaultParams) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.createVault(params);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Vault created successfully!");
      
      // Refresh vaults
      await fetchUserVaults();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error creating vault:", error);
      toast.error(error.message || "Failed to create vault");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserVaults]);

  // Deposit to vault
  const depositToVault = useCallback(async (vaultId: number, amount: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.depositToVault(vaultId, amount);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Deposited ${amount} APT successfully!`);
      
      // Refresh vaults
      await fetchUserVaults();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error depositing to vault:", error);
      toast.error(error.message || "Failed to deposit to vault");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserVaults]);

  // Withdraw from vault
  const withdrawFromVault = useCallback(async (vaultId: number, shares: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.withdrawFromVault(vaultId, shares);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Withdrawal successful!");
      
      // Refresh vaults
      await fetchUserVaults();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error withdrawing from vault:", error);
      toast.error(error.message || "Failed to withdraw from vault");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserVaults]);

  // Execute trade (manager only)
  const executeTrade = useCallback(async (params: ExecuteTradeParams) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.executeTrade(params);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Trade executed successfully!");
      
      // Refresh vaults
      await fetchUserVaults();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error executing trade:", error);
      toast.error(error.message || "Failed to execute trade");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserVaults]);

  // Pause vault (manager only)
  const pauseVault = useCallback(async (vaultId: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.pauseVault(vaultId);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Vault paused successfully!");
      
      // Refresh vaults
      await fetchUserVaults();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error pausing vault:", error);
      toast.error(error.message || "Failed to pause vault");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserVaults]);

  // Resume vault (manager only)
  const resumeVault = useCallback(async (vaultId: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.resumeVault(vaultId);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Vault resumed successfully!");
      
      // Refresh vaults
      await fetchUserVaults();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error resuming vault:", error);
      toast.error(error.message || "Failed to resume vault");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserVaults]);

  // Get vault info
  const getVaultInfo = useCallback(async (vaultId: number): Promise<Vault | null> => {
    try {
      return await vaultService.getVaultInfo(vaultId);
    } catch (error) {
      console.error("Error getting vault info:", error);
      return null;
    }
  }, []);

  // Get investor shares
  const getInvestorShares = useCallback(async (vaultId: number): Promise<number> => {
    if (!account) return 0;
    
    try {
      return await vaultService.getInvestorShares(vaultId, account.address);
    } catch (error) {
      console.error("Error getting investor shares:", error);
      return 0;
    }
  }, [account]);

  // Get vault performance
  const getVaultPerformance = useCallback(async (vaultId: number) => {
    try {
      return await vaultService.getVaultPerformance(vaultId);
    } catch (error) {
      console.error("Error getting vault performance:", error);
      return { totalValue: 0, pnl: 0, isPositive: false };
    }
  }, []);

  // Auto-fetch vaults when account changes
  useEffect(() => {
    fetchUserVaults();
  }, [fetchUserVaults]);

  // Fetch all vaults on mount
  useEffect(() => {
    fetchAllVaults();
  }, [fetchAllVaults]);

  return {
    loading,
    userVaults,
    managedVaults,
    allVaults,
    totalValueLocked,
    createVault,
    depositToVault,
    withdrawFromVault,
    executeTrade,
    pauseVault,
    resumeVault,
    getVaultInfo,
    getInvestorShares,
    getVaultPerformance,
    fetchUserVaults,
    fetchAllVaults,
    vaultService,
  };
}