'use client';

import { ElydrPet, ElydrStage, YieldSource } from '@/types';
import { getSpritePosition } from '@/utils/sprite';

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

const pathBadge: Record<string, { label: string; className: string }> = {
  mythic: { label: 'Mythic', className: 'badge-mythic' },
  common: { label: 'Common', className: 'badge-common' },
  undetermined: { label: '???', className: 'badge-undetermined' },
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

  const petImageUrl = `/images/pet-${pet.spriteId || 1}.png`;
  const spritePosition = getSpritePosition(pet.stage, pet.growthPoints);

  return (
    <div className="card-padded">
      <div className="flex justify-center mb-4">
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br ${stageColors[pet.stage]} rounded-xl flex items-center justify-center relative overflow-hidden animate-float`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:4px_4px]" />
          <div
            className="w-full h-full z-10"
            style={{
              backgroundImage: `url(${petImageUrl})`,
              backgroundPosition: spritePosition.backgroundPosition,
              backgroundSize: spritePosition.backgroundSize,
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
            }}
          />
          {pet.path === 'mythic' && (
            <div className="absolute inset-0 bg-mythic-purple/20 animate-pulse-slow" />
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg">{pet.name}</h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className={pathBadge[pet.path].className}>
            {pathBadge[pet.path].label}
          </span>
          <span className="text-muted text-xs capitalize">
            {pet.stage}
          </span>
        </div>
      </div>

      {showStats && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-muted ${textSizeClasses[size]}`}>Level</span>
            <span className="text-white font-mono">{pet.level}</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-muted ${textSizeClasses[size]}`}>Growth</span>
              <span className="text-cosmic-300 text-xs">{pet.totalGrowthPoints} pts</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill bg-gradient-to-r ${stageColors[pet.stage]}`}
                style={{ width: `${Math.min((pet.growthPoints / 20) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 section-divider">
            <div className="text-center">
              <div className="stat-value text-mythic-flame">{pet.power}</div>
              <div className="stat-label">PWR</div>
            </div>
            <div className="text-center">
              <div className="stat-value text-mythic-cyan">{pet.defense}</div>
              <div className="stat-label">DEF</div>
            </div>
            <div className="text-center">
              <div className="stat-value text-mythic-gold">{pet.agility}</div>
              <div className="stat-label">AGI</div>
            </div>
          </div>

          {yieldSource && (
            <div className="pt-2 section-divider">
              <div className="flex justify-between items-center">
                <span className="text-muted text-xs">Yield Source</span>
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
