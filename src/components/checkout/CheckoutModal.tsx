'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import { usePostQuizState } from '@/hooks/usePostQuizState';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import type { PlanWithPricing } from '@/config/pricing.config';
import { formatPrice, getBillingPeriodText } from '@/config/pricing.config';
import { PLAN_SECTIONS, COUNTDOWN_TIMER } from '@/config/sales-page-content';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface CheckoutModalProps {
  plan: PlanWithPricing;
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Theoretical values for value stacking (in Kč)
const THEORETICAL_VALUES = [2500, 1500, 1000, 800];

// Value items for the "Added to your plan" section
// Using the 4 main pillars from PLAN_SECTIONS with theoretical values
const VALUE_ITEMS = PLAN_SECTIONS.map((section, index) => ({
  id: section.number,
  title: section.title,
  theoreticalValue: THEORETICAL_VALUES[index] ?? 500, // Default to 500 if undefined
}));

/**
 * Checkout Modal Component - "Value Reinforcement" Design
 * Two-column layout with value stack (left) and payment action (right)
 */
export function CheckoutModal({ plan, email, onSuccess, onCancel }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  // Get pricing tier and cancel handler from global state
  const { pricingTier, handleCheckoutCanceled, funnelData } = usePostQuizState();

  // Countdown timer
  const { formattedTime, isExpired } = useCountdownTimer({
    durationSeconds: COUNTDOWN_TIMER.durationSeconds,
    storageKey: 'checkout-modal-timer',
    autoStart: true,
  });

  // Handle checkout cancel - triggers MAX_DISCOUNT tier
  const handleCancel = useCallback(() => {
    handleCheckoutCanceled();
    onCancel();
  }, [handleCheckoutCanceled, onCancel]);

  useEffect(() => {
    async function createSubscription() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/payments/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: plan.id,
            pricingTier,
            email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create subscription');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setSubscriptionId(data.subscriptionId);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Subscription creation error:', err);
        setError(err.message || 'Failed to initialize payment. Please try again.');
        setIsLoading(false);
      }
    }

    createSubscription();
  }, [plan.id, pricingTier, email]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleCancel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const billingPeriodText = getBillingPeriodText(plan.billingInterval);
  const firstName = funnelData?.firstName || '';

  // Calculate savings
  const savingsAmount = plan.discountAmountCents;
  const savingsPercent = plan.originalPriceCents
    ? Math.round((savingsAmount / plan.originalPriceCents) * 100)
    : 0;

  // Calculate total theoretical value of all included items
  const totalTheoreticalValue = VALUE_ITEMS.reduce((sum, item) => sum + item.theoreticalValue, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10 bg-white/80"
          aria-label="Zavřít"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row">
          {/* ===== LEFT COLUMN: Value Stack ===== */}
          <div className={`flex-1 p-5 sm:p-8 ${showPaymentSection ? 'hidden lg:block' : ''} lg:border-r border-gray-200`}>
            {/* Header */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 pr-8">
              Tvůj osobní plán
            </h2>

            {/* Countdown Timer Banner */}
            {!isExpired && (
              <div className="bg-[#327455] text-white rounded-lg px-4 py-3 mb-5 sm:mb-6 flex items-center justify-between">
                <span className="text-sm sm:text-base font-medium">
                  TVOJE SLEVA JE REZERVOVÁNA NA:
                </span>
                <span className="text-lg sm:text-xl font-bold tabular-nums">
                  {formattedTime.minutes}:{formattedTime.seconds}
                </span>
              </div>
            )}

            {/* Selected Plan Summary */}
            <div className="flex items-center gap-4 pb-5 sm:pb-6 border-b border-gray-200 mb-5 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Metoda vnitřního klidu</p>
                <p className="font-semibold text-gray-900">{plan.name}</p>
                <p className="text-sm text-[#327455] font-medium">Plný přístup</p>
              </div>
            </div>

            {/* "Added to Your Plan" Section */}
            <div className="mb-6 sm:mb-8">
              <p className="text-gray-700 mb-1">
                {firstName && <span className="text-[#327455] font-semibold">{firstName},</span>}
              </p>
              <p className="text-gray-700 mb-4 sm:mb-5">
                Na základě tvého profilu jsme do tvého plánu přidali tyto moduly{' '}
                <span className="text-[#327455] font-semibold">pro zajištění úspěchu:</span>
              </p>

              {/* Value Items List */}
              <div className="space-y-3">
                {VALUE_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 last:border-b-0"
                  >
                    <span className="text-sm sm:text-base text-gray-700 pr-4 flex-1">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(item.theoreticalValue * 100)} Kč
                      </span>
                      <span className="text-sm text-[#327455] font-semibold">
                        0 Kč
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Value Saved */}
              <div className="mt-4 pt-3 border-t border-gray-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Celková hodnota bonusů:</span>
                  <span className="font-semibold text-[#327455]">
                    {formatPrice(totalTheoreticalValue * 100)} Kč zdarma
                  </span>
                </div>
              </div>
            </div>

            {/* Continue Button (Mobile: Shows payment section, Desktop: Scrolls) */}
            <button
              onClick={() => setShowPaymentSection(true)}
              className="w-full py-4 bg-[#327455] text-white rounded-xl font-semibold text-lg hover:bg-[#2a5f47] transition-colors shadow-lg lg:hidden"
            >
              Pokračovat k platbě
            </button>

            {/* Desktop Continue hint */}
            <div className="hidden lg:block text-center text-sm text-gray-500 mt-4">
              Dokončete objednávku v pravém sloupci →
            </div>
          </div>

          {/* ===== RIGHT COLUMN: Payment Action ===== */}
          <div className={`flex-1 p-5 sm:p-8 bg-gray-50 ${!showPaymentSection ? 'hidden lg:block' : ''}`}>
            {/* Mobile Back Button */}
            <button
              onClick={() => setShowPaymentSection(false)}
              className="lg:hidden flex items-center gap-2 text-gray-600 mb-4 -mt-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Zpět</span>
            </button>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 sm:mb-6">
              Vyberte platební metodu
            </h3>

            {/* Payment Method Selector */}
            <div className="flex gap-3 mb-5 sm:mb-6">
              {/* Credit Card Option - Selected */}
              <div className="flex-1 p-3 sm:p-4 border-2 border-[#327455] rounded-xl bg-white cursor-pointer">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Platební karta</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  {/* Card Logos */}
                  <CreditCardIcon type="visa" />
                  <CreditCardIcon type="mastercard" />
                  <CreditCardIcon type="maestro" />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-4 sm:p-5 mb-5 sm:mb-6 border border-gray-200">
              {/* Total Line */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="font-semibold text-gray-900">Celkem:</span>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatPrice(plan.initialPriceCents)} Kč
                  </span>
                </div>
              </div>

              {/* Savings Badge */}
              {savingsAmount > 0 && (
                <div className="text-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-[#327455] font-semibold text-sm sm:text-base">
                    Právě ušetříte {formatPrice(savingsAmount)} Kč ({savingsPercent}% sleva)!
                  </span>
                </div>
              )}

              {/* Order Breakdown */}
              <div className="space-y-2 text-sm">
                {/* Plan Item */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{plan.name}</span>
                  <div className="flex items-center gap-2">
                    {plan.originalPriceCents && (
                      <span className="text-gray-400 line-through text-xs">
                        {formatPrice(plan.originalPriceCents)} Kč
                      </span>
                    )}
                    <span className="text-gray-900 font-medium">
                      {formatPrice(plan.initialPriceCents)} Kč
                    </span>
                  </div>
                </div>

                {/* Included Bonuses */}
                {VALUE_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 truncate pr-2">{item.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-gray-400 line-through">
                        {formatPrice(item.theoreticalValue * 100)} Kč
                      </span>
                      <span className="text-[#327455] font-medium">0 Kč</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
              <TrustBadge type="visa" />
              <TrustBadge type="mastercard" />
              <TrustBadge type="maestro" />
              <TrustBadge type="amex" />
              <TrustBadge type="discover" />
              <TrustBadge type="diners" />
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="py-8 sm:py-12 text-center">
                <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">Připravuji platební formulář...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="py-6 sm:py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 sm:p-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full mb-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-red-900 mb-2">
                    Nepodařilo se inicializovat platbu
                  </h3>
                  <p className="text-red-700 mb-4 text-sm sm:text-base">{error}</p>
                  <button
                    onClick={handleCancel}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                  >
                    Zavřít
                  </button>
                </div>
              </div>
            )}

            {/* Payment Form */}
            {clientSecret && !isLoading && !error && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#327455',
                      colorBackground: '#ffffff',
                      colorText: '#292424',
                      colorDanger: '#dc2626',
                      fontFamily: 'Figtree, system-ui, sans-serif',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <StripeCheckoutForm
                  onSuccess={onSuccess}
                  onCancel={handleCancel}
                  amount={plan.initialPriceCents}
                  subscriptionId={subscriptionId}
                />
              </Elements>
            )}

            {/* Security Note */}
            <p className="mt-4 text-xs text-gray-500 text-center">
              Vaše platba je zabezpečena přes Stripe. Vaše údaje o kartě nikdy nevidíme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Credit Card Icon Component (small, for selector)
