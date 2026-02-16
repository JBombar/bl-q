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

  // Join/map community screen — different layout from trust screen
  if (isJoinScreen) {
    return (
      <StageLayout
        showProgress={false}
        showCTA={true}
        ctaLabel="Pokračovat"
        onCtaClick={handleContinue}
        variant="gate"
        bgClass="bg-white"
        showBackButton={canGoBack}
        onBackClick={handleBack}
        showHeaderLogo={true}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center text-center w-full"
        >
          {/* Map image — Responsive */}
          {question.image_url && (
            <div className="relative mt-6 w-full max-w-xs aspect-308/150">
              <Image
                src={question.image_url}
                alt={question.question_text}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-contain"
                quality={95}
                priority
              />
            </div>
          )}

          {/* Heading */}
          <h1 className="mt-8 text-xl md:text-2xl leading-snug font-bold text-[#292424] font-figtree px-4">
            {question.question_text}
          </h1>

          {/* Subtitle */}
          {question.question_subtext && (
            <p className="mt-4 text-base leading-snug font-normal text-[#292424] font-figtree max-w-xs mx-auto px-4">
              {question.question_subtext}
            </p>
          )}
        </motion.div>
      </StageLayout>
    );
  }

  return (
    <StageLayout
      showProgress={false}
      showCTA={true}
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      variant="gate"
      bgClass="bg-white"
      showBackButton={canGoBack}
      onBackClick={handleBack}
      showHeaderLogo={true}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center text-center w-full"
      >
        {/* Primary heading */}
        <h1 className="pt-1 text-2xl md:text-3xl leading-tight font-bold text-[#327455] font-figtree px-4">
          {question.question_text}
        </h1>

        {/* Secondary heading */}
        {question.question_subtext && (
          <p className="mt-2 text-lg md:text-xl leading-snug font-semibold text-[#292424] font-figtree px-4">
            {question.question_subtext}
          </p>
        )}

        {/* Trust image — Responsive */}
        {question.image_url && (
          <div className="relative mt-12 w-full max-w-xs aspect-308/375">
            <Image
              src={question.image_url}
              alt={question.question_text}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
              quality={95}
              priority
            />
          </div>
        )}
      </motion.div>
    </StageLayout>
  );
}
