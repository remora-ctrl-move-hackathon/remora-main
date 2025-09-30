module remora::streaming {
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
    const E_STREAM_NOT_FOUND: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;
    const E_STREAM_ALREADY_EXISTS: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_INVALID_TIME_RANGE: u64 = 6;
    const E_STREAM_ALREADY_CANCELLED: u64 = 7;
    const E_STREAM_ALREADY_PAUSED: u64 = 8;
    const E_STREAM_NOT_PAUSED: u64 = 9;
    const E_INVALID_AMOUNT: u64 = 10;
    const E_STREAM_ENDED: u64 = 11;
    const E_NOTHING_TO_WITHDRAW: u64 = 12;

    /// Stream status constants
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_PAUSED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;
    const STATUS_COMPLETED: u8 = 4;

    /// Stream struct
    struct Stream has store, copy, drop {
        stream_id: u64,
        sender: address,
        receiver: address,
        amount_per_second: u64,
        total_amount: u64,
        start_time: u64,
        end_time: u64,
        last_withdrawal_time: u64,
        withdrawn_amount: u64,
        status: u8,
        stream_name: String,
    }

    /// StreamStore - stores all streams
    struct StreamStore has key {
        streams: Table<u64, Stream>,
        user_sent_streams: Table<address, vector<u64>>,
        user_received_streams: Table<address, vector<u64>>,
        next_stream_id: u64,
        total_streams_created: u64,
        total_value_streamed: u64,
        create_stream_events: EventHandle<CreateStreamEvent>,
        withdraw_stream_events: EventHandle<WithdrawStreamEvent>,
        pause_stream_events: EventHandle<StreamStatusChangeEvent>,
        cancel_stream_events: EventHandle<StreamStatusChangeEvent>,
    }

    /// Vault to hold locked funds
    struct StreamVault has key {
        locked_coins: Coin<AptosCoin>,
        total_locked: u64,
    }

    /// Events
    struct CreateStreamEvent has drop, store {
        stream_id: u64,
        sender: address,
        receiver: address,
        total_amount: u64,
        duration: u64,
        timestamp: u64,
    }

    struct WithdrawStreamEvent has drop, store {
        stream_id: u64,
        receiver: address,
        amount: u64,
        timestamp: u64,
    }

    struct StreamStatusChangeEvent has drop, store {
        stream_id: u64,
        old_status: u8,
        new_status: u8,
        timestamp: u64,
    }

    /// Initialize the streaming module
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<StreamStore>(addr), E_STREAM_ALREADY_EXISTS);

        let stream_store = StreamStore {
            streams: table::new(),
            user_sent_streams: table::new(),
            user_received_streams: table::new(),
            next_stream_id: 1,
            total_streams_created: 0,
            total_value_streamed: 0,
            create_stream_events: account::new_event_handle<CreateStreamEvent>(account),
            withdraw_stream_events: account::new_event_handle<WithdrawStreamEvent>(account),
            pause_stream_events: account::new_event_handle<StreamStatusChangeEvent>(account),
            cancel_stream_events: account::new_event_handle<StreamStatusChangeEvent>(account),
        };

        let vault = StreamVault {
            locked_coins: coin::zero<AptosCoin>(),
            total_locked: 0,
        };

        move_to(account, stream_store);
        move_to(account, vault);
    }

    /// Create a new payment stream
    public entry fun create_stream(
        sender: &signer,
        receiver: address,
        total_amount: u64,
        duration_seconds: u64,
        stream_name: String,
        module_owner: address,
    ) acquires StreamStore, StreamVault {
        let sender_addr = signer::address_of(sender);
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);
        assert!(total_amount > 0, E_INVALID_AMOUNT);
        assert!(duration_seconds > 0, E_INVALID_TIME_RANGE);

        let stream_store = borrow_global_mut<StreamStore>(module_owner);
        let vault = borrow_global_mut<StreamVault>(module_owner);

        let current_time = timestamp::now_seconds();
        let end_time = current_time + duration_seconds;
        let amount_per_second = total_amount / duration_seconds;

        // Create new stream
        let stream_id = stream_store.next_stream_id;
        let stream = Stream {
            stream_id,
            sender: sender_addr,
            receiver,
            amount_per_second,
            total_amount,
            start_time: current_time,
            end_time,
            last_withdrawal_time: current_time,
            withdrawn_amount: 0,
            status: STATUS_ACTIVE,
            stream_name,
        };

        // Transfer coins to vault
        let coins = coin::withdraw<AptosCoin>(sender, total_amount);
        coin::merge(&mut vault.locked_coins, coins);
        vault.total_locked = vault.total_locked + total_amount;

        // Store stream
        table::add(&mut stream_store.streams, stream_id, stream);

        // Update user streams
        if (!table::contains(&stream_store.user_sent_streams, sender_addr)) {
            table::add(&mut stream_store.user_sent_streams, sender_addr, vector::empty());
        };
        let sent_streams = table::borrow_mut(&mut stream_store.user_sent_streams, sender_addr);
        vector::push_back(sent_streams, stream_id);

        if (!table::contains(&stream_store.user_received_streams, receiver)) {
            table::add(&mut stream_store.user_received_streams, receiver, vector::empty());
        };
        let received_streams = table::borrow_mut(&mut stream_store.user_received_streams, receiver);
        vector::push_back(received_streams, stream_id);

        // Update stats
        stream_store.next_stream_id = stream_id + 1;
        stream_store.total_streams_created = stream_store.total_streams_created + 1;
        stream_store.total_value_streamed = stream_store.total_value_streamed + total_amount;

        // Emit event
        event::emit_event(&mut stream_store.create_stream_events, CreateStreamEvent {
            stream_id,
            sender: sender_addr,
            receiver,
            total_amount,
            duration: duration_seconds,
            timestamp: current_time,
        });
    }

    /// Withdraw available funds from a stream
    public entry fun withdraw_from_stream(
        receiver: &signer,
        stream_id: u64,
        module_owner: address,
    ) acquires StreamStore, StreamVault {
        let receiver_addr = signer::address_of(receiver);
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);

        let stream_store = borrow_global_mut<StreamStore>(module_owner);
        assert!(table::contains(&stream_store.streams, stream_id), E_STREAM_NOT_FOUND);

        let stream = table::borrow_mut(&mut stream_store.streams, stream_id);
        assert!(stream.receiver == receiver_addr, E_UNAUTHORIZED);
        assert!(stream.status == STATUS_ACTIVE, E_STREAM_NOT_PAUSED);

        let current_time = timestamp::now_seconds();
        let elapsed_time = if (current_time > stream.end_time) {
            stream.end_time - stream.last_withdrawal_time
        } else {
            current_time - stream.last_withdrawal_time
        };

        let withdrawable_amount = elapsed_time * stream.amount_per_second;
        assert!(withdrawable_amount > 0, E_NOTHING_TO_WITHDRAW);

        // Calculate actual withdrawable (ensure we don't exceed total)
        let remaining_amount = stream.total_amount - stream.withdrawn_amount;
        let actual_withdrawal = if (withdrawable_amount > remaining_amount) {
            remaining_amount
        } else {
            withdrawable_amount
        };

        // Update stream state
        stream.withdrawn_amount = stream.withdrawn_amount + actual_withdrawal;
        stream.last_withdrawal_time = current_time;

        // Check if stream is completed
        if (stream.withdrawn_amount >= stream.total_amount) {
            stream.status = STATUS_COMPLETED;
        };

        // Transfer from vault to receiver
        let vault = borrow_global_mut<StreamVault>(module_owner);
        let coins = coin::extract(&mut vault.locked_coins, actual_withdrawal);
        coin::deposit(receiver_addr, coins);
        vault.total_locked = vault.total_locked - actual_withdrawal;

        // Emit event
        event::emit_event(&mut stream_store.withdraw_stream_events, WithdrawStreamEvent {
            stream_id,
            receiver: receiver_addr,
            amount: actual_withdrawal,
            timestamp: current_time,
        });
    }

    /// Pause a stream (only sender can pause)
    public entry fun pause_stream(
        sender: &signer,
        stream_id: u64,
        module_owner: address,
    ) acquires StreamStore {
        let sender_addr = signer::address_of(sender);
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);

        let stream_store = borrow_global_mut<StreamStore>(module_owner);
        assert!(table::contains(&stream_store.streams, stream_id), E_STREAM_NOT_FOUND);

        let stream = table::borrow_mut(&mut stream_store.streams, stream_id);
        assert!(stream.sender == sender_addr, E_UNAUTHORIZED);
        assert!(stream.status == STATUS_ACTIVE, E_STREAM_ALREADY_PAUSED);

        let old_status = stream.status;
        stream.status = STATUS_PAUSED;

        event::emit_event(&mut stream_store.pause_stream_events, StreamStatusChangeEvent {
            stream_id,
            old_status,
            new_status: STATUS_PAUSED,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Resume a paused stream
    public entry fun resume_stream(
        sender: &signer,
        stream_id: u64,
        module_owner: address,
    ) acquires StreamStore {
        let sender_addr = signer::address_of(sender);
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);

        let stream_store = borrow_global_mut<StreamStore>(module_owner);
        assert!(table::contains(&stream_store.streams, stream_id), E_STREAM_NOT_FOUND);

        let stream = table::borrow_mut(&mut stream_store.streams, stream_id);
        assert!(stream.sender == sender_addr, E_UNAUTHORIZED);
        assert!(stream.status == STATUS_PAUSED, E_STREAM_NOT_PAUSED);

        let old_status = stream.status;
        stream.status = STATUS_ACTIVE;

        event::emit_event(&mut stream_store.pause_stream_events, StreamStatusChangeEvent {
            stream_id,
            old_status,
            new_status: STATUS_ACTIVE,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Cancel a stream and refund remaining amount
    public entry fun cancel_stream(
        sender: &signer,
        stream_id: u64,
        module_owner: address,
    ) acquires StreamStore, StreamVault {
        let sender_addr = signer::address_of(sender);
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);

        let stream_store = borrow_global_mut<StreamStore>(module_owner);
        assert!(table::contains(&stream_store.streams, stream_id), E_STREAM_NOT_FOUND);

        let stream = table::borrow_mut(&mut stream_store.streams, stream_id);
        assert!(stream.sender == sender_addr, E_UNAUTHORIZED);
        assert!(stream.status != STATUS_CANCELLED, E_STREAM_ALREADY_CANCELLED);
        assert!(stream.status != STATUS_COMPLETED, E_STREAM_ENDED);

        // Calculate remaining amount to refund
        let remaining_amount = stream.total_amount - stream.withdrawn_amount;

        if (remaining_amount > 0) {
            let vault = borrow_global_mut<StreamVault>(module_owner);
            let coins = coin::extract(&mut vault.locked_coins, remaining_amount);
            coin::deposit(sender_addr, coins);
            vault.total_locked = vault.total_locked - remaining_amount;
        };

        let old_status = stream.status;
        stream.status = STATUS_CANCELLED;

        event::emit_event(&mut stream_store.cancel_stream_events, StreamStatusChangeEvent {
            stream_id,
            old_status,
            new_status: STATUS_CANCELLED,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// View functions

    #[view]
    public fun get_stream_info(stream_id: u64, module_owner: address): Stream acquires StreamStore {
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);
        let stream_store = borrow_global<StreamStore>(module_owner);
        assert!(table::contains(&stream_store.streams, stream_id), E_STREAM_NOT_FOUND);
        *table::borrow(&stream_store.streams, stream_id)
    }

    #[view]
    public fun get_withdrawable_amount(stream_id: u64, module_owner: address): u64 acquires StreamStore {
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);
        let stream_store = borrow_global<StreamStore>(module_owner);
        assert!(table::contains(&stream_store.streams, stream_id), E_STREAM_NOT_FOUND);
        
        let stream = table::borrow(&stream_store.streams, stream_id);
        
        if (stream.status != STATUS_ACTIVE) {
            return 0
        };

        let current_time = timestamp::now_seconds();
        let elapsed_time = if (current_time > stream.end_time) {
            stream.end_time - stream.last_withdrawal_time
        } else {
            current_time - stream.last_withdrawal_time
        };

        let withdrawable_amount = elapsed_time * stream.amount_per_second;
        let remaining_amount = stream.total_amount - stream.withdrawn_amount;
        
        if (withdrawable_amount > remaining_amount) {
            remaining_amount
        } else {
            withdrawable_amount
        }
    }

    #[view]
    public fun get_user_sent_streams(user: address, module_owner: address): vector<u64> acquires StreamStore {
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);
        let stream_store = borrow_global<StreamStore>(module_owner);
        
        if (table::contains(&stream_store.user_sent_streams, user)) {
            *table::borrow(&stream_store.user_sent_streams, user)
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun get_user_received_streams(user: address, module_owner: address): vector<u64> acquires StreamStore {
        assert!(exists<StreamStore>(module_owner), E_NOT_INITIALIZED);
        let stream_store = borrow_global<StreamStore>(module_owner);
        
        if (table::contains(&stream_store.user_received_streams, user)) {
            *table::borrow(&stream_store.user_received_streams, user)
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun get_total_locked_amount(module_owner: address): u64 acquires StreamVault {
        assert!(exists<StreamVault>(module_owner), E_NOT_INITIALIZED);
        let vault = borrow_global<StreamVault>(module_owner);
        vault.total_locked
    }
}