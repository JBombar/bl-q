'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StageLayout } from '@/components/layout';
import { TIME_COMMITMENT_OPTIONS } from '@/config/result-screens.config';
import type { TimeCommitmentMinutes } from '@/types/funnel.types';

interface TimeCommitmentScreenProps {
  onSelect: (minutes: TimeCommitmentMinutes) => Promise<void>;
  isSaving: boolean;
}

/**
 * Screen B - Time Commitment
 * User selects how much time per day they can dedicate
 */
export function TimeCommitmentScreen({ onSelect, isSaving }: TimeCommitmentScreenProps) {
  const [selected, setSelected] = useState<TimeCommitmentMinutes | null>(null);

  const handleSelect = async (minutes: TimeCommitmentMinutes) => {
    setSelected(minutes);
    await onSelect(minutes);
  };

  return (
    <StageLayout
      variant="question"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.08 }}
        className="w-full text-center"
      >
        <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-2 md:mb-3" style={{ fontFamily: 'Figtree', lineHeight: '110%' }}>
          Kolik casu denne muzes venovat sobe?
        </h2>

        <p className="text-gray-600 mb-2 md:mb-3 italic text-xs md:text-sm">
          Vyber si, kolik minut denne se chces venovat cvicenim pro snizeni stresu
        </p>

        <div className="space-y-1.5 md:space-y-2 max-w-xl mx-auto">
          {TIME_COMMITMENT_OPTIONS.map((option) => {
            const isSelected = selected === option.value;

            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(option.value)}
                disabled={isSaving}
                className={`
                  w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-left transition-all border-2
                  ${isSelected
                    ? 'bg-white border-[#F9A201] shadow-md'
                    : 'bg-gray-100 border-transparent hover:bg-gray-200'
                  }
                  ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    w-4 h-4 md:w-5 md:h-5 rounded mr-2 md:mr-3 shrink-0 border-2 flex items-center justify-center
                    ${isSelected
                      ? 'bg-[#F9A201] border-[#F9A201]'
                      : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 text-xs md:text-sm">{option.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Loading indicator */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="w-8 h-8 border-2 border-[#F9A201] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}
    </StageLayout>
  );
}
