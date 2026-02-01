'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { GUARANTEE } from '@/config/sales-page.config';

/**
 * GuaranteeBox Component
 * 30-day money-back guarantee section with badge overlay
 */
export function GuaranteeBox() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        <motion.div
          className="relative rounded-[10px] text-center pt-14 pb-6 px-6"
          style={{
            backgroundColor: '#FFFAEF',
            border: '2px solid #F9A201',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* 100% Badge - Overlapping Top Border */}
          <Image
            src="/images/sales-page/guarantee-badge.svg"
            alt="100% Záruka"
            width={74}
            height={78}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />

          {/* Title */}
          <h3 className="text-[20px] font-bold text-[#292424] leading-[1.3em] mb-3">
            {GUARANTEE.title}
          </h3>

          {/* Description */}
          <p className="text-[14px] text-[#292424] leading-[1.6em] mb-4">
            {GUARANTEE.description}
          </p>

          {/* Link */}
          <a
            href="#"
            className="text-[14px] text-[#327455] underline hover:no-underline transition-all"
          >
            Zjistit více
          </a>
        </motion.div>
      </div>
    </section>
  );
}
