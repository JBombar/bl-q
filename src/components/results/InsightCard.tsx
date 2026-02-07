'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { InsightCard as InsightCardType } from '@/types/funnel.types';

// Map icon keys to SVG file paths
const iconPaths: Record<string, string> = {
  target: '/icons/results_hlavni_vyzva.svg',
  lightning: '/icons/results_spoustec.svg',
  calendar: '/icons/results_narocne_obdobi.svg',
  battery: '/icons/results_hladina_energie.svg',
};

interface InsightCardProps {
  card: InsightCardType;
  index: number;
}

/**
 * Single insight card showing user's answer to an anchor question
 * Icons from /public/icons/results_*.svg, cards expand to fit dynamic text
 */
export function InsightCard({ card, index }: InsightCardProps) {
  const iconSrc = iconPaths[card.icon] || iconPaths.target;

  return (
    <motion.div
      className="bg-[#f5f5f5] rounded-[10px] min-h-[55px] flex items-center px-[12px] py-[8px] gap-[8px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index + 0.6 }}
    >
      {/* Icon — 24×24 */}
      <div className="shrink-0 w-[24px] h-[24px] flex items-center justify-center">
        <Image
          src={iconSrc}
          alt=""
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
      {/* Text block */}
      <div className="flex flex-col min-w-0">
        <span className="text-[13px] leading-[13px] font-normal text-[#292424] font-figtree">
          {card.label}
        </span>
        <span className="text-[14px] leading-[16px] font-bold text-[#292424] font-figtree mt-[2px]">
          {card.value}
        </span>
      </div>
    </motion.div>
  );
}

interface InsightCardGridProps {
  cards: InsightCardType[];
}

/**
 * Grid of insight cards — uniform sizing via subgrid-like auto-rows
 */
export function InsightCardGrid({ cards }: InsightCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-[8px] auto-rows-[1fr]">
      {cards.map((card, index) => (
        <InsightCard key={card.cardType} card={card} index={index} />
      ))}
    </div>
  );
}
