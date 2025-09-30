"use client"

import { useState } from "react"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { initializeModules } from "@/scripts/initialize-modules"
import { Loader2, Settings } from "lucide-react"
import toast from "react-hot-toast"

export function InitializeButton() {
  const { account, signAndSubmitTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const handleInitialize = async () => {
    if (!account || !signAndSubmitTransaction) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      setLoading(true)
      toast("Initializing modules... This may take a moment")
      
      const results = await initializeModules(signAndSubmitTransaction)
      
      if (results.streaming && results.vault && results.offramp) {
        setInitialized(true)
        toast.success("All modules initialized successfully!")
      } else {
        toast.error("Some modules failed to initialize. Check console for details.")
      }
    } catch (error: any) {
      console.error("Initialization error:", error)
      toast.error("Failed to initialize modules: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialized) {
    return null // Hide button once initialized
  }

  return (
    <Button
      onClick={handleInitialize}
      disabled={loading || !account}
      variant="outline"
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Initializing...
        </>
      ) : (
        <>
          <Settings className="h-4 w-4" />
          Initialize Modules
        </>
      )}
    </Button>
  )
}