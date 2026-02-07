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
        {/* Primary heading — 28px/30.8px bold, #327455 */}
        <h1 className="pt-[3px] text-[28px] leading-[30.8px] font-bold text-[#327455] font-figtree">
          {question.question_text}
        </h1>

        {/* Secondary heading — 20px/22px semibold, #292424 */}
        {question.question_subtext && (
          <p className="mt-[7px] text-[20px] leading-[22px] font-semibold text-[#292424] font-figtree">
            {question.question_subtext}
          </p>
        )}

        {/* Trust image — 308px × 375px, object-cover */}
        {question.image_url && (
          <div className="relative mt-[73px] w-[308px] h-[375px]">
            <Image
              src={question.image_url}
              alt={question.question_text}
              fill
              sizes="308px"
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
