'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FaqItem } from '@/config/sales-page.config';

export interface FaqAccordionProps {
  faq: FaqItem;
  defaultExpanded?: boolean;
}

/**
 * Question Mark Circle Icon
 */
function QuestionMarkIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
      <path d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 10.88 13.38 12 12 12V13.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="16.5" r="1" fill={color}/>
    </svg>
  );
}

/**
 * Plus Icon
 */
function PlusIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * Minus Icon
 */
function MinusIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/**
 * FaqAccordion Component
 * Expandable FAQ item with polished styling
 */
export function FaqAccordion({ faq, defaultExpanded = false }: FaqAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Colors based on state
  const headerBgColor = isExpanded ? '#949BA1' : '#F5F5F5';
  const textColor = isExpanded ? '#FFFFFF' : '#292424';
  const iconColor = isExpanded ? '#FFFFFF' : '#292424';

  return (
    <div className="rounded-[10px] overflow-hidden font-figtree">
      {/* Question Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center gap-3 transition-colors text-left"
        style={{ backgroundColor: headerBgColor }}
      >
        {/* Question Mark Icon */}
        <div className="shrink-0">
          <QuestionMarkIcon color={iconColor} />
        </div>

        {/* Question Text */}
        <h3
          className="flex-1 text-[16px] font-semibold leading-[1.4em]"
          style={{ color: textColor }}
        >
          {faq.question}
        </h3>

        {/* Plus/Minus Icon */}
        <div className="shrink-0">
          {isExpanded ? (
            <MinusIcon color={iconColor} />
          ) : (
            <PlusIcon color={iconColor} />
          )}
        </div>
      </button>

      {/* Answer Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white px-6 py-5 pl-14">
              <p className="text-[15px] text-[#140C0C] leading-[1.6em]">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
