'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useElydr } from '@/context/ElydrContext';
import { PetCard, CountdownTimer, EvolutionLog, YieldSourceCard } from '@/components';

type TabType = 'summary' | 'details';

export default function DashboardPage() {
  const { wallet, pets, currentPet, selectedPetId, selectPet, yieldSources, simulateEvolution } = useElydr();
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const linkedYieldSource = yieldSources.find(
    (s) => s.id === currentPet?.linkedYieldSourceId
  );

  if (!wallet.isConnected || !currentPet) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-2xl p-12 backdrop-blur-sm">
            <div className="w-24 h-24 mx-auto mb-6 bg-cosmic-800 rounded-2xl flex items-center justify-center">
              <span className="text-5xl">🥚</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Elydr Found</h2>
            <p className="text-cosmic-400 mb-8 max-w-md mx-auto">
              {!wallet.isConnected
                ? 'Connect your wallet and mint an Elydr to view your dashboard.'
                : 'You haven\'t minted an Elydr yet. Start your journey by minting an egg!'}
            </p>
            <Link
              href="/mint"
              className="inline-block px-8 py-4 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Mint Your Elydr
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-cosmic-400">Monitor your Elydr&apos;s growth and evolution</p>
          </div>

          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl px-6 py-3 backdrop-blur-sm">
            <CountdownTimer targetDate={currentPet.nextCheckAt} label="Next autonomous check" />
          </div>
        </div>

        {pets.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-cosmic-400 text-sm">Your Elydrs:</span>
              <span className="text-mythic-cyan text-sm font-bold">{pets.length}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => selectPet(pet.id)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all ${
                    (selectedPetId === pet.id || (!selectedPetId && pet.id === pets[0]?.id))
                      ? 'bg-gradient-to-r from-mythic-purple/30 to-mythic-cyan/30 border-2 border-mythic-purple'
                      : 'bg-cosmic-800/50 border border-cosmic-700/50 hover:border-cosmic-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {pet.stage === 'egg' ? '🥚' : pet.stage === 'hatchling' ? '🐣' : pet.stage === 'young' ? '🐉' : pet.stage === 'mature' ? '🔥' : '⚡'}
                    </span>
                    <div className="text-left">
                      <div className="text-white text-sm font-medium">{pet.name}</div>
                      <div className="text-cosmic-400 text-xs capitalize">{pet.stage} • Lv.{pet.level}</div>
                    </div>
                  </div>
                </button>
              ))}
              <Link
                href="/mint"
                className="flex-shrink-0 px-4 py-3 rounded-xl bg-cosmic-800/30 border border-dashed border-cosmic-600 hover:border-mythic-purple transition-colors flex items-center gap-2"
              >
                <span className="text-2xl">+</span>
                <span className="text-cosmic-400 text-sm">Mint New</span>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <PetCard pet={currentPet} yieldSource={linkedYieldSource} size="lg" />

            <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-white font-bold mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={simulateEvolution}
                  className="w-full py-3 bg-gradient-to-r from-mythic-purple to-mythic-cyan text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Simulate 30-min Tick
                </button>
                <Link
                  href="/battleground"
                  className="block w-full py-3 bg-cosmic-800 text-center text-white font-medium rounded-lg hover:bg-cosmic-700 transition-colors"
                >
                  Enter Battleground
                </Link>
              </div>
            </div>

          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'summary'
                    ? 'bg-mythic-purple text-white'
                    : 'bg-cosmic-800 text-cosmic-400 hover:text-white'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-mythic-purple text-white'
                    : 'bg-cosmic-800 text-cosmic-400 hover:text-white'
                }`}
              >
                Details
              </button>
            </div>

            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-cosmic-400 text-sm mb-1">Stage</div>
                    <div className="text-white text-xl font-bold capitalize">{currentPet.stage}</div>
                  </div>
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-cosmic-400 text-sm mb-1">Path</div>
                    <div className={`text-xl font-bold capitalize ${
                      currentPet.path === 'mythic' ? 'text-mythic-purple' :
                      currentPet.path === 'common' ? 'text-cosmic-300' : 'text-cosmic-500'
                    }`}>
                      {currentPet.path === 'undetermined' ? '???' : currentPet.path}
                    </div>
                  </div>
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-cosmic-400 text-sm mb-1">Total Growth</div>
                    <div className="text-mythic-cyan text-xl font-bold">{currentPet.totalGrowthPoints}</div>
                  </div>
                  <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-cosmic-400 text-sm mb-1">Checks</div>
                    <div className="text-white text-xl font-bold">{currentPet.history.length}</div>
                  </div>
                </div>

                {linkedYieldSource && (
                  <div>
                    <h3 className="text-white font-bold mb-3">Linked Yield Source</h3>
                    <YieldSourceCard source={linkedYieldSource} isSelected />
                  </div>
                )}

                <EvolutionLog events={currentPet.history} maxEvents={5} />
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-white font-bold mb-4">Combat Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-cosmic-400">Power</span>
                        <span className="text-mythic-flame font-bold">{currentPet.power}</span>
                      </div>
                      <div className="h-2 bg-cosmic-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mythic-flame to-red-400"
                          style={{ width: `${Math.min(currentPet.power * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-cosmic-400">Defense</span>
                        <span className="text-mythic-cyan font-bold">{currentPet.defense}</span>
                      </div>
                      <div className="h-2 bg-cosmic-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mythic-cyan to-blue-400"
                          style={{ width: `${Math.min(currentPet.defense * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-cosmic-400">Agility</span>
                        <span className="text-mythic-gold font-bold">{currentPet.agility}</span>
                      </div>
                      <div className="h-2 bg-cosmic-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mythic-gold to-yellow-400"
                          style={{ width: `${Math.min(currentPet.agility * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-white font-bold mb-4">Pet Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-cosmic-400 text-sm">Pet ID</div>
                      <div className="text-white font-mono">#{currentPet.id}</div>
                    </div>
                    <div>
                      <div className="text-cosmic-400 text-sm">Sprite Type</div>
                      <div className="text-white capitalize">{currentPet.spriteType}</div>
                    </div>
                    <div>
                      <div className="text-cosmic-400 text-sm">Level</div>
                      <div className="text-white">{currentPet.level}</div>
                    </div>
                    <div>
                      <div className="text-cosmic-400 text-sm">Minted At</div>
                      <div className="text-white text-sm">
                        {new Date(currentPet.mintedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <EvolutionLog events={currentPet.history} maxEvents={20} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
