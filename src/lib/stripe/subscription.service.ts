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
import { UPSELL_MENTORING, type PricingTier, type BillingInterval, type PlanDuration } from '@/config/pricing.config';

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
  stripeCustomerId: string;
  status: string;
}

export interface AddUpsellParams {
  baseStripeSubscriptionId: string;
  sessionId?: string;
}

export interface AddUpsellResult {
  upsellSubscriptionId: string;
  stripeSubscriptionId: string;
  status: string;
  amountCharged: number;
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
      // Stripe customer was deleted externally — create a fresh one and update DB
      const newStripeCustomer = await stripe.customers.create({
        email,
        metadata: {
          session_id: data.sessionId || '',
          source: 'quiz_funnel',
          recreated: 'true',
        },
      });
      await supabase
        .from('customers')
        .update({ stripe_customer_id: newStripeCustomer.id })
        .eq('id', customer.id);
      customer.stripe_customer_id = newStripeCustomer.id;
      return { customer, stripeCustomer: newStripeCustomer };
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

  // 3. Idempotency guard: reuse existing incomplete subscription with same price
  //    Prevents duplicates from race conditions, network retries, or StrictMode double-fire
  const existingIncomplete = await stripe.subscriptions.list({
    customer: stripeCustomer.id,
    status: 'incomplete',
    expand: ['data.latest_invoice.confirmation_secret', 'data.latest_invoice.payments'],
    limit: 5,
  });

  // Cancel stale incomplete subscriptions from other sessions
  const staleSubs = existingIncomplete.data.filter(
    sub => sub.items.data[0]?.price?.id === introStripePriceId
      && sub.metadata?.session_id !== (sessionId || '')
  );
  for (const stale of staleSubs) {
    console.log('[Subscription] Canceling stale subscription from different session:', stale.id);
    await stripe.subscriptions.cancel(stale.id);
  }

  const matchingSub = existingIncomplete.data.find(
    sub => sub.items.data[0]?.price?.id === introStripePriceId
      && sub.metadata?.session_id === (sessionId || '')
  );

  if (matchingSub) {
    console.log('[Subscription] Found existing incomplete subscription:', matchingSub.id);

    const existingInvoice = matchingSub.latest_invoice as Stripe.Invoice;
    const existingClientSecret = existingInvoice?.confirmation_secret?.client_secret;

    if (existingClientSecret) {
      // Check if we already have a DB record for this subscription
      let existingDbSub = await getSubscriptionByStripeId(matchingSub.id);

      if (!existingDbSub) {
        // Create DB records if missing
        const firstItem = matchingSub.items.data[0];
        const periodStart = firstItem?.current_period_start
          ? new Date(firstItem.current_period_start * 1000).toISOString()
          : new Date().toISOString();
        const periodEnd = firstItem?.current_period_end
          ? new Date(firstItem.current_period_end * 1000).toISOString()
          : new Date().toISOString();

        const { data: newDbSub } = await supabase
          .from('subscriptions')
          .insert({
            customer_id: customer.id,
            stripe_subscription_id: matchingSub.id,
            status: matchingSub.status,
            stripe_price_id: introStripePriceId,
            billing_interval: billingInterval,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: matchingSub.cancel_at_period_end,
          } as SubscriptionInsert)
          .select()
          .single();

        existingDbSub = newDbSub;
      }

      if (existingDbSub) {
        console.log('[Subscription] Reusing incomplete subscription:', matchingSub.id);
        return {
          subscriptionId: existingDbSub.id,
          stripeSubscriptionId: matchingSub.id,
          clientSecret: existingClientSecret,
          customerId: customer.id,
          stripeCustomerId: stripeCustomer.id,
          status: matchingSub.status,
        };
      }
    }

    // If clientSecret is missing, cancel the stale subscription and create fresh
    console.log('[Subscription] Stale incomplete subscription, canceling:', matchingSub.id);
    await stripe.subscriptions.cancel(matchingSub.id);
  }

