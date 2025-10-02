# 📋 Step-by-Step Implementation Guide for Winning Features

This guide provides detailed steps to implement each winning feature for the Aptos CTRL+MOVE Hackathon. Each section includes time estimates and priority levels.

## Table of Contents
1. [Phase 1: Core Features (Day 1)](#phase-1-core-features-day-1)
2. [Phase 2: Advanced Features (Day 2)](#phase-2-advanced-features-day-2)
3. [Phase 3: Polish & Testing](#phase-3-polish--testing)

---

## Phase 1: Core Features (Day 1)

### 1. AI Trading Assistant (4 hours) 🤖
**Priority: HIGH | Complexity: MEDIUM**

#### Step 1: Set up the AI Assistant Component (30 mins)
```bash
# Component already created at:
frontend/src/components/ai-assistant.tsx
```

**Tasks:**
- [ ] Review the existing AI Assistant component
- [ ] Integrate OpenAI or Anthropic API key in `.env.local`
- [ ] Add API endpoint for natural language processing

#### Step 2: Integrate NLP Parser (1 hour)
```typescript
// Add to src/services/ai.service.ts
export class AIService {
  async parseIntent(text: string) {
    // Call OpenAI/Claude API
    // Return structured intent
  }
}
```

#### Step 3: Connect to Trading Functions (1.5 hours)
- [ ] Link parsed intents to actual trading functions
- [ ] Add transaction preview before execution
- [ ] Implement error handling for failed intents

#### Step 4: Add to Main Pages (1 hour)
```typescript
// Add to src/app/layout.tsx for global access
{connected && showAI && <AIAssistant />}
```

#### Step 5: Test Common Scenarios (1 hour)
- [ ] "Buy 100 USDC of APT"
- [ ] "Stream 50 USDC to 0x123"
- [ ] "Show my vault performance"
- [ ] "What's the APT price?"

---

### 2. Trader Leaderboard & Social Features (3 hours) 📊
**Priority: HIGH | Complexity: LOW**

#### Step 1: Deploy Leaderboard Component (30 mins)
```bash
# Component already created at:
frontend/src/components/trader-leaderboard.tsx
```

#### Step 2: Create Leaderboard Page (1 hour)
```bash
# Create new page
mkdir -p src/app/leaderboard
touch src/app/leaderboard/page.tsx
```

```typescript
// src/app/leaderboard/page.tsx
import { TraderLeaderboard } from "@/components/trader-leaderboard"

export default function LeaderboardPage() {
  return (
    <div>
      <Header />
      <div className="container mx-auto py-8">
        <h1>Top Traders</h1>
        <TraderLeaderboard />
      </div>
    </div>
  )
}
```

#### Step 3: Add Real Data Integration (1 hour)
- [ ] Modify vault service to track trader performance
- [ ] Add `getTopTraders` function to vault service
- [ ] Calculate real ROI from vault data

#### Step 4: Add Copy Trading Logic (30 mins)
```typescript
// Add to src/hooks/useVault.ts
const followTrader = async (traderAddress: string) => {
  // Subscribe to trader's trades
  // Mirror position sizing proportionally
}
```

---

### 3. Multi-Signature Vaults (3 hours) 🏛️
**Priority: MEDIUM | Complexity: HIGH**

#### Step 1: Deploy Multi-Sig Component (30 mins)
```bash
# Component already created at:
frontend/src/components/multi-sig-vault.tsx
```

#### Step 2: Update Smart Contract (1.5 hours)
```move
// Add to contracts/sources/vault.move
struct MultiSigVault has key {
    signers: vector<address>,
    threshold: u64,
    pending_txs: Table<u64, PendingTx>
}
```

#### Step 3: Create Multi-Sig Management Page (1 hour)
```typescript
// src/app/vault/multisig/page.tsx
import { MultiSigVault } from "@/components/multi-sig-vault"
```

#### Step 4: Integrate with Existing Vaults
- [ ] Add multi-sig option when creating vault
- [ ] Show pending transactions for signers
- [ ] Add approval workflow

---

## Phase 2: Advanced Features (Day 2)

### 4. Real-time WebSocket Integration (4 hours) ⚡
**Priority: HIGH | Complexity: MEDIUM**

#### Step 1: Deploy WebSocket Hook (30 mins)
```bash
# Hook already created at:
frontend/src/hooks/useWebSocket.ts
```

#### Step 2: Set Up WebSocket Server (2 hours)
```javascript
// backend/websocket-server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  // Handle price updates
  // Handle transaction status
  // Handle vault updates
});
```

#### Step 3: Integrate with UI Components (1 hour)
```typescript
// Add to components that need real-time data
const { prices } = useRealtimePrices(['APT', 'USDC'])
```

#### Step 4: Add Optimistic Updates (30 mins)
- [ ] Update UI immediately on user action
- [ ] Revert if transaction fails
- [ ] Show pending state

---

### 5. Merkle Trade Integration (4 hours) 🔄
**Priority: MEDIUM | Complexity: HIGH**

#### Step 1: Review Integration Code (30 mins)
```bash
# Integration already created at:
frontend/src/integrations/merkle-trade.ts
```

#### Step 2: Connect to Merkle Contracts (1.5 hours)
- [ ] Get Merkle Trade testnet addresses
- [ ] Update contract addresses in integration
- [ ] Test connection to Merkle markets

#### Step 3: Create Advanced Trading Page (1.5 hours)
```typescript
// src/app/trading/advanced/page.tsx
import { merkleTradeIntegration } from "@/integrations/merkle-trade"

// Show Merkle markets
// Allow 150x leverage trading
// Display funding rates
```

#### Step 4: Add Arbitrage Dashboard (30 mins)
- [ ] Show funding rate opportunities
- [ ] Calculate potential profits
- [ ] One-click arbitrage execution

---

### 6. API Documentation & SDK (3 hours) 📚
**Priority: LOW | Complexity: LOW**

#### Step 1: Deploy API Docs Page (30 mins)
```bash
# Page already created at:
frontend/src/app/api-docs/page.tsx
```

#### Step 2: Create Backend API (1.5 hours)
```typescript
// backend/api/routes.ts
app.post('/api/v1/stream/create', async (req, res) => {
  // Validate API key
  // Create stream transaction
  // Return transaction hash
})
```

#### Step 3: Publish SDK (1 hour)
```bash
# Create NPM package
mkdir remora-sdk
cd remora-sdk
npm init

# Copy SDK from frontend/src/sdk/remora-sdk.ts
# Publish to NPM
```

---

## Phase 3: Polish & Testing

### 7. UI/UX Polish (2 hours) ✨
**Priority: MEDIUM | Complexity: LOW**

#### Step 1: Add Loading States (30 mins)
```typescript
// Use components from:
frontend/src/components/ui/loading-states.tsx
```

#### Step 2: Add Micro-interactions (1 hour)
- [ ] Button hover effects
- [ ] Card hover animations
- [ ] Success animations
- [ ] Number tickers

#### Step 3: Mobile Optimization (30 mins)
- [ ] Test on mobile devices
- [ ] Fix responsive issues
- [ ] Add touch gestures

---

### 8. Comprehensive Testing (3 hours) 🧪
**Priority: HIGH | Complexity: MEDIUM**

#### Step 1: Run Existing Tests (30 mins)
```bash
cd frontend
npm test
```

#### Step 2: Add Missing Tests (1.5 hours)
- [ ] Test new components (AI, Leaderboard, MultiSig)
- [ ] Test WebSocket connections
- [ ] Test SDK functions

#### Step 3: E2E Testing (1 hour)
```bash
# Install Cypress
npm install --save-dev cypress

# Create E2E tests
npx cypress open
```

---

## Implementation Priority Matrix

### Must Have (Day 1)
1. ✅ AI Trading Assistant
2. ✅ Trader Leaderboard
3. ✅ Basic Multi-Sig

### Should Have (Day 2)
4. ⏳ WebSocket Real-time
5. ⏳ Merkle Integration
6. ⏳ UI Polish

### Nice to Have (If Time)
7. ⏳ Full API Implementation
8. ⏳ Published NPM SDK
9. ⏳ 100% Test Coverage

---

## Quick Start Checklist

### Immediate Actions (30 mins)
- [ ] Add AI API key to `.env.local`
- [ ] Create `/leaderboard` page route
- [ ] Test all existing features work

### Day 1 Goals
- [ ] AI Assistant responding to commands
- [ ] Leaderboard showing mock data
- [ ] Multi-sig component integrated

### Day 2 Goals
- [ ] Real-time price updates
- [ ] Merkle Trade connection
- [ ] All tests passing

### Final Polish
- [ ] Demo video recorded
- [ ] All features documented
- [ ] Deployed to testnet

---

## Resources & References

### APIs Needed
- OpenAI/Anthropic API for AI Assistant
- WebSocket server for real-time data
- Merkle Trade testnet endpoints

### Documentation
- [Aptos SDK Docs](https://aptos.dev)
- [Merkle Trade Docs](https://docs.merkle.trade)
- [Next.js 13 Docs](https://nextjs.org/docs)

### Testing Resources
- [Jest Documentation](https://jestjs.io)
- [React Testing Library](https://testing-library.com/react)
- [Cypress E2E](https://cypress.io)

---

## Troubleshooting Common Issues

### AI Assistant Not Responding
1. Check API key in `.env.local`
2. Verify CORS settings
3. Check browser console for errors

### WebSocket Connection Failed
1. Ensure WebSocket server is running
2. Check firewall/proxy settings
3. Try `ws://` instead of `wss://` for local

### Tests Failing
1. Run `npm install` to ensure dependencies
2. Clear jest cache: `npm test -- --clearCache`
3. Check mock implementations

---

## Success Metrics

### Technical Excellence
- [ ] All features working on testnet
- [ ] <2s page load time
- [ ] 0 console errors
- [ ] 70%+ test coverage

### User Experience
- [ ] AI responds in <3s
- [ ] Real-time updates working
- [ ] Mobile responsive
- [ ] Smooth animations

### Demo Ready
- [ ] 5 min demo prepared
- [ ] All features accessible
- [ ] Fallback for failures
- [ ] Impressive opening

Good luck! 🚀