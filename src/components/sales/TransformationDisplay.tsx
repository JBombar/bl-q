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
 * Pill-shaped badges for "Dnes" and "Tvůj cíl"
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
      <span className="inline-flex items-center px-5 py-1.5 rounded-full bg-gray-light text-dark text-sm font-semibold">
        {children}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-5 py-1.5 rounded-full bg-primary-green text-white text-sm font-semibold">
      {children}
    </span>
  );
}

/**
 * Stress Level Tag
 * "Vysoká" = orange/red pill, "Nízká" = green pill
 */
function StressLevelTag({ level }: { level: 'high' | 'low' }) {
  if (level === 'high') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 border border-orange-400 text-orange-500 text-sm font-medium">
        Vysoká
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-green-light border border-primary-green text-primary-green text-sm font-medium">
      Nízká
    </span>
  );
}

/**
 * Custom Slider Component
 * Displays a visual slider with track, progress, and handle
 */
function CustomSlider({
  isHigh,
  variant,
}: {
  isHigh: boolean;
  variant: 'before' | 'after';
}) {
  const percentage = isHigh ? 85 : 25;
  const colorClass = variant === 'after' ? 'bg-primary-green' : 'bg-red-500';
  const borderColorClass = variant === 'after' ? 'border-primary-green' : 'border-red-500';

  return (
    <div className="relative w-full h-2 bg-gray-200 rounded-full mt-2">
      {/* Progress Track */}
      <div
        className={`absolute left-0 top-0 h-full rounded-full ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
      {/* Handle */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 ${borderColorClass} shadow-sm`}
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}

/**
 * Metric Row Component
 * Displays label, value, and slider in a stacked layout
 */
function MetricRow({
  label,
  value,
  isHigh,
  variant,
}: {
  label: string;
  value: string;
  isHigh: boolean;
  variant: 'before' | 'after';
}) {
  return (
    <div className="py-3">
      <div className="font-bold text-dark text-base mb-0.5">{label}</div>
      <div className="text-gray-500 text-sm">{value}</div>
      <CustomSlider isHigh={isHigh} variant={variant} />
    </div>
  );
}

/**
 * Double Chevron Arrow
 */
function DoubleChevron() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary-green"
    >
      <path
        d="M6 7L11 12L6 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 7L18 12L13 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Stress Level Stats Card
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
  const isHighEnergy = variant === 'after';

  return (
    <div className="bg-white rounded-xl shadow-card px-5 py-4">
      {/* Úroveň stresu row */}
      <div className="flex items-center justify-between py-2">
        <span className="font-bold text-dark text-base">
          {STRESS_CARD_LABELS.stressLevel}
        </span>
        <StressLevelTag level={stressLevel} />
      </div>

      {/* Hladina energie */}
      <MetricRow
        label={STRESS_CARD_LABELS.energyLevel}
        value={energyLevel}
        isHigh={isHighEnergy}
        variant={variant}
      />

      {/* Úroveň sebevědomí */}
      <MetricRow
        label={STRESS_CARD_LABELS.confidenceLevel}
        value={confidenceLevel}
        isHigh={isHighEnergy}
        variant={variant}
      />
    </div>
  );
}

/**
 * TransformationDisplay Component
 * Before/After comparison with stress level visualization
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
      <div className="max-w-[520px] mx-auto px-4">
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
            <div className="relative mb-4 aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <span className="text-gray-400 text-sm">Stressed image</span>
            </div>

            {/* Stats Card - Before */}
            <StatsCard
              variant="before"
              stressLevel={CURRENT_STATE.stressLevelVariant}
              energyLevel={CURRENT_STATE.energyLevel}
              confidenceLevel={CURRENT_STATE.confidenceLevel}
            />
          </motion.div>

          {/* CENTER - Double Chevron Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="shrink-0 pt-[140px]"
          >
            <DoubleChevron />
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
            <div className="relative mb-4 aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <span className="text-gray-400 text-sm">Calm image</span>
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
