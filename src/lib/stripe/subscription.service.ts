/**
 * Subscription Service
 * Handles customer and subscription management for recurring billing
 */

import { stripe } from './stripe.config';
import { supabase } from '@/lib/supabase/client';
import { generateOrderNumber } from './order.service';
import type Stripe from 'stripe';

// ============================================================================
// TYPES
// ============================================================================

export interface Customer {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  first_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  stripe_subscription_id: string;
  status: string;
  stripe_price_id: string;
  billing_interval: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionParams {
  email: string;
  sessionId?: string;
  stripePriceId: string;
  billingInterval: 'month' | 'year';
  discountAmountCents?: number; // One-time discount for first invoice
  productName: string;
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

  if (error) return null;
  return data as Customer;
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

  if (error) return null;
  return data as Customer;
}

/**
 * Create a new customer record in our database
 */
export async function createCustomer(data: {
  email: string;
  stripeCustomerId: string;
  firstSessionId?: string;
}): Promise<Customer> {
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      email: data.email.toLowerCase(),
      stripe_customer_id: data.stripeCustomerId,
      first_session_id: data.firstSessionId || null,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  return customer as Customer;
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
      .update({ stripe_customer_id: stripeCustomer.id } as any)
      .eq('id', customer.id);
    customer.stripe_customer_id = stripeCustomer.id;
  }

  return { customer, stripeCustomer };
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Create a new subscription with optional introductory discount
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
    productName,
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
    },
  };

  // Apply introductory discount as invoice item if specified
  if (discountAmountCents && discountAmountCents > 0) {
    // Add a negative invoice item to apply the discount to the first invoice
    subscriptionParams.add_invoice_items = [
      {
        price_data: {
          currency: 'czk',
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
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

  if (!paymentIntent?.client_secret) {
    throw new Error('Failed to get payment intent client secret');
  }

  // 4. Create subscription record in our database
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      customer_id: customer.id,
      stripe_subscription_id: stripeSubscription.id,
      status: stripeSubscription.status,
      stripe_price_id: stripePriceId,
      billing_interval: billingInterval,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    } as any)
    .select()
    .single();

  if (subscriptionError) {
    // Log error but don't fail - subscription exists in Stripe
    console.error('Failed to create subscription record:', subscriptionError);
    throw new Error(`Failed to create subscription record: ${subscriptionError.message}`);
  }

  // 5. Create initial order record linked to subscription
  const orderNumber = await generateOrderNumber();
  await supabase.from('orders').insert({
    session_id: sessionId || null,
    result_id: resultId || null,
    subscription_id: (subscription as Subscription).id,
    order_number: orderNumber,
    status: 'pending',
    product_id: stripePriceId,
    product_name: productName,
    amount_cents: invoice.amount_due,
    currency: 'czk',
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id: stripeCustomer.id,
    customer_email: email,
  } as any);

  return {
    subscriptionId: (subscription as Subscription).id,
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

  if (error) return null;
  return data as Subscription;
}

/**
 * Update subscription status and details from Stripe webhook
 */
export async function updateSubscriptionFromWebhook(
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const updates: Record<string, unknown> = {
    status: stripeSubscription.status,
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  if (stripeSubscription.canceled_at) {
    updates.canceled_at = new Date(stripeSubscription.canceled_at * 1000).toISOString();
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(updates as any)
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
  const paymentIntent = invoice.payment_intent as string | Stripe.PaymentIntent | null;
  const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;

  // Get customer email
  const { data: customer } = await supabase
    .from('customers')
    .select('email')
    .eq('id', subscription.customer_id)
    .single();

  const { error } = await supabase.from('orders').insert({
    subscription_id: subscription.id,
    order_number: orderNumber,
    status: invoice.status === 'paid' ? 'paid' : 'pending',
    product_id: subscription.stripe_price_id,
    product_name: `Subscription renewal - ${subscription.billing_interval}`,
    amount_cents: invoice.amount_paid || invoice.amount_due,
    currency: invoice.currency,
    stripe_payment_intent_id: paymentIntentId,
    stripe_customer_id: invoice.customer as string,
    customer_email: (customer as { email: string } | null)?.email || invoice.customer_email,
    paid_at: invoice.status === 'paid' ? new Date().toISOString() : null,
  } as any);

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

  if (error) {
    console.error('Failed to get customer subscriptions:', error);
    return [];
  }

  return data as Subscription[];
}
