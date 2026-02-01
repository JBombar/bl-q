'use client';

import { motion } from 'framer-motion';
import {
  SOCIAL_PROOF_TITLE,
  SOCIAL_PROOF_STATS,
  SOCIAL_PROOF_DISCLAIMER,
} from '@/config/sales-page-content';

/**
 * SocialProofStats Component
 * Shows the main title, 3 percentage stats, and disclaimer
 */
export function SocialProofStats() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Main Title */}
        <motion.h2
          className="text-[24px] font-bold text-[#292424] leading-[1.2em] text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {SOCIAL_PROOF_TITLE}
        </motion.h2>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {SOCIAL_PROOF_STATS.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-[32px] font-bold text-[#327455] leading-[1em] mb-1">
                {stat.percentage}%
              </div>
              <div className="text-[14px] text-[#292424] leading-[1.3em]">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          className="text-[12px] text-[#949BA1] text-center leading-[1.5em]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {SOCIAL_PROOF_DISCLAIMER}
        </motion.p>
      </div>
    </section>
  );
}
