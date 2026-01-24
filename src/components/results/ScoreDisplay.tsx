'use client';

import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  segment: string;
  label: string;
}

export function ScoreDisplay({ score, segment, label }: ScoreDisplayProps) {
  const color = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  }[segment] || 'text-blue-600';

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Your Result
      </h2>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        className={`text-7xl font-bold ${color} mb-2`}
      >
        {Math.round(score)}
      </motion.div>

      <p className={`text-2xl font-semibold ${color}`}>
        {label}
      </p>
    </div>
  );
}
