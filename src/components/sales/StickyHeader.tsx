'use client';

import { useState, useEffect } from 'react';
import { COUNTDOWN_TIMER, CTA_BUTTON_TEXT } from '@/config/sales-page-content';

/**
 * StickyHeader Component
 * Matches figma_design.md "Countdown Timer Banner" section
 */
export function StickyHeader() {
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_TIMER.durationSeconds);
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
    <div className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[500px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Countdown info */}
          <div className="flex flex-col">
            {!isExpired ? (
              <>
                <span className="text-sm text-dark">
                  {COUNTDOWN_TIMER.discountText}
                </span>
                <span className="text-2xl font-bold text-dark">
                  {formatTime(timeLeft)}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">
                Nabídka vypršela
              </span>
            )}
          </div>

          {/* Right side - CTA Button */}
          <button className="bg-primary-green text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-opacity-90 transition-all shadow-card">
            {CTA_BUTTON_TEXT}
          </button>
        </div>
      </div>
    </div>
  );
}
