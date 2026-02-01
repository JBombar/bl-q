/**
 * Subscription Plans Configuration
 * Defines recurring billing plans with introductory discounts
 */

export interface SubscriptionOffer {
  id: string;
  name: string;
  description: string;
  stripePriceId: string; // Full recurring price ID from Stripe
  billingInterval: 'month' | 'year';
  recurringPriceCents: number; // Full recurring price in cents
  initialDiscountCents: number; // One-time discount on first invoice
  effectiveFirstPaymentCents: number; // What customer pays on first invoice
  features: string[];
  badge?: string;
  isRecommended: boolean;
}

/**
 * Subscription offers available after quiz completion
 *
 * IMPORTANT: You must create these prices in your Stripe Dashboard:
 * 1. Create a Product for the subscription
 * 2. Create recurring prices for each billing interval
 * 3. Copy the price IDs (price_xxx) to this config
 */
export const SUBSCRIPTION_OFFERS: SubscriptionOffer[] = [
  {
    id: 'monthly-intro',
    name: 'Mesicni plan',
    description: 'Kompletni pristup k programu s mesicni platbou',
    stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
    billingInterval: 'month',
    recurringPriceCents: 99900, // 999 CZK/month recurring
    initialDiscountCents: 50000, // 500 CZK discount on first month
    effectiveFirstPaymentCents: 49900, // 499 CZK first month
    features: [
      'Plny pristup k programu',
      'Denni cviceni a techniky',
      'Sledovani pokroku',
      'Komunitni podpora',
      'Email podpora',
    ],
    isRecommended: false,
  },
  {
    id: 'yearly-intro',
    name: 'Rocni plan',
    description: 'Nejlepsi hodnota - usetri 40% s rocni platbou',
    stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder',
    billingInterval: 'year',
    recurringPriceCents: 699900, // 6,999 CZK/year recurring
    initialDiscountCents: 200000, // 2,000 CZK discount on first year
    effectiveFirstPaymentCents: 499900, // 4,999 CZK first year
    features: [
      'Vse z mesicniho planu',
      'Usetri 40% oproti mesicni platbe',
      'Bonusove materialy',
      'Prioritni podpora',
      '3x individualni konzultace',
    ],
    badge: 'NEJLEPSI HODNOTA',
    isRecommended: true,
  },
];

/**
 * Get subscription offer by ID
 */
export function getSubscriptionOfferById(offerId: string): SubscriptionOffer | undefined {
  return SUBSCRIPTION_OFFERS.find(offer => offer.id === offerId);
}

/**
 * Get recommended subscription offer
 */
export function getRecommendedSubscriptionOffer(): SubscriptionOffer {
  return SUBSCRIPTION_OFFERS.find(offer => offer.isRecommended) || SUBSCRIPTION_OFFERS[0];
}

/**
 * Validate that an offer ID exists
 */
export function isValidOfferId(offerId: string): boolean {
  return SUBSCRIPTION_OFFERS.some(offer => offer.id === offerId);
}
