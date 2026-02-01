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
    <div className="sticky top-0 z-50 bg-white">
      <div className="max-w-[500px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Countdown info */}
          <div className="flex flex-col gap-1">
            {!isExpired ? (
              <>
                <span className="text-[#292424] text-[16px] font-medium leading-[1.1em]">
                  {COUNTDOWN_TIMER.discountText}
                </span>
                <span className="text-[#292424] text-[16px] font-medium leading-[1.1em]">
                  {formatTime(timeLeft)}
                </span>
              </>
            ) : (
              <span className="text-[#949BA1] text-[14px]">
                Nabídka vypršela
              </span>
            )}
          </div>

          {/* Right side - CTA Button (ORANGE!) */}
          <button className="bg-[#F9A201] hover:bg-[#E09201] active:scale-[0.98] text-white font-extrabold text-[16px] leading-[1em] uppercase py-4 px-8 rounded-[10px] shadow-cta transition-all">
            {CTA_BUTTON_TEXT}
          </button>
        </div>
      </div>
    </div>
  );
}
