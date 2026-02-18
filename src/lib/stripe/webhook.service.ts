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
import { addToRegular, removeFromAbandoned } from '@/lib/services/smartemailing.service';
import { supabase } from '@/lib/supabase/client';
import type { PlanDuration } from '@/config/pricing.config';

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  console.log('[Webhook] verifyWebhookSignature called');
  console.log('[Webhook] STRIPE_WEBHOOK_SECRET starts with:', STRIPE_WEBHOOK_SECRET?.substring(0, 12) || '(empty)');
  console.log('[Webhook] signature starts with:', signature?.substring(0, 20) || '(empty)');
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
    console.log('[Webhook] Signature verified OK. Event type:', event.type, 'Event ID:', event.id);
    return event;
  } catch (error: any) {
    console.error('[Webhook] SIGNATURE VERIFICATION FAILED:', error.message);
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
  console.log('[DEBUG] getSubscriptionIdFromInvoice called. Invoice ID:', invoice.id);
  console.log('[DEBUG] invoice.parent:', JSON.stringify(invoice.parent, null, 2));
  console.log('[DEBUG] invoice.subscription (legacy field):', (invoice as any).subscription);
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) {
    console.log('[DEBUG] No subscription found in invoice.parent.subscription_details.subscription');
    // Fallback: check legacy field
    const legacySub = (invoice as any).subscription;
    if (legacySub) {
      const legacyId = typeof legacySub === 'string' ? legacySub : legacySub.id;
      console.log('[DEBUG] Found subscription via legacy field:', legacyId);
      return legacyId;
    }
    return null;
  }
  const subId = typeof sub === 'string' ? sub : sub.id;
  console.log('[DEBUG] Extracted subscription ID:', subId);
  return subId;
}

/**
 * Migrate a subscription to a Subscription Schedule with a second phase
 * for the recurring price. Called after the first invoice is paid.
 */
