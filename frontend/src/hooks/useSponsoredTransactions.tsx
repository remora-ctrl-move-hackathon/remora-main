import React, { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { sponsoredTransactions } from "@/services/sponsored-transactions.service";
import toast from "react-hot-toast";

interface SponsorStats {
  totalSponsored: number;
  gasSpent: number;
  dailyLimit: number;
  dailyUsed: number;
  isEnabled: boolean;
}

export function useSponsoredTransactions() {
  const { account, signTransaction } = useWallet();
  const [sponsorStats, setSponsorStats] = useState<SponsorStats>({
    totalSponsored: 0,
    gasSpent: 0,
    dailyLimit: 0,
    dailyUsed: 0,
    isEnabled: false,
  });
  const [loading, setLoading] = useState(false);

  // Check if sponsored transactions are enabled
  useEffect(() => {
    const checkSponsorship = async () => {
      const isEnabled = sponsoredTransactions.isEnabled();
      
      if (isEnabled) {
        const stats = await sponsoredTransactions.getSponsorStats();
        setSponsorStats({
          ...stats,
          isEnabled,
        });
      } else {
        setSponsorStats(prev => ({ ...prev, isEnabled: false }));
      }
    };

    checkSponsorship();
  }, []);

  /**
   * Execute a sponsored transaction
   */
  const executeSponsoredTransaction = useCallback(async (
    payload: any,
    options?: {
      showToast?: boolean;
      functionName?: string;
    }
  ): Promise<string | null> => {
    if (!account || !signTransaction) {
      toast.error("Please connect your wallet");
      return null;
    }

    if (!sponsorStats.isEnabled) {
      console.log("Sponsored transactions not available, falling back to regular transaction");
      return null;
    }

    // Check if this transaction can be sponsored
    const fullFunctionName = payload.function || options?.functionName;
    if (fullFunctionName) {
      const canSponsor = await sponsoredTransactions.canSponsorTransaction(
        fullFunctionName,
        account.address
      );

      if (!canSponsor) {
        console.log(`Transaction ${fullFunctionName} not eligible for sponsorship`);
        return null;
      }
    }

    setLoading(true);
    try {
      // Create the sponsored transaction
      const transaction = await sponsoredTransactions.createSponsoredTransaction(
        payload,
        account.address
      );

      if (!transaction) {
        throw new Error("Failed to create sponsored transaction");
      }

      // Sign the transaction (user still needs to sign, but doesn't pay gas)
      const authenticator = await signTransaction(transaction);

      // Submit the sponsored transaction
      const txHash = await sponsoredTransactions.submitSponsoredTransaction(
        transaction,
        authenticator
      );

      if (!txHash) {
        throw new Error("Failed to submit sponsored transaction");
      }

      if (options?.showToast) {
        toast.success(
          <div>
            <div>Transaction successful!</div>
            <div className="text-xs text-muted-foreground mt-1">
              Gas fees sponsored ✨
            </div>
          </div>
        );
      }

      // Update stats
      const newStats = await sponsoredTransactions.getSponsorStats();
      setSponsorStats(prev => ({ ...prev, ...newStats }));

      return txHash;
    } catch (error: any) {
      console.error("Sponsored transaction error:", error);
      
      if (options?.showToast) {
        toast.error(error.message || "Failed to execute sponsored transaction");
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [account, signTransaction, sponsorStats.isEnabled]);

  /**
   * Check if a specific function can be sponsored
   */
  const canSponsor = useCallback(async (
    functionName: string
  ): Promise<boolean> => {
    if (!account || !sponsorStats.isEnabled) {
      return false;
    }

    return await sponsoredTransactions.canSponsorTransaction(
      functionName,
      account.address
    );
  }, [account, sponsorStats.isEnabled]);

  /**
   * Get estimated gas savings for the user
   */
  const getGasSavings = useCallback((transactionCount: number) => {
    return sponsoredTransactions.estimateGasSavings(transactionCount);
  }, []);

  return {
    sponsorStats,
    loading,
    executeSponsoredTransaction,
    canSponsor,
    getGasSavings,
    isSponsored: sponsorStats.isEnabled,
  };
}