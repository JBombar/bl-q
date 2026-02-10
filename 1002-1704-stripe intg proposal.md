# Proposal: Stripe Subscription Schedules Implementation

**Date:** 2026-02-10
**Status:** Awaiting Review
**Scope:** Backend pricing config, subscription service, API endpoint, webhook handling

---

## Executive Summary

This proposal replaces the current "negative invoice item" discount mechanism with **Stripe Subscription Schedules** -- a first-class Stripe API for managing multi-phase billing. Each subscription will be created as a two-phase schedule: Phase 1 charges the introductory price for the initial period, and Phase 2 automatically transitions to the standard recurring price. This eliminates custom discount logic and lets Stripe manage the price transition natively.

**Documentation basis:** The Stripe Subscription Schedules API (`POST /v1/subscription_schedules`) supports defining an array of `phases`, each with its own `items` (price references) and `duration` (interval + count). We use `start_date: 'now'` and `end_behavior: 'release'` so Phase 2 becomes a normal standalone subscription after it completes.

---

## Part A: Stripe Setup Plan

### A1. Required Stripe Price Objects (11 Total)

Based on the CSV pricing data, we need **11 unique Stripe Price objects** in the dashboard:

#### 9 Introductory Prices (Phase 1 -- one-time-use per schedule)

These are **recurring** prices at the discounted rate. Subscription Schedules require recurring prices for phase items (not one-time prices). Each introductory price bills once for the initial period duration.

| # | Offer | Plan | Tier | Amount | Interval | Stripe Test Price ID |
|---|-------|------|------|--------|----------|---------------------|
| 1 | 7-day FIRST_DISCOUNT | 7 days | FIRST_DISCOUNT | 345 Kc | month (1 iteration) | `price_1SwMVJQjmVx09QITNWSuZBrM` |
| 2 | 7-day MAX_DISCOUNT | 7 days | MAX_DISCOUNT | 325 Kc | month (1 iteration) | `price_1Sx1NfQjmVx09QITTZjat45K` |
| 3 | 7-day FULL_PRICE | 7 days | FULL_PRICE | 495 Kc | month (1 iteration) | `price_1Sx1RgQjmVx09QITrqsDvDdg` |
| 4 | 1-month FIRST_DISCOUNT | 1 month | FIRST_DISCOUNT | 695 Kc | month (1 iteration) | `price_1SwMW6QjmVx09QITwlfKLF1s` |
| 5 | 1-month MAX_DISCOUNT | 1 month | MAX_DISCOUNT | 645 Kc | month (1 iteration) | `price_1Sx1OcQjmVx09QITlk9qf8N7` |
| 6 | 1-month FULL_PRICE | 1 month | FULL_PRICE | 995 Kc | month (1 iteration) | `price_1SwMXgQjmVx09QITi3LM36eq` |
| 7 | 3-month FIRST_DISCOUNT | 3 months | FIRST_DISCOUNT | 1,695 Kc | 3 months (1 iteration) | `price_1SwMWqQjmVx09QITguF0bjx3` |
| 8 | 3-month MAX_DISCOUNT | 3 months | MAX_DISCOUNT | 1,595 Kc | 3 months (1 iteration) | `price_1Sx1PQQjmVx09QITyFWgr4J3` |
| 9 | 3-month FULL_PRICE | 3 months | FULL_PRICE | 2,395 Kc | 3 months (1 iteration) | `price_1SwMXwQjmVx09QITS4yGuIW0` |

#### 2 Standard Recurring Prices (Phase 2 -- ongoing)

| # | Description | Amount | Interval | Env Var |
|---|-------------|--------|----------|---------|
| 10 | Monthly recurring | 995 Kc/month | month | `STRIPE_PRICE_MONTHLY_995` |
| 11 | Quarterly recurring | 2,395 Kc/3 months | every 3 months | `STRIPE_PRICE_QUARTERLY_2395` |

These two already exist in Stripe and are referenced via environment variables.

### A2. Required Environment Variables

