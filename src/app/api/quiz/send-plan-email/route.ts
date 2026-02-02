import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';
import type { SendPlanEmailResponse } from '@/types/funnel.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/quiz/send-plan-email
 *
 * Sends the personal plan email to the user.
 * Currently MOCKED - logs payload and returns success.
 * Tomorrow: Wire to Resend API for actual email sending.
 *
 * Called after Screen E (name capture).
 * Non-blocking: If email fails, funnel continues to Screen F.
 */
export async function POST(request: NextRequest): Promise<NextResponse<SendPlanEmailResponse>> {
  try {
    // Validate session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { success: false, emailSent: false, error: 'No active session' },
        { status: 401 }
      );
    }

    // Only allow for completed quizzes
    if (!session.completed_at) {
      return NextResponse.json(
        { success: false, emailSent: false, error: 'Quiz not completed' },
        { status: 400 }
      );
    }

    // Get session email and firstName from database (most up-to-date)
    const { data: sessionData, error: fetchError } = await supabase
      .from('quiz_sessions')
      .select('email, user_metadata')
      .eq('id', session.id)
      .single();

    if (fetchError || !sessionData) {
      return NextResponse.json(
        { success: false, emailSent: false, error: 'Failed to fetch session data' },
        { status: 500 }
      );
    }

    const sessionRecord = sessionData as { email: string | null; user_metadata: Record<string, unknown> | null };
    const email = sessionRecord.email;
    const userMetadata = sessionRecord.user_metadata;
    const firstName = (userMetadata && typeof userMetadata.firstName === 'string' ? userMetadata.firstName : null) ?? 'there';

    if (!email) {
      return NextResponse.json(
        { success: false, emailSent: false, error: 'No email address found' },
        { status: 400 }
      );
    }

    // =====================================================
    // MOCKED EMAIL SENDING
    // TODO: Replace with actual Resend integration
    // =====================================================
    console.log('=== MOCKED EMAIL SEND ===');
    console.log('To:', email);
    console.log('Name:', firstName);
    console.log('Session ID:', session.id);
    console.log('Subject:', `${firstName}, tvuj plan vnitrniho klidu je pripraven!`);
    console.log('=========================');

    // Simulate email sending delay (optional, remove in production)
    // await new Promise(resolve => setTimeout(resolve, 100));

    // Track email capture event
    await trackEvent(EVENT_TYPES.EMAIL_CAPTURED, {
      sessionId: session.id,
      quizId: session.quiz_id,
      eventData: {
        email,
        firstName,
        mocked: true,
      },
    });

    return NextResponse.json({
      success: true,
      emailSent: true,
      mocked: true,
    });
  } catch (error: any) {
    console.error('Send plan email error:', error);

    // Don't block the funnel on email errors
    // Log the error but return success: false (not a 500)
    return NextResponse.json({
      success: false,
      emailSent: false,
      error: error.message,
    });
  }
}
