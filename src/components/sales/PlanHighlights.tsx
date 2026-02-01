'use client';

import { motion } from 'framer-motion';
import { PLAN_HIGHLIGHTS, PLAN_HIGHLIGHTS_TITLE } from '@/config/sales-page-content';

/**
 * Checkmark Icon
 */
function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M20 6L9 17L4 12" stroke="#327455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * PlanHighlights Component
 * "To nejdůležitější z tvého plánu" section
 */
export function PlanHighlights() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Section Title */}
        <motion.h2
          className="text-[24px] font-bold text-[#292424] leading-[1.2em] mb-6"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {PLAN_HIGHLIGHTS_TITLE}
        </motion.h2>

        {/* Highlights list */}
        <div className="space-y-4">
          {PLAN_HIGHLIGHTS.map((highlight, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <CheckIcon />
              <p className="text-[16px] text-[#292424] leading-[1.4em]">
                <span className="font-bold">{highlight.title}</span>
                {' – '}
                {highlight.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
