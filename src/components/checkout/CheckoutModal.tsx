'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import { usePostQuizState } from '@/hooks/usePostQuizState';
import type { PlanWithPricing } from '@/config/pricing.config';
import { formatPrice, getBillingPeriodText } from '@/config/pricing.config';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface CheckoutModalProps {
  plan: PlanWithPricing;
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Checkout Modal Component
 * Creates subscription with dynamic pricing tier and handles payment
 */
export function CheckoutModal({ plan, email, onSuccess, onCancel }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get pricing tier and cancel handler from global state
  const { pricingTier, handleCheckoutCanceled } = usePostQuizState();

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Zavřít"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Dokončení objednávky
            </h2>
            <p className="text-gray-600">
              Bezpečná platba zpracovaná přes Stripe
            </p>
          </div>

          {/* Plan Summary */}
          <div className="bg-linear-to-br from-purple-50 to-green-50 rounded-xl p-6 mb-6 border border-purple-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {billingPeriodText}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.initialPriceCents)} Kč
                </div>
                {plan.originalPriceCents && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(plan.originalPriceCents)} Kč
                  </div>
                )}
                {plan.discountAmountCents > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    Ušetříte {formatPrice(plan.discountAmountCents)} Kč
                  </div>
                )}
              </div>
            </div>

            {/* Recurring price notice */}
            {plan.recurringPriceCents !== plan.initialPriceCents && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Poznámka:</strong> Po prvním období bude cena {formatPrice(plan.recurringPriceCents)} Kč / {billingPeriodText}
                </p>
              </div>
            )}

            {/* Key Features */}
            <div className="border-t border-purple-200 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Zahrnuje:
              </p>
              <ul className="space-y-1">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li className="text-sm text-gray-500 italic">
                    + {plan.features.length - 3} dalších výhod
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Připravuji platební formulář...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="inline-block w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Nepodařilo se inicializovat platbu
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
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
        </div>
      </div>
    </div>
  );
}
