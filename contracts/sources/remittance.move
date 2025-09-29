module FinPort::remittance {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::event;

    struct RemittanceEvent has drop, store {
        sender: address,
        recipient: address,
        amount: u128,
        currency: address,
        timestamp: u64,
    }

    public entry fun send_remittance(
        sender: &signer,
        recipient: address,
        amount: u128
    ) {
    }
}