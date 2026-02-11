import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from './stripe.config';
import { updateOrderStatus, getOrderByPaymentIntentId } from './order.service';
import {
  getSubscriptionByStripeId,
  updateSubscriptionFromWebhook,
  createOrderForSubscriptionInvoice,
  findCustomerByStripeId,
  getPhaseInterval,
  getPaymentIntentIdFromInvoice,
} from './subscription.service';
import { trackEvent, EVENT_TYPES } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase/client';
import type { PlanDuration } from '@/config/pricing.config';

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
 * Extract subscription ID from invoice parent (new Stripe SDK structure)
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === 'string' ? sub : sub.id;
}

/**
 * Migrate a subscription to a Subscription Schedule with a second phase
 * for the recurring price. Called after the first invoice is paid.
 */
async function migrateToSchedule(stripeSubscriptionId: string): Promise<void> {
  // Retrieve the subscription to get metadata
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const recurringPriceId = sub.metadata?.recurring_stripe_price_id;
  const planDuration = sub.metadata?.plan_duration as PlanDuration | undefined;

  if (!recurringPriceId || !planDuration) {
    console.log('[ScheduleMigration] No recurring price or plan duration in metadata, skipping schedule migration');
    return;
  }

  // Check if intro and recurring prices are the same (FULL_PRICE tier)
  // In that case, no schedule needed — the subscription already has the correct price
  const currentPriceId = sub.items.data[0]?.price?.id;
  if (currentPriceId === recurringPriceId) {
    console.log('[ScheduleMigration] Intro price equals recurring price, no schedule needed');
    return;
  }

  // Check if subscription already has a schedule (idempotency)
  if (sub.schedule) {
    console.log('[ScheduleMigration] Subscription already has a schedule, skipping');
    return;
  }

  try {
    // Step 1: Migrate the existing subscription to a schedule
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: stripeSubscriptionId,
    });

    console.log('[ScheduleMigration] Created schedule from subscription:', {
      scheduleId: schedule.id,
      phases: schedule.phases.length,
    });

    // Step 2: Update the schedule to add phase 2 (recurring price)
    // The schedule now has one phase (current intro price).
    // We need to preserve it and add the recurring phase after it.
    const currentPhase = schedule.phases[0]!;
    const phaseInterval = getPhaseInterval(planDuration);

    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'release',
      phases: [
        // Phase 1: Keep current intro phase (must re-specify it)
        {
          items: [{ price: currentPriceId!, quantity: 1 }],
          start_date: currentPhase.start_date,
          end_date: currentPhase.end_date,
          metadata: {
            phase: 'introductory',
            pricing_tier: sub.metadata?.pricing_tier || '',
          },
        },
        // Phase 2: Recurring price (one cycle, then released as standalone sub)
        {
          items: [{ price: recurringPriceId, quantity: 1 }],
          duration: phaseInterval,
          billing_cycle_anchor: 'phase_start',
          proration_behavior: 'none',
          metadata: {
            phase: 'recurring',
          },
        },
      ],
    });

    console.log('[ScheduleMigration] Schedule updated with recurring phase:', {
      scheduleId: schedule.id,
      recurringPriceId,
      phaseInterval,
    });
  } catch (error: any) {
    // Log but don't throw — the payment succeeded, schedule migration is non-critical
    console.error('[ScheduleMigration] Failed to migrate subscription to schedule:', {
      subscriptionId: stripeSubscriptionId,
      error: error.message,
    });
  }
}

/**
 * Handle invoice.paid event
 * - For initial invoices: updates order to paid + migrates to schedule
 * - For renewals: creates order record
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  // Only process subscription invoices
  if (!subscriptionId) {
    console.log('Invoice is not for a subscription, skipping');
    return;
  }

  // Check if this is the initial subscription invoice
  if (invoice.billing_reason === 'subscription_create') {
    console.log('Initial subscription invoice paid, updating order and migrating to schedule');
    const paymentIntentId = getPaymentIntentIdFromInvoice(invoice);

    if (paymentIntentId) {
      const order = await getOrderByPaymentIntentId(paymentIntentId);
      if (order && order.status === 'pending') {
        await updateOrderStatus(paymentIntentId, 'paid');
        console.log(`Initial subscription invoice paid for order ${order.order_number}`);
      }
    }

    // Update session completed_purchase flag
    const subscription = await getSubscriptionByStripeId(subscriptionId);
    if (subscription) {
      const { data: orders } = await supabase
        .from('orders')
        .select('session_id')
        .eq('subscription_id', subscription.id)
        .limit(1);
      const sessionId = orders?.[0]?.session_id;
      if (sessionId) {
        await supabase
          .from('quiz_sessions')
          .update({ completed_purchase: true })
          .eq('id', sessionId);
      }
    }

    // Migrate to subscription schedule for phase 2 (recurring price)
    await migrateToSchedule(subscriptionId);

    // Track event
    const customer = await findCustomerByStripeId(invoice.customer as string);
    await trackEvent(EVENT_TYPES.INVOICE_PAID, {
      eventData: {
        stripeSubscriptionId: subscriptionId,
        invoiceId: invoice.id,
        amountPaid: invoice.amount_paid,
        billingReason: invoice.billing_reason,
        customerId: customer?.id,
      },
    });
    return;
  }

  // Renewal invoice — get subscription from our database
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
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

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
  const firstItem = stripeSubscription.items?.data?.[0];
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : undefined;

  const customer = await findCustomerByStripeId(stripeSubscription.customer as string);
  await trackEvent(EVENT_TYPES.SUBSCRIPTION_UPDATED, {
    eventData: {
      subscriptionId: subscription.id,
      stripeSubscriptionId: subscriptionId,
      status: stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodEnd: periodEnd,
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
