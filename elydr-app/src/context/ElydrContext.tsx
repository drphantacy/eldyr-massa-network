'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { ElydrPet, YieldSource, Tournament, LeaderboardEntry, WalletState, EvolutionEvent } from '@/types';
import { mockYieldSources, mockTournaments, mockLeaderboard } from '@/data/mockData';
import { useMassaWallet } from '@/hooks/useMassaWallet';
import { processEvolution, createNewPet } from '@/utils/evolution';
import { mintPetOnChain, CONTRACT_ADDRESS, NETWORK } from '@/lib/contract';

interface ElydrContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  currentPet: ElydrPet | null;
  mintPet: () => Promise<string>;
  linkYieldSource: (sourceId: string) => void;
  simulateEvolution: () => void;
  yieldSources: YieldSource[];
  tournaments: Tournament[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  walletError: string | null;
  contractAddress: string;
  network: string;
}

const ElydrContext = createContext<ElydrContextType | null>(null);

const STORAGE_KEY = 'elydr-pet';

function deserializePet(data: string): ElydrPet {
  const pet = JSON.parse(data);
  return {
    ...pet,
    nextCheckAt: new Date(pet.nextCheckAt),
    mintedAt: new Date(pet.mintedAt),
    history: pet.history.map((e: EvolutionEvent) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    })),
  };
}

export function ElydrProvider({ children }: { children: React.ReactNode }) {
  const massaWallet = useMassaWallet();
  const [currentPet, setCurrentPet] = useState<ElydrPet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallet = useMemo<WalletState>(
    () => ({
      isConnected: massaWallet.status === 'connected',
      address: massaWallet.address,
      balance: massaWallet.balance,
      networkId: 'massa-mainnet',
      networkName: massaWallet.networkName,
    }),
    [massaWallet.status, massaWallet.address, massaWallet.balance, massaWallet.networkName]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCurrentPet(deserializePet(saved));
      } catch (e) {
        console.error('Failed to load pet:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentPet) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPet));
    }
  }, [currentPet]);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await massaWallet.connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [massaWallet]);

  const disconnectWallet = useCallback(async () => {
    await massaWallet.disconnect();
    setCurrentPet(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [massaWallet]);

  const mintPet = useCallback(async (): Promise<string> => {
    if (!wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await mintPetOnChain(massaWallet.account);
      setCurrentPet(createNewPet(result.petId));
      return result.petId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Minting failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.isConnected, massaWallet.account]);

  const linkYieldSource = useCallback((sourceId: string) => {
    setCurrentPet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        linkedYieldSourceId: sourceId,
        nextCheckAt: new Date(Date.now() + 1800000),
      };
    });
  }, []);

  const simulateEvolution = useCallback(() => {
    setCurrentPet((prev) => {
      if (!prev?.linkedYieldSourceId) return prev;

      const yieldSource = mockYieldSources.find((s) => s.id === prev.linkedYieldSourceId);
      if (!yieldSource) return prev;

      return processEvolution(prev, yieldSource);
    });
  }, []);

  const contextValue = useMemo<ElydrContextType>(
    () => ({
      wallet,
      connectWallet,
      disconnectWallet,
      currentPet,
      mintPet,
      linkYieldSource,
      simulateEvolution,
      yieldSources: mockYieldSources,
      tournaments: mockTournaments,
      leaderboard: mockLeaderboard,
      isLoading,
      error,
      walletError: massaWallet.error,
      contractAddress: CONTRACT_ADDRESS,
      network: NETWORK,
    }),
    [
      wallet,
      connectWallet,
      disconnectWallet,
      currentPet,
      mintPet,
      linkYieldSource,
      simulateEvolution,
      isLoading,
      error,
      massaWallet.error,
    ]
  );

  return <ElydrContext.Provider value={contextValue}>{children}</ElydrContext.Provider>;
}

export function useElydr() {
  const context = useContext(ElydrContext);
  if (!context) {
    throw new Error('useElydr must be used within an ElydrProvider');
  }
  return context;
}
