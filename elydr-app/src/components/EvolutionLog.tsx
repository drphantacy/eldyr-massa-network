'use client';

import { EvolutionEvent } from '@/types';

interface EvolutionLogProps {
  events: EvolutionEvent[];
  maxEvents?: number;
}

export function EvolutionLog({ events, maxEvents = 10 }: EvolutionLogProps) {
  const displayEvents = events.slice(0, maxEvents);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPointsColor = (points: number) => {
    if (points >= 4) return 'text-mythic-gold';
    if (points >= 3) return 'text-green-400';
    if (points >= 2) return 'text-blue-400';
    return 'text-cosmic-400';
  };

  const isEvolution = (event: EvolutionEvent) => {
    return event.previousStage !== event.newStage;
  };

  return (
    <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-cosmic-700/50">
        <h3 className="text-white font-bold">Evolution Log</h3>
        <p className="text-cosmic-400 text-xs">Autonomous contract execution history</p>
      </div>

      <div className="divide-y divide-cosmic-800/50 max-h-80 overflow-y-auto">
        {displayEvents.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-cosmic-500 text-sm">No evolution events yet</div>
            <div className="text-cosmic-600 text-xs mt-1">
              Link a yield source to start growing
            </div>
          </div>
        ) : (
          displayEvents.map((event, index) => (
            <div
              key={index}
              className={`px-4 py-3 ${isEvolution(event) ? 'bg-mythic-purple/10' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-cosmic-500 text-xs font-mono">
                      {formatTime(event.timestamp)}
                    </span>
                    {isEvolution(event) && (
                      <span className="px-1.5 py-0.5 bg-mythic-purple/20 text-mythic-purple text-xs rounded">
                        EVOLVED
                      </span>
                    )}
                  </div>
                  <p className="text-cosmic-300 text-sm mt-1">{event.message}</p>
                </div>
                <div className="text-right ml-4">
                  <div className={`font-bold ${getPointsColor(event.growthPointsAwarded)}`}>
                    +{event.growthPointsAwarded}
                  </div>
                  <div className="text-cosmic-500 text-xs">
                    {event.yieldPercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {events.length > maxEvents && (
        <div className="px-4 py-2 border-t border-cosmic-700/50 text-center">
          <span className="text-cosmic-500 text-xs">
            Showing {maxEvents} of {events.length} events
          </span>
        </div>
      )}
    </div>
  );
}
