import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { supabase } from '@/lib/supabase/client';
import type { QuizAnswerData } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Batch sync endpoint for quiz answers
 * Performs a single database upsert for all answers to eliminate request waterfall
 */
export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { answers } = body as { answers: QuizAnswerData[] };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid request: answers array required' },
        { status: 400 }
      );
    }

    if (answers.length === 0) {
      // No answers to sync - return success
      return NextResponse.json({ success: true, synced: 0 });
    }

    // Get all unique option IDs to fetch scores
    const allOptionIds = Array.from(
      new Set(answers.flatMap(a => a.selectedOptionIds))
    );

    // Fetch option scores in a single query
    const { data: options, error: optionsError } = await supabase
      .from('quiz_options')
      .select('id, score_value')
      .in('id', allOptionIds);

    if (optionsError) {
      throw new Error(`Failed to fetch option scores: ${optionsError.message}`);
    }

    // Build option score map
    const optionScoreMap = new Map<string, number>();
    (options || []).forEach((opt: any) => {
      optionScoreMap.set(opt.id, opt.score_value || 0);
    });

    // Transform answers to database format with calculated scores
    const answerRecords = answers.map(answer => {
      // Calculate total score for this answer
      const answerScore = answer.selectedOptionIds.reduce((sum, optionId) => {
        return sum + (optionScoreMap.get(optionId) || 0);
      }, 0);

      return {
        session_id: session.id,
        question_id: answer.questionId,
        selected_option_ids: answer.selectedOptionIds,
        answer_score: answerScore,
        time_spent_seconds: answer.timeSpent || 0,
      };
    });

    // Perform single batch upsert
    const { error: upsertError } = await supabase
      .from('quiz_answers')
      .upsert(answerRecords, {
        onConflict: 'session_id,question_id',
      });

    if (upsertError) {
      throw new Error(`Failed to batch sync answers: ${upsertError.message}`);
    }

    return NextResponse.json({
      success: true,
      synced: answers.length,
    });
  } catch (error: any) {
    console.error('Batch sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
