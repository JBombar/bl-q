import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie, updateSession } from '@/lib/services/session.service';
import { calculateResult, getExistingResult } from '@/lib/services/result.service';
import { getQuizInsights, extractFunnelState } from '@/lib/services/insights.service';
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

    // Idempotency: if session already completed, return existing result with insights
    if (session.completed_at) {
      const existingResult = await getExistingResult(session.id);
      if (existingResult) {
        const offer = quizData.offer_mapping[existingResult.result_value] ||
          Object.values(quizData.offer_mapping)[0];

        // Get normalized score from calculation details
        const normalizedScore = (existingResult.calculation_details as any)?.normalizedScore ?? 50;

        // Get insights for Screen A
        const insights = await getQuizInsights(session.id, session.quiz_id, normalizedScore);

        // Extract funnel state for resume functionality
        const funnelState = extractFunnelState(
          session.user_metadata && typeof session.user_metadata === 'object' && !Array.isArray(session.user_metadata)
            ? session.user_metadata as Record<string, unknown>
            : null
        );

        return NextResponse.json({
          result: existingResult,
          offer,
          cached: true,
          insights,
          funnelState,
        });
      }
    }

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
      eventData: {
        resultValue: result.result_value,
        resultScore: result.result_score,
        calculationDetails: result.calculation_details,
      },
    });

    // Get offer from mapping
    const offer = quizData.offer_mapping[result.result_value];

    // Get normalized score from calculation details
    const normalizedScore = (result.calculation_details as any)?.normalizedScore ?? 50;

    // Get insights for Screen A
    const insights = await getQuizInsights(session.id, session.quiz_id, normalizedScore);

    // Extract funnel state (will be null for first completion)
    const funnelState = extractFunnelState(
      session.user_metadata && typeof session.user_metadata === 'object' && !Array.isArray(session.user_metadata)
        ? session.user_metadata as Record<string, unknown>
        : null
    );

    return NextResponse.json({
      result,
      offer,
      insights,
      funnelState,
    });
  } catch (error: any) {
    console.error('Quiz complete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
