export {
  constructor,
  mint,
  getPet,
  petExists,
  ownerOf,
  balanceOf,
  totalSupply,
  linkYieldSource,
  updatePet,
  transfer,
  stake,
  unstake,
  release,
  setEvolutionContract,
  getEvolutionContract,
} from "./elydrNFT";

export {
  constructorEvolution,
  registerYieldSource,
  updateYieldSourceApy,
  getYieldSource,
  autonomousEvolutionCheck,
  evolvePet,
  setEvolutionInterval,
  getEvolutionInterval,
} from "./elydrEvolution";

export { ElydrPet, STAGES, PATHS } from "./elydrNFT";
