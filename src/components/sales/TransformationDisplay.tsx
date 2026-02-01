'use client';

import { motion } from 'framer-motion';
import type { StressStage } from '@/types/funnel.types';
import {
  CURRENT_STATE,
  GOAL_STATE,
  STATUS_BADGES,
  STRESS_CARD_LABELS,
} from '@/config/sales-page-content';

export interface TransformationDisplayProps {
  currentStressStage: StressStage;
  currentScore: number;
  targetScore: number;
  stageTitle: string;
  firstName: string;
}

/**
 * Status Badge Component
 * "Dnes" = pink #FFD2D2, "Tvůj cíl" = green #327455
 * Exact spec: rounded-[6px], px-3, py-2.5, font-bold, text-[15px]
 */
function StatusBadge({
  variant,
  children,
}: {
  variant: 'today' | 'goal';
  children: React.ReactNode;
}) {
  if (variant === 'today') {
    return (
      <div className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FFD2D2] rounded-[6px]">
        <span className="text-[#292424] font-bold text-[15px] leading-[1em]">
          {children}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-[#327455] rounded-[6px]">
      <span className="text-white font-bold text-[15px] leading-[1em]">
        {children}
      </span>
    </div>
  );
}

/**
 * Stress Level Badge
 * High = pink bg #FFD2D2 with red border #E60000
 * Low = mint bg #D2EBE0 with green border #327455
 */
function StressLevelBadge({ level }: { level: 'high' | 'low' }) {
  if (level === 'high') {
    return (
      <div className="inline-flex items-center justify-center gap-2 px-2 py-1.5 bg-[#FFD2D2] border-[1.5px] border-[#E60000] rounded-[6px]">
        <span className="text-[#E60000] font-bold text-[14px] leading-[1em]">
          Vysoká
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center gap-2 px-2 py-1.5 bg-[#D2EBE0] border-[1.5px] border-[#327455] rounded-[6px]">
      <span className="text-[#327455] font-bold text-[14px] leading-[1em]">
        Nízká
      </span>
    </div>
  );
}

/**
 * Energy/Confidence Indicator Bar
 */
function IndicatorBar({ isHigh }: { isHigh: boolean }) {
  const percentage = isHigh ? 85 : 20;
  const barColor = isHigh ? '#327455' : '#E60000';

  return (
    <div className="flex items-stretch gap-1 w-full h-[3px]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${percentage}%`,
          backgroundColor: barColor
        }}
      />
      <div
        className="h-full rounded-full bg-[#E4E4E4]"
        style={{ width: `${100 - percentage}%` }}
      />
    </div>
  );
}

/**
 * Stress Level Stats Card
 * Background: #F6F6F6, rounded-[10px], padding 16px 20px
 */
function StatsCard({
  variant,
  stressLevel,
  energyLevel,
  confidenceLevel,
}: {
  variant: 'before' | 'after';
  stressLevel: 'high' | 'low';
  energyLevel: string;
  confidenceLevel: string;
}) {
  const isHigh = variant === 'after';

  return (
    <div className="flex flex-col gap-4 p-5 w-full bg-[#F6F6F6] rounded-[10px]">
      {/* Úroveň stresu row */}
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="text-[#292424] font-bold text-[16px] leading-[1.1em]">
          {STRESS_CARD_LABELS.stressLevel}
        </span>
        <StressLevelBadge level={stressLevel} />
      </div>

      {/* Divider */}
      <div className="w-full h-0 border-t border-[#E4E4E4]" />

      {/* Hladina energie */}
      <div className="flex flex-col gap-2.5 w-full">
        <div className="flex flex-col gap-1 w-full">
          <span className="text-[#292424] font-bold text-[16px] leading-[1.1em]">
            {STRESS_CARD_LABELS.energyLevel}
          </span>
          <span className="text-[#292424] font-normal text-[14px] leading-[1em]">
            {energyLevel}
          </span>
        </div>
        <IndicatorBar isHigh={isHigh} />
      </div>

      {/* Divider */}
      <div className="w-full h-0 border-t border-[#E4E4E4]" />

      {/* Úroveň sebevědomí */}
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex flex-col gap-1 w-full">
          <span className="text-[#292424] font-bold text-[16px] leading-[1.1em]">
            {STRESS_CARD_LABELS.confidenceLevel}
          </span>
          <span className="text-[#292424] font-normal text-[14px] leading-[1em]">
            {confidenceLevel}
          </span>
        </div>
        <IndicatorBar isHigh={isHigh} />
      </div>
    </div>
  );
}

/**
 * Arrow Icon
 */
function ArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6L15 12L9 18" stroke="#327455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * TransformationDisplay Component
 */
export function TransformationDisplay({
  currentStressStage,
  currentScore,
  targetScore,
  stageTitle,
  firstName,
}: TransformationDisplayProps) {
  return (
    <div className="w-full font-figtree">
      <div className="max-w-[500px] mx-auto px-6">
        {/* Two-column layout */}
        <div className="flex items-start gap-3">
          {/* LEFT SIDE - "Dnes" (Before) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex-1"
          >
            {/* "Dnes" Status Badge */}
            <div className="flex justify-center mb-3">
              <StatusBadge variant="today">{STATUS_BADGES.today}</StatusBadge>
            </div>

            {/* Stressed Woman Image Placeholder */}
            <div className="relative mb-4 aspect-[3/4] bg-[#F6F6F6] rounded-[10px] overflow-hidden flex items-center justify-center">
              <span className="text-[#949BA1] text-[14px]">Stressed image</span>
            </div>

            {/* Stats Card - Before */}
            <StatsCard
              variant="before"
              stressLevel={CURRENT_STATE.stressLevelVariant}
              energyLevel={CURRENT_STATE.energyLevel}
              confidenceLevel={CURRENT_STATE.confidenceLevel}
            />
          </motion.div>

          {/* CENTER - Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="shrink-0 pt-[120px]"
          >
            <ArrowIcon />
          </motion.div>

          {/* RIGHT SIDE - "Tvůj cíl" (After) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex-1"
          >
            {/* "Tvůj cíl" Status Badge */}
            <div className="flex justify-center mb-3">
              <StatusBadge variant="goal">{STATUS_BADGES.goal}</StatusBadge>
            </div>

            {/* Calm Woman Image Placeholder */}
            <div className="relative mb-4 aspect-[3/4] bg-[#E6EEEB] rounded-[10px] overflow-hidden flex items-center justify-center">
              <span className="text-[#949BA1] text-[14px]">Calm image</span>
            </div>

            {/* Stats Card - After */}
            <StatsCard
              variant="after"
              stressLevel={GOAL_STATE.stressLevelVariant}
              energyLevel={GOAL_STATE.energyLevel}
              confidenceLevel={GOAL_STATE.confidenceLevel}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
