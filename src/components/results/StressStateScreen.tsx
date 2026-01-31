'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { StressSlider } from './StressSlider';
import { InsightCardGrid } from './InsightCard';
import type { QuizInsights } from '@/types/funnel.types';
import { STRESS_STAGE_CONFIG } from '@/config/result-screens.config';

interface StressStateScreenProps {
  insights: QuizInsights;
  onContinue: () => void;
}

/**
 * Screen A - Current Stress State
 * Shows stress level image, slider, and insight cards from anchor questions
 */
export function StressStateScreen({ insights, onContinue }: StressStateScreenProps) {
  const { stressStage, stageImagePath, stageTitle, stageDescription, insightCards, normalizedScore, displayScore, maxDisplayScore } = insights;

  // Get segment label (Nizka, Mirna, Stredni, Vysoka)
  const segmentLabel = STRESS_STAGE_CONFIG.segmentLabels[stressStage];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 text-center">
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tvoje aktualni uroven stresu
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Na zaklade tvych odpovedi
        </motion.p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Stress image */}
        <motion.div
          className="relative w-full max-w-xs mx-auto mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
        >
          <div className="relative aspect-square">
            <Image
              src={stageImagePath}
              alt={stageTitle}
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Score display */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-800">{displayScore}</span>
            <span className="text-xl text-gray-500">/{maxDisplayScore}</span>
          </div>
          <div className="mt-1">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              stressStage === 1 ? 'bg-green-100 text-green-700' :
              stressStage === 2 ? 'bg-yellow-100 text-yellow-700' :
              stressStage === 3 ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {segmentLabel}
            </span>
          </div>
        </motion.div>

        {/* Stress slider */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <StressSlider normalizedScore={normalizedScore} />
        </motion.div>

        {/* Stage description */}
        <motion.div
          className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-semibold text-gray-800 mb-2">{stageTitle}</h2>
          <p className="text-sm text-gray-600">{stageDescription}</p>
        </motion.div>

        {/* Insight cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Tve hlavni oblasti
          </h3>
          <InsightCardGrid cards={insightCards} />
        </motion.div>
      </div>

      {/* Fixed CTA button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <motion.button
          onClick={onContinue}
          className="w-full py-4 bg-[#F9A201] hover:bg-[#e89400] text-white font-semibold rounded-xl transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.98 }}
        >
          Pokracovat
        </motion.button>
      </div>
    </div>
  );
}
