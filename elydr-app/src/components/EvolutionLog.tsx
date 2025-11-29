'use client';

import { useState, useRef, useEffect } from 'react';
import { EvolutionEvent } from '@/types';

interface EvolutionLogProps {
  events: EvolutionEvent[];
  initialLimit?: number;
}

export function EvolutionLog({ events, initialLimit = 5 }: EvolutionLogProps) {
  const [displayCount, setDisplayCount] = useState(initialLimit);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayEvents = events.slice(0, displayCount);
  const hasMore = events.length > displayCount;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 5, events.length));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayCount]);

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
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

  const getStageEmoji = (stage: string) => {
    const emojis: Record<string, string> = {
      egg: '🥚',
      hatchling: '🐣',
      young: '🦅',
      mature: '🐉',
      elder: '👑',
    };
    return emojis[stage] || '🥚';
  };

  return (
    <div className="bg-cosmic-900/50 border border-cosmic-700/50 rounded-xl backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-cosmic-700/50">
        <h3 className="text-white font-bold">Evolution Log</h3>
        <p className="text-cosmic-400 text-xs">Autonomous contract execution history</p>
      </div>

      <div ref={scrollRef} className="divide-y divide-cosmic-800/50 max-h-[400px] overflow-y-auto">
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
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getStageEmoji(event.newStage)}
                </div>
                <div className="flex-1 flex items-start justify-between">
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
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-cosmic-500 text-xs">
                        Yield: {event.yieldPercent.toFixed(1)}%
                      </span>
                      <span className="text-cosmic-600 text-xs">•</span>
                      <span className="text-cosmic-500 text-xs capitalize">
                        Stage: {event.newStage}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`font-bold text-lg ${getPointsColor(event.growthPointsAwarded)}`}>
                      +{event.growthPointsAwarded}
                    </div>
                    <div className="text-cosmic-600 text-xs">
                      GP
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="px-4 py-3 border-t border-cosmic-700/50 text-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-cosmic-800 hover:bg-cosmic-700 text-cosmic-300 hover:text-white text-sm rounded-lg transition-colors"
          >
            Load More ({events.length - displayCount} remaining)
          </button>
        </div>
      )}
      {!hasMore && events.length > initialLimit && (
        <div className="px-4 py-2 border-t border-cosmic-700/50 text-center">
          <span className="text-cosmic-500 text-xs">
            Showing all {events.length} events
          </span>
        </div>
      )}
    </div>
  );
}
