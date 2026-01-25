'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizStageLayout } from './QuizStageLayout';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface AgeGateScreenProps {
  question: QuizQuestionWithOptions;
  onComplete?: () => void;
}

export function AgeGateScreen({ question, onComplete }: AgeGateScreenProps) {
  const { selectAnswer, nextQuestion } = useQuizState();
  const [startTime] = useState(Date.now());

  const handleAgeSelect = async (optionId: string) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    selectAnswer(question.id, [optionId], timeSpent); // Non-blocking

    setTimeout(() => {
      nextQuestion();
    }, 100);
  };

  return (
    <QuizStageLayout
      showProgress={false}
      variant="gate"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3" style={{ fontFamily: 'Figtree' }}>
          {question.question_text}
        </h1>
        {question.question_subtext && (
          <p className="text-sm md:text-base lg:text-lg text-gray-700 mb-4 md:mb-6">{question.question_subtext}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          {question.options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 * (index + 1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAgeSelect(option.id)}
              className="bg-white rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all p-3 md:p-4 flex flex-col items-center"
            >
              {option.image_url && (
                <div className="relative w-full aspect-square mb-2 md:mb-3 rounded-md md:rounded-lg overflow-hidden">
                  <Image
                    src={option.image_url}
                    alt={option.option_text}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-xs md:text-sm lg:text-base font-semibold text-gray-900">{option.option_text}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-[10px] md:text-xs text-gray-500 max-w-md mx-auto">
          Výběrem věku a pokračováním souhlasíš s našimi Obchodními podmínkami | Ochrannou osobních údajů.
        </p>
      </motion.div>
    </QuizStageLayout>
  );
}
