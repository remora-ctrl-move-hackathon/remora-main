#[test_only]
module remora::streaming_tests {
    use std::signer;
    use std::string;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use remora::streaming;

    const SECOND: u64 = 1;
    const MINUTE: u64 = 60;
    const HOUR: u64 = 3600;
    const DAY: u64 = 86400;

    #[test_only]
    fun setup_test_accounts(aptos_framework: &signer, module_owner: &signer, sender: &signer, receiver: &signer) {
        // Initialize AptosCoin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts
        account::create_account_for_test(signer::address_of(module_owner));
        account::create_account_for_test(signer::address_of(sender));
        account::create_account_for_test(signer::address_of(receiver));

        // Register and mint coins
        coin::register<AptosCoin>(module_owner);
        coin::register<AptosCoin>(sender);
        coin::register<AptosCoin>(receiver);

        let coins = coin::mint(10000000, &mint_cap); // 10M APT
        coin::deposit(signer::address_of(sender), coins);

        // Initialize streaming module
        streaming::initialize(module_owner);

        // Clean up capabilities
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, sender = @0x123, receiver = @0x456)]
    public fun test_create_stream(
        aptos_framework: &signer,
        module_owner: &signer,
        sender: &signer,
        receiver: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, sender, receiver);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        let total_amount = 1000000; // 1M APT
        let duration = DAY; // 1 day
        let stream_name = string::utf8(b"Test Stream");

        // Create stream
        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            total_amount,
            duration,
            stream_name,
            signer::address_of(module_owner)
        );

        // Verify stream was created
        let stream_info = streaming::get_stream_info(1, signer::address_of(module_owner));
        assert!(stream_info.stream_id == 1, 0);
        assert!(stream_info.sender == signer::address_of(sender), 1);
        assert!(stream_info.receiver == signer::address_of(receiver), 2);
        assert!(stream_info.total_amount == total_amount, 3);
        assert!(stream_info.withdrawn_amount == 0, 4);
        assert!(stream_info.status == 1, 5); // STATUS_ACTIVE

        // Check sender's balance was reduced
        let sender_balance = coin::balance<AptosCoin>(signer::address_of(sender));
        assert!(sender_balance == 9000000, 6); // 10M - 1M
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, sender = @0x123, receiver = @0x456)]
    public fun test_withdraw_from_stream(
        aptos_framework: &signer,
        module_owner: &signer,
        sender: &signer,
        receiver: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, sender, receiver);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        let total_amount = 1000000; // 1M APT
        let duration = DAY; // 1 day

        // Create stream
        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            total_amount,
            duration,
            string::utf8(b"Test Stream"),
            signer::address_of(module_owner)
        );

        // Fast forward 12 hours
        timestamp::update_global_time_for_test(1000000 + (12 * HOUR));

        // Withdraw from stream
        streaming::withdraw_from_stream(
            receiver,
            1,
            signer::address_of(module_owner)
        );

        // Check withdrawal amount (should be ~500k APT for 12 hours)
        let receiver_balance = coin::balance<AptosCoin>(signer::address_of(receiver));
        assert!(receiver_balance > 499000 && receiver_balance < 501000, 0); // Allow small variance

        // Check stream state
        let stream_info = streaming::get_stream_info(1, signer::address_of(module_owner));
        assert!(stream_info.withdrawn_amount > 499000, 1);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, sender = @0x123, receiver = @0x456)]
    public fun test_pause_and_resume_stream(
        aptos_framework: &signer,
        module_owner: &signer,
        sender: &signer,
        receiver: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, sender, receiver);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create stream
        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            1000000,
            DAY,
            string::utf8(b"Test Stream"),
            signer::address_of(module_owner)
        );

        // Pause stream
        streaming::pause_stream(
            sender,
            1,
            signer::address_of(module_owner)
        );

        // Check stream is paused
        let stream_info = streaming::get_stream_info(1, signer::address_of(module_owner));
        assert!(stream_info.status == 2, 0); // STATUS_PAUSED

        // Resume stream
        streaming::resume_stream(
            sender,
            1,
            signer::address_of(module_owner)
        );

        // Check stream is active again
        let stream_info = streaming::get_stream_info(1, signer::address_of(module_owner));
        assert!(stream_info.status == 1, 1); // STATUS_ACTIVE
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, sender = @0x123, receiver = @0x456)]
    public fun test_cancel_stream(
        aptos_framework: &signer,
        module_owner: &signer,
        sender: &signer,
        receiver: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, sender, receiver);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        let total_amount = 1000000;

        // Create stream
        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            total_amount,
            DAY,
            string::utf8(b"Test Stream"),
            signer::address_of(module_owner)
        );

        // Fast forward 6 hours
        timestamp::update_global_time_for_test(1000000 + (6 * HOUR));

        // Cancel stream
        streaming::cancel_stream(
            sender,
            1,
            signer::address_of(module_owner)
        );

        // Check stream is cancelled
        let stream_info = streaming::get_stream_info(1, signer::address_of(module_owner));
        assert!(stream_info.status == 3, 0); // STATUS_CANCELLED

        // Check sender got refund (should get back ~750k APT)
        let sender_balance = coin::balance<AptosCoin>(signer::address_of(sender));
        assert!(sender_balance > 9749000 && sender_balance < 9751000, 1);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, sender = @0x123, receiver = @0x456)]
    public fun test_get_withdrawable_amount(
        aptos_framework: &signer,
        module_owner: &signer,
        sender: &signer,
        receiver: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, sender, receiver);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create stream
        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            1000000,
            DAY,
            string::utf8(b"Test Stream"),
            signer::address_of(module_owner)
        );

        // Check withdrawable at start (should be 0)
        let withdrawable = streaming::get_withdrawable_amount(1, signer::address_of(module_owner));
        assert!(withdrawable == 0, 0);

        // Fast forward 6 hours
        timestamp::update_global_time_for_test(1000000 + (6 * HOUR));

        // Check withdrawable amount (should be ~250k APT)
        let withdrawable = streaming::get_withdrawable_amount(1, signer::address_of(module_owner));
        assert!(withdrawable > 249000 && withdrawable < 251000, 1);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, sender = @0x123, receiver = @0x456)]
    public fun test_multiple_streams(
        aptos_framework: &signer,
        module_owner: &signer,
        sender: &signer,
        receiver: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, sender, receiver);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create multiple streams
        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            100000,
            DAY,
            string::utf8(b"Stream 1"),
            signer::address_of(module_owner)
        );

        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            200000,
            DAY * 2,
            string::utf8(b"Stream 2"),
            signer::address_of(module_owner)
        );

        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            300000,
            DAY * 3,
            string::utf8(b"Stream 3"),
            signer::address_of(module_owner)
        );

        // Check user's streams
        let sent_streams = streaming::get_user_sent_streams(
            signer::address_of(sender),
            signer::address_of(module_owner)
        );
        assert!(vector::length(&sent_streams) == 3, 0);

        let received_streams = streaming::get_user_received_streams(
            signer::address_of(receiver),
            signer::address_of(module_owner)
        );
        assert!(vector::length(&received_streams) == 3, 1);

        // Check total locked amount
        let total_locked = streaming::get_total_locked_amount(signer::address_of(module_owner));
        assert!(total_locked == 600000, 2);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, sender = @0x123, receiver = @0x456)]
    #[expected_failure(abort_code = 12)] // E_NOTHING_TO_WITHDRAW
    public fun test_withdraw_twice_immediately_fails(
        aptos_framework: &signer,
        module_owner: &signer,
        sender: &signer,
        receiver: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, sender, receiver);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create stream
        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            1000000,
            DAY,
            string::utf8(b"Test Stream"),
            signer::address_of(module_owner)
        );

        // Fast forward 6 hours
        timestamp::update_global_time_for_test(1000000 + (6 * HOUR));

        // First withdrawal succeeds
        streaming::withdraw_from_stream(
            receiver,
            1,
            signer::address_of(module_owner)
        );

        // Second withdrawal immediately should fail
        streaming::withdraw_from_stream(
            receiver,
            1,
            signer::address_of(module_owner)
        );
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, sender = @0x123, receiver = @0x456, other = @0x789)]
    #[expected_failure(abort_code = 3)] // E_UNAUTHORIZED
    public fun test_unauthorized_withdrawal_fails(
        aptos_framework: &signer,
        module_owner: &signer,
        sender: &signer,
        receiver: &signer,
        other: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, sender, receiver);
        account::create_account_for_test(signer::address_of(other));
        coin::register<AptosCoin>(other);
        
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create stream
        streaming::create_stream(
            sender,
            signer::address_of(receiver),
            1000000,
            DAY,
            string::utf8(b"Test Stream"),
            signer::address_of(module_owner)
        );

        // Unauthorized user tries to withdraw
        streaming::withdraw_from_stream(
            other,
            1,
            signer::address_of(module_owner)
        );
    }
}