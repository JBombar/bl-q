import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from './stripe.config';
import { updateOrderStatus, getOrderByPaymentIntentId } from './order.service';
import {
  getSubscriptionByStripeId,
  updateSubscriptionFromWebhook,
  createOrderForSubscriptionInvoice,
  findCustomerByStripeId,
} from './subscription.service';
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
  await supabase
    .from('quiz_sessions')
    .update({ completed_purchase: true })
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

// ============================================================================
// SUBSCRIPTION WEBHOOK HANDLERS
// ============================================================================

/**
 * Handle invoice.paid event
 * Creates order record for subscription renewals
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription as string | null;

  // Only process subscription invoices
  if (!subscriptionId) {
    console.log('Invoice is not for a subscription, skipping');
    return;
  }

  // Check if this is the initial subscription invoice (already handled during creation)
  if (invoice.billing_reason === 'subscription_create') {
    console.log('Initial subscription invoice, updating order to paid');
    // Update the existing pending order to paid
    const paymentIntent = (invoice as any).payment_intent as string | Stripe.PaymentIntent | null;
    const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;

    if (paymentIntentId) {
      const order = await getOrderByPaymentIntentId(paymentIntentId);
      if (order && order.status === 'pending') {
        await updateOrderStatus(paymentIntentId, 'paid');
        console.log(`✅ Initial subscription invoice paid for order ${order.order_number}`);
      }
    }
    return;
  }

  // Get subscription from our database
  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error(`Subscription not found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // Create order record for this renewal payment
  await createOrderForSubscriptionInvoice(invoice, subscription);

  // Track invoice paid event
  const customer = await findCustomerByStripeId(invoice.customer as string);
  await trackEvent(EVENT_TYPES.INVOICE_PAID, {
    eventData: {
      subscriptionId: subscription.id,
      stripeSubscriptionId: subscriptionId,
      invoiceId: invoice.id,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      billingReason: invoice.billing_reason,
      customerId: customer?.id,
    },
  });

  console.log(`✅ Invoice paid for subscription ${subscriptionId} (${invoice.billing_reason})`);
}

/**
 * Handle invoice.payment_failed event
 * Tracks failed subscription payment attempts
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription as string | null;

  if (!subscriptionId) {
    console.log('Invoice is not for a subscription, skipping');
    return;
  }

  // Get subscription from our database
  const subscription = await getSubscriptionByStripeId(subscriptionId);

  // Track invoice payment failed event
  const customer = await findCustomerByStripeId(invoice.customer as string);
  await trackEvent(EVENT_TYPES.INVOICE_PAYMENT_FAILED, {
    eventData: {
      subscriptionId: subscription?.id,
      stripeSubscriptionId: subscriptionId,
      invoiceId: invoice.id,
      amountDue: invoice.amount_due,
      currency: invoice.currency,
      attemptCount: invoice.attempt_count,
      customerId: customer?.id,
    },
  });

  console.log(`❌ Invoice payment failed for subscription ${subscriptionId}`);
}

/**
 * Handle customer.subscription.updated event
 * Syncs subscription status, period, and cancellation state
 */
export async function handleSubscriptionUpdated(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const subscriptionId = stripeSubscription.id;

  // Get subscription from our database
  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error(`Subscription not found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // Update subscription record
  await updateSubscriptionFromWebhook(stripeSubscription);

  // Track subscription updated event
  const customer = await findCustomerByStripeId(stripeSubscription.customer as string);
  await trackEvent(EVENT_TYPES.SUBSCRIPTION_UPDATED, {
    eventData: {
      subscriptionId: subscription.id,
      stripeSubscriptionId: subscriptionId,
      status: stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
      customerId: customer?.id,
    },
  });

  console.log(`🔄 Subscription updated: ${subscriptionId} -> ${stripeSubscription.status}`);
}

/**
 * Handle customer.subscription.deleted event
 * Updates subscription status to canceled
 */
export async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const subscriptionId = stripeSubscription.id;

  // Get subscription from our database
  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error(`Subscription not found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // Update subscription record to canceled
  await updateSubscriptionFromWebhook(stripeSubscription);

  // Track subscription canceled event
  const customer = await findCustomerByStripeId(stripeSubscription.customer as string);
  await trackEvent(EVENT_TYPES.SUBSCRIPTION_CANCELED, {
    eventData: {
      subscriptionId: subscription.id,
      stripeSubscriptionId: subscriptionId,
      customerId: customer?.id,
    },
  });

  console.log(`🚫 Subscription canceled: ${subscriptionId}`);
}

/**
 * Handle customer.subscription.created event
 * Confirms subscription was created successfully
 */
export async function handleSubscriptionCreated(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const subscriptionId = stripeSubscription.id;

  // Track subscription created event
  const customer = await findCustomerByStripeId(stripeSubscription.customer as string);
  await trackEvent(EVENT_TYPES.SUBSCRIPTION_CREATED, {
    eventData: {
      stripeSubscriptionId: subscriptionId,
      status: stripeSubscription.status,
      customerId: customer?.id,
    },
  });

  console.log(`✨ Subscription created: ${subscriptionId} (${stripeSubscription.status})`);
}
