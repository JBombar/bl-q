'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StageLayout } from '@/components/layout';
import { TIME_COMMITMENT_OPTIONS } from '@/config/result-screens.config';
import type { TimeCommitmentMinutes } from '@/types/funnel.types';

const OPTION_EMOJIS: Record<number, string> = {
  5: '🙂',
  10: '🥰',
  15: '😁',
  20: '🤩',
};

interface TimeCommitmentScreenProps {
  onSelect: (minutes: TimeCommitmentMinutes) => Promise<void>;
  isSaving: boolean;
}

/**
 * Screen B - Time Commitment (Slide 6)
 * Matches Figma: 18px bold heading, 4 option buttons (351×48), bg image bottom-right
 */
export function TimeCommitmentScreen({ onSelect, isSaving }: TimeCommitmentScreenProps) {
  const [selected, setSelected] = useState<TimeCommitmentMinutes | null>(null);

  const handleSelect = async (minutes: TimeCommitmentMinutes) => {
    if (isSaving) return;
    setSelected(minutes);
    await onSelect(minutes);
  };

  return (
    <StageLayout
      variant="question"
      bgClass="bg-white"
      showBackButton={false}
      showHeaderLogo={true}
      overlayImage={{
        src: '/images/time-commitment-bg.png',
        alt: '',
        anchor: 'bottom-right',
        maxHeightDesktop: '398px',
        maxHeightMobile: '398px',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.08 }}
        className="w-full flex flex-col items-center"
      >
        {/* Question — 18px/19.8px bold, #292424, max-w 328px, centered */}
        <h2 className="text-[18px] leading-[19.8px] font-bold text-[#292424] font-figtree max-w-[328px] text-center">
          Kolik času denně můžeš věnovat zklidnění svého nervového systému?
        </h2>

        {/* Option buttons — 351px × 48px, bg #f5f5f5, rounded 10px, 10px gap */}
        <div className="mt-[21px] flex flex-col gap-[10px] max-w-[351px] w-full">
          {TIME_COMMITMENT_OPTIONS.map((option) => {
            const isSelected = selected === option.value;

            return (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.value)}
                disabled={isSaving}
                className={`
                  w-full h-[48px] rounded-[10px] flex items-center px-[12px] gap-[8px] transition-all
                  ${isSelected
                    ? 'bg-white border-2 border-[#327455]'
                    : 'bg-[#f5f5f5] border-2 border-transparent'
                  }
                  ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className="w-[24px] h-[24px] flex items-center justify-center text-[20px] leading-none shrink-0">
                  {OPTION_EMOJIS[option.value]}
                </span>
                <span className="text-[15px] leading-[15px] font-normal text-[#292424] font-figtree">
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </StageLayout>
  );
}
