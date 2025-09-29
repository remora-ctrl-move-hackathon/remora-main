# FinPort Frontend

Next.js frontend for FinPort DeFi super-app.

## Structure

- `/src/app` - Next.js 14 App Router
  - `/api` - Backend API routes
    - `/remit` - Remittance endpoints
    - `/offramp` - Off-ramp simulation
    - `/billpay` - Bill payment
    - `/indexer` - Data indexing
  - `/dashboard` - Main dashboard
  - `/streams` - Payroll streaming UI
  - `/remit` - Cross-border remittance
  - `/vault` - Investment vaults & copy-trading
  - `/orderglass` - Orderbook analytics
- `/src/components` - React components organized by feature
- `/src/lib` - Utility functions, API client, and Aptos SDK config
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript type definitions

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`