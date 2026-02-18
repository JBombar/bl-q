import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromCookie, updateSession, mergeSessionMetadata } from '@/lib/services/session.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';
import { stripe } from '@/lib/stripe/stripe.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema for email update request
const emailUpdateSchema = z.object({
  email: z.string().email(),
});

export async function PATCH(request: NextRequest) {
  try {
    // Validate session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = emailUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const newEmail = parseResult.data.email;

    // Update quiz_sessions: dedicated email column
    await updateSession(session.id, { email: newEmail });

    // Update quiz_sessions: user_metadata.email
    await mergeSessionMetadata(session.id, { email: newEmail });

    // Update customers table if a matching customer exists
    if (session.email) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id, stripe_customer_id')
        .eq('email', session.email)
        .maybeSingle();

      if (customer) {
        await supabase
          .from('customers')
          .update({ email: newEmail.toLowerCase() })
          .eq('id', customer.id);

        // Update Stripe customer if stripe_customer_id exists
        if (customer.stripe_customer_id) {
          try {
            await stripe.customers.update(customer.stripe_customer_id, {
              email: newEmail,
            });
          } catch (stripeError) {
            console.error('Failed to update Stripe customer email:', stripeError);
            // Continue without rollback - Supabase changes are preserved
          }
        }
      }
    }

    // Update orders table
    await supabase
      .from('orders')
      .update({ customer_email: newEmail })
      .eq('session_id', session.id);

    // Track event
    await trackEvent(EVENT_TYPES.EMAIL_UPDATED, {
      sessionId: session.id,
      quizId: session.quiz_id,
      eventData: {
        oldEmail: session.email,
        newEmail,
      },
    });

    return NextResponse.json({ success: true, email: newEmail });
  } catch (error: any) {
    console.error('Email update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
