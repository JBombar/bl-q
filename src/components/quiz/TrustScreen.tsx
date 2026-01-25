'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface TrustScreenProps {
  question: QuizQuestionWithOptions;
}

export function TrustScreen({ question }: TrustScreenProps) {
  const { nextQuestion } = useQuizState();

  const handleContinue = () => {
    nextQuestion();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 flex items-center justify-center"
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Figtree' }}>
            {question.question_text}
          </h1>
          {question.question_subtext && (
            <p className="text-2xl text-gray-700 mb-8">{question.question_subtext}</p>
          )}

          {question.image_url && (
            <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
              <Image
                src={question.image_url}
                alt="Trust"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
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
