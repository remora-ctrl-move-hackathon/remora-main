"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { offRampService, OffRampRequest, CreateOffRampParams, SubmitKYCParams } from "@/services/offramp.service";
import toast from "react-hot-toast";

export function useOffRamp() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [userRequests, setUserRequests] = useState<OffRampRequest[]>([]);
  const [kycStatus, setKycStatus] = useState<{ verified: boolean; level: number }>({ verified: false, level: 0 });
  const [dailyVolume, setDailyVolume] = useState<number>(0);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  // Fetch user's off-ramp data
  const fetchUserData = useCallback(async () => {
    if (!account) return;

    try {
      setLoading(true);
      
      // Get user's requests
      const requestIds = await offRampService.getUserRequests(account.address);
      const requestsData = await Promise.all(
        requestIds.map(id => offRampService.getRequestInfo(id))
      );
      setUserRequests(requestsData.filter(r => r !== null) as OffRampRequest[]);

      // Get KYC status
      const kyc = await offRampService.getUserKYCStatus(account.address);
      setKycStatus(kyc);

      // Get daily volume
      const volume = await offRampService.getUserDailyVolume(account.address);
      setDailyVolume(volume);

      // Get exchange rates for common currencies
      const currencies = ["NGN", "USD", "GBP", "EUR"];
      const rates: Record<string, number> = {};
      for (const currency of currencies) {
        try {
          rates[currency] = await offRampService.getExchangeRate(currency);
        } catch {
          rates[currency] = 0;
        }
      }
      setExchangeRates(rates);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Submit KYC
  const submitKYC = useCallback(async (params: SubmitKYCParams) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await offRampService.submitKYC(params);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("KYC submitted successfully! Please wait for verification.");
      
      // Refresh user data
      await fetchUserData();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error submitting KYC:", error);
      toast.error(error.message || "Failed to submit KYC");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserData]);

  // Create off-ramp request
  const createOffRampRequest = useCallback(async (params: CreateOffRampParams) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await offRampService.createOffRampRequest(params);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fiatAmount = offRampService.calculateFiatAmount(
        params.aptAmount, 
        exchangeRates[params.currency] || 0
      );
      
      toast.success(`Off-ramp request created! You will receive ${fiatAmount.toFixed(2)} ${params.currency}`);
      
      // Refresh user data
      await fetchUserData();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error creating off-ramp request:", error);
      toast.error(error.message || "Failed to create off-ramp request");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, kycStatus, exchangeRates, fetchUserData]);

  // Cancel off-ramp request
  const cancelOffRampRequest = useCallback(async (requestId: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await offRampService.cancelOffRampRequest(requestId);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Off-ramp request cancelled successfully!");
      
      // Refresh user data
      await fetchUserData();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error cancelling off-ramp request:", error);
      toast.error(error.message || "Failed to cancel off-ramp request");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserData]);

  // Get exchange rate for a specific currency
  const getExchangeRate = useCallback(async (currency: string): Promise<number> => {
    try {
      const rate = await offRampService.getExchangeRate(currency);
      setExchangeRates(prev => ({ ...prev, [currency]: rate }));
      return rate;
    } catch (error) {
      console.error("Error getting exchange rate:", error);
      return 0;
    }
  }, []);

  // Calculate estimated fiat amount
  const calculateEstimate = useCallback((aptAmount: number, currency: string) => {
    const rate = exchangeRates[currency] || 0;
    const serviceFee = offRampService.calculateServiceFee(aptAmount);
    const fiatAmount = offRampService.calculateFiatAmount(aptAmount, rate);
    
    return {
      aptAmount,
      serviceFee,
      netAptAmount: aptAmount - serviceFee,
      exchangeRate: rate,
      fiatAmount,
      currency,
    };
  }, [exchangeRates]);

  // Check if user can make a request
  const canMakeRequest = useCallback((aptAmount: number): { canRequest: boolean; reason?: string } => {
    if (!kycStatus.verified) {
      return { canRequest: false, reason: "KYC verification required" };
    }

    if (aptAmount < 100) {
      return { canRequest: false, reason: "Minimum amount is 100 APT" };
    }

    if (aptAmount > 100000) {
      return { canRequest: false, reason: "Maximum amount is 100,000 APT per transaction" };
    }

    if (dailyVolume + aptAmount > 500000) {
      return { canRequest: false, reason: "Daily limit of 500,000 APT would be exceeded" };
    }

    return { canRequest: true };
  }, [kycStatus, dailyVolume]);

  // Auto-fetch data when account changes
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    loading,
    userRequests,
    kycStatus,
    dailyVolume,
    exchangeRates,
    submitKYC,
    createOffRampRequest,
    cancelOffRampRequest,
    getExchangeRate,
    calculateEstimate,
    canMakeRequest,
    fetchUserData,
    offRampService,
  };
}