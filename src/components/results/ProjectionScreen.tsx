'use client';

import { motion } from 'framer-motion';
import { StageLayout } from '@/components/layout';
import { ProjectionGraph } from './ProjectionGraph';
import { calculateProjection, STRESS_STAGE_CONFIG } from '@/config/result-screens.config';
import type { TimeCommitmentMinutes, StressStage } from '@/types/funnel.types';

interface ProjectionScreenProps {
  firstName: string;
  normalizedScore: number;
  timeCommitmentMinutes: TimeCommitmentMinutes;
  stressStage: StressStage;
  onContinue: () => void;
}

/**
 * Screen F - Projection Graph (Slide 11)
 * Personalized plan ready screen with stress status and projection graph
 */
export function ProjectionScreen({
  firstName,
  normalizedScore,
  timeCommitmentMinutes,
  stressStage,
  onContinue,
}: ProjectionScreenProps) {
  const projection = calculateProjection(normalizedScore, timeCommitmentMinutes);

  // Score on 0–50 scale for the status text
  const displayScore = Math.round((normalizedScore / 100) * 50);
  const stageLabel = STRESS_STAGE_CONFIG.segmentLabels[stressStage];

  return (
    <StageLayout
      variant="result"
      bgClass="bg-white"
      showCTA
      ctaLabel="Pokračovat"
      onCtaClick={onContinue}
      showBackButton={false}
      showHeaderLogo={true}
    >
      {/* Main heading — 22px/24.2px bold, #292424, centered, max-w 338px */}
      <motion.h1
        className="text-[22px] leading-[24.2px] font-bold text-[#292424] font-figtree text-center max-w-[338px] mx-auto mt-[22px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-[#327455]">{firstName}</span>, tvůj plán vnitřního klidu je připraven!
      </motion.h1>

      {/* Current stress status — 15px/16.5px, #292424, centered */}
      <motion.p
        className="text-[15px] leading-[16.5px] font-normal text-[#292424] font-figtree text-center mt-[18px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Tvoje úroveň stresu je: <span className="font-bold">{displayScore}/50 ({stageLabel})</span>
      </motion.p>

      {/* Projection graph — 351×212 */}
      <motion.div
        className="mt-[18px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ProjectionGraph
          currentScore={projection.displayCurrentScore}
          targetScore={projection.displayTargetScore}
          targetDate={projection.targetDate}
        />
      </motion.div>

      {/* Disclaimer — 12px/14.4px regular, #919191, left-aligned, max-w 351px */}
      <motion.p
        className="text-[12px] leading-[14.4px] font-normal text-[#919191] font-figtree text-left max-w-[351px] mx-auto mt-[12px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        *Uvedené výsledky slouží pouze pro ilustrační účely.
      </motion.p>
    </StageLayout>
  );
}
