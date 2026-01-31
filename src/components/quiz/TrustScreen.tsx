'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizStageLayout } from './QuizStageLayout';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface TrustScreenProps {
  question: QuizQuestionWithOptions;
  questionIndex?: number;
  onComplete?: () => void;
}

export function TrustScreen({ question, questionIndex, onComplete }: TrustScreenProps) {
  const { nextQuestion, previousQuestion, currentQuestionIndex, quiz } = useQuizState();

  const handleContinue = () => {
    // Check if this is the last question
    const isLastQuestion = quiz && questionIndex !== undefined && questionIndex === quiz.questions.length - 1;

    if (isLastQuestion && onComplete) {
      onComplete();
    } else {
      nextQuestion();
    }
  };

  const handleBack = () => {
    previousQuestion();
  };

  // Check if this is the "join community" screen that needs special layout
  const isJoinScreen = question.question_key === 'trust_join';
  const canGoBack = currentQuestionIndex > 0;

  return (
    <QuizStageLayout
      showProgress={false}
      showCTA={true}
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      showBackButton={canGoBack}
      onBackClick={handleBack}
      variant={isJoinScreen ? 'insert' : 'gate'}
    >

      {/* Logo at top for join screen */}
      {isJoinScreen && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <Image
            src="/images/betterlady-logo.svg"
            alt="Better Lady"
            width={140}
            height={32}
            className="h-5 md:h-6 w-auto"
          />
        </div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={isJoinScreen ? 'flex flex-col items-center justify-start h-full text-center px-4 pt-7 pb-2 md:pt-10 md:pb-3' : 'text-center max-w-2xl mx-auto'}
      >
        {/* Map image for join screen */}
        {isJoinScreen && question.image_url && (
          <div className="relative w-full max-w-[260px] md:max-w-[380px] mb-1 md:mb-2">
            <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
              <Image
                src={question.image_url}
                alt={question.question_text}
                fill
                sizes="(max-width: 768px) 260px, 380px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}

        <h1
          className={isJoinScreen
            ? 'text-xs md:text-sm lg:text-base font-bold mb-1 md:mb-2 max-w-lg px-2'
            : 'text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3'
          }
          style={isJoinScreen ? { fontFamily: 'Figtree', lineHeight: '115%', color: '#2D5F4C' } : { fontFamily: 'Figtree' }}
        >
          {question.question_text}
        </h1>
        {question.question_subtext && (
          <p className={isJoinScreen
            ? 'text-gray-700 leading-relaxed text-[11px] md:text-xs max-w-lg px-2'
            : 'text-base md:text-lg lg:text-xl text-gray-700 mb-4 md:mb-6'
          }>
            {question.question_subtext}
          </p>
        )}
      </motion.div>
    </QuizStageLayout>
  );
}
