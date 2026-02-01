'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FaqItem } from '@/config/sales-page.config';

export interface FaqAccordionProps {
  faq: FaqItem;
  defaultExpanded?: boolean;
}

/**
 * Chevron Icon
 */
function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-400"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
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
    <div className="bg-card-bg rounded-lg overflow-hidden font-figtree">
      {/* Question */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
      >
        <h3 className="text-base font-semibold text-dark pr-4">
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
              <p className="text-sm text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
