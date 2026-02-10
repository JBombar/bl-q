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
  introStripePriceId: string;       // Stripe Price ID for Phase 1 (introductory)
}

export interface SubscriptionPlan {
  id: string;                       // Unique plan identifier
  duration: PlanDuration;
  name: string;                     // Display name
  durationDays: number;             // Duration in days (for calculations)
  billingInterval: BillingInterval;
  recurringStripePriceId: string;   // Stripe recurring price ID (Phase 2)
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
  // Phase 2: Standard recurring prices
  RECURRING_MONTHLY: process.env.STRIPE_PRICE_MONTHLY_995 || 'price_monthly_placeholder',
  RECURRING_QUARTERLY: process.env.STRIPE_PRICE_QUARTERLY_2395 || 'price_quarterly_placeholder',

  // Phase 1: Introductory prices (per plan x tier)
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
    recurringStripePriceId: STRIPE_PRICES.RECURRING_MONTHLY,
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
    recurringStripePriceId: STRIPE_PRICES.RECURRING_MONTHLY,
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
    recurringStripePriceId: STRIPE_PRICES.RECURRING_QUARTERLY,
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
      introStripePriceId: STRIPE_PRICES.INTRO['7_days'].FIRST_DISCOUNT,
    },
    MAX_DISCOUNT: {
      initialPriceCents: 32500,      // 325 Kc
      originalPriceCents: 49500,     // 495 Kc (crossed out)
      perDayPriceCents: 4600,        // 46 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      introStripePriceId: STRIPE_PRICES.INTRO['7_days'].MAX_DISCOUNT,
    },
    FULL_PRICE: {
      initialPriceCents: 49500,      // 495 Kc
      originalPriceCents: null,      // No crossed-out price
      perDayPriceCents: 7000,        // 70 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      introStripePriceId: STRIPE_PRICES.INTRO['7_days'].FULL_PRICE,
    },
  },
  '1_month': {
    FIRST_DISCOUNT: {
      initialPriceCents: 69500,      // 695 Kc
      originalPriceCents: 99500,     // 995 Kc (crossed out)
      perDayPriceCents: 2300,        // 23 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      introStripePriceId: STRIPE_PRICES.INTRO['1_month'].FIRST_DISCOUNT,
    },
    MAX_DISCOUNT: {
      initialPriceCents: 64500,      // 645 Kc
      originalPriceCents: 99500,     // 995 Kc (crossed out)
      perDayPriceCents: 2100,        // 21 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      introStripePriceId: STRIPE_PRICES.INTRO['1_month'].MAX_DISCOUNT,
    },
    FULL_PRICE: {
      initialPriceCents: 99500,      // 995 Kc
      originalPriceCents: null,      // No crossed-out price
      perDayPriceCents: 3300,        // 33 Kc/day
      recurringPriceCents: 99500,    // 995 Kc/month recurring
      introStripePriceId: STRIPE_PRICES.INTRO['1_month'].FULL_PRICE,
    },
  },
  '3_months': {
    FIRST_DISCOUNT: {
      initialPriceCents: 169500,     // 1,695 Kc
      originalPriceCents: 239500,    // 2,395 Kc (crossed out)
      perDayPriceCents: 1800,        // 18 Kc/day
      recurringPriceCents: 239500,   // 2,395 Kc/3 months recurring
      introStripePriceId: STRIPE_PRICES.INTRO['3_months'].FIRST_DISCOUNT,
    },
    MAX_DISCOUNT: {
      initialPriceCents: 159500,     // 1,595 Kc
      originalPriceCents: 239500,    // 2,395 Kc (crossed out)
      perDayPriceCents: 1700,        // 17 Kc/day
      recurringPriceCents: 239500,   // 2,395 Kc/3 months recurring
      introStripePriceId: STRIPE_PRICES.INTRO['3_months'].MAX_DISCOUNT,
    },
    FULL_PRICE: {
      initialPriceCents: 239500,     // 2,395 Kc
      originalPriceCents: null,      // No crossed-out price
      perDayPriceCents: 2600,        // 26 Kc/day
      recurringPriceCents: 239500,   // 2,395 Kc/3 months recurring
      introStripePriceId: STRIPE_PRICES.INTRO['3_months'].FULL_PRICE,
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
 * Get introductory Stripe Price ID for a given plan duration and pricing tier
 */
export function getIntroStripePriceId(
  duration: PlanDuration,
  tier: PricingTier
): string {
  return STRIPE_PRICES.INTRO[duration][tier];
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

/**
 * Generate dynamic disclaimer text based on the selected plan
 * This provides legally accurate pricing information for each plan duration
 */
export function getDynamicDisclaimerText(plan: PlanWithPricing): string {
  const initialPrice = formatPrice(plan.initialPriceCents);
  const recurringPrice = formatPrice(plan.recurringPriceCents);

  let periodText = '';

  if (plan.duration === '7_days') {
    periodText = `s úvodním týdnem za ${initialPrice} Kč, který poté automaticky přejde na měsíční předplatné za ${recurringPrice} Kč`;
  } else if (plan.duration === '1_month') {
    periodText = `s úvodním měsícem za ${initialPrice} Kč, který poté automaticky přejde na měsíční předplatné za ${recurringPrice} Kč`;
  } else if (plan.duration === '3_months') {
    periodText = `s úvodními 3 měsíci za ${initialPrice} Kč, které poté automaticky přejdou na 3-měsíční předplatné za ${recurringPrice} Kč`;
  }

  return `Kliknutím na „CHCI SVŮJ PLÁN" souhlasíte ${periodText}, pokud nebude zrušeno. Zrušit lze v aplikaci nebo e-mailem: podpora@betterlady.cz. Podrobnosti viz Podmínky předplatného.`;
}
