import { Args, Mas } from '@massalabs/massa-web3';

export const CONTRACT_ADDRESS = 'AS1nx3LjgAkZkKRXCR3zNupaMHHUk2nKU5pm9BcCx9zKPVETbQSQ';

export const NETWORK = 'Massa Buildnet';

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
  return `https://buildnet.massa.net/address/${CONTRACT_ADDRESS}`;
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
  };
}

// Convert on-chain pet to frontend ElydrPet format
export function onChainPetToElydrPet(pet: OnChainPet): {
  id: string;
  name: string;
  stage: 'egg' | 'hatchling' | 'young' | 'mature' | 'elder';
  path: 'undetermined' | 'common' | 'mythic';
  spriteType: 'dragon';
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
} {
  return {
    id: pet.id,
    name: `Elydr #${pet.id}`,
    stage: STAGES[pet.stage] || 'egg',
    path: PATHS[pet.path] || 'undetermined',
    spriteType: 'dragon',
    level: pet.level,
    growthPoints: Number(pet.growthPoints),
    totalGrowthPoints: Number(pet.totalGrowthPoints),
    nextCheckAt: new Date(Number(pet.lastCheckTime) + 1800000), // +30 mins
    linkedYieldSourceId: pet.linkedYieldSourceId || null,
    mintedAt: new Date(Number(pet.mintedAt)),
    history: [], // History not stored on chain
    power: pet.power,
    defense: pet.defense,
    agility: pet.agility,
    stakedAmount: Number(pet.stakedAmount),
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
    parameter: new Args().addU64(BigInt(petId)).addU8(percentage).serialize(),
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
