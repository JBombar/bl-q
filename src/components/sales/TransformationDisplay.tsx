'use client';

import { motion } from 'framer-motion';
import type { StressStage } from '@/types/funnel.types';

export interface TransformationDisplayProps {
  currentStressStage: StressStage;
  currentScore: number;
  targetScore: number;
  stageTitle: string;
  firstName: string;
}

export function TransformationDisplay({
  currentStressStage,
  currentScore,
  targetScore,
  stageTitle,
  firstName,
}: TransformationDisplayProps) {
  const reductionPercent = Math.round(((currentScore - targetScore) / currentScore) * 100);

  return (
    <section className="py-12 px-4 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {firstName}, tvůj osobní plán je připraven!
          </h1>
          <p className="text-lg text-gray-600">
            Zde je, jak se tvůj život změní během příštích 90 dní
          </p>
        </motion.div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Before - Dnes */}
          <motion.div
            className="bg-white rounded-xl p-6 border-2 border-red-200 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-4">
              <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">
                Dnes
              </span>
            </div>

            {/* Placeholder image */}
            <div className="relative mb-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <div className="text-6xl mb-2">😰</div>
                <p className="text-sm text-gray-500">Aktuální stav</p>
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-red-600">{currentScore}</span>
                <span className="text-xl text-gray-500">/60</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{stageTitle}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs">
                  Vyčerpání
                </span>
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs">
                  Úzkost
                </span>
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs">
                  Nízká energie
                </span>
              </div>
            </div>
          </motion.div>

          {/* After - Tvůj cíl */}
          <motion.div
            className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-4">
              <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                Tvůj cíl (90 dní)
              </span>
            </div>

            {/* Placeholder image */}
            <div className="relative mb-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <div className="text-6xl mb-2">😊</div>
                <p className="text-sm text-gray-500">Cílový stav</p>
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-green-600">{targetScore}</span>
                <span className="text-xl text-gray-500">/60</span>
              </div>
              <p className="text-sm text-green-600 font-semibold mb-3">
                -{reductionPercent}% stres
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                  Klid
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                  Energie
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                  Radost
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transformation Arrow */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex-1 h-px bg-gray-300 hidden md:block" />
          <div className="bg-gradient-to-r from-red-500 to-green-500 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg whitespace-nowrap">
            📈 Tvá transformace během 90 dní
          </div>
          <div className="flex-1 h-px bg-gray-300 hidden md:block" />
        </motion.div>
      </div>
    </section>
  );
}
