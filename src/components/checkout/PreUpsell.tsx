'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PreUpsellProps {
  email: string;
  onContinue: () => void;
}

const STEPS = [
  { label: 'Plán', state: 'completed' as const },
  { label: 'Kontrola emailu', state: 'active' as const },
  { label: 'Bonus', state: 'incomplete' as const },
  { label: 'Přihlášení', state: 'incomplete' as const },
];

function ProgressIndicator() {
  return (
    <div className="flex items-start justify-center gap-0 w-full max-w-[440px] mx-auto">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-start flex-1">
          {/* Step */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {/* Circle */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              {step.state === 'completed' && (
                <div className="w-8 h-8 rounded-full bg-[#327455] flex items-center justify-center">
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {step.state === 'active' && (
                <div className="w-8 h-8 rounded-full border border-[#327455] flex items-center justify-center">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#327455]" />
                </div>
              )}
              {step.state === 'incomplete' && (
                <div className="w-8 h-8 rounded-full border border-[#d6d6d6]" />
              )}
            </div>
            {/* Label */}
            <span
              className={`text-[12px] leading-[12px] text-center whitespace-nowrap ${
                step.state === 'active'
                  ? 'font-bold text-[#292424]'
                  : 'font-normal text-[#919191]'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connection line (between steps) */}
          {i < STEPS.length - 1 && (
            <div className="flex items-center h-8 -mx-1">
              <div
                className={`w-12 sm:w-16 h-px ${
                  STEPS[i + 1]?.state === 'completed' || STEPS[i + 1]?.state === 'active'
                    ? 'bg-[#327455]'
                    : 'bg-[#d6d6d6]'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PreUpsell({ email, onContinue }: PreUpsellProps) {
  return (
    <div className="min-h-screen bg-white font-figtree flex flex-col items-center px-4">
      {/* Logo */}
      <motion.div
        className="mt-8 sm:mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src="/images/logo-no-arrow.svg"
          alt="Better Lady"
          width={156}
          height={24}
          priority
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="w-full max-w-[500px] mt-10 sm:mt-[46px] flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Main Heading */}
        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#292424] leading-[30.8px] text-center mt-8 sm:mt-[34px]">
          Je tento e-mail správný?
        </h1>

        {/* Email Display Field */}
        <div className="w-full h-12 bg-[#f5f5f5] rounded-[10px] flex items-center px-3 mt-6">
          <span className="text-[15px] font-normal text-[#292424] leading-[15px]">
            {email}
          </span>
        </div>

        {/* Notice Box */}
        <div className="w-full bg-[#327455]/[0.08] rounded-[12px] p-4 sm:p-5 mt-6">
          {/* Notice Header */}
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="#327455" strokeWidth="1.5" />
              <path d="M12 8V12" stroke="#327455" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="#327455" />
            </svg>
            <span className="text-[16px] font-bold text-[#292424] leading-[20.8px]">
              Důležité upozornění
            </span>
          </div>
          {/* Notice Text */}
          <p className="text-[16px] font-normal text-[#292424] leading-[20.8px] mt-1.5">
            Přístup k tvému plánu bude propojen s touto adresou.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="w-full h-14 bg-[#f9a201] hover:bg-[#e09201] active:scale-[0.98] text-white text-[16px] font-extrabold rounded-[10px] transition-all uppercase tracking-wide mt-6"
        >
          Pokračovat
        </button>
      </motion.div>
    </div>
  );
}
