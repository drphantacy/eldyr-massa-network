import { Args, Mas } from '@massalabs/massa-web3';

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export const EVOLUTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EVOLUTION_CONTRACT_ADDRESS || '';

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK_NAME!;

export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL!;

export const STAGES = ['egg', 'hatchling', 'young', 'mature', 'elder'] as const;
export const PATHS = ['undetermined', 'common', 'mythic'] as const;

export interface MintResult {
  petId: string;
  txHash?: string;
  contractAddress: string;
}

export interface OnChainPet {
  id: string;
  owner: string;
  stage: number;
  path: number;
  level: number;
  growthPoints: bigint;
  totalGrowthPoints: bigint;
  linkedYieldSourceId: string;
  mintedAt: bigint;
  power: number;
  defense: number;
  agility: number;
  lastCheckTime: bigint;
  checkCount: bigint;
  stakedAmount: bigint;
  spriteId: number;
}

export async function mintPetOnChain(walletAccount: any): Promise<MintResult> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }

  const operation = await walletAccount.callSC({
    target: CONTRACT_ADDRESS,
    func: 'mint',
    parameter: new Args().serialize(),
    coins: Mas.fromString('0.1'),
  });

  const opId = operation.id || operation.toString();

  const events = await walletAccount.getEvents({
    smartContractAddress: CONTRACT_ADDRESS,
    operationId: opId,
  });

  let petId = Math.floor(Math.random() * 9000 + 1000).toString();
  for (const event of events) {
    const match = event.data?.match(/minted pet (\d+)/);
    if (match) {
      petId = match[1];
      break;
    }
  }

  return {
    petId,
    txHash: opId,
    contractAddress: CONTRACT_ADDRESS,
  };
}

export function getContractExplorerUrl(): string {
  return `${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`;
}

// Helper function to extract return value from readSC result
function extractReturnValue(result: any): Uint8Array {
  // Handle different wallet return formats
  if (result instanceof Uint8Array) {
    return result;
  }
  if (result?.returnValue) {
    return result.returnValue;
  }
  if (result?.value) {
    return result.value;
  }
  // If it's already an ArrayBuffer or similar, return as is
  return result;
}

// Read how many pets an address owns
export async function getOwnerPetCount(walletAccount: any, address: string): Promise<number> {
  if (!walletAccount?.readSC) {
    throw new Error('Wallet does not support contract reads');
  }

  const result = await walletAccount.readSC({
    target: CONTRACT_ADDRESS,
    func: 'balanceOf',
    parameter: new Args().addString(address).serialize(),
  });

  const returnValue = extractReturnValue(result);
  const args = new Args(returnValue);
  return Number(args.nextU64());
}

// Read total supply of pets
export async function getTotalSupply(walletAccount: any): Promise<number> {
  if (!walletAccount?.readSC) {
    throw new Error('Wallet does not support contract reads');
  }

  const result = await walletAccount.readSC({
    target: CONTRACT_ADDRESS,
    func: 'totalSupply',
    parameter: new Args().serialize(),
  });

  const returnValue = extractReturnValue(result);
  const args = new Args(returnValue);
  return Number(args.nextU64());
}

// Read a pet from chain by ID
export async function getPetFromChain(walletAccount: any, petId: number): Promise<OnChainPet> {
  if (!walletAccount?.readSC) {
    throw new Error('Wallet does not support contract reads');
  }

  const result = await walletAccount.readSC({
    target: CONTRACT_ADDRESS,
    func: 'getPet',
    parameter: new Args().addU64(BigInt(petId)).serialize(),
  });

  const returnValue = extractReturnValue(result);
  const args = new Args(returnValue);
  return {
    id: args.nextU64().toString(),
    owner: args.nextString(),
    stage: Number(args.nextU8()),
    path: Number(args.nextU8()),
    level: Number(args.nextU8()),
    growthPoints: args.nextU64(),
    totalGrowthPoints: args.nextU64(),
    linkedYieldSourceId: args.nextString(),
    mintedAt: args.nextU64(),
    power: Number(args.nextU8()),
    defense: Number(args.nextU8()),
    agility: Number(args.nextU8()),
    lastCheckTime: args.nextU64(),
    checkCount: args.nextU64(),
    stakedAmount: args.nextU64(),
    spriteId: Number(args.nextU8()),
  };
}

