import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from './stripe.config';
import { updateOrderStatus, getOrderByPaymentIntentId } from './order.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const paymentIntentId = paymentIntent.id;

  // Get order
  const order = await getOrderByPaymentIntentId(paymentIntentId);
  if (!order) {
    console.error(`Order not found for PaymentIntent: ${paymentIntentId}`);
    return;
  }

  // Prevent duplicate processing (idempotency)
  if (order.status === 'paid') {
    console.log(`Order ${order.order_number} already marked as paid`);
    return;
  }

  // Extract payment details
  const charge = paymentIntent.latest_charge as Stripe.Charge | null;
  const paymentMethod = charge?.payment_method_details;

  // Update order to paid
  await updateOrderStatus(paymentIntentId, 'paid', {
    chargeId: charge?.id,
    customerId: paymentIntent.customer as string | undefined,
    paymentMethodType: paymentMethod?.type || undefined,
    cardLast4: paymentMethod?.card?.last4 || undefined,
    cardBrand: paymentMethod?.card?.brand || undefined,
  });

  // Update session completed_purchase flag
  await (supabase
    .from('quiz_sessions')
    .update as any)({ completed_purchase: true })
    .eq('id', order.session_id);

  // Track payment success event
  await trackEvent(EVENT_TYPES.PAYMENT_SUCCEEDED, {
    sessionId: order.session_id,
    eventData: {
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.amount_cents,
      paymentIntentId,
    },
  });

  console.log(`✅ Payment succeeded for order ${order.order_number}`);
}

export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const paymentIntentId = paymentIntent.id;

  // Get order
  const order = await getOrderByPaymentIntentId(paymentIntentId);
  if (!order) {
    console.error(`Order not found for PaymentIntent: ${paymentIntentId}`);
    return;
  }

  // Update order to failed
  await updateOrderStatus(paymentIntentId, 'failed');

  // Track payment failure event
  await trackEvent(EVENT_TYPES.PAYMENT_FAILED, {
    sessionId: order.session_id,
    eventData: {
      orderId: order.id,
      orderNumber: order.order_number,
      paymentIntentId,
      failureReason: paymentIntent.last_payment_error?.message,
    },
  });

  console.log(`❌ Payment failed for order ${order.order_number}`);
}
