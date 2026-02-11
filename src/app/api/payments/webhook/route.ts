import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  verifyWebhookSignature,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleSubscriptionCreated,
} from '@/lib/stripe/webhook.service';

export async function POST(request: NextRequest) {
  console.log('================================================================');
  console.log('[WebhookRoute] POST /api/payments/webhook HIT at', new Date().toISOString());
  console.log('================================================================');
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    console.log('[WebhookRoute] Body length:', body.length);
    console.log('[WebhookRoute] Has signature:', !!signature);

    if (!signature) {
      console.error('[WebhookRoute] MISSING stripe-signature header!');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const isDevBypass = webhookSecret === 'whsec_placeholder' || webhookSecret === '';
    if (isDevBypass) {
      console.warn('[WebhookRoute] DEV MODE: Skipping signature verification (STRIPE_WEBHOOK_SECRET is placeholder)');
      event = JSON.parse(body) as Stripe.Event;
      console.log('[WebhookRoute] Parsed event type:', event.type, 'ID:', event.id);
    } else {
      try {
        event = verifyWebhookSignature(body, signature);
      } catch (error: any) {
        console.error('[WebhookRoute] SIGNATURE VERIFICATION FAILED:', error.message);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    }

    // Log event for debugging
    console.log(`[WebhookRoute] Event verified: ${event.type} (ID: ${event.id})`);

    // Handle event
    switch (event.type) {
      // Payment Intent events (one-time payments)
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // Invoice events (subscription billing)
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Subscription lifecycle events
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Subscription Schedule lifecycle events
      case 'subscription_schedule.completed':
        console.log('Subscription schedule completed:', (event.data.object as any).id);
        break;

      case 'subscription_schedule.canceled':
        console.log('Subscription schedule canceled:', (event.data.object as any).id);
        break;

      default:
        console.log(`[WebhookRoute] Unhandled event type: ${event.type}`);
    }

    console.log(`[WebhookRoute] Event ${event.type} processed successfully. Returning 200.`);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[WebhookRoute] UNHANDLED ERROR in webhook processing:', error.message);
    console.error('[WebhookRoute] Stack:', error.stack);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for raw body access
export const runtime = 'nodejs';
