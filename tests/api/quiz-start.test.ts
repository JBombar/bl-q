/**
 * API Integration Tests for Quiz Endpoints
 *
 * These tests verify API route behavior with mocked dependencies
 */

import { NextRequest } from 'next/server';
import { POST as startQuiz } from '@/app/api/quiz/start/route';
import { getQuizBySlug } from '@/lib/services/quiz.service';
import { createSession, setSessionCookie, getSessionFromCookie } from '@/lib/services/session.service';
import { trackEvent } from '@/lib/services/analytics.service';

// Mock all service dependencies
jest.mock('@/lib/services/quiz.service');
jest.mock('@/lib/services/session.service');
jest.mock('@/lib/services/analytics.service');

describe('POST /api/quiz/start', () => {
  const mockQuiz = {
    id: 'quiz-123',
    slug: 'stress-quiz',
    title: 'Stress Assessment Quiz',
    version: 1,
    questions: [
      {
        id: 'q1',
        question_text: 'Question 1',
        question_type: 'single_choice',
        options: [],
      },
    ],
  };

  const mockSession = {
    id: 'session-123',
    session_token: 'token-abc',
    quiz_id: 'quiz-123',
    quiz_version: 1,
    current_question_index: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns quiz and session for valid slug', async () => {
    (getQuizBySlug as jest.Mock).mockResolvedValue(mockQuiz);
    (getSessionFromCookie as jest.Mock).mockResolvedValue(null);
    (createSession as jest.Mock).mockResolvedValue(mockSession);
    (setSessionCookie as jest.Mock).mockResolvedValue(undefined);
    (trackEvent as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/quiz/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'stress-quiz' }),
    });

    const response = await startQuiz(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('sessionId', 'session-123');
    expect(data).toHaveProperty('quiz');
    expect(data.quiz.slug).toBe('stress-quiz');
    expect(createSession).toHaveBeenCalledWith('quiz-123', 1);
    expect(setSessionCookie).toHaveBeenCalledWith('token-abc');
  });

  test('returns 404 for invalid slug', async () => {
    (getQuizBySlug as jest.Mock).mockResolvedValue(null);
    (getSessionFromCookie as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/quiz/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'nonexistent-quiz' }),
    });

    const response = await startQuiz(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Quiz not found');
    expect(createSession).not.toHaveBeenCalled();
  });

  test('returns 400 when slug is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/quiz/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await startQuiz(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Quiz slug required');
  });

  test('reuses existing session for same quiz', async () => {
    const existingSession = { ...mockSession, id: 'existing-session' };

    (getQuizBySlug as jest.Mock).mockResolvedValue(mockQuiz);
    (getSessionFromCookie as jest.Mock).mockResolvedValue(existingSession);
    (trackEvent as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/quiz/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'stress-quiz' }),
    });

    const response = await startQuiz(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sessionId).toBe('existing-session');
    expect(createSession).not.toHaveBeenCalled(); // Should not create new session
  });

  test('creates new session if existing session is for different quiz', async () => {
    const existingSession = { ...mockSession, quiz_id: 'different-quiz' };

    (getQuizBySlug as jest.Mock).mockResolvedValue(mockQuiz);
    (getSessionFromCookie as jest.Mock).mockResolvedValue(existingSession);
    (createSession as jest.Mock).mockResolvedValue(mockSession);
    (setSessionCookie as jest.Mock).mockResolvedValue(undefined);
    (trackEvent as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/quiz/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'stress-quiz' }),
    });

    const response = await startQuiz(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(createSession).toHaveBeenCalledWith('quiz-123', 1);
  });

  test('handles server errors gracefully', async () => {
    (getQuizBySlug as jest.Mock).mockRejectedValue(new Error('Database connection failed'));
    (getSessionFromCookie as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/quiz/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'stress-quiz' }),
    });

    const response = await startQuiz(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database connection failed');
  });
});
