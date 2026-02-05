import { create } from 'zustand';
import type { QuizDefinition, QuizAnswerData, QuizQuestionWithOptions, CategoryProgress } from '@/types';

// ============================================================================
// CATEGORY PROGRESS UTILITY
// ============================================================================

/**
 * Computes the user's progress within the current question category
 * Used for the segmented progress bar display
 */
function computeCategoryProgress(
  questions: QuizQuestionWithOptions[],
  currentIndex: number
): CategoryProgress {
  const currentQuestion = questions[currentIndex];

  // Handle edge case where question doesn't exist
  if (!currentQuestion) {
    return {
      categoryName: null,
      totalInCategory: 0,
      currentPositionInCategory: 0,
      isSpecialScreen: true,
    };
  }

  const categoryName = currentQuestion.section_label ?? null;

  // Special screens (null section_label) don't show category progress
  if (!categoryName) {
    return {
      categoryName: null,
      totalInCategory: 0,
      currentPositionInCategory: 0,
      isSpecialScreen: true,
    };
  }

  // Filter questions belonging to the same category
  const categoryQuestions = questions.filter(
    (q) => q.section_label === categoryName
  );

  // Find position of current question within category (1-indexed)
  const positionInCategory =
    categoryQuestions.findIndex((q) => q.id === currentQuestion.id) + 1;

  return {
    categoryName,
    totalInCategory: categoryQuestions.length,
    currentPositionInCategory: positionInCategory,
    isSpecialScreen: false,
  };
}

// Default category progress for initial state
const DEFAULT_CATEGORY_PROGRESS: CategoryProgress = {
  categoryName: null,
  totalInCategory: 0,
  currentPositionInCategory: 0,
  isSpecialScreen: true,
};

// ============================================================================
// QUIZ STATE INTERFACE
// ============================================================================

interface QuizState {
  // State
  sessionId: string | null;
  quiz: QuizDefinition | null;
  currentQuestionIndex: number;
  answers: QuizAnswerData[];
  isLoading: boolean;
  error: string | null;
  categoryProgress: CategoryProgress;

  // Actions
  loadQuiz: (slug: string) => Promise<void>;
  selectAnswer: (questionId: string, optionIds: string[], timeSpent?: number) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeQuiz: () => Promise<{ result: any; offer: any }>;
  reset: () => void;
}

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useQuizState = create<QuizState>((set, get) => ({
  sessionId: null,
  quiz: null,
  currentQuestionIndex: 0,
  answers: [],
  isLoading: false,
  error: null,
  categoryProgress: DEFAULT_CATEGORY_PROGRESS,

  loadQuiz: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) throw new Error('Failed to load quiz');

      const data = await response.json();

      // Compute initial category progress
      const categoryProgress = computeCategoryProgress(data.quiz.questions, 0);

      set({
        sessionId: data.sessionId,
        quiz: data.quiz,
        categoryProgress,
        isLoading: false,
      });

      // Persist to localStorage for refresh recovery
      localStorage.setItem('quiz_session', JSON.stringify({
        sessionId: data.sessionId,
        slug,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  selectAnswer: async (questionId: string, optionIds: string[], timeSpent?: number) => {
    const { answers } = get();

    // Optimistic update (instant UI)
    const newAnswers = answers.filter(a => a.questionId !== questionId);
    newAnswers.push({ questionId, selectedOptionIds: optionIds, timeSpent });
    set({ answers: newAnswers });

    // Note: Answer persistence now handled exclusively by batch-sync in completeQuiz
    // This eliminates redundant individual API calls and improves performance
  },

  nextQuestion: () => {
    const { currentQuestionIndex, quiz } = get();
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      const categoryProgress = computeCategoryProgress(quiz.questions, newIndex);
      set({
        currentQuestionIndex: newIndex,
        categoryProgress,
      });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex, quiz } = get();
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      const categoryProgress = quiz
        ? computeCategoryProgress(quiz.questions, newIndex)
        : DEFAULT_CATEGORY_PROGRESS;
      set({
        currentQuestionIndex: newIndex,
        categoryProgress,
      });
    }
  },

  completeQuiz: async () => {
    set({ isLoading: true, error: null });
    try {
      const { answers } = get();

      // Batch sync all answers in a single API call
      const batchSyncResponse = await fetch('/api/quiz/answers/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!batchSyncResponse.ok) {
        const errorData = await batchSyncResponse.json();
        throw new Error(errorData.error || 'Failed to sync answers');
      }

      // Answers successfully synced - now safe to complete quiz
      const completeResponse = await fetch('/api/quiz/complete', {
        method: 'POST',
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete quiz');
      }

      const data = await completeResponse.json();
      set({ isLoading: false });

      return data; // { result, offer, insights, funnelState }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      sessionId: null,
      quiz: null,
      currentQuestionIndex: 0,
      answers: [],
      isLoading: false,
      error: null,
      categoryProgress: DEFAULT_CATEGORY_PROGRESS,
    });
    localStorage.removeItem('quiz_session');
  },
}));
