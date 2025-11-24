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
  pets: ElydrPet[];
  currentPet: ElydrPet | null;
  selectedPetId: string | null;
  selectPet: (petId: string) => void;
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

const STORAGE_KEY = 'elydr-pets';
const SELECTED_PET_KEY = 'elydr-selected-pet';

function deserializePet(pet: any): ElydrPet {
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

function deserializePets(data: string): ElydrPet[] {
  const pets = JSON.parse(data);
  return pets.map(deserializePet);
}

export function ElydrProvider({ children }: { children: React.ReactNode }) {
  const massaWallet = useMassaWallet();
  const [pets, setPets] = useState<ElydrPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPet = useMemo(() => {
    if (!selectedPetId) return pets[0] || null;
    return pets.find(p => p.id === selectedPetId) || pets[0] || null;
  }, [pets, selectedPetId]);

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

  // Load pets from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedPets = localStorage.getItem(STORAGE_KEY);
    const savedSelectedId = localStorage.getItem(SELECTED_PET_KEY);
    if (savedPets) {
      try {
        setPets(deserializePets(savedPets));
      } catch (e) {
        console.error('Failed to load pets:', e);
      }
    }
    if (savedSelectedId) {
      setSelectedPetId(savedSelectedId);
    }
  }, []);

  // Save pets to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    }
  }, [pets]);

  // Save selected pet id
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedPetId) {
      localStorage.setItem(SELECTED_PET_KEY, selectedPetId);
    }
  }, [selectedPetId]);

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
    setPets([]);
    setSelectedPetId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SELECTED_PET_KEY);
    }
  }, [massaWallet]);

  const selectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
  }, []);

  const mintPet = useCallback(async (): Promise<string> => {
    if (!wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await mintPetOnChain(massaWallet.account);
      const newPet = createNewPet(result.petId);
      setPets(prev => [...prev, newPet]);
      setSelectedPetId(result.petId);
      return result.petId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Minting failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.isConnected, massaWallet.account]);

  const linkYieldSource = useCallback((sourceId: string) => {
    if (!currentPet) return;
    setPets(prev => prev.map(pet =>
      pet.id === currentPet.id
        ? { ...pet, linkedYieldSourceId: sourceId, nextCheckAt: new Date(Date.now() + 1800000) }
        : pet
    ));
  }, [currentPet]);

  const simulateEvolution = useCallback(() => {
    if (!currentPet?.linkedYieldSourceId) return;

    const yieldSource = mockYieldSources.find((s) => s.id === currentPet.linkedYieldSourceId);
    if (!yieldSource) return;

    setPets(prev => prev.map(pet =>
      pet.id === currentPet.id
        ? processEvolution(pet, yieldSource)
        : pet
    ));
  }, [currentPet]);

  const contextValue = useMemo<ElydrContextType>(
    () => ({
      wallet,
      connectWallet,
      disconnectWallet,
      pets,
      currentPet,
      selectedPetId,
      selectPet,
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
      pets,
      currentPet,
      selectedPetId,
      selectPet,
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
