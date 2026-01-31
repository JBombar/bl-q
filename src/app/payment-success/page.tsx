'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePostQuizState } from '@/hooks/usePostQuizState';

export default function PaymentSuccessPage() {
  const { funnelData } = usePostQuizState();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => setIsAnimating(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const firstName = funnelData.firstName || 'tam';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Gratulujeme, {firstName}! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-8"
          >
            Tvá platba byla úspěšně zpracována a tvůj přístup k programu Better Lady je aktivní.
          </motion.p>

          {/* Order Confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mb-8 border border-green-100"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Co se stane dál?
            </h2>
            <div className="text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Potvrzovací email
                  </p>
                  <p className="text-sm text-gray-600">
                    Do několika minut obdržíš email s potvrzením objednávky a přístupovými údaji.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Přístup k platformě
                  </p>
                  <p className="text-sm text-gray-600">
                    Můžeš okamžitě začít s prvním modulem programu a nastavit si svůj osobní plán.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Začni svou cestu
                  </p>
                  <p className="text-sm text-gray-600">
                    Tvých 90 dní transformace začíná právě teď. Přidej se k tisícům žen, které už dosáhly vnitřního klidu.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                // TODO: Link to member area/dashboard
                window.location.href = '/dashboard';
              }}
              className="w-full py-4 bg-gradient-to-r from-[#F9A201] to-orange-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Začít s programem 🚀
            </button>

            <p className="text-sm text-gray-500">
              Potřebuješ pomoc? Kontaktuj nás na{' '}
              <a
                href="mailto:podpora@betterlady.cz"
                className="text-[#F9A201] hover:underline"
              >
                podpora@betterlady.cz
              </a>
            </p>
          </motion.div>

          {/* Trust Reminder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-8 border-t border-gray-200"
          >
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span>✓</span>
                <span>30denní záruka vrácení peněz</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>Zabezpečená platba</span>
              </div>
              <div className="flex items-center gap-1">
                <span>💳</span>
                <span>Zpracováno přes Stripe</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
