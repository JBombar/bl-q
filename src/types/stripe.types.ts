/**
 * Stripe integration types
 */

import type Stripe from 'stripe';

// ============================================================================
// PAYMENT INTENT METADATA
// ============================================================================

export interface PaymentIntentMetadata {
  sessionId: string;
  resultId: string;
  productId: string;
  quizId: string;
}

// ============================================================================
// WEBHOOK EVENT TYPES
// ============================================================================

export type StripeWebhookEvent =
  | Stripe.PaymentIntentSucceededEvent
  | Stripe.PaymentIntentPaymentFailedEvent
  | Stripe.ChargeSucceededEvent
  | Stripe.ChargeFailedEvent;

export interface WebhookPayload {
  event: StripeWebhookEvent;
  signature: string;
}

// ============================================================================
// PAYMENT METHOD INFO
// ============================================================================

export interface PaymentMethodInfo {
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}
