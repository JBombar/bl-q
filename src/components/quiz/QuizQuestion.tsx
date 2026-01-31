'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizOption } from './QuizOption';
import { QuizStageLayout } from './QuizStageLayout';
import { MultiChoiceQuestion } from './MultiChoiceQuestion';
import { LikertScaleQuestion } from './LikertScaleQuestion';
import { AgeGateScreen } from './AgeGateScreen';
import { TrustScreen } from './TrustScreen';
import { InsertScreen } from './InsertScreen';
import type { QuizQuestionWithOptions } from '@/types';

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

    case 'likert_1_4':
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
  const { selectAnswer, nextQuestion, previousQuestion, answers, quiz, currentQuestionIndex } = useQuizState();
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

  // Calculate progress
  const totalQuestions = quiz?.questions.length || 1;
  const progressPercent = ((questionIndex + 1) / totalQuestions) * 100;
  const canGoBack = currentQuestionIndex > 0;

  return (
    <QuizStageLayout
      showProgress
      progressPercent={progressPercent}
      sectionLabel={question.section_label || undefined}
      showBackButton={canGoBack}
      onBackClick={handleBack}
      overlayImage={question.image_url ? {
        src: question.image_url,
        alt: '',
        anchor: 'bottom-right',
        maxHeightDesktop: '70vh',
        maxHeightMobile: '50vh',
      } : undefined}
      variant="question"
    >
      <AnimatePresence mode="wait">
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

          {question.question_subtext && (
            <p className="text-gray-600 mb-2 md:mb-3 text-xs md:text-sm">{question.question_subtext}</p>
          )}

          <div className="space-y-1.5 md:space-y-2 max-w-xl mx-auto">
            {question.options.map((option) => (
              <QuizOption
                key={option.id}
                option={option}
                isSelected={selectedIds.includes(option.id)}
                onSelect={() => handleSelect(option.id)}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </QuizStageLayout>
  );
}
