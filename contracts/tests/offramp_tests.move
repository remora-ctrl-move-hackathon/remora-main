#[test_only]
module remora::offramp_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use remora::offramp;

    const SECOND: u64 = 1;
    const MINUTE: u64 = 60;
    const HOUR: u64 = 3600;
    const DAY: u64 = 86400;

    #[test_only]
    fun setup_test_accounts(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        // Initialize AptosCoin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(user));
        account::create_account_for_test(signer::address_of(processor));

        // Register and mint coins
        coin::register<AptosCoin>(admin);
        coin::register<AptosCoin>(user);
        coin::register<AptosCoin>(processor);

        let user_coins = coin::mint(1000000, &mint_cap); // 1M APT
        coin::deposit(signer::address_of(user), user_coins);

        // Initialize offramp module
        offramp::initialize(admin);

        // Add processor
        offramp::add_processor(
            admin,
            signer::address_of(processor),
            signer::address_of(admin)
        );

        // Clean up capabilities
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    public fun test_submit_and_verify_kyc(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Submit KYC
        offramp::submit_kyc(
            user,
            string::utf8(b"John Doe"),
            string::utf8(b"john@example.com"),
            string::utf8(b"+1234567890"),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        // Check KYC status (should be unverified)
        let (verified, level) = offramp::get_user_kyc_status(
            signer::address_of(user),
            signer::address_of(admin)
        );
        assert!(!verified, 0);
        assert!(level == 0, 1);

        // Verify KYC
        offramp::verify_kyc(
            processor,
            signer::address_of(user),
            2, // Enhanced verification level
            signer::address_of(admin)
        );

        // Check KYC status (should be verified)
        let (verified, level) = offramp::get_user_kyc_status(
            signer::address_of(user),
            signer::address_of(admin)
        );
        assert!(verified, 2);
        assert!(level == 2, 3);
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    public fun test_update_exchange_rate(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Update NGN rate
        offramp::update_exchange_rate(
            admin,
            string::utf8(b"NGN"),
            450000000, // 450 NGN per APT (with 6 decimal precision)
            signer::address_of(admin)
        );

        // Check rate
        let rate = offramp::get_exchange_rate(
            string::utf8(b"NGN"),
            signer::address_of(admin)
        );
        assert!(rate == 450000000, 0);

        // Update USD rate
        offramp::update_exchange_rate(
            admin,
            string::utf8(b"USD"),
            1200000, // 1.2 USD per APT
            signer::address_of(admin)
        );

        let usd_rate = offramp::get_exchange_rate(
            string::utf8(b"USD"),
            signer::address_of(admin)
        );
        assert!(usd_rate == 1200000, 1);
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    public fun test_create_offramp_request(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Setup KYC
        offramp::submit_kyc(
            user,
            string::utf8(b"John Doe"),
            string::utf8(b"john@example.com"),
            string::utf8(b"+1234567890"),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        offramp::verify_kyc(
            processor,
            signer::address_of(user),
            2,
            signer::address_of(admin)
        );

        // Set exchange rate
        offramp::update_exchange_rate(
            admin,
            string::utf8(b"NGN"),
            450000000, // 450 NGN per APT
            signer::address_of(admin)
        );

        let user_balance_before = coin::balance<AptosCoin>(signer::address_of(user));

        // Create off-ramp request
        offramp::create_offramp_request(
            user,
            1000, // 1000 APT
            string::utf8(b"NGN"),
            string::utf8(b"John Doe"),
            string::utf8(b"1234567890"),
            string::utf8(b"First Bank"),
            string::utf8(b"058"),
            string::utf8(b"FBNINGLA"),
            string::utf8(b""),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        // Check request was created
        let request_info = offramp::get_request_info(1, signer::address_of(admin));
        assert!(request_info.request_id == 1, 0);
        assert!(request_info.user == signer::address_of(user), 1);
        assert!(request_info.apt_amount == 1000, 2);
        assert!(request_info.currency == string::utf8(b"NGN"), 3);
        assert!(request_info.status == 1, 4); // STATUS_PENDING

        // Check user balance reduced
        let user_balance_after = coin::balance<AptosCoin>(signer::address_of(user));
        assert!(user_balance_after == user_balance_before - 1000, 5);

        // Check treasury balance
        let treasury_balance = offramp::get_treasury_balance(signer::address_of(admin));
        assert!(treasury_balance == 1000, 6);
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    public fun test_process_offramp_request(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Setup and create request
        offramp::submit_kyc(
            user,
            string::utf8(b"John Doe"),
            string::utf8(b"john@example.com"),
            string::utf8(b"+1234567890"),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        offramp::verify_kyc(
            processor,
            signer::address_of(user),
            2,
            signer::address_of(admin)
        );

        offramp::update_exchange_rate(
            admin,
            string::utf8(b"NGN"),
            450000000,
            signer::address_of(admin)
        );

        offramp::create_offramp_request(
            user,
            1000,
            string::utf8(b"NGN"),
            string::utf8(b"John Doe"),
            string::utf8(b"1234567890"),
            string::utf8(b"First Bank"),
            string::utf8(b"058"),
            string::utf8(b"FBNINGLA"),
            string::utf8(b""),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        // Process to "processing" status
        offramp::process_offramp_request(
            processor,
            1,
            2, // STATUS_PROCESSING
            string::utf8(b"TXN123456"),
            signer::address_of(admin)
        );

        // Check status updated
        let request_info = offramp::get_request_info(1, signer::address_of(admin));
        assert!(request_info.status == 2, 0); // STATUS_PROCESSING

        // Complete the request
        offramp::process_offramp_request(
            processor,
            1,
            3, // STATUS_COMPLETED
            string::utf8(b"TXN123456"),
            signer::address_of(admin)
        );

        // Check final status
        let request_info = offramp::get_request_info(1, signer::address_of(admin));
        assert!(request_info.status == 3, 1); // STATUS_COMPLETED
        assert!(request_info.transaction_hash == string::utf8(b"TXN123456"), 2);
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    public fun test_cancel_offramp_request(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Setup and create request
        offramp::submit_kyc(
            user,
            string::utf8(b"John Doe"),
            string::utf8(b"john@example.com"),
            string::utf8(b"+1234567890"),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        offramp::verify_kyc(
            processor,
            signer::address_of(user),
            2,
            signer::address_of(admin)
        );

        offramp::update_exchange_rate(
            admin,
            string::utf8(b"NGN"),
            450000000,
            signer::address_of(admin)
        );

        let user_balance_before = coin::balance<AptosCoin>(signer::address_of(user));

        offramp::create_offramp_request(
            user,
            1000,
            string::utf8(b"NGN"),
            string::utf8(b"John Doe"),
            string::utf8(b"1234567890"),
            string::utf8(b"First Bank"),
            string::utf8(b"058"),
            string::utf8(b"FBNINGLA"),
            string::utf8(b""),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        // Cancel request
        offramp::cancel_offramp_request(
            user,
            1,
            signer::address_of(admin)
        );

        // Check request was cancelled
        let request_info = offramp::get_request_info(1, signer::address_of(admin));
        assert!(request_info.status == 4, 0); // STATUS_CANCELLED

        // Check refund (should get back most of the amount minus cancellation fee)
        let user_balance_after = coin::balance<AptosCoin>(signer::address_of(user));
        assert!(user_balance_after > user_balance_before - 1000, 1); // Got refund
        assert!(user_balance_after < user_balance_before, 2); // But paid cancellation fee
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    public fun test_reject_offramp_request(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Setup and create request
        offramp::submit_kyc(
            user,
            string::utf8(b"John Doe"),
            string::utf8(b"john@example.com"),
            string::utf8(b"+1234567890"),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        offramp::verify_kyc(
            processor,
            signer::address_of(user),
            2,
            signer::address_of(admin)
        );

        offramp::update_exchange_rate(
            admin,
            string::utf8(b"NGN"),
            450000000,
            signer::address_of(admin)
        );

        let user_balance_before = coin::balance<AptosCoin>(signer::address_of(user));

        offramp::create_offramp_request(
            user,
            1000,
            string::utf8(b"NGN"),
            string::utf8(b"John Doe"),
            string::utf8(b"1234567890"),
            string::utf8(b"First Bank"),
            string::utf8(b"058"),
            string::utf8(b"FBNINGLA"),
            string::utf8(b""),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        // Reject request
        offramp::reject_offramp_request(
            processor,
            1,
            string::utf8(b"Invalid bank details"),
            signer::address_of(admin)
        );

        // Check request was rejected
        let request_info = offramp::get_request_info(1, signer::address_of(admin));
        assert!(request_info.status == 5, 0); // STATUS_REJECTED
        assert!(request_info.rejection_reason == string::utf8(b"Invalid bank details"), 1);

        // Check full refund
        let user_balance_after = coin::balance<AptosCoin>(signer::address_of(user));
        assert!(user_balance_after == user_balance_before, 2); // Full refund
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    public fun test_daily_limit(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Setup
        offramp::submit_kyc(
            user,
            string::utf8(b"John Doe"),
            string::utf8(b"john@example.com"),
            string::utf8(b"+1234567890"),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        offramp::verify_kyc(
            processor,
            signer::address_of(user),
            2,
            signer::address_of(admin)
        );

        offramp::update_exchange_rate(
            admin,
            string::utf8(b"NGN"),
            450000000,
            signer::address_of(admin)
        );

        // First request - small amount
        offramp::create_offramp_request(
            user,
            1000,
            string::utf8(b"NGN"),
            string::utf8(b"John Doe"),
            string::utf8(b"1234567890"),
            string::utf8(b"First Bank"),
            string::utf8(b"058"),
            string::utf8(b"FBNINGLA"),
            string::utf8(b""),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        // Check daily volume
        let daily_volume = offramp::get_user_daily_volume(
            signer::address_of(user),
            signer::address_of(admin)
        );
        assert!(daily_volume == 1000, 0);

        // Fast forward to next day
        timestamp::update_global_time_for_test(1000000 + DAY + 1);

        // Create another request (daily limit should reset)
        offramp::create_offramp_request(
            user,
            2000,
            string::utf8(b"NGN"),
            string::utf8(b"John Doe"),
            string::utf8(b"1234567890"),
            string::utf8(b"First Bank"),
            string::utf8(b"058"),
            string::utf8(b"FBNINGLA"),
            string::utf8(b""),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        // Check daily volume reset
        let new_daily_volume = offramp::get_user_daily_volume(
            signer::address_of(user),
            signer::address_of(admin)
        );
        assert!(new_daily_volume == 2000, 1); // Reset to new amount
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    #[expected_failure(abort_code = 10)] // E_KYC_NOT_VERIFIED
    public fun test_create_request_without_kyc_fails(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Set exchange rate
        offramp::update_exchange_rate(
            admin,
            string::utf8(b"NGN"),
            450000000,
            signer::address_of(admin)
        );

        // Try to create request without KYC (should fail)
        offramp::create_offramp_request(
            user,
            1000,
            string::utf8(b"NGN"),
            string::utf8(b"John Doe"),
            string::utf8(b"1234567890"),
            string::utf8(b"First Bank"),
            string::utf8(b"058"),
            string::utf8(b"FBNINGLA"),
            string::utf8(b""),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );
    }

    #[test(aptos_framework = @aptos_framework, admin = @remora, user = @0x123, processor = @0x456)]
    #[expected_failure(abort_code = 3)] // E_UNAUTHORIZED
    public fun test_unauthorized_processor_fails(
        aptos_framework: &signer,
        admin: &signer,
        user: &signer,
        processor: &signer
    ) {
        setup_test_accounts(aptos_framework, admin, user, processor);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Setup and create request
        offramp::submit_kyc(
            user,
            string::utf8(b"John Doe"),
            string::utf8(b"john@example.com"),
            string::utf8(b"+1234567890"),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        offramp::verify_kyc(
            processor,
            signer::address_of(user),
            2,
            signer::address_of(admin)
        );

        offramp::update_exchange_rate(
            admin,
            string::utf8(b"NGN"),
            450000000,
            signer::address_of(admin)
        );

        offramp::create_offramp_request(
            user,
            1000,
            string::utf8(b"NGN"),
            string::utf8(b"John Doe"),
            string::utf8(b"1234567890"),
            string::utf8(b"First Bank"),
            string::utf8(b"058"),
            string::utf8(b"FBNINGLA"),
            string::utf8(b""),
            string::utf8(b"Nigeria"),
            signer::address_of(admin)
        );

        // User (not processor) tries to process request (should fail)
        offramp::process_offramp_request(
            user,
            1,
            2,
            string::utf8(b"TXN123456"),
            signer::address_of(admin)
        );
    }
}