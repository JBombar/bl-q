'use client';

import { motion } from 'framer-motion';
import { StageLayout } from '@/components/layout';
import { ProgressRing } from './ProgressRing';
import { MICRO_COMMITMENT_CONFIG } from '@/config/result-screens.config';
import type { MicroCommitmentKey } from '@/types/funnel.types';

interface MicroCommitmentScreenProps {
  /** Which screen: C1, C2, or C3 */
  screenId: 'C1' | 'C2' | 'C3';
  /** Callback when user answers */
  onAnswer: (key: MicroCommitmentKey, value: boolean) => Promise<void>;
  /** Is the answer being saved */
  isSaving: boolean;
}

/**
 * Screens C1-C3 - Micro-commitment questions
 * Progress ring + yes/no question to build psychological commitment
 */
export function MicroCommitmentScreen({ screenId, onAnswer, isSaving }: MicroCommitmentScreenProps) {
  // Find config for this screen
  const screenConfig = MICRO_COMMITMENT_CONFIG.screens.find(s => s.id === screenId);

  if (!screenConfig) {
    return null;
  }

  const { progress, key, question, testimonial } = screenConfig;

  const handleAnswer = async (value: boolean) => {
    await onAnswer(key, value);
  };

  return (
    <StageLayout
      variant="result"
      bgClass="bg-linear-to-b from-blue-50 to-white"
    >
      {/* Progress ring */}
      <div className="flex flex-col items-center justify-center pt-12 md:pt-16 lg:pt-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
        >
          <ProgressRing progress={progress} size={140} strokeWidth={10} />
        </motion.div>

        {/* Question */}
        <motion.h1
          className="text-xl font-bold text-gray-800 text-center mt-8 mb-6 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {question}
        </motion.h1>

        {/* Answer buttons */}
        <motion.div
          className="flex gap-4 w-full max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => handleAnswer(false)}
            disabled={isSaving}
            className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Ne
          </button>
          <button
            onClick={() => handleAnswer(true)}
            disabled={isSaving}
            className="flex-1 py-4 px-6 bg-[#F9A201] hover:bg-[#e89400] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Ano
          </button>
        </motion.div>

        {/* Testimonial */}
        <motion.p
          className="text-sm text-gray-500 text-center mt-8 max-w-md italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {testimonial}
        </motion.p>
      </div>

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
