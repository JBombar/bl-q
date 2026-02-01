'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  SOCIAL_PROOF_TITLE,
  SOCIAL_PROOF_DISCLAIMER,
} from '@/config/sales-page-content';

/**
 * SocialProofStats Component
 * Shows the main title, static graph image, and disclaimer
 */
export function SocialProofStats() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Main Title */}
        <motion.h2
          className="text-[24px] font-bold text-[#327455] leading-[1.2em] text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {SOCIAL_PROOF_TITLE}
        </motion.h2>

        {/* Static Graph Image */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Image
            src="/images/sales-page/social-proof-graph.svg"
            alt="Statistiky úspěšnosti: 81% méně stresu, 73% nárůst energie, 72% vyšší sebevědomí"
            width={450}
            height={200}
            className="w-full h-auto max-w-[450px]"
            priority
          />
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
