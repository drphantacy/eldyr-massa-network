'use client';

import { YieldSource } from '@/types';

interface YieldSourceCardProps {
  source: YieldSource;
  isSelected?: boolean;
  onSelect?: (sourceId: string) => void;
}

const riskColors = {
  low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export function YieldSourceCard({ source, isSelected, onSelect }: YieldSourceCardProps) {
  const risk = riskColors[source.riskLevel];

  return (
    <div
      className={`bg-cosmic-900/50 border rounded-xl p-4 backdrop-blur-sm cursor-pointer transition-all ${
        isSelected
          ? 'border-mythic-purple ring-2 ring-mythic-purple/30'
          : 'border-cosmic-700/50 hover:border-cosmic-600'
      }`}
      onClick={() => onSelect?.(source.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-bold">{source.name}</h4>
          <span className="text-cosmic-400 text-xs">{source.protocol}</span>
        </div>
        <div className="text-right">
          <div className="text-mythic-cyan font-bold text-xl">{source.apy.toFixed(1)}%</div>
          <div className="text-cosmic-500 text-xs">APY</div>
        </div>
      </div>

      <p className="text-cosmic-400 text-sm mb-3">{source.description}</p>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-cosmic-500">TVL: </span>
          <span className="text-white">{source.tvl}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${risk.bg} ${risk.text} ${risk.border}`}
        >
          {source.riskLevel.charAt(0).toUpperCase() + source.riskLevel.slice(1)} Risk
        </span>
      </div>

      {source.isMock && (
        <div className="mt-3 pt-3 border-t border-cosmic-700/50">
          <span className="text-cosmic-600 text-xs">(Mock data for Stage 1)</span>
        </div>
      )}

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-mythic-purple/30">
          <div className="flex items-center gap-2 text-mythic-purple text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Selected</span>
          </div>
        </div>
      )}
    </div>
  );
}
