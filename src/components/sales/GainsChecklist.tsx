'use client';

import { motion } from 'framer-motion';
import { SOLUTIONS, SECTION_HEADINGS } from '@/config/sales-page-content';

/**
 * Circled Checkmark Icon - Green circle with white checkmark
 */
function CircledCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <circle cx="12" cy="12" r="10" fill="#327455"/>
      <path d="M17 8L10 15L7 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * GainsChecklist Component
 * "S čím ti Better Lady může pomoci" section
 * Matches figma_design.md "Solutions List" specification
 */
export function GainsChecklist() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Card container with green gradient and border - #327455 border, mint gradient bg */}
        <motion.div
          className="p-6 rounded-[10px] border border-[#327455] bg-[#e6eeeb]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Section heading */}
          <h3 className="text-[20px] font-bold text-[#292424] leading-[1.2em] mb-6">
            {SECTION_HEADINGS.solutionsList}
          </h3>

          {/* Solutions list */}
          <ul className="space-y-4">
            {SOLUTIONS.map((solution, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <CircledCheckIcon />
                <span className="text-[16px] text-[#292424] leading-[1.4em]">{solution}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