async function migrateToSchedule(stripeSubscriptionId: string): Promise<void> {
  console.log('========================================');
  console.log('[MigrateToSchedule] STARTING migration for subscription:', stripeSubscriptionId);
  console.log('========================================');

  // Step 1: Retrieve the subscription to get metadata
  console.log('[MigrateToSchedule] Step 1: Retrieving subscription from Stripe...');
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  console.log('[MigrateToSchedule] Subscription retrieved. Status:', sub.status);
  console.log('[MigrateToSchedule] Full metadata:', JSON.stringify(sub.metadata, null, 2));
  console.log('[MigrateToSchedule] Items count:', sub.items.data.length);
  console.log('[MigrateToSchedule] Current price ID:', sub.items.data[0]?.price?.id);
  console.log('[MigrateToSchedule] Schedule:', sub.schedule);

  const recurringPriceId = sub.metadata?.recurring_stripe_price_id;
  const planDuration = sub.metadata?.plan_duration as PlanDuration | undefined;
  console.log('[MigrateToSchedule] Extracted -> recurringPriceId:', recurringPriceId, '| planDuration:', planDuration);

  // Check 1: Required metadata present?
  if (!recurringPriceId || !planDuration) {
    console.error('[MigrateToSchedule] ABORT: Missing required metadata!');
    console.error('[MigrateToSchedule]   recurring_stripe_price_id:', recurringPriceId || '(MISSING)');
    console.error('[MigrateToSchedule]   plan_duration:', planDuration || '(MISSING)');
    return;
  }
  console.log('[MigrateToSchedule] CHECK 1 PASSED: Both metadata fields present');

  // Check 2: Intro and recurring prices different?
  const currentPriceId = sub.items.data[0]?.price?.id;
  console.log('[MigrateToSchedule] Comparing prices: current=', currentPriceId, 'vs recurring=', recurringPriceId);
  if (currentPriceId === recurringPriceId) {
    console.log('[MigrateToSchedule] SKIP: Intro price equals recurring price (FULL_PRICE tier). No schedule needed.');
    return;
  }
  console.log('[MigrateToSchedule] CHECK 2 PASSED: Prices differ, schedule needed');

  // Check 3: No existing schedule?
  if (sub.schedule) {
    console.log('[MigrateToSchedule] SKIP: Subscription already has schedule:', sub.schedule);
    return;
  }
  console.log('[MigrateToSchedule] CHECK 3 PASSED: No existing schedule');

  console.log('[MigrateToSchedule] All checks passed. Proceeding with schedule creation...');

  try {
    // Step 2: Create schedule from subscription
    console.log('[MigrateToSchedule] Step 2: Creating schedule from subscription...');
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: stripeSubscriptionId,
    });
    console.log('[MigrateToSchedule] Schedule created successfully:', {
      scheduleId: schedule.id,
      status: schedule.status,
      phasesCount: schedule.phases.length,
    });

    const currentPhase = schedule.phases[0]!;
    console.log('[MigrateToSchedule] Current phase details:', {
      startDate: currentPhase.start_date,
      endDate: currentPhase.end_date,
      itemsCount: currentPhase.items.length,
      firstItemPrice: currentPhase.items[0]?.price,
    });

    // Step 3: Calculate phase interval
    const phaseInterval = getPhaseInterval(planDuration);
    console.log('[MigrateToSchedule] Phase interval for', planDuration, ':', JSON.stringify(phaseInterval));

    // Step 4: Build the update payload
    const updatePayload = {
      end_behavior: 'release' as const,
      phases: [
        {
          items: [{ price: currentPriceId!, quantity: 1 }],
          start_date: currentPhase.start_date,
          end_date: currentPhase.end_date,
          metadata: {
            phase: 'introductory',
            pricing_tier: sub.metadata?.pricing_tier || '',
          },
        },
        {
          items: [{ price: recurringPriceId, quantity: 1 }],
          duration: phaseInterval,
          billing_cycle_anchor: 'phase_start' as const,
          proration_behavior: 'none' as const,
          metadata: {
            phase: 'recurring',
            pricing_tier: 'standard',
          },
        },
      ],
    };
    console.log('[MigrateToSchedule] Step 3: Updating schedule with payload:', JSON.stringify(updatePayload, null, 2));

    const updatedSchedule = await stripe.subscriptionSchedules.update(schedule.id, updatePayload);

    console.log('[MigrateToSchedule] SUCCESS! Schedule updated:', {
      scheduleId: updatedSchedule.id,
      status: updatedSchedule.status,
      phasesCount: updatedSchedule.phases.length,
      phase1Price: updatedSchedule.phases[0]?.items[0]?.price,
      phase1Start: updatedSchedule.phases[0]?.start_date,
      phase1End: updatedSchedule.phases[0]?.end_date,
      phase2Price: updatedSchedule.phases[1]?.items[0]?.price,
      phase2Start: updatedSchedule.phases[1]?.start_date,
      phase2End: updatedSchedule.phases[1]?.end_date,
    });
    console.log('========================================');
    console.log('[MigrateToSchedule] MIGRATION COMPLETE');
    console.log('========================================');

  } catch (error: any) {
    console.error('========================================');
    console.error('[MigrateToSchedule] CATASTROPHIC FAILURE!');
    console.error('[MigrateToSchedule] Error message:', error.message);
    console.error('[MigrateToSchedule] Error type:', error.type);
    console.error('[MigrateToSchedule] Error code:', error.code);
    console.error('[MigrateToSchedule] Error param:', error.param);
    console.error('[MigrateToSchedule] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('========================================');
  }
}

