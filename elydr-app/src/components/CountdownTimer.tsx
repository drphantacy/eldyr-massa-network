'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  onComplete?: () => void;
  isRefreshing?: boolean;
}

export function CountdownTimer({ targetDate, label = 'Next check in', onComplete, isRefreshing }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 3, seconds: 0 });
  const hasCompletedRef = useRef(false);

  const targetTime = useMemo(() => {
    if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
      return 0;
    }
    return targetDate.getTime();
  }, [targetDate]);

  const lastTargetRef = useRef(targetTime);

  useEffect(() => {
    if (lastTargetRef.current !== targetTime) {
      hasCompletedRef.current = false;
      lastTargetRef.current = targetTime;
    }
  }, [targetTime]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (targetTime === 0) {
        return { minutes: -1, seconds: -1 };
      }

      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        if (!hasCompletedRef.current && onComplete) {
          hasCompletedRef.current = true;
          onComplete();
        }
        return { minutes: 0, seconds: 0 };
      }

      return {
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onComplete]);

  const formatTime = (num: number) => {
    if (num < 0) return '--';
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-cosmic-400 text-sm">{label}</span>
      {isRefreshing ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-mythic-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-mythic-cyan text-sm">Fetching updates...</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 font-mono">
          <span className="bg-cosmic-800 text-white px-2 py-1 rounded text-lg font-bold">
            {formatTime(timeLeft.minutes)}
          </span>
          <span className="text-mythic-purple font-bold">:</span>
          <span className="bg-cosmic-800 text-white px-2 py-1 rounded text-lg font-bold">
            {formatTime(timeLeft.seconds)}
          </span>
        </div>
      )}
    </div>
  );
}
