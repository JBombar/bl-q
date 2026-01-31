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
      variant="result"
      bgClass="bg-gradient-to-b from-purple-50 to-white"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Kolik casu denne muzes venovat sobe?
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Vyber si, kolik minut denne se chces venovat cvicenim pro snizeni stresu
        </motion.p>
      </div>

      {/* Options */}
      <div className="space-y-3 max-w-md mx-auto mb-8">
        {TIME_COMMITMENT_OPTIONS.map((option, index) => (
          <motion.button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            disabled={isSaving}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
              selected === option.value
                ? 'border-[#F9A201] bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index + 0.3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              {/* Time icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selected === option.value ? 'bg-[#F9A201] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <span className="text-lg font-bold">{option.value}</span>
              </div>
              <span className="text-lg font-medium text-gray-800">
                {option.label}
              </span>
            </div>

            {/* Radio indicator */}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selected === option.value ? 'border-[#F9A201] bg-[#F9A201]' : 'border-gray-300'
            }`}>
              {selected === option.value && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Motivational text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-sm text-gray-500">
          I par minut denne muze vyrazne zlepsit tvuj vnitrni klid
        </p>
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
