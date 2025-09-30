import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Contract addresses - Update these after deployment
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS || "0xCAFE";
export const MODULE_NAME = "remora";

// Initialize Aptos client
const config = new AptosConfig({
  network: Network.TESTNET,
});

export const aptos = new Aptos(config);

// Contract function names
export const CONTRACTS = {
  STREAMING: {
    MODULE: `${MODULE_ADDRESS}::streaming`,
    FUNCTIONS: {
      INITIALIZE: "initialize",
      CREATE_STREAM: "create_stream",
      WITHDRAW_FROM_STREAM: "withdraw_from_stream",
      PAUSE_STREAM: "pause_stream",
      RESUME_STREAM: "resume_stream",
      CANCEL_STREAM: "cancel_stream",
    },
    VIEWS: {
      GET_STREAM_INFO: "get_stream_info",
      GET_WITHDRAWABLE_AMOUNT: "get_withdrawable_amount",
      GET_USER_SENT_STREAMS: "get_user_sent_streams",
      GET_USER_RECEIVED_STREAMS: "get_user_received_streams",
      GET_TOTAL_LOCKED_AMOUNT: "get_total_locked_amount",
    },
  },
  VAULT: {
    MODULE: `${MODULE_ADDRESS}::vault`,
    FUNCTIONS: {
      INITIALIZE: "initialize",
      CREATE_VAULT: "create_vault",
      DEPOSIT_TO_VAULT: "deposit_to_vault",
      WITHDRAW_FROM_VAULT: "withdraw_from_vault",
      EXECUTE_TRADE: "execute_trade",
      PAUSE_VAULT: "pause_vault",
      RESUME_VAULT: "resume_vault",
      COLLECT_FEES: "collect_fees",
    },
    VIEWS: {
      GET_VAULT_INFO: "get_vault_info",
      GET_VAULT_BALANCE: "get_vault_balance",
      GET_INVESTOR_SHARES: "get_investor_shares",
      GET_USER_VAULTS: "get_user_vaults",
      GET_MANAGER_VAULTS: "get_manager_vaults",
      GET_TOTAL_VALUE_LOCKED: "get_total_value_locked",
      GET_VAULT_PERFORMANCE: "get_vault_performance",
    },
  },
  OFFRAMP: {
    MODULE: `${MODULE_ADDRESS}::offramp`,
    FUNCTIONS: {
      INITIALIZE: "initialize",
      SUBMIT_KYC: "submit_kyc",
      VERIFY_KYC: "verify_kyc",
      UPDATE_EXCHANGE_RATE: "update_exchange_rate",
      CREATE_OFFRAMP_REQUEST: "create_offramp_request",
      PROCESS_OFFRAMP_REQUEST: "process_offramp_request",
      CANCEL_OFFRAMP_REQUEST: "cancel_offramp_request",
      REJECT_OFFRAMP_REQUEST: "reject_offramp_request",
      ADD_PROCESSOR: "add_processor",
      REMOVE_PROCESSOR: "remove_processor",
    },
    VIEWS: {
      GET_REQUEST_INFO: "get_request_info",
      GET_USER_REQUESTS: "get_user_requests",
      GET_EXCHANGE_RATE: "get_exchange_rate",
      GET_USER_KYC_STATUS: "get_user_kyc_status",
      GET_USER_DAILY_VOLUME: "get_user_daily_volume",
      GET_TREASURY_BALANCE: "get_treasury_balance",
      GET_STATS: "get_stats",
    },
  },
};

// Helper to format APT amounts (8 decimals)
export const formatAptAmount = (amount: number): bigint => {
  return BigInt(Math.floor(amount * 100_000_000));
};

export const parseAptAmount = (amount: bigint | string): number => {
  return Number(amount) / 100_000_000;
};

// Stream status constants
export const STREAM_STATUS = {
  ACTIVE: 1,
  PAUSED: 2,
  CANCELLED: 3,
  COMPLETED: 4,
} as const;

// Vault status constants
export const VAULT_STATUS = {
  ACTIVE: 1,
  PAUSED: 2,
  CLOSED: 3,
} as const;

// Off-ramp request status constants
export const OFFRAMP_STATUS = {
  PENDING: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  REJECTED: 5,
} as const;