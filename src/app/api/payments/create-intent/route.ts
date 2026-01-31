import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { createPaymentIntent } from '@/lib/stripe/payment.service';
import { createOrder } from '@/lib/stripe/order.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';
import { getPlanById } from '@/config/sales-page.config';
import type { QuizResult } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Get quiz result with offer details
    const { data: result, error: resultError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('session_id', session.id)
      .single();

    if (resultError || !result) {
      return NextResponse.json({ error: 'Quiz result not found' }, { status: 404 });
    }

    // Type assertion for strongly typed result
    const quizResult = result as QuizResult;

    // Get request body (planId required)
    const body = await request.json().catch(() => ({}));
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    // Look up plan from config
    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Get customer email from request body
    const customerEmail = body.email as string | undefined;

    // Create Stripe PaymentIntent with plan pricing
    const paymentIntent = await createPaymentIntent({
      sessionId: session.id,
      resultId: quizResult.id,
      amount: plan.priceCents,
      productId: plan.id,
      productName: plan.name,
      customerEmail,
    });

    // Create order record (status: pending)
    const order = await createOrder({
      sessionId: session.id,
      resultId: quizResult.id,
      productId: plan.id,
      productName: plan.name,
      amountCents: plan.priceCents,
      stripePaymentIntentId: paymentIntent.paymentIntentId,
      customerEmail,
    });

    // Track checkout started event
    await trackEvent(EVENT_TYPES.CHECKOUT_STARTED, {
      sessionId: session.id,
      quizId: session.quiz_id,
      eventData: {
        orderId: order.id,
        amount: plan.priceCents,
        productId: plan.id,
        planName: plan.name,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      orderId: order.id,
      orderNumber: order.order_number,
      amount: plan.priceCents,
      planName: plan.name,
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
