import { stripe } from './stripe.config';

interface CreatePaymentIntentParams {
  sessionId: string;
  resultId: string;
  amount: number; // in cents
  productId: string;
  productName: string;
  customerEmail?: string;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const {
    sessionId,
    resultId,
    amount,
    productId,
    productName,
    customerEmail,
  } = params;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        session_id: sessionId,
        result_id: resultId,
        product_id: productId,
        product_name: productName,
      },
      receipt_email: customerEmail,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error('Failed to create PaymentIntent:', error);
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
}

export async function getPaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error: any) {
    console.error('Failed to retrieve PaymentIntent:', error);
    throw new Error(`Payment intent retrieval failed: ${error.message}`);
  }
}

export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (error: any) {
    console.error('Failed to cancel PaymentIntent:', error);
    throw new Error(`Payment intent cancellation failed: ${error.message}`);
  }
}
