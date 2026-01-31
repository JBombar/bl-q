import { create } from 'zustand';
import type { QuizDefinition, QuizAnswerData } from '@/types';

interface QuizState {
  // State
  sessionId: string | null;
  quiz: QuizDefinition | null;
  currentQuestionIndex: number;
  answers: QuizAnswerData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadQuiz: (slug: string) => Promise<void>;
  selectAnswer: (questionId: string, optionIds: string[], timeSpent?: number) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeQuiz: () => Promise<{ result: any; offer: any }>;
  reset: () => void;
}

export const useQuizState = create<QuizState>((set, get) => ({
  sessionId: null,
  quiz: null,
  currentQuestionIndex: 0,
  answers: [],
  isLoading: false,
  error: null,

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
      set({
        sessionId: data.sessionId,
        quiz: data.quiz,
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
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
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
    });
    localStorage.removeItem('quiz_session');
  },
}));
