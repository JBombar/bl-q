'use client';

import { useState } from 'react';
import type { ProductOffer } from '@/types';
import { CheckoutScreen } from '../checkout/CheckoutScreen';
import { PaymentSuccess } from '../checkout/PaymentSuccess';

interface ProductRecommendationProps {
  offer: ProductOffer;
}

export function ProductRecommendation({ offer }: ProductRecommendationProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const price = (offer.priceCents / 100).toFixed(2);

  if (showSuccess) {
    return <PaymentSuccess />;
  }

  if (showCheckout) {
    return (
      <CheckoutScreen
        offer={offer}
        onSuccess={() => setShowSuccess(true)}
        onCancel={() => setShowCheckout(false)}
      />
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
