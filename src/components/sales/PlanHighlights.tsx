'use client';

import { motion } from 'framer-motion';
import { PLAN_FEATURES } from '@/config/sales-page-content';

/**
 * Feature Icon placeholder
 */
function FeatureIcon({ index }: { index: number }) {
  const icons = ['📋', '🎯', '📱', '🧘', '📊'];
  return (
    <div className="w-12 h-12 bg-card-bg rounded-lg flex items-center justify-center shrink-0">
      <span className="text-2xl">{icons[index] || '✓'}</span>
    </div>
  );
}

/**
 * PlanHighlights Component
 * Plan Features List matching figma_design.md specification
 */
export function PlanHighlights() {
  return (
    <section className="py-12 px-4 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Features list */}
        <div className="space-y-4">
          {PLAN_FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-4 p-4 bg-card-bg rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureIcon index={index} />
              <p className="text-base text-dark leading-relaxed">{feature}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
