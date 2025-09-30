#[test_only]
module remora::vault_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use remora::vault;

    const SECOND: u64 = 1;
    const MINUTE: u64 = 60;
    const HOUR: u64 = 3600;
    const DAY: u64 = 86400;

    #[test_only]
    fun setup_test_accounts(
        aptos_framework: &signer, 
        module_owner: &signer, 
        manager: &signer, 
        investor1: &signer,
        investor2: &signer
    ) {
        // Initialize AptosCoin
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        // Create accounts
        account::create_account_for_test(signer::address_of(module_owner));
        account::create_account_for_test(signer::address_of(manager));
        account::create_account_for_test(signer::address_of(investor1));
        account::create_account_for_test(signer::address_of(investor2));

        // Register and mint coins
        coin::register<AptosCoin>(module_owner);
        coin::register<AptosCoin>(manager);
        coin::register<AptosCoin>(investor1);
        coin::register<AptosCoin>(investor2);

        let coins1 = coin::mint(10000000, &mint_cap); // 10M APT for investor1
        coin::deposit(signer::address_of(investor1), coins1);
        
        let coins2 = coin::mint(10000000, &mint_cap); // 10M APT for investor2
        coin::deposit(signer::address_of(investor2), coins2);

        let coins3 = coin::mint(1000000, &mint_cap); // 1M APT for manager
        coin::deposit(signer::address_of(manager), coins3);

        // Initialize vault module
        vault::initialize(module_owner);

        // Clean up capabilities
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, manager = @0x123, investor1 = @0x456, investor2 = @0x789)]
    public fun test_create_vault(
        aptos_framework: &signer,
        module_owner: &signer,
        manager: &signer,
        investor1: &signer,
        investor2: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, manager, investor1, investor2);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create vault
        vault::create_vault(
            manager,
            string::utf8(b"Alpha Strategy Vault"),
            string::utf8(b"High-yield trading strategy"),
            string::utf8(b"Momentum trading with risk management"),
            2000, // 20% performance fee
            200,  // 2% management fee
            1000, // Min investment 1000 APT
            100,  // Max 100 investors
            signer::address_of(module_owner)
        );

        // Verify vault was created
        let vault_info = vault::get_vault_info(1, signer::address_of(module_owner));
        assert!(vault_info.vault_id == 1, 0);
        assert!(vault_info.manager == signer::address_of(manager), 1);
        assert!(vault_info.performance_fee == 2000, 2);
        assert!(vault_info.management_fee == 200, 3);
        assert!(vault_info.status == 1, 4); // STATUS_ACTIVE

        // Check manager vaults
        let manager_vaults = vault::get_manager_vaults(
            signer::address_of(manager),
            signer::address_of(module_owner)
        );
        assert!(vector::length(&manager_vaults) == 1, 5);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, manager = @0x123, investor1 = @0x456, investor2 = @0x789)]
    public fun test_deposit_to_vault(
        aptos_framework: &signer,
        module_owner: &signer,
        manager: &signer,
        investor1: &signer,
        investor2: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, manager, investor1, investor2);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create vault
        vault::create_vault(
            manager,
            string::utf8(b"Test Vault"),
            string::utf8(b"Description"),
            string::utf8(b"Strategy"),
            2000,
            200,
            1000,
            100,
            signer::address_of(module_owner)
        );

        // Investor 1 deposits
        vault::deposit_to_vault(
            investor1,
            1,
            100000, // 100k APT
            signer::address_of(module_owner)
        );

        // Check vault balance
        let vault_balance = vault::get_vault_balance(1, signer::address_of(module_owner));
        assert!(vault_balance == 100000, 0);

        // Check investor shares
        let shares = vault::get_investor_shares(
            1,
            signer::address_of(investor1),
            signer::address_of(module_owner)
        );
        assert!(shares == 100000, 1); // First deposit gets 1:1 shares

        // Investor 2 deposits
        vault::deposit_to_vault(
            investor2,
            1,
            200000, // 200k APT
            signer::address_of(module_owner)
        );

        // Check updated vault balance
        let vault_balance = vault::get_vault_balance(1, signer::address_of(module_owner));
        assert!(vault_balance == 300000, 2);

        // Check TVL
        let tvl = vault::get_total_value_locked(signer::address_of(module_owner));
        assert!(tvl == 300000, 3);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, manager = @0x123, investor1 = @0x456, investor2 = @0x789)]
    public fun test_execute_trade(
        aptos_framework: &signer,
        module_owner: &signer,
        manager: &signer,
        investor1: &signer,
        investor2: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, manager, investor1, investor2);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create vault and deposit
        vault::create_vault(
            manager,
            string::utf8(b"Trading Vault"),
            string::utf8(b"Description"),
            string::utf8(b"Strategy"),
            2000,
            200,
            1000,
            100,
            signer::address_of(module_owner)
        );

        vault::deposit_to_vault(
            investor1,
            1,
            100000,
            signer::address_of(module_owner)
        );

        // Execute profitable trade
        vault::execute_trade(
            manager,
            1,
            string::utf8(b"BUY"),
            50000,  // Trade amount
            1234567, // Price
            10000,   // Profit amount
            true,    // Is profit
            string::utf8(b"APT/USD long position"),
            signer::address_of(module_owner)
        );

        // Check vault performance
        let (vault_value, pnl_amount, is_positive) = vault::get_vault_performance(
            1,
            signer::address_of(module_owner)
        );
        assert!(vault_value == 110000, 0); // 100k + 10k profit
        assert!(pnl_amount == 10000, 1);
        assert!(is_positive, 2);

        // Execute losing trade
        vault::execute_trade(
            manager,
            1,
            string::utf8(b"SELL"),
            30000,
            1234567,
            3000,   // Loss amount
            false,  // Is loss
            string::utf8(b"Stop loss triggered"),
            signer::address_of(module_owner)
        );

        // Check updated performance
        let (vault_value, pnl_amount, is_positive) = vault::get_vault_performance(
            1,
            signer::address_of(module_owner)
        );
        assert!(vault_value == 107000, 3); // 110k - 3k loss
        assert!(pnl_amount == 7000, 4);      // Net profit
        assert!(is_positive, 5);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, manager = @0x123, investor1 = @0x456, investor2 = @0x789)]
    public fun test_withdraw_from_vault(
        aptos_framework: &signer,
        module_owner: &signer,
        manager: &signer,
        investor1: &signer,
        investor2: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, manager, investor1, investor2);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create vault and deposit
        vault::create_vault(
            manager,
            string::utf8(b"Test Vault"),
            string::utf8(b"Description"),
            string::utf8(b"Strategy"),
            2000,
            200,
            1000,
            100,
            signer::address_of(module_owner)
        );

        vault::deposit_to_vault(
            investor1,
            1,
            100000,
            signer::address_of(module_owner)
        );

        // Fast forward past cooldown period (24 hours)
        timestamp::update_global_time_for_test(1000000 + DAY + 1);

        // Withdraw half shares
        vault::withdraw_from_vault(
            investor1,
            1,
            50000, // Half of shares
            signer::address_of(module_owner)
        );

        // Check investor balance
        let investor_balance = coin::balance<AptosCoin>(signer::address_of(investor1));
        assert!(investor_balance == 9950000, 0); // 10M - 100k deposit + 50k withdrawal

        // Check remaining shares
        let remaining_shares = vault::get_investor_shares(
            1,
            signer::address_of(investor1),
            signer::address_of(module_owner)
        );
        assert!(remaining_shares == 50000, 1);
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, manager = @0x123, investor1 = @0x456, investor2 = @0x789)]
    public fun test_pause_and_resume_vault(
        aptos_framework: &signer,
        module_owner: &signer,
        manager: &signer,
        investor1: &signer,
        investor2: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, manager, investor1, investor2);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Create vault
        vault::create_vault(
            manager,
            string::utf8(b"Test Vault"),
            string::utf8(b"Description"),
            string::utf8(b"Strategy"),
            2000,
            200,
            1000,
            100,
            signer::address_of(module_owner)
        );

        // Pause vault
        vault::pause_vault(
            manager,
            1,
            signer::address_of(module_owner)
        );

        // Check vault is paused
        let vault_info = vault::get_vault_info(1, signer::address_of(module_owner));
        assert!(vault_info.status == 2, 0); // STATUS_PAUSED

        // Resume vault
        vault::resume_vault(
            manager,
            1,
            signer::address_of(module_owner)
        );

        // Check vault is active again
        let vault_info = vault::get_vault_info(1, signer::address_of(module_owner));
        assert!(vault_info.status == 1, 1); // STATUS_ACTIVE
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, manager = @0x123, investor1 = @0x456, investor2 = @0x789)]
    public fun test_performance_fee_collection(
        aptos_framework: &signer,
        module_owner: &signer,
        manager: &signer,
        investor1: &signer,
        investor2: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, manager, investor1, investor2);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create vault with 20% performance fee
        vault::create_vault(
            manager,
            string::utf8(b"Performance Vault"),
            string::utf8(b"Description"),
            string::utf8(b"Strategy"),
            2000, // 20% performance fee
            0,    // No management fee for this test
            1000,
            100,
            signer::address_of(module_owner)
        );

        vault::deposit_to_vault(
            investor1,
            1,
            100000,
            signer::address_of(module_owner)
        );

        // Generate 50k profit
        vault::execute_trade(
            manager,
            1,
            string::utf8(b"BUY"),
            100000,
            1234567,
            50000,  // 50k profit
            true,   // Is profit
            string::utf8(b"Profitable trade"),
            signer::address_of(module_owner)
        );

        let manager_balance_before = coin::balance<AptosCoin>(signer::address_of(manager));

        // Collect fees
        vault::collect_fees(
            1,
            signer::address_of(module_owner)
        );

        let manager_balance_after = coin::balance<AptosCoin>(signer::address_of(manager));
        let fee_collected = manager_balance_after - manager_balance_before;

        // Should collect 20% of 50k profit = 10k
        assert!(fee_collected == 10000, 0);

        // Vault value should be reduced by fee
        let vault_balance = vault::get_vault_balance(1, signer::address_of(module_owner));
        assert!(vault_balance == 140000, 1); // 100k + 50k profit - 10k fee
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, manager = @0x123, investor1 = @0x456, investor2 = @0x789)]
    #[expected_failure(abort_code = 12)] // E_COOLDOWN_ACTIVE
    public fun test_withdraw_before_cooldown_fails(
        aptos_framework: &signer,
        module_owner: &signer,
        manager: &signer,
        investor1: &signer,
        investor2: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, manager, investor1, investor2);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1000000);

        // Create vault and deposit
        vault::create_vault(
            manager,
            string::utf8(b"Test Vault"),
            string::utf8(b"Description"),
            string::utf8(b"Strategy"),
            2000,
            200,
            1000,
            100,
            signer::address_of(module_owner)
        );

        vault::deposit_to_vault(
            investor1,
            1,
            100000,
            signer::address_of(module_owner)
        );

        // Try to withdraw immediately (should fail)
        vault::withdraw_from_vault(
            investor1,
            1,
            50000,
            signer::address_of(module_owner)
        );
    }

    #[test(aptos_framework = @aptos_framework, module_owner = @remora, manager = @0x123, investor1 = @0x456, investor2 = @0x789)]
    #[expected_failure(abort_code = 3)] // E_UNAUTHORIZED
    public fun test_unauthorized_trade_execution_fails(
        aptos_framework: &signer,
        module_owner: &signer,
        manager: &signer,
        investor1: &signer,
        investor2: &signer
    ) {
        setup_test_accounts(aptos_framework, module_owner, manager, investor1, investor2);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        // Create vault
        vault::create_vault(
            manager,
            string::utf8(b"Test Vault"),
            string::utf8(b"Description"),
            string::utf8(b"Strategy"),
            2000,
            200,
            1000,
            100,
            signer::address_of(module_owner)
        );

        // Non-manager tries to execute trade (should fail)
        vault::execute_trade(
            investor1,  // Not the manager
            1,
            string::utf8(b"BUY"),
            10000,
            1234567,
            1000,
            true,
            string::utf8(b"Unauthorized trade"),
            signer::address_of(module_owner)
        );
    }
}