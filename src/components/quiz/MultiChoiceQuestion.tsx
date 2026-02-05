'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { StageLayout } from '@/components/layout';
import type { QuizQuestionWithOptions } from '@/types';

interface MultiChoiceQuestionProps {
  question: QuizQuestionWithOptions;
  questionIndex: number;
  onComplete?: () => void;
}

export function MultiChoiceQuestion({ question, questionIndex, onComplete }: MultiChoiceQuestionProps) {
  const { selectAnswer, nextQuestion, previousQuestion, answers, quiz, currentQuestionIndex, categoryProgress } = useQuizState();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  const handleBack = () => {
    previousQuestion();
  };

  // Load existing answer if resuming
  useEffect(() => {
    const existingAnswer = answers.find(a => a.questionId === question.id);
    if (existingAnswer) {
      setSelectedIds(existingAnswer.selectedOptionIds);
    } else {
      setSelectedIds([]);
    }
  }, [question.id, answers]);

  const toggleOption = (optionId: string) => {
    setSelectedIds(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleContinue = async () => {
    if (selectedIds.length === 0) return; // Require at least one selection

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    selectAnswer(question.id, selectedIds, timeSpent); // Non-blocking

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
      // CTA button
      showCTA
      ctaLabel="Pokračovat"
      ctaDisabled={selectedIds.length === 0}
      onCtaClick={handleContinue}
      // Back button
      showBackButton={canGoBack}
      onBackClick={handleBack}
      // Overlay image
      overlayImage={question.image_url ? {
        src: question.image_url,
        alt: '',
        anchor: 'bottom-right',
        maxHeightDesktop: '70vh',
        maxHeightMobile: '50vh',
      } : undefined}
      variant="question"
    >
      <motion.div
        key={question.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.08 }}
        className="w-full text-center"
      >
        <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-2 md:mb-3" style={{ fontFamily: 'Figtree', lineHeight: '110%' }}>
          {question.question_text}
        </h2>

        {question.helper_text && (
          <p className="text-gray-600 mb-2 md:mb-3 italic text-xs md:text-sm">{question.helper_text}</p>
        )}

        <div className="space-y-1.5 md:space-y-2 max-w-xl mx-auto">
          {question.options.map((option) => {
            const isSelected = selectedIds.includes(option.id);

            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleOption(option.id)}
                className={`
                  w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-left transition-all border-2
                  ${isSelected
                    ? 'bg-white border-[#F9A201] shadow-md'
                    : 'bg-gray-100 border-transparent hover:bg-gray-200'
                  }
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    w-4 h-4 md:w-5 md:h-5 rounded mr-2 md:mr-3 shrink-0 border-2 flex items-center justify-center
                    ${isSelected
                      ? 'bg-[#F9A201] border-[#F9A201]'
                      : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 text-xs md:text-sm">{option.option_text}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </StageLayout>
  );
}
