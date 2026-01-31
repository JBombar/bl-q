'use client';

import { motion } from 'framer-motion';
import type { PricingPlan } from '@/config/sales-page.config';

export interface PricingOptionProps {
  plan: PricingPlan;
  isRecommended?: boolean;
  onSelect: () => void;
}

export function PricingOption({ plan, isRecommended, onSelect }: PricingOptionProps) {
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('cs-CZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const savings = plan.originalPriceCents
    ? plan.originalPriceCents - plan.priceCents
    : 0;

  return (
    <motion.div
      className={`
        relative bg-white rounded-2xl p-6 border-2 shadow-lg transition-all
        ${isRecommended
          ? 'border-[#F9A201] shadow-xl scale-105'
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-[#F9A201] to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 text-center mt-2">
        {plan.name}
      </h3>

      {/* Billing Period */}
      <p className="text-sm text-gray-600 text-center mb-4">
        {plan.billingPeriod}
      </p>

      {/* Pricing */}
      <div className="text-center mb-4">
        {plan.originalPriceCents && (
          <div className="mb-1">
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(plan.originalPriceCents)} Kč
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(plan.priceCents)}
          </span>
          <span className="text-xl text-gray-600">Kč</span>
        </div>
        {savings > 0 && (
          <p className="text-sm text-green-600 font-semibold mt-1">
            Ušetříš {formatPrice(savings)} Kč
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all
          ${isRecommended
            ? 'bg-gradient-to-r from-[#F9A201] to-orange-500 text-white hover:shadow-xl hover:scale-105'
            : 'bg-gray-900 text-white hover:bg-gray-800'
          }
        `}
      >
        {plan.ctaText}
      </button>
    </motion.div>
  );
}
