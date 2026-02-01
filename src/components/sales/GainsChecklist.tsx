'use client';

import { motion } from 'framer-motion';
import { SOLUTIONS, SECTION_HEADINGS } from '@/config/sales-page-content';

/**
 * Green Checkmark Icon
 */
function GreenCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-green flex-shrink-0">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    <section className="py-12 px-4 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Card container with green gradient and border */}
        <motion.div
          className="bg-linear-to-b from-primary-green-light to-transparent p-6 rounded-lg border border-primary-green"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Section heading */}
          <h3 className="text-xl font-bold text-dark mb-6">
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
                <span className="text-base text-dark">{solution}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
