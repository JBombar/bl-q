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
  const { nextQuestion, previousQuestion, currentQuestionIndex } = useQuizState();

  const handleContinue = () => {
    nextQuestion();
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
      <QuizStageLayout
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
          className="flex flex-col items-center justify-start h-full text-center px-4 pt-14 pb-4 md:pt-16 md:pb-6"
        >
          {/* Title - highlighting "vědeckých postupů" in green */}
          <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 max-w-md px-2" style={{ fontFamily: 'Figtree', lineHeight: '120%' }}>
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
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-5 max-w-sm px-2" style={{ fontFamily: 'Figtree' }}>
              {question.question_subtext}
            </p>
          )}

          {/* Logos image */}
          <div className="w-full max-w-xs mb-2">
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
      </QuizStageLayout>
    );
  }

  // Default rendering for educational inserts
  return (
    <QuizStageLayout
      showProgress={false}
      showCTA
      ctaLabel="Pokračovat"
      onCtaClick={handleContinue}
      showBackButton={canGoBack}
      onBackClick={handleBack}
      variant="insert"
    >

      {/* Logo at top */}
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
        className="flex flex-col items-center justify-center h-full text-center px-4 pt-14 pb-4 md:pt-16 md:pb-6"
      >
        {/* Main illustration - large and prominent */}
        {insertImageUrl && (
          <div className="relative w-full max-w-xs md:max-w-sm mb-4 md:mb-5">
            <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
              <Image
                src={insertImageUrl}
                alt={question.question_text}
                fill
                sizes="(max-width: 768px) 80vw, 400px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}

        {/* Headline - green color matching Figma */}
        <h2
          className="text-sm md:text-base lg:text-lg font-bold mb-3 md:mb-4 max-w-lg px-2"
          style={{
            fontFamily: 'Figtree',
            lineHeight: '120%',
            color: '#2D5F4C' // Green color from screenshot
          }}
        >
          {question.question_text}
        </h2>

        {/* Body text - gray, readable */}
        {question.question_subtext && (
          <div
            className="text-gray-700 leading-relaxed text-xs md:text-sm max-w-lg px-2"
            style={{
              fontFamily: 'Figtree',
              lineHeight: '140%'
            }}
          >
            {question.question_subtext.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className={idx > 0 ? 'mt-3' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </motion.div>
    </QuizStageLayout>
  );
}
