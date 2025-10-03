import { perpetualTradingService, OrderParams } from './perpetual-trading.service';
import { vaultService, ExecuteTradeParams } from './vault.service';
import { InputGenerateTransactionPayloadData } from '@aptos-labs/ts-sdk';

/**
 * Integrated service for vault trading using Merkle
 * Combines Merkle perpetual trading with vault trade recording
 */
export class VaultMerkleTradingService {

  /**
   * Execute a Merkle trade on behalf of a vault
   * This will:
   * 1. Place the trade on Merkle
   * 2. Record it in the vault contract
   */
  async executeVaultTrade(
    userAddress: string,
    vaultId: number,
    merkleParams: OrderParams
  ): Promise<{
    merklePayload: InputGenerateTransactionPayloadData;
    vaultRecordPayload: InputGenerateTransactionPayloadData;
  }> {
    // Step 1: Build Merkle trade transaction
    const merklePayload = await perpetualTradingService.placeMarketOrder(
      userAddress,
      merkleParams
    );

    // Step 2: Build vault trade record transaction
    const vaultRecordPayload = await vaultService.executeTrade({
      vaultId,
      action: `${merkleParams.isIncrease ? 'OPEN' : 'CLOSE'} ${merkleParams.isLong ? 'LONG' : 'SHORT'} ${merkleParams.pair}`,
      amount: merkleParams.size,
      price: 0, // Will be filled with actual execution price
      profitAmount: 0, // Will be calculated based on position
      isProfit: true,
      description: `Merkle ${merkleParams.isIncrease ? 'opened' : 'closed'} ${merkleParams.pair} position`,
    });

    return {
      merklePayload,
      vaultRecordPayload
    };
  }

  /**
   * Calculate position details for vault recording
   */
  async getPositionDetails(userAddress: string, pair: string) {
    const positions = await perpetualTradingService.getUserPositions(userAddress);
    const position = positions.find(p => p.pair === pair);

    if (!position) {
      return null;
    }

    return {
      entryPrice: position.entryPrice,
      currentPrice: position.markPrice,
      pnl: position.pnl,
      isProfit: position.pnl > 0,
      size: position.size,
      collateral: position.collateral,
    };
  }

  /**
   * Close a vault's Merkle position and record it
   */
  async closeVaultPosition(
    userAddress: string,
    vaultId: number,
    pair: string,
    size: number
  ) {
    const positionDetails = await this.getPositionDetails(userAddress, pair);

    if (!positionDetails) {
      throw new Error(`No position found for ${pair}`);
    }

    // Build close order (opposite direction of current position)
    const position = (await perpetualTradingService.getUserPositions(userAddress))
      .find(p => p.pair === pair);

    if (!position) {
      throw new Error('Position not found');
    }

    const closeParams: OrderParams = {
      pair: pair as any,
      size,
      collateral: 0,
      isLong: !position.isLong, // Opposite direction to close
      isIncrease: false,
    };

    // Execute close trade on Merkle
    const merklePayload = await perpetualTradingService.placeMarketOrder(
      userAddress,
      closeParams
    );

    // Record in vault with P&L
    const vaultRecordPayload = await vaultService.executeTrade({
      vaultId,
      action: `CLOSE ${position.isLong ? 'LONG' : 'SHORT'} ${pair}`,
      amount: size,
      price: positionDetails.currentPrice,
      profitAmount: Math.abs(positionDetails.pnl),
      isProfit: positionDetails.pnl > 0,
      description: `Closed ${pair} position with ${positionDetails.pnl > 0 ? 'profit' : 'loss'} of ${Math.abs(positionDetails.pnl).toFixed(2)} USDC`,
    });

    return {
      merklePayload,
      vaultRecordPayload,
      pnl: positionDetails.pnl,
    };
  }

  /**
   * Get all active Merkle positions for a vault manager
   */
  async getVaultPositions(vaultManagerAddress: string) {
    return await perpetualTradingService.getUserPositions(vaultManagerAddress);
  }

  /**
   * Calculate total P&L across all vault positions
   */
  async calculateVaultPnL(vaultManagerAddress: string) {
    const positions = await this.getVaultPositions(vaultManagerAddress);
    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const isProfit = totalPnL > 0;

    return {
      totalPnL,
      isProfit,
      positionCount: positions.length,
      positions,
    };
  }
}

export const vaultMerkleTradingService = new VaultMerkleTradingService();
