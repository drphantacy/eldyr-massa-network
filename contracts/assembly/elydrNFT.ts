import {
  Storage,
  Context,
  generateEvent,
  transferCoins,
  Address,
} from "@massalabs/massa-as-sdk";
import {
  Args,
  stringToBytes,
  bytesToString,
  u64ToBytes,
  bytesToU64,
} from "@massalabs/as-types";

const OWNER_KEY = stringToBytes("OWNER");
const TOTAL_SUPPLY_KEY = stringToBytes("TOTAL_SUPPLY");
const MINT_PRICE_KEY = stringToBytes("MINT_PRICE");
const PET_PREFIX = stringToBytes("PET_");
const OWNER_OF_PREFIX = stringToBytes("OWNER_OF_");
const BALANCE_OF_PREFIX = stringToBytes("BALANCE_OF_");

export const STAGES: string[] = ["egg", "hatchling", "young", "mature", "elder"];
export const PATHS: string[] = ["undetermined", "common", "mythic"];

export class ElydrPet {
  id: u64;
  owner: string;
  stage: u8;
  path: u8;
  level: u8;
  growthPoints: u64;
  totalGrowthPoints: u64;
  linkedYieldSourceId: string;
  mintedAt: u64;
  power: u8;
  defense: u8;
  agility: u8;
  lastCheckTime: u64;
  checkCount: u64;
  stakedAmount: u64;

  constructor() {
    this.id = 0;
    this.owner = "";
    this.stage = 0;
    this.path = 0;
    this.level = 1;
    this.growthPoints = 0;
    this.totalGrowthPoints = 0;
    this.linkedYieldSourceId = "";
    this.mintedAt = 0;
    this.power = 5;
    this.defense = 5;
    this.agility = 5;
    this.lastCheckTime = 0;
    this.checkCount = 0;
    this.stakedAmount = 0;
  }

  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.id)
      .add(this.owner)
      .add(this.stage)
      .add(this.path)
      .add(this.level)
      .add(this.growthPoints)
      .add(this.totalGrowthPoints)
      .add(this.linkedYieldSourceId)
      .add(this.mintedAt)
      .add(this.power)
      .add(this.defense)
      .add(this.agility)
      .add(this.lastCheckTime)
      .add(this.checkCount)
      .add(this.stakedAmount)
      .serialize();
  }

  static deserialize(data: StaticArray<u8>): ElydrPet {
    const args = new Args(data);
    const pet = new ElydrPet();
    pet.id = args.nextU64().expect("Failed to deserialize id");
    pet.owner = args.nextString().expect("Failed to deserialize owner");
    pet.stage = args.nextU8().expect("Failed to deserialize stage");
    pet.path = args.nextU8().expect("Failed to deserialize path");
    pet.level = args.nextU8().expect("Failed to deserialize level");
    pet.growthPoints = args.nextU64().expect("Failed to deserialize growthPoints");
    pet.totalGrowthPoints = args.nextU64().expect("Failed to deserialize totalGrowthPoints");
    pet.linkedYieldSourceId = args.nextString().expect("Failed to deserialize linkedYieldSourceId");
    pet.mintedAt = args.nextU64().expect("Failed to deserialize mintedAt");
    pet.power = args.nextU8().expect("Failed to deserialize power");
    pet.defense = args.nextU8().expect("Failed to deserialize defense");
    pet.agility = args.nextU8().expect("Failed to deserialize agility");
    pet.lastCheckTime = args.nextU64().expect("Failed to deserialize lastCheckTime");
    pet.checkCount = args.nextU64().expect("Failed to deserialize checkCount");
    pet.stakedAmount = args.nextU64().expect("Failed to deserialize stakedAmount");
    return pet;
  }
}

function getPetKey(petId: u64): StaticArray<u8> {
  return new Args().add(PET_PREFIX).add(petId).serialize();
}

function getOwnerOfKey(petId: u64): StaticArray<u8> {
  return new Args().add(OWNER_OF_PREFIX).add(petId).serialize();
}

function getBalanceOfKey(address: string): StaticArray<u8> {
  return new Args().add(BALANCE_OF_PREFIX).add(address).serialize();
}

export function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Already deployed");

  const owner = Context.caller().toString();
  Storage.set(OWNER_KEY, stringToBytes(owner));
  Storage.set(TOTAL_SUPPLY_KEY, u64ToBytes(0));
  Storage.set(MINT_PRICE_KEY, u64ToBytes(100_000_000));

  generateEvent("ElydrNFT contract deployed by " + owner);
}

