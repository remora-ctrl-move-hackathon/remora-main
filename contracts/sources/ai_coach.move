module remora::ai_coach {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use aptos_std::table::{Self, Table};
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::object::{Self, Object};

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_COACH_NOT_FOUND: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;
    const E_COACH_ALREADY_EXISTS: u64 = 4;
    const E_INSUFFICIENT_STAKE: u64 = 5;
    const E_INVALID_AMOUNT: u64 = 6;
    const E_COACH_INACTIVE: u64 = 7;
    const E_NO_STAKES: u64 = 8;
    const E_COOLDOWN_ACTIVE: u64 = 9;
    const E_INVALID_FEE: u64 = 10;

    /// Constants
    const MIN_STAKE: u64 = 1000000;        // 0.01 APT minimum stake
    const COACH_CREATION_FEE: u64 = 10000000; // 0.1 APT to create coach
    const PERFORMANCE_FEE: u64 = 1000;     // 10% of profits go to coach creator
    const FEE_DENOMINATOR: u64 = 10000;
    const UNSTAKE_COOLDOWN: u64 = 86400;   // 24 hours in seconds
    const MAX_PROMPT_LENGTH: u64 = 2000;
    const MAX_STAKES_PER_USER: u64 = 20;

    /// Coach status
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_PAUSED: u8 = 2;
    const STATUS_TERMINATED: u8 = 3;

    /// AI Coach NFT - represents a unique trading strategy
    struct AICoach has key, store {
        coach_id: u64,
        creator: address,
        name: String,
        description: String,
        strategy_prompt: String,    // AI prompt/rules for trading
        model_type: String,          // "GPT-4", "Claude-3.5", etc.
        created_at: u64,
        status: u8,

        // Performance metrics
        total_trades: u64,
        winning_trades: u64,
        total_pnl: u64,
        is_pnl_positive: bool,
        sharpe_ratio: u64,           // Multiplied by 100 for precision
        max_drawdown: u64,

        // Staking info
        total_staked: u64,
        staker_count: u64,

        // Fees
        accumulated_fees: u64,

        // Ranking
        rank: u64,
        score: u64,                  // Performance score for ranking
    }

    /// Stake represents a user's investment in an AI coach
    struct Stake has store, copy, drop {
        staker: address,
        coach_id: u64,
        amount: u64,
        staked_at: u64,
        last_claim: u64,
        initial_pnl: u64,            // Coach P&L when stake started
        realized_profit: u64,
        unstake_request_time: u64,   // 0 if no pending unstake
    }

    /// Trade explanation - natural language reasoning
    struct TradeExplanation has store, copy, drop {
        coach_id: u64,
        timestamp: u64,
        pair: String,
        action: String,              // "OPEN LONG", "CLOSE SHORT", etc.
        reasoning: String,           // AI's explanation
        confidence: u64,             // 0-100
        entry_price: u64,
        position_size: u64,
        expected_target: u64,
        stop_loss: u64,
    }

    /// Global registry of all coaches
    struct CoachRegistry has key {
        coaches: Table<u64, Object<AICoach>>,
        creator_coaches: Table<address, vector<u64>>,
        user_stakes: Table<address, vector<Stake>>,
        trade_history: Table<u64, vector<TradeExplanation>>,
        leaderboard: vector<u64>,    // Sorted by score

        next_coach_id: u64,
        total_coaches: u64,
        total_staked: u64,
        platform_fees: Coin<AptosCoin>,

        // Events
        coach_created_events: EventHandle<CoachCreatedEvent>,
        stake_events: EventHandle<StakeEvent>,
        unstake_events: EventHandle<UnstakeEvent>,
        trade_events: EventHandle<TradeExecutedEvent>,
        ranking_events: EventHandle<RankingUpdateEvent>,
    }

    /// Events
    struct CoachCreatedEvent has drop, store {
        coach_id: u64,
        creator: address,
        name: String,
        model_type: String,
        timestamp: u64,
    }

    struct StakeEvent has drop, store {
        coach_id: u64,
        staker: address,
        amount: u64,
        timestamp: u64,
    }

    struct UnstakeEvent has drop, store {
        coach_id: u64,
        staker: address,
        amount: u64,
        profit: u64,
        timestamp: u64,
    }

    struct TradeExecutedEvent has drop, store {
        coach_id: u64,
        pair: String,
        action: String,
        reasoning: String,
        timestamp: u64,
    }

    struct RankingUpdateEvent has drop, store {
        coach_id: u64,
        old_rank: u64,
        new_rank: u64,
        score: u64,
        timestamp: u64,
    }

    /// Initialize the AI coach module
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<CoachRegistry>(addr), E_COACH_ALREADY_EXISTS);

        move_to(account, CoachRegistry {
            coaches: table::new(),
            creator_coaches: table::new(),
            user_stakes: table::new(),
            trade_history: table::new(),
            leaderboard: vector::empty(),
            next_coach_id: 1,
            total_coaches: 0,
            total_staked: 0,
            platform_fees: coin::zero<AptosCoin>(),
            coach_created_events: account::new_event_handle<CoachCreatedEvent>(account),
            stake_events: account::new_event_handle<StakeEvent>(account),
            unstake_events: account::new_event_handle<UnstakeEvent>(account),
            trade_events: account::new_event_handle<TradeExecutedEvent>(account),
            ranking_events: account::new_event_handle<RankingUpdateEvent>(account),
        });
    }

    /// Create a new AI coach
    public entry fun create_coach(
        creator: &signer,
        name: String,
        description: String,
        strategy_prompt: String,
        model_type: String,
    ) acquires CoachRegistry {
        let creator_addr = signer::address_of(creator);
        let registry_addr = @remora;
        assert!(exists<CoachRegistry>(registry_addr), E_NOT_INITIALIZED);

        // Withdraw creation fee from creator
        let creation_fee = coin::withdraw<AptosCoin>(creator, COACH_CREATION_FEE);

        // Validate prompt length
        assert!(string::length(&strategy_prompt) <= MAX_PROMPT_LENGTH, E_INVALID_AMOUNT);

        let registry = borrow_global_mut<CoachRegistry>(registry_addr);
        let coach_id = registry.next_coach_id;

        // Create coach object
        let coach_constructor_ref = object::create_object(creator_addr);
        let coach_signer = object::generate_signer(&coach_constructor_ref);

        move_to(&coach_signer, AICoach {
            coach_id,
            creator: creator_addr,
            name,
            description,
            strategy_prompt,
            model_type,
            created_at: timestamp::now_seconds(),
            status: STATUS_ACTIVE,
            total_trades: 0,
            winning_trades: 0,
            total_pnl: 0,
            is_pnl_positive: true,
            sharpe_ratio: 0,
            max_drawdown: 0,
            total_staked: 0,
            staker_count: 0,
            accumulated_fees: 0,
            rank: 0,
            score: 0,
        });

        let coach_obj = object::object_from_constructor_ref<AICoach>(&coach_constructor_ref);

        // Add to registry
        table::add(&mut registry.coaches, coach_id, coach_obj);

        // Track creator's coaches
        if (!table::contains(&registry.creator_coaches, creator_addr)) {
            table::add(&mut registry.creator_coaches, creator_addr, vector::empty());
        };
        let creator_list = table::borrow_mut(&mut registry.creator_coaches, creator_addr);
        vector::push_back(creator_list, coach_id);

        // Initialize trade history
        table::add(&mut registry.trade_history, coach_id, vector::empty());

        // Collect creation fee
        coin::merge(&mut registry.platform_fees, creation_fee);

        registry.next_coach_id = coach_id + 1;
        registry.total_coaches = registry.total_coaches + 1;

        // Emit event
        event::emit_event(
            &mut registry.coach_created_events,
            CoachCreatedEvent {
                coach_id,
                creator: creator_addr,
                name: string::utf8(b"Coach created"),
                model_type,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Stake tokens to activate and follow a coach
    public entry fun stake_to_coach(
        staker: &signer,
        coach_id: u64,
        stake_value: u64,
    ) acquires CoachRegistry, AICoach {
        let staker_addr = signer::address_of(staker);
        let registry_addr = @remora;
        assert!(exists<CoachRegistry>(registry_addr), E_NOT_INITIALIZED);

        let registry = borrow_global_mut<CoachRegistry>(registry_addr);
        assert!(table::contains(&registry.coaches, coach_id), E_COACH_NOT_FOUND);
        assert!(stake_value >= MIN_STAKE, E_INSUFFICIENT_STAKE);

        // Withdraw stake from user
        let stake_amount = coin::withdraw<AptosCoin>(staker, stake_value);

        // Get coach
        let coach_obj = table::borrow(&registry.coaches, coach_id);
        let coach = borrow_global_mut<AICoach>(object::object_address(coach_obj));
        assert!(coach.status == STATUS_ACTIVE, E_COACH_INACTIVE);

        // Create stake record
        let stake = Stake {
            staker: staker_addr,
            coach_id,
            amount: stake_value,
            staked_at: timestamp::now_seconds(),
            last_claim: timestamp::now_seconds(),
            initial_pnl: coach.total_pnl,
            realized_profit: 0,
            unstake_request_time: 0,
        };

        // Add to user stakes
        if (!table::contains(&registry.user_stakes, staker_addr)) {
            table::add(&mut registry.user_stakes, staker_addr, vector::empty());
        };
        let user_stakes = table::borrow_mut(&mut registry.user_stakes, staker_addr);
        assert!(vector::length(user_stakes) < MAX_STAKES_PER_USER, E_INVALID_AMOUNT);
        vector::push_back(user_stakes, stake);

        // Update coach stats
        coach.total_staked = coach.total_staked + stake_value;
        coach.staker_count = coach.staker_count + 1;

        // Merge stake into platform (held for coach)
        registry.total_staked = registry.total_staked + stake_value;
        coin::merge(&mut registry.platform_fees, stake_amount);

        // Emit event
        event::emit_event(
            &mut registry.stake_events,
            StakeEvent {
                coach_id,
                staker: staker_addr,
                amount: stake_value,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Record a trade execution with AI reasoning
    public entry fun record_trade(
        executor: &signer,
        coach_id: u64,
        pair: String,
        action: String,
        reasoning: String,
        confidence: u64,
        entry_price: u64,
        position_size: u64,
        expected_target: u64,
        stop_loss: u64,
    ) acquires CoachRegistry, AICoach {
        let executor_addr = signer::address_of(executor);
        let registry_addr = @remora;
        assert!(exists<CoachRegistry>(registry_addr), E_NOT_INITIALIZED);

        let registry = borrow_global_mut<CoachRegistry>(registry_addr);
        assert!(table::contains(&registry.coaches, coach_id), E_COACH_NOT_FOUND);

        let coach_obj = table::borrow(&registry.coaches, coach_id);
        let coach = borrow_global_mut<AICoach>(object::object_address(coach_obj));

        // Only coach creator can record trades
        assert!(executor_addr == coach.creator, E_UNAUTHORIZED);
        assert!(coach.status == STATUS_ACTIVE, E_COACH_INACTIVE);

        // Create trade explanation
        let trade_explanation = TradeExplanation {
            coach_id,
            timestamp: timestamp::now_seconds(),
            pair,
            action,
            reasoning,
            confidence,
            entry_price,
            position_size,
            expected_target,
            stop_loss,
        };

        // Add to trade history
        let history = table::borrow_mut(&mut registry.trade_history, coach_id);
        vector::push_back(history, trade_explanation);

        // Update coach stats
        coach.total_trades = coach.total_trades + 1;

        // Emit event
        event::emit_event(
            &mut registry.trade_events,
            TradeExecutedEvent {
                coach_id,
                pair,
                action,
                reasoning,
                timestamp: timestamp::now_seconds(),
            }
        );
    }

    /// Update coach performance after trade closes
    public entry fun update_performance(
        updater: &signer,
        coach_id: u64,
        trade_pnl: u64,
        is_profit: bool,
        is_winning_trade: bool,
    ) acquires CoachRegistry, AICoach {
        let updater_addr = signer::address_of(updater);
        let registry_addr = @remora;
        assert!(exists<CoachRegistry>(registry_addr), E_NOT_INITIALIZED);

        let registry = borrow_global_mut<CoachRegistry>(registry_addr);
        assert!(table::contains(&registry.coaches, coach_id), E_COACH_NOT_FOUND);

        let coach_obj = table::borrow(&registry.coaches, coach_id);
        let coach = borrow_global_mut<AICoach>(object::object_address(coach_obj));

        assert!(updater_addr == coach.creator, E_UNAUTHORIZED);

        // Update P&L
        if (is_profit) {
            coach.total_pnl = coach.total_pnl + trade_pnl;
            coach.is_pnl_positive = true;
        } else {
            if (coach.total_pnl >= trade_pnl) {
                coach.total_pnl = coach.total_pnl - trade_pnl;
            } else {
                coach.total_pnl = trade_pnl - coach.total_pnl;
                coach.is_pnl_positive = false;
            };
        };

        // Update win rate
        if (is_winning_trade) {
            coach.winning_trades = coach.winning_trades + 1;
        };

        // Calculate new score (simplified)
        let win_rate = if (coach.total_trades > 0) {
            (coach.winning_trades * 100) / coach.total_trades
        } else { 0 };

        coach.score = win_rate * coach.total_pnl / 1000000; // Normalize

        // TODO: Update leaderboard ranking
    }

    /// View functions

    #[view]
    public fun get_coach_info(coach_id: u64): (
        address,    // creator
        String,     // name
        u64,        // total_trades
        u64,        // winning_trades
        u64,        // total_pnl
        bool,       // is_pnl_positive
        u64,        // total_staked
        u64,        // rank
    ) acquires CoachRegistry, AICoach {
        let registry = borrow_global<CoachRegistry>(@remora);
        assert!(table::contains(&registry.coaches, coach_id), E_COACH_NOT_FOUND);

        let coach_obj = table::borrow(&registry.coaches, coach_id);
        let coach = borrow_global<AICoach>(object::object_address(coach_obj));

        (
            coach.creator,
            coach.name,
            coach.total_trades,
            coach.winning_trades,
            coach.total_pnl,
            coach.is_pnl_positive,
            coach.total_staked,
            coach.rank
        )
    }

    #[view]
    public fun get_total_coaches(): u64 acquires CoachRegistry {
        let registry = borrow_global<CoachRegistry>(@remora);
        registry.total_coaches
    }

    #[view]
    public fun get_total_staked(): u64 acquires CoachRegistry {
        let registry = borrow_global<CoachRegistry>(@remora);
        registry.total_staked
    }
}
