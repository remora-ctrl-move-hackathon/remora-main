# FinPort Smart Contracts

Move smart contracts for FinPort super-app on Aptos.

## Modules

### Stream (`stream.move`)
Payroll streaming contract that enables continuous money flow.
- `create_stream`: Create a new payment stream
- `withdraw`: Withdraw available funds from stream
- `cancel_stream`: Cancel an active stream

### Vault (`vault.move`)
Investment vault for copy-trading and profit distribution.
- `create_vault`: Create a new vault
- `deposit`: Deposit funds into vault
- `distribute_profit`: Distribute profits to vault participants

### Remittance (`remittance.move`)
Cross-border remittance transfers.
- `send_remittance`: Send cross-border payment

## Development

### Build
```bash
aptos move compile
```

### Test
```bash
aptos move test
```

### Deploy to Testnet
```bash
aptos move publish --profile testnet
```