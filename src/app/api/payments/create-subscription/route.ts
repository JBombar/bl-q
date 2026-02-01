/**
 * Create Subscription API Endpoint
 *
 * Creates a new Stripe subscription with tier-specific introductory discount.
 * Supports three pricing tiers:
 * - FIRST_DISCOUNT: Initial offer (default)
 * - MAX_DISCOUNT: Downsell offer (after checkout cancel)
 * - FULL_PRICE: Expired offer (after timer expires)
 *
 * Discount applies ONLY to the first billing cycle.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { createSubscription } from '@/lib/stripe/subscription.service';
import {
  getPlanById,
  getPlanPricing,
  isValidPlanId,
  type PricingTier,
} from '@/config/pricing.config';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Request validation schema
const createSubscriptionSchema = z.object({
  planId: z.string().min(1, 'planId is required'),
  pricingTier: z.enum(['FIRST_DISCOUNT', 'MAX_DISCOUNT', 'FULL_PRICE']),
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

    const { planId, pricingTier, email } = validationResult.data;

    // 3. Look up plan details from config
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // 4. Get tier-specific pricing
    const pricing = getPlanPricing(planId, pricingTier as PricingTier);
    if (!pricing) {
      return NextResponse.json(
        { error: 'Invalid pricing configuration' },
        { status: 400 }
      );
    }

    // 5. Get quiz result if session exists (for linking)
    let resultId: string | undefined;
    if (session) {
      const { data: result } = await supabase
        .from('quiz_results')
        .select('id')
        .eq('session_id', session.id)
        .single();

      resultId = result?.id;
    }

    // 6. Create subscription with tier-specific discount
    const subscriptionResult = await createSubscription({
      email,
      sessionId: session?.id,
      stripePriceId: plan.stripePriceId,
      billingInterval: plan.billingInterval,
      discountAmountCents: pricing.discountAmountCents,
      initialAmountCents: pricing.initialPriceCents,
      recurringAmountCents: pricing.recurringPriceCents,
      productName: plan.name,
      pricingTier: pricingTier as PricingTier,
      resultId,
    });

    // 7. Update session email if provided and session exists
    if (session && email) {
      await supabase
        .from('quiz_sessions')
        .update({ email } as any)
        .eq('id', session.id);
    }

    // 8. Track subscription started event
    await trackEvent(EVENT_TYPES.SUBSCRIPTION_STARTED, {
      sessionId: session?.id,
      quizId: session?.quiz_id,
      eventData: {
        planId: plan.id,
        planName: plan.name,
        pricingTier,
        billingInterval: plan.billingInterval,
        initialPriceCents: pricing.initialPriceCents,
        recurringPriceCents: pricing.recurringPriceCents,
        discountCents: pricing.discountAmountCents,
        stripeSubscriptionId: subscriptionResult.stripeSubscriptionId,
        customerId: subscriptionResult.customerId,
      },
    });

    // 9. Return client secret for frontend payment confirmation
    return NextResponse.json({
      clientSecret: subscriptionResult.clientSecret,
      subscriptionId: subscriptionResult.subscriptionId,
      stripeSubscriptionId: subscriptionResult.stripeSubscriptionId,
      status: subscriptionResult.status,
      plan: {
        id: plan.id,
        name: plan.name,
        billingInterval: plan.billingInterval,
        initialAmount: pricing.initialPriceCents,
        recurringAmount: pricing.recurringPriceCents,
        pricingTier,
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
