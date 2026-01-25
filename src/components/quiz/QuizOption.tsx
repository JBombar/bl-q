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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`
        w-full p-4 rounded-xl text-left transition-all border-2
        ${isSelected
          ? 'bg-white border-[#F9A201] shadow-md'
          : 'bg-gray-100 border-transparent hover:bg-gray-200'
        }
      `}
    >
      <div className="flex items-center">
        <div className={`
          w-5 h-5 rounded-full mr-3 flex-shrink-0 border-2 flex items-center justify-center
          ${isSelected
            ? 'bg-[#F9A201] border-[#F9A201]'
            : 'border-gray-300 bg-white'
          }
        `}>
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-white" />
          )}
        </div>
        <span className="font-medium text-gray-900">{option.option_text}</span>
      </div>
    </motion.button>
  );
});
