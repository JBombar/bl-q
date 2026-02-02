/**
 * Subscription Status API Endpoint
 *
 * Returns the current status of a subscription for polling after payment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

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

    if (error) {
      console.error('Database error fetching subscription:', error);
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: subscription.status,
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
