'use client';

import { useEffect, useState } from 'react';
import { useQuizState } from '@/hooks/useQuizState';
import { QuizQuestion } from './QuizQuestion';
import { PostQuizFlow } from '../results/PostQuizFlow';
import type { QuizCompleteResponse } from '@/types/funnel.types';

interface QuizContainerProps {
  slug: string;
}

export function QuizContainer({ slug }: QuizContainerProps) {
  const { quiz, currentQuestionIndex, loadQuiz, isLoading, error } = useQuizState();
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<QuizCompleteResponse | null>(null);
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    loadQuiz(slug);
  }, [slug]);

  if (isLoading && !quiz) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#F9A201] mx-auto" />
          <p className="text-gray-600">Nacitani...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Chyba</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  // Show offer page after funnel is complete
  if (showOffer && resultData) {
    // TODO: Implement actual offer/sales page
    // For now, show a placeholder that can be replaced with the real offer page
    return (
      <div className="min-h-screen bg-linear-to-b from-purple-50 to-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Tvuj plan je pripraven!
          </h1>
          <p className="text-gray-600 mb-6">
            Nabidka produktu bude implementovana v dalsi fazi.
          </p>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Doporuceny produkt:</p>
            <p className="text-lg font-semibold text-gray-800">
              {resultData.offer?.productName || 'Better Lady Program'}
            </p>
            {resultData.offer?.priceCents && (
              <p className="text-2xl font-bold text-[#F9A201] mt-2">
                {(resultData.offer.priceCents / 100).toLocaleString('cs-CZ')} Kc
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show post-quiz funnel (screens A-F)
  if (showResult && resultData) {
    return (
      <PostQuizFlow
        initialData={resultData}
        onComplete={() => setShowOffer(true)}
      />
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  if (!currentQuestion) return null;

  return (
    <QuizQuestion
      question={currentQuestion}
      questionIndex={currentQuestionIndex}
      onComplete={async () => {
        if (currentQuestionIndex === quiz.questions.length - 1) {
          const data = await useQuizState.getState().completeQuiz();
          setResultData(data as QuizCompleteResponse);
          setShowResult(true);
        }
      }}
    />
  );
}
