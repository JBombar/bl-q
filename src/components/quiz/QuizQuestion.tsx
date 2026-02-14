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

  return (
    <StageLayout
      showSegmentedProgress={showSegmentedProgress}
      totalSegments={categoryProgress.totalInCategory}
      completedSegments={categoryProgress.currentPositionInCategory}
      categoryLabel={categoryProgress.categoryName || undefined}
      showBackButton={canGoBack}
      onBackClick={handleBack}
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
          {/* Question — 22px/26px bold, #292424, max-w 280px, centered */}
          <h2 className="text-[22px] leading-[26px] font-bold text-[#292424] font-figtree max-w-[280px] text-center">
            {question.question_text}
          </h2>

          {question.question_subtext && (
            <p className="mt-[8px] text-[14px] leading-[16.8px] font-normal text-[#292424] font-figtree text-center">
              {question.question_subtext}
            </p>
          )}

          {/* Option buttons — 351px × 56px, bg #f5f5f5, rounded 10px, 10px gap */}
          <div className="mt-[24px] flex flex-col gap-[10px] max-w-[351px] w-full">
            {question.options.map((option) => (
              <motion.button
                key={option.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.id)}
                className={`
                  w-full h-[56px] rounded-[12px] flex items-center px-[12px] gap-[8px] transition-all
                  ${selectedIds.includes(option.id)
                    ? 'bg-white border-2 border-[#327455]'
                    : 'bg-[#f5f5f5] border-2 border-transparent'
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
                <span className="text-[17px] leading-[17px] font-normal text-[#292424] font-figtree">
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
