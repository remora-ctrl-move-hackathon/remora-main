module remora::stream_example {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    // Error codes
    const ERROR_STREAM_NOT_FOUND: u64 = 1;
    const ERROR_INSUFFICIENT_BALANCE: u64 = 2;
    const ERROR_UNAUTHORIZED: u64 = 3;
    const ERROR_STREAM_ALREADY_CANCELLED: u64 = 4;
    const ERROR_INVALID_AMOUNT: u64 = 5;
    const ERROR_INVALID_DURATION: u64 = 6;

    // Stream structure
    struct Stream has key, store {
        sender: address,
        recipient: address,
        amount: u64,
        start_time: u64,
        end_time: u64,
        withdrawn: u64,
        cancelled: bool,
        deposit: Coin<AptosCoin>,
    }

    // Events
    struct StreamCreatedEvent has drop, store {
        stream_id: u64,
        sender: address,
        recipient: address,
        amount: u64,
        start_time: u64,
        end_time: u64,
    }

    struct StreamWithdrawnEvent has drop, store {
        stream_id: u64,
        recipient: address,
        amount: u64,
    }

    struct StreamCancelledEvent has drop, store {
        stream_id: u64,
        sender: address,
        recipient_withdrawal: u64,
        sender_refund: u64,
    }

    struct StreamEvents has key {
        created_events: event::EventHandle<StreamCreatedEvent>,
        withdrawn_events: event::EventHandle<StreamWithdrawnEvent>,
        cancelled_events: event::EventHandle<StreamCancelledEvent>,
    }

    // Initialize events for an account
    public entry fun initialize_events(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<StreamEvents>(addr)) {
            move_to(account, StreamEvents {
                created_events: event::new_event_handle<StreamCreatedEvent>(account),
                withdrawn_events: event::new_event_handle<StreamWithdrawnEvent>(account),
                cancelled_events: event::new_event_handle<StreamCancelledEvent>(account),
            });
        };
    }

    // Create a new payment stream
    public entry fun create_stream(
        sender: &signer,
        recipient: address,
        amount: u64,
        duration: u64,
    ) acquires StreamEvents {
        let sender_addr = signer::address_of(sender);
        
        // Validate inputs
        assert!(amount > 0, ERROR_INVALID_AMOUNT);
        assert!(duration > 0, ERROR_INVALID_DURATION);
        
        // Withdraw coins from sender
        let deposit = coin::withdraw<AptosCoin>(sender, amount);
        
        let start_time = timestamp::now_seconds();
        let end_time = start_time + duration;
        
        // Create stream
        let stream = Stream {
            sender: sender_addr,
            recipient,
            amount,
            start_time,
            end_time,
            withdrawn: 0,
            cancelled: false,
            deposit,
        };
        
        // Generate unique stream ID (simplified)
        let stream_id = start_time + amount;
        
        // Store stream
        move_to(sender, stream);
        
        // Emit event
        if (exists<StreamEvents>(sender_addr)) {
            let events = borrow_global_mut<StreamEvents>(sender_addr);
            event::emit_event(&mut events.created_events, StreamCreatedEvent {
                stream_id,
                sender: sender_addr,
                recipient,
                amount,
                start_time,
                end_time,
            });
        };
    }

    // Calculate withdrawable amount
    public fun calculate_withdrawable(stream: &Stream): u64 {
        if (stream.cancelled) {
            return 0
        };
        
        let now = timestamp::now_seconds();
        let available = if (now >= stream.end_time) {
            stream.amount
        } else if (now <= stream.start_time) {
            0
        } else {
            let elapsed = now - stream.start_time;
            let duration = stream.end_time - stream.start_time;
            (stream.amount * elapsed) / duration
        };
        
        available - stream.withdrawn
    }

    // Withdraw from stream
    public entry fun withdraw_from_stream(
        recipient: &signer,
        stream_address: address,
    ) acquires Stream, StreamEvents {
        let recipient_addr = signer::address_of(recipient);
        
        assert!(exists<Stream>(stream_address), ERROR_STREAM_NOT_FOUND);
        let stream = borrow_global_mut<Stream>(stream_address);
        
        assert!(stream.recipient == recipient_addr, ERROR_UNAUTHORIZED);
        assert!(!stream.cancelled, ERROR_STREAM_ALREADY_CANCELLED);
        
        let withdrawable = calculate_withdrawable(stream);
        assert!(withdrawable > 0, ERROR_INSUFFICIENT_BALANCE);
        
        // Extract coins and deposit to recipient
        let coins = coin::extract(&mut stream.deposit, withdrawable);
        coin::deposit(recipient_addr, coins);
        
        stream.withdrawn = stream.withdrawn + withdrawable;
        
        // Emit event
        if (exists<StreamEvents>(stream_address)) {
            let events = borrow_global_mut<StreamEvents>(stream_address);
            event::emit_event(&mut events.withdrawn_events, StreamWithdrawnEvent {
                stream_id: stream.start_time + stream.amount,
                recipient: recipient_addr,
                amount: withdrawable,
            });
        };
    }

    // Cancel stream
    public entry fun cancel_stream(
        sender: &signer,
    ) acquires Stream, StreamEvents {
        let sender_addr = signer::address_of(sender);
        
        assert!(exists<Stream>(sender_addr), ERROR_STREAM_NOT_FOUND);
        let stream = borrow_global_mut<Stream>(sender_addr);
        
        assert!(stream.sender == sender_addr, ERROR_UNAUTHORIZED);
        assert!(!stream.cancelled, ERROR_STREAM_ALREADY_CANCELLED);
        
        stream.cancelled = true;
        
        // Calculate amounts
        let withdrawable = calculate_withdrawable(stream);
        let refundable = coin::value(&stream.deposit) - withdrawable;
        
        // Send remaining to recipient
        if (withdrawable > 0) {
            let recipient_coins = coin::extract(&mut stream.deposit, withdrawable);
            coin::deposit(stream.recipient, recipient_coins);
        };
        
        // Refund remainder to sender
        if (refundable > 0) {
            let sender_coins = coin::extract(&mut stream.deposit, refundable);
            coin::deposit(sender_addr, sender_coins);
        };
        
        // Emit event
        if (exists<StreamEvents>(sender_addr)) {
            let events = borrow_global_mut<StreamEvents>(sender_addr);
            event::emit_event(&mut events.cancelled_events, StreamCancelledEvent {
                stream_id: stream.start_time + stream.amount,
                sender: sender_addr,
                recipient_withdrawal: withdrawable,
                sender_refund: refundable,
            });
        };
    }

    // View functions
    #[view]
    public fun get_stream_details(stream_address: address): (address, address, u64, u64, u64, u64, bool) acquires Stream {
        let stream = borrow_global<Stream>(stream_address);
        (
            stream.sender,
            stream.recipient,
            stream.amount,
            stream.start_time,
            stream.end_time,
            stream.withdrawn,
            stream.cancelled,
        )
    }

    #[view]
    public fun get_withdrawable_amount(stream_address: address): u64 acquires Stream {
        let stream = borrow_global<Stream>(stream_address);
        calculate_withdrawable(stream)
    }
}

// Test module
#[test_only]
module remora::stream_tests {
    use remora::stream_example;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin;
    use aptos_framework::timestamp;
    use std::signer;

    #[test(sender = @0x123, recipient = @0x456, framework = @aptos_framework)]
    public fun test_create_stream(
        sender: signer,
        recipient: address,
        framework: signer,
    ) {
        // Setup
        timestamp::set_time_has_started_for_testing(&framework);
        
        // Create accounts and mint coins
        aptos_coin::mint(&framework, signer::address_of(&sender), 1000000);
        
        // Create stream
        stream_example::create_stream(&sender, recipient, 1000, 3600);
        
        // Verify stream exists
        let (s, r, amount, _, _, withdrawn, cancelled) = 
            stream_example::get_stream_details(signer::address_of(&sender));
        
        assert!(s == signer::address_of(&sender), 0);
        assert!(r == recipient, 1);
        assert!(amount == 1000, 2);
        assert!(withdrawn == 0, 3);
        assert!(!cancelled, 4);
    }
}