export function mint(_: StaticArray<u8>): StaticArray<u8> {
  const caller = Context.caller().toString();
  const mintPrice = bytesToU64(Storage.get(MINT_PRICE_KEY));
  const transferredCoins = Context.transferredCoins();

  assert(transferredCoins >= mintPrice, "Insufficient payment for minting");

  const currentSupply = bytesToU64(Storage.get(TOTAL_SUPPLY_KEY));
  const newPetId = currentSupply + 1;

  const pet = new ElydrPet();
  pet.id = newPetId;
  pet.owner = caller;
  pet.stage = 0;
  pet.path = 0;
  pet.level = 1;
  pet.growthPoints = 0;
  pet.totalGrowthPoints = 0;
  pet.linkedYieldSourceId = "";
  pet.mintedAt = Context.timestamp();
  pet.power = 5;
  pet.defense = 5;
  pet.agility = 5;
  pet.lastCheckTime = Context.timestamp();
  pet.checkCount = 0;

  Storage.set(getPetKey(newPetId), pet.serialize());
  Storage.set(getOwnerOfKey(newPetId), stringToBytes(caller));
  Storage.set(TOTAL_SUPPLY_KEY, u64ToBytes(newPetId));

  const currentBalance = Storage.has(getBalanceOfKey(caller))
    ? bytesToU64(Storage.get(getBalanceOfKey(caller)))
    : 0;
  Storage.set(getBalanceOfKey(caller), u64ToBytes(currentBalance + 1));

  generateEvent("Minted Elydr #" + newPetId.toString() + " to " + caller);

  return u64ToBytes(newPetId);
}

export function getPet(args: StaticArray<u8>): StaticArray<u8> {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");

  const petKey = getPetKey(petId);
  assert(Storage.has(petKey), "Pet does not exist");

  return Storage.get(petKey);
}

export function ownerOf(args: StaticArray<u8>): StaticArray<u8> {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");

  const ownerKey = getOwnerOfKey(petId);
  assert(Storage.has(ownerKey), "Pet does not exist");

  return Storage.get(ownerKey);
}

export function balanceOf(args: StaticArray<u8>): StaticArray<u8> {
  const parsedArgs = new Args(args);
  const address = parsedArgs.nextString().expect("Failed to parse address");

  const balanceKey = getBalanceOfKey(address);
  if (!Storage.has(balanceKey)) {
    return u64ToBytes(0);
  }

  return Storage.get(balanceKey);
}

export function totalSupply(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(TOTAL_SUPPLY_KEY);
}

export function linkYieldSource(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");
  const yieldSourceId = parsedArgs.nextString().expect("Failed to parse yieldSourceId");

  const caller = Context.caller().toString();
  const petKey = getPetKey(petId);

  assert(Storage.has(petKey), "Pet does not exist");

  const pet = ElydrPet.deserialize(Storage.get(petKey));
  assert(pet.owner == caller, "Not the owner of this pet");

  pet.linkedYieldSourceId = yieldSourceId;
  pet.lastCheckTime = Context.timestamp();

  Storage.set(petKey, pet.serialize());

  generateEvent("Pet #" + petId.toString() + " linked to yield source: " + yieldSourceId);
}

export function updatePet(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");
  const newStage = parsedArgs.nextU8().expect("Failed to parse stage");
  const newPath = parsedArgs.nextU8().expect("Failed to parse path");
  const newLevel = parsedArgs.nextU8().expect("Failed to parse level");
  const newGrowthPoints = parsedArgs.nextU64().expect("Failed to parse growthPoints");
  const newTotalGrowthPoints = parsedArgs.nextU64().expect("Failed to parse totalGrowthPoints");
  const newPower = parsedArgs.nextU8().expect("Failed to parse power");
  const newDefense = parsedArgs.nextU8().expect("Failed to parse defense");
  const newAgility = parsedArgs.nextU8().expect("Failed to parse agility");
  const newCheckCount = parsedArgs.nextU64().expect("Failed to parse checkCount");

  const owner = bytesToString(Storage.get(OWNER_KEY));
  const caller = Context.caller().toString();
  assert(caller == owner, "Only contract owner can update pets");

  const petKey = getPetKey(petId);
  assert(Storage.has(petKey), "Pet does not exist");

  const pet = ElydrPet.deserialize(Storage.get(petKey));
  pet.stage = newStage;
  pet.path = newPath;
  pet.level = newLevel;
  pet.growthPoints = newGrowthPoints;
  pet.totalGrowthPoints = newTotalGrowthPoints;
  pet.power = newPower;
  pet.defense = newDefense;
  pet.agility = newAgility;
  pet.lastCheckTime = Context.timestamp();
  pet.checkCount = newCheckCount;

  Storage.set(petKey, pet.serialize());

  generateEvent("Pet #" + petId.toString() + " updated - Stage: " + STAGES[newStage] + ", Path: " + PATHS[newPath]);
}

