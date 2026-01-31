'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 text-center">
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
      <div className="flex-1 px-4">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Name input */}
          <div className="mb-6">
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

          {/* Submit button */}
          <motion.button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full py-4 bg-[#F9A201] hover:bg-[#e89400] text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.98 }}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ukladam...
              </span>
            ) : (
              'Pokracovat'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
