import { supabase } from '@/lib/supabase/client';
import type { QuizSession, QuizSessionInsert } from '@/types';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'qb_sid';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function createSession(quizId: string, quizVersion: number): Promise<QuizSession> {
  const sessionToken = crypto.randomUUID();

  const sessionData: QuizSessionInsert = {
    quiz_id: quizId,
    quiz_version: quizVersion,
    session_token: sessionToken,
    current_question_index: 0,
    user_agent: '', // Will be set by API route
    ip_address: '', // Will be set by API route
  };

  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert(sessionData as any)
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);

  return data as QuizSession;
}

export async function getSession(sessionToken: string): Promise<QuizSession | null> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .single();

  if (error) return null;

  const session = data as QuizSession;

  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    return null;
  }

  return session;
}

export async function getSessionFromCookie(): Promise<QuizSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionToken) return null;

  return getSession(sessionToken);
}

export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function updateSession(sessionId: string, updates: { current_question_index?: number; completed_at?: string; email?: string }): Promise<void> {
  const updateData = { ...updates, updated_at: new Date().toISOString() };

  const { error } = await (supabase
    .from('quiz_sessions')
    .update as any)(updateData)
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to update session: ${error.message}`);
}
