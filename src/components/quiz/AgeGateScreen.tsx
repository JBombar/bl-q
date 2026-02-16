'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { StageLayout } from '@/components/layout';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface AgeGateScreenProps {
  question: QuizQuestionWithOptions;
  questionIndex?: number;
  onComplete?: () => void;
}

export function AgeGateScreen({ question, questionIndex, onComplete }: AgeGateScreenProps) {
  const { selectAnswer, nextQuestion, previousQuestion, currentQuestionIndex, quiz } = useQuizState();
  const [startTime] = useState(Date.now());

  const handleAgeSelect = async (optionId: string) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    selectAnswer(question.id, [optionId], timeSpent); // Non-blocking

    setTimeout(() => {
      // Check if this is the last question
      const isLastQuestion = quiz && questionIndex !== undefined && questionIndex === quiz.questions.length - 1;

      if (isLastQuestion && onComplete) {
        onComplete();
      } else {
        nextQuestion();
      }
    }, 100);
  };

  const handleBack = () => {
    previousQuestion();
  };

  const canGoBack = currentQuestionIndex > 0;

  return (
    <StageLayout
      showProgress={false}
      variant="gate"
      showBackButton={canGoBack}
      onBackClick={handleBack}
      showHeaderLogo={true}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="text-center w-full mx-auto"
      >
        <h1 className="text-2xl md:text-3xl leading-tight font-bold text-center text-dark font-figtree mb-3 px-4">
          Je tvůj{' '}
          <span className="text-[#2F6B4F]">
            nervový<br />systém přehlcený
          </span>
          ?
        </h1>
        <p className="text-base font-normal text-center text-gray leading-snug font-figtree mb-6 md:mb-8 px-4">
          Vyber svůj věk a začni
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 px-4 w-full max-w-4xl">
          {question.options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 * (index + 1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAgeSelect(option.id)}
              className="rounded-xl md:rounded-2xl transition-all flex flex-col items-center"
            >
              {option.image_url && (
                <div className="relative w-full aspect-3/4 rounded-lg md:rounded-xl overflow-hidden">
                  <Image
                    src={option.image_url}
                    alt={option.option_text}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                    quality={95}
                    priority
                  />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <p className="text-[10px] md:text-xs text-[#292424] max-w-md mx-auto px-4 leading-tight">
          <span className="font-bold">
            Výběrem věku a pokračováním souhlasíš s našimi
          </span>{' '}
          <a
            href="https://betterlady.cz/obchodni-podminky/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700"
          >
            Obchodními podmínkami
          </a>
          {' | '}
          <a
            href="https://betterlady.cz/ochrana-osobnich-udaju/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700"
          >
            Ochrannou osobních údajů
          </a>
          .
        </p>
      </motion.div>
    </StageLayout>
  );
}
