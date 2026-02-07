'use client';

import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { StageLayout } from '@/components/layout';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface InsertScreenProps {
  question: QuizQuestionWithOptions;
  questionIndex?: number;
  onComplete?: () => void;
}

export function InsertScreen({ question, questionIndex, onComplete }: InsertScreenProps) {
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

  const isValidationScreen = question.question_type === 'validation_info';
  const isEducationalInsert = question.question_type === 'education_insert';
  const canGoBack = currentQuestionIndex > 0;

  // Map question_key to image paths for educational inserts
  const getInsertImageUrl = (questionKey: string): string => {
    const imageMap: Record<string, string> = {
      'e01': '/images/educational-inserts/e1.png',
      'e02': '/images/educational-inserts/e2.png',
      'e03': '/images/educational-inserts/e3.png',
      'e04': '/images/educational-inserts/e4.png',
      'e05': '/images/educational-inserts/e5.png',
      'e06': '/images/educational-inserts/e6.png',
      'e07': '/images/educational-inserts/e7.png',
    };
    return imageMap[questionKey] || '';
  };

  const insertImageUrl = isEducationalInsert && question.question_key
    ? getInsertImageUrl(question.question_key)
    : question.image_url;

  // Special rendering for validation screen
  if (isValidationScreen) {
    return (
      <StageLayout
        showProgress={false}
        showCTA
        ctaLabel="Pokračovat"
        onCtaClick={handleContinue}
        variant="gate"
        showBackButton={canGoBack}
        onBackClick={handleBack}
        showHeaderLogo={true}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-start h-full text-center px-4 pt-7 pb-2 md:pt-10 md:pb-3"
        >
          {/* Title - highlighting "vědeckých postupů" in green */}
          <h1 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 md:mb-2 max-w-md px-2" style={{ fontFamily: 'Figtree', lineHeight: '115%' }}>
            {question.question_text.split('vědeckých postupů').map((part, idx, arr) => (
              idx < arr.length - 1 ? (
                <span key={idx}>
                  {part}<span style={{ color: '#2D5F4C' }}>vědeckých postupů</span>
                </span>
              ) : part
            ))}
          </h1>

          {/* Subtitle */}
          {question.question_subtext && (
            <p className="text-[11px] md:text-sm text-gray-600 mb-2 md:mb-3 max-w-sm px-2" style={{ fontFamily: 'Figtree' }}>
              {question.question_subtext}
            </p>
          )}

          {/* Logos image */}
          <div className="w-full max-w-[260px] md:max-w-[300px] mb-1">
            <Image
              src="/images/logos.png"
              alt="Vědecké instituce"
              width={320}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        </motion.div>
      </StageLayout>
    );
  }

  // Default rendering for educational inserts
  return (
    <StageLayout
      showProgress={false}
      showCTA
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      variant="gate"
      showBackButton={canGoBack}
      onBackClick={handleBack}
      showHeaderLogo={true}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center h-full w-full"
      >
        <div className="flex flex-col w-full max-w-[351px]">
        {/* Featured image — 351px × 222px, rounded 10px */}
        {insertImageUrl && (
          <div className="relative w-full h-[222px] rounded-[10px] overflow-hidden">
            <Image
              src={insertImageUrl}
              alt={question.question_text}
              fill
              sizes="351px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Heading — 18px/25.2px bold, #327455, left-aligned */}
        <h2 className="mt-[16px] text-[18px] leading-[25.2px] font-bold text-[#327455] font-figtree text-left">
          {question.question_text}
        </h2>

        {/* Body text — 15px/21px regular, #292424, left-aligned */}
        {question.question_subtext && (
          <div className="mt-[12px] text-[15px] leading-[21px] font-normal text-[#292424] font-figtree text-left">
            {question.question_subtext.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className={idx > 0 ? 'mt-[12px]' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        )}
        </div>
      </motion.div>
    </StageLayout>
  );
}
