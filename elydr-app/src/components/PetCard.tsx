'use client';

import { ElydrPet, ElydrStage, YieldSource } from '@/types';

interface PetCardProps {
  pet: ElydrPet;
  yieldSource?: YieldSource | null;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const stageColors: Record<ElydrStage, string> = {
  egg: 'from-amber-400 to-amber-600',
  hatchling: 'from-green-400 to-emerald-600',
  young: 'from-blue-400 to-cyan-600',
  mature: 'from-purple-400 to-violet-600',
  elder: 'from-mythic-gold to-mythic-flame',
};

const stageEmoji: Record<ElydrStage, string> = {
  egg: '🥚',
  hatchling: '🐣',
  young: '🐉',
  mature: '🔥',
  elder: '⚡',
};

const pathBadge: Record<string, { label: string; color: string }> = {
  mythic: { label: 'Mythic', color: 'bg-mythic-purple text-white' },
  common: { label: 'Common', color: 'bg-cosmic-600 text-white' },
  undetermined: { label: '???', color: 'bg-cosmic-700 text-cosmic-300' },
};

export function PetCard({ pet, yieldSource, showStats = true, size = 'md' }: PetCardProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex justify-center mb-4">
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br ${stageColors[pet.stage]} rounded-xl flex items-center justify-center relative overflow-hidden animate-float`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:4px_4px]" />
          <span className="text-4xl z-10">{stageEmoji[pet.stage]}</span>
          {pet.path === 'mythic' && (
            <div className="absolute inset-0 bg-mythic-purple/20 animate-pulse-slow" />
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg">{pet.name}</h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pathBadge[pet.path].color}`}>
            {pathBadge[pet.path].label}
          </span>
          <span className="text-cosmic-400 text-xs capitalize">
            {pet.stage}
          </span>
        </div>
      </div>

      {showStats && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-cosmic-400 ${textSizeClasses[size]}`}>Level</span>
            <span className="text-white font-mono">{pet.level}</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-cosmic-400 ${textSizeClasses[size]}`}>Growth</span>
              <span className="text-cosmic-300 text-xs">
                {pet.totalGrowthPoints} pts
              </span>
            </div>
            <div className="h-2 bg-cosmic-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stageColors[pet.stage]} transition-all duration-500`}
                style={{ width: `${Math.min((pet.growthPoints / 20) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cosmic-700/50">
            <div className="text-center">
              <div className="text-mythic-flame font-bold">{pet.power}</div>
              <div className="text-cosmic-500 text-xs">PWR</div>
            </div>
            <div className="text-center">
              <div className="text-mythic-cyan font-bold">{pet.defense}</div>
              <div className="text-cosmic-500 text-xs">DEF</div>
            </div>
            <div className="text-center">
              <div className="text-mythic-gold font-bold">{pet.agility}</div>
              <div className="text-cosmic-500 text-xs">AGI</div>
            </div>
          </div>

          {yieldSource && (
            <div className="pt-2 border-t border-cosmic-700/50">
              <div className="flex justify-between items-center">
                <span className="text-cosmic-400 text-xs">Yield Source</span>
                <span className="text-mythic-cyan text-xs font-medium">
                  {yieldSource.apy.toFixed(1)}% APY
                </span>
              </div>
              <div className="text-white text-sm truncate">{yieldSource.name}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
