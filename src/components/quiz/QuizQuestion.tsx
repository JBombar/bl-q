'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizOption } from './QuizOption';
import type { QuizQuestionWithOptions } from '@/types';

interface QuizQuestionProps {
  question: QuizQuestionWithOptions;
  questionIndex: number;
  onComplete?: () => void;
}

export function QuizQuestion({ question, questionIndex, onComplete }: QuizQuestionProps) {
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

    // Single choice: replace selection
    const newSelection = question.question_type === 'single_choice'
      ? [optionId]
      : selectedIds.includes(optionId)
        ? selectedIds.filter(id => id !== optionId)
        : [...selectedIds, optionId];

    setSelectedIds(newSelection);

    // Auto-advance on single choice
    if (question.question_type === 'single_choice') {
      await selectAnswer(question.id, newSelection, timeSpent);

      setTimeout(() => {
        if (onComplete && questionIndex === useQuizState.getState().quiz!.questions.length - 1) {
          onComplete();
        } else {
          nextQuestion();
        }
      }, 300); // Small delay for visual feedback
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.15 }} // < 100ms target
        className="bg-white rounded-2xl shadow-lg p-8 mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {question.question_text}
        </h2>

        {question.question_subtext && (
          <p className="text-gray-600 mb-6">{question.question_subtext}</p>
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
