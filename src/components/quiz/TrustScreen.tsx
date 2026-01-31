'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { StageLayout } from '@/components/layout';
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
    <StageLayout
      showProgress={false}
      showCTA={true}
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      showBackButton={canGoBack}
      onBackClick={handleBack}
      variant="insert"
      bgClass="bg-white"
    >
      {/* Logo at top */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Image
          src="/images/betterlady-logo.svg"
          alt="Better Lady"
          width={140}
          height={32}
          className="h-6 md:h-7 w-auto"
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center h-full text-center px-6 pt-18"
      >
        {/* Title */}
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 text-[#2D5F4C]"
          style={{ fontFamily: 'Figtree', lineHeight: '110%' }}
        >
          {question.question_text}
        </h1>
        
        {/* Subtitle */}
        {question.question_subtext && (
          <p className="text-base md:text-lg text-gray-700 mb-8">
            {question.question_subtext}
          </p>
        )}

        {/* Image */}
        {question.image_url && (
          <div className="relative w-full max-w-[280px] md:max-w-[340px]">
            <div className="relative w-full aspect-3/4">
              <Image
                src={question.image_url}
                alt={question.question_text}
                fill
                sizes="(max-width: 768px) 280px, 340px"
                className="object-contain"
                quality={95}
                priority
              />
            </div>
          </div>
        )}
      </motion.div>
    </StageLayout>
  );
}
