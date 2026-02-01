/**
 * Dynamic Subscription Pricing Configuration
 *
 * Supports three pricing tiers triggered by user behavior:
 * - FIRST_DISCOUNT: Initial offer (default)
 * - MAX_DISCOUNT: Downsell offer (after checkout cancel)
 * - FULL_PRICE: Expired offer (after timer expires)
 *
 * IMPORTANT: Discount applies ONLY to the first billing cycle.
 * All subsequent recurring payments use the full recurring price.
 */

// ============================================================================
// TYPES
// ============================================================================

export type PricingTier = 'FIRST_DISCOUNT' | 'MAX_DISCOUNT' | 'FULL_PRICE';
export type PlanDuration = '7_days' | '1_month' | '3_months';
export type BillingInterval = 'month' | 'quarter';

export interface PlanPricing {
  initialPriceCents: number;        // What customer pays on first invoice
  originalPriceCents: number | null; // Crossed-out price (null = no discount shown)
  perDayPriceCents: number;         // Per-day price for display
  recurringPriceCents: number;      // Full recurring price after first period
  discountAmountCents: number;      // Discount applied to first invoice
}

export interface SubscriptionPlan {
  id: string;                       // Unique plan identifier
  duration: PlanDuration;
  name: string;                     // Display name
  durationDays: number;             // Duration in days (for calculations)
  billingInterval: BillingInterval;
  stripePriceId: string;            // Stripe recurring price ID
  isRecommended: boolean;
  badge?: string;
  features: string[];
}

export interface TieredPricing {
  FIRST_DISCOUNT: PlanPricing;
  MAX_DISCOUNT: PlanPricing;
  FULL_PRICE: PlanPricing;
}

// Combined type for components
export type PlanWithPricing = SubscriptionPlan & PlanPricing;

// ============================================================================
// STRIPE PRICE IDS (from environment)
// ============================================================================

export const STRIPE_PRICES = {
  MONTHLY: process.env.STRIPE_PRICE_MONTHLY_995 || 'price_monthly_placeholder',
  QUARTERLY: process.env.STRIPE_PRICE_QUARTERLY_2395 || 'price_quarterly_placeholder',
} as const;

// ============================================================================
// PLAN DEFINITIONS
// ============================================================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_7_days',
    duration: '7_days',
    name: '7 dni',
    durationDays: 7,
    billingInterval: 'month',
    stripePriceId: STRIPE_PRICES.MONTHLY,
    isRecommended: false,
    features: [
      'Plny pristup k programu',
      'Zakladni moduly',
      'Denni cviceni',
    ],
  },
  {
    id: 'plan_1_month',
    duration: '1_month',
    name: '1 mesic',
    durationDays: 30,
    billingInterval: 'month',
    stripePriceId: STRIPE_PRICES.MONTHLY,
    isRecommended: true,
    badge: 'Nejoblibenejsi volba',
    features: [
      'Plny pristup k programu',
      'Vsechny moduly',
      'Kruh duvery',
      'Osobni mapa pokroku',
    ],
  },
  {
    id: 'plan_3_months',
    duration: '3_months',
    name: '3 mesice',
    durationDays: 90,
    billingInterval: 'quarter',
    stripePriceId: STRIPE_PRICES.QUARTERLY,
    isRecommended: false,
    features: [
      'Vse z mesicniho planu',
      'Nejlepsi hodnota',
      'Dlouhodoba podpora',
      'Bonusove materialy',
    ],
  },
];

// ============================================================================
// TIERED PRICING DATA
// All prices in halere (cents) - divide by 100 for Kc
// ============================================================================

