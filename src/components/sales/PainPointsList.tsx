'use client';

import { motion } from 'framer-motion';
import { PROBLEMS, SECTION_HEADINGS } from '@/config/sales-page-content';

/**
 * Gray Checkmark Icon - #949BA1
 */
function GrayCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M20 6L9 17L4 12" stroke="#949BA1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * PainPointsList Component
 * "Jak může vypadat život bez Better Lady" section
 * Matches figma_design.md "Problems List" specification
 */
export function PainPointsList() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Card container - bg #F6F6F6, rounded-[10px] */}
        <motion.div
          className="bg-[#F6F6F6] p-6 rounded-[10px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Section heading */}
          <h3 className="text-[20px] font-bold text-[#292424] leading-[1.2em] mb-6">
            {SECTION_HEADINGS.problemsList}
          </h3>

          {/* Problems list */}
          <ul className="space-y-4">
            {PROBLEMS.map((problem, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <GrayCheckIcon />
                <span className="text-[16px] text-[#292424] leading-[1.4em]">{problem}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
