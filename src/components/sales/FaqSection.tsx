'use client';

import { motion } from 'framer-motion';
import { FaqAccordion } from './FaqAccordion';
import { FAQ_ITEMS } from '@/config/sales-page.config';

export function FaqSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Často kladené otázky
          </h2>
          <p className="text-lg text-gray-600">
            Máš otázky? Najdi odpovědi zde
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <FaqAccordion faq={faq} defaultExpanded={index === 0} />
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 text-center bg-white rounded-xl p-8 shadow-sm border border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-gray-700 mb-4">
            Nenašla jsi odpověď na svou otázku?
          </p>
          <a
            href="mailto:podpora@betterlady.cz"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Kontaktuj nás
          </a>
        </motion.div>
      </div>
    </section>
  );
}
