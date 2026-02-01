'use client';

import type { PricingPlan } from '@/config/sales-page.config';

export interface PricingOptionProps {
  plan: PricingPlan;
  isSelected: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

/**
 * PricingOption Component
 * Radio-style pricing option card
 */
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
        relative w-full text-left rounded-[10px] p-4 border-2 transition-all font-figtree
        ${
          isSelected
            ? 'border-[#327455]'
            : 'bg-white border-[#E4E4E4] hover:border-[#D9D9D9]'
        }
      `}
      style={isSelected ? {
        background: 'linear-gradient(180deg, rgba(50, 116, 85, 0.12) 0%, rgba(50, 116, 85, 0.03) 100%)'
      } : undefined}
    >
      {/* Recommended badge - positioned at top */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#327455] text-white text-[12px] font-bold rounded-full whitespace-nowrap">
            ★ Nejoblíbenější volba
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Radio button */}
        <div className="shrink-0">
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
              ${
                isSelected
                  ? 'border-[#327455] bg-[#327455]'
                  : 'border-[#D9D9D9] bg-white'
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
            <h3 className="font-bold text-[14px] text-[#292424] uppercase tracking-wide">
              {plan.name}
            </h3>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            {/* Original price (crossed out) */}
            {plan.originalPriceCents && (
              <span className="text-[14px] text-[#949BA1] line-through">
                {formatPrice(plan.originalPriceCents)} Kč
              </span>
            )}

            {/* Current price */}
            <span className="text-[16px] font-bold text-[#292424]">
              {formatPrice(plan.priceCents)} Kč
            </span>
          </div>
        </div>

        {/* Per-day price box */}
        <div className="shrink-0 text-right">
          {/* Original per-day price */}
          {originalPricePerDay && (
            <div className="text-[12px] text-[#949BA1] line-through mb-0.5">
              {originalPricePerDay} Kč
            </div>
          )}

          {/* Current per-day price in gray box */}
          <div className="bg-[#F6F6F6] rounded-[8px] px-3 py-1 inline-block">
            <div className="text-[18px] font-bold text-[#292424]">
              {pricePerDay} <span className="text-[12px] font-normal">Kč</span>
            </div>
            <div className="text-[10px] text-[#949BA1] text-center">/den</div>
          </div>
        </div>
      </div>
    </button>
  );
}
