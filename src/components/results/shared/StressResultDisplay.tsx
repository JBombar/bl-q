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
}

/**
 * StressResultDisplay - Shows stress level badge and woman image
 * Matches Better Lady design with "Úroveň stresu" label and badge
 */
export function StressResultDisplay({
  stageImagePath,
  stageTitle,
  segmentLabel,
  stressStage,
}: StressResultDisplayProps) {
  return (
    <div className="w-full max-w-sm mx-auto mb-6">
      {/* Stress Level Label + Badge */}
      <motion.div
        className="flex items-center justify-between px-4 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-sm text-gray-700">Úroveň stresu:</span>
        <span
          className={cn(
            'inline-block px-3 py-1 rounded-md text-sm font-semibold',
            stressStage === 1 && 'bg-green-100 text-green-700',
            stressStage === 2 && 'bg-yellow-100 text-yellow-700',
            stressStage === 3 && 'bg-orange-100 text-orange-700',
            stressStage === 4 && 'bg-pink-100 text-pink-700'
          )}
        >
          {segmentLabel}
        </span>
      </motion.div>

      {/* Woman Image with "Tvoje úroveň" Badge */}
      <motion.div
        className="relative w-full aspect-3/4 max-h-96 rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
      >
        <Image
          src={stageImagePath}
          alt={stageTitle}
          fill
          className="object-cover"
          priority
        />

        {/* "Tvoje úroveň" Badge Overlay */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            Tvoje úroveň
          </div>
        </div>
      </motion.div>
    </div>
  );
}
