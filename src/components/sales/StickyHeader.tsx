'use client';

import { useState, useEffect } from 'react';
import { COUNTDOWN_CONFIG } from '@/config/sales-page.config';

export function StickyHeader() {
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_CONFIG.durationMinutes * 60); // seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">BL</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline">Better Lady</span>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            {!isExpired ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {COUNTDOWN_CONFIG.urgencyMessage}
                </span>
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                  <span className="text-red-600 font-mono font-bold text-lg">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-500">
                {COUNTDOWN_CONFIG.expiredMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