/**
 * Handle invoice.paid event
 * - For initial invoices: updates order to paid + migrates to schedule
 * - For renewals: creates order record
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.log('================================================================');
  console.log('[handleInvoicePaid] RECEIVED invoice.paid event');
  console.log('[handleInvoicePaid] Invoice ID:', invoice.id);
  console.log('[handleInvoicePaid] Billing Reason:', invoice.billing_reason);
  console.log('[handleInvoicePaid] Amount Paid:', invoice.amount_paid);
  console.log('[handleInvoicePaid] Currency:', invoice.currency);
  console.log('[handleInvoicePaid] Customer:', invoice.customer);
  console.log('[handleInvoicePaid] Status:', invoice.status);
  console.log('================================================================');

  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  // Only process subscription invoices
  if (!subscriptionId) {
    console.log('[handleInvoicePaid] No subscription ID found. Invoice is not for a subscription, skipping.');
    console.log('[handleInvoicePaid] invoice.parent:', JSON.stringify(invoice.parent));
    return;
  }
  console.log('[handleInvoicePaid] Subscription ID extracted:', subscriptionId);

  // Check if this is the initial subscription invoice
  console.log('[handleInvoicePaid] Checking billing_reason:', invoice.billing_reason);
  if (invoice.billing_reason === 'subscription_create') {
    console.log('[handleInvoicePaid] >>> This IS a subscription_create invoice. Will migrate to schedule.');

    const paymentIntentId = getPaymentIntentIdFromInvoice(invoice);
    console.log('[handleInvoicePaid] PaymentIntent ID from invoice:', paymentIntentId);

    if (paymentIntentId) {
      const order = await getOrderByPaymentIntentId(paymentIntentId);
      console.log('[handleInvoicePaid] Order lookup result:', order ? { id: order.id, orderNumber: order.order_number, status: order.status } : 'NOT FOUND');
      if (order && order.status === 'pending') {
        await updateOrderStatus(paymentIntentId, 'paid');
        console.log('[handleInvoicePaid] Order updated to paid:', order.order_number);
      } else if (order) {
        console.log('[handleInvoicePaid] Order already in status:', order.status);
      }
    } else {
      console.log('[handleInvoicePaid] No PaymentIntent ID found in invoice.payments');
      console.log('[handleInvoicePaid] invoice.payments:', JSON.stringify((invoice as any).payments, null, 2));
    }

    // Update session completed_purchase flag
    const subscription = await getSubscriptionByStripeId(subscriptionId);
    console.log('[handleInvoicePaid] DB subscription lookup:', subscription ? { id: subscription.id, status: subscription.status } : 'NOT FOUND');
    if (subscription) {
      const { data: orders } = await supabase
        .from('orders')
        .select('session_id')
        .eq('subscription_id', subscription.id)
        .limit(1);
      const sessionId = orders?.[0]?.session_id;
      console.log('[handleInvoicePaid] Session ID from order:', sessionId || '(none)');
      if (sessionId) {
        await supabase
          .from('quiz_sessions')
          .update({ completed_purchase: true })
          .eq('id', sessionId);
        console.log('[handleInvoicePaid] Session completed_purchase flag set');
      }
    }

    // Migrate to subscription schedule for phase 2 (recurring price)
    console.log('[handleInvoicePaid] >>> Now calling migrateToSchedule...');
    await migrateToSchedule(subscriptionId);
    console.log('[handleInvoicePaid] >>> migrateToSchedule returned');

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

    // Fire-and-forget: add to SmartEmailing "Regular" list
    if (customer?.email) {
      addToRegular(customer.email).catch(err =>
        console.error('[SmartEmailing] Failed to add to Regular:', err)
      );
      removeFromAbandoned(customer.email).catch(err =>
        console.error('[SmartEmailing] Failed to remove from Abandoned:', err)
      );
    }

    console.log('[handleInvoicePaid] Done processing subscription_create invoice.');
    return;
  }

  console.log('[handleInvoicePaid] This is NOT subscription_create. Billing reason:', invoice.billing_reason);

  // Renewal invoice — get subscription from our database
  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) {
    console.error(`[handleInvoicePaid] Subscription not found for Stripe ID: ${subscriptionId}`);
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