```bash
# Existing recurring prices (Phase 2)
STRIPE_PRICE_MONTHLY_995=price_xxx          # 995 Kč/month
STRIPE_PRICE_QUARTERLY_2395=price_xxx       # 2,395 Kč/3 months

# 7-day introductory prices (Phase 1)
STRIPE_PRICE_7D_FIRST=price_1SwMVJQjmVx09QITNWSuZBrM     # 345 Kč
STRIPE_PRICE_7D_MAX=price_1Sx1NfQjmVx09QITTZjat45K       # 325 Kč
STRIPE_PRICE_7D_FULL=price_1Sx1RgQjmVx09QITrqsDvDdg      # 495 Kč

# 1-month introductory prices (Phase 1)
STRIPE_PRICE_1M_FIRST=price_1SwMW6QjmVx09QITwlfKLF1s     # 695 Kč
STRIPE_PRICE_1M_MAX=price_1Sx1OcQjmVx09QITlk9qf8N7       # 645 Kč
STRIPE_PRICE_1M_FULL=price_1SwMXgQjmVx09QITi3LM36eq      # 995 Kč

# 3-month introductory prices (Phase 1)
STRIPE_PRICE_3M_FIRST=price_1SwMWqQjmVx09QITguF0bjx3     # 1,695 Kč
STRIPE_PRICE_3M_MAX=price_1Sx1PQQjmVx09QITyFWgr4J3       # 1,595 Kč
STRIPE_PRICE_3M_FULL=price_1SwMXwQjmVx09QITS4yGuIW0      # 2,395 Kč
```

---

## Part B: Backend Architecture & Configuration

### B1. Updated `pricing.config.ts` Structure

The key change: each plan+tier combination now maps to **two** Stripe Price IDs instead of a single price + discount amount.

**New `STRIPE_PRICES` object:**

```typescript
export const STRIPE_PRICES = {
  // Phase 2: Standard recurring prices
  RECURRING_MONTHLY: process.env.STRIPE_PRICE_MONTHLY_995 || 'price_monthly_placeholder',
  RECURRING_QUARTERLY: process.env.STRIPE_PRICE_QUARTERLY_2395 || 'price_quarterly_placeholder',

  // Phase 1: Introductory prices (per plan × tier)
  INTRO: {
    '7_days': {
      FIRST_DISCOUNT: process.env.STRIPE_PRICE_7D_FIRST || 'price_7d_first_placeholder',
      MAX_DISCOUNT:   process.env.STRIPE_PRICE_7D_MAX   || 'price_7d_max_placeholder',
      FULL_PRICE:     process.env.STRIPE_PRICE_7D_FULL  || 'price_7d_full_placeholder',
    },
    '1_month': {
      FIRST_DISCOUNT: process.env.STRIPE_PRICE_1M_FIRST || 'price_1m_first_placeholder',
      MAX_DISCOUNT:   process.env.STRIPE_PRICE_1M_MAX   || 'price_1m_max_placeholder',
      FULL_PRICE:     process.env.STRIPE_PRICE_1M_FULL  || 'price_1m_full_placeholder',
    },
    '3_months': {
      FIRST_DISCOUNT: process.env.STRIPE_PRICE_3M_FIRST || 'price_3m_first_placeholder',
      MAX_DISCOUNT:   process.env.STRIPE_PRICE_3M_MAX   || 'price_3m_max_placeholder',
      FULL_PRICE:     process.env.STRIPE_PRICE_3M_FULL  || 'price_3m_full_placeholder',
    },
  },
} as const;
```

**Updated `SubscriptionPlan` interface** -- add a `recurringStripePriceId` field:

```typescript
export interface SubscriptionPlan {
  id: string;
  duration: PlanDuration;
  name: string;
  durationDays: number;
  billingInterval: BillingInterval;
  recurringStripePriceId: string;   // Phase 2 recurring price (RENAMED from stripePriceId)
  isRecommended: boolean;
  badge?: string;
  features: string[];
}
```

**New helper function** to resolve the Phase 1 introductory price:

```typescript
export function getIntroStripePriceId(
  duration: PlanDuration,
  tier: PricingTier
): string {
  return STRIPE_PRICES.INTRO[duration][tier];
}
```

**Updated `PlanPricing` interface** -- remove `discountAmountCents`, add `introStripePriceId`:

```typescript
export interface PlanPricing {
  initialPriceCents: number;
  originalPriceCents: number | null;
  perDayPriceCents: number;
  recurringPriceCents: number;
  introStripePriceId: string;      // NEW: Stripe Price ID for Phase 1
  // discountAmountCents removed -- no longer needed
}
```

