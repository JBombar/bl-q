'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { StressStage } from '@/types/funnel.types';

interface StressResultDisplayProps {
  stageImagePath: string;
  stageTitle: string;
  segmentLabel: string;
  stressStage: StressStage;
  normalizedScore: number;
  stageDescription: string;
}

// Stage-specific color tokens
const STAGE_COLORS = {
  1: {
    badge: 'bg-green-100 border-green-600 text-green-600',
    alert: 'bg-green-100',
    alertIcon: 'bg-green-200',
    alertDot: 'bg-green-600',
  },
  2: {
    badge: 'bg-yellow-100 border-yellow-600 text-yellow-600',
    alert: 'bg-yellow-100',
    alertIcon: 'bg-yellow-200',
    alertDot: 'bg-yellow-600',
  },
  3: {
    badge: 'bg-orange-100 border-orange-600 text-orange-600',
    alert: 'bg-orange-100',
    alertIcon: 'bg-orange-200',
    alertDot: 'bg-orange-600',
  },
  4: {
    badge: 'bg-[#ffd2d2] border-[#e60000] text-[#e60000]',
    alert: 'bg-[#ffd2d2]',
    alertIcon: 'bg-[#fbb5b5]',
    alertDot: 'bg-[#e60000]',
  },
} as const;

/**
 * StressResultDisplay - Full results card matching Figma spec
 * Contains: stress label + badge, diagram, tooltip, gradient bar, labels, alert card
 */
export function StressResultDisplay({
  stageImagePath,
  stageTitle,
  segmentLabel,
  stressStage,
  normalizedScore,
  stageDescription,
}: StressResultDisplayProps) {
  const clampedScore = Math.max(0, Math.min(100, normalizedScore));
  const colors = STAGE_COLORS[stressStage];

  return (
    <div className="w-full max-w-[351px] mx-auto">
      <div className="bg-[#f5f5f5] rounded-[10px] p-[12px]">
        {/* Stress Level Header — label + badge */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-[15px] leading-[15px] font-bold text-[#292424] font-figtree">
            Úroveň stresu:
          </span>
          <span
            className={cn(
              'px-[10px] py-[6px] rounded-[6px] border text-[14px] leading-[14px] font-normal font-figtree',
              colors.badge
            )}
          >
            {segmentLabel}
          </span>
        </motion.div>

        {/* Stress Diagram — 103×123px */}
        <motion.div
          className="flex justify-center mt-[20px]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        >
          <Image
            src={stageImagePath}
            alt={stageTitle}
            width={103}
            height={123}
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Tooltip "Tvoje úroveň" with arrow */}
        <motion.div
          className="flex flex-col items-center mt-[8px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-[#525252] rounded-[6px] px-[12px] py-[6px]">
            <span className="text-[14px] leading-[14px] font-bold text-white font-figtree">
              Tvoje úroveň
            </span>
          </div>
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#525252]" />
        </motion.div>

        {/* Gradient Bar — 5-color gradient with indicator */}
        <div className="relative mt-[8px] bg-white rounded-[8px] h-[12px] flex items-center px-[3px]">
          {/* Progress indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-[19px] h-[19px] rounded-full border-[3px] border-gray-400 bg-white z-10"
            initial={{ left: '3px' }}
            animate={{ left: `calc(${clampedScore}% - 9.5px)` }}
            transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.4 }}
          />
          {/* Gradient bar with dividers */}
          <div
            className="w-full h-[6px] rounded-[4px] relative overflow-hidden"
            style={{
              background:
                'linear-gradient(to right, #52c9ff 0%, #c8f29d 26.4%, #f9ea7c 52.4%, #ee9363 78.8%, #e60000 100%)',
            }}
          >
            {[25, 50, 75].map((pos) => (
              <div
                key={pos}
                className="absolute top-0 h-full w-[3px] bg-white"
                style={{ left: `${pos}%` }}
              />
            ))}
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-[8px]">
          {['Nízká', 'V normě', 'Střední', 'Vysoká'].map((label) => (
            <span
              key={label}
              className="text-[12px] leading-[14.4px] font-normal text-[#bababa] font-figtree text-center flex-1"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Alert Card */}
        <div className={cn('mt-[8px] rounded-[10px] p-[12px]', colors.alert)}>
          <div className="flex items-start gap-[8px]">
            {/* Info icon */}
            <div
              className={cn(
                'w-[32px] h-[32px] rounded-[8px] flex items-center justify-center shrink-0',
                colors.alertIcon
              )}
            >
              <div
                className={cn(
                  'w-[18px] h-[18px] rounded-full flex items-center justify-center',
                  colors.alertDot
                )}
              >
                <span className="text-[11px] leading-[14.3px] font-medium text-white font-figtree">
                  i
                </span>
              </div>
            </div>
            {/* Text */}
            <div className="flex-1">
              <h3 className="text-[16px] leading-[16px] font-bold text-[#292424] font-figtree">
                {stageTitle}
              </h3>
              <p className="mt-[4px] text-[13px] leading-[16.9px] font-normal text-[#292424] font-figtree">
                {stageDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
