'use client';

import { motion } from 'framer-motion';
import { GUARANTEE } from '@/config/sales-page.config';

/**
 * Shield Icon
 */
function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * GuaranteeBox Component
 * 30-day money-back guarantee section
 */
export function GuaranteeBox() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        <motion.div
          className="rounded-[10px] p-6 border border-[#327455]"
          style={{
            background: 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-14 h-14 bg-[#327455] rounded-[10px] flex items-center justify-center shrink-0">
              <ShieldIcon />
            </div>

            {/* Content */}
            <div>
              <h3 className="text-[18px] font-bold text-[#292424] leading-[1.2em] mb-2">
                {GUARANTEE.title}
              </h3>
              <p className="text-[14px] text-[#949BA1] leading-[1.5em]">
                {GUARANTEE.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