### B2. Subscription Schedule API Call

**File:** `src/lib/stripe/subscription.service.ts`

The `createSubscription` function will be refactored to use `stripe.subscriptionSchedules.create()` instead of `stripe.subscriptions.create()`.

**Phase structure per plan type:**

| Plan | Phase 1 (Intro) | Phase 2 (Recurring) |
|------|-----------------|---------------------|
| 7-day | `duration: { interval: 'month', interval_count: 1 }`, `iterations: 1` | `duration: { interval: 'month', interval_count: 1 }` (ongoing after release) |
| 1-month | `duration: { interval: 'month', interval_count: 1 }`, `iterations: 1` | `duration: { interval: 'month', interval_count: 1 }` (ongoing after release) |
| 3-month | `duration: { interval: 'month', interval_count: 3 }`, `iterations: 1` | `duration: { interval: 'month', interval_count: 3 }` (ongoing after release) |

**Key design decision -- `end_behavior: 'release'`:** After both phases complete, the subscription schedule "releases" the subscription, which means it becomes a normal standalone subscription that continues to renew at the Phase 2 price indefinitely. This is exactly what we want.

**Updated `CreateSubscriptionParams`:**

```typescript
export interface CreateSubscriptionParams {
  email: string;
  sessionId?: string;
  introStripePriceId: string;       // NEW: Phase 1 price
  recurringStripePriceId: string;   // NEW: Phase 2 price (was stripePriceId)
  billingInterval: BillingInterval;
  initialAmountCents: number;
  recurringAmountCents: number;
  productName: string;
  pricingTier: PricingTier;
  resultId?: string;
  planDuration: PlanDuration;       // NEW: needed for phase duration
}
```

**Core API call -- the two-phase subscription schedule:**

```typescript
// Map plan duration to phase interval
function getPhaseInterval(duration: PlanDuration): { interval: string; interval_count: number } {
  switch (duration) {
    case '7_days':   return { interval: 'month', interval_count: 1 };
    case '1_month':  return { interval: 'month', interval_count: 1 };
    case '3_months': return { interval: 'month', interval_count: 3 };
  }
}

// Create the subscription schedule
const phaseInterval = getPhaseInterval(planDuration);

const schedule = await stripe.subscriptionSchedules.create({
  customer: stripeCustomer.id,
  start_date: 'now',
  end_behavior: 'release',
  phases: [
    // Phase 1: Introductory price (1 iteration)
    {
      items: [{ price: introStripePriceId, quantity: 1 }],
      iterations: 1,
      metadata: {
        phase: 'introductory',
        pricing_tier: pricingTier,
      },
    },
    // Phase 2: Standard recurring price (1 iteration, then released as standalone sub)
    {
      items: [{ price: recurringStripePriceId, quantity: 1 }],
      iterations: 1,
      metadata: {
        phase: 'recurring',
      },
    },
  ],
  metadata: {
    customer_id: customer.id,
    session_id: sessionId || '',
    result_id: resultId || '',
    product_name: productName,
    pricing_tier: pricingTier,
    initial_amount_cents: String(initialAmountCents),
    recurring_amount_cents: String(recurringAmountCents),
  },
});
```

**Important:** `iterations: 1` on each phase means Phase 1 bills once at the intro price, then Phase 2 bills once at the recurring price, and then the schedule releases the subscription which continues to renew at the Phase 2 price indefinitely.

### B3. Retrieving the Client Secret for Payment

When a subscription schedule is created with `start_date: 'now'`, Stripe immediately creates the underlying subscription and generates the first invoice. We need to retrieve the payment intent's client secret from this invoice to power the frontend Payment Element.

```typescript
// The schedule creates a subscription immediately
const stripeSubscriptionId = schedule.subscription as string;
const stripeSubscription = await stripe.subscriptions.retrieve(
  stripeSubscriptionId,
  { expand: ['latest_invoice.payment_intent'] }
);

const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent;

if (!paymentIntent?.client_secret) {
  throw new Error('Failed to get payment intent client secret');
}
```

The rest of the flow (saving to database, creating order record) remains largely the same, with the addition of storing the `schedule.id` in metadata.

### B4. Webhook Updates

**File:** `src/app/api/payments/webhook/route.ts`

