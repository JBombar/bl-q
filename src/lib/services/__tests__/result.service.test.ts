import { calculateResult } from '../result.service';
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

  test('calculates low stress segment (0-33)', async () => {
    // Mock answers with low scores
    const mockAnswers = [
      { answer_score: 0 },
      { answer_score: 3.33 },
      { answer_score: 0 },
      { answer_score: 3.33 },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockAnswers, error: null }),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'result-1',
              result_value: 'low',
              result_score: 6.66,
              result_label: 'Low Stress',
            },
            error: null,
          }),
        }),
      }),
    });

    const result = await calculateResult({
      sessionId: 'session-1',
      quizId: 'quiz-1',
      resultType: 'segment',
      resultConfig: {
        segments: [
          { id: 'low', label: 'Low Stress', minScore: 0, maxScore: 33 },
          { id: 'medium', label: 'Medium Stress', minScore: 34, maxScore: 66 },
          { id: 'high', label: 'High Stress', minScore: 67, maxScore: 100 },
        ],
      },
      offerMapping: {
        low: { productId: 'prod_low', priceCents: 1999 },
      },
    });

    expect(result.result_value).toBe('low');
    expect(result.result_label).toBe('Low Stress');
  });

  test('calculates medium stress segment (34-66)', async () => {
    const mockAnswers = [
      { answer_score: 6.66 },
      { answer_score: 6.66 },
      { answer_score: 6.66 },
      { answer_score: 6.66 },
      { answer_score: 6.66 },
      { answer_score: 6.66 },
      { answer_score: 6.66 },
      { answer_score: 3.33 },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockAnswers, error: null }),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { result_value: 'medium', result_score: 49.95 },
            error: null,
          }),
        }),
      }),
    });

    const result = await calculateResult({
      sessionId: 'session-2',
      quizId: 'quiz-1',
      resultType: 'segment',
      resultConfig: {
        segments: [
          { id: 'low', minScore: 0, maxScore: 33 },
          { id: 'medium', minScore: 34, maxScore: 66 },
          { id: 'high', minScore: 67, maxScore: 100 },
        ],
      },
      offerMapping: {},
    });

    expect(result.result_value).toBe('medium');
  });

  test('calculates high stress segment (67-100)', async () => {
    const mockAnswers = Array(10).fill({ answer_score: 10 });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: mockAnswers, error: null }),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { result_value: 'high', result_score: 100 },
            error: null,
          }),
        }),
      }),
    });

    const result = await calculateResult({
      sessionId: 'session-3',
      quizId: 'quiz-1',
      resultType: 'segment',
      resultConfig: {
        segments: [
          { id: 'low', minScore: 0, maxScore: 33 },
          { id: 'medium', minScore: 34, maxScore: 66 },
          { id: 'high', minScore: 67, maxScore: 100 },
        ],
      },
      offerMapping: {},
    });

    expect(result.result_value).toBe('high');
    expect(result.result_score).toBe(100);
  });

  test('handles database error when fetching answers', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        }),
      }),
    });

    await expect(calculateResult({
      sessionId: 'session-error',
      quizId: 'quiz-1',
      resultType: 'segment',
      resultConfig: { segments: [] },
      offerMapping: {},
    })).rejects.toThrow('Failed to load answers: Database connection failed');
  });

  test('handles empty answers array', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              result_value: '',
              result_score: 0,
              calculation_details: { totalScore: 0, answersCount: 0 }
            },
            error: null,
          }),
        }),
      }),
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
});
