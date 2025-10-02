module remora::vault {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use aptos_std::table::{Self, Table};
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_VAULT_NOT_FOUND: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;
    const E_VAULT_ALREADY_EXISTS: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_INVALID_AMOUNT: u64 = 6;
    const E_VAULT_PAUSED: u64 = 7;
    const E_VAULT_NOT_PAUSED: u64 = 8;
    const E_INVALID_FEE: u64 = 9;
    const E_WITHDRAWAL_TOO_LARGE: u64 = 10;
    const E_NO_PROFITS: u64 = 11;
    const E_COOLDOWN_ACTIVE: u64 = 12;

    /// Constants
    const MAX_PERFORMANCE_FEE: u64 = 3000; // 30%
    const MAX_MANAGEMENT_FEE: u64 = 500;   // 5%
    const FEE_DENOMINATOR: u64 = 10000;    // For basis points
    const MIN_DEPOSIT: u64 = 100;          // Minimum deposit amount
    const WITHDRAWAL_COOLDOWN: u64 = 60; // 1 minute in seconds

    /// Vault status
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_PAUSED: u8 = 2;
    const STATUS_CLOSED: u8 = 3;

    /// Trade struct for recording trading history
    struct Trade has store, copy, drop {
        timestamp: u64,
        action: String,
        amount: u64,
        price: u64,
        profit_amount: u64,
        is_profit: bool,
        description: String,
    }

    /// Investor struct
    struct Investor has store, copy, drop {
        address: address,
        shares: u64,
        deposited_amount: u64,
        last_deposit_time: u64,
        total_withdrawn: u64,
        realized_pnl: u64,
        is_pnl_positive: bool,
    }

    /// Vault struct
    struct Vault has store, copy, drop {
        vault_id: u64,
        manager: address,
        name: String,
        description: String,
        strategy: String,
        total_shares: u64,
        total_value: u64,
        high_water_mark: u64,
        performance_fee: u64,  // In basis points (e.g., 2000 = 20%)
        management_fee: u64,   // In basis points
        last_fee_collection: u64,
        status: u8,
        created_at: u64,
        min_investment: u64,
        max_investors: u64,
        current_investors: u64,
    }

    /// VaultStore - stores all vaults
    struct VaultStore has key {
        vaults: Table<u64, Vault>,
        vault_funds: Table<u64, Coin<AptosCoin>>,
        vault_investors: Table<u64, vector<Investor>>,
        vault_trades: Table<u64, vector<Trade>>,
        user_investments: Table<address, vector<u64>>,
        manager_vaults: Table<address, vector<u64>>,
        next_vault_id: u64,
        total_vaults_created: u64,
        total_value_locked: u64,
        create_vault_events: EventHandle<CreateVaultEvent>,
        deposit_events: EventHandle<DepositEvent>,
        withdraw_events: EventHandle<WithdrawEvent>,
        trade_events: EventHandle<TradeEvent>,
        fee_collection_events: EventHandle<FeeCollectionEvent>,
    }

    /// Events
    struct CreateVaultEvent has drop, store {
        vault_id: u64,
        manager: address,
        name: String,
        performance_fee: u64,
        management_fee: u64,
        timestamp: u64,
    }

    struct DepositEvent has drop, store {
        vault_id: u64,
        investor: address,
        amount: u64,
        shares_issued: u64,
        timestamp: u64,
    }

    struct WithdrawEvent has drop, store {
        vault_id: u64,
        investor: address,
        shares_redeemed: u64,
        amount: u64,
        timestamp: u64,
    }

    struct TradeEvent has drop, store {
        vault_id: u64,
        action: String,
        amount: u64,
        timestamp: u64,
    }

    struct FeeCollectionEvent has drop, store {
        vault_id: u64,
        performance_fee_collected: u64,
        management_fee_collected: u64,
        timestamp: u64,
    }

    /// Initialize the vault module
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<VaultStore>(addr), E_VAULT_ALREADY_EXISTS);

        let vault_store = VaultStore {
            vaults: table::new(),
            vault_funds: table::new(),
            vault_investors: table::new(),
            vault_trades: table::new(),
            user_investments: table::new(),
            manager_vaults: table::new(),
            next_vault_id: 1,
            total_vaults_created: 0,
            total_value_locked: 0,
            create_vault_events: account::new_event_handle<CreateVaultEvent>(account),
            deposit_events: account::new_event_handle<DepositEvent>(account),
            withdraw_events: account::new_event_handle<WithdrawEvent>(account),
            trade_events: account::new_event_handle<TradeEvent>(account),
            fee_collection_events: account::new_event_handle<FeeCollectionEvent>(account),
        };

        move_to(account, vault_store);
    }

    /// Create a new trading vault
    public entry fun create_vault(
        manager: &signer,
        name: String,
        description: String,
        strategy: String,
        performance_fee: u64,
        management_fee: u64,
        min_investment: u64,
        max_investors: u64,
        module_owner: address,
    ) acquires VaultStore {
        let manager_addr = signer::address_of(manager);
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        assert!(performance_fee <= MAX_PERFORMANCE_FEE, E_INVALID_FEE);
        assert!(management_fee <= MAX_MANAGEMENT_FEE, E_INVALID_FEE);

        let vault_store = borrow_global_mut<VaultStore>(module_owner);
        let vault_id = vault_store.next_vault_id;
        let current_time = timestamp::now_seconds();

        // Create new vault
        let vault = Vault {
            vault_id,
            manager: manager_addr,
            name,
            description,
            strategy,
            total_shares: 0,
            total_value: 0,
            high_water_mark: 0,
            performance_fee,
            management_fee,
            last_fee_collection: current_time,
            status: STATUS_ACTIVE,
            created_at: current_time,
            min_investment,
            max_investors,
            current_investors: 0,
        };

        // Store vault
        table::add(&mut vault_store.vaults, vault_id, vault);
        table::add(&mut vault_store.vault_funds, vault_id, coin::zero<AptosCoin>());
        table::add(&mut vault_store.vault_investors, vault_id, vector::empty());
        table::add(&mut vault_store.vault_trades, vault_id, vector::empty());

        // Update manager vaults
        if (!table::contains(&vault_store.manager_vaults, manager_addr)) {
            table::add(&mut vault_store.manager_vaults, manager_addr, vector::empty());
        };
        let manager_vaults = table::borrow_mut(&mut vault_store.manager_vaults, manager_addr);
        vector::push_back(manager_vaults, vault_id);

        // Update stats
        vault_store.next_vault_id = vault_id + 1;
        vault_store.total_vaults_created = vault_store.total_vaults_created + 1;

        // Emit event
        event::emit_event(&mut vault_store.create_vault_events, CreateVaultEvent {
            vault_id,
            manager: manager_addr,
            name: vault.name,
            performance_fee,
            management_fee,
            timestamp: current_time,
        });
    }

    /// Deposit funds into a vault
    public entry fun deposit_to_vault(
        investor: &signer,
        vault_id: u64,
        amount: u64,
        module_owner: address,
    ) acquires VaultStore {
        let investor_addr = signer::address_of(investor);
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        assert!(amount >= MIN_DEPOSIT, E_INVALID_AMOUNT);

        let vault_store = borrow_global_mut<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);

        let vault = table::borrow_mut(&mut vault_store.vaults, vault_id);
        assert!(vault.status == STATUS_ACTIVE, E_VAULT_PAUSED);
        assert!(amount >= vault.min_investment, E_INVALID_AMOUNT);

        // Calculate shares to issue
        let shares_to_issue = if (vault.total_shares == 0) {
            amount // First deposit, 1:1 ratio
        } else {
            (amount * vault.total_shares) / vault.total_value
        };

        // Transfer coins to vault
        let coins = coin::withdraw<AptosCoin>(investor, amount);
        let vault_coins = table::borrow_mut(&mut vault_store.vault_funds, vault_id);
        coin::merge(vault_coins, coins);

        // Update vault state
        vault.total_shares = vault.total_shares + shares_to_issue;
        vault.total_value = vault.total_value + amount;

        // Update or create investor record
        let investors = table::borrow_mut(&mut vault_store.vault_investors, vault_id);
        let investor_index = find_investor_index(investors, investor_addr);
        
        if (investor_index < vector::length(investors)) {
            // Update existing investor
            let investor_record = vector::borrow_mut(investors, investor_index);
            investor_record.shares = investor_record.shares + shares_to_issue;
            investor_record.deposited_amount = investor_record.deposited_amount + amount;
            investor_record.last_deposit_time = timestamp::now_seconds();
        } else {
            // New investor
            let new_investor = Investor {
                address: investor_addr,
                shares: shares_to_issue,
                deposited_amount: amount,
                last_deposit_time: timestamp::now_seconds(),
                total_withdrawn: 0,
                realized_pnl: 0,
                is_pnl_positive: true,
            };
            vector::push_back(investors, new_investor);
            vault.current_investors = vault.current_investors + 1;
        };

        // Update user investments
        if (!table::contains(&vault_store.user_investments, investor_addr)) {
            table::add(&mut vault_store.user_investments, investor_addr, vector::empty());
        };
        let user_vaults = table::borrow_mut(&mut vault_store.user_investments, investor_addr);
        if (!vector::contains(user_vaults, &vault_id)) {
            vector::push_back(user_vaults, vault_id);
        };

        // Update global TVL
        vault_store.total_value_locked = vault_store.total_value_locked + amount;

        // Emit event
        event::emit_event(&mut vault_store.deposit_events, DepositEvent {
            vault_id,
            investor: investor_addr,
            amount,
            shares_issued: shares_to_issue,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Withdraw funds from a vault
    public entry fun withdraw_from_vault(
        investor: &signer,
        vault_id: u64,
        shares_to_redeem: u64,
        module_owner: address,
    ) acquires VaultStore {
        let investor_addr = signer::address_of(investor);
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        assert!(shares_to_redeem > 0, E_INVALID_AMOUNT);

        let vault_store = borrow_global_mut<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);

        // First, collect fees
        collect_fees_internal(vault_store, vault_id);

        // Now get references for withdrawal processing
        let vault = table::borrow_mut(&mut vault_store.vaults, vault_id);
        let investors = table::borrow_mut(&mut vault_store.vault_investors, vault_id);
        let investor_index = find_investor_index(investors, investor_addr);
        assert!(investor_index < vector::length(investors), E_UNAUTHORIZED);

        let investor_record = vector::borrow_mut(investors, investor_index);
        assert!(investor_record.shares >= shares_to_redeem, E_INSUFFICIENT_BALANCE);

        // Check cooldown period
        let current_time = timestamp::now_seconds();
        assert!(
            current_time >= investor_record.last_deposit_time + WITHDRAWAL_COOLDOWN,
            E_COOLDOWN_ACTIVE
        );

        // Calculate withdrawal amount
        let withdrawal_amount = (shares_to_redeem * vault.total_value) / vault.total_shares;
        assert!(withdrawal_amount <= vault.total_value, E_WITHDRAWAL_TOO_LARGE);

        // Update investor record
        investor_record.shares = investor_record.shares - shares_to_redeem;
        investor_record.total_withdrawn = investor_record.total_withdrawn + withdrawal_amount;

        // Update vault state
        vault.total_shares = vault.total_shares - shares_to_redeem;
        vault.total_value = vault.total_value - withdrawal_amount;

        // Transfer coins to investor
        let vault_coins = table::borrow_mut(&mut vault_store.vault_funds, vault_id);
        let coins = coin::extract(vault_coins, withdrawal_amount);
        coin::deposit(investor_addr, coins);

        // Update global TVL
        vault_store.total_value_locked = vault_store.total_value_locked - withdrawal_amount;

        // Remove investor if no shares remaining
        if (investor_record.shares == 0) {
            vector::remove(investors, investor_index);
            vault.current_investors = vault.current_investors - 1;
        };

        // Emit event
        event::emit_event(&mut vault_store.withdraw_events, WithdrawEvent {
            vault_id,
            investor: investor_addr,
            shares_redeemed: shares_to_redeem,
            amount: withdrawal_amount,
            timestamp: current_time,
        });
    }

    /// Execute a trade (manager only)
    public entry fun execute_trade(
        manager: &signer,
        vault_id: u64,
        action: String,
        amount: u64,
        price: u64,
        profit_amount: u64,
        is_profit: bool,
        description: String,
        module_owner: address,
    ) acquires VaultStore {
        let manager_addr = signer::address_of(manager);
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);

        let vault_store = borrow_global_mut<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);

        let vault = table::borrow_mut(&mut vault_store.vaults, vault_id);
        assert!(vault.manager == manager_addr, E_UNAUTHORIZED);
        assert!(vault.status == STATUS_ACTIVE, E_VAULT_PAUSED);

        // Record trade
        let trade = Trade {
            timestamp: timestamp::now_seconds(),
            action,
            amount,
            price,
            profit_amount,
            is_profit,
            description,
        };

        let trades = table::borrow_mut(&mut vault_store.vault_trades, vault_id);
        vector::push_back(trades, trade);

        // Update vault value based on P&L
        if (is_profit) {
            vault.total_value = vault.total_value + profit_amount;
            
            // Update high water mark if new high
            if (vault.total_value > vault.high_water_mark) {
                vault.high_water_mark = vault.total_value;
            };
        } else {
            if (profit_amount < vault.total_value) {
                vault.total_value = vault.total_value - profit_amount;
            } else {
                vault.total_value = 0;
            };
        };

        // Emit event
        event::emit_event(&mut vault_store.trade_events, TradeEvent {
            vault_id,
            action: trade.action,
            amount,
            timestamp: trade.timestamp,
        });
    }

    /// Pause vault (manager only)
    public entry fun pause_vault(
        manager: &signer,
        vault_id: u64,
        module_owner: address,
    ) acquires VaultStore {
        let manager_addr = signer::address_of(manager);
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);

        let vault_store = borrow_global_mut<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);

        let vault = table::borrow_mut(&mut vault_store.vaults, vault_id);
        assert!(vault.manager == manager_addr, E_UNAUTHORIZED);
        assert!(vault.status == STATUS_ACTIVE, E_VAULT_PAUSED);

        vault.status = STATUS_PAUSED;
    }

    /// Resume vault (manager only)
    public entry fun resume_vault(
        manager: &signer,
        vault_id: u64,
        module_owner: address,
    ) acquires VaultStore {
        let manager_addr = signer::address_of(manager);
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);

        let vault_store = borrow_global_mut<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);

        let vault = table::borrow_mut(&mut vault_store.vaults, vault_id);
        assert!(vault.manager == manager_addr, E_UNAUTHORIZED);
        assert!(vault.status == STATUS_PAUSED, E_VAULT_NOT_PAUSED);

        vault.status = STATUS_ACTIVE;
    }

    /// Collect performance and management fees
    public entry fun collect_fees(
        vault_id: u64,
        module_owner: address,
    ) acquires VaultStore {
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        let vault_store = borrow_global_mut<VaultStore>(module_owner);
        collect_fees_internal(vault_store, vault_id);
    }

    /// Internal function to collect fees
    fun collect_fees_internal(
        vault_store: &mut VaultStore,
        vault_id: u64,
    ) {
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);
        
        let vault = table::borrow_mut(&mut vault_store.vaults, vault_id);
        let current_time = timestamp::now_seconds();
        
        // Calculate time since last fee collection
        let time_elapsed = current_time - vault.last_fee_collection;
        if (time_elapsed == 0) return;

        let performance_fee_amount = 0u64;
        let management_fee_amount = 0u64;

        // Calculate performance fee (only on profits above high water mark)
        if (vault.total_value > vault.high_water_mark && vault.performance_fee > 0) {
            let profit = vault.total_value - vault.high_water_mark;
            performance_fee_amount = (profit * vault.performance_fee) / FEE_DENOMINATOR;
        };

        // Calculate management fee (annualized, prorated)
        if (vault.management_fee > 0 && vault.total_value > 0) {
            let annual_fee = (vault.total_value * vault.management_fee) / FEE_DENOMINATOR;
            management_fee_amount = (annual_fee * time_elapsed) / (365 * 86400); // Prorated
        };

        let total_fees = performance_fee_amount + management_fee_amount;
        
        if (total_fees > 0 && total_fees < vault.total_value) {
            // Transfer fees to manager
            let vault_coins = table::borrow_mut(&mut vault_store.vault_funds, vault_id);
            let fee_coins = coin::extract(vault_coins, total_fees);
            coin::deposit(vault.manager, fee_coins);

            // Update vault value and TVL
            vault.total_value = vault.total_value - total_fees;
            vault_store.total_value_locked = vault_store.total_value_locked - total_fees;

            // Update last fee collection time
            vault.last_fee_collection = current_time;

            // Emit event
            event::emit_event(&mut vault_store.fee_collection_events, FeeCollectionEvent {
                vault_id,
                performance_fee_collected: performance_fee_amount,
                management_fee_collected: management_fee_amount,
                timestamp: current_time,
            });
        };
    }

    /// Helper function to find investor index
    fun find_investor_index(investors: &vector<Investor>, address: address): u64 {
        let i = 0;
        let len = vector::length(investors);
        while (i < len) {
            if (vector::borrow(investors, i).address == address) {
                return i
            };
            i = i + 1;
        };
        len // Return length if not found
    }

    /// View functions

    #[view]
    public fun get_vault_info(vault_id: u64, module_owner: address): Vault acquires VaultStore {
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        let vault_store = borrow_global<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);
        *table::borrow(&vault_store.vaults, vault_id)
    }

    #[view]
    public fun get_vault_balance(vault_id: u64, module_owner: address): u64 acquires VaultStore {
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        let vault_store = borrow_global<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);
        let vault = table::borrow(&vault_store.vaults, vault_id);
        vault.total_value
    }

    #[view]
    public fun get_investor_shares(vault_id: u64, investor: address, module_owner: address): u64 acquires VaultStore {
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        let vault_store = borrow_global<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vault_investors, vault_id), E_VAULT_NOT_FOUND);
        
        let investors = table::borrow(&vault_store.vault_investors, vault_id);
        let index = find_investor_index(investors, investor);
        
        if (index < vector::length(investors)) {
            vector::borrow(investors, index).shares
        } else {
            0
        }
    }

    #[view]
    public fun get_user_vaults(user: address, module_owner: address): vector<u64> acquires VaultStore {
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        let vault_store = borrow_global<VaultStore>(module_owner);
        
        if (table::contains(&vault_store.user_investments, user)) {
            *table::borrow(&vault_store.user_investments, user)
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun get_manager_vaults(manager: address, module_owner: address): vector<u64> acquires VaultStore {
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        let vault_store = borrow_global<VaultStore>(module_owner);
        
        if (table::contains(&vault_store.manager_vaults, manager)) {
            *table::borrow(&vault_store.manager_vaults, manager)
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun get_total_value_locked(module_owner: address): u64 acquires VaultStore {
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        let vault_store = borrow_global<VaultStore>(module_owner);
        vault_store.total_value_locked
    }

    #[view]
    public fun get_vault_performance(vault_id: u64, module_owner: address): (u64, u64, bool) acquires VaultStore {
        assert!(exists<VaultStore>(module_owner), E_NOT_INITIALIZED);
        let vault_store = borrow_global<VaultStore>(module_owner);
        assert!(table::contains(&vault_store.vaults, vault_id), E_VAULT_NOT_FOUND);
        
        let vault = table::borrow(&vault_store.vaults, vault_id);
        let trades = table::borrow(&vault_store.vault_trades, vault_id);
        
        let total_profit: u64 = 0;
        let total_loss: u64 = 0;
        let i = 0;
        let len = vector::length(trades);
        while (i < len) {
            let trade = vector::borrow(trades, i);
            if (trade.is_profit) {
                total_profit = total_profit + trade.profit_amount;
            } else {
                total_loss = total_loss + trade.profit_amount;
            };
            i = i + 1;
        };
        
        if (total_profit >= total_loss) {
            (vault.total_value, total_profit - total_loss, true)
        } else {
            (vault.total_value, total_loss - total_profit, false)
        }
    }
}