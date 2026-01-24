import { renderHook, act } from '@testing-library/react';
import { useQuizState } from '../useQuizState';

// Mock fetch globally
global.fetch = jest.fn();

describe('useQuizState Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockClear();

    // Reset Zustand store state before each test
    const { result } = renderHook(() => useQuizState());
    act(() => {
      result.current.reset();
    });
  });

  test('initializes with empty state', () => {
    const { result } = renderHook(() => useQuizState());

    expect(result.current.sessionId).toBeNull();
    expect(result.current.quiz).toBeNull();
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.answers).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('loadQuiz fetches quiz and creates session', async () => {
    const mockResponse = {
      sessionId: 'session-123',
      quiz: {
        id: 'quiz-1',
        slug: 'stress-quiz',
        title: 'Stress Quiz',
        questions: [
          { id: 'q1', question_text: 'Question 1', options: [] },
          { id: 'q2', question_text: 'Question 2', options: [] },
        ],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useQuizState());

    await act(async () => {
      await result.current.loadQuiz('stress-quiz');
    });

    expect(result.current.sessionId).toBe('session-123');
    expect(result.current.quiz?.slug).toBe('stress-quiz');
    expect(result.current.quiz?.questions).toHaveLength(2);
    expect(result.current.isLoading).toBe(false);

    // Check localStorage
    const stored = localStorage.getItem('quiz_session');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.sessionId).toBe('session-123');
    expect(parsed.slug).toBe('stress-quiz');
  });

  test('loadQuiz handles errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Quiz not found' }),
    });

    const { result } = renderHook(() => useQuizState());

    // Ensure fresh state
    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await result.current.loadQuiz('nonexistent-quiz');
    });

    expect(result.current.error).toBe('Failed to load quiz');
    expect(result.current.sessionId).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  test('selectAnswer updates state optimistically', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useQuizState());

    await act(async () => {
      await result.current.selectAnswer('q1', ['opt1'], 5);
    });

    // Answer should be in state immediately
    expect(result.current.answers).toHaveLength(1);
    expect(result.current.answers[0].questionId).toBe('q1');
    expect(result.current.answers[0].selectedOptionIds).toEqual(['opt1']);
    expect(result.current.answers[0].timeSpent).toBe(5);
  });

  test('selectAnswer replaces existing answer for same question', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useQuizState());

    // First answer
    await act(async () => {
      await result.current.selectAnswer('q1', ['opt1'], 5);
    });

    expect(result.current.answers).toHaveLength(1);

    // Change answer for same question
    await act(async () => {
      await result.current.selectAnswer('q1', ['opt2'], 8);
    });

    // Should still have only 1 answer
    expect(result.current.answers).toHaveLength(1);
    expect(result.current.answers[0].selectedOptionIds).toEqual(['opt2']);
    expect(result.current.answers[0].timeSpent).toBe(8);
  });

  test('nextQuestion increments index', () => {
    const { result } = renderHook(() => useQuizState());

    // Manually set quiz
    act(() => {
      (result.current as any).quiz = {
        id: 'quiz-1',
        questions: Array(10).fill({ id: 'q', question_text: 'Q' }),
      };
    });

    expect(result.current.currentQuestionIndex).toBe(0);

    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.currentQuestionIndex).toBe(1);

    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.currentQuestionIndex).toBe(2);
  });

  test('nextQuestion does not exceed question count', () => {
    const { result } = renderHook(() => useQuizState());

    act(() => {
      (result.current as any).quiz = {
        questions: [{ id: 'q1' }], // Only 1 question
      };
      (result.current as any).currentQuestionIndex = 0;
    });

    act(() => {
      result.current.nextQuestion();
    });

    // Should still be 0 (can't go beyond last question)
    expect(result.current.currentQuestionIndex).toBe(0);
  });

  test('previousQuestion decrements index', () => {
    const { result } = renderHook(() => useQuizState());

    act(() => {
      (result.current as any).quiz = {
        questions: Array(10).fill({ id: 'q' }),
      };
      (result.current as any).currentQuestionIndex = 5;
    });

    act(() => {
      result.current.previousQuestion();
    });

    expect(result.current.currentQuestionIndex).toBe(4);
  });

  test('previousQuestion does not go below 0', () => {
    const { result } = renderHook(() => useQuizState());

    act(() => {
      (result.current as any).currentQuestionIndex = 0;
    });

    act(() => {
      result.current.previousQuestion();
    });

    expect(result.current.currentQuestionIndex).toBe(0);
  });

  test('completeQuiz calls API and returns result', async () => {
    const mockResult = {
      result: {
        id: 'result-1',
        result_value: 'high',
        result_label: 'High Stress',
      },
      offer: {
        productId: 'prod-1',
        priceCents: 2999,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    });

    const { result } = renderHook(() => useQuizState());

    let completionResult;
    await act(async () => {
      completionResult = await result.current.completeQuiz();
    });

    expect(completionResult).toEqual(mockResult);
    expect(global.fetch).toHaveBeenCalledWith('/api/quiz/complete', {
      method: 'POST',
    });
  });

  test('reset clears all state and localStorage', () => {
    const { result } = renderHook(() => useQuizState());

    // Set some state
    act(() => {
      (result.current as any).sessionId = 'session-123';
      (result.current as any).quiz = { id: 'quiz-1' };
      (result.current as any).currentQuestionIndex = 5;
      (result.current as any).answers = [{ questionId: 'q1', selectedOptionIds: ['opt1'] }];
    });

    localStorage.setItem('quiz_session', JSON.stringify({ sessionId: 'session-123' }));

    act(() => {
      result.current.reset();
    });

    expect(result.current.sessionId).toBeNull();
    expect(result.current.quiz).toBeNull();
    expect(result.current.currentQuestionIndex).toBe(0);
    expect(result.current.answers).toEqual([]);
    expect(localStorage.getItem('quiz_session')).toBeNull();
  });
});
