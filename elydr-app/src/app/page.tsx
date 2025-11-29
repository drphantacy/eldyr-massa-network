'use client';

import Link from 'next/link';
import { ElydrStage } from '@/types';

const evolutionStages: { stage: ElydrStage; emoji: string; label: string; description: string }[] = [
  { stage: 'egg', emoji: '🥚', label: 'Egg', description: 'Fresh from the mint' },
  { stage: 'hatchling', emoji: '🐣', label: 'Hatchling', description: 'First steps' },
  { stage: 'young', emoji: '🐉', label: 'Young Eldyr', description: 'Growing stronger' },
  { stage: 'mature', emoji: '🔥', label: 'Mature', description: 'Battle ready' },
  { stage: 'elder', emoji: '⚡', label: 'Elder Dragon', description: 'Legendary power' },
];

const howItWorks = [
  {
    step: 1,
    title: 'Mint Your Eldyr Egg',
    description:
      'Connect your wallet and mint a unique Eldyr egg NFT on the Massa blockchain. Each egg holds a mythical creature waiting to be born.',
    icon: '🥚',
  },
  {
    step: 2,
    title: 'Link a Yield Source',
    description:
      'Connect your Eldyr to a DeFi yield source on Massa. The yield generated will fuel your pet\'s growth and evolution.',
    icon: '💰',
  },
  {
    step: 3,
    title: 'Watch It Evolve',
    description:
      'Every 3 minutes, Massa\'s autonomous smart contracts check your yield and award growth points. High, consistent yield leads to mythic evolutions!',
    icon: '✨',
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mythic-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mythic-cyan/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-cosmic-900/50 border border-cosmic-700/50 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-cosmic-300 text-sm">Built on Massa</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Eldyr</span>
          </h1>

          <p className="text-xl md:text-2xl text-cosmic-300 mb-8 max-w-2xl mx-auto">
            Autonomous mythical pets, born from on-chain yield.
          </p>

          <p className="text-cosmic-400 mb-10 max-w-xl mx-auto">
            Mint an Eldyr egg, link it to DeFi yield, and watch as Massa&apos;s autonomous smart
            contracts evolve your pet into a legendary creature.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/mint"
              className="px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity btn-glow text-lg"
            >
              Enter App
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-cosmic-800/50 border border-cosmic-700 text-white font-medium rounded-xl hover:bg-cosmic-800 transition-colors"
            >
              How It Works
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">1,234</div>
              <div className="text-cosmic-400 text-sm">Eldyrs Minted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-mythic-cyan">$2.4M</div>
              <div className="text-cosmic-400 text-sm">TVL Linked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-mythic-gold">89</div>
              <div className="text-cosmic-400 text-sm">Elder Dragons</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-cosmic-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-cosmic-400 max-w-2xl mx-auto">
              Eldyr leverages Massa&apos;s unique autonomous smart contracts to create truly
              decentralized, self-evolving NFT pets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 backdrop-blur-sm card-hover"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-mythic-purple to-mythic-cyan rounded-lg flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div className="text-cosmic-500 text-sm font-medium">STEP {item.step}</div>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-cosmic-400">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-mythic-purple/10 to-mythic-cyan/10 border border-cosmic-700/50 rounded-xl p-6 text-center">
            <h3 className="text-white font-bold mb-2">Why Massa?</h3>
            <p className="text-cosmic-300 max-w-2xl mx-auto">
              Massa&apos;s <span className="text-mythic-cyan font-semibold">autonomous smart contracts</span>{' '}
              enable on-chain logic that runs automatically without external triggers.
              No keepers, no bots — just pure decentralized evolution.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-cosmic-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Evolution Stages</h2>
            <p className="text-cosmic-400 max-w-2xl mx-auto">
              Your Eldyr evolves through five stages. High yield leads to the mythic path —
              low yield takes the common path. Both are valid journeys!
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-purple-500 to-mythic-gold -translate-y-1/2" />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {evolutionStages.map((item, index) => (
                <div key={item.stage} className="relative">
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm text-center card-hover">
                    <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-cosmic-700 to-cosmic-800 rounded-xl flex items-center justify-center text-4xl animate-float">
                      {item.emoji}
                    </div>
                    <h4 className="text-white font-bold">{item.label}</h4>
                    <p className="text-cosmic-400 text-sm mt-1">{item.description}</p>
                  </div>
                  {index < evolutionStages.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 w-6 h-6 items-center justify-center">
                      <svg
                        className="w-4 h-4 text-cosmic-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-mythic-purple/10 border border-mythic-purple/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-mythic-purple/30 rounded-lg flex items-center justify-center">
                  ⚡
                </div>
                <h4 className="text-mythic-purple font-bold text-lg">Mythic Path</h4>
              </div>
              <p className="text-cosmic-300">
                Consistent high yield (8%+ APY average) unlocks the mythic evolution path.
                Your Eldyr becomes a legendary dragon with enhanced battle stats.
              </p>
            </div>

            <div className="bg-cosmic-700/10 border border-cosmic-600/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-cosmic-600/30 rounded-lg flex items-center justify-center">
                  🛡️
                </div>
                <h4 className="text-cosmic-300 font-bold text-lg">Common Path</h4>
              </div>
              <p className="text-cosmic-400">
                Lower yield or inconsistent performance leads to the common path.
                These creatures are sturdy and reliable — underdogs with heart!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Hatch Your Eldyr?
          </h2>
          <p className="text-cosmic-400 mb-8 max-w-xl mx-auto">
            Join the Eldyr ecosystem and experience the first truly autonomous NFT pets on Massa.
          </p>
          <Link
            href="/mint"
            className="inline-block px-10 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity btn-glow text-lg"
          >
            Mint Your Eldyr
          </Link>
        </div>
      </section>
    </div>
  );
}
