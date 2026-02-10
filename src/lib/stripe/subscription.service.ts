/**
 * Subscription Service
 * Handles customer and subscription management for recurring billing
 */

import { stripe } from './stripe.config';
import { supabase } from '@/lib/supabase/client';
import { generateOrderNumber } from './order.service';
import type Stripe from 'stripe';
import type {
  Customer,
  Subscription,
  CustomerInsert,
  SubscriptionInsert,
  SubscriptionUpdate,
  OrderInsert,
} from '@/types';
import type { PricingTier, BillingInterval, PlanDuration } from '@/config/pricing.config';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateSubscriptionParams {
  email: string;
  sessionId?: string;
  introStripePriceId: string;        // Phase 1: introductory price
  recurringStripePriceId: string;    // Phase 2: standard recurring price
  billingInterval: BillingInterval;
  initialAmountCents: number;        // What customer pays on first invoice
  recurringAmountCents: number;      // Full recurring price
  productName: string;
  pricingTier: PricingTier;          // For metadata tracking
  resultId?: string;
  planDuration: PlanDuration;        // Needed for phase interval mapping
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  stripeSubscriptionId: string;
  clientSecret: string;
  customerId: string;
  status: string;
}

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Find customer by email
 */
export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Find customer by Stripe customer ID
 */
export async function findCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Create a new customer record in our database
 */
export async function createCustomer(data: {
  email: string;
  stripeCustomerId: string;
  firstSessionId?: string;
}): Promise<Customer> {
  const insertData: CustomerInsert = {
    email: data.email.toLowerCase(),
    stripe_customer_id: data.stripeCustomerId,
    first_session_id: data.firstSessionId || null,
  };

  const { data: customer, error } = await supabase
    .from('customers')
    .insert(insertData)
    .select()
    .single();

  if (error || !customer) {
    throw new Error(`Failed to create customer: ${error?.message || 'No data returned'}`);
  }

  return customer;
}

/**
 * Find or create a customer (both in Stripe and our database)
 */
