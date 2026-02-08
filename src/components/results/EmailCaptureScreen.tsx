'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { StageLayout } from '@/components/layout';

interface EmailCaptureScreenProps {
  onSubmit: (email: string) => Promise<void>;
  isSaving: boolean;
}

/**
 * Screen D - Email Capture (Slide 9)
 * Figma-matched: heading, avatar stack, email input, privacy notice, CTA
 */
export function EmailCaptureScreen({ onSubmit, isSaving }: EmailCaptureScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const isValid = validateEmail(email);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Zadej prosím svůj e-mail');
      return;
    }

    if (!isValid) {
      setError('Zadej prosím platnou e-mailovou adresu');
      return;
    }

    await onSubmit(email.trim());
  };

  return (
    <StageLayout
      variant="result"
      bgClass="bg-white"
      showCTA
      ctaLabel={isSaving ? 'Ukládám...' : 'Zobrazit mé výsledky'}
      ctaDisabled={isSaving || !isValid}
      onCtaClick={handleSubmit}
      showBackButton={true}
      onBackClick={() => {}}
      showHeaderLogo={true}
    >
      {/* Main heading — 22px/24.2px bold, #292424, centered, max-w 338px */}
      <motion.h1
        className="text-[22px] leading-[24.2px] font-bold text-[#292424] font-figtree text-center max-w-[338px] mx-auto mt-[22px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Zadej svůj e-mail a získej svůj <span className="text-[#327455]">Osobní plán pro vnitřní klid!</span>
      </motion.h1>

      {/* Avatar group — 291px × 34px, 22px below heading */}
      <motion.div
        className="flex items-center mt-[22px] max-w-[351px] mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Avatar stack — 4 overlapping 34px circles */}
        <div className="flex shrink-0" style={{ width: 104 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[34px] h-[34px] rounded-full border-2 border-white overflow-hidden shrink-0"
              style={{ marginLeft: i === 1 ? 0 : -10 }}
            >
              <Image
                src={`/icons/email_screen_icon${i}.png`}
                alt=""
                width={34}
                height={34}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Student text — 15px/16.5px bold, #292424 */}
        <p className="ml-[8px] text-[15px] leading-[16.5px] font-bold text-[#292424] font-figtree max-w-[179px]">
          Přidej se k více než 8 500 studentkám Better Lady
        </p>
      </motion.div>

      {/* Email input — 351×48, #f5f5f5, rounded 10px, 26px below avatars */}
      <motion.div
        className="mt-[26px] max-w-[351px] mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="Zadej svůj e-mail pro zaslání plánu"
          disabled={isSaving}
          className={`
            w-full h-[48px] rounded-[10px] px-[12px]
            text-[15px] leading-[15px] font-normal text-[#292424] font-figtree
            placeholder:text-[#919191] placeholder:text-[15px]
            focus:outline-none focus:ring-2 focus:ring-[#327455]
            ${error ? 'bg-red-50 ring-2 ring-red-300' : 'bg-[#f5f5f5]'}
            ${isSaving ? 'opacity-50' : ''}
          `}
          autoComplete="email"
        />
        {error && (
          <motion.p
            className="text-red-500 text-[12px] mt-[4px] font-figtree"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>

      {/* Privacy notice — 351×42, 22px below input */}
      <motion.div
        className="mt-[22px] flex items-start gap-[11px] max-w-[351px] mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Privacy icon — 24×24 */}
        <Image
          src="/icons/privacy_icon.svg"
          alt=""
          width={24}
          height={24}
          className="w-[24px] h-[24px] shrink-0"
        />
        {/* Privacy text — 12px/14.4px regular, #919191 */}
        <p className="text-[12px] leading-[14.4px] font-normal text-[#919191] font-figtree max-w-[316px]">
          Vážíme si tvého soukromí a chráníme tvé osobní údaje. Odkaz k tvému osobnímu plánu ti zašleme e-mailem, aby ses k němu mohla kdykoliv vrátit.
        </p>
      </motion.div>
    </StageLayout>
  );
}
