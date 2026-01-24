'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function PaymentSuccess() {
  useEffect(() => {
    // Confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span className="text-white text-5xl">✓</span>
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Thank you for your purchase. We've sent a confirmation email with your order details.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">📧</span>
              Check your email for access instructions
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">🎯</span>
              You'll receive your product within 24 hours
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">💬</span>
              Contact support if you have any questions
            </li>
          </ul>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
        >
          Return to Home
        </button>
      </motion.div>
    </div>
  );
}
