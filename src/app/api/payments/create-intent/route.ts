import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { createPaymentIntent } from '@/lib/stripe/payment.service';
import { createOrder } from '@/lib/stripe/order.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';
import type { QuizResult } from '@/types';

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

    // Validate price
    if (!quizResult.recommended_price_cents || quizResult.recommended_price_cents <= 0) {
      return NextResponse.json({ error: 'Invalid product price' }, { status: 400 });
    }

    // Optional: Get email from request body
    const body = await request.json().catch(() => ({}));
    const customerEmail = body.email;

    // Create Stripe PaymentIntent
    const paymentIntent = await createPaymentIntent({
      sessionId: session.id,
      resultId: quizResult.id,
      amount: quizResult.recommended_price_cents,
      productId: quizResult.recommended_product_id || 'unknown',
      productName: quizResult.recommended_product_name || 'Unknown Product',
      customerEmail,
    });

    // Create order record (status: pending)
    const order = await createOrder({
      sessionId: session.id,
      resultId: quizResult.id,
      productId: quizResult.recommended_product_id || 'unknown',
      productName: quizResult.recommended_product_name || 'Unknown Product',
      amountCents: quizResult.recommended_price_cents,
      stripePaymentIntentId: paymentIntent.paymentIntentId,
      customerEmail,
    });

    // Track checkout started event
    await trackEvent(EVENT_TYPES.CHECKOUT_STARTED, {
      sessionId: session.id,
      quizId: session.quiz_id,
      eventData: {
        orderId: order.id,
        amount: quizResult.recommended_price_cents,
        productId: quizResult.recommended_product_id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      orderId: order.id,
      orderNumber: order.order_number,
      amount: quizResult.recommended_price_cents,
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
