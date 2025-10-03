import { AptosClient } from './aptos-client';
import { MODULE_ADDRESS } from '@/config/aptos';
import { InputGenerateTransactionPayloadData } from '@aptos-labs/ts-sdk';

export interface AICoach {
  coach_id: number;
  creator: string;
  name: string;
  total_trades: number;
  winning_trades: number;
  total_pnl: number;
  is_pnl_positive: boolean;
  total_staked: number;
  rank: number;
  win_rate: number;
  sharpe_ratio: number;
}

export interface TradeExplanation {
  coach_id: number;
  timestamp: number;
  pair: string;
  action: string;
  reasoning: string;
  confidence: number;
  entry_price: number;
  position_size: number;
  expected_target: number;
  stop_loss: number;
}

export interface CreateCoachParams {
  name: string;
  description: string;
  strategy_prompt: string;
  model_type: string; // "GPT-4", "Claude-3.5", "Gemini-Pro"
}

export interface StakeParams {
  coach_id: number;
  stake_amount: number; // in APT (octas)
}

export interface RecordTradeParams {
  coach_id: number;
  pair: string;
  action: string; // "OPEN LONG", "CLOSE SHORT", etc.
  reasoning: string;
  confidence: number; // 0-100
  entry_price: number;
  position_size: number;
  expected_target: number;
  stop_loss: number;
}

export class AICoachService {
  private client: AptosClient;

  constructor() {
    this.client = new AptosClient();
  }

  /**
   * Create a new AI coach
   */
  async createCoach(params: CreateCoachParams): Promise<InputGenerateTransactionPayloadData> {
    return {
      function: `${MODULE_ADDRESS}::ai_coach::create_coach`,
      functionArguments: [
        params.name,
        params.description,
        params.strategy_prompt,
        params.model_type,
      ],
    };
  }

  /**
   * Stake to follow an AI coach
   */
  async stakeToCoach(params: StakeParams): Promise<InputGenerateTransactionPayloadData> {
    return {
      function: `${MODULE_ADDRESS}::ai_coach::stake_to_coach`,
      functionArguments: [
        params.coach_id,
        params.stake_amount,
      ],
    };
  }

  /**
   * Record a trade execution with AI reasoning
   */
  async recordTrade(params: RecordTradeParams): Promise<InputGenerateTransactionPayloadData> {
    return {
      function: `${MODULE_ADDRESS}::ai_coach::record_trade`,
      functionArguments: [
        params.coach_id,
        params.pair,
        params.action,
        params.reasoning,
        params.confidence,
        params.entry_price,
        params.position_size,
        params.expected_target,
        params.stop_loss,
      ],
    };
  }

  /**
   * Update coach performance after trade closes
   */
  async updatePerformance(
    coachId: number,
    tradePnl: number,
    isProfit: boolean,
    isWinningTrade: boolean
  ): Promise<InputGenerateTransactionPayloadData> {
    return {
      function: `${MODULE_ADDRESS}::ai_coach::update_performance`,
      functionArguments: [
        coachId,
        tradePnl,
        isProfit,
        isWinningTrade,
      ],
    };
  }

  /**
   * Get coach information
   */
  async getCoachInfo(coachId: number): Promise<AICoach> {
    const result = await this.client.viewFunction({
      function: `${MODULE_ADDRESS}::ai_coach::get_coach_info`,
      functionArguments: [coachId],
    });

    const [
      creator,
      name,
      total_trades,
      winning_trades,
      total_pnl,
      is_pnl_positive,
      total_staked,
      rank,
    ] = result as [string, string, string, string, string, boolean, string, string];

    const totalTrades = parseInt(total_trades);
    const winningTrades = parseInt(winning_trades);
    const win_rate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return {
      coach_id: coachId,
      creator,
      name,
      total_trades: totalTrades,
      winning_trades: winningTrades,
      total_pnl: parseInt(total_pnl),
      is_pnl_positive,
      total_staked: parseInt(total_staked),
      rank: parseInt(rank),
      win_rate,
      sharpe_ratio: 0, // TODO: Calculate from trade history
    };
  }

  /**
   * Get total number of coaches
   */
  async getTotalCoaches(): Promise<number> {
    const result = await this.client.viewFunction({
      function: `${MODULE_ADDRESS}::ai_coach::get_total_coaches`,
      functionArguments: [],
    });
    return parseInt(result[0] as string);
  }

  /**
   * Get total staked across all coaches
   */
  async getTotalStaked(): Promise<number> {
    const result = await this.client.viewFunction({
      function: `${MODULE_ADDRESS}::ai_coach::get_total_staked`,
      functionArguments: [],
    });
    return parseInt(result[0] as string);
  }

  /**
   * Get all coaches (iterate through coach IDs)
   */
  async getAllCoaches(): Promise<AICoach[]> {
    try {
      const totalCoaches = await this.getTotalCoaches();
      const coaches: AICoach[] = [];

      // Fetch coaches in parallel (batch of 10)
      const batchSize = 10;
      for (let i = 1; i <= totalCoaches; i += batchSize) {
        const promises = [];
        for (let j = i; j < Math.min(i + batchSize, totalCoaches + 1); j++) {
          promises.push(
            this.getCoachInfo(j).catch(() => null) // Handle missing coaches
          );
        }
        const results = await Promise.all(promises);
        coaches.push(...results.filter((c): c is AICoach => c !== null));
      }

      return coaches;
    } catch (error) {
      console.error('Error fetching all coaches:', error);
      return [];
    }
  }

  /**
   * Get leaderboard (top coaches by performance)
   */
  async getLeaderboard(limit: number = 10): Promise<AICoach[]> {
    const coaches = await this.getAllCoaches();

    // Sort by score (win_rate * total_pnl)
    return coaches
      .map(coach => ({
        ...coach,
        score: coach.win_rate * coach.total_pnl / 1000000,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Format APT amount from octas
   */
  formatAPT(octas: number): string {
    return (octas / 100000000).toFixed(2);
  }

  /**
   * Convert APT to octas
   */
  toOctas(apt: number): number {
    return Math.floor(apt * 100000000);
  }
}

export const aiCoachService = new AICoachService();
