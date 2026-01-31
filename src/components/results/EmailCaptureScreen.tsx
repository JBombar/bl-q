'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface EmailCaptureScreenProps {
  onSubmit: (email: string) => Promise<void>;
  isSaving: boolean;
}

/**
 * Screen D - Email Capture
 * Collects user's email address
 */
export function EmailCaptureScreen({ onSubmit, isSaving }: EmailCaptureScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Zadej prosim svuj e-mail');
      return;
    }

    if (!validateEmail(email)) {
      setError('Zadej prosim platnou e-mailovou adresu');
      return;
    }

    await onSubmit(email.trim());
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 text-center">
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Zadej svuj e-mail a ziskej svuj Osobni plan pro vnitrni klid!
        </motion.h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-4">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-pink-400 border-2 border-white"
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 ml-2">
              Pridej se k vice nez <strong>8 500</strong> studentkam Better Lady
            </p>
          </div>

          {/* Email input */}
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="tvuj@email.cz"
              disabled={isSaving}
              className={`w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F9A201] focus:border-[#F9A201] transition-colors ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } ${isSaving ? 'opacity-50' : ''}`}
              autoComplete="email"
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

          {/* Privacy note */}
          <p className="text-xs text-gray-500 text-center mb-6">
            Tvoje udaje jsou v bezpeci. Zadny spam, jen uzitecne informace.
          </p>

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
              'Zobrazit me vysledky'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
