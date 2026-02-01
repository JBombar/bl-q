'use client';

import type { PricingPlan } from '@/config/sales-page.config';

export interface PricingOptionProps {
  plan: PricingPlan;
  isSelected: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

export function PricingOption({
  plan,
  isSelected,
  isRecommended,
  onSelect,
}: PricingOptionProps) {
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('cs-CZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Calculate per-day price (assuming 90 days for all plans)
  const pricePerDay = Math.round(plan.priceCents / 90 / 100);
  const originalPricePerDay = plan.originalPriceCents
    ? Math.round(plan.originalPriceCents / 90 / 100)
    : null;

  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full text-left rounded-xl p-4 border-2 transition-all
        ${
          isSelected
            ? 'bg-green-50 border-green-400'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Radio button */}
        <div className="flex-shrink-0">
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
              ${
                isSelected
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 bg-white'
              }
            `}
          >
            {isSelected && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
        </div>

        {/* Plan details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            {/* Plan name */}
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              {plan.name}
            </h3>

            {/* Recommended badge */}
            {isRecommended && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-700 text-white text-[10px] font-bold rounded-md">
                <span>★</span>
                <span>Nejoblíbenější volba</span>
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            {/* Original price (crossed out) */}
            {plan.originalPriceCents && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(plan.originalPriceCents)} Kč
              </span>
            )}

            {/* Current price */}
            <span className="text-base font-bold text-gray-900">
              {formatPrice(plan.priceCents)} Kč
            </span>
          </div>
        </div>

        {/* Per-day price box */}
        <div className="flex-shrink-0 text-right">
          {/* Original per-day price */}
          {originalPricePerDay && (
            <div className="text-xs text-gray-400 line-through mb-0.5">
              {originalPricePerDay} Kč
            </div>
          )}

          {/* Current per-day price in gray box */}
          <div className="bg-gray-100 rounded-md px-3 py-1 inline-block">
            <div className="text-lg font-bold text-gray-900">
              {pricePerDay} <span className="text-xs font-normal">Kč</span>
            </div>
            <div className="text-[10px] text-gray-500 text-center">/den</div>
          </div>
        </div>
      </div>
    </button>
  );
}
