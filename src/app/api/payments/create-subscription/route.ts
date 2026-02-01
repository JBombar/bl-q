/**
 * Create Subscription API Endpoint
 *
 * Creates a new Stripe subscription with optional introductory discount.
 * Handles customer creation/lookup, subscription setup, and returns
 * the client secret for frontend payment confirmation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { createSubscription } from '@/lib/stripe/subscription.service';
import { getSubscriptionOfferById } from '@/config/subscription.config';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Request validation schema
const createSubscriptionSchema = z.object({
  offerId: z.string().min(1, 'offerId is required'),
  email: z.string().email('Valid email is required'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Get session (optional but preferred for tracking)
    const session = await getSessionFromCookie();

    // 2. Validate request body
    const body = await request.json().catch(() => ({}));
    const validationResult = createSubscriptionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { offerId, email } = validationResult.data;

    // 3. Look up offer details from config
    const offer = getSubscriptionOfferById(offerId);
    if (!offer) {
      return NextResponse.json(
        { error: 'Invalid offer ID' },
        { status: 400 }
      );
    }

    // 4. Get quiz result if session exists (for linking)
    let resultId: string | undefined;
    if (session) {
      const { data: result } = await supabase
        .from('quiz_results')
        .select('id')
        .eq('session_id', session.id)
        .single();

      resultId = result?.id;
    }

    // 5. Create subscription (handles customer find/create, Stripe subscription, DB records)
    const subscriptionResult = await createSubscription({
      email,
      sessionId: session?.id,
      stripePriceId: offer.stripePriceId,
      billingInterval: offer.billingInterval,
      discountAmountCents: offer.initialDiscountCents,
      productName: offer.name,
      resultId,
    });

    // 6. Update session email if provided and session exists
    if (session && email) {
      await supabase
        .from('quiz_sessions')
        .update({ email } as any)
        .eq('id', session.id);
    }

    // 7. Track subscription started event
    await trackEvent(EVENT_TYPES.SUBSCRIPTION_STARTED, {
      sessionId: session?.id,
      quizId: session?.quiz_id,
      eventData: {
        offerId: offer.id,
        offerName: offer.name,
        billingInterval: offer.billingInterval,
        recurringPriceCents: offer.recurringPriceCents,
        discountCents: offer.initialDiscountCents,
        effectiveFirstPaymentCents: offer.effectiveFirstPaymentCents,
        stripeSubscriptionId: subscriptionResult.stripeSubscriptionId,
        customerId: subscriptionResult.customerId,
      },
    });

    // 8. Return client secret for frontend payment confirmation
    return NextResponse.json({
      clientSecret: subscriptionResult.clientSecret,
      subscriptionId: subscriptionResult.subscriptionId,
      stripeSubscriptionId: subscriptionResult.stripeSubscriptionId,
      status: subscriptionResult.status,
      offer: {
        id: offer.id,
        name: offer.name,
        billingInterval: offer.billingInterval,
        firstPaymentAmount: offer.effectiveFirstPaymentCents,
        recurringAmount: offer.recurringPriceCents,
      },
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid subscription configuration' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
