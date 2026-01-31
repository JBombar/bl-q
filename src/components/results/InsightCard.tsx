'use client';

import { motion } from 'framer-motion';
import type { InsightCard as InsightCardType } from '@/types/funnel.types';

// Icon components (inline SVG for simplicity)
const icons: Record<string, React.ReactNode> = {
  target: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  ),
  lightning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
      <path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  battery: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="2" y="6" width="18" height="12" rx="2" strokeWidth="2" />
      <path strokeWidth="2" d="M22 10v4" />
      <rect x="5" y="9" width="6" height="6" fill="currentColor" rx="1" />
    </svg>
  ),
};

interface InsightCardProps {
  card: InsightCardType;
  index: number;
}

/**
 * Single insight card showing user's answer to an anchor question
 * Updated to match Better Lady design with blue borders
 */
export function InsightCard({ card, index }: InsightCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl p-2.5 shadow-sm border-2 border-blue-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index + 0.6 }}
    >
      <div className="flex flex-col gap-1.5">
        {/* Icon + Label */}
        <div className="flex items-center gap-2">
          <div className="shrink-0 text-lg">
            {icons[card.icon] || icons.target}
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {card.label}
          </p>
        </div>

        {/* Value */}
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {card.value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface InsightCardGridProps {
  cards: InsightCardType[];
}

/**
 * Grid of insight cards
 */
export function InsightCardGrid({ cards }: InsightCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <InsightCard key={card.cardType} card={card} index={index} />
      ))}
    </div>
  );
}
