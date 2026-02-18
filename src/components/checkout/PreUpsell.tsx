'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePostQuizState } from '@/hooks/usePostQuizState';

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
  // Find the index of the last completed or active step for line coloring
  const activeIndex = STEPS.findIndex(s => s.state === 'active');
  const greenEnd = activeIndex >= 0 ? activeIndex : STEPS.filter(s => s.state === 'completed').length - 1;

  return (
    <div className="relative w-full max-w-[440px] mx-auto">
      {/* Green line: center of first circle to center of active circle */}
      {greenEnd > 0 && (
        <div
          className="absolute top-4 h-px bg-[#327455]"
          style={{ left: 16, right: `calc(100% - 100% * ${greenEnd} / ${STEPS.length - 1} - 16px)` }}
        />
      )}
      {/* Gray line: center of active circle to center of last circle */}
      {greenEnd < STEPS.length - 1 && (
        <div
          className="absolute top-4 h-px bg-[#d6d6d6]"
          style={{ left: `calc(100% * ${greenEnd} / ${STEPS.length - 1} + 16px)`, right: 16 }}
        />
      )}
      {/* Circles + labels */}
      <div className="relative flex items-start justify-between">
        {STEPS.map((step) => (
          <div key={step.label} className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center z-10">
              {step.state === 'completed' && (
                <div className="w-8 h-8 rounded-full bg-[#327455] flex items-center justify-center">
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {step.state === 'active' && (
                <div className="w-8 h-8 rounded-full border border-[#327455] bg-white flex items-center justify-center">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#327455]" />
                </div>
              )}
              {step.state === 'incomplete' && (
                <div className="w-8 h-8 rounded-full border border-[#d6d6d6] bg-white" />
              )}
            </div>
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
        ))}
      </div>
    </div>
  );
}

export function PreUpsell({ email, onContinue }: PreUpsellProps) {
  const [editedEmail, setEditedEmail] = useState(email);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveEmail = async () => {
    if (!editedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedEmail)) {
      setSaveError('Zadej platny e-mail');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const success = await usePostQuizState.getState().updateEmail(editedEmail);
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    } else {
      setSaveError('Nepodarilo se ulozit e-mail');
    }
  };

  const handleCancelEdit = () => {
    setEditedEmail(email);
    setIsEditing(false);
    setSaveError(null);
  };

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

        {/* Email Display / Edit Field */}
        {isEditing ? (
          <div className="mt-6 w-full">
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => { setEditedEmail(e.target.value); setSaveError(null); }}
                className="flex-1 h-12 bg-[#f5f5f5] rounded-[10px] px-3 text-[15px] font-normal text-[#292424] leading-[15px] outline-none focus:ring-2 focus:ring-[#327455] border-none"
                autoFocus
                disabled={isSaving}
              />
              <button
                onClick={handleSaveEmail}
                disabled={isSaving}
                className="shrink-0 w-10 h-10 rounded-lg bg-[#327455] text-white flex items-center justify-center hover:bg-[#285e44] transition-colors disabled:opacity-50"
                aria-label="Ulozit"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="shrink-0 w-10 h-10 rounded-lg bg-[#f5f5f5] text-[#919191] flex items-center justify-center hover:text-[#292424] transition-colors disabled:opacity-50"
                aria-label="Zrusit"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {saveError && (
              <p className="text-[13px] text-red-500 mt-1.5 px-1">{saveError}</p>
            )}
          </div>
        ) : (
          <div className="w-full h-12 bg-[#f5f5f5] rounded-[10px] flex items-center justify-between px-3 mt-6">
            <span className="text-[15px] font-normal text-[#292424] leading-[15px] truncate">
              {editedEmail}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 shrink-0 p-1.5 text-[#919191] hover:text-[#292424] transition-colors"
              aria-label="Upravit e-mail"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.333 2.00004C11.5081 1.82494 11.7169 1.68605 11.9467 1.59129C12.1765 1.49653 12.4227 1.44775 12.6713 1.44775C12.9199 1.44775 13.1661 1.49653 13.3959 1.59129C13.6257 1.68605 13.8346 1.82494 14.0097 2.00004C14.1848 2.17513 14.3237 2.384 14.4184 2.61378C14.5132 2.84357 14.562 3.08978 14.562 3.33837C14.562 3.58697 14.5132 3.83318 14.4184 4.06296C14.3237 4.29275 14.1848 4.50161 14.0097 4.67671L5.00967 13.6767L1.33301 14.6667L2.32301 10.99L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

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
