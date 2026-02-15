'use client';

import { useState, FormEvent } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { formatPrice } from '@/config/pricing.config';

interface StripeCheckoutFormProps {
  // For subscriptions (new flow)
  subscriptionId?: string | null;
  amount?: number; // Amount in cents for display
  // For one-time payments (legacy flow)
  orderId?: string;
  // Common
  onSuccess: () => void;
  onCancel: () => void;
  // UI customization (optional)
  buttonText?: string;
  buttonClassName?: string;
  hideCancel?: boolean;
  hideSecurityText?: boolean;
}

export function StripeCheckoutForm({ subscriptionId, amount, orderId, onSuccess, onCancel, buttonText, buttonClassName, hideCancel, hideSecurityText }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', // Handle 3DS in-page
        confirmParams: {
          return_url: window.location.origin + '/payment-complete',
        },
      });

      if (submitError) {
        setErrorMessage(submitError.message || 'Platba selhala');
        setIsProcessing(false);
        return;
      }

      // If payment succeeded immediately (no 3DS), call onSuccess
      if (paymentIntent?.status === 'succeeded') {
        setIsProcessing(false);
        onSuccess();
        return;
      }

      // Poll for payment status
      if (subscriptionId) {
        // New subscription flow
        await pollSubscriptionStatus(subscriptionId);
      } else if (orderId) {
        // Legacy one-time payment flow
        await pollOrderStatus(orderId);
      } else {
        // If no ID provided, assume success after confirmPayment
        setIsProcessing(false);
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Došlo k neočekávané chybě');
      setIsProcessing(false);
    }
  };

  // Poll for subscription status (new flow)
  const pollSubscriptionStatus = async (subId: string) => {
    const maxAttempts = 30; // 30 attempts × 2s = 60s max
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/payments/subscription-status/${subId}`);
        const data = await response.json();

        if (data.status === 'active' || data.status === 'trialing') {
          setIsProcessing(false);
          onSuccess();
          return;
        }

        if (data.status === 'incomplete_expired' || data.status === 'canceled') {
          setErrorMessage('Platba selhala. Zkuste to prosím znovu.');
          setIsProcessing(false);
          return;
        }

        // Continue polling for 'incomplete' status
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setErrorMessage('Časový limit ověření platby. Zkontrolujte prosím stav objednávky.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Status poll error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setIsProcessing(false);
        }
      }
    };

    await poll();
  };

  // Poll for order status (legacy one-time payment flow)
  const pollOrderStatus = async (ordId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/payments/status/${ordId}`);
        const data = await response.json();

        if (data.status === 'paid') {
          setIsProcessing(false);
          onSuccess();
          return;
        }

        if (data.status === 'failed') {
          setErrorMessage('Platba selhala. Zkuste to prosím znovu.');
          setIsProcessing(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setErrorMessage('Časový limit ověření platby. Zkontrolujte prosím stav objednávky.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Status poll error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setIsProcessing(false);
        }
      }
    };

    await poll();
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement 
        options={{
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }}
      />

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={
            buttonClassName
              ? `${buttonClassName} ${isProcessing || !stripe ? 'opacity-50 cursor-not-allowed' : ''}`
              : `w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  isProcessing || !stripe
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#327455] text-white hover:bg-[#2a5f47] shadow-lg hover:shadow-xl'
                }`
          }
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Zpracovávám...
            </span>
          ) : buttonText ? (
            buttonText
          ) : amount ? (
            `Zaplatit ${formatPrice(amount)} Kč`
          ) : (
            'Zaplatit'
          )}
        </button>

        {!hideCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            Zrušit
          </button>
        )}
      </div>

      {!hideSecurityText && (
        <p className="mt-4 text-xs text-gray-500 text-center">
          Vaše platba je zabezpečena přes Stripe. Vaše údaje o kartě nikdy nevidíme.
        </p>
      )}
    </form>
  );
}
