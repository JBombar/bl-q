'use client';

import { motion } from 'framer-motion';
import { FaqAccordion } from './FaqAccordion';
import { FAQ_ITEMS } from '@/config/sales-page.config';

/**
 * FaqSection Component
 * FAQ section with accordion items
 */
export function FaqSection() {
  return (
    <section className="py-12 px-4 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-dark">
            Často kladené otázky
          </h2>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-3">
          {FAQ_ITEMS.slice(0, 5).map((faq, index) => (
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