export const TIERED_PRICING: Record<PlanDuration, TieredPricing> = {
  '7_days': {
    FIRST_DISCOUNT: {
      initialPriceCents: 34500,      // 345 Kc
      originalPriceCents: 49500,     // 495 Kc (crossed out)
      perDayPriceCents: 4900,        // 49 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      discountAmountCents: 65000,    // 995 - 345 = 650 Kc discount
    },
    MAX_DISCOUNT: {
      initialPriceCents: 32500,      // 325 Kc
      originalPriceCents: 49500,     // 495 Kc (crossed out)
      perDayPriceCents: 4600,        // 46 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      discountAmountCents: 67000,    // 995 - 325 = 670 Kc discount
    },
    FULL_PRICE: {
      initialPriceCents: 49500,      // 495 Kc
      originalPriceCents: null,      // No crossed-out price
      perDayPriceCents: 7000,        // 70 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      discountAmountCents: 50000,    // 995 - 495 = 500 Kc discount
    },
  },
  '1_month': {
    FIRST_DISCOUNT: {
      initialPriceCents: 69500,      // 695 Kc
      originalPriceCents: 99500,     // 995 Kc (crossed out)
      perDayPriceCents: 2300,        // 23 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      discountAmountCents: 30000,    // 995 - 695 = 300 Kc discount
    },
    MAX_DISCOUNT: {
      initialPriceCents: 64500,      // 645 Kc
      originalPriceCents: 99500,     // 995 Kc (crossed out)
      perDayPriceCents: 2100,        // 21 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      discountAmountCents: 35000,    // 995 - 645 = 350 Kc discount
    },
    FULL_PRICE: {
      initialPriceCents: 99500,      // 995 Kc
      originalPriceCents: null,      // No crossed-out price
      perDayPriceCents: 3300,        // 33 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      discountAmountCents: 0,        // No discount
    },
  },
  '3_months': {
    FIRST_DISCOUNT: {
      initialPriceCents: 169500,     // 1,695 Kc
      originalPriceCents: 239500,    // 2,395 Kc (crossed out)
      perDayPriceCents: 1800,        // 18 Kc/day
      recurringPriceCents: 239500,   // 2,395 Kc/3 months recurring
      discountAmountCents: 70000,    // 2395 - 1695 = 700 Kc discount
    },
    MAX_DISCOUNT: {
      initialPriceCents: 159500,     // 1,595 Kc
      originalPriceCents: 239500,    // 2,395 Kc (crossed out)
      perDayPriceCents: 1700,        // 17 Kc/day
      recurringPriceCents: 239500,   // 2,395 Kc/3 months recurring
      discountAmountCents: 80000,    // 2395 - 1595 = 800 Kc discount
    },
    FULL_PRICE: {
      initialPriceCents: 239500,     // 2,395 Kc
      originalPriceCents: null,      // No crossed-out price
      perDayPriceCents: 2600,        // 26 Kc/day
      recurringPriceCents: 239500,   // 2,395 Kc/3 months recurring
      discountAmountCents: 0,        // No discount
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

/**
 * Get pricing for a specific plan and tier
 */
export function getPlanPricing(
  planId: string,
  tier: PricingTier
): PlanPricing | undefined {
  const plan = getPlanById(planId);
  if (!plan) return undefined;
  return TIERED_PRICING[plan.duration][tier];
}

/**
 * Get complete plan with pricing for a specific tier
 */
export function getPlanWithPricing(
  planId: string,
  tier: PricingTier
): PlanWithPricing | undefined {
  const plan = getPlanById(planId);
  const pricing = getPlanPricing(planId, tier);
  if (!plan || !pricing) return undefined;
  return { ...plan, ...pricing };
}

/**
 * Get all plans with pricing for a specific tier
 */
export function getAllPlansWithPricing(tier: PricingTier): PlanWithPricing[] {
  return SUBSCRIPTION_PLANS.map(plan => ({
    ...plan,
    ...TIERED_PRICING[plan.duration][tier],
  }));
}

/**
 * Get recommended plan ID
 */
export function getRecommendedPlanId(): string {
  const recommended = SUBSCRIPTION_PLANS.find(plan => plan.isRecommended);
  return recommended?.id || SUBSCRIPTION_PLANS[0]?.id || 'plan_1_month';
}

/**
 * Format price for display (cents to Kc with locale formatting)
 */
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Get billing period display text
 */
export function getBillingPeriodText(interval: BillingInterval): string {
  return interval === 'month' ? 'mesic' : '3 mesice';
}

/**
 * Get recurring price display text
 */
export function getRecurringPriceText(
  recurringPriceCents: number,
  interval: BillingInterval
): string {
  const price = formatPrice(recurringPriceCents);
  const period = interval === 'month' ? 'mesic' : '3 mesice';
  return `${price} Kc / ${period}`;
}

/**
 * Validate plan ID
 */
export function isValidPlanId(planId: string): boolean {
  return SUBSCRIPTION_PLANS.some(plan => plan.id === planId);
}

/**
 * Validate pricing tier
 */
export function isValidPricingTier(tier: string): tier is PricingTier {
  return ['FIRST_DISCOUNT', 'MAX_DISCOUNT', 'FULL_PRICE'].includes(tier);
}
