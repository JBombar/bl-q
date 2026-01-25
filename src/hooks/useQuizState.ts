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

    // Background API call (non-blocking)
    try {
      await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedOptionIds: optionIds,
          timeSpentSeconds: timeSpent,
        }),
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
      // Don't throw - UI continues even if API fails (will retry on complete)
    }
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
    set({ isLoading: true });
    try {
      // PHASE 5: Flush all answers before completion to prevent missing data
      const { answers } = get();

      // Retry failed answer submissions
      for (const answer of answers) {
        try {
          await fetch('/api/quiz/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: answer.questionId,
              selectedOptionIds: answer.selectedOptionIds,
              timeSpentSeconds: answer.timeSpent || 0,
            }),
          });
        } catch (err) {
          console.error('Failed to flush answer:', err);
          // Continue anyway - server may have already received it
        }
      }

      // Now safe to complete quiz
      const response = await fetch('/api/quiz/complete', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to complete quiz');

      const data = await response.json();
      set({ isLoading: false });

      return data; // { result, offer }
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
