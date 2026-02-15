/**
 * useSharedTimer Hook
 * 
 * Uses Zustand state for perfect timer synchronization across all components.
 * All components using this hook will show exactly the same time.
 */

import { useState, useEffect } from 'react';
import { usePostQuizState } from './usePostQuizState';

export interface UseSharedTimerResult {
  /** Time remaining in seconds */
  timeLeft: number;
  /** Whether the timer has expired */
  isExpired: boolean;
  /** Formatted time as { minutes, seconds } */
  formattedTime: {
    minutes: string;
    seconds: string;
  };
}

export function useSharedTimer(durationSeconds: number): UseSharedTimerResult {
  const { initializeTimer, getTimeRemaining } = usePostQuizState();
  const [timeLeft, setTimeLeft] = useState(() => {
    // Only read time here — initialization happens in useEffect to avoid
    // setState-during-render warnings when multiple components share the timer
    return getTimeRemaining();
  });

  useEffect(() => {
    // Initialize timer on mount
    initializeTimer(durationSeconds);

    // Update time every second
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [durationSeconds, initializeTimer, getTimeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  return {
    timeLeft,
    isExpired: timeLeft === 0,
    formattedTime: formatTime(timeLeft),
  };
}
