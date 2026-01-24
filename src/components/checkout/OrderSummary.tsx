import type { ProductOffer } from '@/types';

interface OrderSummaryProps {
  offer: ProductOffer;
}

export function OrderSummary({ offer }: OrderSummaryProps) {
  const price = (offer.priceCents / 100).toFixed(2);
  const tax = 0; // Add tax calculation if needed
  const total = price;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">{offer.productName}</h3>
        <p className="text-sm text-gray-600 mb-4">{offer.description}</p>

        {offer.features && offer.features.length > 0 && (
          <ul className="space-y-2">
            {offer.features.map((feature, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <span className="text-green-600 mr-2 mt-0.5">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-gray-700">
          <span>Product</span>
          <span>${price}</span>
        </div>
        {tax > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          🔒 Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}
