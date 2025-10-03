import type { MerkleClient } from "@merkletrade/ts-sdk";
import type { Account, Aptos, InputEntryFunctionData } from "@aptos-labs/ts-sdk";

interface Position {
  pairType: string;
  size: bigint;
  collateral: bigint;
  isLong: boolean;
  entryPrice: bigint;
}

interface CopyTraderConfig {
  merkle: MerkleClient;
  aptos: Aptos;
  account: Account;
  vaultId: number;
  moduleAddress: string;
  leadTrader: string;
}

export class VaultCopyTrader {
  private merkle: MerkleClient;
  private aptos: Aptos;
  private account: Account;
  private vaultId: number;
  private moduleAddress: string;
  private leadTrader: string;
  private lastPositions: Map<string, Position> = new Map();
  private isMonitoring = false;

  constructor(config: CopyTraderConfig) {
    this.merkle = config.merkle;
    this.aptos = config.aptos;
    this.account = config.account;
    this.vaultId = config.vaultId;
    this.moduleAddress = config.moduleAddress;
    this.leadTrader = config.leadTrader;
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      console.log("⚠️  Already monitoring");
      return;
    }

    this.isMonitoring = true;
    console.log(`👀 Monitoring lead trader: ${this.leadTrader}`);

    try {
      // Connect to WebSocket
      const session = await this.merkle.connectWsApi();
      console.log("✅ Connected to Merkle WebSocket");

      // Get initial positions
      await this.syncInitialPositions();

      // Subscribe to account feed for real-time updates
      const accountFeed = session.subscribeAccountFeed(this.leadTrader);
      console.log("✅ Subscribed to account feed");

      // Listen for updates
      for await (const update of accountFeed) {
        await this.handleAccountUpdate(update);
      }
    } catch (error) {
      console.error("❌ WebSocket error:", error);
      this.isMonitoring = false;

      // Retry after 10 seconds
      console.log("🔄 Retrying in 10 seconds...");
      setTimeout(() => this.startMonitoring(), 10000);
    }
  }

  private async syncInitialPositions() {
    console.log("📊 Syncing initial positions...");

    try {
      const positions = await this.merkle.getPositions({
        address: this.leadTrader,
      });

      console.log(`Found ${positions.length} open positions`);

      // Store current positions
      for (const position of positions) {
        this.lastPositions.set(position.pairType, {
          pairType: position.pairType,
          size: BigInt(position.size),
          collateral: BigInt(position.collateral),
          isLong: position.isLong,
          entryPrice: BigInt(position.entryPrice),
        });

        console.log(
          `  📍 ${position.pairType}: ${position.isLong ? "LONG" : "SHORT"} ${Number(position.size) / 1e6} USDC`
        );
      }
    } catch (error) {
      console.error("Error syncing positions:", error);
    }
  }

  private async handleAccountUpdate(update: any) {
    console.log("\n📨 Account update received:", update.type);

    try {
      // Fetch latest positions to detect changes
      const currentPositions = await this.merkle.getPositions({
        address: this.leadTrader,
      });

      // Detect new or modified positions
      for (const position of currentPositions) {
        const lastPosition = this.lastPositions.get(position.pairType);

        if (!lastPosition) {
          // New position opened
          console.log(
            `🆕 NEW POSITION: ${position.pairType} ${position.isLong ? "LONG" : "SHORT"}`
          );
          await this.replicatePosition(position);
        } else if (lastPosition.size !== BigInt(position.size)) {
          // Position size changed (increased or decreased)
          console.log(
            `📈 POSITION MODIFIED: ${position.pairType} ${Number(lastPosition.size) / 1e6} → ${Number(position.size) / 1e6} USDC`
          );
          await this.replicatePositionChange(lastPosition, position);
        }

        // Update stored position
        this.lastPositions.set(position.pairType, {
          pairType: position.pairType,
          size: BigInt(position.size),
          collateral: BigInt(position.collateral),
          isLong: position.isLong,
          entryPrice: BigInt(position.entryPrice),
        });
      }

      // Detect closed positions
      for (const [pairType, lastPosition] of this.lastPositions.entries()) {
        const stillOpen = currentPositions.find((p) => p.pairType === pairType);

        if (!stillOpen) {
          console.log(`❌ POSITION CLOSED: ${pairType}`);
          await this.closePosition(lastPosition);
          this.lastPositions.delete(pairType);
        }
      }
    } catch (error) {
      console.error("Error handling account update:", error);
    }
  }

  private async replicatePosition(position: any) {
    console.log(
      `🔄 Replicating position: ${position.pairType} ${position.isLong ? "LONG" : "SHORT"}`
    );

    try {
      // Get vault's total value to calculate proportional size
      const vaultValue = await this.getVaultTotalValue();
      const proportionalSize = this.calculateProportionalSize(
        BigInt(position.size),
        vaultValue
      );

      console.log(
        `  💰 Lead trader size: ${Number(position.size) / 1e6} USDC`
      );
      console.log(
        `  💰 Vault proportional size: ${Number(proportionalSize) / 1e6} USDC`
      );

      // Place market order via Merkle
      const pair = position.pairType.replace("0x1::pair::", "");
      const orderPayload = this.merkle.payloads.placeMarketOrder({
        pair,
        userAddress: this.account.accountAddress,
        sizeDelta: proportionalSize,
        collateralDelta: BigInt(Math.floor(Number(proportionalSize) * 0.1)), // 10% collateral
        isLong: position.isLong,
        isIncrease: true,
      });

      // Execute transaction
      const txHash = await this.sendTransaction(orderPayload);
      console.log(`  ✅ Position replicated! Tx: ${txHash}`);

      // Record trade in vault contract
      await this.recordTradeInVault(
        pair,
        Number(proportionalSize),
        position.entryPrice,
        0,
        true
      );
    } catch (error) {
      console.error("Error replicating position:", error);
    }
  }

  private async replicatePositionChange(
    lastPosition: Position,
    newPosition: any
  ) {
    const sizeDelta = BigInt(newPosition.size) - lastPosition.size;
    const isIncrease = sizeDelta > 0n;

    console.log(
      `🔄 Replicating position change: ${newPosition.pairType} ${isIncrease ? "+" : ""}${Number(sizeDelta) / 1e6} USDC`
    );

    try {
      const vaultValue = await this.getVaultTotalValue();
      const proportionalDelta = this.calculateProportionalSize(
        sizeDelta > 0n ? sizeDelta : -sizeDelta,
        vaultValue
      );

      const pair = newPosition.pairType.replace("0x1::pair::", "");
      const orderPayload = this.merkle.payloads.placeMarketOrder({
        pair,
        userAddress: this.account.accountAddress,
        sizeDelta: proportionalDelta,
        collateralDelta: BigInt(
          Math.floor(Number(proportionalDelta) * 0.1)
        ),
        isLong: newPosition.isLong,
        isIncrease,
      });

      const txHash = await this.sendTransaction(orderPayload);
      console.log(`  ✅ Position change replicated! Tx: ${txHash}`);
    } catch (error) {
      console.error("Error replicating position change:", error);
    }
  }

  private async closePosition(position: Position) {
    console.log(`🔄 Closing position: ${position.pairType}`);

    try {
      const pair = position.pairType.replace("0x1::pair::", "");
      const orderPayload = this.merkle.payloads.placeMarketOrder({
        pair,
        userAddress: this.account.accountAddress,
        sizeDelta: position.size,
        collateralDelta: position.collateral,
        isLong: position.isLong,
        isIncrease: false,
      });

      const txHash = await this.sendTransaction(orderPayload);
      console.log(`  ✅ Position closed! Tx: ${txHash}`);
    } catch (error) {
      console.error("Error closing position:", error);
    }
  }

  private calculateProportionalSize(
    leaderSize: bigint,
    vaultValue: bigint
  ): bigint {
    // For now, use 1:1 scaling based on vault total value
    // In production, you might want more sophisticated risk management
    return leaderSize;
  }

  private async getVaultTotalValue(): Promise<bigint> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.moduleAddress}::vault::get_vault_balance` as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [
            this.vaultId.toString(),
            this.moduleAddress,
          ],
        },
      });

      return BigInt(result[0] as string);
    } catch (error) {
      console.error("Error getting vault value:", error);
      return 0n;
    }
  }

  private async recordTradeInVault(
    action: string,
    amount: number,
    price: bigint,
    profitAmount: number,
    isProfit: boolean
  ) {
    try {
      const payload: InputEntryFunctionData = {
        function: `${this.moduleAddress}::vault::execute_trade` as `${string}::${string}::${string}`,
        typeArguments: [],
        functionArguments: [
          this.vaultId.toString(),
          action,
          amount.toString(),
          price.toString(),
          profitAmount.toString(),
          isProfit,
          `Copy-trade: ${action}`,
          this.moduleAddress,
        ],
      };

      await this.sendTransaction(payload);
    } catch (error) {
      console.error("Error recording trade in vault:", error);
    }
  }

  private async sendTransaction(
    payload: InputEntryFunctionData
  ): Promise<string> {
    const transaction = await this.aptos.transaction.build.simple({
      sender: this.account.accountAddress,
      data: payload,
    });

    const { hash } = await this.aptos.signAndSubmitTransaction({
      signer: this.account,
      transaction,
    });

    await this.aptos.waitForTransaction({ transactionHash: hash });
    return hash;
  }
}
