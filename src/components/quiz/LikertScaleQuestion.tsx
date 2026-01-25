'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuizState } from '@/hooks/useQuizState';
import type { QuizQuestionWithOptions } from '@/types';
import Image from 'next/image';

interface LikertScaleQuestionProps {
  question: QuizQuestionWithOptions;
  questionIndex: number;
  onComplete?: () => void;
}

export function LikertScaleQuestion({ question, questionIndex, onComplete }: LikertScaleQuestionProps) {
  const { selectAnswer, nextQuestion, answers } = useQuizState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // Load existing answer if resuming
  useEffect(() => {
    const existingAnswer = answers.find(a => a.questionId === question.id);
    if (existingAnswer && existingAnswer.selectedOptionIds.length > 0) {
      setSelectedId(existingAnswer.selectedOptionIds[0]);
    } else {
      setSelectedId(null);
    }
  }, [question.id, answers]);

  const handleSelect = async (optionId: string) => {
    setSelectedId(optionId);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    await selectAnswer(question.id, [optionId], timeSpent);

    // Auto-advance after selection
    setTimeout(() => {
      if (onComplete && questionIndex === useQuizState.getState().quiz!.questions.length - 1) {
        onComplete();
      } else {
        nextQuestion();
      }
    }, 300);
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

      <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Figtree', fontSize: '18px', fontWeight: 700, lineHeight: '110%' }}>
        {question.question_text}
      </h2>

      {question.question_subtext && (
        <p className="text-gray-700 mb-6 text-lg italic">{question.question_subtext}</p>
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

      <div className="grid grid-cols-4 gap-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const scaleNumber = index + 1;

          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(option.id)}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-3xl font-bold transition-all
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

      <div className="flex justify-between text-sm text-gray-600">
        <span>{question.scale_left_label || ''}</span>
        <span>{question.scale_right_label || ''}</span>
      </div>
    </motion.div>
  );
}
