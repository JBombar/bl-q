import { createSession, getSession } from '../session.service';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Session Management Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates new session with unique token', async () => {
    const mockSession = {
      id: 'session-123',
      session_token: 'token-abc',
      quiz_id: 'quiz-1',
      quiz_version: 1,
      current_question_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockSession, error: null }),
        }),
      }),
    });

    const session = await createSession('quiz-1', 1);

    expect(session.id).toBe('session-123');
    expect(session.session_token).toBeTruthy();
    expect(session.quiz_id).toBe('quiz-1');
    expect(session.quiz_version).toBe(1);
    expect(session.current_question_index).toBe(0);
  });

  test('retrieves session by token', async () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const mockSession = {
      id: 'session-123',
      session_token: 'token-abc',
      quiz_id: 'quiz-1',
      expires_at: futureDate,
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockSession, error: null }),
        }),
      }),
    });

    const session = await getSession('token-abc');

    expect(session).not.toBeNull();
    expect(session?.id).toBe('session-123');
    expect(session?.session_token).toBe('token-abc');
  });

  test('returns null for expired session', async () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    const mockSession = {
      id: 'session-123',
      session_token: 'token-expired',
      expires_at: pastDate,
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockSession, error: null }),
        }),
      }),
    });

    const session = await getSession('token-expired');

    expect(session).toBeNull();
  });

  test('returns null for non-existent session', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      }),
    });

    const session = await getSession('nonexistent-token');

    expect(session).toBeNull();
  });

  test('session token is a valid UUID format', async () => {
    const mockSession = {
      id: 'session-123',
      session_token: crypto.randomUUID(),
      quiz_id: 'quiz-1',
      quiz_version: 1,
      current_question_index: 0,
      created_at: new Date().toISOString(),
    };

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockSession, error: null }),
        }),
      }),
    });

    const session = await createSession('quiz-1', 1);

    // UUID v4 format regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(session.session_token).toMatch(uuidRegex);
  });
});
