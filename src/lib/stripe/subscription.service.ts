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
import type { PricingTier, BillingInterval } from '@/config/pricing.config';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateSubscriptionParams {
  email: string;
  sessionId?: string;
  stripePriceId: string;
  billingInterval: BillingInterval;
  discountAmountCents: number;       // One-time discount for first invoice
  initialAmountCents: number;        // What customer pays on first invoice
  recurringAmountCents: number;      // Full recurring price
  productName: string;
  pricingTier: PricingTier;          // For metadata tracking
  resultId?: string;
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

  // Create customer in our database
  if (!customer) {
    customer = await createCustomer({
      email,
      stripeCustomerId: stripeCustomer.id,
      firstSessionId: data.sessionId,
    });
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
 * Create a new subscription with tier-specific introductory discount
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResult> {
  const {
    email,
    sessionId,
    stripePriceId,
    billingInterval,
    discountAmountCents,
    initialAmountCents,
    recurringAmountCents,
    productName,
    pricingTier,
    resultId,
  } = params;

  // 1. Find or create customer
  const { customer, stripeCustomer } = await findOrCreateCustomer({
    email,
    sessionId,
  });

  // 2. Create subscription in Stripe
  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: stripeCustomer.id,
    items: [{ price: stripePriceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      customer_id: customer.id,
      session_id: sessionId || '',
      result_id: resultId || '',
      product_name: productName,
      pricing_tier: pricingTier,
      initial_amount_cents: String(initialAmountCents),
      recurring_amount_cents: String(recurringAmountCents),
    },
  };

  // Apply introductory discount as invoice item if specified
  if (discountAmountCents && discountAmountCents > 0) {
    // Add a negative invoice item to apply the discount to the first invoice
    subscriptionParams.add_invoice_items = [
      {
        price_data: {
          currency: 'czk',
          // @ts-expect-error: product_data is supported by API but missing in types
          product_data: {
            name: 'Uvodni sleva',
          },
          unit_amount: -discountAmountCents, // Negative amount for discount
        },
      },
    ];
  }

  const stripeSubscription = await stripe.subscriptions.create(subscriptionParams);

  // 3. Extract client secret from the payment intent
  const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent;

  if (!paymentIntent?.client_secret) {
    throw new Error('Failed to get payment intent client secret');
  }

  // 4. Create subscription record in our database
  const subscriptionInsertData: SubscriptionInsert = {
    customer_id: customer.id,
    stripe_subscription_id: stripeSubscription.id,
    status: stripeSubscription.status,
    stripe_price_id: stripePriceId,
    billing_interval: billingInterval,
    current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
  };

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert(subscriptionInsertData)
    .select()
    .single();

  if (subscriptionError || !subscription) {
    // Log error but don't fail - subscription exists in Stripe
    console.error('Failed to create subscription record:', subscriptionError);
    throw new Error(`Failed to create subscription record: ${subscriptionError?.message || 'No data returned'}`);
  }

  // 5. Create initial order record linked to subscription
  const orderNumber = await generateOrderNumber();
  const orderInsertData: OrderInsert = {
    session_id: sessionId || '', // Required field - use empty string if no session
    result_id: resultId || null,
    subscription_id: subscription.id,
    order_number: orderNumber,
    status: 'pending',
    product_id: stripePriceId,
    product_name: productName,
    amount_cents: invoice.amount_due,
    currency: 'czk',
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id: stripeCustomer.id,
    customer_email: email,
  };
  await supabase.from('orders').insert(orderInsertData);

  return {
    subscriptionId: subscription.id,
    stripeSubscriptionId: stripeSubscription.id,
    clientSecret: paymentIntent.client_secret,
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
  const updates: SubscriptionUpdate = {
    status: stripeSubscription.status,
    current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
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
  const paymentIntent = (invoice as any).payment_intent as string | Stripe.PaymentIntent | null;
  const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;

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
