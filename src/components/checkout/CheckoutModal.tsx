'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripeCheckoutForm } from './StripeCheckoutForm';
import { usePostQuizState } from '@/hooks/usePostQuizState';
import type { PlanWithPricing } from '@/config/pricing.config';
import { formatPrice } from '@/config/pricing.config';
import { BONUS_MODULES } from '@/config/checkout-content';

// Lazy-load Stripe only when first needed (avoids global badge on non-checkout pages)
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

export interface CheckoutModalProps {
  plan: PlanWithPricing;
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Checkout Modal Component (Modal #2)
 * Single-column payment modal per Figma "Sales Modal 2" spec
 */
export function CheckoutModal({ plan, email, onSuccess, onCancel }: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get pricing tier from global state
  const { pricingTier } = usePostQuizState();

  // Handle checkout cancel - parent (SalesPage) manages pricing tier updates
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Create subscription on mount (AbortController cancels the HTTP request on unmount,
  // preventing duplicate Stripe subscriptions from React StrictMode double-fire)
  useEffect(() => {
    const abortController = new AbortController();

    async function createSubscription() {
      try {
        setIsLoading(true);
        setError(null);

        const requestBody = {
          planId: plan.id,
          pricingTier,
          email,
        };
        console.log('[CheckoutModal] Creating subscription:', requestBody);

        const response = await fetch('/api/payments/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[CheckoutModal] API error:', response.status, errorData);
          throw new Error(errorData.error || `Failed to create subscription (${response.status})`);
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setSubscriptionId(data.subscriptionId);

        // Persist Stripe IDs to Zustand for use in upsell flow
        usePostQuizState.getState().setSubscriptionIds(
          data.stripeSubscriptionId,
          data.stripeCustomerId || ''
        );

        setIsLoading(false);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Subscription creation error:', err);
        setError(err.message || 'Failed to initialize payment. Please try again.');
        setIsLoading(false);
      }
    }

    createSubscription();
    return () => { abortController.abort(); };
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

  // Calculate savings from original vs initial price
  const savingsAmount = plan.originalPriceCents
    ? plan.originalPriceCents - plan.initialPriceCents
    : 0;
  const savingsPercent = plan.originalPriceCents
    ? Math.round((savingsAmount / plan.originalPriceCents) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />

      {/* Modal Card */}
      <motion.div
        className="relative bg-white rounded-[10px] shadow-2xl w-full max-w-[500px] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto p-4 sm:p-6 font-figtree"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >

        {/* 1. Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-[16px] sm:text-[18px] font-bold text-[#292424] flex-1 text-center pl-8">
            Vyber si způsob platby
          </h2>
          <button
            onClick={handleCancel}
            className="w-8 h-8 bg-[#f6f6f6] rounded-[10px] flex items-center justify-center shrink-0"
            aria-label="Zavřít"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="#292424" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 2. Payment Method Tabs */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-5">
          {/* Digital Wallets (Apple Pay & Google Pay) */}
          <div className="flex-1 border border-[#e4e4e4] rounded-[10px] h-[80px] sm:h-[100px] flex flex-col items-center justify-center gap-2">
            {/* Google Pay Logo */}
            <img
              src="/icons/google_pay.svg"
              alt="Google Pay"
              width={52}
              height={20}
              className="w-[52px] h-[20px]"
            />
            
            {/* Apple Pay Logo */}
            <img
              src="/icons/apple_pay.svg"
              alt="Apple Pay"
              width={52}
              height={20}
              className="w-[52px] h-[20px]"
            />
          </div>

          {/* Card Payment (selected) */}
          <div className="flex-1 border border-[#327455] rounded-[10px] h-[80px] sm:h-[100px] flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[14px] sm:text-[18px] font-bold text-[#292424]">Platba kartou</span>
            <div className="flex gap-1.5 sm:gap-2">
              <div className="w-[40px] sm:w-[49px] h-[27px] sm:h-[33px] border border-[#e4e4e4] rounded-[4px] flex items-center justify-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#1A1F71] italic">VISA</span>
              </div>
              <div className="w-[40px] sm:w-[49px] h-[27px] sm:h-[33px] border border-[#e4e4e4] rounded-[4px] flex items-center justify-center">
                <div className="flex">
                  <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-[#EB001B]" />
                  <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-[#F79E1B] -ml-1.5 sm:-ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Total Section */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[16px] sm:text-[18px] font-bold text-[#292424]">Celkem:</span>
            <span className="text-[16px] sm:text-[18px] font-bold text-[#292424]">
              {formatPrice(plan.initialPriceCents)} Kč
            </span>
          </div>
          {savingsAmount > 0 && (
            <p className="text-[12px] sm:text-[14px] font-bold text-[#e60000] text-right leading-[18.2px] mt-1">
              Právě jsi ušetřila {formatPrice(savingsAmount)} Kč (sleva {savingsPercent}%)
            </p>
          )}
        </div>

        {/* 4. Order Summary */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
          {/* Main plan row */}
          <div className="flex items-baseline gap-1">
            <span className="text-[13px] sm:text-[15px] font-normal text-[#919191] truncate min-w-0">
              Plán vnitřního klidu
            </span>
            <div className="flex-1 border-b border-dotted border-[#919191] min-w-[8px] sm:min-w-[20px] self-end mb-[3px]" />
            {plan.originalPriceCents && (
              <span className="text-[13px] sm:text-[15px] font-normal text-[#919191] line-through whitespace-nowrap shrink-0">
                {formatPrice(plan.originalPriceCents)} Kč
              </span>
            )}
            <span className="text-[14px] sm:text-[16px] font-bold text-[#327455] whitespace-nowrap shrink-0 ml-1">
              {formatPrice(plan.initialPriceCents)} Kč
            </span>
          </div>

          {/* Bonus module rows */}
          {BONUS_MODULES.map((module) => (
            <div key={module.id} className="flex items-baseline gap-1">
              <span className="text-[13px] sm:text-[15px] font-normal text-[#919191] truncate min-w-0">
                {module.name}
              </span>
              <div className="flex-1 border-b border-dotted border-[#919191] min-w-[8px] sm:min-w-[20px] self-end mb-[3px]" />
              <span className="text-[13px] sm:text-[15px] font-normal text-[#919191] line-through whitespace-nowrap shrink-0">
                {formatPrice(module.originalPriceCents)} Kč
              </span>
              <span className="text-[14px] sm:text-[16px] font-bold text-[#327455] whitespace-nowrap shrink-0 ml-1">
                0 Kč
              </span>
            </div>
          ))}
        </div>

        {/* 5. Stripe Payment Form */}
        {isLoading && (
          <div className="py-6 sm:py-8 text-center">
            <div className="inline-block w-10 h-10 border-4 border-[#e6eeeb] border-t-[#327455] rounded-full animate-spin mb-4" />
            <p className="text-[#919191] text-[14px]">Připravuji platební formulář...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="py-4 sm:py-6">
            <div className="bg-red-50 border border-red-200 rounded-[10px] p-4 sm:p-5 text-center">
              <h3 className="text-[14px] sm:text-[16px] font-bold text-red-900 mb-2">
                Nepodařilo se inicializovat platbu
              </h3>
              <p className="text-red-700 mb-4 text-[13px] sm:text-[14px]">{error}</p>
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 bg-[#292424] text-white rounded-[10px] hover:bg-[#3a3a3a] transition-colors text-[14px]"
              >
                Zavřít
              </button>
            </div>
          </div>
        )}

        {clientSecret && !isLoading && !error && (
          <Elements
            stripe={getStripe()}
            options={{
              clientSecret,
              locale: 'cs',
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#327455',
                  colorBackground: '#ffffff',
                  colorText: '#292424',
                  colorDanger: '#e60000',
                  fontFamily: 'Figtree, system-ui, sans-serif',
                  borderRadius: '0px',
                  spacingUnit: '4px',
                },
                rules: {
                  '.Input': {
                    border: '1px solid #e1e1e1',
                    borderRadius: '0px',
                    fontSize: '15px',
                    padding: '12px',
                  },
                  '.Input:focus': {
                    border: '1px solid #327455',
                    boxShadow: 'none',
                  },
                },
              },
            }}
          >
            <StripeCheckoutForm
              onSuccess={onSuccess}
              onCancel={handleCancel}
              amount={plan.initialPriceCents}
              subscriptionId={subscriptionId}
              buttonText="ZAPLATIT"
              buttonClassName="w-full h-12 sm:h-14 bg-[#f9a201] hover:bg-[#e09201] active:scale-[0.98] text-white text-[16px] font-extrabold rounded-[10px] transition-all uppercase tracking-wide"
              hideCancel
              hideSecurityText
            />
          </Elements>
        )}

        {/* 6. Security Badge (placeholder for user-provided image) */}
        <div className="flex justify-center mt-3 sm:mt-4 pb-2">
          <div className="h-[35px] flex items-center gap-2 text-[12px] text-[#919191]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#919191" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Zabezpečená platba přes Stripe</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
