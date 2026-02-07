'use client';

import { motion } from 'framer-motion';
import type { InsightCard } from '@/types/funnel.types';
import { InsightCardGrid } from '../InsightCard';

interface InsightCardsSectionProps {
  title?: string;
  cards: InsightCard[];
}

/**
 * InsightCardsSection - Grid of insight cards with optional title
 * Matches Better Lady design with 2x2 grid layout
 */
export function InsightCardsSection({ title, cards }: InsightCardsSectionProps) {
  return (
    <motion.div
      className="w-full max-w-[351px] mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      {title && (
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          {title}
        </h3>
      )}
      <InsightCardGrid cards={cards} />
    </motion.div>
  );
}
