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
    <section className="py-12 px-4 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        <motion.div
          className="bg-primary-green-light rounded-lg p-6 border border-primary-green"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-14 h-14 bg-primary-green rounded-lg flex items-center justify-center shrink-0">
              <ShieldIcon />
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg font-bold text-dark mb-2">
                {GUARANTEE.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {GUARANTEE.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
