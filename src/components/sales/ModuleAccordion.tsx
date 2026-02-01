'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CourseModule } from '@/config/sales-page-content';

export interface ModuleAccordionProps {
  module: CourseModule;
  defaultExpanded?: boolean;
}

/**
 * Chevron Icon
 */
function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="#327455"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/**
 * ModuleAccordion Component
 * Expandable module with lesson list
 */
export function ModuleAccordion({ module, defaultExpanded = false }: ModuleAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-[#F6F6F6] rounded-[10px] overflow-hidden font-figtree">
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#EBEBEB] transition-colors text-left"
      >
        <h4 className="text-[16px] font-bold text-[#292424] pr-4 leading-[1.3em]">
          {module.title}
        </h4>
        <div className="shrink-0">
          <ChevronIcon isExpanded={isExpanded} />
        </div>
      </button>

      {/* Lessons List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              {/* Lessons */}
              <ul className="space-y-2 mb-4">
                {module.lessons.map((lesson) => (
                  <li
                    key={lesson.number}
                    className="text-[14px] text-[#292424] leading-[1.4em]"
                  >
                    <span className="font-bold">Lekce {lesson.number}.</span> {lesson.title}
                  </li>
                ))}
              </ul>

              {/* Goal */}
              <p className="text-[14px] text-[#327455] font-semibold leading-[1.4em] pt-2 border-t border-[#E4E4E4]">
                {module.goal}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
