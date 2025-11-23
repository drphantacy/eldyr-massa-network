'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWallets, Wallet } from '@massalabs/wallet-provider';

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'no-wallet';

interface MassaAccount {
  address: string;
  balance: () => Promise<{ balance: string }>;
}

export interface MassaWalletState {
  status: WalletStatus;
  wallet: Wallet | null;
  account: MassaAccount | null;
  address: string | null;
  balance: string;
  networkName: string;
  error: string | null;
}

export interface UseMassaWalletReturn extends MassaWalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  availableWallets: Wallet[];
}

const initialState: MassaWalletState = {
  status: 'disconnected',
  wallet: null,
  account: null,
  address: null,
  balance: '0',
  networkName: 'Massa',
  error: null,
};

export function useMassaWallet(): UseMassaWalletReturn {
  const [state, setState] = useState<MassaWalletState>(initialState);
  const [availableWallets, setAvailableWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const detectWallets = async () => {
      try {
        const wallets = await getWallets();
        setAvailableWallets(wallets);

        if (wallets.length === 0) {
          setState(prev => ({ ...prev, status: 'no-wallet' }));
        }
      } catch (err) {
        console.error('Error detecting wallets:', err);
        setState(prev => ({
          ...prev,
          status: 'no-wallet',
          error: 'Failed to detect wallets'
        }));
      }
    };

    detectWallets();
  }, []);

  const connect = useCallback(async () => {
    if (availableWallets.length === 0) {
      setState(prev => ({
        ...prev,
        error: 'No Massa wallet found. Please install MassaStation or Bearby.'
      }));
      return;
    }

    setState(prev => ({ ...prev, status: 'connecting', error: null }));

    try {
      const wallet = availableWallets[0];

      if (wallet.connect) {
        await wallet.connect();
      }

      const accounts = await wallet.accounts();

      if (accounts.length === 0) {
        setState(prev => ({
          ...prev,
          status: 'disconnected',
          error: 'No accounts found. Please create an account in your wallet.'
        }));
        return;
      }

      const account = accounts[0] as unknown as MassaAccount;
      const address = account.address;

      let balance = '0';
      try {
        const balanceInfo = await account.balance();
        const masBalance = BigInt(balanceInfo.balance) / BigInt(1e9);
        balance = `${masBalance.toString()} MAS`;
      } catch {
        balance = '-- MAS';
      }

      let networkName = 'Massa';
      try {
        const networkInfo = await wallet.networkInfos();
        networkName = networkInfo.name || 'Massa';
      } catch {
        networkName = 'Massa';
      }

      setState({
        status: 'connected',
        wallet,
        account,
        address,
        balance,
        networkName,
        error: null,
      });

      if (wallet.listenAccountChanges) {
        wallet.listenAccountChanges(async (newAddress: string) => {
          const accounts = await wallet.accounts();
          const newAccount = accounts.find(a => (a as unknown as MassaAccount).address === newAddress) as unknown as MassaAccount;
          if (newAccount) {
            let newBalance = '0';
            try {
              const balanceInfo = await newAccount.balance();
              const masBalance = BigInt(balanceInfo.balance) / BigInt(1e9);
              newBalance = `${masBalance.toString()} MAS`;
            } catch {
              newBalance = '-- MAS';
            }
            setState(prev => ({
              ...prev,
              account: newAccount,
              address: newAddress,
              balance: newBalance,
            }));
          }
        });
      }

    } catch (err) {
      console.error('Error connecting wallet:', err);
      setState(prev => ({
        ...prev,
        status: 'disconnected',
        error: err instanceof Error ? err.message : 'Failed to connect wallet'
      }));
    }
  }, [availableWallets]);

  const disconnect = useCallback(async () => {
    try {
      if (state.wallet?.disconnect) {
        await state.wallet.disconnect();
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
    }

    setState(initialState);
  }, [state.wallet]);

  const refreshBalance = useCallback(async () => {
    if (!state.account) return;

    try {
      const balanceInfo = await state.account.balance();
      const masBalance = BigInt(balanceInfo.balance) / BigInt(1e9);
      setState(prev => ({
        ...prev,
        balance: `${masBalance.toString()} MAS`,
      }));
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  }, [state.account]);

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
    availableWallets,
  };
}
