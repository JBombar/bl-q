'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StageLayout } from '@/components/layout';

interface NameCaptureScreenProps {
  onSubmit: (firstName: string) => Promise<void>;
  isSaving: boolean;
}

/**
 * Screen E - Name Capture (Slide 10)
 * Simple: heading + centered name input + CTA at bottom
 */
export function NameCaptureScreen({ onSubmit, isSaving }: NameCaptureScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateName = (name: string): boolean => {
    const nameRegex = /^[\p{L}]{2,}$/u;
    return nameRegex.test(name.trim());
  };

  const isValid = firstName.trim().length >= 2 && validateName(firstName);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = firstName.trim();

    if (!trimmed) {
      setError('Zadej prosím své jméno');
      return;
    }

    if (!validateName(trimmed)) {
      setError('Zadej prosím platné jméno');
      return;
    }

    await onSubmit(trimmed);
  };

  return (
    <StageLayout
      variant="result"
      bgClass="bg-white"
      showCTA
      ctaLabel={isSaving ? 'Ukládám...' : 'Pokračovat'}
      ctaDisabled={isSaving || !isValid}
      onCtaClick={handleSubmit}
      showBackButton={true}
      onBackClick={() => {}}
      showHeaderLogo={true}
    >
      {/* Main heading — 22px/24.2px bold, #292424, centered */}
      <motion.h1
        className="text-[22px] leading-[24.2px] font-bold text-[#292424] font-figtree text-center max-w-[338px] mx-auto mt-[22px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Napiš své křestní jméno
      </motion.h1>

      {/* Name input — 351×48, #f5f5f5, rounded 10px, centered placeholder */}
      <motion.div
        className="mt-[22px] max-w-[351px] mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            setError(null);
          }}
          placeholder="Jméno"
          disabled={isSaving}
          className={`
            w-full h-[48px] rounded-[10px] px-[12px]
            text-[15px] leading-[15px] font-normal text-[#292424] font-figtree text-center
            placeholder:text-[#919191] placeholder:text-[15px] placeholder:text-center
            focus:outline-none focus:ring-2 focus:ring-[#327455]
            ${error ? 'bg-red-50 ring-2 ring-red-300' : 'bg-[#f5f5f5]'}
            ${isSaving ? 'opacity-50' : ''}
          `}
          autoComplete="given-name"
          autoCapitalize="words"
        />
        {error && (
          <motion.p
            className="text-red-500 text-[12px] mt-[4px] font-figtree text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </StageLayout>
  );
}
