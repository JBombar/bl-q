'use client';

import { useState, FormEvent } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

interface StripeCheckoutFormProps {
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckoutForm({ orderId, onSuccess, onCancel }: StripeCheckoutFormProps) {
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
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', // Handle 3DS in-page
        confirmParams: {
          return_url: window.location.origin + '/payment-complete',
        },
      });

      if (submitError) {
        setErrorMessage(submitError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Poll for payment status
      await pollPaymentStatus(orderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (orderId: string) => {
    const maxAttempts = 30; // 30 attempts × 2s = 60s max
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/payments/status/${orderId}`);
        const data = await response.json();

        if (data.status === 'paid') {
          setIsProcessing(false);
          onSuccess();
          return;
        }

        if (data.status === 'failed') {
          setErrorMessage('Payment failed. Please try again.');
          setIsProcessing(false);
          return;
        }

        // Continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setErrorMessage('Payment verification timeout. Please check your order status.');
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
      <PaymentElement />

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`
            w-full py-4 rounded-xl font-semibold text-lg transition-all
            ${isProcessing || !stripe
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Processing...
            </span>
          ) : (
            'Pay Now'
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Your payment is secured by Stripe. We never see your card details.
      </p>
    </form>
  );
}
