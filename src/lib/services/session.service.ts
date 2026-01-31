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
  if (session.expires_at && new Date(session.expires_at) < new Date()) {
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

interface SessionUpdates {
  current_question_index?: number;
  completed_at?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export async function updateSession(sessionId: string, updates: SessionUpdates): Promise<void> {
  const updateData = { ...updates, updated_at: new Date().toISOString() };

  const { error } = await (supabase
    .from('quiz_sessions')
    .update as any)(updateData)
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to update session: ${error.message}`);
}

/**
 * Merge update into session's user_metadata JSONB field
 * Used for saving funnel state incrementally
 */
export async function mergeSessionMetadata(
  sessionId: string,
  metadataUpdates: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // First, get current metadata
  const { data: session, error: fetchError } = await supabase
    .from('quiz_sessions')
    .select('user_metadata')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch session metadata: ${fetchError.message}`);
  }

  const sessionData = session as { user_metadata: Record<string, unknown> | null } | null;
  const currentMetadata = (sessionData?.user_metadata as Record<string, unknown>) || {};

  // Merge new metadata
  const mergedMetadata = {
    ...currentMetadata,
    ...metadataUpdates,
  };

  // Handle nested microCommitments merge
  if (metadataUpdates.microCommitments && currentMetadata.microCommitments) {
    mergedMetadata.microCommitments = {
      ...(currentMetadata.microCommitments as Record<string, unknown>),
      ...(metadataUpdates.microCommitments as Record<string, unknown>),
    };
  }

  // Update with merged metadata
  await updateSession(sessionId, { user_metadata: mergedMetadata });

  return mergedMetadata;
}
