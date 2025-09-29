# FinPort - DeFi Super App

Aptos hackathon project - a comprehensive DeFi platform with payroll streaming, cross-border remittance, investment vaults, and orderbook analytics.

## Project Structure

```
finport/
├── contracts/          # Move smart contracts
│   ├── sources/       # Move modules (stream, vault, remittance)
│   ├── tests/         # Move unit tests
│   └── scripts/       # Deployment scripts
└── frontend/          # Next.js 14 full-stack app
    └── src/
        ├── app/
        │   ├── api/       # Next.js API routes (backend)
        │   ├── dashboard/ # Main dashboard
        │   ├── streams/   # Payroll streaming UI
        │   ├── remit/     # Cross-border remittance
        │   ├── vault/     # Investment vaults
        │   └── orderglass/ # Orderbook analytics
        ├── components/    # React components by feature
        ├── lib/           # Aptos SDK & utilities
        └── hooks/         # Custom React hooks
```

## Features (MVP)

✅ **Payroll Streams** - Continuous payment streaming
✅ **Cross-border Remit** - Stablecoin remittance with off-ramp
✅ **Investment Vaults** - Copy-trading & profit distribution  
✅ **Bill Pay** - Automated utility payments
✅ **OrderGlass** - Orderbook analytics & visualization

## Quick Start

### Contracts
```bash
cd contracts
aptos move compile
aptos move test
aptos move publish --profile testnet
```

### Frontend (Full-stack Next.js)
```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000` with API routes at `/api/*`

## Tech Stack

- **Smart Contracts**: Move on Aptos
- **Full-stack App**: Next.js 14 (App Router + API Routes) + Tailwind CSS + Aptos Wallet Adapter
- **Indexer**: Aptos GraphQL
- **Storage**: Next.js server-side logic (can add DB later if needed)

## Development Timeline

See detailed 9-week sprint plan in `/docs/sprint-plan.md`

## Team

[Add team members]

## License

MIT