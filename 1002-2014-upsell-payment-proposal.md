# Upsell Page Stripe Integration - Technical Proposal

**Date**: 2026-02-09
**Status**: PROPOSAL (no implementation code yet)
**Scope**: Make the "PŘIDAT DO MÉHO PLÁNU" button functional on the Upsell Page (`/offer-2`)

---

## Executive Summary

The Upsell Page at `/offer-2` currently has a non-functional CTA button. This proposal details how to:
1. Pass the customer's Stripe subscription ID from checkout to the upsell page
2. Create a backend API endpoint to add the upsell product
3. Charge the customer automatically using their saved payment method (no second Payment Element)
4. Handle recurring billing for the upsell via the existing schedule migration infrastructure

**Upsell Product Details**:
- **Product**: Personal Mentoring Support ("Osobní mentoring")
- **Phase 1 (Intro)**: 895 Kč/month — Stripe Price ID: `price_1Sx1VbQjmVx09QITfELb405S`
- **Phase 2 (Recurring)**: 1,395 Kč/month — Stripe Price ID: `price_1Sx1W7QjmVx09QITsg5OjA9N`

---

## Part A: Frontend Analysis

### A.1 Current State

#### UpsellPage Component (`src/components/checkout/UpsellPage.tsx`)
- **Props**: `onAddToPlan: () => void` and `onSkip: () => void`
- **CTA Button**: Calls `onAddToPlan()` on click (line 253)
- **No loading/error states** — the component assumes the action is synchronous
- **No subscription ID access** — the component has no way to identify which customer/subscription to charge

#### Offer-2 Page (`src/app/(app)/offer-2/page.tsx`)
- Renders `<UpsellPage>` with two TODO handlers:
  ```typescript
  const handleAddToPlan = () => {
    // TODO: Add mentoring to plan, proceed to next step
    router.push('/dashboard');
  };
  ```
- **No access to any Stripe identifiers** — no subscription ID, no customer ID

#### usePostQuizState Hook (`src/hooks/usePostQuizState.ts`)
- Zustand store with `persist` middleware (localStorage key: `'post-quiz-storage'`)
- **Persisted fields**: `completeData`, `funnelData`, `currentScreen`, `pricingTier`, `timerExpired`, `checkoutCanceled`, `selectedPlanId`
- **DOES NOT persist**: `subscriptionId`, `stripeSubscriptionId`, `stripeCustomerId`

### A.2 Critical Gap: Subscription ID is Lost

The navigation flow from checkout to upsell:

```
CheckoutModal (SalesPage)
  ├─ Creates subscription → stores subscriptionId in LOCAL STATE
  ├─ Payment succeeds → calls onSuccess()
  │
SalesPage.handlePaymentSuccess()
  ├─ router.push('/payment-success')    ← LOCAL STATE IS LOST HERE
  │
PaymentSuccessPage (/payment-success)
  ├─ Renders PreUpsell component
  ├─ handleContinue → router.push('/offer-2')
  │
Offer2Page (/offer-2)
  ├─ Renders UpsellPage
  └─ handleAddToPlan → TODO (currently just pushes to /dashboard)
```

**The `stripeSubscriptionId` exists in CheckoutModal's `useState` (line 28) but is NEVER persisted.** When `router.push('/payment-success')` fires, React unmounts CheckoutModal, destroying the local state.

### A.3 Required Frontend Changes

#### Change 1: Add `stripeSubscriptionId` to usePostQuizState

Add new persisted fields to the Zustand store:

```typescript
// New fields in PostQuizState interface
stripeSubscriptionId: string | null;
stripeCustomerId: string | null;

// New action
setSubscriptionIds: (stripeSubId: string, stripeCustomerId: string) => void;
```

These must be added to the `partialize` function to persist them in localStorage.

#### Change 2: Store IDs After Subscription Creation (CheckoutModal)

In `CheckoutModal.tsx`, after the `/api/payments/create-subscription` response:

```typescript
// Line ~72-73, after setClientSecret/setSubscriptionId:
const { setSubscriptionIds } = usePostQuizState.getState();
setSubscriptionIds(data.stripeSubscriptionId, data.stripeCustomerId);
```

