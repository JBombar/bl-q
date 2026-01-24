import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie, updateSession } from '@/lib/services/session.service';
import { calculateResult } from '@/lib/services/result.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Get quiz details
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('slug, result_type, result_config, offer_mapping')
      .eq('id', session.quiz_id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quizData = quiz as any;

    // Calculate result
    const result = await calculateResult({
      sessionId: session.id,
      quizId: session.quiz_id,
      resultType: quizData.result_type,
      resultConfig: quizData.result_config,
      offerMapping: quizData.offer_mapping,
    });

    // Mark session as completed
    await updateSession(session.id, { completed_at: new Date().toISOString() });

    // Track completion
    await trackEvent(EVENT_TYPES.QUIZ_COMPLETED, {
      sessionId: session.id,
      quizId: session.quiz_id,
      eventData: { resultValue: result.result_value, resultScore: result.result_score },
    });

    // Get offer from mapping
    const offer = quizData.offer_mapping[result.result_value];

    return NextResponse.json({
      result,
      offer,
    });
  } catch (error: any) {
    console.error('Quiz complete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