// Convert on-chain pet to frontend ElydrPet format
export function onChainPetToElydrPet(pet: OnChainPet): {
  id: string;
  name: string;
  stage: 'egg' | 'hatchling' | 'young' | 'mature' | 'elder';
  path: 'undetermined' | 'common' | 'mythic';
  spriteType: 'dragon';
  spriteId: number;
  level: number;
  growthPoints: number;
  totalGrowthPoints: number;
  nextCheckAt: Date;
  linkedYieldSourceId: string | null;
  mintedAt: Date;
  history: [];
  power: number;
  defense: number;
  agility: number;
  stakedAmount: number;
} {
  return {
    id: pet.id,
    name: `Eldyr #${pet.id}`,
    stage: STAGES[pet.stage] || 'egg',
    path: PATHS[pet.path] || 'undetermined',
    spriteType: 'dragon',
    spriteId: pet.spriteId,
    level: pet.level,
    growthPoints: Number(pet.growthPoints),
    totalGrowthPoints: Number(pet.totalGrowthPoints),
    nextCheckAt: new Date(Number(pet.lastCheckTime) + 3600000),
    linkedYieldSourceId: pet.linkedYieldSourceId || null,
    mintedAt: new Date(Number(pet.mintedAt)),
    history: [],
    power: pet.power,
    defense: pet.defense,
    agility: pet.agility,
    stakedAmount: Math.round((Number(pet.stakedAmount) / 1e9) * 1000) / 1000,
  };
}

// Link a yield source to a pet on chain
export async function linkYieldSourceOnChain(
  walletAccount: any,
  petId: number,
  yieldSourceId: string
): Promise<string> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }

  const operation = await walletAccount.callSC({
    target: CONTRACT_ADDRESS,
    func: 'linkYieldSource',
    parameter: new Args().addU64(BigInt(petId)).addString(yieldSourceId).serialize(),
    coins: Mas.fromString('0'),
  });

  return operation.id || operation.toString();
}

// Stake MAS to a pet
export async function stakeToPet(
  walletAccount: any,
  petId: number,
  amount: string
): Promise<string> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }

  const operation = await walletAccount.callSC({
    target: CONTRACT_ADDRESS,
    func: 'stake',
    parameter: new Args().addU64(BigInt(petId)).serialize(),
    coins: Mas.fromString(amount),
  });

  return operation.id || operation.toString();
}

// Unstake MAS from a pet
export async function unstakeFromPet(
  walletAccount: any,
  petId: number,
  percentage: number
): Promise<string> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }

  const operation = await walletAccount.callSC({
    target: CONTRACT_ADDRESS,
    func: 'unstake',
    parameter: new Args().addU64(BigInt(petId)).addU8(BigInt(percentage)).serialize(),
    coins: Mas.fromString('0'),
  });

  return operation.id || operation.toString();
}

// Release (destroy) a pet and return staked MAS
export async function releasePet(
  walletAccount: any,
  petId: number
): Promise<string> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }

  const operation = await walletAccount.callSC({
    target: CONTRACT_ADDRESS,
    func: 'release',
    parameter: new Args().addU64(BigInt(petId)).serialize(),
    coins: Mas.fromString('0'),
  });

  return operation.id || operation.toString();
}

export async function setEvolutionContractAddress(
  walletAccount: any,
  evolutionAddress: string
): Promise<string> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }

  const operation = await walletAccount.callSC({
    target: CONTRACT_ADDRESS,
    func: 'setEvolutionContract',
    parameter: new Args().addString(evolutionAddress).serialize(),
    coins: Mas.fromString('0'),
  });

  return operation.id || operation.toString();
}

export async function registerYieldSource(
  walletAccount: any,
  sourceId: string,
  name: string,
  apy: number
): Promise<string> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }
  if (!EVOLUTION_CONTRACT_ADDRESS) {
    throw new Error('Evolution contract address not configured');
  }

  const operation = await walletAccount.callSC({
    target: EVOLUTION_CONTRACT_ADDRESS,
    func: 'registerYieldSource',
    parameter: new Args()
      .addString(sourceId)
      .addString(name)
      .addU8(BigInt(Math.floor(apy)))
      .serialize(),
    coins: Mas.fromString('0'),
  });

  return operation.id || operation.toString();
}

