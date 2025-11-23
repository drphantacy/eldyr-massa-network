export type ElydrStage = 'egg' | 'hatchling' | 'young' | 'mature' | 'elder';

export type ElydrPath = 'mythic' | 'common' | 'undetermined';

export type ElydrSpriteType = 'dragon' | 'phoenix' | 'griffin' | 'basilisk' | 'wyvern';

export interface EvolutionEvent {
  timestamp: Date;
  yieldPercent: number;
  growthPointsAwarded: number;
  previousStage: ElydrStage;
  newStage: ElydrStage;
  message: string;
}

export interface ElydrPet {
  id: string;
  name: string;
  stage: ElydrStage;
  path: ElydrPath;
  spriteType: ElydrSpriteType;
  level: number;
  growthPoints: number;
  totalGrowthPoints: number;
  nextCheckAt: Date;
  linkedYieldSourceId: string | null;
  mintedAt: Date;
  history: EvolutionEvent[];
  power: number;
  defense: number;
  agility: number;
}

export interface YieldSource {
  id: string;
  name: string;
  protocol: string;
  apy: number;
  riskLevel: 'low' | 'medium' | 'high';
  tvl: string;
  isMock: boolean;
  description: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  minStage: ElydrStage;
  requiredPath: ElydrPath | null;
  entryFee: string;
  rewardDescription: string;
  rewardAmount: string;
  status: 'upcoming' | 'active' | 'completed';
  participantsCount: number;
  maxParticipants: number;
  startTime: Date;
  endTime: Date;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  petName: string;
  petStage: ElydrStage;
  petPath: ElydrPath;
  lifetimeYieldScore: number;
  battlesWon: number;
  tournamentsEntered: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  networkId: string;
  networkName: string;
}

export interface ElydrState {
  wallet: WalletState;
  currentPet: ElydrPet | null;
  yieldSources: YieldSource[];
  tournaments: Tournament[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

export const STAGE_THRESHOLDS: Record<ElydrStage, number> = {
  egg: 0,
  hatchling: 10,
  young: 30,
  mature: 70,
  elder: 150,
};

export const APY_GROWTH_BANDS = [
  { minApy: 0, maxApy: 2, points: 1 },
  { minApy: 2, maxApy: 5, points: 2 },
  { minApy: 5, maxApy: 8, points: 3 },
  { minApy: 8, maxApy: 12, points: 4 },
  { minApy: 12, maxApy: 100, points: 5 },
];

export const PATH_THRESHOLDS = {
  mythicMinAvgPoints: 3.5,
  checksBeforePathDecision: 10,
};
