'use client';

import { motion } from 'framer-motion';
import { COURSE_MODULES } from '@/config/sales-page-content';

/**
 * CurriculumSection Component
 * Course Modules matching figma_design.md specification
 */
export function CurriculumSection() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Modules list */}
        <div className="space-y-6">
          {COURSE_MODULES.map((module, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Module number */}
              <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)'
                }}
              >
                <span className="text-[24px] font-bold text-[#327455]">{module.number}</span>
              </div>

              {/* Module content */}
              <div>
                <h3 className="text-[20px] font-bold text-[#292424] leading-[1.2em] mb-2">
                  {module.title}
                </h3>
                <p className="text-[16px] text-[#949BA1] leading-[1.4em]">
                  {module.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
