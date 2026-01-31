'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { StressStage } from '@/types/funnel.types';

interface ResultDescriptionCardProps {
  title: string;
  description: string;
  stressStage: StressStage;
  variant?: 'default' | 'compact';
}

/**
 * ResultDescriptionCard - Alert card showing result description
 * Matches Better Lady design with warning icon and colored background
 */
export function ResultDescriptionCard({
  title,
  description,
  stressStage,
  variant = 'default',
}: ResultDescriptionCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-xl shadow-sm border mb-6 mx-4',
        variant === 'compact' ? 'p-3' : 'p-4',
        stressStage === 1 && 'bg-green-50 border-green-200',
        stressStage === 2 && 'bg-yellow-50 border-yellow-200',
        stressStage === 3 && 'bg-orange-50 border-orange-200',
        stressStage === 4 && 'bg-pink-50 border-pink-200'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <div
          className={cn(
            'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            stressStage === 1 && 'bg-green-500',
            stressStage === 2 && 'bg-yellow-500',
            stressStage === 3 && 'bg-orange-500',
            stressStage === 4 && 'bg-red-500'
          )}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-bold mb-1',
              stressStage === 1 && 'text-green-900',
              stressStage === 2 && 'text-yellow-900',
              stressStage === 3 && 'text-orange-900',
              stressStage === 4 && 'text-pink-900'
            )}
          >
            {title}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
