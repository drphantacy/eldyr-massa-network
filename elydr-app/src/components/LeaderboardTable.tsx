'use client';

import { LeaderboardEntry, ElydrStage, ElydrPath } from '@/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const pathColors: Record<ElydrPath, string> = {
  mythic: 'text-mythic-purple',
  common: 'text-cosmic-400',
  undetermined: 'text-cosmic-500',
};

const stageColors: Record<ElydrStage, string> = {
  egg: 'text-amber-400',
  hatchling: 'text-green-400',
  young: 'text-blue-400',
  mature: 'text-purple-400',
  elder: 'text-mythic-gold',
};

const rankBadges: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-mythic-gold/20', text: 'text-mythic-gold' },
  2: { bg: 'bg-gray-300/20', text: 'text-gray-300' },
  3: { bg: 'bg-amber-600/20', text: 'text-amber-600' },
};

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl backdrop-blur-sm overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-cosmic-800/50 border-b border-cosmic-700/50 text-cosmic-400 text-xs font-medium uppercase tracking-wider">
        <div className="col-span-1">Rank</div>
        <div className="col-span-3">Player</div>
        <div className="col-span-3">Elydr</div>
        <div className="col-span-2 text-right">Yield Score</div>
        <div className="col-span-1 text-right hidden sm:block">Wins</div>
        <div className="col-span-2 text-right hidden md:block">Tournaments</div>
      </div>

      <div className="divide-y divide-cosmic-800/50">
        {entries.map((entry) => {
          const isTopThree = entry.rank <= 3;
          const badge = rankBadges[entry.rank];

          return (
            <div
              key={entry.rank}
              className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-cosmic-800/30 transition-colors ${
                isTopThree ? 'bg-cosmic-800/20' : ''
              }`}
            >
              <div className="col-span-1">
                {isTopThree ? (
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${badge.bg} ${badge.text} font-bold text-sm`}
                  >
                    {entry.rank}
                  </span>
                ) : (
                  <span className="text-cosmic-400 font-mono pl-2">{entry.rank}</span>
                )}
              </div>

              <div className="col-span-3">
                <span className="text-white font-mono text-sm">{entry.address}</span>
              </div>

              <div className="col-span-3">
                <div className="text-white text-sm font-medium">{entry.petName}</div>
                <div className="flex items-center gap-1 text-xs">
                  <span className={`capitalize ${stageColors[entry.petStage]}`}>
                    {entry.petStage}
                  </span>
                  <span className="text-cosmic-600">•</span>
                  <span className={`capitalize ${pathColors[entry.petPath]}`}>
                    {entry.petPath}
                  </span>
                </div>
              </div>

              <div className="col-span-2 text-right">
                <span className="text-mythic-cyan font-bold">
                  {entry.lifetimeYieldScore.toLocaleString()}
                </span>
              </div>

              <div className="col-span-1 text-right hidden sm:block">
                <span className="text-green-400 font-medium">{entry.battlesWon}</span>
              </div>

              <div className="col-span-2 text-right hidden md:block">
                <span className="text-cosmic-300">{entry.tournamentsEntered}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-cosmic-800/30 border-t border-cosmic-700/50">
        <p className="text-cosmic-500 text-xs text-center">
          Leaderboard updates every 3 minutes based on autonomous contract execution
        </p>
      </div>
    </div>
  );
}