export function transfer(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");
  const toAddress = parsedArgs.nextString().expect("Failed to parse toAddress");

  const caller = Context.caller().toString();
  const petKey = getPetKey(petId);

  assert(Storage.has(petKey), "Pet does not exist");

  const pet = ElydrPet.deserialize(Storage.get(petKey));
  assert(pet.owner == caller, "Not the owner of this pet");

  const fromBalance = bytesToU64(Storage.get(getBalanceOfKey(caller)));
  const toBalance = Storage.has(getBalanceOfKey(toAddress))
    ? bytesToU64(Storage.get(getBalanceOfKey(toAddress)))
    : 0;

  Storage.set(getBalanceOfKey(caller), u64ToBytes(fromBalance - 1));
  Storage.set(getBalanceOfKey(toAddress), u64ToBytes(toBalance + 1));

  pet.owner = toAddress;
  Storage.set(petKey, pet.serialize());
  Storage.set(getOwnerOfKey(petId), stringToBytes(toAddress));

  generateEvent("Pet #" + petId.toString() + " transferred from " + caller + " to " + toAddress);
}

export function stake(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");

  const caller = Context.caller().toString();
  const transferredCoins = Context.transferredCoins();

  assert(transferredCoins > 0, "Must send MAS to stake");

  const petKey = getPetKey(petId);
  assert(Storage.has(petKey), "Pet does not exist");

  const pet = ElydrPet.deserialize(Storage.get(petKey));
  assert(pet.owner == caller, "Not the owner of this pet");

  pet.stakedAmount += transferredCoins;
  Storage.set(petKey, pet.serialize());

  generateEvent("Staked " + (transferredCoins / 100_000_000).toString() + " MAS to Pet #" + petId.toString());
}

export function unstake(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");
  const percentage = parsedArgs.nextU8().expect("Failed to parse percentage");

  assert(percentage > 0 && percentage <= 100, "Percentage must be between 1 and 100");

  const caller = Context.caller().toString();
  const petKey = getPetKey(petId);

  assert(Storage.has(petKey), "Pet does not exist");

  const pet = ElydrPet.deserialize(Storage.get(petKey));
  assert(pet.owner == caller, "Not the owner of this pet");
  assert(pet.stakedAmount > 0, "No MAS to unstake");

  const unstakeAmount = (pet.stakedAmount * percentage) / 100;
  pet.stakedAmount -= unstakeAmount;

  Storage.set(petKey, pet.serialize());
  transferCoins(new Address(caller), unstakeAmount);

  generateEvent("Unstaked " + (unstakeAmount / 100_000_000).toString() + " MAS from Pet #" + petId.toString());
}

export function release(args: StaticArray<u8>): void {
  const parsedArgs = new Args(args);
  const petId = parsedArgs.nextU64().expect("Failed to parse petId");

  const caller = Context.caller().toString();
  const petKey = getPetKey(petId);

  assert(Storage.has(petKey), "Pet does not exist");

  const pet = ElydrPet.deserialize(Storage.get(petKey));
  assert(pet.owner == caller, "Not the owner of this pet");

  const stakedAmount = pet.stakedAmount;

  const currentBalance = bytesToU64(Storage.get(getBalanceOfKey(caller)));
  Storage.set(getBalanceOfKey(caller), u64ToBytes(currentBalance - 1));

  Storage.del(petKey);
  Storage.del(getOwnerOfKey(petId));

  if (stakedAmount > 0) {
    transferCoins(new Address(caller), stakedAmount);
  }

  generateEvent("Pet #" + petId.toString() + " released, returning " + (stakedAmount / 100_000_000).toString() + " MAS to owner");
}
