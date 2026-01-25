'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizOption } from './QuizOption';
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

    case 'likert_1_4':
      return <LikertScaleQuestion question={question} questionIndex={questionIndex} onComplete={onComplete} />;

    case 'age_select':
      return <AgeGateScreen question={question} onComplete={onComplete} />;

    case 'info_trust':
      return <TrustScreen question={question} />;

    case 'education_insert':
    case 'validation_info':
      return <InsertScreen question={question} />;

    case 'single_choice':
    default:
      return <SingleChoiceQuestion question={question} questionIndex={questionIndex} onComplete={onComplete} />;
  }
}

// Default single choice component (original logic)
function SingleChoiceQuestion({ question, questionIndex, onComplete }: QuizQuestionProps) {
  const { selectAnswer, nextQuestion, answers } = useQuizState();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

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
    await selectAnswer(question.id, newSelection, timeSpent);

    setTimeout(() => {
      if (onComplete && questionIndex === useQuizState.getState().quiz!.questions.length - 1) {
        onComplete();
      } else {
        nextQuestion();
      }
    }, 300);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-6"
      >
        {question.section_label && (
          <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {question.section_label}
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Figtree', lineHeight: '110%' }}>
          {question.question_text}
        </h2>

        {question.question_subtext && (
          <p className="text-gray-600 mb-6">{question.question_subtext}</p>
        )}

        {question.image_url && (
          <div className="mb-6 relative w-full aspect-video rounded-xl overflow-hidden">
            <Image
              src={question.image_url}
              alt={question.question_text}
              fill
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-3">
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
  );
}
