'use client';

import { motion } from 'framer-motion';
import { StageLayout } from '@/components/layout';
import {
  StressResultDisplay,
  InsightCardsSection,
} from './shared';
import type { QuizInsights } from '@/types/funnel.types';
import { STRESS_STAGE_CONFIG } from '@/config/result-screens.config';

interface StressStateScreenProps {
  insights: QuizInsights;
  onContinue: () => void;
}

/**
 * Screen A - Current Stress State
 * Shows heading, results card (stress level + diagram + gradient + alert), insight cards
 */
export function StressStateScreen({ insights, onContinue }: StressStateScreenProps) {
  const {
    stressStage,
    stageImagePath,
    stageTitle,
    stageDescription,
    insightCards,
    normalizedScore,
  } = insights;

  const segmentLabel = STRESS_STAGE_CONFIG.segmentLabels[stressStage];

  const handleBack = () => {
    console.log('Back button clicked');
  };

  return (
    <StageLayout
      variant="result"
      bgClass="bg-white"
      showCTA
      ctaLabel="Pokračovat"
      onCtaClick={onContinue}
      showBackButton={true}
      onBackClick={handleBack}
      showHeaderLogo={true}
    >
      {/* Main heading — 22px/24.2px bold, #292424, centered */}
      <motion.h1
        className="text-[22px] leading-[24.2px] font-bold text-[#292424] font-figtree text-center max-w-[338px] mx-auto mt-[22px] mb-[24px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Zde je aktuální stav tvého nervového systému
      </motion.h1>

      {/* Results Card — contains stress level, diagram, gradient bar, alert */}
      <StressResultDisplay
        stageImagePath={stageImagePath}
        stageTitle={stageTitle}
        segmentLabel={segmentLabel}
        stressStage={stressStage}
        normalizedScore={normalizedScore}
        stageDescription={stageDescription}
      />

      {/* Insight cards (2×2 grid) — 8px gap from results card */}
      <div className="mt-[8px]">
        <InsightCardsSection cards={insightCards} />
      </div>
    </StageLayout>
  );
}
