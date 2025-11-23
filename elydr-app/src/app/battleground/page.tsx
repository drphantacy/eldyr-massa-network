'use client';

import { useState } from 'react';
import { useElydr } from '@/context/ElydrContext';
import { TournamentCard, LeaderboardTable } from '@/components';

type ViewType = 'tournaments' | 'leaderboard';

export default function BattlegroundPage() {
  const { tournaments, leaderboard, wallet, currentPet } = useElydr();
  const [activeView, setActiveView] = useState<ViewType>('tournaments');
  const [enteredTournaments, setEnteredTournaments] = useState<string[]>([]);

  const handleTournamentEnter = (tournamentId: string) => {
    setEnteredTournaments((prev) => [...prev, tournamentId]);
  };

  const activeTournaments = tournaments.filter((t) => t.status === 'active');
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming');
  const completedTournaments = tournaments.filter((t) => t.status === 'completed');

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Battleground
          </h1>
          <p className="text-cosmic-400 max-w-2xl mx-auto">
            Enter tournaments to test your Elydr&apos;s strength. Compete against other players
            and climb the global leaderboard!
          </p>
        </div>

        {wallet.isConnected && currentPet ? (
          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 mb-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-mythic-purple to-mythic-cyan rounded-lg flex items-center justify-center">
                  <span className="text-2xl">
                    {currentPet.stage === 'elder' ? '⚡' :
                     currentPet.stage === 'mature' ? '🔥' :
                     currentPet.stage === 'young' ? '🐉' :
                     currentPet.stage === 'hatchling' ? '🐣' : '🥚'}
                  </span>
                </div>
                <div>
                  <div className="text-white font-bold">{currentPet.name}</div>
                  <div className="text-cosmic-400 text-sm capitalize">
                    {currentPet.stage} • {currentPet.path === 'undetermined' ? 'Path TBD' : currentPet.path} Path
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-mythic-flame font-bold">{currentPet.power}</div>
                  <div className="text-cosmic-500">PWR</div>
                </div>
                <div className="text-center">
                  <div className="text-mythic-cyan font-bold">{currentPet.defense}</div>
                  <div className="text-cosmic-500">DEF</div>
                </div>
                <div className="text-center">
                  <div className="text-mythic-gold font-bold">{currentPet.agility}</div>
                  <div className="text-cosmic-500">AGI</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">{enteredTournaments.length}</div>
                  <div className="text-cosmic-500">Entered</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 mb-8 backdrop-blur-sm text-center">
            <p className="text-cosmic-400">
              {!wallet.isConnected
                ? 'Connect your wallet to enter tournaments'
                : 'Mint an Elydr to participate in battles'}
            </p>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveView('tournaments')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeView === 'tournaments'
                  ? 'bg-mythic-purple text-white'
                  : 'text-cosmic-400 hover:text-white'
              }`}
            >
              Tournaments
            </button>
            <button
              onClick={() => setActiveView('leaderboard')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeView === 'leaderboard'
                  ? 'bg-mythic-purple text-white'
                  : 'text-cosmic-400 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {activeView === 'tournaments' && (
          <div className="space-y-10">
            {activeTournaments.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-white">Active Tournaments</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onEnter={handleTournamentEnter}
                    />
                  ))}
                </div>
              </section>
            )}

            {upcomingTournaments.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-blue-400 rounded-full" />
                  <h2 className="text-xl font-bold text-white">Upcoming Tournaments</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingTournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onEnter={handleTournamentEnter}
                    />
                  ))}
                </div>
              </section>
            )}

            {completedTournaments.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-cosmic-500 rounded-full" />
                  <h2 className="text-xl font-bold text-white">Past Tournaments</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedTournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onEnter={handleTournamentEnter}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeView === 'leaderboard' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Global Leaderboard</h2>
              <span className="text-cosmic-500 text-sm">Top 10 Elydrs</span>
            </div>
            <LeaderboardTable entries={leaderboard} />
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="w-12 h-12 bg-mythic-gold/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-white font-bold mb-2">Win Rewards</h3>
            <p className="text-cosmic-400 text-sm">
              Tournaments offer MAS token prizes and exclusive badges for your Elydr profile.
            </p>
          </div>

          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="w-12 h-12 bg-mythic-purple/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚔️</span>
            </div>
            <h3 className="text-white font-bold mb-2">Fair Battles</h3>
            <p className="text-cosmic-400 text-sm">
              Combat is determined by Power, Defense, and Agility stats, with some RNG for excitement.
            </p>
          </div>

          <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="w-12 h-12 bg-mythic-cyan/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-white font-bold mb-2">On-Chain Results</h3>
            <p className="text-cosmic-400 text-sm">
              All battle outcomes are recorded on-chain for transparency and verifiability.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-cosmic-800/30 border border-cosmic-700/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <span className="text-cosmic-300 text-sm">
                <strong className="text-white">Stage 1:</strong> Tournament entry is simulated.
                Actual battle resolution and on-chain outcomes will be implemented in Stage 5.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
