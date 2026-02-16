'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { StageLayout } from '@/components/layout';
import { MultiChoiceQuestion } from './MultiChoiceQuestion';
import { LikertScaleQuestion } from './LikertScaleQuestion';
import { AgeGateScreen } from './AgeGateScreen';
import { TrustScreen } from './TrustScreen';
import { InsertScreen } from './InsertScreen';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface QuizQuestionProps {
  question: QuizQuestionWithOptions;
  questionIndex: number;
  onComplete?: () => void;
}

export function QuizQuestion({ question, questionIndex, onComplete }: QuizQuestionProps) {
  // Route to specialized components based on question type
  switch (question.question_type) {
    case 'multiple_choice':
      return <MultiChoiceQuestion question={question} questionIndex={questionIndex} onComplete={onComplete} />;

    case 'likert_1_5':
      return <LikertScaleQuestion question={question} questionIndex={questionIndex} onComplete={onComplete} />;

    case 'age_select':
      return <AgeGateScreen question={question} questionIndex={questionIndex} onComplete={onComplete} />;

    case 'info_trust':
      return <TrustScreen question={question} questionIndex={questionIndex} onComplete={onComplete} />;

    case 'education_insert':
    case 'validation_info':
      return <InsertScreen question={question} questionIndex={questionIndex} onComplete={onComplete} />;

    case 'single_choice':
    default:
      return <SingleChoiceQuestion question={question} questionIndex={questionIndex} onComplete={onComplete} />;
  }
}

// Default single choice component (original logic)
function SingleChoiceQuestion({ question, questionIndex, onComplete }: QuizQuestionProps) {
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

  const handleSelect = async (optionId: string) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const newSelection = [optionId];

    setSelectedIds(newSelection);
    selectAnswer(question.id, newSelection, timeSpent); // Non-blocking

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

  // Show header logo for special screens (questions without section_label)
  const showHeaderLogo = categoryProgress.isSpecialScreen;

  return (
    <StageLayout
      showSegmentedProgress={showSegmentedProgress}
      totalSegments={categoryProgress.totalInCategory}
      completedSegments={categoryProgress.currentPositionInCategory}
      categoryLabel={categoryProgress.categoryName || undefined}
      showBackButton={canGoBack}
      onBackClick={handleBack}
      showHeaderLogo={showHeaderLogo}
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
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          className="w-full flex flex-col items-center"
        >
          {/* Question — Responsive text size */}
          <h2 className="text-xl md:text-2xl leading-tight font-bold text-[#292424] font-figtree max-w-md text-center px-4">
            {question.question_text}
          </h2>

          {question.question_subtext && (
            <p className="mt-2 text-sm md:text-base leading-snug font-normal text-[#292424] font-figtree text-center px-4">
              {question.question_subtext}
            </p>
          )}

          {/* Option buttons — Fluid width, min-height */}
          <div className="mt-6 flex flex-col gap-3 w-full max-w-md px-4">
            {question.options.map((option) => (
              <motion.button
                key={option.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.id)}
                className={`
                  w-full min-h-[56px] py-3 rounded-xl flex items-center px-4 gap-3 transition-all
                  ${selectedIds.includes(option.id)
                    ? 'bg-white border-2 border-[#327455]'
                    : 'bg-[#f5f5f5] border-2 border-transparent hover:bg-gray-200'
                  }
                `}
              >
                {option.image_url && (
                  <Image
                    src={option.image_url}
                    alt=""
                    width={28}
                    height={28}
                    className="w-[28px] h-[28px] shrink-0"
                  />
                )}
                <span className="text-base md:text-lg font-normal text-[#292424] font-figtree text-left flex-1">
                  {option.option_text}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </StageLayout>
  );
}
