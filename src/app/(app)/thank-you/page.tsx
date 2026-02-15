'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const STEPS = [
  { label: 'Plán', state: 'completed' as const },
  { label: 'Kontrola emailu', state: 'completed' as const },
  { label: 'Bonus', state: 'completed' as const },
  { label: 'Přihlášení', state: 'completed' as const },
];

function ProgressIndicator() {
  return (
    <div className="relative w-full max-w-[440px] mx-auto">
      {/* Continuous line from center of first circle to center of last circle */}
      <div className="absolute top-4 left-4 right-4 h-px bg-[#327455]" />
      {/* Circles + labels */}
      <div className="relative flex items-start justify-between">
        {STEPS.map((step) => (
          <div key={step.label} className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#327455] flex items-center justify-center z-10">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12px] leading-[12px] text-center whitespace-nowrap font-normal text-[#919191]">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ThankYouPage() {
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
        {/* Progress Indicator — all steps complete */}
        <ProgressIndicator />

        {/* Success Icon */}
        <motion.div
          className="mt-10 w-20 h-20 rounded-full bg-[#327455] flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
        >
          <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 12L11 21L30 2" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* Heading */}
        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#292424] leading-[30.8px] text-center mt-6">
          Tvoje objednávka je dokončena!
        </h1>

        {/* Subheading */}
        <p className="text-[16px] font-normal text-[#292424] leading-[22.4px] text-center max-w-[376px] mt-4">
          Děkujeme za tvůj nákup. Vše je připraveno a brzy se můžeš pustit do svého plánu.
        </p>

        {/* Info Box */}
        <div className="w-full bg-[#327455]/[0.08] rounded-[12px] p-4 sm:p-5 mt-8">
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="#327455" strokeWidth="1.5" />
              <path d="M12 8V12" stroke="#327455" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="#327455" />
            </svg>
            <span className="text-[16px] font-bold text-[#292424] leading-[20.8px]">
              Co bude dál?
            </span>
          </div>
          <p className="text-[16px] font-normal text-[#292424] leading-[20.8px] mt-1.5">
            Zkontroluj svou e-mailovou schránku. Pošleme ti odkaz pro přihlášení do aplikace, kde na tebe čeká tvůj osobní plán.
          </p>
        </div>

        {/* Reassurance */}
        <div className="w-full bg-[#f5f5f5] rounded-[12px] p-4 sm:p-5 mt-4">
          <div className="flex items-start gap-3">
            <span className="text-[20px] leading-none mt-0.5">🔒</span>
            <p className="text-[14px] font-normal text-[#919191] leading-[19.6px]">
              Tvoje platba byla úspěšně zpracována. Předplatné můžeš kdykoliv zrušit v aplikaci nebo e-mailem na podpora@betterlady.cz.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
