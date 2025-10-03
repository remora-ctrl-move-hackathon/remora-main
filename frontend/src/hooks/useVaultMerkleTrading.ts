"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { vaultMerkleTradingService } from "@/services/vault-merkle-trading.service";
import { OrderParams } from "@/services/perpetual-trading.service";
import { TradingPair } from "@/config/merkle";
import toast from "react-hot-toast";

export function useVaultMerkleTrading() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  /**
   * Execute a Merkle trade on behalf of a vault
   */
  const executeVaultTrade = useCallback(async (
    vaultId: number,
    merkleParams: OrderParams
  ) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);

      // Get transaction payloads
      const { merklePayload, vaultRecordPayload } = await vaultMerkleTradingService.executeVaultTrade(
        account.address,
        vaultId,
        merkleParams
      );

      // Execute Merkle trade first
      const merkleResponse = await signAndSubmitTransaction({
        data: merklePayload,
      });

      toast.success(`Merkle trade executed: ${merkleResponse.hash.slice(0, 10)}...`);

      // Wait a bit for Merkle trade to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record trade in vault
      const vaultResponse = await signAndSubmitTransaction({
        data: vaultRecordPayload,
      });

      toast.success(`Trade recorded in vault: ${vaultResponse.hash.slice(0, 10)}...`);

      return {
        merkleHash: merkleResponse.hash,
        vaultHash: vaultResponse.hash,
      };
    } catch (error: any) {
      console.error("Error executing vault trade:", error);
      toast.error(error.message || "Failed to execute vault trade");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction]);

  /**
   * Close a vault's Merkle position
   */
  const closeVaultPosition = useCallback(async (
    vaultId: number,
    pair: TradingPair,
    size: number
  ) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);

      const { merklePayload, vaultRecordPayload, pnl } = await vaultMerkleTradingService.closeVaultPosition(
        account.address,
        vaultId,
        pair,
        size
      );

      // Execute Merkle close
      const merkleResponse = await signAndSubmitTransaction({
        data: merklePayload,
      });

      toast.success(`Position closed: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)} USDC`);

      // Wait for settlement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record in vault
      const vaultResponse = await signAndSubmitTransaction({
        data: vaultRecordPayload,
      });

      return {
        merkleHash: merkleResponse.hash,
        vaultHash: vaultResponse.hash,
        pnl,
      };
    } catch (error: any) {
      console.error("Error closing vault position:", error);
      toast.error(error.message || "Failed to close position");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction]);

  /**
   * Get vault's active Merkle positions
   */
  const getVaultPositions = useCallback(async () => {
    if (!account) return [];

    try {
      return await vaultMerkleTradingService.getVaultPositions(account.address);
    } catch (error) {
      console.error("Error fetching vault positions:", error);
      return [];
    }
  }, [account]);

  /**
   * Calculate vault's total P&L
   */
  const calculateVaultPnL = useCallback(async () => {
    if (!account) {
      return { totalPnL: 0, isProfit: false, positionCount: 0, positions: [] };
    }

    try {
      return await vaultMerkleTradingService.calculateVaultPnL(account.address);
    } catch (error) {
      console.error("Error calculating vault P&L:", error);
      return { totalPnL: 0, isProfit: false, positionCount: 0, positions: [] };
    }
  }, [account]);

  return {
    loading,
    executeVaultTrade,
    closeVaultPosition,
    getVaultPositions,
    calculateVaultPnL,
  };
}
