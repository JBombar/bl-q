'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { usePostQuizState } from '@/hooks/usePostQuizState';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { COUNTDOWN_TIMER } from '@/config/sales-page-content';
import { BONUS_MODULES } from '@/config/checkout-content';
import { formatPrice } from '@/config/pricing.config';
import type { PlanWithPricing } from '@/config/pricing.config';

export interface BonusModulesModalProps {
  plan: PlanWithPricing;
  onContinue: () => void;
  onClose: () => void;
}

/**
 * BonusModulesModal (Modal #1)
 * Shows free bonus modules, plan summary, and timer before checkout
 */
export function BonusModulesModal({
  plan,
  onContinue,
  onClose,
}: BonusModulesModalProps) {
  const { funnelData } = usePostQuizState();
  const firstName = funnelData?.firstName || '';

  const { formattedTime, isExpired } = useCountdownTimer({
    durationSeconds: COUNTDOWN_TIMER.durationSeconds,
    storageKey: 'checkout-modal-timer',
    autoStart: true,
  });

  // ESC key handler
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-[10px] shadow-2xl w-full max-w-[500px] max-h-[95vh] overflow-y-auto p-6 font-figtree">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-[#292424]">
            Tvůj personalizovaný plán
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#f6f6f6] rounded-[10px] flex items-center justify-center shrink-0"
            aria-label="Zavřít"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L13 13M1 13L13 1"
                stroke="#292424"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Combined Timer + Plan Card */}
        <div className="rounded-[10px] overflow-hidden border border-[#327455] mb-4">
          {/* Green Timer Top */}
          {!isExpired && (
            <div className="bg-[#327455] h-9 flex items-center justify-between px-4">
              <span className="text-[14px] text-white">
                <span className="font-bold">TVOJE SLEVA</span> PLATÍ DO
              </span>
              <span className="text-[16px] font-bold text-white tabular-nums">
                {formattedTime.minutes}:{formattedTime.seconds}
              </span>
            </div>
          )}

          {/* Plan Info Bottom */}
          <div className="bg-[#e6eeeb] flex items-center gap-4 px-4 py-3">
            {/* Plan Image */}
            <div className="w-[70px] h-[50px] rounded-[8px] overflow-hidden shrink-0 bg-white">
              <Image
                src="/icons/sales_modal_1.png"
                alt="Plán vnitřního klidu"
                width={70}
                height={50}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Plan Name */}
            <div className="shrink-0">
              <div className="text-[16px] font-bold text-[#292424] leading-tight">
                Plán vnitřního
              </div>
              <div className="text-[16px] font-bold text-[#292424] leading-tight">
                klidu
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-10 bg-[#c4c4c4] shrink-0" />

            {/* Duration + Access */}
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-bold text-[#292424] leading-tight">
                {plan.name}
              </div>
              <div className="text-[14px] font-normal text-[#636363] leading-tight">
                Plný přístup
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Message */}
        <p className="text-[18px] font-bold text-[#292424] leading-[23.4px] mb-4">
          {firstName ? `${firstName}, na` : 'Na'} základě tvého profilu jsme
          zdarma do tvého plánu přidali tyto moduly,{' '}
          <span className="text-[#327455]">jako podporu zdravého
          životního stylu:</span>
        </p>

        {/* Bonus Modules List */}
        <div className="space-y-2 mb-6">
          {BONUS_MODULES.map((module) => (
            <div key={module.id} className="flex items-baseline gap-1">
              {/* Module name */}
              <span className="text-[15px] font-normal text-[#919191] whitespace-nowrap shrink-0">
                {module.name}
              </span>
              {/* Dotted line fill */}
              <div className="flex-1 border-b border-dotted border-[#919191] min-w-[20px] self-end mb-[3px]" />
              {/* Original price strikethrough */}
              <span className="text-[15px] font-normal text-[#919191] line-through whitespace-nowrap shrink-0">
                {formatPrice(module.originalPriceCents)} Kč
              </span>
              {/* Free price */}
              <span className="text-[16px] font-bold text-[#327455] whitespace-nowrap shrink-0 ml-1">
                0 Kč
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="w-full h-14 bg-[#f9a201] hover:bg-[#e09201] active:scale-[0.98] text-white text-[16px] font-extrabold rounded-[10px] transition-all uppercase tracking-wide"
        >
          Pokračovat
        </button>
      </div>
    </div>
  );
}
