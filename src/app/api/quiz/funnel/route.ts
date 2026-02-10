import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromCookie, updateSession, mergeSessionMetadata } from '@/lib/services/session.service';
import { extractFunnelState } from '@/lib/services/insights.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import type { FunnelMetadata, MicroCommitmentKey } from '@/types/funnel.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema for funnel update request
const funnelUpdateSchema = z.object({
  step: z.enum(['A', 'B', 'C1', 'C2', 'C3', 'D', 'E', 'F', 'complete']),
  timeCommitmentMinutes: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]).optional(),
  microCommitment: z.object({
    key: z.enum(['completer', 'prioritizeSelf', 'learnStress']),
    value: z.boolean(),
  }).optional(),
  email: z.string().email().optional(),
  firstName: z.string().min(2).max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Only allow funnel updates for completed quizzes
    if (!session.completed_at) {
      return NextResponse.json({ error: 'Quiz not completed' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = funnelUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Build metadata update object
    const metadataUpdate: Partial<FunnelMetadata> = {
      funnelStep: data.step,
    };

    // Add step-specific data
    if (data.timeCommitmentMinutes !== undefined) {
      metadataUpdate.timeCommitmentMinutes = data.timeCommitmentMinutes;
    }

    if (data.microCommitment) {
      // Will be merged with existing microCommitments in mergeSessionMetadata
      metadataUpdate.microCommitments = {
        [data.microCommitment.key]: data.microCommitment.value,
      } as FunnelMetadata['microCommitments'];
    }

    if (data.email) {
      metadataUpdate.email = data.email;
    }

    if (data.firstName) {
      metadataUpdate.firstName = data.firstName;
    }

    // Set funnel start timestamp if this is step A
    if (data.step === 'A') {
      metadataUpdate.funnelStartedAt = new Date().toISOString();
    }

    // Set funnel completed timestamp if this is the complete step
    if (data.step === 'complete') {
      metadataUpdate.funnelCompletedAt = new Date().toISOString();
    }

    // Merge metadata into session
    const updatedMetadata = await mergeSessionMetadata(session.id, metadataUpdate);

    // Update email in dedicated column if provided
    if (data.email) {
      await updateSession(session.id, { email: data.email });
    }

    // Track funnel step
    await trackEvent(EVENT_TYPES.FUNNEL_STEP_COMPLETED, {
      sessionId: session.id,
      quizId: session.quiz_id,
      eventData: {
        step: data.step,
        timeCommitmentMinutes: data.timeCommitmentMinutes,
        microCommitment: data.microCommitment,
        hasEmail: !!data.email,
        hasFirstName: !!data.firstName,
      },
    });

    // Extract typed funnel state from updated metadata
    const funnelState = extractFunnelState(updatedMetadata);

    return NextResponse.json({
      success: true,
      funnelState: funnelState || {},
    });
  } catch (error: any) {
    console.error('Funnel update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
