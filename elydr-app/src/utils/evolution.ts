import {
  ElydrPet,
  ElydrStage,
  ElydrPath,
  EvolutionEvent,
  YieldSource,
  STAGE_THRESHOLDS,
  APY_GROWTH_BANDS,
} from '@/types';

const STAGES: ElydrStage[] = ['egg', 'hatchling', 'young', 'mature', 'elder'];
const EVOLUTION_INTERVAL = 3600000;

export function getNextStage(current: ElydrStage, points: number): ElydrStage {
  const currentIndex = STAGES.indexOf(current);

  for (let i = STAGES.length - 1; i > currentIndex; i--) {
    if (points >= STAGE_THRESHOLDS[STAGES[i]]) {
      return STAGES[i];
    }
  }
  return current;
}

export function calculateGrowthPoints(apy: number): number {
  const band = APY_GROWTH_BANDS.find((b) => apy >= b.minApy && apy < b.maxApy);
  return band?.points || 1;
}

export function determinePath(history: EvolutionEvent[]): ElydrPath {
  if (history.length < 10) return 'undetermined';

  const avgPoints =
    history.reduce((sum, e) => sum + e.growthPointsAwarded, 0) / history.length;
  return avgPoints >= 3.5 ? 'mythic' : 'common';
}

export function calculateStatBoosts(evolved: boolean, pointsAwarded: number) {
  return {
    power: evolved ? 5 : pointsAwarded > 3 ? 2 : 1,
    defense: evolved ? 4 : pointsAwarded > 2 ? 1 : 0,
    agility: evolved ? 3 : Math.random() > 0.5 ? 1 : 0,
  };
}

export function processEvolution(
  pet: ElydrPet,
  yieldSource: YieldSource
): ElydrPet {
  const apy = yieldSource.apy + (Math.random() * 2 - 1);
  const pointsAwarded = calculateGrowthPoints(apy);
  const newTotalPoints = pet.totalGrowthPoints + pointsAwarded;
  const newStage = getNextStage(pet.stage, newTotalPoints);
  const evolved = newStage !== pet.stage;

  const newPath =
    pet.path === 'undetermined' && pet.history.length >= 9
      ? determinePath(pet.history)
      : pet.path;

  const evolutionMessage = evolved
    ? `Your ${pet.stage} evolved into a ${newStage}! +${pointsAwarded} growth points!`
    : `Yield ${apy.toFixed(1)}% detected. +${pointsAwarded} growth points!`;

  const newEvent: EvolutionEvent = {
    timestamp: new Date(),
    yieldPercent: apy,
    growthPointsAwarded: pointsAwarded,
    previousStage: pet.stage,
    newStage,
    message: evolutionMessage,
  };

  const boosts = calculateStatBoosts(evolved, pointsAwarded);

  return {
    ...pet,
    stage: newStage,
    path: newPath,
    level: evolved ? pet.level + 1 : pet.level,
    growthPoints: newTotalPoints - STAGE_THRESHOLDS[newStage],
    totalGrowthPoints: newTotalPoints,
    nextCheckAt: new Date(Date.now() + EVOLUTION_INTERVAL),
    history: [newEvent, ...pet.history].slice(0, 20),
    power: pet.power + boosts.power,
    defense: pet.defense + boosts.defense,
    agility: pet.agility + boosts.agility,
  };
}

export function createNewPet(petId: string): ElydrPet {
  return {
    id: petId,
    name: `Eldyr #${petId}`,
    stage: 'egg',
    path: 'undetermined',
    spriteType: 'dragon',
    spriteId: 1,
    level: 1,
    growthPoints: 0,
    totalGrowthPoints: 0,
    nextCheckAt: new Date(Date.now() + EVOLUTION_INTERVAL),
    linkedYieldSourceId: null,
    mintedAt: new Date(),
    history: [],
    power: 5,
    defense: 5,
    agility: 5,
    stakedAmount: 0,
  };
}

export function generatePetId(): string {
  return Math.floor(Math.random() * 9000 + 1000).toString();
}
