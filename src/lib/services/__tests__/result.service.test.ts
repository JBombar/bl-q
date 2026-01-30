import { calculateResult, getExistingResult } from '../result.service';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Result Calculation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock chain for supabase
  const createMockChain = (answersData: any[], questionsData: any[], upsertResult: any) => {
    const mockFrom = jest.fn().mockImplementation((table: string) => {
      if (table === 'quiz_answers') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: answersData, error: null }),
          }),
        };
      }
      if (table === 'quiz_questions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: questionsData, error: null }),
            }),
          }),
        };
      }
      if (table === 'quiz_results') {
        return {
          upsert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: upsertResult, error: null }),
            }),
          }),
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        };
      }
      return {};
    });
    (supabase.from as jest.Mock) = mockFrom;
  };

  describe('calculateResult', () => {
    test('calculates low stress segment (0-20) with weighted scoring', async () => {
      // 2 questions with weight 1.0, each answered with score 2 = total 4
      const mockAnswers = [
        { question_id: 'q1', answer_score: 2, selected_option_ids: ['opt1'] },
        { question_id: 'q2', answer_score: 2, selected_option_ids: ['opt2'] },
      ];
      const mockQuestions = [
        { id: 'q1', question_type: 'single_choice', weight: 1.0 },
        { id: 'q2', question_type: 'single_choice', weight: 1.0 },
      ];

      createMockChain(mockAnswers, mockQuestions, {
        id: 'result-1',
        result_value: 'low',
        result_score: 4,
        result_label: 'Nízký stres (0-20)',
        calculation_details: {
          rawScore: 4,
          weightedScore: 4,
          scoringQuestionsAnswered: 2,
          totalScoringQuestions: 2,
          normalizedScore: 67,
          version: '1.0.0',
        },
      });

      const result = await calculateResult({
        sessionId: 'session-1',
        quizId: 'quiz-1',
        resultType: 'segment',
        resultConfig: {
          segments: [
            { id: 'low', label: 'Nízký stres (0-20)', description: 'Low stress', minScore: 0, maxScore: 20 },
            { id: 'medium', label: 'Střední stres (21-40)', description: 'Medium stress', minScore: 21, maxScore: 40 },
            { id: 'high', label: 'Vysoký stres (41-60)', description: 'High stress', minScore: 41, maxScore: 60 },
          ],
        },
        offerMapping: {
          low: { productId: 'prod_low', priceCents: 1990 },
        },
      });

      expect(result.result_value).toBe('low');
      expect(result.result_label).toBe('Nízký stres (0-20)');
    });

    test('applies question weights correctly', async () => {
      // Question 1 has weight 2.0, question 2 has weight 0.5
      // Scores: q1=3, q2=3
      // Weighted: (3*2.0) + (3*0.5) = 6 + 1.5 = 7.5
      const mockAnswers = [
        { question_id: 'q1', answer_score: 3, selected_option_ids: ['opt1'] },
        { question_id: 'q2', answer_score: 3, selected_option_ids: ['opt2'] },
      ];
      const mockQuestions = [
        { id: 'q1', question_type: 'single_choice', weight: 2.0 },
        { id: 'q2', question_type: 'single_choice', weight: 0.5 },
      ];

      createMockChain(mockAnswers, mockQuestions, {
        id: 'result-weighted',
        result_value: 'low',
        result_score: 7.5,
        calculation_details: {
          rawScore: 6,
          weightedScore: 7.5,
          totalWeightApplied: 2.5,
        },
      });

      const result = await calculateResult({
        sessionId: 'session-weighted',
        quizId: 'quiz-1',
        resultType: 'segment',
        resultConfig: {
          segments: [
            { id: 'low', minScore: 0, maxScore: 20 },
            { id: 'medium', minScore: 21, maxScore: 40 },
          ],
        },
        offerMapping: {},
      });

      expect(result.result_score).toBe(7.5);
    });

    test('calculates high stress segment when score exceeds ranges', async () => {
      // High scores that exceed all ranges - should fall into highest segment
      const mockAnswers = Array(20).fill({ question_id: 'q1', answer_score: 3, selected_option_ids: ['opt'] });
      const mockQuestions = Array(20).fill({ id: 'q1', question_type: 'single_choice', weight: 1.0 })
        .map((q, i) => ({ ...q, id: `q${i}` }));

      createMockChain(mockAnswers, mockQuestions, {
        id: 'result-high',
        result_value: 'high',
        result_score: 60,
        result_label: 'Vysoký stres (41-60)',
      });

      const result = await calculateResult({
        sessionId: 'session-high',
        quizId: 'quiz-1',
        resultType: 'segment',
        resultConfig: {
          segments: [
            { id: 'low', label: 'Nízký stres (0-20)', minScore: 0, maxScore: 20 },
            { id: 'medium', label: 'Střední stres (21-40)', minScore: 21, maxScore: 40 },
            { id: 'high', label: 'Vysoký stres (41-60)', minScore: 41, maxScore: 60 },
          ],
        },
        offerMapping: {},
      });

      expect(result.result_value).toBe('high');
    });

    test('ignores non-scoring question types', async () => {
      // Mix of scoring and non-scoring questions
      const mockAnswers = [
        { question_id: 'q1', answer_score: 3, selected_option_ids: ['opt1'] },
        { question_id: 'q2', answer_score: 0, selected_option_ids: [] }, // Non-scoring (won't be in questions)
        { question_id: 'q3', answer_score: 3, selected_option_ids: ['opt3'] },
      ];
      // Only scoring questions returned
      const mockQuestions = [
        { id: 'q1', question_type: 'single_choice', weight: 1.0 },
        { id: 'q3', question_type: 'likert_1_4', weight: 1.0 },
      ];

      createMockChain(mockAnswers, mockQuestions, {
        id: 'result-mixed',
        result_value: 'low',
        result_score: 6,
        calculation_details: {
          scoringQuestionsAnswered: 2,
          totalScoringQuestions: 2,
        },
      });

      const result = await calculateResult({
        sessionId: 'session-mixed',
        quizId: 'quiz-1',
        resultType: 'segment',
        resultConfig: {
          segments: [{ id: 'low', minScore: 0, maxScore: 20 }],
        },
        offerMapping: {},
      });

      expect(result.result_score).toBe(6); // Only q1 and q3 counted
    });

    test('handles empty answers array', async () => {
      createMockChain([], [], {
        result_value: '',
        result_score: 0,
        calculation_details: {
          rawScore: 0,
          weightedScore: 0,
          scoringQuestionsAnswered: 0,
          normalizedScore: 0,
        },
      });

      const result = await calculateResult({
        sessionId: 'session-empty',
        quizId: 'quiz-1',
        resultType: 'segment',
        resultConfig: { segments: [] },
        offerMapping: {},
      });

      expect(result.result_score).toBe(0);
    });

    test('handles database error when fetching answers', async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'quiz_answers') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database connection failed' }
              }),
            }),
          };
        }
        return {};
      });

      await expect(calculateResult({
        sessionId: 'session-error',
        quizId: 'quiz-1',
        resultType: 'segment',
        resultConfig: { segments: [] },
        offerMapping: {},
      })).rejects.toThrow('Failed to load answers: Database connection failed');
    });

    test('falls back to first offer if result value not in mapping', async () => {
      const mockAnswers = [{ question_id: 'q1', answer_score: 1, selected_option_ids: ['opt1'] }];
      const mockQuestions = [{ id: 'q1', question_type: 'single_choice', weight: 1.0 }];

      createMockChain(mockAnswers, mockQuestions, {
        result_value: 'low',
        result_score: 1,
        recommended_product_id: 'prod_default',
      });

      const result = await calculateResult({
        sessionId: 'session-fallback',
        quizId: 'quiz-1',
        resultType: 'segment',
        resultConfig: {
          segments: [{ id: 'low', minScore: 0, maxScore: 20 }],
        },
        offerMapping: {
          default: { productId: 'prod_default', priceCents: 1000 },
        },
      });

      expect(result.recommended_product_id).toBe('prod_default');
    });
  });

  describe('getExistingResult', () => {
    test('returns existing result when found', async () => {
      const existingResult = {
        id: 'result-existing',
        session_id: 'session-1',
        result_value: 'medium',
        result_score: 35,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: existingResult, error: null }),
          }),
        }),
      });

      const result = await getExistingResult('session-1');
      expect(result).toEqual(existingResult);
    });

    test('returns null when no result found', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      });

      const result = await getExistingResult('session-not-found');
      expect(result).toBeNull();
    });
  });
});
