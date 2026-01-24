# Stripe Integration - Quick Reference

This directory contains the Stripe payment integration for the quiz funnel application.

---

## Files

- **`stripe.config.ts`** - Stripe SDK initialization and configuration
- **`payment.service.ts`** - PaymentIntent creation and management
- **`order.service.ts`** - Order creation and status updates (Backend Specialist implements)
- **`webhook.service.ts`** - Webhook signature verification and event handling (Backend Specialist implements)

---

## Environment Variables Required

```env
# Server-side (Never expose to client)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Client-side (Safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Product IDs (for offer mapping)
STRIPE_PRODUCT_LOW_STRESS=prod_...
STRIPE_PRODUCT_MEDIUM_STRESS=prod_...
STRIPE_PRODUCT_HIGH_STRESS=prod_...
```

---

## Usage Examples

### Creating a Payment Intent (Backend)

```typescript
import { createPaymentIntent } from '@/lib/stripe/payment.service';

// In your API route
const result = await createPaymentIntent({
  sessionId: session.id,
  resultId: result.id,
  amount: result.recommended_price_cents, // e.g., 1999 for $19.99
  productId: result.recommended_product_id,
  productName: result.recommended_product_name,
  customerEmail: customerEmail, // optional
});

// Return to frontend
return NextResponse.json({
  clientSecret: result.clientSecret,
  orderId: order.id,
});
```

### Retrieving a Payment Intent

```typescript
import { getPaymentIntent } from '@/lib/stripe/payment.service';

const paymentIntent = await getPaymentIntent('pi_xxx');
console.log(paymentIntent.status); // 'succeeded', 'processing', etc.
```

### Canceling a Payment Intent

```typescript
import { cancelPaymentIntent } from '@/lib/stripe/payment.service';

await cancelPaymentIntent('pi_xxx');
```

---

## Payment Flow

1. **User completes quiz** → Result calculated with recommended product
2. **User clicks "Buy Now"** → Frontend calls `/api/payments/create-intent`
3. **Backend creates PaymentIntent** → Uses `createPaymentIntent()`
4. **Backend creates Order** → Stores `stripe_payment_intent_id`, status='pending'
5. **Backend returns clientSecret** → Frontend receives it
6. **Frontend renders Payment Element** → Stripe.js loads with clientSecret
7. **User submits payment** → Stripe processes payment
8. **Stripe sends webhook** → `/api/payments/webhook` receives event
9. **Webhook updates order** → Status changes to 'paid'
10. **Frontend polls status** → Shows success screen

---

## Security Notes

### Server-Side Only

- **NEVER** import `stripe.config.ts` or `payment.service.ts` in client components
- **NEVER** expose `STRIPE_SECRET_KEY` to the frontend
- All Stripe operations MUST go through API routes

### Client-Side Safe

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` can be used in frontend
- Used only for initializing Stripe.js and rendering Payment Element
- Cannot create charges or modify payments

---

## Testing

### Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires 3D Secure |

Use any future expiry date, any CVC, any ZIP code.

### Local Webhook Testing

```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/payments/webhook

# Terminal 3: Trigger test events
stripe trigger payment_intent.succeeded
```

---

## Error Handling

All functions throw errors with descriptive messages:

```typescript
try {
  const result = await createPaymentIntent(params);
} catch (error) {
  // Error will be: "Payment intent creation failed: <stripe error>"
  console.error(error.message);
  return NextResponse.json(
    { error: 'Failed to initialize payment' },
    { status: 500 }
  );
}
```

---

## Metadata

PaymentIntents store metadata for webhook processing:

```typescript
metadata: {
  session_id: 'uuid',
  result_id: 'uuid',
  product_id: 'prod_xxx',
  product_name: 'Product Name',
}
```

This allows webhooks to update the correct order without additional database queries.

---

## Reference

- [Stripe API Docs](https://stripe.com/docs/api)
- [PaymentIntents Guide](https://stripe.com/docs/payments/payment-intents)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)

---

**Setup Guide**: See `__dev/STRIPE_SETUP_GUIDE.md` for full Stripe account configuration
