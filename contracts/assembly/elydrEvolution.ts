import {
  Storage,
  Context,
  generateEvent,
  deferredCallRegister,
  Slot,
} from "@massalabs/massa-as-sdk";
import {
  Args,
  stringToBytes,
  bytesToString,
  u64ToBytes,
  bytesToU64,
} from "@massalabs/as-types";
import { ElydrPet, STAGES, PATHS } from "./elydrNFT";

const NFT_CONTRACT_KEY = stringToBytes("NFT_CONTRACT");
const EVOLUTION_INTERVAL_KEY = stringToBytes("EVOLUTION_INTERVAL");
const PENDING_CHECKS_KEY = stringToBytes("PENDING_CHECKS");
const YIELD_SOURCE_PREFIX = stringToBytes("YIELD_SOURCE_");

const STAGE_THRESHOLDS: u64[] = [0, 10, 30, 70, 150];

const APY_GROWTH_BANDS: u8[][] = [
  [0, 2, 1],
  [2, 5, 2],
  [5, 8, 3],
  [8, 12, 4],
  [12, 100, 5]
];

function getYieldSourceKey(sourceId: string): StaticArray<u8> {
  return new Args().add(YIELD_SOURCE_PREFIX).add(sourceId).serialize();
}

function getPetKey(petId: u64): StaticArray<u8> {
  return new Args().add(stringToBytes("PET_")).add(petId).serialize();
}

export function constructorEvolution(args: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Already deployed");

  const parsedArgs = new Args(args);
  const nftContractAddress = parsedArgs.nextString().expect("Failed to parse NFT contract address");

  Storage.set(NFT_CONTRACT_KEY, stringToBytes(nftContractAddress));
  Storage.set(EVOLUTION_INTERVAL_KEY, u64ToBytes(1800000));
  Storage.set(PENDING_CHECKS_KEY, u64ToBytes(0));

  generateEvent("ElydrEvolution contract deployed, linked to NFT contract: " + nftContractAddress);

  scheduleNextCheck();
}

export function registerYieldSource(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const sourceId = parsedArgs.nextString().expect("Failed to parse sourceId");
  const name = parsedArgs.nextString().expect("Failed to parse name");
  const currentApy = parsedArgs.nextU8().expect("Failed to parse currentApy");

  const yieldSourceData = new Args()
    .add(sourceId)
    .add(name)
    .add(currentApy)
    .add(Context.timestamp())
    .serialize();

  Storage.set(getYieldSourceKey(sourceId), yieldSourceData);

  generateEvent("Yield source registered: " + name + " with APY: " + currentApy.toString() + "%");
}

export function updateYieldSourceApy(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const sourceId = parsedArgs.nextString().expect("Failed to parse sourceId");
  const newApy = parsedArgs.nextU8().expect("Failed to parse newApy");

  const yieldSourceKey = getYieldSourceKey(sourceId);
  assert(Storage.has(yieldSourceKey), "Yield source not found");

  const existingData = new Args(Storage.get(yieldSourceKey));
  const existingSourceId = existingData.nextString().expect("Failed to read sourceId");
  const existingName = existingData.nextString().expect("Failed to read name");

  const updatedData = new Args()
    .add(existingSourceId)
    .add(existingName)
    .add(newApy)
    .add(Context.timestamp())
    .serialize();

  Storage.set(yieldSourceKey, updatedData);

  generateEvent("Yield source " + sourceId + " APY updated to: " + newApy.toString() + "%");
}

export function getYieldSource(args: StaticArray<u8>): StaticArray<u8> {
  const parsedArgs = new Args(args);
  const sourceId = parsedArgs.nextString().expect("Failed to parse sourceId");

  const yieldSourceKey = getYieldSourceKey(sourceId);
  assert(Storage.has(yieldSourceKey), "Yield source not found");

  return Storage.get(yieldSourceKey);
}

function calculateGrowthPoints(apy: u8): u8 {
  for (let i = 0; i < APY_GROWTH_BANDS.length; i++) {
    if (apy >= APY_GROWTH_BANDS[i][0] && apy < APY_GROWTH_BANDS[i][1]) {
      return APY_GROWTH_BANDS[i][2];
    }
  }
  return 1;
}

