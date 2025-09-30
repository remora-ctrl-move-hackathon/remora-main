module remora::offramp {
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
    const E_REQUEST_NOT_FOUND: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;
    const E_ALREADY_EXISTS: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_INVALID_AMOUNT: u64 = 6;
    const E_INVALID_STATUS: u64 = 7;
    const E_INVALID_CURRENCY: u64 = 8;
    const E_RATE_NOT_SET: u64 = 9;
    const E_KYC_NOT_VERIFIED: u64 = 10;
    const E_LIMIT_EXCEEDED: u64 = 11;
    const E_REQUEST_EXPIRED: u64 = 12;
    const E_ALREADY_PROCESSED: u64 = 13;

    /// Constants
    const MIN_OFFRAMP_AMOUNT: u64 = 100;       // Minimum 100 APT
    const MAX_OFFRAMP_AMOUNT: u64 = 100000;    // Maximum 100,000 APT per transaction
    const DAILY_LIMIT: u64 = 500000;           // 500,000 APT daily limit per user
    const REQUEST_EXPIRY_TIME: u64 = 86400;    // 24 hours in seconds
    const SERVICE_FEE_BASIS_POINTS: u64 = 100; // 1% service fee
    const FEE_DENOMINATOR: u64 = 10000;

    /// Off-ramp request status
    const STATUS_PENDING: u8 = 1;
    const STATUS_PROCESSING: u8 = 2;
    const STATUS_COMPLETED: u8 = 3;
    const STATUS_CANCELLED: u8 = 4;
    const STATUS_REJECTED: u8 = 5;

    /// Supported currencies
    const CURRENCY_USD: vector<u8> = b"USD";
    const CURRENCY_NGN: vector<u8> = b"NGN";
    const CURRENCY_GBP: vector<u8> = b"GBP";
    const CURRENCY_EUR: vector<u8> = b"EUR";
    const CURRENCY_KES: vector<u8> = b"KES";
    const CURRENCY_ZAR: vector<u8> = b"ZAR";

    /// Bank account information
    struct BankInfo has store, copy, drop {
        account_name: String,
        account_number: String,
        bank_name: String,
        bank_code: String,
        swift_code: String,
        routing_number: String,
        country: String,
    }

    /// KYC information
    struct KYCInfo has store, copy, drop {
        full_name: String,
        email: String,
        phone_number: String,
        country: String,
        verified: bool,
        verified_at: u64,
        verification_level: u8, // 1: Basic, 2: Enhanced, 3: Full
    }

    /// Off-ramp request
    struct OffRampRequest has store, copy, drop {
        request_id: u64,
        user: address,
        apt_amount: u64,
        fiat_amount: u64,
        currency: String,
        exchange_rate: u64, // Rate with 6 decimals precision (e.g., 1234567 = 1.234567)
        service_fee: u64,
        net_fiat_amount: u64,
        bank_info: BankInfo,
        status: u8,
        created_at: u64,
        processed_at: u64,
        transaction_hash: String,
        rejection_reason: String,
    }

    /// Exchange rate info
    struct ExchangeRate has store, copy, drop {
        currency: String,
        rate: u64, // APT to fiat rate with 6 decimals precision
        last_updated: u64,
        is_active: bool,
    }

    /// Off-ramp store
    struct OffRampStore has key {
        requests: Table<u64, OffRampRequest>,
        user_requests: Table<address, vector<u64>>,
        user_kyc: Table<address, KYCInfo>,
        user_daily_volume: Table<address, u64>,
        user_last_reset: Table<address, u64>,
        exchange_rates: Table<String, ExchangeRate>,
        treasury: Coin<AptosCoin>,
        next_request_id: u64,
        total_requests: u64,
        total_volume_apt: u64,
        total_fees_collected: u64,
        admin: address,
        processors: vector<address>,
        create_request_events: EventHandle<CreateRequestEvent>,
        process_request_events: EventHandle<ProcessRequestEvent>,
        cancel_request_events: EventHandle<CancelRequestEvent>,
        kyc_update_events: EventHandle<KYCUpdateEvent>,
        rate_update_events: EventHandle<RateUpdateEvent>,
    }

    /// Events
    struct CreateRequestEvent has drop, store {
        request_id: u64,
        user: address,
        apt_amount: u64,
        currency: String,
        timestamp: u64,
    }

    struct ProcessRequestEvent has drop, store {
        request_id: u64,
        processor: address,
        status: u8,
        timestamp: u64,
    }

    struct CancelRequestEvent has drop, store {
        request_id: u64,
        user: address,
        reason: String,
        timestamp: u64,
    }

    struct KYCUpdateEvent has drop, store {
        user: address,
        verified: bool,
        level: u8,
        timestamp: u64,
    }

    struct RateUpdateEvent has drop, store {
        currency: String,
        old_rate: u64,
        new_rate: u64,
        timestamp: u64,
    }

    /// Initialize the off-ramp module
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<OffRampStore>(admin_addr), E_ALREADY_EXISTS);

        let store = OffRampStore {
            requests: table::new(),
            user_requests: table::new(),
            user_kyc: table::new(),
            user_daily_volume: table::new(),
            user_last_reset: table::new(),
            exchange_rates: table::new(),
            treasury: coin::zero<AptosCoin>(),
            next_request_id: 1,
            total_requests: 0,
            total_volume_apt: 0,
            total_fees_collected: 0,
            admin: admin_addr,
            processors: vector::empty(),
            create_request_events: account::new_event_handle<CreateRequestEvent>(admin),
            process_request_events: account::new_event_handle<ProcessRequestEvent>(admin),
            cancel_request_events: account::new_event_handle<CancelRequestEvent>(admin),
            kyc_update_events: account::new_event_handle<KYCUpdateEvent>(admin),
            rate_update_events: account::new_event_handle<RateUpdateEvent>(admin),
        };

        move_to(admin, store);
    }

    /// Submit KYC information
    public entry fun submit_kyc(
        user: &signer,
        full_name: String,
        email: String,
        phone_number: String,
        country: String,
        module_owner: address,
    ) acquires OffRampStore {
        let user_addr = signer::address_of(user);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        
        let kyc_info = KYCInfo {
            full_name,
            email,
            phone_number,
            country,
            verified: false,
            verified_at: 0,
            verification_level: 0,
        };

        if (table::contains(&store.user_kyc, user_addr)) {
            *table::borrow_mut(&mut store.user_kyc, user_addr) = kyc_info;
        } else {
            table::add(&mut store.user_kyc, user_addr, kyc_info);
        };
    }

    /// Verify KYC (admin/processor only)
    public entry fun verify_kyc(
        processor: &signer,
        user: address,
        verification_level: u8,
        module_owner: address,
    ) acquires OffRampStore {
        let processor_addr = signer::address_of(processor);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        assert!(
            processor_addr == store.admin || vector::contains(&store.processors, &processor_addr),
            E_UNAUTHORIZED
        );
        assert!(table::contains(&store.user_kyc, user), E_REQUEST_NOT_FOUND);

        let kyc = table::borrow_mut(&mut store.user_kyc, user);
        kyc.verified = true;
        kyc.verified_at = timestamp::now_seconds();
        kyc.verification_level = verification_level;

        event::emit_event(&mut store.kyc_update_events, KYCUpdateEvent {
            user,
            verified: true,
            level: verification_level,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Update exchange rate (admin only)
    public entry fun update_exchange_rate(
        admin: &signer,
        currency: String,
        rate: u64,
        module_owner: address,
    ) acquires OffRampStore {
        let admin_addr = signer::address_of(admin);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        assert!(admin_addr == store.admin, E_UNAUTHORIZED);

        let old_rate = if (table::contains(&store.exchange_rates, currency)) {
            table::borrow(&store.exchange_rates, currency).rate
        } else {
            0
        };

        let exchange_rate = ExchangeRate {
            currency: currency,
            rate,
            last_updated: timestamp::now_seconds(),
            is_active: true,
        };

        if (table::contains(&store.exchange_rates, currency)) {
            *table::borrow_mut(&mut store.exchange_rates, currency) = exchange_rate;
        } else {
            table::add(&mut store.exchange_rates, currency, exchange_rate);
        };

        event::emit_event(&mut store.rate_update_events, RateUpdateEvent {
            currency: exchange_rate.currency,
            old_rate,
            new_rate: rate,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Create off-ramp request
    public entry fun create_offramp_request(
        user: &signer,
        apt_amount: u64,
        currency: String,
        account_name: String,
        account_number: String,
        bank_name: String,
        bank_code: String,
        swift_code: String,
        routing_number: String,
        country: String,
        module_owner: address,
    ) acquires OffRampStore {
        let user_addr = signer::address_of(user);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);
        assert!(apt_amount >= MIN_OFFRAMP_AMOUNT, E_INVALID_AMOUNT);
        assert!(apt_amount <= MAX_OFFRAMP_AMOUNT, E_LIMIT_EXCEEDED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        
        // Check KYC
        assert!(table::contains(&store.user_kyc, user_addr), E_KYC_NOT_VERIFIED);
        let kyc = table::borrow(&store.user_kyc, user_addr);
        assert!(kyc.verified, E_KYC_NOT_VERIFIED);

        // Check exchange rate exists
        assert!(table::contains(&store.exchange_rates, currency), E_RATE_NOT_SET);
        
        // Get exchange rate (borrow and release immediately)
        let exchange_rate = {
            let rate_info = table::borrow(&store.exchange_rates, currency);
            assert!(rate_info.is_active, E_INVALID_CURRENCY);
            rate_info.rate
        };

        // Check daily limit
        check_and_update_daily_limit(store, user_addr, apt_amount);

        // Calculate amounts
        let fiat_amount = (apt_amount * exchange_rate) / 1000000; // Adjust for 6 decimal precision
        let service_fee = (apt_amount * SERVICE_FEE_BASIS_POINTS) / FEE_DENOMINATOR;
        let net_apt = apt_amount - service_fee;
        let net_fiat_amount = (net_apt * exchange_rate) / 1000000;

        // Transfer APT to treasury
        let coins = coin::withdraw<AptosCoin>(user, apt_amount);
        coin::merge(&mut store.treasury, coins);

        // Create bank info
        let bank_info = BankInfo {
            account_name,
            account_number,
            bank_name,
            bank_code,
            swift_code,
            routing_number,
            country,
        };

        // Create request
        let request_id = store.next_request_id;
        let request = OffRampRequest {
            request_id,
            user: user_addr,
            apt_amount,
            fiat_amount,
            currency,
            exchange_rate,
            service_fee,
            net_fiat_amount,
            bank_info,
            status: STATUS_PENDING,
            created_at: timestamp::now_seconds(),
            processed_at: 0,
            transaction_hash: string::utf8(b""),
            rejection_reason: string::utf8(b""),
        };

        // Store request
        table::add(&mut store.requests, request_id, request);

        // Update user requests
        if (!table::contains(&store.user_requests, user_addr)) {
            table::add(&mut store.user_requests, user_addr, vector::empty());
        };
        let user_requests = table::borrow_mut(&mut store.user_requests, user_addr);
        vector::push_back(user_requests, request_id);

        // Update stats
        store.next_request_id = request_id + 1;
        store.total_requests = store.total_requests + 1;
        store.total_volume_apt = store.total_volume_apt + apt_amount;
        store.total_fees_collected = store.total_fees_collected + service_fee;

        // Emit event
        event::emit_event(&mut store.create_request_events, CreateRequestEvent {
            request_id,
            user: user_addr,
            apt_amount,
            currency,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Process off-ramp request (processor only)
    public entry fun process_offramp_request(
        processor: &signer,
        request_id: u64,
        status: u8,
        transaction_hash: String,
        module_owner: address,
    ) acquires OffRampStore {
        let processor_addr = signer::address_of(processor);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        assert!(
            processor_addr == store.admin || vector::contains(&store.processors, &processor_addr),
            E_UNAUTHORIZED
        );
        assert!(table::contains(&store.requests, request_id), E_REQUEST_NOT_FOUND);

        let request = table::borrow_mut(&mut store.requests, request_id);
        assert!(request.status == STATUS_PENDING || request.status == STATUS_PROCESSING, E_ALREADY_PROCESSED);
        assert!(status == STATUS_PROCESSING || status == STATUS_COMPLETED, E_INVALID_STATUS);

        request.status = status;
        request.processed_at = timestamp::now_seconds();
        request.transaction_hash = transaction_hash;

        event::emit_event(&mut store.process_request_events, ProcessRequestEvent {
            request_id,
            processor: processor_addr,
            status,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Cancel off-ramp request (user only, within time limit)
    public entry fun cancel_offramp_request(
        user: &signer,
        request_id: u64,
        module_owner: address,
    ) acquires OffRampStore {
        let user_addr = signer::address_of(user);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        assert!(table::contains(&store.requests, request_id), E_REQUEST_NOT_FOUND);

        let request = table::borrow_mut(&mut store.requests, request_id);
        assert!(request.user == user_addr, E_UNAUTHORIZED);
        assert!(request.status == STATUS_PENDING, E_ALREADY_PROCESSED);

        // Check if within cancellation window
        let current_time = timestamp::now_seconds();
        assert!(current_time <= request.created_at + REQUEST_EXPIRY_TIME, E_REQUEST_EXPIRED);

        // Update status
        request.status = STATUS_CANCELLED;

        // Refund APT (minus small cancellation fee)
        let cancellation_fee = request.service_fee / 2; // Half of service fee as cancellation fee
        let refund_amount = request.apt_amount - cancellation_fee;
        
        let refund_coins = coin::extract(&mut store.treasury, refund_amount);
        coin::deposit(user_addr, refund_coins);

        event::emit_event(&mut store.cancel_request_events, CancelRequestEvent {
            request_id,
            user: user_addr,
            reason: string::utf8(b"User cancelled"),
            timestamp: current_time,
        });
    }

    /// Reject off-ramp request (processor only)
    public entry fun reject_offramp_request(
        processor: &signer,
        request_id: u64,
        reason: String,
        module_owner: address,
    ) acquires OffRampStore {
        let processor_addr = signer::address_of(processor);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        assert!(
            processor_addr == store.admin || vector::contains(&store.processors, &processor_addr),
            E_UNAUTHORIZED
        );
        assert!(table::contains(&store.requests, request_id), E_REQUEST_NOT_FOUND);

        let request = table::borrow_mut(&mut store.requests, request_id);
        assert!(request.status == STATUS_PENDING || request.status == STATUS_PROCESSING, E_ALREADY_PROCESSED);

        // Update status
        request.status = STATUS_REJECTED;
        request.rejection_reason = reason;
        request.processed_at = timestamp::now_seconds();

        // Refund full amount
        let refund_coins = coin::extract(&mut store.treasury, request.apt_amount);
        coin::deposit(request.user, refund_coins);

        event::emit_event(&mut store.process_request_events, ProcessRequestEvent {
            request_id,
            processor: processor_addr,
            status: STATUS_REJECTED,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Add processor (admin only)
    public entry fun add_processor(
        admin: &signer,
        processor: address,
        module_owner: address,
    ) acquires OffRampStore {
        let admin_addr = signer::address_of(admin);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        assert!(admin_addr == store.admin, E_UNAUTHORIZED);

        if (!vector::contains(&store.processors, &processor)) {
            vector::push_back(&mut store.processors, processor);
        };
    }

    /// Remove processor (admin only)
    public entry fun remove_processor(
        admin: &signer,
        processor: address,
        module_owner: address,
    ) acquires OffRampStore {
        let admin_addr = signer::address_of(admin);
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);

        let store = borrow_global_mut<OffRampStore>(module_owner);
        assert!(admin_addr == store.admin, E_UNAUTHORIZED);

        let (found, index) = vector::index_of(&store.processors, &processor);
        if (found) {
            vector::remove(&mut store.processors, index);
        };
    }

    /// Helper function to check and update daily limit
    fun check_and_update_daily_limit(
        store: &mut OffRampStore,
        user: address,
        amount: u64,
    ) {
        let current_time = timestamp::now_seconds();
        let current_day = current_time / 86400; // Convert to days

        // Reset daily volume if new day
        if (table::contains(&store.user_last_reset, user)) {
            let last_reset = *table::borrow(&store.user_last_reset, user);
            let last_day = last_reset / 86400;
            
            if (current_day > last_day) {
                // Reset daily volume
                if (table::contains(&store.user_daily_volume, user)) {
                    *table::borrow_mut(&mut store.user_daily_volume, user) = 0;
                };
                *table::borrow_mut(&mut store.user_last_reset, user) = current_time;
            };
        } else {
            table::add(&mut store.user_last_reset, user, current_time);
            table::add(&mut store.user_daily_volume, user, 0);
        };

        // Check daily limit
        let current_volume = if (table::contains(&store.user_daily_volume, user)) {
            *table::borrow(&store.user_daily_volume, user)
        } else {
            0
        };

        assert!(current_volume + amount <= DAILY_LIMIT, E_LIMIT_EXCEEDED);

        // Update daily volume
        if (table::contains(&store.user_daily_volume, user)) {
            *table::borrow_mut(&mut store.user_daily_volume, user) = current_volume + amount;
        } else {
            table::add(&mut store.user_daily_volume, user, amount);
        };
    }

    /// View functions

    #[view]
    public fun get_request_info(request_id: u64, module_owner: address): OffRampRequest acquires OffRampStore {
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);
        let store = borrow_global<OffRampStore>(module_owner);
        assert!(table::contains(&store.requests, request_id), E_REQUEST_NOT_FOUND);
        *table::borrow(&store.requests, request_id)
    }

    #[view]
    public fun get_user_requests(user: address, module_owner: address): vector<u64> acquires OffRampStore {
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);
        let store = borrow_global<OffRampStore>(module_owner);
        
        if (table::contains(&store.user_requests, user)) {
            *table::borrow(&store.user_requests, user)
        } else {
            vector::empty()
        }
    }

    #[view]
    public fun get_exchange_rate(currency: String, module_owner: address): u64 acquires OffRampStore {
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);
        let store = borrow_global<OffRampStore>(module_owner);
        assert!(table::contains(&store.exchange_rates, currency), E_RATE_NOT_SET);
        
        let rate_info = table::borrow(&store.exchange_rates, currency);
        rate_info.rate
    }

    #[view]
    public fun get_user_kyc_status(user: address, module_owner: address): (bool, u8) acquires OffRampStore {
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);
        let store = borrow_global<OffRampStore>(module_owner);
        
        if (table::contains(&store.user_kyc, user)) {
            let kyc = table::borrow(&store.user_kyc, user);
            (kyc.verified, kyc.verification_level)
        } else {
            (false, 0)
        }
    }

    #[view]
    public fun get_user_daily_volume(user: address, module_owner: address): u64 acquires OffRampStore {
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);
        let store = borrow_global<OffRampStore>(module_owner);
        
        if (table::contains(&store.user_daily_volume, user)) {
            *table::borrow(&store.user_daily_volume, user)
        } else {
            0
        }
    }

    #[view]
    public fun get_treasury_balance(module_owner: address): u64 acquires OffRampStore {
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);
        let store = borrow_global<OffRampStore>(module_owner);
        coin::value(&store.treasury)
    }

    #[view]
    public fun get_stats(module_owner: address): (u64, u64, u64) acquires OffRampStore {
        assert!(exists<OffRampStore>(module_owner), E_NOT_INITIALIZED);
        let store = borrow_global<OffRampStore>(module_owner);
        (store.total_requests, store.total_volume_apt, store.total_fees_collected)
    }
}