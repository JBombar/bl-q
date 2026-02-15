'use client';

import { useSharedTimer } from '@/hooks/useSharedTimer';
import { COUNTDOWN_TIMER, CTA_BUTTON_TEXT } from '@/config/sales-page-content';

/**
 * StickyHeader Component
 * Matches figma_design.md "Countdown Timer Banner" section
 */
interface StickyHeaderProps {
  onCtaClick?: () => void;
}

export function StickyHeader({ onCtaClick }: StickyHeaderProps) {
  const { formattedTime, isExpired } = useSharedTimer(COUNTDOWN_TIMER.durationSeconds);

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-[#E4E4E4]">
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
                  {formattedTime.minutes}:{formattedTime.seconds}
                </span>
              </>
            ) : (
              <span className="text-[#949BA1] text-[14px]">
                Nabídka vypršela
              </span>
            )}
          </div>

          {/* Right side - CTA Button (ORANGE!) */}
          <button onClick={onCtaClick} className="bg-[#F9A201] hover:bg-[#E09201] active:scale-[0.98] text-white font-extrabold text-[16px] leading-[1em] uppercase py-4 px-8 rounded-[10px] shadow-cta transition-all">
            {CTA_BUTTON_TEXT}
          </button>
        </div>
      </div>
    </div>
  );
}
