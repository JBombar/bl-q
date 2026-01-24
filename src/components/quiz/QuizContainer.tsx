'use client';

import { useEffect, useState } from 'react';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizQuestion } from './QuizQuestion';
import { QuizProgress } from './QuizProgress';
import { QuizNavigation } from './QuizNavigation';
import { ResultScreen } from '../results/ResultScreen';

interface QuizContainerProps {
  slug: string;
}

export function QuizContainer({ slug }: QuizContainerProps) {
  const { quiz, currentQuestionIndex, loadQuiz, isLoading, error } = useQuizState();
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    loadQuiz(slug);
  }, [slug]);

  if (isLoading && !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  if (showResult && resultData) {
    return <ResultScreen result={resultData.result} offer={resultData.offer} />;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <QuizProgress
          current={currentQuestionIndex + 1}
          total={quiz.questions.length}
        />

        <QuizQuestion
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          onComplete={async () => {
            if (currentQuestionIndex === quiz.questions.length - 1) {
              const data = await useQuizState.getState().completeQuiz();
              setResultData(data);
              setShowResult(true);
            }
          }}
        />

        <QuizNavigation
          currentIndex={currentQuestionIndex}
          totalQuestions={quiz.questions.length}
        />
      </div>
    </div>
  );
}