The existing webhook handlers for `invoice.paid`, `customer.subscription.updated`, etc., will continue to work because subscription schedules create real subscriptions under the hood. However, we should add handling for schedule-specific events:

```typescript
// Add to webhook switch statement:
case 'subscription_schedule.completed':
  // Schedule finished all phases, subscription is now standalone
  // Log for monitoring; no action needed since end_behavior='release'
  break;

case 'subscription_schedule.canceled':
  // Schedule was canceled before completion
  break;
```

These are informational -- the critical payment and subscription lifecycle events (`invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`) already handle all billing state changes.

### B5. API Route Changes

**File:** `src/app/api/payments/create-subscription/route.ts`

The request schema stays the same (the frontend still sends `planId`, `pricingTier`, `email`). The route handler changes internally:

```typescript
// Current: resolves single stripePriceId + discountAmountCents
// New: resolves introStripePriceId + recurringStripePriceId

const plan = getPlanById(planId);
const pricing = getPlanPricing(planId, pricingTier);
const introStripePriceId = getIntroStripePriceId(plan.duration, pricingTier);

const result = await createSubscription({
  email,
  sessionId,
  introStripePriceId,                    // NEW
  recurringStripePriceId: plan.recurringStripePriceId,  // RENAMED
  billingInterval: plan.billingInterval,
  initialAmountCents: pricing.initialPriceCents,
  recurringAmountCents: pricing.recurringPriceCents,
  productName: plan.name,
  pricingTier,
  resultId,
  planDuration: plan.duration,           // NEW
});
```

The response shape stays the same (`clientSecret`, `subscriptionId`, `status`, etc.), so the frontend needs no changes to its API call handling.

---

## Part C: Frontend State Management

**No major changes needed.** The `usePostQuizState` Zustand store (`src/hooks/usePostQuizState.ts`) already manages:

- `pricingTier: PricingTier` -- tracks `FIRST_DISCOUNT` | `MAX_DISCOUNT` | `FULL_PRICE` (lines 29, 64)
- `selectedPlanId: string | null` -- tracks the chosen plan (line 32)
- `handleTimerExpired()` -- upgrades to `FULL_PRICE` (lines 314-319)
- `handleCheckoutCanceled()` -- applies `MAX_DISCOUNT` (lines 324-326)
- Persistence to localStorage (lines 335-346)

The `CheckoutModal.tsx` component already sends `{ planId, pricingTier, email }` to the API (lines 41-74). Since the API request contract is unchanged, the frontend continues to work as-is.

The only potential frontend change is removing display of `discountAmountCents` if it was shown anywhere (e.g., "You save X Kc"), since the discount is now implicit in the introductory price. The `originalPriceCents` (crossed-out price) still works for strikethrough display.

---

## Part D: Frontend Component Integration

**Confirmed: minimal frontend changes.** The frontend's job is simply to pass the correct `planId` (one of `plan_7_days`, `plan_1_month`, `plan_3_months`) and `pricingTier` (one of the 3 tiers) to the backend API. The backend resolves these to the correct pair of Stripe Price IDs.

The flow remains:
1. User selects a plan on `PricingSection` -> `handlePlanSelect(planId)` stores it
2. `CheckoutModal` opens, reads `planId` and `pricingTier` from state
3. `CheckoutModal` calls `POST /api/payments/create-subscription` with `{ planId, pricingTier, email }`
4. Backend creates the two-phase schedule and returns `clientSecret`
5. `CheckoutModal` renders Stripe Payment Element with the `clientSecret`

No component props, API contracts, or UI flows change. The subscription schedule is entirely a backend concern.

---

## Part E: Phased Implementation & Testing Plan

### E1. Implementation Steps

