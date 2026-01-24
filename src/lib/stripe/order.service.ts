import { supabase } from '@/lib/supabase/client';
import type { Order, OrderInsert } from '@/types';

export async function generateOrderNumber(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function createOrder(data: {
  sessionId: string;
  resultId: string;
  productId: string;
  productName: string;
  amountCents: number;
  stripePaymentIntentId: string;
  customerEmail?: string;
}): Promise<Order> {
  const orderNumber = await generateOrderNumber();

  const orderData: OrderInsert = {
    session_id: data.sessionId,
    result_id: data.resultId,
    order_number: orderNumber,
    status: 'pending',
    product_id: data.productId,
    product_name: data.productName,
    amount_cents: data.amountCents,
    currency: 'usd',
    stripe_payment_intent_id: data.stripePaymentIntentId,
    customer_email: data.customerEmail,
  };

  const { data: order, error } = await supabase
    .from('orders')
    .insert(orderData as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return order as Order;
}

export async function updateOrderStatus(
  paymentIntentId: string,
  status: 'paid' | 'failed' | 'refunded',
  paymentDetails?: {
    chargeId?: string;
    customerId?: string;
    paymentMethodType?: string;
    cardLast4?: string;
    cardBrand?: string;
  }
): Promise<void> {
  const updates: any = {
    status,
  };

  if (status === 'paid') {
    updates.paid_at = new Date().toISOString();
  } else if (status === 'refunded') {
    updates.refunded_at = new Date().toISOString();
  }

  if (paymentDetails) {
    Object.assign(updates, {
      stripe_charge_id: paymentDetails.chargeId,
      stripe_customer_id: paymentDetails.customerId,
      payment_method_type: paymentDetails.paymentMethodType,
      card_last4: paymentDetails.cardLast4,
      card_brand: paymentDetails.cardBrand,
    });
  }

  const { error } = await (supabase
    .from('orders')
    .update as any)(updates)
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (error) {
    throw new Error(`Failed to update order: ${error.message}`);
  }
}

export async function getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (error) return null;
  return data as Order;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data as Order;
}
