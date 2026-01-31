'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StageLayout } from '@/components/layout';

interface NameCaptureScreenProps {
  onSubmit: (firstName: string) => Promise<void>;
  isSaving: boolean;
}

/**
 * Screen E - Name Capture
 * Collects user's first name for personalization
 */
export function NameCaptureScreen({ onSubmit, isSaving }: NameCaptureScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateName = (name: string): boolean => {
    // At least 2 characters, letters only (including diacritics)
    const nameRegex = /^[\p{L}]{2,}$/u;
    return nameRegex.test(name.trim());
  };

  const handleSubmit = async () => {
    setError(null);

    const trimmedName = firstName.trim();

    if (!trimmedName) {
      setError('Zadej prosim sve jmeno');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Jmeno musi mit alespon 2 znaky');
      return;
    }

    if (!validateName(trimmedName)) {
      setError('Zadej prosim platne jmeno (pouze pismena)');
      return;
    }

    await onSubmit(trimmedName);
  };

  return (
    <StageLayout
      variant="result"
      bgClass="bg-gradient-to-b from-green-50 to-white"
      showCTA
      ctaLabel={isSaving ? 'Ukladam...' : 'Pokracovat'}
      ctaDisabled={isSaving || !firstName.trim()}
      onCtaClick={handleSubmit}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Napis sve krestni jmeno
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Abychom ti mohli pripravit personalizovany plan
        </motion.p>
      </div>

      {/* Form */}
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Name input */}
        <div>
          <input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError(null);
            }}
            placeholder="Jmeno"
            disabled={isSaving}
            className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F9A201] focus:border-[#F9A201] transition-colors ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-200'
            } ${isSaving ? 'opacity-50' : ''}`}
            autoComplete="given-name"
            autoCapitalize="words"
          />
          {error && (
            <motion.p
              className="text-red-500 text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>
    </StageLayout>
  );
}
