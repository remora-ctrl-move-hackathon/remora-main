# Move Smart Contract Development Guide

## Introduction to Move

Move is a safe and secure programming language for Web3 that was originally developed for the Aptos blockchain.

## Key Concepts

### 1. Resources
Resources are the key feature of Move. They cannot be copied or dropped implicitly.

```move
struct Stream has key, store {
    sender: address,
    recipient: address,
    amount: u64,
    start_time: u64,
    end_time: u64,
    withdrawn: u64,
}
```

### 2. Abilities
Move has four abilities that define what can be done with types:
- `copy`: Value can be copied
- `drop`: Value can be dropped
- `store`: Value can be stored in global storage
- `key`: Value can serve as a key for global storage

### 3. Modules
```move
module remora::stream {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    
    // Module code here
}
```

## Common Patterns

### 1. Initialization Pattern
```move
public entry fun initialize(account: &signer) {
    let addr = signer::address_of(account);
    assert!(!exists<StreamManager>(addr), ERROR_ALREADY_INITIALIZED);
    
    move_to(account, StreamManager {
        streams: vector::empty(),
        total_streams: 0,
    });
}
```

### 2. Access Control
```move
public entry fun admin_function(admin: &signer) {
    assert!(
        signer::address_of(admin) == @remora,
        ERROR_NOT_ADMIN
    );
    // Admin only code
}
```

### 3. Payment Handling
```move
public entry fun create_stream<CoinType>(
    sender: &signer,
    recipient: address,
    amount: u64,
    duration: u64,
) {
    let sender_addr = signer::address_of(sender);
    
    // Transfer coins to module
    let coins = coin::withdraw<CoinType>(sender, amount);
    
    // Store in resource
    let stream = Stream<CoinType> {
        sender: sender_addr,
        recipient,
        amount,
        start_time: timestamp::now_seconds(),
        end_time: timestamp::now_seconds() + duration,
        withdrawn: 0,
        coins,
    };
    
    // Store the stream
    move_to(sender, stream);
}
```

### 4. Time-based Logic
```move
public fun calculate_available_amount(stream: &Stream): u64 {
    let now = timestamp::now_seconds();
    
    if (now >= stream.end_time) {
        stream.amount
    } else if (now <= stream.start_time) {
        0
    } else {
        let elapsed = now - stream.start_time;
        let total_duration = stream.end_time - stream.start_time;
        (stream.amount * elapsed) / total_duration
    }
}
```

## Testing

### Unit Tests
```move
#[test_only]
module remora::stream_tests {
    use remora::stream;
    use std::signer;
    
    #[test(admin = @remora)]
    fun test_initialize(admin: signer) {
        stream::initialize(&admin);
        assert!(stream::is_initialized(@remora), 0);
    }
    
    #[test(sender = @0x1, recipient = @0x2)]
    fun test_create_stream(sender: signer, recipient: address) {
        // Test implementation
    }
}
```

### Integration Tests
```move
#[test]
fun test_full_stream_lifecycle() {
    // 1. Create stream
    // 2. Check balance
    // 3. Withdraw partial
    // 4. Cancel stream
    // 5. Verify final state
}
```

## Security Best Practices

### 1. Input Validation
```move
public entry fun create_stream(amount: u64, duration: u64) {
    assert!(amount > 0, ERROR_INVALID_AMOUNT);
    assert!(duration > 0, ERROR_INVALID_DURATION);
    assert!(duration <= MAX_DURATION, ERROR_DURATION_TOO_LONG);
}
```

### 2. Reentrancy Protection
```move
struct MutexLock has key {
    locked: bool,
}

public fun with_lock<T>(account: &signer, f: |&signer| T): T acquires MutexLock {
    let lock = borrow_global_mut<MutexLock>(signer::address_of(account));
    assert!(!lock.locked, ERROR_REENTRANCY);
    lock.locked = true;
    let result = f(account);
    lock.locked = false;
    result
}
```

### 3. Overflow Protection
```move
public fun safe_add(a: u64, b: u64): u64 {
    assert!(a <= MAX_U64 - b, ERROR_OVERFLOW);
    a + b
}
```

## Gas Optimization

### 1. Batch Operations
```move
public entry fun batch_transfer(
    sender: &signer,
    recipients: vector<address>,
    amounts: vector<u64>
) {
    let len = vector::length(&recipients);
    let i = 0;
    while (i < len) {
        transfer(sender, *vector::borrow(&recipients, i), *vector::borrow(&amounts, i));
        i = i + 1;
    }
}
```

### 2. Storage Optimization
```move
// Bad: Storing unnecessary data
struct User has key {
    name: string::String,  // Expensive to store
    created_at: u64,
    updated_at: u64,
}

// Good: Store only essential data
struct User has key {
    id: u64,
    balance: u64,
}
```

## Deployment

### 1. Compile
```bash
aptos move compile --named-addresses remora=default
```

### 2. Test
```bash
aptos move test --coverage
```

### 3. Deploy
```bash
aptos move publish \
  --named-addresses remora=default \
  --network testnet
```

### 4. Upgrade
```move
module remora::upgrade_policy {
    struct UpgradePolicy has key {
        policy: u8
    }
    
    const ARBITRARY: u8 = 0;
    const COMPATIBLE: u8 = 1;
    const IMMUTABLE: u8 = 2;
}
```

## Common Errors

### Error Codes Convention
```move
const ERROR_NOT_INITIALIZED: u64 = 1;
const ERROR_ALREADY_EXISTS: u64 = 2;
const ERROR_NOT_FOUND: u64 = 3;
const ERROR_INSUFFICIENT_BALANCE: u64 = 4;
const ERROR_PERMISSION_DENIED: u64 = 5;
```

### Error Handling
```move
public entry fun withdraw(user: &signer, amount: u64) {
    let balance = get_balance(signer::address_of(user));
    if (balance < amount) {
        abort ERROR_INSUFFICIENT_BALANCE
    };
    // Process withdrawal
}
```

## Resources

- [Move Book](https://move-language.github.io/move/)
- [Aptos Move Examples](https://github.com/aptos-labs/aptos-core/tree/main/aptos-move/move-examples)
- [Move Prover Guide](https://github.com/move-language/move/blob/main/language/move-prover/doc/user/prover-guide.md)
- [Move Patterns](https://www.move-patterns.com/)