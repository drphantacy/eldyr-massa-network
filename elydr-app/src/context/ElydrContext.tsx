'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ElydrPet,
  YieldSource,
  Tournament,
  LeaderboardEntry,
  WalletState,
  ElydrStage,
  EvolutionEvent,
  STAGE_THRESHOLDS,
  APY_GROWTH_BANDS,
} from '@/types';
import {
  mockYieldSources,
  mockTournaments,
  mockLeaderboard,
} from '@/data/mockData';
import { useMassaWallet } from '@/hooks/useMassaWallet';

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
}

const ElydrContext = createContext<ElydrContextType | null>(null);

export function ElydrProvider({ children }: { children: React.ReactNode }) {
  const massaWallet = useMassaWallet();
  const [currentPet, setCurrentPet] = useState<ElydrPet | null>(null);
  const [yieldSources] = useState<YieldSource[]>(mockYieldSources);
  const [tournaments] = useState<Tournament[]>(mockTournaments);
  const [leaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallet: WalletState = {
    isConnected: massaWallet.status === 'connected',
    address: massaWallet.address,
    balance: massaWallet.balance,
    networkId: 'massa-mainnet',
    networkName: massaWallet.networkName,
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPet = localStorage.getItem('elydr-pet');
      if (savedPet) {
        const pet = JSON.parse(savedPet);
        pet.nextCheckAt = new Date(pet.nextCheckAt);
        pet.mintedAt = new Date(pet.mintedAt);
        pet.history = pet.history.map((e: EvolutionEvent) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
        setCurrentPet(pet);
      }
    }
  }, []);

  useEffect(() => {
    if (currentPet && typeof window !== 'undefined') {
      localStorage.setItem('elydr-pet', JSON.stringify(currentPet));
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
      localStorage.removeItem('elydr-pet');
    }
  }, [massaWallet]);

  const mintPet = useCallback(async (): Promise<string> => {
    if (!wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        const petId = Math.floor(Math.random() * 9000 + 1000).toString();
        const newPet: ElydrPet = {
          id: petId,
          name: `Elydr #${petId}`,
          stage: 'egg',
          path: 'undetermined',
          spriteType: 'dragon',
          level: 1,
          growthPoints: 0,
          totalGrowthPoints: 0,
          nextCheckAt: new Date(Date.now() + 1800000),
          linkedYieldSourceId: null,
          mintedAt: new Date(),
          history: [],
          power: 5,
          defense: 5,
          agility: 5,
        };
        setCurrentPet(newPet);
        setIsLoading(false);
        resolve(petId);
      }, 1500);
    });
  }, [wallet.isConnected]);

  const linkYieldSource = useCallback((sourceId: string) => {
    if (!currentPet) return;

    setCurrentPet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        linkedYieldSourceId: sourceId,
        nextCheckAt: new Date(Date.now() + 1800000),
      };
    });
  }, [currentPet]);

  const getNextStage = (current: ElydrStage, points: number): ElydrStage => {
    const stages: ElydrStage[] = ['egg', 'hatchling', 'young', 'mature', 'elder'];
    const currentIndex = stages.indexOf(current);

    for (let i = stages.length - 1; i > currentIndex; i--) {
      if (points >= STAGE_THRESHOLDS[stages[i]]) {
        return stages[i];
      }
    }
    return current;
  };

  const simulateEvolution = useCallback(() => {
    if (!currentPet || !currentPet.linkedYieldSourceId) return;

    const yieldSource = yieldSources.find(
      (s) => s.id === currentPet.linkedYieldSourceId
    );
    if (!yieldSource) return;

    const apy = yieldSource.apy + (Math.random() * 2 - 1);
    const band = APY_GROWTH_BANDS.find(
      (b) => apy >= b.minApy && apy < b.maxApy
    );
    const pointsAwarded = band?.points || 1;

    const newTotalPoints = currentPet.totalGrowthPoints + pointsAwarded;
    const newStage = getNextStage(currentPet.stage, newTotalPoints);
    const evolved = newStage !== currentPet.stage;

    let newPath = currentPet.path;
    if (currentPet.path === 'undetermined' && currentPet.history.length >= 9) {
      const avgPoints =
        currentPet.history.reduce((sum, e) => sum + e.growthPointsAwarded, 0) /
        currentPet.history.length;
      newPath = avgPoints >= 3.5 ? 'mythic' : 'common';
    }

    const evolutionMessage = evolved
      ? `Your ${currentPet.stage} evolved into a ${newStage}! +${pointsAwarded} growth points!`
      : `Yield ${apy.toFixed(1)}% detected. +${pointsAwarded} growth points!`;

    const newEvent: EvolutionEvent = {
      timestamp: new Date(),
      yieldPercent: apy,
      growthPointsAwarded: pointsAwarded,
      previousStage: currentPet.stage,
      newStage,
      message: evolutionMessage,
    };

    const powerBoost = evolved ? 5 : pointsAwarded > 3 ? 2 : 1;
    const defenseBoost = evolved ? 4 : pointsAwarded > 2 ? 1 : 0;
    const agilityBoost = evolved ? 3 : Math.random() > 0.5 ? 1 : 0;

    setCurrentPet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stage: newStage,
        path: newPath,
        level: evolved ? prev.level + 1 : prev.level,
        growthPoints: newTotalPoints - STAGE_THRESHOLDS[newStage],
        totalGrowthPoints: newTotalPoints,
        nextCheckAt: new Date(Date.now() + 1800000),
        history: [newEvent, ...prev.history].slice(0, 20),
        power: prev.power + powerBoost,
        defense: prev.defense + defenseBoost,
        agility: prev.agility + agilityBoost,
      };
    });
  }, [currentPet, yieldSources]);

  return (
    <ElydrContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        currentPet,
        mintPet,
        linkYieldSource,
        simulateEvolution,
        yieldSources,
        tournaments,
        leaderboard,
        isLoading,
        error,
        walletError: massaWallet.error,
      }}
    >
      {children}
    </ElydrContext.Provider>
  );
}

export function useElydr() {
  const context = useContext(ElydrContext);
  if (!context) {
    throw new Error('useElydr must be used within an ElydrProvider');
  }
  return context;
}
