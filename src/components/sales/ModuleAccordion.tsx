'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { CourseModule } from '@/config/sales-page-content';

export interface ModuleAccordionProps {
  module: CourseModule;
  defaultExpanded?: boolean;
}

/**
 * Chevron Icon - rotates when expanded
 */
function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="#949BA1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/**
 * ModuleAccordion Component
 * Expandable module with timeline lesson list
 * Matches Figma design specification
 */
export function ModuleAccordion({ module, defaultExpanded = false }: ModuleAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className="bg-white rounded-[10px] overflow-hidden font-figtree"
      style={{
        border: '1.5px solid #E4E4E4',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-[#FAFAFA] transition-colors text-left"
      >
        {/* Module Image */}
        <div className="w-[83px] h-[83px] rounded-[8px] overflow-hidden shrink-0 bg-[#F6F6F6]">
          <Image
            src={module.image}
            alt={module.title}
            width={83}
            height={83}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Block */}
        <div className="flex-1 min-w-0">
          {/* Module Badge */}
          <span
            className="inline-block px-2 py-1 text-[14px] font-bold text-[#327455] rounded-[6px] mb-2"
            style={{ backgroundColor: '#E6EEEB' }}
          >
            MODUL {module.moduleNumber}
          </span>

          {/* Module Title */}
          <h4 className="text-[20px] font-bold text-[#292424] leading-[1.2em]">
            {module.title}
          </h4>
        </div>

        {/* Chevron Icon */}
        <div className="shrink-0">
          <ChevronIcon isExpanded={isExpanded} />
        </div>
      </button>

      {/* Expanded Content - Lesson List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Timeline Layout Container */}
              <div className="relative pl-6">
                {/* Vertical Dashed Line */}
                <div
                  className="absolute left-[7px] top-[12px] bottom-[80px]"
                  style={{
                    borderLeft: '1.5px dashed #327455',
                  }}
                />

                {/* Lessons List */}
                <div className="space-y-3">
                  {module.lessons.map((lesson, index) => {
                    const isFirst = index === 0;
                    const borderColor = isFirst ? '#327455' : '#D6D6D6';

                    return (
                      <div key={lesson.number} className="relative flex items-start">
                        {/* Circle Marker */}
                        <div
                          className="absolute left-[-22px] top-[4px] w-[14px] h-[14px] rounded-full bg-white"
                          style={{
                            border: `1.5px solid ${borderColor}`,
                          }}
                        />

                        {/* Lesson Text */}
                        <p className="text-[16px] text-[#327455] leading-[1.5em]">
                          <span className="font-bold">Lekce {lesson.number}.</span>{' '}
                          {lesson.title}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Goal Box */}
                <div
                  className="mt-4 p-4 rounded-[10px]"
                  style={{
                    backgroundColor: '#E6EEEB',
                    border: '1.5px solid #327455',
                  }}
                >
                  <p className="text-[16px] text-[#292424] leading-[1.5em]">
                    <span className="font-bold text-[#327455]">Cíl:</span>{' '}
                    {module.goal}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
