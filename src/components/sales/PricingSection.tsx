'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PricingOption } from './PricingOption';
import type { PricingPlan } from '@/config/sales-page.config';
import {
  SECTION_HEADINGS,
  PLAN_INFO_CARDS,
  PROMO_CODE,
  CTA_BUTTON_TEXT,
  COUNTDOWN_TIMER,
} from '@/config/sales-page-content';

export interface PricingSectionProps {
  plans: PricingPlan[];
  recommendedPlanId: string;
  onPlanSelect: (planId: string) => void;
}

/**
 * Brain Icon SVG
 */
function BrainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 7.8 8.4 8.3 9.1C6.9 9.5 6 10.9 6 12.5C6 13.6 6.4 14.6 7.1 15.3C6.4 15.9 6 16.9 6 18C6 20 7.5 21.5 9.5 21.5C10.2 21.5 10.8 21.3 11.3 21H12.7C13.2 21.3 13.8 21.5 14.5 21.5C16.5 21.5 18 20 18 18C18 16.9 17.6 15.9 16.9 15.3C17.6 14.6 18 13.6 18 12.5C18 10.9 17.1 9.5 15.7 9.1C16.2 8.4 16.5 7.5 16.5 6.5C16.5 4 14.5 2 12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * Target Icon SVG
 */
function TargetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill="white"/>
    </svg>
  );
}

/**
 * Tag Icon SVG
 */
function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-green">
      <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 7H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * Checkmark Icon SVG
 */
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-green">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PricingSection({
  plans,
  recommendedPlanId,
  onPlanSelect,
}: PricingSectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(recommendedPlanId);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_TIMER.durationSeconds);

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
    return { mins: mins.toString().padStart(2, '0'), secs: secs.toString().padStart(2, '0') };
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleCTA = () => {
    if (selectedPlanId) {
      onPlanSelect(selectedPlanId);
    }
  };

  const time = formatTime(timeLeft);

  return (
    <div className="w-full font-figtree">
      <div className="max-w-[500px] mx-auto px-4">

        {/* Header: Tvůj personalizovaný plán */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-[24px] font-bold text-[#292424] leading-[1.2em] mb-6">
            Tvůj <span className="text-[#327455]">personalizovaný plán</span> vnitřního klidu je připraven!
          </h2>

          {/* Plan Info Cards - Ticket Stub Shape */}
          <div className="mask-ticket bg-[#D2EBE0] border border-[#327455] p-6 mb-6">
            <div className="flex items-center justify-center gap-4">
              {PLAN_INFO_CARDS.map((card, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-[10px]"
                >
                  <div className="w-12 h-12 bg-[#327455] rounded-[10px] flex items-center justify-center shrink-0">
                    {card.icon === 'brain' ? <BrainIcon /> : <TargetIcon />}
                  </div>
                  <div className="text-left">
                    <div className="text-[12px] text-[#949BA1] font-medium">{card.label}</div>
                    <div className="text-[16px] font-bold text-[#292424]">{card.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Promo Code Section */}
        <motion.div
          className="bg-white rounded-[10px] border border-[#EBEBEB] p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Promo applied message */}
          <div className="flex items-center gap-2 mb-3">
            <TagIcon />
            <span className="text-[14px] font-medium text-[#292424]">
              {PROMO_CODE.appliedText}
            </span>
          </div>

          {/* Promo code display */}
          <div className="flex items-center gap-3 bg-white border border-[#EBEBEB] rounded-[10px] px-4 py-3 mb-4">
            <CheckIcon />
            <span className="text-[18px] font-bold text-[#292424]">[DYNAMIC PROMO KÓD]</span>
          </div>

          {/* Timer */}
          <div className="bg-[#F6F6F6] rounded-[10px] p-4">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[32px] font-bold text-[#327455]">{time.mins}</span>
              <span className="text-[32px] font-bold text-[#327455]">:</span>
              <span className="text-[32px] font-bold text-[#327455]">{time.secs}</span>
            </div>
            <div className="flex justify-center gap-8 text-[12px] text-[#949BA1] mt-1">
              <span>{PROMO_CODE.timerLabels.minutes}</span>
              <span>{PROMO_CODE.timerLabels.seconds}</span>
            </div>
          </div>
        </motion.div>

        {/* Pricing options */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {plans.map((plan) => (
            <PricingOption
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              isRecommended={plan.id === recommendedPlanId}
              onSelect={() => handlePlanSelect(plan.id)}
            />
          ))}
        </motion.div>

        {/* CTA Button - ORANGE #F9A201 */}
        <motion.button
          onClick={handleCTA}
          className="w-full py-4 bg-[#F9A201] hover:bg-[#E09201] active:scale-[0.98] text-white text-[16px] font-extrabold rounded-[10px] shadow-cta transition-all uppercase tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {CTA_BUTTON_TEXT}
        </motion.button>

        {/* Disclaimer text */}
        <p className="text-[10px] text-[#949BA1] text-center mt-4 leading-[1.4em]">
          Kliknutím na „CHCI SVŮJ PLÁN" souhlasíte s uzavřením Smlouvy. Úplné znění obchodních podmínek naleznete na naší webové stránce.
        </p>
      </div>
    </div>
  );
}
