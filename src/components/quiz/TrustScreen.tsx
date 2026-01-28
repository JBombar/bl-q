'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizStageLayout } from './QuizStageLayout';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface TrustScreenProps {
  question: QuizQuestionWithOptions;
  onComplete?: () => void;
}

export function TrustScreen({ question, onComplete }: TrustScreenProps) {
  const { nextQuestion } = useQuizState();

  const handleContinue = () => {
    nextQuestion();
  };

  // Check if this is the "join community" screen that needs special layout
  const isJoinScreen = question.question_key === 'trust_join';

  return (
    <QuizStageLayout
      showProgress={false}
      showCTA={true}
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      variant={isJoinScreen ? 'insert' : 'gate'}
    >
      {/* Logo at top for join screen */}
      {isJoinScreen && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Image
            src="/images/betterlady-logo.svg"
            alt="Better Lady"
            width={140}
            height={32}
            className="h-7 md:h-8 w-auto"
          />
        </div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={isJoinScreen ? 'flex flex-col items-center justify-center h-full text-center px-4 py-8' : 'text-center max-w-2xl mx-auto'}
      >
        {/* Image placeholder for join screen (will be added later) */}
        {isJoinScreen && question.image_url && (
          <div className="relative w-full max-w-md mb-6 md:mb-8">
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <Image
                src={question.image_url}
                alt={question.question_text}
                fill
                sizes="(max-width: 768px) 90vw, 500px"
                className="object-contain"
              />
            </div>
          </div>
        )}

        <h1
          className={isJoinScreen
            ? 'text-base md:text-lg lg:text-xl font-bold mb-4 md:mb-5 max-w-lg px-2'
            : 'text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3'
          }
          style={isJoinScreen ? { fontFamily: 'Figtree', lineHeight: '120%', color: '#2D5F4C' } : { fontFamily: 'Figtree' }}
        >
          {question.question_text}
        </h1>
        {question.question_subtext && (
          <p className={isJoinScreen
            ? 'text-gray-700 leading-relaxed text-sm md:text-base max-w-lg px-2'
            : 'text-base md:text-lg lg:text-xl text-gray-700 mb-4 md:mb-6'
          }>
            {question.question_subtext}
          </p>
        )}
      </motion.div>
    </QuizStageLayout>
  );
}
