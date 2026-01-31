'use client';

import { StageLayout } from '@/components/layout';
import {
  ResultHeader,
  StressResultDisplay,
  SegmentedStressSlider,
  ResultDescriptionCard,
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
 * Rebuilt to match Better Lady design screenshot exactly
 * Shows stress level, woman image, segmented slider, alert card, and insight cards
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

  // Get segment label (Nizka, Mirna, Stredni, Vysoka)
  const segmentLabel = STRESS_STAGE_CONFIG.segmentLabels[stressStage];

  const handleBack = () => {
    // TODO: Implement back navigation if needed
    console.log('Back button clicked');
  };

  return (
    <StageLayout
      variant="result"
      bgClass="bg-gray-50"
      showCTA
      ctaLabel="Pokračovat"
      onCtaClick={onContinue}
      showBackButton={true}
      onBackClick={handleBack}
    >
      {/* Header with Better Lady logo and title */}
      <ResultHeader
        title="Zde je aktuální stav tvého nervového systému"
        showLogo
      />

      {/* Stress level badge + Woman image */}
      <StressResultDisplay
        stageImagePath={stageImagePath}
        stageTitle={stageTitle}
        segmentLabel={segmentLabel}
        stressStage={stressStage}
      />

      {/* 4-segment stress slider */}
      <SegmentedStressSlider
        normalizedScore={normalizedScore}
        stressStage={stressStage}
      />

      {/* Alert card with warning icon and description */}
      <ResultDescriptionCard
        title={stageTitle}
        description={stageDescription}
        stressStage={stressStage}
      />

      {/* Insight cards (2x2 grid) */}
      <InsightCardsSection cards={insightCards} />
    </StageLayout>
  );
}
