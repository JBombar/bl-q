import { getQuizBySlug, saveAnswer, getSessionAnswers } from '../quiz.service';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Quiz Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuizBySlug', () => {
    test('retrieves quiz with questions and options', async () => {
      const mockQuiz = {
        id: 'quiz-1',
        slug: 'stress-quiz',
        title: 'Stress Assessment',
        status: 'active',
        version: 1,
      };

      const mockQuestions = [
        {
          id: 'q1',
          quiz_id: 'quiz-1',
          question_text: 'Question 1',
          question_type: 'single_choice',
          order_index: 0,
          quiz_options: [
            { id: 'opt1', option_text: 'Option 1', score_value: 0, order_index: 0 },
            { id: 'opt2', option_text: 'Option 2', score_value: 5, order_index: 1 },
          ],
        },
        {
          id: 'q2',
          quiz_id: 'quiz-1',
          question_text: 'Question 2',
          question_type: 'single_choice',
          order_index: 1,
          quiz_options: [
            { id: 'opt3', option_text: 'Option 3', score_value: 0, order_index: 0 },
          ],
        },
      ];

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'quizzes') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: mockQuiz, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'quiz_questions') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockQuestions, error: null }),
              }),
            }),
          };
        }
      });

      const quiz = await getQuizBySlug('stress-quiz');

      expect(quiz).not.toBeNull();
      expect(quiz?.slug).toBe('stress-quiz');
      expect(quiz?.questions).toHaveLength(2);
      expect(quiz?.questions[0].options).toHaveLength(2);
      expect(quiz?.questions[1].options).toHaveLength(1);
    });

    test('returns null for inactive quiz', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        }),
      });

      const quiz = await getQuizBySlug('inactive-quiz');

      expect(quiz).toBeNull();
    });

    test('returns null for non-existent quiz', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        }),
      });

      const quiz = await getQuizBySlug('nonexistent');

      expect(quiz).toBeNull();
    });
  });

  describe('saveAnswer', () => {
    test('saves answer with calculated score', async () => {
      const mockOptions = [
        { id: 'opt1', score_value: 3.33 },
        { id: 'opt2', score_value: 6.66 },
      ];

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'quiz_options') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockOptions, error: null }),
            }),
          };
        }
        if (table === 'quiz_answers') {
          return {
            upsert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      await saveAnswer('session-1', 'question-1', ['opt1', 'opt2'], 10);

      expect(supabase.from).toHaveBeenCalledWith('quiz_options');
      expect(supabase.from).toHaveBeenCalledWith('quiz_answers');
    });

    test('throws error on save failure', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'quiz_options') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
        if (table === 'quiz_answers') {
          return {
            upsert: jest.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
          };
        }
      });

      await expect(saveAnswer('session-1', 'q1', ['opt1'])).rejects.toThrow(
        'Failed to save answer: Insert failed'
      );
    });
  });

  describe('getSessionAnswers', () => {
    test('retrieves all answers for session', async () => {
      const mockAnswers = [
        {
          question_id: 'q1',
          selected_option_ids: ['opt1'],
          answer_value: null,
          time_spent_seconds: 5,
        },
        {
          question_id: 'q2',
          selected_option_ids: ['opt2', 'opt3'],
          answer_value: null,
          time_spent_seconds: 8,
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockAnswers, error: null }),
        }),
      });

      const answers = await getSessionAnswers('session-1');

      expect(answers).toHaveLength(2);
      expect(answers[0].questionId).toBe('q1');
      expect(answers[0].selectedOptionIds).toEqual(['opt1']);
      expect(answers[1].selectedOptionIds).toEqual(['opt2', 'opt3']);
    });

    test('throws error on fetch failure', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'Fetch failed' } }),
        }),
      });

      await expect(getSessionAnswers('session-1')).rejects.toThrow('Failed to load answers: Fetch failed');
    });
  });
});
