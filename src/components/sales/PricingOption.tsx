'use client';

import type { PlanWithPricing } from '@/config/pricing.config';
import { formatPrice } from '@/config/pricing.config';

export interface PricingOptionProps {
  plan: PlanWithPricing;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Left-pointing arrow from chevron_icon.svg (shape only)
 * Only shown on the selected card's daily cost badge
 */
function ArrowPointer() {
  return (
    <svg
      viewBox="0 10 36 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[28px] h-[48px] shrink-0 -mr-[8px]"
    >
      <path
        d="M5.69818 42.1798C2.64286 39.4024 2.64286 34.5976 5.69819 31.8202L23.5415 15.6003C28.0382 11.5127 35.25 14.7032 35.25 20.7801L35.25 53.2199C35.25 59.2968 28.0382 62.4872 23.5415 58.3997L5.69818 42.1798Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Daily cost content (number + Kč + za den)
 * Shared between selected and unselected badge variants
 */
function DailyCostContent({ pricePerDay }: { pricePerDay: number }) {
  return (
    <div className="flex items-start gap-1">
      <span className="text-[26px] font-bold text-[#292424] leading-[28.6px]">
        {pricePerDay}
      </span>
      <div className="flex flex-col pt-[4px]">
        <span className="text-[12px] font-bold text-[#292424] leading-[13.2px]">Kč</span>
        <span className="text-[10px] font-normal text-[#292424] leading-[11px]">za den</span>
      </div>
    </div>
  );
}

/**
 * PricingOption Component
 * Matches Figma Frame 28241 spec exactly:
 * - 1px border, 10px radius
 * - Selected: green banner + light green body + white badge with arrow
 * - Unselected: white body + gray badge (no arrow)
 */
export function PricingOption({
  plan,
  isSelected,
  onSelect,
}: PricingOptionProps) {
  const pricePerDay = Math.round(plan.perDayPriceCents / 100);
  const originalPricePerDay = plan.originalPriceCents
    ? Math.round((plan.originalPriceCents / plan.durationDays) / 100)
    : null;

  const isRecommended = plan.isRecommended && plan.badge;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left font-figtree"
    >
      {/* Card container — 1px border, 10px radius, overflow-hidden for banner clipping */}
      <div
        className={`
          overflow-hidden rounded-[10px] border transition-all
          ${isSelected ? 'border-[#327455]' : 'border-[#e4e4e4] hover:border-[#D9D9D9]'}
        `}
      >
        {/* Green banner — only for recommended plan */}
        {isRecommended && (
          <div className="bg-[#327455] h-[30px] flex items-center justify-center gap-2">
            <span className="text-white text-[14px] font-bold leading-[14px]">
              ★ {plan.badge}
            </span>
          </div>
        )}

        {/* Card body — 20px padding, 72px min height */}
        <div
          className={`p-5 ${isSelected ? 'bg-[#e6eeeb]' : 'bg-white'}`}
        >
          <div className="flex items-center">
            {/* Radio button — 16px outer, 1px border */}
            <div className="shrink-0 mr-[12px]">
              <div
                className={`
                  w-4 h-4 rounded-full border flex items-center justify-center transition-all
                  ${isSelected ? 'border-[#327455]' : 'border-[#d6d6d6]'}
                  bg-white
                `}
              >
                {isSelected && (
                  <div className="w-2 h-2 bg-[#327455] rounded-full" />
                )}
              </div>
            </div>

            {/* Plan info — name + pricing */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[18px] text-[#292424] leading-[19.8px] uppercase">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-[8px] mt-[4px]">
                {plan.originalPriceCents && (
                  <span className="text-[14px] font-normal text-[#292424] leading-[14px] line-through">
                    {formatPrice(plan.originalPriceCents)} Kč
                  </span>
                )}
                <span className="text-[14px] font-normal text-[#292424] leading-[14px]">
                  {formatPrice(plan.initialPriceCents)} Kč
                </span>
              </div>
            </div>

            {/* Savings amount — original per-day price, strikethrough, between plan info and badge */}
            {originalPricePerDay && (
              <span className="text-[14px] font-normal text-[#292424] leading-[14px] line-through shrink-0 mr-3">
                {originalPricePerDay} Kč
              </span>
            )}

            {/* Daily cost badge */}
            <div className="shrink-0">
              {isSelected ? (
                /* Selected: white badge with left-pointing arrow */
                <div className="flex items-center">
                  <ArrowPointer />
                  <div className="bg-white rounded-[8px] px-3 py-2">
                    <DailyCostContent pricePerDay={pricePerDay} />
                  </div>
                </div>
              ) : (
                /* Unselected: simple gray rounded rectangle */
                <div className="bg-[#f6f6f6] rounded-[8px] px-3 py-2">
                  <DailyCostContent pricePerDay={pricePerDay} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
