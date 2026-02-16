'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { StageLayout } from '@/components/layout';
import type { QuizQuestionWithOptions } from '@/types';

interface LikertScaleQuestionProps {
  question: QuizQuestionWithOptions;
  questionIndex: number;
  onComplete?: () => void;
}

export function LikertScaleQuestion({ question, questionIndex, onComplete }: LikertScaleQuestionProps) {
  const { selectAnswer, nextQuestion, previousQuestion, answers, quiz, currentQuestionIndex, categoryProgress } = useQuizState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const handleBack = () => {
    previousQuestion();
  };

  // Load existing answer if resuming
  useEffect(() => {
    const existingAnswer = answers.find(a => a.questionId === question.id);
    if (existingAnswer && existingAnswer.selectedOptionIds.length > 0) {
      setSelectedId(existingAnswer.selectedOptionIds[0] || null);
    } else {
      setSelectedId(null);
    }
  }, [question.id, answers]);

  const handleSelect = async (optionId: string) => {
    setSelectedId(optionId);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    selectAnswer(question.id, [optionId], timeSpent); // Non-blocking

    // Auto-advance after selection
    setTimeout(() => {
      if (onComplete && questionIndex === quiz!.questions.length - 1) {
        onComplete();
      } else {
        nextQuestion();
      }
    }, 100);
  };

  const canGoBack = currentQuestionIndex > 0;

  // Use segmented progress for regular questions, not for special screens
  const showSegmentedProgress = !categoryProgress.isSpecialScreen;

  return (
    <StageLayout
      // Segmented progress bar (new)
      showSegmentedProgress={showSegmentedProgress}
      totalSegments={categoryProgress.totalInCategory}
      completedSegments={categoryProgress.currentPositionInCategory}
      categoryLabel={categoryProgress.categoryName || undefined}
      // Back button
      showBackButton={canGoBack}
      onBackClick={handleBack}
      // Overlay image
      overlayImage={question.image_url ? {
        src: question.image_url,
        alt: '',
        anchor: 'bottom-right',
        maxHeightDesktop: '550px',
        maxHeightMobile: '450px',
      } : undefined}
      variant="question"
      bgClass="bg-white"
    >
      <motion.div
        key={question.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.08 }}
        className="w-full text-center"
      >
        <h2 className="text-xl md:text-2xl leading-tight font-bold text-[#292424] font-figtree text-center mb-2 md:mb-3 px-4">
          {question.question_text}
        </h2>

        {question.question_subtext && (
          <p className="text-sm md:text-base leading-snug text-[#292424] font-figtree mb-4 md:mb-6 italic px-4">{question.question_subtext}</p>
        )}

        <div className={`grid ${question.options.length === 5 ? 'grid-cols-5 gap-2 md:gap-3' : 'grid-cols-4 gap-3 md:gap-4'} mb-4 md:mb-6 w-full max-w-md mx-auto px-4`}>
          {question.options.map((option, index) => {
            const isSelected = selectedId === option.id;
            const scaleNumber = index + 1;
            const fontClass = question.options.length === 5
              ? 'text-lg md:text-xl lg:text-2xl'
              : 'text-xl md:text-2xl lg:text-3xl';

            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(option.id)}
                className={`
                  aspect-square rounded-lg md:rounded-xl flex items-center justify-center ${fontClass} font-bold transition-all
                  ${isSelected
                    ? 'bg-[#F9A201] text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {scaleNumber}
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-between text-xs md:text-sm text-gray-600 w-full max-w-md mx-auto px-4">
          <span>{question.scale_left_label || ''}</span>
          <span>{question.scale_right_label || ''}</span>
        </div>
      </motion.div>
    </StageLayout>
  );
}
