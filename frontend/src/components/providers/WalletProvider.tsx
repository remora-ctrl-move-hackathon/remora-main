"use client"

import { PropsWithChildren } from "react"
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import { PetraWallet } from "petra-plugin-wallet-adapter"
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter"

const wallets = [
  new PetraWallet(),
  new MartianWallet(),
]

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={false}
      dappConfig={{
        network: "testnet" as any,
        aptosConnectDappId: "remora-defi",
        aptosApiKey: undefined,
      }}
      onError={(error) => {
        console.error("Wallet error:", error)
        // Show user-friendly error message
        if (error.message?.includes("Network")) {
          console.log("Please make sure your wallet is connected to Aptos Testnet")
        }
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}