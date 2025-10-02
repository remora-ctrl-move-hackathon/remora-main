"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { vaultService, Vault, CreateVaultParams, ExecuteTradeParams } from "@/services/vault.service";
import { gasStation } from "@/services/gas-station.service";
import toast from "react-hot-toast";

export function useVault() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [userVaults, setUserVaults] = useState<Vault[]>([]);
  const [managedVaults, setManagedVaults] = useState<Vault[]>([]);
  const [totalValueLocked, setTotalValueLocked] = useState<number>(0);

  // Helper function to submit transaction with gas station support
  const submitTransaction = async (payload: any, successMessage?: string) => {
    if (!signAndSubmitTransaction) {
      throw new Error("Wallet not connected");
    }

    let response;
    
    // Check if gas station is enabled for vault transactions
    if (gasStation.isEnabled() && gasStation.isFunctionSponsored(payload.function)) {
      try {
        // Attempt to use gas station for sponsored transaction
        const txHash = await gasStation.submitSponsoredTransaction(
          payload,
          { signAndSubmitTransaction },
        );
        response = { hash: txHash };
        
        // Show success message with sponsored indicator
        if (successMessage) {
          toast.success(
            <div>
              <div>{successMessage}</div>
              <div className="text-xs opacity-75 mt-1">✨ Gas fees sponsored</div>
            </div>
          );
        }
      } catch (sponsorError) {
        // Fallback to regular transaction if sponsoring fails
        console.warn("Gas station sponsoring failed, using regular transaction:", sponsorError);
        response = await signAndSubmitTransaction({
          data: payload,
        });
        if (successMessage) {
          toast.success(successMessage);
        }
      }
    } else {
      // Use regular transaction
      response = await signAndSubmitTransaction({
        data: payload,
      });
      if (successMessage) {
        toast.success(successMessage);
      }
    }
    
    return response;
  };

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
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.createVault(params);
      
      const response = await submitTransaction(
        payload, 
        "Vault created successfully!"
      );

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
  }, [account, submitTransaction, fetchUserVaults]);

  // Deposit to vault
  const depositToVault = useCallback(async (vaultId: number, amount: number) => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.depositToVault(vaultId, amount);
      
      const response = await submitTransaction(
        payload,
        `Deposited ${amount} APT successfully!`
      );

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
  }, [account, submitTransaction, fetchUserVaults]);

  // Withdraw from vault
  const withdrawFromVault = useCallback(async (vaultId: number, shares: number) => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.withdrawFromVault(vaultId, shares);
      
      const response = await submitTransaction(
        payload,
        "Withdrawal successful!"
      );

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
  }, [account, submitTransaction, fetchUserVaults]);

  // Execute trade (manager only)
  const executeTrade = useCallback(async (params: ExecuteTradeParams) => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.executeTrade(params);
      
      const response = await submitTransaction(
        payload,
        "Trade executed successfully!"
      );

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
  }, [account, submitTransaction, fetchUserVaults]);

  // Pause vault (manager only)
  const pauseVault = useCallback(async (vaultId: number) => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.pauseVault(vaultId);
      
      const response = await submitTransaction(
        payload,
        "Vault paused successfully!"
      );

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
  }, [account, submitTransaction, fetchUserVaults]);

  // Resume vault (manager only)
  const resumeVault = useCallback(async (vaultId: number) => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await vaultService.resumeVault(vaultId);
      
      const response = await submitTransaction(
        payload,
        "Vault resumed successfully!"
      );

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
  }, [account, submitTransaction, fetchUserVaults]);

  // Get investor shares
  const getInvestorShares = useCallback(async (vaultId: number, investor: string) => {
    try {
      return await vaultService.getInvestorShares(vaultId, investor);
    } catch (error) {
      console.error("Error getting investor shares:", error);
      return 0;
    }
  }, []);

  // Check if gas station is available
  const isGasStationEnabled = useCallback(() => {
    return gasStation.isEnabled();
  }, []);

  // Get gas station stats
  const getGasStationStats = useCallback(async () => {
    return await gasStation.getStats();
  }, []);

  // Load initial data
  useEffect(() => {
    if (account) {
      fetchUserVaults();
    }
  }, [account, fetchUserVaults]);

  return {
    loading,
    userVaults,
    managedVaults,
    totalValueLocked,
    createVault,
    depositToVault,
    withdrawFromVault,
    executeTrade,
    pauseVault,
    resumeVault,
    getInvestorShares,
    fetchUserVaults,
    isGasStationEnabled,
    getGasStationStats,
  };
}