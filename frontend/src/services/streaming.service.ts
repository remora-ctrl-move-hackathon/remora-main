import { aptosClient } from "@/lib/aptos-client";
import { 
  CONTRACTS, 
  MODULE_ADDRESS,
  formatAptAmount,
  parseAptAmount,
  STREAM_STATUS
} from "@/config/aptos";
import type { InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk";

export interface Stream {
  streamId: number;
  sender: string;
  receiver: string;
  amountPerSecond: number;
  totalAmount: number;
  startTime: number;
  endTime: number;
  lastWithdrawalTime: number;
  withdrawnAmount: number;
  status: number;
  streamName: string;
}

export interface CreateStreamParams {
  receiver: string;
  totalAmount: number; // in APT
  durationSeconds: number;
  streamName: string;
}

export class StreamingService {
  private moduleOwner: string = MODULE_ADDRESS;

  /**
   * Initialize the streaming module (admin only)
   */
  async initialize(): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.FUNCTIONS.INITIALIZE}` as `${string}::${string}::${string}`,
      functionArguments: [],
    });
  }

  /**
   * Create a new payment stream
   */
  async createStream(params: CreateStreamParams): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.FUNCTIONS.CREATE_STREAM}` as `${string}::${string}::${string}`,
      functionArguments: [
        params.receiver,
        formatAptAmount(params.totalAmount).toString(),
        params.durationSeconds,
        params.streamName,
        this.moduleOwner,
      ],
    });
  }

  /**
   * Withdraw available funds from a stream
   */
  async withdrawFromStream(streamId: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.FUNCTIONS.WITHDRAW_FROM_STREAM}` as `${string}::${string}::${string}`,
      functionArguments: [
        streamId.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Pause a stream (sender only)
   */
  async pauseStream(streamId: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.FUNCTIONS.PAUSE_STREAM}` as `${string}::${string}::${string}`,
      functionArguments: [
        streamId.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Resume a paused stream (sender only)
   */
  async resumeStream(streamId: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.FUNCTIONS.RESUME_STREAM}` as `${string}::${string}::${string}`,
      functionArguments: [
        streamId.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Cancel a stream and refund remaining amount (sender only)
   */
  async cancelStream(streamId: number): Promise<InputGenerateTransactionPayloadData> {
    return aptosClient.buildTransaction({
      function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.FUNCTIONS.CANCEL_STREAM}` as `${string}::${string}::${string}`,
      functionArguments: [
        streamId.toString(),
        this.moduleOwner,
      ],
    });
  }

  /**
   * Get stream information
   */
  async getStreamInfo(streamId: number): Promise<Stream | null> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.VIEWS.GET_STREAM_INFO}` as `${string}::${string}::${string}`,
        functionArguments: [streamId.toString(), this.moduleOwner],
      });

      if (!result) return null;

      return {
        streamId: Number(result.stream_id),
        sender: result.sender,
        receiver: result.receiver,
        amountPerSecond: parseAptAmount(result.amount_per_second),
        totalAmount: parseAptAmount(result.total_amount),
        startTime: Number(result.start_time),
        endTime: Number(result.end_time),
        lastWithdrawalTime: Number(result.last_withdrawal_time),
        withdrawnAmount: parseAptAmount(result.withdrawn_amount),
        status: Number(result.status),
        streamName: result.stream_name,
      };
    } catch (error) {
      console.error("Error fetching stream info:", error);
      return null;
    }
  }

  /**
   * Get withdrawable amount from a stream
   */
  async getWithdrawableAmount(streamId: number): Promise<number> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.VIEWS.GET_WITHDRAWABLE_AMOUNT}` as `${string}::${string}::${string}`,
        functionArguments: [streamId.toString(), this.moduleOwner],
      });

      return parseAptAmount(result);
    } catch (error) {
      console.error("Error fetching withdrawable amount:", error);
      return 0;
    }
  }

  /**
   * Get user's sent streams
   */
  async getUserSentStreams(userAddress: string): Promise<number[]> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.VIEWS.GET_USER_SENT_STREAMS}` as `${string}::${string}::${string}`,
        functionArguments: [userAddress, this.moduleOwner],
      });

      return result.map((id: string) => Number(id));
    } catch (error) {
      console.error("Error fetching sent streams:", error);
      return [];
    }
  }

  /**
   * Get user's received streams
   */
  async getUserReceivedStreams(userAddress: string): Promise<number[]> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.VIEWS.GET_USER_RECEIVED_STREAMS}` as `${string}::${string}::${string}`,
        functionArguments: [userAddress, this.moduleOwner],
      });

      return result.map((id: string) => Number(id));
    } catch (error) {
      console.error("Error fetching received streams:", error);
      return [];
    }
  }

  /**
   * Get total locked amount in all streams
   */
  async getTotalLockedAmount(): Promise<number> {
    try {
      const result = await aptosClient.viewFunction({
        function: `${CONTRACTS.STREAMING.MODULE}::${CONTRACTS.STREAMING.VIEWS.GET_TOTAL_LOCKED_AMOUNT}` as `${string}::${string}::${string}`,
        functionArguments: [this.moduleOwner],
      });

      return parseAptAmount(result);
    } catch (error) {
      console.error("Error fetching total locked amount:", error);
      return 0;
    }
  }

  /**
   * Get stream status label
   */
  getStatusLabel(status: number): string {
    switch (status) {
      case STREAM_STATUS.ACTIVE:
        return "Active";
      case STREAM_STATUS.PAUSED:
        return "Paused";
      case STREAM_STATUS.CANCELLED:
        return "Cancelled";
      case STREAM_STATUS.COMPLETED:
        return "Completed";
      default:
        return "Unknown";
    }
  }

  /**
   * Calculate stream progress percentage
   */
  calculateProgress(stream: Stream): number {
    const now = Date.now() / 1000;
    const duration = stream.endTime - stream.startTime;
    const elapsed = Math.min(now - stream.startTime, duration);
    return (elapsed / duration) * 100;
  }
}

export const streamingService = new StreamingService();