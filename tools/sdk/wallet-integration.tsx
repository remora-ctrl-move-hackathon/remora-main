// Wallet Integration Example for Remora App
// This file demonstrates how to integrate Aptos wallets

import React from 'react';
import {
  AptosWalletAdapterProvider,
  useWallet,
  WalletName,
} from '@aptos-labs/wallet-adapter-react';

// Import wallet plugins
import { PetraWallet } from '@petra/wallet-adapter-plugin';
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter';
import { PontemWallet } from '@pontem/wallet-adapter-plugin';
import { RiseWallet } from '@rise-wallet/wallet-adapter';
import { MSafeWallet } from '@msafe/aptos-wallet-adapter';
import { OKXWallet } from '@okwallet/aptos-wallet-adapter';
import { TrustWallet } from '@trustwallet/aptos-wallet-adapter';

// Initialize wallets array
const wallets = [
  new PetraWallet(),
  new MartianWallet(),
  new PontemWallet(),
  new RiseWallet(),
  new MSafeWallet(),
  new OKXWallet(),
  new TrustWallet(),
];

// Wallet Provider Component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      wallets={wallets}
      autoConnect={true}
      onError={(error) => {
        console.error('Wallet error:', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

// Connect Wallet Button Component
export function ConnectWalletButton() {
  const {
    connect,
    disconnect,
    wallet,
    wallets,
    connected,
    account,
    signAndSubmitTransaction,
    signMessage,
  } = useWallet();

  const handleConnect = async (walletName: WalletName) => {
    try {
      await connect(walletName);
      console.log('Connected to wallet:', walletName);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      console.log('Disconnected from wallet');
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (connected && account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3>Connect Wallet</h3>
      {wallets.map((wallet) => (
        <button
          key={wallet.name}
          onClick={() => handleConnect(wallet.name)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Connect {wallet.name}
        </button>
      ))}
    </div>
  );
}

// Transaction Example Component
export function TransactionExample() {
  const { signAndSubmitTransaction, connected, account } = useWallet();

  const handleTransaction = async () => {
    if (!connected || !account) {
      alert('Please connect your wallet first');
      return;
    }

    const payload = {
      type: 'entry_function_payload',
      function: '0x1::aptos_account::transfer',
      type_arguments: [],
      arguments: [
        '0x1234...', // recipient address
        '100000000', // amount (1 APT = 100000000 octas)
      ],
    };

    try {
      const response = await signAndSubmitTransaction(payload);
      console.log('Transaction submitted:', response);
      alert(`Transaction successful! Hash: ${response.hash}`);
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed!');
    }
  };

  return (
    <button
      onClick={handleTransaction}
      disabled={!connected}
      className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
    >
      Send Transaction
    </button>
  );
}

// Message Signing Example
export function SignMessageExample() {
  const { signMessage, connected } = useWallet();

  const handleSignMessage = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    const message = 'Welcome to Remora DeFi Super App!';
    const nonce = Math.random().toString();

    try {
      const response = await signMessage({
        message,
        nonce,
      });
      console.log('Message signed:', response);
      alert('Message signed successfully!');
    } catch (error) {
      console.error('Failed to sign message:', error);
      alert('Failed to sign message!');
    }
  };

  return (
    <button
      onClick={handleSignMessage}
      disabled={!connected}
      className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
    >
      Sign Message
    </button>
  );
}

// Account Balance Component
export function AccountBalance() {
  const { account, connected } = useWallet();
  const [balance, setBalance] = React.useState<string>('0');

  React.useEffect(() => {
    const fetchBalance = async () => {
      if (!connected || !account) return;

      try {
        const response = await fetch(
          `https://fullnode.testnet.aptoslabs.com/v1/accounts/${account.address}/resources`
        );
        const resources = await response.json();
        
        const accountResource = resources.find(
          (r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
        );
        
        if (accountResource) {
          const balance = accountResource.data.coin.value;
          setBalance((parseInt(balance) / 100000000).toFixed(4));
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, [account, connected]);

  if (!connected) {
    return null;
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">Account Balance</h3>
      <p>{balance} APT</p>
    </div>
  );
}