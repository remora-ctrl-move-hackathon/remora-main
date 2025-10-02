"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { streamingService, Stream, CreateStreamParams } from "@/services/streaming.service";
import { useSponsoredTransactions } from "@/hooks/useSponsoredTransactions";
import { CONTRACTS } from "@/config/aptos";
import toast from "react-hot-toast";

export function useStreaming() {
  const { account, signAndSubmitTransaction } = useWallet();
  const { executeSponsoredTransaction, isSponsored } = useSponsoredTransactions();
  const [loading, setLoading] = useState(false);
  const [sentStreams, setSentStreams] = useState<Stream[]>([]);
  const [receivedStreams, setReceivedStreams] = useState<Stream[]>([]);
  const [totalLocked, setTotalLocked] = useState<number>(0);

  // Add throttling for API calls
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const FETCH_COOLDOWN = 10000; // 10 seconds minimum between fetches

  // Fetch user's streams with throttling
  const fetchUserStreams = useCallback(async (force = false) => {
    if (!account) return;

    const now = Date.now();
    if (!force && (now - lastFetchTime) < FETCH_COOLDOWN) {
      console.log("Skipping fetch due to cooldown");
      return;
    }

    try {
      setLoading(true);
      setLastFetchTime(now);
      
      // Get sent stream IDs
      const sentIds = await streamingService.getUserSentStreams(account.address);
      const sentStreamData = await Promise.all(
        sentIds.map(id => streamingService.getStreamInfo(id))
      );
      setSentStreams(sentStreamData.filter(s => s !== null) as Stream[]);

      // Get received stream IDs
      const receivedIds = await streamingService.getUserReceivedStreams(account.address);
      const receivedStreamData = await Promise.all(
        receivedIds.map(id => streamingService.getStreamInfo(id))
      );
      setReceivedStreams(receivedStreamData.filter(s => s !== null) as Stream[]);

      // Get total locked
      const locked = await streamingService.getTotalLockedAmount();
      setTotalLocked(locked);
    } catch (error: any) {
      console.error("Error fetching streams:", error);
      // Don't show error toast for rate limit issues
      if (!error.message?.includes("rate limit")) {
        toast.error("Failed to fetch stream data");
      }
    } finally {
      setLoading(false);
    }
  }, [account, lastFetchTime]);

  // Create a new stream with sponsored transaction support
  const createStream = useCallback(async (params: CreateStreamParams) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await streamingService.createStream(params);
      
      console.log("Transaction payload:", payload); // Debug log
      
      let txHash: string | undefined;
      
      // Try sponsored transaction first
      if (isSponsored) {
        const sponsoredTxHash = await executeSponsoredTransaction(payload, {
          showToast: false,
          functionName: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.FUNCTIONS.CREATE_STREAM}`,
        });
        
        if (sponsoredTxHash) {
          txHash = sponsoredTxHash;
          toast.success(
            <div>
              <div>Stream created successfully!</div>
              <div className="text-xs text-muted-foreground mt-1">
                Gas fees sponsored ✨
              </div>
            </div>
          );
        }
      }
      
      // Fallback to regular transaction if sponsored fails
      if (!txHash) {
        const response = await signAndSubmitTransaction({
          data: payload,
        });
        txHash = response.hash;
        toast.success("Stream created successfully!");
      }

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh streams
      await fetchUserStreams();
      
      return txHash;
    } catch (error: any) {
      console.error("Error creating stream:", error);
      toast.error(error.message || "Failed to create stream");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, executeSponsoredTransaction, isSponsored, fetchUserStreams]);

  // Withdraw from stream
  const withdrawFromStream = useCallback(async (streamId: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      
      // Check withdrawable amount first
      const withdrawable = await streamingService.getWithdrawableAmount(streamId);
      if (withdrawable <= 0) {
        toast.error("No funds available to withdraw");
        return;
      }

      const payload = await streamingService.withdrawFromStream(streamId);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Withdrawn ${withdrawable.toFixed(4)} APT successfully!`);
      
      // Refresh streams
      await fetchUserStreams();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error withdrawing from stream:", error);
      toast.error(error.message || "Failed to withdraw from stream");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserStreams]);

  // Pause stream
  const pauseStream = useCallback(async (streamId: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await streamingService.pauseStream(streamId);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Stream paused successfully!");
      
      // Refresh streams
      await fetchUserStreams();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error pausing stream:", error);
      toast.error(error.message || "Failed to pause stream");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserStreams]);

  // Resume stream
  const resumeStream = useCallback(async (streamId: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await streamingService.resumeStream(streamId);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Stream resumed successfully!");
      
      // Refresh streams
      await fetchUserStreams();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error resuming stream:", error);
      toast.error(error.message || "Failed to resume stream");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserStreams]);

  // Cancel stream
  const cancelStream = useCallback(async (streamId: number) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await streamingService.cancelStream(streamId);
      
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Stream cancelled successfully!");
      
      // Refresh streams
      await fetchUserStreams();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error cancelling stream:", error);
      toast.error(error.message || "Failed to cancel stream");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserStreams]);

  // Get withdrawable amount for a stream
  const getWithdrawableAmount = useCallback(async (streamId: number): Promise<number> => {
    try {
      return await streamingService.getWithdrawableAmount(streamId);
    } catch (error) {
      console.error("Error getting withdrawable amount:", error);
      return 0;
    }
  }, []);

  // Auto-fetch streams when account changes
  useEffect(() => {
    fetchUserStreams();
  }, [fetchUserStreams]);

  return {
    loading,
    sentStreams,
    receivedStreams,
    totalLocked,
    createStream,
    withdrawFromStream,
    pauseStream,
    resumeStream,
    cancelStream,
    getWithdrawableAmount,
    fetchUserStreams,
    streamingService,
  };
}