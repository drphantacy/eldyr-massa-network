'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  onComplete?: () => void;
}

export function CountdownTimer({ targetDate, label = 'Next check in', onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        onComplete?.();
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
  }, [targetDate, onComplete]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <span className="text-cosmic-400 text-sm">{label}</span>
      <div className="flex items-center gap-1 font-mono">
        <span className="bg-cosmic-800 text-white px-2 py-1 rounded text-lg font-bold">
          {formatTime(timeLeft.minutes)}
        </span>
        <span className="text-mythic-purple font-bold">:</span>
        <span className="bg-cosmic-800 text-white px-2 py-1 rounded text-lg font-bold">
          {formatTime(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
}
