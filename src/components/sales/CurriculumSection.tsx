'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { PLAN_SECTIONS, CURRICULUM_TITLE } from '@/config/sales-page-content';
import { ModuleAccordion } from './ModuleAccordion';

// Section images mapping (for sections 2, 3, 4)
const SECTION_IMAGES: Record<number, { src: string; alt: string }> = {
  2: {
    src: '/images/sales-page/kruh-duvery.png',
    alt: 'Kruh důvěry - vizualizace',
  },
  3: {
    src: '/images/sales-page/osobni-mapa.png',
    alt: 'Osobní mapa vnitřního světa',
  },
  4: {
    src: '/images/sales-page/komunita.png',
    alt: 'Komunita stejně naladěných žen',
  },
};

/**
 * CurriculumSection Component
 * "Co je součástí tvého plánu" section with 4 numbered plan sections
 */
export function CurriculumSection() {
  return (
    <section className="py-12 px-6 bg-white font-figtree">
      <div className="max-w-[500px] mx-auto">
        {/* Section Title */}
        <motion.h2
          className="text-[28px] font-bold text-[#292424] leading-[28px] mb-8"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {CURRICULUM_TITLE}
        </motion.h2>

        {/* Plan Sections */}
        <div className="space-y-10">
          {PLAN_SECTIONS.map((section, index) => {
            const sectionImage = SECTION_IMAGES[section.number];

            return (
              <motion.div
                key={section.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Section Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Number Badge */}
                  <div
                    className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)'
                    }}
                  >
                    <span className="text-[28px] font-bold text-[#327455]">{section.number}</span>
                  </div>

                  {/* Title and Subtitle */}
                  <div>
                    <h3 className="text-[22px] font-bold text-[#292424] leading-[1.2em] mb-1">
                      {section.title}
                    </h3>
                    <p className="text-[16px] text-[#292424] leading-[1.4em]">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description (for sections 2, 3, 4) */}
                {section.description && (
                  <p className="text-[16px] text-[#292424] leading-[1.5em] mb-4 ml-16">
                    {section.description}
                  </p>
                )}

                {/* Image Section (for sections 2, 3, 4) */}
                {sectionImage && (
                  <div
                    className="rounded-[10px] flex items-center justify-center p-8 ml-16"
                    style={{
                      background: 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)'
                    }}
                  >
                    <Image
                      src={sectionImage.src}
                      alt={sectionImage.alt}
                      width={400}
                      height={300}
                      className="w-full h-auto max-w-full"
                    />
                  </div>
                )}

                {/* Modules (only for section 1) */}
                {section.modules && section.modules.length > 0 && (
                  <div className="space-y-3 ml-0">
                    {section.modules.map((module, moduleIndex) => (
                      <ModuleAccordion
                        key={module.id}
                        module={module}
                        defaultExpanded={moduleIndex === 0}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
