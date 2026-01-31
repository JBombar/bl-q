'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import type { PricingPlan } from '@/config/sales-page.config';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface CheckoutModalProps {
  plan: PricingPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Checkout Modal Component
 * Wraps the Stripe payment form in a modal overlay
 * Handles PaymentIntent creation and error states
 */
export function CheckoutModal({ plan, onSuccess, onCancel }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent on mount
    async function createPaymentIntent() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: plan.id }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Payment intent creation error:', err);
        setError(err.message || 'Failed to initialize payment. Please try again.');
        setIsLoading(false);
      }
    }

    createPaymentIntent();
  }, [plan.id]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('cs-CZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onCancel}
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
          <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-xl p-6 mb-6 border border-purple-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {plan.billingPeriod}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(plan.priceCents)} Kč
                </div>
                {plan.originalPriceCents && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(plan.originalPriceCents)} Kč
                  </div>
                )}
              </div>
            </div>

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
              <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-[#F9A201] rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Připravujeme platbu...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-1">
                      Chyba při inicializaci platby
                    </h3>
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Zkusit znovu
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Zrušit
                </button>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {!isLoading && !error && clientSecret && orderId && (
            <div>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm
                  orderId={orderId}
                  onSuccess={onSuccess}
                  onCancel={onCancel}
                />
              </Elements>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>🔒</span>
                    <span>Zabezpečené šifrování</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>✓</span>
                    <span>30denní záruka vrácení peněz</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💳</span>
                    <span>Powered by Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
