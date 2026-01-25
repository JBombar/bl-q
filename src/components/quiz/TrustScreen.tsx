'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizStageLayout } from './QuizStageLayout';
import type { QuizQuestionWithOptions } from '@/types';

interface TrustScreenProps {
  question: QuizQuestionWithOptions;
  onComplete?: () => void;
}

export function TrustScreen({ question, onComplete }: TrustScreenProps) {
  const { nextQuestion } = useQuizState();

  const handleContinue = () => {
    nextQuestion();
  };

  return (
    <QuizStageLayout
      showProgress={false}
      showCTA={true}
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      variant="gate"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3" style={{ fontFamily: 'Figtree' }}>
          {question.question_text}
        </h1>
        {question.question_subtext && (
          <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-4 md:mb-6">{question.question_subtext}</p>
        )}
      </motion.div>
    </QuizStageLayout>
  );
}
