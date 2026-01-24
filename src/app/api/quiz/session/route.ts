import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { getSessionAnswers } from '@/lib/services/quiz.service';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Get answers
    const answers = await getSessionAnswers(session.id);

    // Get result if completed
    let result = null;
    if (session.completed_at) {
      const { data } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('session_id', session.id)
        .single();
      result = data;
    }

    return NextResponse.json({
      session: {
        ...session,
        progress: {
          totalQuestions: 0, // Will be set by frontend from quiz definition
          answeredQuestions: answers.length,
          percentComplete: 0,
          currentQuestion: null,
        },
        answers,
        result,
      },
    });
  } catch (error: any) {
    console.error('Session state error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
