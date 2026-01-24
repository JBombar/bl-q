'use client';

import { useQuizState } from '@/hooks/useQuizState';

interface QuizNavigationProps {
  currentIndex: number;
  totalQuestions: number;
}

export function QuizNavigation({ currentIndex, totalQuestions }: QuizNavigationProps) {
  const { previousQuestion, answers } = useQuizState();
  const currentQuestion = useQuizState(state =>
    state.quiz?.questions[currentIndex]
  );
  const hasAnswer = answers.some(a => a.questionId === currentQuestion?.id);

  return (
    <div className="flex justify-between mt-6">
      <button
        onClick={previousQuestion}
        disabled={currentIndex === 0}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all
          ${currentIndex === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
          }
        `}
      >
        ← Back
      </button>

      {/* Next button only shown for multiple choice or if answered */}
      {(currentQuestion?.question_type === 'multiple_choice' && hasAnswer) && (
        <button
          onClick={() => useQuizState.getState().nextQuestion()}
          className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow"
        >
          {currentIndex === totalQuestions - 1 ? 'Complete →' : 'Next →'}
        </button>
      )}
    </div>
  );
}
