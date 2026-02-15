/**
 * Subscription Status API Endpoint
 *
 * Returns the current status of a subscription for polling after payment.
 * Checks DB first; if still 'incomplete', also checks Stripe directly
 * (handles the case where webhooks haven't fired yet).
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { stripe } from '@/lib/stripe/stripe.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Get subscription status from our database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('status, stripe_subscription_id')
      .eq('id', subscriptionId)
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    let status = subscription.status;

    // If DB still shows 'incomplete', check Stripe directly as fallback
    // (webhook may not have fired yet, especially in local dev)
    if (status === 'incomplete' && subscription.stripe_subscription_id) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
        if (stripeSub.status !== 'incomplete') {
          status = stripeSub.status;
          // Update DB to stay in sync
          await supabase
            .from('subscriptions')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', subscriptionId);
        }
      } catch (stripeErr) {
        // If Stripe check fails, fall back to DB status
        console.error('[SubscriptionStatus] Stripe check failed:', stripeErr);
      }
    }

    return NextResponse.json({
      status,
      stripeSubscriptionId: subscription.stripe_subscription_id,
    });
  } catch (error: any) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
