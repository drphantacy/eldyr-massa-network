export {
  constructor,
  mint,
  getPet,
  ownerOf,
  balanceOf,
  totalSupply,
  linkYieldSource,
  updatePet,
  transfer,
} from "./elydrNFT";

export {
  constructorEvolution,
  registerYieldSource,
  updateYieldSourceApy,
  getYieldSource,
  processEvolution,
  autonomousEvolutionCheck,
  evolvePet,
  setEvolutionInterval,
  getEvolutionInterval,
} from "./elydrEvolution";

export { ElydrPet, STAGES, PATHS } from "./elydrNFT";
