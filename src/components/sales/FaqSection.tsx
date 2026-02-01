'use client';

import { motion } from 'framer-motion';
import { FaqAccordion } from './FaqAccordion';
import { FAQ_ITEMS } from '@/config/sales-page.config';
import { SECTION_HEADINGS } from '@/config/sales-page-content';

/**
 * FaqSection Component
 * FAQ section with accordion items
 */
export function FaqSection() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[24px] font-bold text-[#292424] leading-[1.2em]">
            {SECTION_HEADINGS.faq}
          </h2>
        </motion.div>

        {/* FAQ List - All 5 items */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <FaqAccordion faq={faq} defaultExpanded={index === 0} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
