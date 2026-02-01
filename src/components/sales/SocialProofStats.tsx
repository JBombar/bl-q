'use client';

import { motion } from 'framer-motion';
import { SOCIAL_PROOF_TEXT } from '@/config/sales-page-content';

/**
 * SocialProofStats Component
 * Matches figma_design.md "Social Proof Section" specification
 */
export function SocialProofStats() {
  return (
    <section className="py-8 px-4 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-dark">
            {SOCIAL_PROOF_TEXT}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
