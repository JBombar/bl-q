import { NextRequest, NextResponse } from 'next/server';
import { getQuizBySlug } from '@/lib/services/quiz.service';
import { createSession, setSessionCookie, getSessionFromCookie } from '@/lib/services/session.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Quiz slug required' }, { status: 400 });
    }

    // Load quiz
    const quiz = await getQuizBySlug(slug);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check for existing session or create new one
    let session = await getSessionFromCookie();

    // Create new session if:
    // 1. No session exists, OR
    // 2. Session is for different quiz, OR
    // 3. Session is already completed (retake scenario)
    if (!session || session.quiz_id !== quiz.id || session.completed_at) {
      session = await createSession(quiz.id, quiz.version ?? 1);
      await setSessionCookie(session.session_token);
    }

    // Track event
    await trackEvent(EVENT_TYPES.SESSION_STARTED, {
      sessionId: session.id,
      quizId: quiz.id,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      sessionId: session.id,
      quiz,
    });
  } catch (error: any) {
    console.error('Quiz start error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
