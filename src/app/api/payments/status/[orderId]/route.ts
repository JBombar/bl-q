import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/services/session.service';
import { getOrderById } from '@/lib/stripe/order.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Validate session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const { orderId } = await params;

    // Get order
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order belongs to session
    if (order.session_id !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      status: order.status,
      amount: order.amount_cents,
      productName: order.product_name,
      paidAt: order.paid_at,
      createdAt: order.created_at,
    });
  } catch (error: any) {
    console.error('Get payment status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
