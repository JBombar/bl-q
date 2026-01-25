'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import type { QuizQuestionWithOptions } from '@/types';

interface MultiChoiceQuestionProps {
  question: QuizQuestionWithOptions;
  questionIndex: number;
  onComplete?: () => void;
}

export function MultiChoiceQuestion({ question, questionIndex, onComplete }: MultiChoiceQuestionProps) {
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
    await selectAnswer(question.id, selectedIds, timeSpent);

    setTimeout(() => {
      if (onComplete && questionIndex === useQuizState.getState().quiz!.questions.length - 1) {
        onComplete();
      } else {
        nextQuestion();
      }
    }, 150);
  };

  return (
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

      <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Figtree', lineHeight: '110%' }}>
        {question.question_text}
      </h2>

      {question.helper_text && (
        <p className="text-gray-600 mb-6 italic">{question.helper_text}</p>
      )}

      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const isSelected = selectedIds.includes(option.id);

          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleOption(option.id)}
              className={`
                w-full p-4 rounded-xl text-left transition-all border-2
                ${isSelected
                  ? 'bg-white border-[#F9A201] shadow-md'
                  : 'bg-gray-100 border-transparent hover:bg-gray-200'
                }
              `}
            >
              <div className="flex items-center">
                <div className={`
                  w-5 h-5 rounded mr-3 flex-shrink-0 border-2 flex items-center justify-center
                  ${isSelected
                    ? 'bg-[#F9A201] border-[#F9A201]'
                    : 'border-gray-300 bg-white'
                  }
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-900">{option.option_text}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        disabled={selectedIds.length === 0}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-lg transition-all
          ${selectedIds.length > 0
            ? 'bg-[#F9A201] hover:bg-[#e09201] shadow-lg'
            : 'bg-gray-300 cursor-not-allowed'
          }
        `}
      >
        Pokračovat
      </button>
    </motion.div>
  );
}
