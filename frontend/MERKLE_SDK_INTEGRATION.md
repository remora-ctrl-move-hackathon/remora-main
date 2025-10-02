# How the Merkle Trade SDK is Used in This Project

This document provides a simplified explanation of how the `@merkletrade/ts-sdk` is integrated into the frontend to power the perpetuals trading features.

## Core Architecture

The integration follows a standard frontend pattern that separates concerns into three main parts:

1.  **The Service (`src/services/merkle-trading.service.ts`)**
    *   This is the "brain" of the integration.
    *   It directly imports and uses the `@merkletrade/ts-sdk`.
    *   It is responsible for all communication with the Merkle Trade APIs (fetching data, creating transactions, etc.).

2.  **The Hook (`src/hooks/useMerkleTrading.ts`)**
    *   This is the "bridge" between the service and the user interface.
    *   It calls the service to get data and holds it in a state that React components can use.
    *   It handles user actions and works with the Aptos wallet adapter to sign and submit transactions.

3.  **The UI Components (e.g., inside `src/app/trading/`)**
    *   This is the "face" of the feature.
    *   These are the visual elements the user sees and interacts with (buttons, charts, forms).
    *   They use the hook to display data and to trigger actions.

## How Placing a Trade Works (Step-by-Step)

1.  **User Action**: You click a "Buy" or "Sell" button in the UI.
2.  **UI Component**: The component calls an action function (e.g., `placeOrder`) from the `useMerkleTrading` hook.
3.  **Hook**: The hook calls the corresponding function in the `merkleTradingService`.
4.  **Service**: The service uses the **Merkle Trade SDK** to generate the correct transaction data (a "payload").
5.  **Return to Hook**: The service returns this payload to the hook.
6.  **Wallet Prompt**: The hook uses the Aptos wallet adapter to prompt you to approve the transaction.
7.  **Submission**: Your wallet signs and submits the transaction to the Aptos blockchain.

This pattern keeps the code organized by ensuring that only the `merkle-trading.service.ts` file needs to know the specific details of the Merkle Trade SDK.
