'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
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
    await selectAnswer(question.id, [optionId], timeSpent);

    setTimeout(() => {
      nextQuestion();
    }, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Figtree' }}>
            {question.question_text}
          </h1>
          {question.question_subtext && (
            <p className="text-xl text-gray-700">{question.question_subtext}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {question.options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * (index + 1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAgeSelect(option.id)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 flex flex-col items-center"
            >
              {option.image_url && (
                <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={option.image_url}
                    alt={option.option_text}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-lg font-semibold text-gray-900">{option.option_text}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 max-w-md mx-auto">
          Výběrem věku a pokračováním souhlasíš s našimi Obchodními podmínkami | Ochrannou osobních údajů.
        </p>
      </div>
    </motion.div>
  );
}