export async function updateYieldSourceApy(
  walletAccount: any,
  sourceId: string,
  newApy: number
): Promise<string> {
  if (!walletAccount?.callSC) {
    throw new Error('Wallet does not support contract calls');
  }
  if (!EVOLUTION_CONTRACT_ADDRESS) {
    throw new Error('Evolution contract address not configured');
  }

  const operation = await walletAccount.callSC({
    target: EVOLUTION_CONTRACT_ADDRESS,
    func: 'updateYieldSourceApy',
    parameter: new Args()
      .addString(sourceId)
      .addU8(BigInt(Math.floor(newApy)))
      .serialize(),
    coins: Mas.fromString('0'),
  });

  return operation.id || operation.toString();
}

export async function getYieldSourceFromChain(
  walletAccount: any,
  sourceId: string
): Promise<{ sourceId: string; name: string; apy: number; updatedAt: bigint } | null> {
  if (!walletAccount?.readSC) {
    throw new Error('Wallet does not support contract reads');
  }
  if (!EVOLUTION_CONTRACT_ADDRESS) {
    return null;
  }

  try {
    const result = await walletAccount.readSC({
      target: EVOLUTION_CONTRACT_ADDRESS,
      func: 'getYieldSource',
      parameter: new Args().addString(sourceId).serialize(),
    });

    const returnValue = extractReturnValue(result);
    const args = new Args(returnValue);
    return {
      sourceId: args.nextString(),
      name: args.nextString(),
      apy: Number(args.nextU8()),
      updatedAt: args.nextU64(),
    };
  } catch {
    return null;
  }
}

export interface EvolutionEvent {
  timestamp: Date;
  yieldPercent: number;
  growthPointsAwarded: number;
  previousStage: string;
  newStage: string;
  message: string;
}

const BUILDNET_GENESIS_MS = 1704289000000;
const PERIOD_DURATION_MS = 16000;

function getEventTimestamp(event: any): Date {
  const eventPeriod = event?.context?.slot?.period;

  if (eventPeriod) {
    const currentPeriod = Math.floor((Date.now() - BUILDNET_GENESIS_MS) / PERIOD_DURATION_MS);
    const periodsAgo = currentPeriod - eventPeriod;
    const msAgo = periodsAgo * PERIOD_DURATION_MS;
    return new Date(Date.now() - msAgo);
  }

  return new Date();
}

export async function getEvolutionHistory(
  walletAccount: any,
  petId: number
): Promise<EvolutionEvent[]> {
  if (!walletAccount?.getEvents || !EVOLUTION_CONTRACT_ADDRESS) {
    return [];
  }

  try {
    const events = await walletAccount.getEvents({
      smartContractAddress: EVOLUTION_CONTRACT_ADDRESS,
    });

    const petEvents: EvolutionEvent[] = [];
    const petIdStr = `Pet #${petId}`;

    for (const event of events) {
      const data = event.data || '';
      if (!data.includes(petIdStr)) continue;

      const evolvedMatch = data.match(/Pet #(\d+) evolved from (\w+) to (\w+)! \+(\d+) growth points/);
      if (evolvedMatch && evolvedMatch[1] === String(petId)) {
        petEvents.push({
          timestamp: getEventTimestamp(event),
          yieldPercent: 0,
          growthPointsAwarded: parseInt(evolvedMatch[4]),
          previousStage: evolvedMatch[2],
          newStage: evolvedMatch[3],
          message: `Your Eldyr evolved from ${evolvedMatch[2]} to ${evolvedMatch[3]}! +${evolvedMatch[4]} growth points!`,
        });
        continue;
      }

      const gainedMatch = data.match(/Pet #(\d+) gained (\d+) growth points from (\d+)% APY/);
      if (gainedMatch && gainedMatch[1] === String(petId)) {
        petEvents.push({
          timestamp: getEventTimestamp(event),
          yieldPercent: parseInt(gainedMatch[3]),
          growthPointsAwarded: parseInt(gainedMatch[2]),
          previousStage: '',
          newStage: '',
          message: `Your Eldyr gained ${gainedMatch[2]} growth points from ${gainedMatch[3]}% APY`,
        });
      }
    }

    return petEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch {
    return [];
  }
}
