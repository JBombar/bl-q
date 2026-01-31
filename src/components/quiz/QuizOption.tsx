'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { QuizOption as QuizOptionType } from '@/types';

interface QuizOptionProps {
  option: QuizOptionType;
  isSelected: boolean;
  onSelect: () => void;
}

export const QuizOption = memo(function QuizOption({ option, isSelected, onSelect }: QuizOptionProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-left transition-all border-2
        ${isSelected
          ? 'bg-white border-[#F9A201] shadow-md'
          : 'bg-gray-100 border-transparent hover:bg-gray-200'
        }
      `}
    >
      <div className="flex items-center">
        <div className={`
          w-4 h-4 md:w-5 md:h-5 rounded-full mr-2 md:mr-3 shrink-0 border-2 flex items-center justify-center
          ${isSelected
            ? 'bg-[#F9A201] border-[#F9A201]'
            : 'border-gray-300 bg-white'
          }
        `}>
          {isSelected && (
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />
          )}
        </div>
        <span className="font-medium text-gray-900 text-xs md:text-sm">{option.option_text}</span>
      </div>
    </motion.button>
  );
});
