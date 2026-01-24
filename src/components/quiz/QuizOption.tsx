'use client';

import { motion } from 'framer-motion';
import type { QuizOption as QuizOptionType } from '@/types';

interface QuizOptionProps {
  option: QuizOptionType;
  isSelected: boolean;
  onSelect: () => void;
}

export function QuizOption({ option, isSelected, onSelect }: QuizOptionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        w-full p-4 rounded-xl text-left transition-all
        ${isSelected
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
        }
      `}
    >
      <div className="flex items-center">
        <div className={`
          w-5 h-5 rounded-full mr-3 flex-shrink-0 border-2
          ${isSelected
            ? 'bg-white border-white'
            : 'border-gray-300'
          }
        `}>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-full h-full rounded-full bg-blue-600"
            />
          )}
        </div>
        <span className="font-medium">{option.option_text}</span>
      </div>
    </motion.button>
  );
}
