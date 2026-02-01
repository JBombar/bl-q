/**
 * useCountdownTimer Hook
 *
 * A reusable countdown timer hook with expiration callback.
 * Used for managing discount timer on the sales page.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseCountdownTimerOptions {
  /** Duration in seconds */
  durationSeconds: number;
  /** Callback when timer expires */
  onExpire?: () => void;
  /** Whether to auto-start the timer */
  autoStart?: boolean;
  /** Storage key for persisting timer state across refreshes */
  storageKey?: string;
}

export interface UseCountdownTimerResult {
  /** Time remaining in seconds */
  timeLeft: number;
  /** Whether the timer has expired */
  isExpired: boolean;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Formatted time as { minutes, seconds } */
  formattedTime: {
    minutes: string;
    seconds: string;
  };
  /** Start the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset the timer to initial duration */
  reset: () => void;
}

/**
 * Countdown timer hook with persistence and expiration callback
 */
export function useCountdownTimer(
  options: UseCountdownTimerOptions
): UseCountdownTimerResult {
  const {
    durationSeconds,
    onExpire,
    autoStart = true,
    storageKey,
  } = options;

  // Use ref to track if onExpire has been called
  const hasExpiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // Keep onExpire ref updated
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Initialize state from storage or default
  const [state, setState] = useState<{
    timeLeft: number;
    isRunning: boolean;
    isExpired: boolean;
    startedAt: number | null;
  }>(() => {
    // Try to restore from storage
    if (storageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const elapsed = parsed.startedAt
            ? Math.floor((Date.now() - parsed.startedAt) / 1000)
            : 0;
          const remaining = Math.max(0, durationSeconds - elapsed);

          if (remaining === 0) {
            hasExpiredRef.current = true;
            return {
              timeLeft: 0,
              isRunning: false,
              isExpired: true,
              startedAt: null,
            };
          }

          return {
            timeLeft: remaining,
            isRunning: autoStart,
            isExpired: false,
            startedAt: parsed.startedAt,
          };
        }
      } catch (e) {
        // Ignore storage errors
      }
    }

    return {
      timeLeft: durationSeconds,
      isRunning: autoStart,
      isExpired: false,
      startedAt: autoStart ? Date.now() : null,
    };
  });

  // Persist state to storage
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            startedAt: state.startedAt,
            isExpired: state.isExpired,
          })
        );
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [storageKey, state.startedAt, state.isExpired]);

  // Timer tick effect
  useEffect(() => {
    if (!state.isRunning || state.isExpired) return;

    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.timeLeft <= 1) {
          // Timer expired
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            // Call onExpire in next tick to avoid state update during render
            setTimeout(() => {
              onExpireRef.current?.();
            }, 0);
          }
          return {
            ...prev,
            timeLeft: 0,
            isRunning: false,
            isExpired: true,
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isRunning, state.isExpired]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  }, []);

  // Actions
  const start = useCallback(() => {
    if (state.isExpired) return;
    setState((prev) => ({
      ...prev,
      isRunning: true,
      startedAt: prev.startedAt || Date.now(),
    }));
  }, [state.isExpired]);

  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const reset = useCallback(() => {
    hasExpiredRef.current = false;
    setState({
      timeLeft: durationSeconds,
      isRunning: autoStart,
      isExpired: false,
      startedAt: autoStart ? Date.now() : null,
    });
  }, [durationSeconds, autoStart]);

  return {
    timeLeft: state.timeLeft,
    isExpired: state.isExpired,
    isRunning: state.isRunning,
    formattedTime: formatTime(state.timeLeft),
    start,
    pause,
    reset,
  };
}
