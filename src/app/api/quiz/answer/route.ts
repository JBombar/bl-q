import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie, updateSession } from '@/lib/services/session.service';
import { saveAnswer } from '@/lib/services/quiz.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const { questionId, selectedOptionIds, timeSpentSeconds } = await request.json();

    if (!questionId || !selectedOptionIds || !Array.isArray(selectedOptionIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Save answer
    await saveAnswer(session.id, questionId, selectedOptionIds, timeSpentSeconds);

    // Update session progress
    const newIndex = session.current_question_index + 1;
    await updateSession(session.id, { current_question_index: newIndex });

    // Track event
    await trackEvent(EVENT_TYPES.ANSWER_SAVED, {
      sessionId: session.id,
      quizId: session.quiz_id,
      eventData: { questionId, questionIndex: session.current_question_index },
    });

    return NextResponse.json({
      success: true,
      currentQuestionIndex: newIndex,
    });
  } catch (error: any) {
    console.error('Answer save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
