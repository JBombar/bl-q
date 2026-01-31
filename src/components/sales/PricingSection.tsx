'use client';

import { motion } from 'framer-motion';
import { PricingOption } from './PricingOption';
import type { PricingPlan } from '@/config/sales-page.config';

export interface PricingSectionProps {
  plans: PricingPlan[];
  recommendedPlanId: string;
  onPlanSelect: (planId: string) => void;
}

export function PricingSection({
  plans,
  recommendedPlanId,
  onPlanSelect,
}: PricingSectionProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Vyber si svůj plán
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Všechny plány zahrnují 90denní program, přístup ke všem technikám a sledování pokroku.
            Vyber si ten, který nejlépe odpovídá tvým potřebám.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PricingOption
                plan={plan}
                isRecommended={plan.id === recommendedPlanId}
                onSelect={() => onPlanSelect(plan.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-green-500">🔒</span>
            <span>Bezpečná platba</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>30denní záruka</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">💳</span>
            <span>Stripe platby</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
