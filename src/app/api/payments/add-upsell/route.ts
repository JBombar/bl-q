/**
 * Add Upsell API Endpoint
 *
 * Adds the mentoring upsell as a separate subscription,
 * auto-charging the customer's saved payment method.
 * No second Payment Element required — single-click charge.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { addUpsellToSubscription } from '@/lib/stripe/subscription.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const addUpsellSchema = z.object({
  stripeSubscriptionId: z.string().min(8).startsWith('sub_', 'Invalid subscription ID format'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Get session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const body = await request.json().catch(() => ({}));
    const validationResult = addUpsellSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { stripeSubscriptionId } = validationResult.data;

    console.log('[AddUpsell] Request:', {
      sessionId: session.id,
      baseSubscriptionId: stripeSubscriptionId,
    });

    // 3. Add upsell subscription
    const result = await addUpsellToSubscription({
      baseStripeSubscriptionId: stripeSubscriptionId,
      sessionId: session.id,
    });

    // 4. Track upsell event (fire-and-forget — don't block response)
    trackEvent(EVENT_TYPES.UPSELL_ACCEPTED, {
      sessionId: session.id,
      quizId: session.quiz_id,
      eventData: {
        baseSubscriptionId: stripeSubscriptionId,
        upsellSubscriptionId: result.stripeSubscriptionId,
        amountCharged: result.amountCharged,
        status: result.status,
      },
    });

    // 5. Return success
    return NextResponse.json({
      success: true,
      upsellSubscriptionId: result.upsellSubscriptionId,
      stripeSubscriptionId: result.stripeSubscriptionId,
      status: result.status,
      amountCharged: result.amountCharged,
    });
  } catch (error: any) {
    console.error('[AddUpsell] Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    // Stripe card errors — safe to show user-facing message
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Platba byla zamítnuta. Zkontrolujte prosím platební údaje.' },
        { status: 400 }
      );
    }

    // Stripe API errors — generic message, don't leak details
    if (error.type?.startsWith('Stripe')) {
      return NextResponse.json(
        { error: 'Platba se nezdařila. Zkuste to prosím znovu.' },
        { status: 400 }
      );
    }

    // Authorization error
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Neoprávněný přístup.' },
        { status: 403 }
      );
    }

    // Payment method not found
    if (error.message?.includes('No payment method')) {
      return NextResponse.json(
        { error: 'Nebyla nalezena platební metoda. Dokončete prosím nejprve hlavní platbu.' },
        { status: 400 }
      );
    }

    // Payment reversed due to DB failure
    if (error.message?.includes('reversed')) {
      return NextResponse.json(
        { error: 'Nastala chyba při zpracování. Platba byla vrácena. Zkuste to prosím znovu.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Nepodařilo se přidat mentoring. Zkuste to prosím znovu.' },
      { status: 500 }
    );
  }
}
