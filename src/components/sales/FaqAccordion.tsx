'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FaqItem } from '@/config/sales-page.config';

export interface FaqAccordionProps {
  faq: FaqItem;
  defaultExpanded?: boolean;
}

/**
 * Chevron Icon - #949BA1
 */
function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="#949BA1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/**
 * FaqAccordion Component
 * Expandable FAQ item
 */
export function FaqAccordion({ faq, defaultExpanded = false }: FaqAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-[#F6F6F6] rounded-[10px] overflow-hidden font-figtree">
      {/* Question */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#EBEBEB] transition-colors text-left"
      >
        <h3 className="text-[16px] font-semibold text-[#292424] pr-4 leading-[1.3em]">
          {faq.question}
        </h3>
        <div className="shrink-0">
          <ChevronIcon isExpanded={isExpanded} />
        </div>
      </button>

      {/* Answer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-4">
              <p className="text-[14px] text-[#949BA1] leading-[1.5em]">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
