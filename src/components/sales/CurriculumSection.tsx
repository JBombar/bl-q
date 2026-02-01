'use client';

import { motion } from 'framer-motion';
import { COURSE_MODULES } from '@/config/sales-page-content';

/**
 * CurriculumSection Component
 * Course Modules matching figma_design.md specification
 */
export function CurriculumSection() {
  return (
    <section className="py-12 px-4 bg-white font-figtree">
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
              <div className="w-12 h-12 bg-linear-to-b from-primary-green-light to-primary-green-lighter rounded-lg flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-primary-green">{module.number}</span>
              </div>

              {/* Module content */}
              <div>
                <h3 className="text-xl font-bold text-dark mb-2">
                  {module.title}
                </h3>
                <p className="text-base text-gray-600">
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
