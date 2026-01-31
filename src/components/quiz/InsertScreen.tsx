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
        showBackButton={canGoBack}
        onBackClick={handleBack}
        variant="gate"
      >

        {/* Logo at top center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Image
            src="/images/betterlady-logo.svg"
            alt="Better Lady"
            width={140}
            height={32}
            className="h-7 md:h-8 w-auto"
          />
        </div>

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
      showBackButton={canGoBack}
      onBackClick={handleBack}
      variant="insert"
    >

      {/* Logo at top */}
      <div className="absolute top-2 md:top-2 left-1/2 transform -translate-x-1/2 z-10">
        <Image
          src="/images/betterlady-logo.svg"
          alt="Better Lady"
          width={140}
          height={32}
          className="h-5 md:h-6 w-auto"
        />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-start h-full text-center px-4 pt-7 pb-2 md:pt-10 md:pb-3"
      >
        {/* Main illustration - sized to fit viewport */}
        {insertImageUrl && (
          <div className="relative w-full max-w-[200px] md:max-w-[280px] mb-1 md:mb-2">
            <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
              <Image
                src={insertImageUrl}
                alt={question.question_text}
                fill
                sizes="(max-width: 768px) 200px, 280px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}

        {/* Headline - green color matching Figma */}
        <h2
          className="text-xs md:text-sm lg:text-base font-bold mb-1 md:mb-2 max-w-lg px-2"
          style={{
            fontFamily: 'Figtree',
            lineHeight: '115%',
            color: '#2D5F4C' // Green color from screenshot
          }}
        >
          {question.question_text}
        </h2>

        {/* Body text - gray, readable */}
        {question.question_subtext && (
          <div
            className="text-gray-700 leading-relaxed text-[11px] md:text-xs max-w-lg px-2"
            style={{
              fontFamily: 'Figtree',
              lineHeight: '130%'
            }}
          >
            {question.question_subtext.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </motion.div>
    </StageLayout>
  );
}