function CreditCardIcon({ type }: { type: 'visa' | 'mastercard' | 'maestro' }) {
  const colors = {
    visa: { bg: '#1A1F71', text: 'VISA' },
    mastercard: { bg1: '#EB001B', bg2: '#F79E1B' },
    maestro: { bg1: '#0066CB', bg2: '#CC0000' },
  };

  if (type === 'visa') {
    return (
      <div className="w-8 h-5 sm:w-10 sm:h-6 bg-[#1A1F71] rounded flex items-center justify-center">
        <span className="text-white text-[8px] sm:text-[10px] font-bold italic">VISA</span>
      </div>
    );
  }

  if (type === 'mastercard') {
    return (
      <div className="w-8 h-5 sm:w-10 sm:h-6 bg-gray-100 rounded flex items-center justify-center">
        <div className="flex">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#EB001B]" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#F79E1B] -ml-1.5 sm:-ml-2" />
        </div>
      </div>
    );
  }

  // Maestro
  return (
    <div className="w-8 h-5 sm:w-10 sm:h-6 bg-gray-100 rounded flex items-center justify-center">
      <div className="flex">
        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#0066CB]" />
        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#CC0000] -ml-1.5 sm:-ml-2" />
      </div>
    </div>
  );
}

// Trust Badge Component
function TrustBadge({ type }: { type: 'visa' | 'mastercard' | 'maestro' | 'amex' | 'discover' | 'diners' }) {
  const badges: Record<string, { bg: string; content: React.ReactNode }> = {
    visa: {
      bg: 'bg-[#1A1F71]',
      content: <span className="text-white text-[9px] sm:text-[11px] font-bold italic">VISA</span>,
    },
    mastercard: {
      bg: 'bg-white border border-gray-200',
      content: (
        <div className="flex">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#EB001B]" />
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#F79E1B] -ml-1.5 sm:-ml-2" />
        </div>
      ),
    },
    maestro: {
      bg: 'bg-white border border-gray-200',
      content: (
        <div className="flex">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#0066CB]" />
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#CC0000] -ml-1.5 sm:-ml-2" />
        </div>
      ),
    },
    amex: {
      bg: 'bg-[#006FCF]',
      content: <span className="text-white text-[8px] sm:text-[10px] font-bold">AMEX</span>,
    },
    discover: {
      bg: 'bg-[#FF6600]',
      content: <span className="text-white text-[7px] sm:text-[9px] font-bold">DISCOVER</span>,
    },
    diners: {
      bg: 'bg-[#004A97]',
      content: <span className="text-white text-[7px] sm:text-[9px] font-bold">DINERS</span>,
    },
  };

  const badge = badges[type];

  if (!badge) {
    return null;
  }

  return (
    <div className={`w-10 h-6 sm:w-12 sm:h-7 ${badge.bg} rounded flex items-center justify-center`}>
      {badge.content}
    </div>
  );
}
