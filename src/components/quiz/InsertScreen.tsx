'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizStageLayout } from './QuizStageLayout';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface InsertScreenProps {
  question: QuizQuestionWithOptions;
  onComplete?: () => void;
}

export function InsertScreen({ question, onComplete }: InsertScreenProps) {
  const { nextQuestion } = useQuizState();

  const handleContinue = () => {
    nextQuestion();
  };

  const isValidationScreen = question.question_type === 'validation_info';

  return (
    <QuizStageLayout
      showProgress={false}
      showCTA
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      variant="insert"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center max-w-2xl mx-auto"
      >
        {question.image_url && (
          <div className={`relative w-full mb-4 md:mb-6 ${isValidationScreen ? 'h-20 md:h-24' : 'h-24 md:h-32'}`}>
            <Image
              src={question.image_url}
              alt={question.question_text}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        )}

        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4" style={{ fontFamily: 'Figtree', lineHeight: '110%' }}>
          {question.question_text}
        </h2>

        {question.question_subtext && (
          <div className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed text-xs md:text-sm">
            {question.question_subtext}
          </div>
        )}
      </motion.div>
    </QuizStageLayout>
  );
}