| Step | Layer | Action | Files |
|------|-------|--------|-------|
| 1 | Config | Add 9 introductory price env vars to `.env.local` and `.env.example` | `.env.local`, `.env.example` |
| 2 | Config | Refactor `pricing.config.ts`: add `STRIPE_PRICES.INTRO` map, add `getIntroStripePriceId()`, rename `stripePriceId` to `recurringStripePriceId`, remove `discountAmountCents` from `PlanPricing` | `src/config/pricing.config.ts` |
| 3 | Backend | Refactor `subscription.service.ts`: replace `stripe.subscriptions.create()` with `stripe.subscriptionSchedules.create()`, add phase construction logic, retrieve client secret from schedule's subscription | `src/lib/stripe/subscription.service.ts` |
| 4 | Backend | Update `create-subscription/route.ts`: resolve both price IDs, pass `planDuration` to service | `src/app/api/payments/create-subscription/route.ts` |
| 5 | Backend | Update webhook handler: add `subscription_schedule.completed` and `subscription_schedule.canceled` cases | `src/app/api/payments/webhook/route.ts` |
| 6 | Frontend | Remove any references to `discountAmountCents` in display components (if any) | Check `PricingSection`, `CheckoutModal` |
| 7 | Testing | End-to-end testing of all 9 offer variations | Stripe test mode |

### E2. Testing Strategy

#### Unit Testing
- Mock `stripe.subscriptionSchedules.create()` and verify it receives correct `phases` array for each of the 9 plan+tier combinations
- Verify Phase 1 uses the correct introductory price ID
- Verify Phase 2 uses the correct recurring price ID
- Verify `end_behavior` is always `'release'`
- Verify `iterations: 1` on both phases

#### Integration Testing (Stripe Test Mode)

Test all **9 offer variations** using Stripe test card `4242 4242 4242 4242`:

| Test # | Plan | Tier | Expected Phase 1 Charge | Expected Phase 2 Charge |
|--------|------|------|------------------------|------------------------|
| 1 | 7-day | FIRST_DISCOUNT | 345 Kc | 995 Kc/month |
| 2 | 7-day | MAX_DISCOUNT | 325 Kc | 995 Kc/month |
| 3 | 7-day | FULL_PRICE | 495 Kc | 995 Kc/month |
| 4 | 1-month | FIRST_DISCOUNT | 695 Kc | 995 Kc/month |
| 5 | 1-month | MAX_DISCOUNT | 645 Kc | 995 Kc/month |
| 6 | 1-month | FULL_PRICE | 995 Kc | 995 Kc/month |
| 7 | 3-month | FIRST_DISCOUNT | 1,695 Kc | 2,395 Kc/quarter |
| 8 | 3-month | MAX_DISCOUNT | 1,595 Kc | 2,395 Kc/quarter |
| 9 | 3-month | FULL_PRICE | 2,395 Kc | 2,395 Kc/quarter |

**Verification checklist for each test:**
- [ ] Payment Element renders with correct amount
- [ ] Payment succeeds with test card
- [ ] Stripe Dashboard shows a Subscription Schedule with 2 phases
- [ ] Phase 1 shows correct introductory price
- [ ] Phase 2 shows correct recurring price
- [ ] `invoice.paid` webhook fires and order is created in database
- [ ] Subscription record is created in database with correct status
- [ ] Schedule `end_behavior` is `release`

#### Phase Transition Testing
- Use Stripe Test Clocks to advance time past Phase 1
- Verify Phase 2 invoice is generated at the correct recurring price
- Verify the schedule completes and subscription continues as standalone
- Verify `subscription_schedule.completed` webhook fires

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Subscription Schedule API behaves differently from regular subscriptions for payment confirmation | Medium | Retrieve subscription from schedule, expand `latest_invoice.payment_intent` -- same client secret flow |
| Existing webhook handlers don't recognize schedule-created subscriptions | Low | Schedule-created subscriptions fire the same `invoice.paid` and `customer.subscription.*` events |
| 9 env vars to manage per environment | Low | Document clearly, validate on app startup |
| `discountAmountCents` removal breaks frontend display | Low | Audit all components; `originalPriceCents` (strikethrough) still works independently |
| Phase transition fails silently | Low | Add `subscription_schedule.completed` webhook + monitoring |

---

## Files Modified (Summary)

| File | Change Type |
|------|------------|
| `.env.local` / `.env.example` | Add 9 introductory price env vars |
| `src/config/pricing.config.ts` | Refactor price ID structure, add intro price mapping |
| `src/lib/stripe/subscription.service.ts` | Replace `subscriptions.create` with `subscriptionSchedules.create` |
| `src/app/api/payments/create-subscription/route.ts` | Resolve both price IDs, pass to service |
| `src/app/api/payments/webhook/route.ts` | Add schedule event handlers |

**Frontend files unchanged** (API contract preserved).