export async function findOrCreateCustomer(data: {
  email: string;
  sessionId?: string;
}): Promise<{ customer: Customer; stripeCustomer: Stripe.Customer }> {
  const email = data.email.toLowerCase();

  // Check if customer exists in our database
  let customer = await findCustomerByEmail(email);

  if (customer && customer.stripe_customer_id) {
    // Customer exists, retrieve Stripe customer
    const stripeCustomer = await stripe.customers.retrieve(customer.stripe_customer_id);
    if (stripeCustomer.deleted) {
      throw new Error('Stripe customer has been deleted');
    }
    return { customer, stripeCustomer: stripeCustomer as Stripe.Customer };
  }

  // Create new Stripe customer
  const stripeCustomer = await stripe.customers.create({
    email,
    metadata: {
      session_id: data.sessionId || '',
      source: 'quiz_funnel',
    },
  });

  // Create customer in our database (use upsert to handle concurrent requests)
  if (!customer) {
    const { data: upsertedCustomer, error: upsertError } = await supabase
      .from('customers')
      .upsert(
        {
          email,
          stripe_customer_id: stripeCustomer.id,
          first_session_id: data.sessionId || null,
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (upsertError || !upsertedCustomer) {
      throw new Error(`Failed to create customer: ${upsertError?.message || 'No data returned'}`);
    }
    customer = upsertedCustomer;
  } else {
    // Update existing customer with Stripe ID
    await supabase
      .from('customers')
      .update({ stripe_customer_id: stripeCustomer.id })
      .eq('id', customer.id);
    customer.stripe_customer_id = stripeCustomer.id;
  }

  return { customer, stripeCustomer };
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Map plan duration to the Stripe phase duration object.
 * Used when migrating a subscription to a schedule after first payment.
 */
export function getPhaseInterval(planDuration: PlanDuration): { interval: 'month'; interval_count: number } {
  switch (planDuration) {
    case '7_days':   return { interval: 'month', interval_count: 1 };
    case '1_month':  return { interval: 'month', interval_count: 1 };
    case '3_months': return { interval: 'month', interval_count: 3 };
  }
}

/**
 * Extract PaymentIntent ID from an invoice's payments list (new Stripe SDK structure).
 */
export function getPaymentIntentIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const payments = invoice.payments as Stripe.ApiList<Stripe.InvoicePayment> | undefined;
  const payment = payments?.data?.[0]?.payment;
  if (payment?.type !== 'payment_intent' || !payment.payment_intent) return null;
  return typeof payment.payment_intent === 'string' ? payment.payment_intent : payment.payment_intent.id;
}

/**
 * Create a new subscription using stripe.subscriptions.create() with
 * payment_behavior: 'default_incomplete'.
 *
 * This creates the subscription in 'incomplete' status and returns a
 * confirmation_secret.client_secret for the frontend Payment Element.
 *
 * After the first invoice is paid, a webhook handler migrates the subscription
 * to a Subscription Schedule to transition from the intro price to the
 * recurring price.
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResult> {
  const {
    email,
    sessionId,
    introStripePriceId,
    recurringStripePriceId,
    billingInterval,
    initialAmountCents,
    recurringAmountCents,
    productName,
    pricingTier,
    resultId,
    planDuration,
  } = params;

  // 1. Find or create customer
  const { customer, stripeCustomer } = await findOrCreateCustomer({
    email,
    sessionId,
  });

  // 2. Validate Stripe price IDs before making the API call
  if (introStripePriceId.includes('placeholder')) {
    throw new Error(
      `Invalid introductory Stripe Price ID: "${introStripePriceId}". ` +
      `Check STRIPE_PRICE_* env vars for plan "${planDuration}" tier "${pricingTier}".`
    );
  }
  if (recurringStripePriceId.includes('placeholder')) {
    throw new Error(
      `Invalid recurring Stripe Price ID: "${recurringStripePriceId}". ` +
      `Check STRIPE_PRICE_MONTHLY_995 / STRIPE_PRICE_QUARTERLY_2395 env vars.`
    );
  }

  // 3. Create subscription with payment_behavior: 'default_incomplete'
  //    This creates an incomplete subscription with a confirmation_secret
  //    that the frontend uses for the Payment Element.
  console.log('[Subscription] Creating subscription:', {
    customer: stripeCustomer.id,
    introPrice: introStripePriceId,
    recurringPrice: recurringStripePriceId,
    pricingTier,
    planDuration,
  });

  const stripeSubscription = await stripe.subscriptions.create({
    customer: stripeCustomer.id,
    items: [{ price: introStripePriceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.confirmation_secret', 'latest_invoice.payments'],
    metadata: {
      customer_id: customer.id,
      session_id: sessionId || '',
      result_id: resultId || '',
      product_name: productName,
      pricing_tier: pricingTier,
      plan_duration: planDuration,
      recurring_stripe_price_id: recurringStripePriceId,
      initial_amount_cents: String(initialAmountCents),
      recurring_amount_cents: String(recurringAmountCents),
    },
  });

  console.log('[Subscription] Created:', {
    subscriptionId: stripeSubscription.id,
    status: stripeSubscription.status,
  });

  // 4. Extract client_secret from the invoice's confirmation_secret
  const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;

  console.log('[Subscription] Invoice:', {
    invoiceId: invoice?.id,
    status: invoice?.status,
    hasConfirmationSecret: !!invoice?.confirmation_secret,
  });

  const clientSecret = invoice?.confirmation_secret?.client_secret;

  if (!clientSecret) {
    console.error('[Subscription] No client_secret on invoice:', {
      invoiceId: invoice?.id,
      invoiceStatus: invoice?.status,
      confirmationSecret: invoice?.confirmation_secret,
    });
    throw new Error(
      `Failed to get client_secret. Invoice: ${invoice?.id} (${invoice?.status})`
    );
  }

  // Extract PaymentIntent ID from invoice payments for order tracking
  const paymentIntentId = invoice ? getPaymentIntentIdFromInvoice(invoice) : null;

  // 5. Get current period from subscription items (new SDK: period is on items, not subscription)
  const firstItem = stripeSubscription.items.data[0];
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000).toISOString()
    : new Date().toISOString();
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : new Date().toISOString();

  // 6. Create subscription record in our database
  const subscriptionInsertData: SubscriptionInsert = {
    customer_id: customer.id,
    stripe_subscription_id: stripeSubscription.id,
    status: stripeSubscription.status,
    stripe_price_id: introStripePriceId,
    billing_interval: billingInterval,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
  };

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert(subscriptionInsertData)
    .select()
    .single();

  if (subscriptionError || !subscription) {
    console.error('Failed to create subscription record:', subscriptionError);
    throw new Error(`Failed to create subscription record: ${subscriptionError?.message || 'No data returned'}`);
  }

  // 7. Create initial order record linked to subscription
  const orderNumber = await generateOrderNumber();
  const orderInsertData: OrderInsert = {
    session_id: sessionId || '',
    result_id: resultId || null,
    subscription_id: subscription.id,
    order_number: orderNumber,
    status: 'pending',
    product_id: introStripePriceId,
    product_name: productName,
    amount_cents: invoice.amount_due,
    currency: 'czk',
    stripe_payment_intent_id: paymentIntentId || null,
    stripe_customer_id: stripeCustomer.id,
    customer_email: email,
  };
  await supabase.from('orders').insert(orderInsertData);

  return {
    subscriptionId: subscription.id,
    stripeSubscriptionId: stripeSubscription.id,
    clientSecret,
    customerId: customer.id,
    status: stripeSubscription.status,
  };
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Update subscription status and details from Stripe webhook
 */
export async function updateSubscriptionFromWebhook(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  // Get current period from subscription items (new SDK: period is on items, not subscription)
  const firstItem = stripeSubscription.items?.data?.[0];
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000).toISOString()
    : undefined;
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : undefined;

  const updates: SubscriptionUpdate = {
    status: stripeSubscription.status,
    ...(periodStart && { current_period_start: periodStart }),
    ...(periodEnd && { current_period_end: periodEnd }),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  if (stripeSubscription.canceled_at) {
    updates.canceled_at = new Date(stripeSubscription.canceled_at * 1000).toISOString();
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('stripe_subscription_id', stripeSubscription.id);

  if (error) {
    console.error('Failed to update subscription:', error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}

/**
 * Create order record for subscription invoice payment
 */
export async function createOrderForSubscriptionInvoice(
  invoice: Stripe.Invoice,
  subscription: Subscription
): Promise<void> {
  const orderNumber = await generateOrderNumber();

  // Extract payment intent ID from invoice payments (new Stripe SDK structure)
  const invoicePayments = invoice.payments as Stripe.ApiList<Stripe.InvoicePayment> | undefined;
  const paymentDetail = invoicePayments?.data?.[0]?.payment;
  const paymentIntentId = paymentDetail?.type === 'payment_intent'
    ? (typeof paymentDetail.payment_intent === 'string'
        ? paymentDetail.payment_intent
        : paymentDetail.payment_intent?.id)
    : undefined;

  // Get customer email
  const { data: customer } = await supabase
    .from('customers')
    .select('email')
    .eq('id', subscription.customer_id)
    .single();

  const invoiceOrderInsertData: OrderInsert = {
    session_id: '', // Subscription renewal orders do not have a quiz session
    subscription_id: subscription.id,
    order_number: orderNumber,
    status: invoice.status === 'paid' ? 'paid' : 'pending',
    product_id: subscription.stripe_price_id,
    product_name: `Subscription renewal - ${subscription.billing_interval}`,
    amount_cents: invoice.amount_paid || invoice.amount_due,
    currency: invoice.currency,
    stripe_payment_intent_id: paymentIntentId,
    stripe_customer_id: invoice.customer as string,
    customer_email: customer?.email || invoice.customer_email || null,
    paid_at: invoice.status === 'paid' ? new Date().toISOString() : null,
  };

  const { error } = await supabase.from('orders').insert(invoiceOrderInsertData);

  if (error) {
    console.error('Failed to create order for invoice:', error);
    throw new Error(`Failed to create order for invoice: ${error.message}`);
  }
}

/**
 * Get customer's active subscriptions
 */
export async function getCustomerActiveSubscriptions(customerId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('customer_id', customerId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) {
      console.error('Failed to get customer subscriptions:', error);
    }
    return [];
  }

  return data;
}
