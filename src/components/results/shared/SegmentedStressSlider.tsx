'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { StressStage } from '@/types/funnel.types';

interface SegmentedStressSliderProps {
  normalizedScore: number; // 0-100
  stressStage: StressStage; // 1-4
  showLabels?: boolean;
}

/**
 * SegmentedStressSlider - 4-segment stress level indicator
 * Matches Better Lady design with labels: Nízká, V normě, Střední, Vysoká
 */
export function SegmentedStressSlider({
  normalizedScore,
  stressStage,
  showLabels = true,
}: SegmentedStressSliderProps) {
  const clampedScore = Math.max(0, Math.min(100, normalizedScore));

  // Segment colors
  const segmentColors = [
    'bg-green-400', // Nízká (0-25)
    'bg-yellow-400', // V normě (25-50)
    'bg-orange-400', // Střední (50-75)
    'bg-red-500', // Vysoká (75-100)
  ];

  // Segment labels
  const segmentLabels = ['Nízká', 'V normě', 'Střední', 'Vysoká'];

  return (
    <motion.div
      className="w-full px-4 py-4 mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {/* Segmented track */}
      <div className="relative h-8 rounded-full overflow-hidden flex shadow-sm">
        {/* 4 segments */}
        {segmentColors.map((color, index) => (
          <div
            key={index}
            className={cn('flex-1', color)}
            style={{ width: '25%' }}
          />
        ))}

        {/* Animated indicator ball */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-6 h-6',
            'bg-white rounded-full shadow-lg border-2',
            stressStage === 1 && 'border-green-600',
            stressStage === 2 && 'border-yellow-600',
            stressStage === 3 && 'border-orange-600',
            stressStage === 4 && 'border-red-600'
          )}
          initial={{ left: '0%' }}
          animate={{ left: `calc(${clampedScore}% - 12px)` }}
          transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.4 }}
        />
      </div>

      {/* Segment labels */}
      {showLabels && (
        <div className="flex justify-between mt-2">
          {segmentLabels.map((label, index) => (
            <motion.span
              key={index}
              className={cn(
                'text-xs font-medium flex-1 text-center',
                stressStage === index + 1 ? 'text-gray-900' : 'text-gray-400'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              {label}
            </motion.span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
