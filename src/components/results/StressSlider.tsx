'use client';

import { motion } from 'framer-motion';

interface StressSliderProps {
  /** Normalized score 0-100 */
  normalizedScore: number;
}

/**
 * Visual stress level slider
 * Shows current stress position on a gradient scale
 */
export function StressSlider({ normalizedScore }: StressSliderProps) {
  // Clamp score to 0-100
  const clampedScore = Math.max(0, Math.min(100, normalizedScore));

  return (
    <div className="w-full px-4 py-2">
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Nizka</span>
        <span>Vysoka</span>
      </div>

      {/* Slider track */}
      <div className="relative h-3 rounded-full bg-linear-to-r from-green-400 via-orange-400 via-orange-400 to-red-500">
        {/* Indicator */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-gray-300"
          initial={{ left: '0%' }}
          animate={{ left: `calc(${clampedScore}% - 10px)` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.3 }}
        />
      </div>

      {/* Score label */}
      <motion.div
        className="text-center mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-lg font-semibold text-gray-700">
          {Math.round(clampedScore)}%
        </span>
      </motion.div>
    </div>
  );
}
