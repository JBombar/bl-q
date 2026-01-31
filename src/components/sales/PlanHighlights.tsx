'use client';

import { motion } from 'framer-motion';
import type { HighlightItem } from '@/config/sales-page.config';

export interface PlanHighlightsProps {
  highlights: HighlightItem[];
  mainChallenge?: string;
}

export function PlanHighlights({ highlights, mainChallenge }: PlanHighlightsProps) {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            To nejdůležitější z tvého plánu
          </h2>
          {mainChallenge && (
            <p className="text-lg text-gray-600">
              Zaměříme se na: <span className="font-semibold text-[#F9A201]">{mainChallenge}</span>
            </p>
          )}
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-4xl mb-3">{highlight.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {highlight.title}
              </h3>
              <p className="text-sm text-gray-600">
                {highlight.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
