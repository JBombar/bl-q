'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PricingOption } from './PricingOption';
import { useSharedTimer } from '@/hooks/useSharedTimer';
import { usePostQuizState } from '@/hooks/usePostQuizState';
import type { PlanWithPricing } from '@/config/pricing.config';
import { getDynamicDisclaimerText } from '@/config/pricing.config';
import {
  PLAN_INFO_CARDS,
  PROMO_CODE,
  CTA_BUTTON_TEXT,
  COUNTDOWN_TIMER,
} from '@/config/sales-page-content';

export interface PricingSectionProps {
  plans: PlanWithPricing[];
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
  onPlanSelect,
}: PricingSectionProps) {
  // Get pricing tier state and actions from global store
  const {
    selectedPlanId,
    setSelectedPlanId,
    pricingTier,
  } = usePostQuizState();

  // Use the shared countdown timer
  const {
    formattedTime,
    isExpired,
  } = useSharedTimer(COUNTDOWN_TIMER.durationSeconds);

  // Find recommended plan or default to first
  const recommendedPlan = plans.find(p => p.isRecommended);
  const defaultPlanId = recommendedPlan?.id || plans[0]?.id || '';

  // Use selected plan from state, or default to recommended
  const currentSelectedId = selectedPlanId || defaultPlanId;

  // Find the currently selected plan object for dynamic disclaimer
  const selectedPlan = plans.find(p => p.id === currentSelectedId);

  // Generate dynamic disclaimer text based on selected plan
  const disclaimerText = selectedPlan
    ? getDynamicDisclaimerText(selectedPlan)
    : 'Vyberte si prosím plán výše.';

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleCTA = () => {
    if (currentSelectedId) {
      onPlanSelect(currentSelectedId);
    }
  };

  // Determine promo text based on tier
  const getPromoText = () => {
    switch (pricingTier) {
      case 'MAX_DISCOUNT':
        return 'Speciální nabídka aktivována!';
      case 'FULL_PRICE':
        return 'Standardní cena';
      default:
        return PROMO_CODE.appliedText;
    }
  };

  return (
    <div className="w-full font-figtree">
      <div className="max-w-[500px] mx-auto px-4">

        {/* Header: Tvůj personalizovaný plán */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-[28px] font-bold text-[#292424] leading-[28px] mb-6">
            Tvůj <span className="text-[#327455]">personalizovaný plán</span> vnitřního klidu je připraven!
          </h2>

          {/* Plan Info Cards */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4">
              {PLAN_INFO_CARDS.map((card, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3"
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

        {/* Promo Code Section - Ticket Stub Shape */}
        {/* Only show when not at full price */}
        {pricingTier !== 'FULL_PRICE' && (
          <motion.div
            className="relative mb-6"
            style={{
              backgroundImage: "url('/masks/ticket-mask.svg')",
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              aspectRatio: '500 / 173',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Content positioned inside the ticket shape */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 sm:px-10 py-4">
              {/* Promo applied message — centered */}
              <div className="flex items-center gap-2 mb-2">
                <TagIcon />
                <span className="text-[16px] sm:text-[20px] font-bold text-[#292424]">
                  {getPromoText()}
                </span>
              </div>

              {/* Horizontal divider */}
              <div className="w-full border-t border-[#327455]/30 mb-2" />

              {/* Bottom row: Promo code pill + Timer box */}
              <div className="flex items-center gap-2 sm:gap-3 w-full">
                {/* Promo code pill */}
                <div className="flex items-center gap-2 sm:gap-3 bg-white border border-[#EBEBEB] rounded-full px-3 sm:px-4 py-2 flex-1 min-w-0">
                  <CheckIcon />
                  <span className="text-[13px] sm:text-[15px] font-normal text-[#292424] truncate">
                    {pricingTier === 'MAX_DISCOUNT' ? 'MAXSLEVA' : 'SLEVA2024'}
                  </span>
                </div>

                {/* Timer — rounded box with green border */}
                <div className="shrink-0 flex flex-col items-center bg-[#e6eeeb] border border-[#327455] rounded-[10px] px-3 sm:px-4 py-1.5 sm:py-2">
                  {!isExpired ? (
                    <>
                      <div className="flex items-center gap-1">
                        <span className="text-[16px] sm:text-[18px] font-extrabold text-[#327455]">{formattedTime.minutes}</span>
                        <span className="text-[16px] sm:text-[18px] font-extrabold text-[#327455]">:</span>
                        <span className="text-[16px] sm:text-[18px] font-extrabold text-[#327455]">{formattedTime.seconds}</span>
                      </div>
                      <div className="flex gap-3 text-[10px] sm:text-[12px] text-[#292424]">
                        <span>{PROMO_CODE.timerLabels.minutes}</span>
                        <span>{PROMO_CODE.timerLabels.seconds}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-[14px] font-bold text-[#F9A201]">
                      Aktivní
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expired notice when at full price */}
        {pricingTier === 'FULL_PRICE' && (
          <motion.div
            className="mb-6 p-4 bg-gray-100 rounded-[10px] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[14px] text-[#949BA1]">
              Slevová akce vypršela. Stále můžete zakoupit za standardní cenu.
            </p>
          </motion.div>
        )}

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
              isSelected={currentSelectedId === plan.id}
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

        {/* Dynamic Disclaimer text - animated crossfade on plan change */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentSelectedId}
            className="text-[12px] text-[#919191] text-center mt-4 leading-[1.4em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {disclaimerText}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