Note: `stripeCustomerId` is NOT currently returned by the API. Either:
- **Option A**: Add it to the API response (straightforward — it's available in `subscriptionResult`)
- **Option B**: Retrieve it from the existing subscription later via API (unnecessary round-trip)

**Recommendation**: Option A — add `customerId` / `stripeCustomerId` to the `/api/payments/create-subscription` response.

#### Change 3: Update UpsellPage Props

```typescript
interface UpsellPageProps {
  onAddToPlan: () => Promise<void>;  // Now async
  onSkip: () => void;
  isLoading?: boolean;               // Show loading state on CTA
  error?: string | null;             // Show error state
}
```

#### Change 4: Update Offer-2 Page

```typescript
export default function Offer2Page() {
  const router = useRouter();
  const { stripeSubscriptionId } = usePostQuizState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToPlan = async () => {
    if (!stripeSubscriptionId) {
      setError('Subscription not found');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/add-upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSubscriptionId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add upsell');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => router.push('/dashboard');

  return (
    <UpsellPage
      onAddToPlan={handleAddToPlan}
      onSkip={handleSkip}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

#### Change 5: CTA Button Loading/Error State in UpsellPage

The PricingCard CTA button needs:
- **Loading state**: Spinner + disabled when `isLoading` is true
- **Error state**: Show error message below button (toast or inline)
- **Disable "skip" button** during loading to prevent double navigation

---

## Part B: Backend API Plan

### B.1 New Endpoint: `POST /api/payments/add-upsell`

**Location**: `src/app/api/payments/add-upsell/route.ts`

#### Request Schema (Zod)

```typescript
const addUpsellSchema = z.object({
  stripeSubscriptionId: z.string().startsWith('sub_'),
});
```

#### Response (Success — 200)

```json
{
  "success": true,
  "upsellSubscriptionId": "sub_xxx",
  "status": "active",
  "amountCharged": 89500
}
```

#### Response (Error — 400/500)

```json
{
  "error": "Error message here"
}
```

### B.2 API Business Logic Flow

```
1. Validate session (getSessionFromCookie)
2. Validate input (Zod schema)
3. Look up base subscription in our DB by stripe_subscription_id
4. Get customer record from our DB
5. Retrieve Stripe customer to get default payment method
6. Create new Stripe subscription for upsell (auto-charge)
7. Create upsell subscription record in our DB
8. Create initial order record for the upsell
9. Track analytics event
10. Return success response
```

### B.3 Upsell Configuration

Add upsell pricing constants. Recommended location: `src/config/pricing.config.ts` or a new `src/config/upsell.config.ts`.

```typescript
export const UPSELL_MENTORING = {
  productName: 'Osobní mentoring',
  introStripePriceId: process.env.STRIPE_PRICE_UPSELL_MENTORING_INTRO!,
  recurringStripePriceId: process.env.STRIPE_PRICE_UPSELL_MENTORING_RECURRING!,
  initialAmountCents: 89500,     // 895 Kč
  recurringAmountCents: 139500,  // 1,395 Kč
  billingInterval: 'month' as const,
  planDuration: '1_month' as const,
};
```

New `.env` variables:
```
STRIPE_PRICE_UPSELL_MENTORING_INTRO=price_1Sx1VbQjmVx09QITfELb405S
STRIPE_PRICE_UPSELL_MENTORING_RECURRING=price_1Sx1W7QjmVx09QITsg5OjA9N
```

### B.4 Database Considerations

The existing `subscriptions` and `orders` tables can handle the upsell with no schema changes:

- **subscriptions**: New row with `stripe_subscription_id` pointing to the upsell subscription
- **orders**: New row linked to the upsell subscription via `subscription_id`

To distinguish upsell subscriptions from base subscriptions, add a metadata convention:
- The Stripe subscription metadata will include `type: 'upsell'` and `parent_subscription_id: <base_stripe_sub_id>`
- Our DB subscription record links to the same `customer_id`

---

## Part C: Stripe Implementation Plan

### C.1 Analysis: `subscriptionSchedules.update()` Approach

The user's original prompt suggested using `stripe.subscriptionSchedules.update()` to add upsell items to the existing schedule. Here is why this approach is **NOT recommended** and what approach is proposed instead.

#### Why Schedule Update Is Problematic

**Problem 1: Billing Cycle Mismatch**

The base plan has variable durations (7 days, 1 month, 3 months). The upsell is always monthly. When added to the base plan's schedule phases:

| Base Plan | Phase 1 Duration | Upsell Added | What Customer Pays |
|-----------|-------------------|--------------|-------------------|
| 7-day     | 7 days            | 895 Kč/mo    | ~209 Kč (prorated 7/30) |
| 1-month   | 1 month           | 895 Kč/mo    | 895 Kč (full) |
| 3-month   | 3 months          | 895 Kč/mo    | 2,685 Kč (3x monthly) |

For the 7-day plan, the customer would be charged only ~209 Kč instead of the expected 895 Kč. For the 3-month plan, they'd be charged 2,685 Kč instead of 895 Kč. Only the 1-month plan would match expectations.

**Problem 2: Webhook Race Condition**

The schedule migration happens in the `invoice.paid` webhook handler. Between payment success and reaching the upsell page, the webhook may or may not have fired yet:

```
Timeline:
  T+0s:   Payment confirmed (client-side)
  T+0.5s: router.push('/payment-success')
  T+1-5s: Webhook fires → migrateToSchedule()    ← MAY NOT HAVE HAPPENED YET
  T+5-30s: User reaches /offer-2
  T+???:  User clicks "Add to plan"               ← Schedule may not exist yet
```

We'd need to handle two states: schedule exists vs. bare subscription. This adds complexity and potential race conditions.

**Problem 3: Active Phase Modification Complexity**

Modifying the items array of an active phase in a subscription schedule requires re-specifying the entire phase configuration. Any mistake could break the base subscription's billing.

**Problem 4: Cancellation Coupling**

If the customer cancels one product (base or upsell), they'd need to cancel individual items from the schedule phases. With separate subscriptions, each product can be canceled independently.

### C.2 Recommended Approach: Separate Subscription (Auto-Charged)

Create a **new, independent Stripe subscription** for the upsell, reusing the customer's saved payment method from the base subscription.

#### Why This Works

1. **No Payment Element needed** — The customer's card is already saved on the Stripe customer (via `save_default_payment_method: 'on_subscription'` from the base plan checkout)
2. **Single-click UX** — Click "Add to plan" → API call → auto-charge → done
3. **Independent billing** — The upsell has its own billing cycle, phases, and cancellation logic
4. **Reuses existing infrastructure** — The same `migrateToSchedule()` webhook handler works for the upsell subscription (it reads metadata to determine phases)

#### Implementation Flow

```
User clicks "PŘIDAT DO MÉHO PLÁNU"
        │
        ▼
Frontend: POST /api/payments/add-upsell
  body: { stripeSubscriptionId: "sub_xxx" }
        │
        ▼
Backend:
  1. Look up base subscription → get customer_id
  2. Get Stripe customer → get default_payment_method
  3. Create upsell subscription:
     │
     stripe.subscriptions.create({
       customer: stripeCustomerId,
       items: [{ price: upsellIntroPriceId }],
       default_payment_method: paymentMethodId,
       payment_settings: { save_default_payment_method: 'on_subscription' },
       metadata: {
         type: 'upsell',
         parent_subscription_id: stripeSubscriptionId,
         recurring_stripe_price_id: upsellRecurringPriceId,
         plan_duration: '1_month',
       },
     })
     │
     ▼
  4. Stripe auto-charges the first invoice (895 Kč)
  5. If charge succeeds → subscription status: 'active'
  6. If charge fails → subscription status: 'incomplete' → return error
     │
     ▼
  7. Save subscription record in our DB
  8. Create order record for the upsell invoice
  9. Track analytics event
  10. Return success
        │
        ▼
Later (webhook):
  invoice.paid → migrateToSchedule() triggers for upsell sub
  (same logic: reads metadata, creates schedule with intro→recurring phases)
```

#### Key Detail: Getting the Payment Method

After the base subscription payment, the customer's default payment method can be retrieved from:

```typescript
// Option A: From the base Stripe subscription
const baseSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
const paymentMethodId = baseSub.default_payment_method as string;

// Option B: From the Stripe customer's invoice settings
const customer = await stripe.customers.retrieve(stripeCustomerId);
const paymentMethodId = customer.invoice_settings?.default_payment_method as string;
```

If neither has a payment method (edge case), fall back to the customer's first attached payment method:

```typescript
const paymentMethods = await stripe.paymentMethods.list({
  customer: stripeCustomerId,
  type: 'card',
  limit: 1,
});
const paymentMethodId = paymentMethods.data[0]?.id;
```

### C.3 What Happens With `migrateToSchedule()` (Existing Webhook)

The existing webhook handler in `webhook.service.ts` already supports this approach with **zero changes needed**:

```typescript
async function migrateToSchedule(stripeSubscriptionId: string): Promise<void> {
  const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const recurringPriceId = sub.metadata?.recurring_stripe_price_id;  // ✅ Set in upsell metadata
  const planDuration = sub.metadata?.plan_duration;                   // ✅ '1_month' for upsell

  if (!recurringPriceId || !planDuration) return;  // Skip if no metadata

  const currentPriceId = sub.items.data[0]?.price?.id;
  if (currentPriceId === recurringPriceId) return;  // Skip if same price (FULL_PRICE tier)

  if (sub.schedule) return;  // Idempotency check

  // Creates schedule with Phase 1 (intro) → Phase 2 (recurring)
  // Works identically for base and upsell subscriptions
}
```

The upsell subscription's metadata contains:
- `recurring_stripe_price_id: price_1Sx1W7QjmVx09QITsg5OjA9N` (1,395 Kč)
- `plan_duration: '1_month'`

When the upsell's first invoice is paid, the webhook handler:
1. Detects `billing_reason: 'subscription_create'`
2. Marks the upsell order as paid
3. Calls `migrateToSchedule()` for the upsell subscription
4. Creates a schedule: Phase 1 (895 Kč/mo) → Phase 2 (1,395 Kč/mo)

**This is the same code path as the base subscription. No duplication needed.**

### C.4 New Service Function: `addUpsellToSubscription()`

Add to `src/lib/stripe/subscription.service.ts`:

```typescript
export interface AddUpsellParams {
  baseStripeSubscriptionId: string;
  sessionId?: string;
}

export interface AddUpsellResult {
  upsellSubscriptionId: string;       // Our DB ID
  stripeSubscriptionId: string;       // Stripe sub ID
  status: string;                     // 'active' or 'incomplete'
  amountCharged: number;              // Amount in cents
}

export async function addUpsellToSubscription(
  params: AddUpsellParams
): Promise<AddUpsellResult> {
  // 1. Look up base subscription in our DB
  // 2. Get customer record
  // 3. Get payment method from Stripe
  // 4. Create upsell subscription
  // 5. Save records in our DB
  // 6. Return result
}
```

### C.5 Idempotency & Edge Cases

| Scenario | Handling |
|----------|----------|
| User clicks CTA twice rapidly | API checks if customer already has an active upsell subscription. If yes, returns existing one. |
| Payment method expired/declined | Stripe returns `incomplete` status. API returns error. Frontend shows error message. |
| User refreshes upsell page | `stripeSubscriptionId` is in localStorage (usePostQuizState). Safe to retry. |
| Webhook hasn't fired for base sub yet | Doesn't matter — we create a separate subscription. Base and upsell webhooks are independent. |
| User already has upsell from previous session | Check `subscriptions` table for existing active upsell linked to same customer. Return "already subscribed" error. |

---

## Part D: Testing Plan

### D.1 Unit Tests (Mocked)

| # | Test Case | What to Verify |
|---|-----------|----------------|
| 1 | API validates input | Returns 400 for missing/invalid `stripeSubscriptionId` |
| 2 | API requires session | Returns 401 if no session cookie |
| 3 | API rejects invalid base subscription | Returns 404 if base subscription not found in DB |
| 4 | Idempotency check | Returns existing upsell if customer already has one |

### D.2 Integration Tests (Real Stripe API — Test Mode)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Happy path: Create upsell | Create base sub → confirm payment → call add-upsell API | Upsell sub created, status: 'active', 895 Kč charged |
| 2 | Payment method reuse | Verify upsell uses same card as base sub | Same `pm_` ID on both subscriptions |
| 3 | Upsell schedule migration | Create upsell → wait for webhook → check schedule | Schedule has Phase 1 (895 Kč) → Phase 2 (1,395 Kč) |
| 4 | Double-click protection | Call add-upsell API twice | Second call returns existing upsell, no duplicate charge |
| 5 | Customer without payment method | Create customer with no saved card → call add-upsell | Returns error: "No payment method available" |

### D.3 Test Clock Test (Renewal Verification)

```
Step 1: Create customer with test clock
Step 2: Create base subscription (1-month FIRST_DISCOUNT, 695 Kč)
Step 3: Confirm payment → base sub active
Step 4: Create upsell subscription (895 Kč)
Step 5: Verify upsell charged immediately (895 Kč)
Step 6: Advance clock 35 days
Step 7: Verify base renewal: 995 Kč (recurring price)
Step 8: Verify upsell renewal: 1,395 Kč (recurring price)
```

Expected results table:

| Event | Product | Amount | Status |
|-------|---------|--------|--------|
| Initial charge | Base plan | 695 Kč | Paid |
| Upsell charge | Mentoring | 895 Kč | Paid |
| Base renewal (month 2) | Base plan | 995 Kč | Paid |
| Upsell renewal (month 2) | Mentoring | 1,395 Kč | Paid |

### D.4 Test Script Addition

Extend `scripts/stripe-test-suite.mjs` with:
- **Test 11**: Upsell subscription creation with saved payment method
- **Test 12**: Test Clock — upsell renewal at recurring price (1,395 Kč)

---

## Implementation Order

| Step | Task | Files | Agent |
|------|------|-------|-------|
| 1 | Add `.env` variables for upsell prices | `.env`, `.env.example` | integration-specialist |
| 2 | Add upsell config | `src/config/upsell.config.ts` or `pricing.config.ts` | integration-specialist |
| 3 | Add `stripeSubscriptionId` + `stripeCustomerId` to usePostQuizState | `src/hooks/usePostQuizState.ts` | frontend-specialist |
| 4 | Store IDs in CheckoutModal after subscription creation | `src/components/checkout/CheckoutModal.tsx` | frontend-specialist |
| 5 | Add `stripeCustomerId` to create-subscription API response | `src/app/api/payments/create-subscription/route.ts` | backend-specialist |
| 6 | Implement `addUpsellToSubscription()` service function | `src/lib/stripe/subscription.service.ts` | integration-specialist |
| 7 | Create `/api/payments/add-upsell` endpoint | `src/app/api/payments/add-upsell/route.ts` | backend-specialist |
| 8 | Update UpsellPage with loading/error states | `src/components/checkout/UpsellPage.tsx` | frontend-specialist |
| 9 | Wire up Offer-2 page to call API | `src/app/(app)/offer-2/page.tsx` | frontend-specialist |
| 10 | Run test suite (Tests 11-12) | `scripts/stripe-test-suite.mjs` | qa-specialist |
| 11 | Build verification + TypeScript check | — | qa-specialist |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Payment method not saved on customer | Low | High (payment fails) | Check for payment method before creating upsell; show error message |
| Webhook fires twice for upsell invoice | Low | Medium (duplicate order) | Idempotency check in `handleInvoicePaid()` already handles this |
| User navigates away before API completes | Medium | Low (no charge) | Subscription never created; no cleanup needed |
| `stripeSubscriptionId` missing from localStorage | Low | Medium (can't charge) | Guard in offer-2 page; fallback: look up by session/customer |

---

## Summary

This proposal recommends creating a **separate Stripe subscription** for the upsell product rather than modifying the existing subscription schedule. This approach:

1. **Avoids billing cycle mismatches** between base plans (7-day/1-month/3-month) and the monthly upsell
2. **Eliminates webhook race conditions** — no dependency on the base subscription's schedule existing
3. **Reuses 100% of existing webhook infrastructure** — `migrateToSchedule()` works identically
4. **Provides clean cancellation** — each product can be canceled independently
5. **Requires zero database schema changes** — existing `subscriptions` and `orders` tables handle it
6. **Single-click UX** — No second Payment Element needed; charges the saved card automatically
