"use client"

import { PropsWithChildren } from "react"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { PetraWallet } from "petra-plugin-wallet-adapter"
import { Network } from "@aptos-labs/ts-sdk"

// Wallets that support AIP-62 (like Martian, Nightly, etc.) will auto-detect
const wallets = [
  new PetraWallet(),
]

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET,
        aptosConnectDappId: "remora-defi",
      }}
      onError={(error) => {
        console.error("Wallet error:", error)
        // Show user-friendly error message
        if (error.message?.includes("Network")) {
          console.log("Please make sure your wallet is connected to Aptos Testnet")
        }
        if (error.message?.includes("Martian")) {
          console.log("Martian wallet connection failed. Please refresh and try again.")
        }
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}