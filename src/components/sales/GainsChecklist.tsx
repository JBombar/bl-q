'use client';

import { motion } from 'framer-motion';
import { SOLUTIONS, SECTION_HEADINGS } from '@/config/sales-page-content';

/**
 * Green Checkmark Icon - #327455
 */
function GreenCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M20 6L9 17L4 12" stroke="#327455" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          className="p-6 rounded-[10px] border border-[#327455]"
          style={{
            background: 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)'
          }}
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
                <GreenCheckIcon />
                <span className="text-[16px] text-[#292424] leading-[1.4em]">{solution}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
