'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface InsertScreenProps {
  question: QuizQuestionWithOptions;
}

export function InsertScreen({ question }: InsertScreenProps) {
  const { nextQuestion } = useQuizState();

  const handleContinue = () => {
    nextQuestion();
  };

  const isValidationScreen = question.question_type === 'validation_info';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 flex items-center justify-center"
    >
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Figtree', lineHeight: '110%' }}>
            {question.question_text}
          </h2>

          {question.question_subtext && (
            <div className="prose prose-lg text-gray-700 mb-8 whitespace-pre-wrap">
              {question.question_subtext}
            </div>
          )}

          {question.image_url && (
            <div className={`relative w-full mb-8 rounded-xl overflow-hidden ${isValidationScreen ? 'h-32' : 'aspect-video'}`}>
              <Image
                src={question.image_url}
                alt={question.question_text}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-contain"
              />
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-[#F9A201] hover:bg-[#e09201] shadow-lg transition-all"
          >
            Pokračovat
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
