'use client';

import { motion } from 'framer-motion';
import { GAINS_CHECKLIST } from '@/config/sales-page.config';

export function GainsChecklist() {
  return (
    <section className="py-16 px-4 bg-linear-to-b from-white to-green-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            S čím ti Better Lady může pomoci
          </h2>
          <p className="text-lg text-gray-600">
            Během 90 dní získáš zpět kontrolu nad svým životem
          </p>
        </motion.div>

        {/* Gains Grid */}
        <div className="space-y-6">
          {GAINS_CHECKLIST.map((gain, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-green-100 flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">✓</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {gain.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {gain.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
