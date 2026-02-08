'use client';

import { motion } from 'framer-motion';
import { StageLayout } from '@/components/layout';
import { ProjectionGraph } from './ProjectionGraph';
import { calculateProjection } from '@/config/result-screens.config';
import type { TimeCommitmentMinutes, StressStage } from '@/types/funnel.types';

interface ProjectionScreenProps {
  firstName: string;
  normalizedScore: number;
  timeCommitmentMinutes: TimeCommitmentMinutes;
  stressStage: StressStage;
  onContinue: () => void;
}

/**
 * Screen F - Projection Graph (Slide 7)
 * Shows personalized stress reduction projection with dynamic graph
 */
export function ProjectionScreen({
  normalizedScore,
  timeCommitmentMinutes,
  onContinue,
}: ProjectionScreenProps) {
  const projection = calculateProjection(normalizedScore, timeCommitmentMinutes);

  // Format target date as "DD. month YYYY" in Czech
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleDateString('cs-CZ', { month: 'long' });
    const year = date.getFullYear();
    return `${day}. ${month} ${year}`;
  };

  return (
    <StageLayout
      variant="result"
      bgClass="bg-white"
      showCTA
      ctaLabel="Pokračovat"
      onCtaClick={onContinue}
      showBackButton={true}
      onBackClick={() => {}}
      showHeaderLogo={true}
    >
      {/* Main heading — 22px/24.2px bold, #292424, centered, max-w 338px */}
      <motion.h1
        className="text-[22px] leading-[24.2px] font-bold text-[#292424] font-figtree text-center max-w-[338px] mx-auto mt-[22px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Zde je odhad pokroku, kterého můžeš dosáhnout do:
      </motion.h1>

      {/* Dynamic date — 18px/19.8px bold, #327455, centered */}
      <motion.p
        className="text-[18px] leading-[19.8px] font-bold text-[#327455] font-figtree text-center max-w-[338px] mx-auto mt-[18px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {formatDate(projection.targetDate)}
      </motion.p>

      {/* Chart title — 16px/17.6px regular, #292424, centered */}
      <motion.p
        className="text-[16px] leading-[17.6px] font-normal text-[#292424] font-figtree text-center mt-[22px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Úroveň stresu
      </motion.p>

      {/* Projection graph — 351×226 */}
      <motion.div
        className="mt-[6px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
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
        *Založeno na datech uživatelů, kteří si zaznamenávají svůj pokrok v Better Lady. Individuální výsledky se mohou lišit.
      </motion.p>
    </StageLayout>
  );
}
