'use client';

import { motion } from 'framer-motion';
import { PAIN_POINTS } from '@/config/sales-page.config';

export function PainPointsList() {
  return (
    <section className="py-16 px-4 bg-red-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Jak může vypadat život bez Better Lady?
          </h2>
          <p className="text-lg text-gray-600">
            Rozpoznáváš některé z těchto pocitů?
          </p>
        </motion.div>

        {/* Pain Points List */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <ul className="space-y-4">
            {PAIN_POINTS.map((point, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3 text-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="text-red-500 mt-1 flex-shrink-0">✗</span>
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg text-gray-700 font-semibold">
            Nemusíš tak žít. Změna začíná dnes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
