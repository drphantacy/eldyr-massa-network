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
  mockWalletState,
  connectedWalletState,
  createMockPet,
} from '@/data/mockData';

interface ElydrContextType {
  wallet: WalletState;
  connectWallet: () => void;
  disconnectWallet: () => void;
  currentPet: ElydrPet | null;
  mintPet: () => Promise<string>;
  linkYieldSource: (sourceId: string) => void;
  simulateEvolution: () => void;
  yieldSources: YieldSource[];
  tournaments: Tournament[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

const ElydrContext = createContext<ElydrContextType | null>(null);

export function ElydrProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(mockWalletState);
  const [currentPet, setCurrentPet] = useState<ElydrPet | null>(null);
  const [yieldSources] = useState<YieldSource[]>(mockYieldSources);
  const [tournaments] = useState<Tournament[]>(mockTournaments);
  const [leaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPet = localStorage.getItem('elydr-pet');
      const savedWallet = localStorage.getItem('elydr-wallet');
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
      if (savedWallet) {
        setWallet(JSON.parse(savedWallet));
      }
    }
  }, []);

  useEffect(() => {
    if (currentPet && typeof window !== 'undefined') {
      localStorage.setItem('elydr-pet', JSON.stringify(currentPet));
    }
  }, [currentPet]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('elydr-wallet', JSON.stringify(wallet));
    }
  }, [wallet]);

  const connectWallet = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setWallet(connectedWalletState);
      setIsLoading(false);
    }, 800);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet(mockWalletState);
    setCurrentPet(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('elydr-pet');
      localStorage.removeItem('elydr-wallet');
    }
  }, []);

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
