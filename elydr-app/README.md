# Elydr - Autonomous Mythical Pets on Massa

Elydr is a Massa-based dApp where users mint pixel-art mythical pet NFTs that evolve automatically based on DeFi yield and on-chain events, powered by Massa's autonomous smart contracts.

## Stage 1 - Frontend Skeleton (Current)

This is the Stage 1 implementation: a fully clickable, production-ready UI with mock data. All blockchain interactions are simulated.

### Features

- **Home Page** (`/`): Hero section, how-it-works guide, evolution preview
- **Mint Page** (`/mint`): Mock wallet connection, egg minting, yield source linking
- **Dashboard** (`/dashboard`): Pet stats, evolution log, simulate evolution tick
- **Battleground** (`/battleground`): Tournaments list, global leaderboard

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context + Hooks

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout with providers
│   ├── globals.css        # Global styles + Tailwind
│   ├── mint/
│   │   └── page.tsx       # Mint flow page
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard page
│   └── battleground/
│       └── page.tsx       # Tournaments & leaderboard
├── components/            # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── PetCard.tsx
│   ├── TournamentCard.tsx
│   ├── LeaderboardTable.tsx
│   ├── CountdownTimer.tsx
│   ├── YieldSourceCard.tsx
│   ├── EvolutionLog.tsx
│   └── index.ts
├── context/
│   └── ElydrContext.tsx   # Global state management
├── data/
│   └── mockData.ts        # Mock data for Stage 1
├── types/
│   └── index.ts           # TypeScript interfaces
└── lib/                   # Utilities (for future stages)
```

## Data Models

### ElydrPet
```typescript
interface ElydrPet {
  id: string;
  name: string;
  stage: 'egg' | 'hatchling' | 'young' | 'mature' | 'elder';
  path: 'mythic' | 'common' | 'undetermined';
  level: number;
  growthPoints: number;
  totalGrowthPoints: number;
  nextCheckAt: Date;
  linkedYieldSourceId: string | null;
  history: EvolutionEvent[];
  power: number;
  defense: number;
  agility: number;
}
```

### Evolution Logic
- Growth points awarded every 30 minutes based on APY bands:
  - 0-2% APY → 1 point
  - 2-5% APY → 2 points
  - 5-8% APY → 3 points
  - 8-12% APY → 4 points
  - 12%+ APY → 5 points

- Stage thresholds:
  - Egg: 0 points
  - Hatchling: 10 points
  - Young: 30 points
  - Mature: 70 points
  - Elder: 150 points

- Path determination: After 10 checks, average ≥3.5 points = Mythic, otherwise Common

## Future Stages

### Stage 2 - Massa Wallet Integration
- Real wallet connection via Massa SDK
- Basic NFT minting contract

### Stage 3 - DeFi Integration
- Connect to Massa DeFi protocols
- Real APY tracking

### Stage 4 - Autonomous Evolution
- Massa autonomous smart contracts for timed checks
- On-chain evolution logic

### Stage 5 - Battles & AI Coach
- On-chain battle resolution
- AI-powered pet coaching
- Leaderboard anchored on-chain

## Plugging in Massa-Specific Logic

The codebase is structured for easy integration:

1. **Wallet Connection** (`src/context/ElydrContext.tsx`):
   - Replace `connectWallet()` with Massa SDK wallet connection
   - Update `WalletState` interface for Massa-specific fields

2. **Minting** (`src/context/ElydrContext.tsx`):
   - Replace `mintPet()` with contract call to Elydr NFT contract
   - Parse transaction result for actual pet ID

3. **Yield Sources** (`src/data/mockData.ts`):
   - Replace mock sources with real Massa DeFi protocols
   - Fetch actual APY from protocol contracts

4. **Evolution** (`src/context/ElydrContext.tsx`):
   - Replace `simulateEvolution()` with event listener for autonomous contract events
   - Read pet state directly from blockchain

## Contributing

This is a hackathon project. Feel free to fork and extend!

## License

MIT
