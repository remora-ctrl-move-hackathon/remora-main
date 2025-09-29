module FinPort::stream {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    struct Stream has key {
        id: u64,
        sender: address,
        recipient: address,
        rate: u128,
        start_ts: u64,
        end_ts: u64,
        deposited: u128,
        withdrawn: u128,
    }

    struct StreamCreatedEvent has drop, store {
        stream_id: u64,
        sender: address,
        recipient: address,
        rate: u128,
        duration_sec: u64,
    }

    struct WithdrawEvent has drop, store {
        stream_id: u64,
        recipient: address,
        amount: u128,
    }

    struct StreamCancelledEvent has drop, store {
        stream_id: u64,
        sender: address,
    }

    public entry fun create_stream(
        sender: &signer,
        recipient: address,
        rate: u128,
        duration_sec: u64,
        deposit: u128
    ) {
    }

    public entry fun withdraw(
        recipient: &signer,
        stream_id: u64,
        amount: u128
    ) {
    }

    public entry fun cancel_stream(
        sender: &signer,
        stream_id: u64
    ) {
    }
}