function getNextStage(currentStage: u8, totalPoints: u64): u8 {
  for (let i: u8 = 4; i > currentStage; i--) {
    if (totalPoints >= STAGE_THRESHOLDS[i]) {
      return i;
    }
  }
  return currentStage;
}

function determinePath(checkCount: u64, avgPoints: u64): u8 {
  if (checkCount < 10) {
    return 0;
  }
  if (avgPoints * 2 >= 7) {
    return 2;
  }
  return 1;
}

export function processEvolution(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");

  generateEvent("Processing evolution for Pet #" + petId.toString());
  scheduleNextCheck();
}

export function autonomousEvolutionCheck(_: StaticArray<u8>): void {
  const currentTime = Context.timestamp();
  generateEvent("Autonomous evolution check triggered at: " + currentTime.toString());
  scheduleNextCheck();
}

function scheduleNextCheck(): void {
  const currentPeriod = Context.currentPeriod();
  const periodsToWait: u64 = 112;
  const nextPeriod = currentPeriod + periodsToWait;
  const selfAddress = Context.callee().toString();

  const callId = deferredCallRegister(
    selfAddress,
    "autonomousEvolutionCheck",
    new Slot(nextPeriod, 0),
    10_000_000,
    new Args().serialize(),
    0
  );

  generateEvent("Next autonomous check scheduled. Call ID: " + callId + " at period: " + nextPeriod.toString());
}

export function evolvePet(args: StaticArray<u8>): StaticArray<u8> {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");
  const currentApy = parsedArgs.nextU8().expect("Failed to parse currentApy");
  const petData = parsedArgs.nextBytes().expect("Failed to parse petData");

  const pet = ElydrPet.deserialize(petData);

  const pointsAwarded = calculateGrowthPoints(currentApy);
  const newTotalPoints = pet.totalGrowthPoints + pointsAwarded;
  const newCheckCount = pet.checkCount + 1;
  const newStage = getNextStage(pet.stage, newTotalPoints);
  const evolved = newStage != pet.stage;
  const avgPointsPerCheck = newCheckCount > 0 ? newTotalPoints / newCheckCount : 0;
  const newPath = determinePath(newCheckCount, avgPointsPerCheck);

  let powerBoost: u8 = evolved ? 5 : (pointsAwarded > 3 ? 2 : 1);
  let defenseBoost: u8 = evolved ? 4 : (pointsAwarded > 2 ? 1 : 0);
  let agilityBoost: u8 = evolved ? 3 : 1;
  const previousStage = pet.stage;

  pet.stage = newStage;
  pet.path = newPath;
  pet.level = evolved ? pet.level + 1 : pet.level;
  pet.growthPoints = u64(newTotalPoints - STAGE_THRESHOLDS[newStage]);
  pet.totalGrowthPoints = newTotalPoints;
  pet.power = pet.power + powerBoost;
  pet.defense = pet.defense + defenseBoost;
  pet.agility = pet.agility + agilityBoost;
  pet.lastCheckTime = Context.timestamp();
  pet.checkCount = newCheckCount;

  if (evolved) {
    generateEvent(
      "Pet #" + petId.toString() + " evolved from " + STAGES[previousStage] +
      " to " + STAGES[newStage] + "! +" + pointsAwarded.toString() + " growth points"
    );
  } else {
    generateEvent(
      "Pet #" + petId.toString() + " gained " + pointsAwarded.toString() +
      " growth points from " + currentApy.toString() + "% APY"
    );
  }

  return pet.serialize();
}

export function setEvolutionInterval(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const newInterval = parsedArgs.nextU64().expect("Failed to parse interval");

  Storage.set(EVOLUTION_INTERVAL_KEY, u64ToBytes(newInterval));

  generateEvent("Evolution interval updated to: " + newInterval.toString() + "ms");
}

export function getEvolutionInterval(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(EVOLUTION_INTERVAL_KEY);
}