  // 4. Create subscription with payment_behavior: 'default_incomplete'
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
    stripeCustomerId: stripeCustomer.id,
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

// ============================================================================
// UPSELL MANAGEMENT
// ============================================================================

/**
 * Add the mentoring upsell as a separate subscription.
 *
 * Reuses the customer's saved payment method from the base subscription
 * so no second Payment Element is required — single-click charge.
 *
 * The existing migrateToSchedule() webhook handler will automatically
 * create a schedule for the upsell subscription (intro → recurring phases)
 * when its first invoice is paid.
 */
export async function addUpsellToSubscription(
  params: AddUpsellParams
): Promise<AddUpsellResult> {
  const { baseStripeSubscriptionId, sessionId } = params;

  // 1. Look up the base subscription in our DB
  const baseSubscription = await getSubscriptionByStripeId(baseStripeSubscriptionId);
  if (!baseSubscription) {
    throw new Error('Base subscription not found');
  }

  // 2. Get customer record
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', baseSubscription.customer_id)
    .single();

  if (customerError || !customer) {
    throw new Error('Customer not found');
  }

  // 3. Authorization: verify session owns this subscription
  if (sessionId) {
    const { data: sessionOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('subscription_id', baseSubscription.id)
      .eq('session_id', sessionId)
      .limit(1);

    if (!sessionOrders || sessionOrders.length === 0) {
      console.error('[Upsell] Session does not own this subscription:', {
        sessionId,
        subscriptionId: baseSubscription.id,
        customerId: customer.id,
      });
      throw new Error('Unauthorized: subscription does not belong to this session');
    }
  }

  // 4. Null safety: verify customer has a Stripe ID
  if (!customer.stripe_customer_id) {
    throw new Error('Customer has no Stripe ID. Cannot create upsell.');
  }

  // 5. Check for existing active upsell subscription (idempotency)
  const { data: existingUpsells } = await supabase
    .from('subscriptions')
    .select('id, stripe_subscription_id, status')
    .eq('customer_id', customer.id)
    .eq('stripe_price_id', UPSELL_MENTORING.introStripePriceId)
    .in('status', ['active', 'trialing', 'incomplete']);

  if (existingUpsells && existingUpsells.length > 0) {
    const existing = existingUpsells[0]!;
    console.log('[Upsell] Customer already has upsell subscription:', existing.stripe_subscription_id);
    return {
      upsellSubscriptionId: existing.id,
      stripeSubscriptionId: existing.stripe_subscription_id,
      status: existing.status,
      amountCharged: UPSELL_MENTORING.initialAmountCents,
    };
  }

  // 6. Validate upsell price IDs
  if (!UPSELL_MENTORING.introStripePriceId.startsWith('price_')) {
    throw new Error('Upsell intro price ID not configured. Check STRIPE_PRICE_UPSELL_MENTORING_INTRO env var.');
  }
  if (!UPSELL_MENTORING.recurringStripePriceId.startsWith('price_')) {
    throw new Error('Upsell recurring price ID not configured. Check STRIPE_PRICE_UPSELL_MENTORING_RECURRING env var.');
  }

  // 7. Retrieve the customer's saved default payment method from Stripe
  let stripeCustomer = await stripe.customers.retrieve(customer.stripe_customer_id);
  if (stripeCustomer.deleted) {
    // Stripe customer was deleted externally — create a fresh one and update DB
    const newStripeCustomer = await stripe.customers.create({
      email: customer.email,
      metadata: {
        session_id: sessionId || '',
        source: 'quiz_funnel',
        recreated: 'true',
      },
    });
    await supabase
      .from('customers')
      .update({ stripe_customer_id: newStripeCustomer.id })
      .eq('id', customer.id);
    customer.stripe_customer_id = newStripeCustomer.id;
    stripeCustomer = newStripeCustomer;
  }

  let paymentMethodId: string | null = null;

  // Primary: customer's invoice_settings.default_payment_method (always attached)
  const customerDefaultPm = (stripeCustomer as Stripe.Customer).invoice_settings?.default_payment_method;
  if (customerDefaultPm) {
    paymentMethodId = typeof customerDefaultPm === 'string' ? customerDefaultPm : customerDefaultPm.id;
  }

  // Fallback: list payment methods attached to the customer
  if (!paymentMethodId) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.stripe_customer_id,
      type: 'card',
      limit: 1,
    });
    paymentMethodId = paymentMethods.data[0]?.id || null;
  }

  if (!paymentMethodId) {
    throw new Error('No default payment method found for this customer.');
  }

  console.log('[Upsell] Using payment method:', paymentMethodId);

  // 8. Create the upsell subscription (auto-charge, no Payment Element)
  console.log('[Upsell] Creating upsell subscription:', {
    customer: customer.stripe_customer_id,
    introPrice: UPSELL_MENTORING.introStripePriceId,
    paymentMethod: paymentMethodId,
  });

  const upsellStripeSubscription = await stripe.subscriptions.create({
    customer: customer.stripe_customer_id,
    items: [{ price: UPSELL_MENTORING.introStripePriceId }],
    default_payment_method: paymentMethodId,
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payments'],
    metadata: {
      type: 'upsell',
      customer_id: customer.id,
      parent_subscription_id: baseStripeSubscriptionId,
      session_id: sessionId || '',
      product_name: UPSELL_MENTORING.productName,
      plan_duration: UPSELL_MENTORING.planDuration,
      recurring_stripe_price_id: UPSELL_MENTORING.recurringStripePriceId,
      initial_amount_cents: String(UPSELL_MENTORING.initialAmountCents),
      recurring_amount_cents: String(UPSELL_MENTORING.recurringAmountCents),
    },
  });

  console.log('[Upsell] Created:', {
    subscriptionId: upsellStripeSubscription.id,
    status: upsellStripeSubscription.status,
  });

  // Check if charge succeeded
  if (upsellStripeSubscription.status === 'incomplete') {
    await stripe.subscriptions.cancel(upsellStripeSubscription.id);
    throw new Error('Payment failed for upsell. Please check your payment method.');
  }

  // 9. Get period info from subscription items
  const firstItem = upsellStripeSubscription.items.data[0];
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000).toISOString()
    : new Date().toISOString();
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : new Date().toISOString();

  // 10. Save upsell subscription record (rollback Stripe sub if DB fails)
  const upsellInsertData: SubscriptionInsert = {
    customer_id: customer.id,
    stripe_subscription_id: upsellStripeSubscription.id,
    status: upsellStripeSubscription.status,
    stripe_price_id: UPSELL_MENTORING.introStripePriceId,
    billing_interval: UPSELL_MENTORING.billingInterval,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: upsellStripeSubscription.cancel_at_period_end,
  };

  const { data: upsellSubscription, error: upsellSubError } = await supabase
    .from('subscriptions')
    .insert(upsellInsertData)
    .select()
    .single();

  if (upsellSubError || !upsellSubscription) {
    console.error('[Upsell] DB insert failed, canceling Stripe subscription:', upsellSubError);
    await stripe.subscriptions.cancel(upsellStripeSubscription.id).catch(e =>
      console.error('[Upsell] Failed to cancel orphaned Stripe subscription:', e.message)
    );
    throw new Error('Failed to create upsell record. Payment has been reversed.');
  }

  // 11. Create initial order for the upsell
  const invoice = upsellStripeSubscription.latest_invoice as Stripe.Invoice;
  const upsellPaymentIntentId = invoice ? getPaymentIntentIdFromInvoice(invoice) : null;
  const orderNumber = await generateOrderNumber();

  const upsellOrderData: OrderInsert = {
    session_id: sessionId || '',
    subscription_id: upsellSubscription.id,
    order_number: orderNumber,
    status: upsellStripeSubscription.status === 'active' ? 'paid' : 'pending',
    product_id: UPSELL_MENTORING.introStripePriceId,
    product_name: UPSELL_MENTORING.productName,
    amount_cents: UPSELL_MENTORING.initialAmountCents,
    currency: 'czk',
    stripe_payment_intent_id: upsellPaymentIntentId || null,
    stripe_customer_id: customer.stripe_customer_id,
    customer_email: customer.email,
    paid_at: upsellStripeSubscription.status === 'active' ? new Date().toISOString() : null,
  };

  const { error: orderError } = await supabase.from('orders').insert(upsellOrderData);
  if (orderError) {
    console.error('[Upsell] Failed to create order record (subscription is active):', orderError);
    // Don't throw — the subscription and charge succeeded. Order will be reconciled via webhook.
  }

  console.log(`[Upsell] Complete: ${upsellStripeSubscription.id} (${upsellStripeSubscription.status})`);

  return {
    upsellSubscriptionId: upsellSubscription.id,
    stripeSubscriptionId: upsellStripeSubscription.id,
    status: upsellStripeSubscription.status,
    amountCharged: UPSELL_MENTORING.initialAmountCents,
  };
}
