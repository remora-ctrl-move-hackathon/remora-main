"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function WalletButton() {
  const {
    connect,
    disconnect,
    account,
    connected,
    wallets,
  } = useWallet()

  const [showWalletModal, setShowWalletModal] = useState(false)
  const [balance, setBalance] = useState<string>("0")

  // Fetch balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!connected || !account) return

      try {
        const response = await fetch(
          `https://fullnode.testnet.aptoslabs.com/v1/accounts/${account.address}/resources`
        )
        const resources = await response.json()
        
        const accountResource = resources.find(
          (r: any) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        )
        
        if (accountResource) {
          const balanceValue = accountResource.data.coin.value
          setBalance((parseInt(balanceValue) / 100000000).toFixed(2))
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error)
        setBalance("0")
      }
    }

    fetchBalance()
  }, [account, connected])

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName)
      setShowWalletModal(false)
    } catch (error: any) {
      console.error("Failed to connect:", error)
      // Show user-friendly error message
      if (error.message?.includes("Network") || error.message?.includes("network")) {
        alert("Please switch your wallet to Aptos Testnet and try again")
      } else if (error.message?.includes("User rejected")) {
        // User cancelled - do nothing
      } else {
        alert(`Connection failed: ${error.message || "Please make sure you have a wallet installed"}`)
      }
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error("Failed to disconnect:", error)
    }
  }

  if (connected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-white border-0 h-9 px-4 text-sm font-light transition-all duration-200 shadow-sm hover:shadow-md">
            <Wallet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{balance} APT</span>
            <span className="sm:hidden">
              {account.address.slice(0, 4)}...{account.address.slice(-4)}
            </span>
            <ChevronDown className="h-3 w-3 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white border-border/50">
          <div className="px-3 py-2">
            <p className="text-sm font-light">Connected</p>
            <p className="text-xs text-muted-foreground font-light truncate">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
          </div>
          <DropdownMenuSeparator />
          <div className="px-3 py-2">
            <p className="text-sm font-light text-muted-foreground">Balance</p>
            <p className="text-lg font-light">{balance} APT</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="text-red-600 font-light cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowWalletModal(true)}
        className="bg-primary hover:bg-primary/90 text-white border-0 h-9 px-4 text-sm font-light transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>

      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-md bg-white border-border/50">
          <DialogHeader>
            <DialogTitle className="font-light text-xl">Connect Wallet</DialogTitle>
            <DialogDescription className="font-light">
              Choose a wallet to connect to Remora on Aptos Testnet
            </DialogDescription>
          </DialogHeader>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-900">Network: Aptos Testnet</p>
            <p className="text-xs text-blue-700 mt-1">Make sure your wallet is set to Testnet</p>
          </div>
          <div className="grid gap-3 py-4">
            {wallets && wallets.length > 0 ? (
              wallets.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="outline"
                  onClick={() => handleConnect(wallet.name)}
                  className="w-full justify-start border-border/50 hover:bg-primary/5 hover:border-primary/50 font-light transition-all duration-200"
                >
                  {wallet.icon && (
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name}
                      className="h-5 w-5 mr-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  {wallet.name}
                </Button>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground font-light mb-2">
                  No wallets detected
                </p>
                <p className="text-xs text-muted-foreground font-light mb-4">
                  Please install a wallet to continue
                </p>
                <div className="space-y-2">
                  <a
                    href="https://petra.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline font-light"
                  >
                    Install Petra Wallet →
                  </a>
                  <a
                    href="https://martianwallet.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline font-light"
                  >
                    Install Martian Wallet →
                  </a>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}