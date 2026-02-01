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
    // Note: using 'as any' since subscriptions table types are newly added
    const { data: subscription, error } = await supabase
      .from('subscriptions' as any)
      .select('status, stripe_subscription_id')
      .eq('id', subscriptionId)
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Type assertion for newly added subscriptions table
    const sub = subscription as { status: string; stripe_subscription_id: string };

    return NextResponse.json({
      status: sub.status,
      stripeSubscriptionId: sub.stripe_subscription_id,
    });
  } catch (error: any) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
