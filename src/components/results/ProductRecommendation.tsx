'use client';

import { useState, lazy, Suspense } from 'react';
import type { ProductOffer } from '@/types';

// Lazy load checkout components (only loads when "Buy Now" clicked)
const CheckoutScreen = lazy(() =>
  import('../checkout/CheckoutScreen').then((m) => ({ default: m.CheckoutScreen }))
);
const PaymentSuccess = lazy(() =>
  import('../checkout/PaymentSuccess').then((m) => ({ default: m.PaymentSuccess }))
);

interface ProductRecommendationProps {
  offer: ProductOffer;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  );
}

export function ProductRecommendation({ offer }: ProductRecommendationProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const price = (offer.priceCents / 100).toFixed(2);

  if (showSuccess) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <PaymentSuccess />
      </Suspense>
    );
  }

  if (showCheckout) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <CheckoutScreen
          offer={offer}
          onSuccess={() => setShowSuccess(true)}
          onCancel={() => setShowCheckout(false)}
        />
      </Suspense>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Recommended for You
      </h3>

      <div className="mb-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-2">
          {offer.productName}
        </h4>
        <p className="text-gray-600 mb-4">{offer.description}</p>

        {offer.features && (
          <ul className="space-y-2 mb-6">
            {offer.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-700">
                <span className="text-green-600 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Price</p>
          <p className="text-3xl font-bold text-gray-900">
            ${price}
          </p>
        </div>

        <button
          onClick={() => setShowCheckout(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          Buy Now →
        </button>
      </div>
    </div>
  );
}
