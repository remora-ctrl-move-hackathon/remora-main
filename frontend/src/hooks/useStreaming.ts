"use client";

import { useState, useCallback, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { streamingService, Stream, CreateStreamParams } from "@/services/streaming.service";
import toast from "react-hot-toast";

export function useStreaming() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [sentStreams, setSentStreams] = useState<Stream[]>([]);
  const [receivedStreams, setReceivedStreams] = useState<Stream[]>([]);
  const [totalLocked, setTotalLocked] = useState<number>(0);

  // Fetch user's streams
  const fetchUserStreams = useCallback(async () => {
    if (!account) return;

    try {
      setLoading(true);
      
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
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setLoading(false);
    }
  }, [account]);

  // Create a new stream
  const createStream = useCallback(async (params: CreateStreamParams) => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      const payload = await streamingService.createStream(params);
      
      console.log("Transaction payload:", payload); // Debug log
      
      // The wallet adapter expects the payload directly
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Stream created successfully!");
      
      // Refresh streams
      await fetchUserStreams();
      
      return response.hash;
    } catch (error: any) {
      console.error("Error creating stream:", error);
      toast.error(error.message || "Failed to create stream");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [account, signAndSubmitTransaction, fetchUserStreams]);

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