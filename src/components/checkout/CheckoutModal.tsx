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
    // TEMPORARILY DISABLED: Payment integration will be added later
    // This prevents 500 errors while we focus on UI development

    // async function createPaymentIntent() {
    //   try {
    //     setIsLoading(true);
    //     setError(null);

    //     const response = await fetch('/api/payments/create-intent', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ planId: plan.id }),
    //     });

    //     if (!response.ok) {
    //       const errorData = await response.json().catch(() => ({}));
    //       throw new Error(errorData.error || 'Failed to create payment intent');
    //     }

    //     const data = await response.json();
    //     setClientSecret(data.clientSecret);
    //     setOrderId(data.orderId);
    //     setIsLoading(false);
    //   } catch (err: any) {
    //     console.error('Payment intent creation error:', err);
    //     setError(err.message || 'Failed to initialize payment. Please try again.');
    //     setIsLoading(false);
    //   }
    // }

    // createPaymentIntent();

    // Immediately set loading to false to show placeholder
    setIsLoading(false);
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
          <div className="bg-linear-to-br from-purple-50 to-green-50 rounded-xl p-6 mb-6 border border-purple-100">
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

          {/* PLACEHOLDER STATE - Payment integration disabled for UI development */}
          <div className="py-12">
            <div className="bg-linear-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-xl p-8 text-center">
              <div className="inline-block w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Platební brána se připravuje
              </h3>

              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Integrace platební brány bude dokončena v další fázi. Nyní se zaměřujeme na finální podobu stránky a její design.
              </p>

              <div className="bg-white rounded-lg p-4 mb-6 border border-purple-100">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Vybraný plán:</strong> {plan.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Cena:</strong> {formatPrice(plan.priceCents)} Kč / {plan.billingPeriod}
                </p>
              </div>

              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
