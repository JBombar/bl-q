'use client';

import { useState, useEffect } from 'react';
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
  const [selectedPlanId, setSelectedPlanId] = useState<string>(recommendedPlanId);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} : ${secs.toString().padStart(2, '0')}`;
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleCTA = () => {
    if (selectedPlanId) {
      onPlanSelect(selectedPlanId);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto">

        {/* Header: Tvůj personalizovaný plán */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Tvůj <span className="text-green-700">personalizovaný plán</span> vnitřního klidu je připraven!
          </h2>

          {/* Info boxes */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {/* Hlavní spouštěč */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500">Hlavní spouštěč</div>
                <div className="font-semibold">Stres</div>
              </div>
            </div>

            {/* Cíl plánu */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-500">Cíl plánu</div>
                <div className="font-semibold">Reset nervového systému</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Green container with ticket stub cutouts */}
        <motion.div
          className="relative bg-green-50 rounded-2xl p-6 md:p-8 border border-green-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            // Ticket stub cutouts using radial gradients
            background: `
              radial-gradient(circle at 0% 50%, transparent 12px, rgb(240 253 244) 12px),
              radial-gradient(circle at 100% 50%, transparent 12px, rgb(240 253 244) 12px)
            `,
          }}
        >
          {/* Promo code section */}
          <div className="mb-6">
            {/* Green tag: "Tvůj slevový kód je uplatněn!" */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 9V5a3 3 0 013-3h4c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-bold text-green-700">
                Tvůj slevový kód je uplatněn!
              </span>
            </div>

            {/* Promo code input field */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-green-200 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-mono text-gray-700">[DYNAMIC PROMO KÓD]</span>
              </div>

              {/* Countdown timer */}
              <div className="bg-gray-100 rounded-md px-3 py-1">
                <div className="text-sm font-mono font-bold text-gray-700">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-[10px] text-gray-500 text-center">minut, sekund</div>
              </div>
            </div>
          </div>

          {/* Pricing options */}
          <div className="space-y-3 mb-6">
            {plans.map((plan, index) => (
              <PricingOption
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                isRecommended={plan.id === recommendedPlanId}
                onSelect={() => handlePlanSelect(plan.id)}
              />
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleCTA}
            className="w-full py-4 bg-gradient-to-r from-[#F9A201] to-orange-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            CHCI SVŮJ PLÁN
          </button>

          {/* Disclaimer text */}
          <p className="text-[10px] text-gray-500 text-center mt-4 leading-relaxed">
            Kliknutím na „CHCI SVŮJ PLÁN" souhlasíte s uzavřením Smlouvy na CÉENA i.o., který začne
            platit ihned po nákupu a můžete se vzdát práva na 14-ti denní lhůtu pro odstoupení od smlouvy.
            Úplné znění obchodních podmínek naleznete na naší webové stránce.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
