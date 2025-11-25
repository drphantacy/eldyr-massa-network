'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ElydrPet, YieldSource, Tournament, LeaderboardEntry, WalletState, EvolutionEvent } from '@/types';
import { mockYieldSources, mockTournaments, mockLeaderboard } from '@/data/mockData';
import { useMassaWallet } from '@/hooks/useMassaWallet';
import { processEvolution, createNewPet } from '@/utils/evolution';
import {
  mintPetOnChain,
  CONTRACT_ADDRESS,
  NETWORK,
  getTotalSupply,
  getPetFromChain,
  onChainPetToElydrPet,
  linkYieldSourceOnChain,
  stakeToPet as stakeToPetOnChain,
  unstakeFromPet as unstakeFromPetOnChain,
  releasePet as releasePetOnChain,
} from '@/lib/contract';

interface ElydrContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  pets: ElydrPet[];
  currentPet: ElydrPet | null;
  selectedPetId: string | null;
  selectPet: (petId: string) => void;
  mintPet: () => Promise<string>;
  linkYieldSource: (sourceId: string) => Promise<void>;
  loadPetsFromChain: () => Promise<void>;
  refreshPetsFromChain: () => Promise<void>;
  simulateEvolution: () => void;
  stakeToPet: (amount: string) => Promise<void>;
  unstakeFromPet: (percentage: number) => Promise<void>;
  releasePet: () => Promise<void>;
  yieldSources: YieldSource[];
  tournaments: Tournament[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  isLoadingPets: boolean;
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
    stakedAmount: pet.stakedAmount ?? 0,
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
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingPetsRef = useRef(false);

  const currentPet = useMemo(() => {
    if (!selectedPetId) return pets[0] || null;
    return pets.find(p => p.id === selectedPetId) || pets[0] || null;
  }, [pets, selectedPetId]);

  const wallet = useMemo<WalletState>(
    () => ({
      isConnected: massaWallet.status === 'connected',
      address: massaWallet.address,
      balance: massaWallet.balance,
      networkId: process.env.NEXT_PUBLIC_NETWORK_ID!,
      networkName: massaWallet.networkName,
    }),
    [massaWallet.status, massaWallet.address, massaWallet.balance, massaWallet.networkName]
  );

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [pets]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedPetId) {
      localStorage.setItem(SELECTED_PET_KEY, selectedPetId);
    }
  }, [selectedPetId]);

  useEffect(() => {
    if (wallet.isConnected && massaWallet.account && !isLoadingPetsRef.current) {
      console.log('Wallet connected, loading pets from chain...');
      loadPetsFromChainInternal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isConnected, massaWallet.account]);

  const loadPetsFromChainInternal = async () => {
    if (!massaWallet.account || isLoadingPetsRef.current) return;

    isLoadingPetsRef.current = true;
    setIsLoadingPets(true);
    try {
      const totalSupply = await getTotalSupply(massaWallet.account);
      const loadedPets: ElydrPet[] = [];

      for (let i = 1; i <= totalSupply; i++) {
        try {
          const onChainPet = await getPetFromChain(massaWallet.account, i);
          if (onChainPet.owner === massaWallet.address) {
            console.log(`Loading pet #${i} - Raw stakedAmount (nanoMAS):`, onChainPet.stakedAmount);
            const convertedPet = onChainPetToElydrPet(onChainPet) as ElydrPet;
            console.log(`Pet #${i} after conversion - stakedAmount (MAS):`, convertedPet.stakedAmount);
            loadedPets.push(convertedPet);
          }
        } catch (e) {
          // Silently skip pets that don't exist or can't be loaded
        }
      }

      if (loadedPets.length > 0) {
        setPets(loadedPets);
        if (!selectedPetId) {
          setSelectedPetId(loadedPets[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pets from chain:', err);
    } finally {
      setIsLoadingPets(false);
      isLoadingPetsRef.current = false;
    }
  };

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

  const refreshPetsFromChain = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SELECTED_PET_KEY);
    }
    setPets([]);
    setSelectedPetId(null);
    await loadPetsFromChainInternal();
  }, []);

  const selectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
  }, []);

  const mintPet = useCallback(async (): Promise<string> => {
    if (!wallet.isConnected || !massaWallet.account) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current total supply to know what the next pet ID will be
      const currentSupply = await getTotalSupply(massaWallet.account);
      const expectedPetId = (currentSupply + 1).toString();

      await mintPetOnChain(massaWallet.account);

      const tempPet = createNewPet(expectedPetId);
      setPets(prev => [...prev, tempPet]);
      setSelectedPetId(expectedPetId);

      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const onChainPet = await getPetFromChain(massaWallet.account, Number(expectedPetId));
        const realPet = onChainPetToElydrPet(onChainPet) as ElydrPet;

        setPets(prev => prev.map(pet =>
          pet.id === expectedPetId ? realPet : pet
        ));

        setSelectedPetId(realPet.id);
      } catch (fetchErr) {
        console.log('Pet not yet queryable, using local data');
      }

      return expectedPetId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Minting failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.isConnected, massaWallet.account]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadPetsFromChain = useCallback(async () => {
    await loadPetsFromChainInternal();
  }, []);

  const linkYieldSource = useCallback(async (sourceId: string) => {
    if (!currentPet || !massaWallet.account) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await linkYieldSourceOnChain(massaWallet.account, Number(currentPet.id), sourceId);

      setPets(prev => prev.map(pet =>
        pet.id === currentPet.id
          ? { ...pet, linkedYieldSourceId: sourceId, nextCheckAt: new Date(Date.now() + 1800000) }
          : pet
      ));
    } catch (err) {
      console.error('Failed to link yield source:', err);
      setError(err instanceof Error ? err.message : 'Failed to link yield source');
    } finally {
      setIsLoading(false);
    }
  }, [currentPet, massaWallet.account]);

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

  const stakeToPet = useCallback(async (amount: string) => {
    if (!currentPet) {
      setError('No pet selected');
      return;
    }
    if (!massaWallet.account) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await stakeToPetOnChain(massaWallet.account, Number(currentPet.id), amount);

      const newStakedAmount = Math.round(((currentPet.stakedAmount || 0) + parseFloat(amount)) * 100) / 100;
      setPets(prev => prev.map(pet =>
        pet.id === currentPet.id ? { ...pet, stakedAmount: newStakedAmount } : pet
      ));
    } catch (err) {
      console.error('Failed to stake:', err);
      setError(err instanceof Error ? err.message : 'Failed to stake');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentPet, massaWallet.account]);

  const unstakeFromPet = useCallback(async (percentage: number) => {
    if (!currentPet) {
      setError('No pet selected');
      return;
    }
    if (!massaWallet.account) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await unstakeFromPetOnChain(massaWallet.account, Number(currentPet.id), percentage);

      const unstakeAmount = (currentPet.stakedAmount || 0) * percentage / 100;
      const newStakedAmount = Math.round(((currentPet.stakedAmount || 0) - unstakeAmount) * 100) / 100;
      setPets(prev => prev.map(pet =>
        pet.id === currentPet.id ? { ...pet, stakedAmount: newStakedAmount } : pet
      ));
    } catch (err) {
      console.error('Failed to unstake:', err);
      setError(err instanceof Error ? err.message : 'Failed to unstake');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentPet, massaWallet.account]);

  const releasePet = useCallback(async () => {
    if (!currentPet) {
      setError('No pet selected');
      return;
    }
    if (!massaWallet.account) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await releasePetOnChain(massaWallet.account, Number(currentPet.id));

      const updatedPets = pets.filter(pet => pet.id !== currentPet.id);
      setPets(updatedPets);
      setSelectedPetId(null);

      if (typeof window !== 'undefined') {
        if (updatedPets.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPets));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        localStorage.removeItem(SELECTED_PET_KEY);
      }
    } catch (err) {
      console.error('Failed to release pet on chain:', err);
      setError(err instanceof Error ? err.message : 'Failed to release pet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentPet, massaWallet.account, pets]);

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
      loadPetsFromChain,
      refreshPetsFromChain,
      simulateEvolution,
      stakeToPet,
      unstakeFromPet,
      releasePet,
      yieldSources: mockYieldSources,
      tournaments: mockTournaments,
      leaderboard: mockLeaderboard,
      isLoading,
      isLoadingPets,
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
      loadPetsFromChain,
      refreshPetsFromChain,
      simulateEvolution,
      stakeToPet,
      unstakeFromPet,
      releasePet,
      isLoading,
      isLoadingPets,
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
