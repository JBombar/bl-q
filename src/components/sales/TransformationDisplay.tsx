'use client';

import { motion } from 'framer-motion';
import type { StressStage } from '@/types/funnel.types';
import Image from 'next/image';

export interface TransformationDisplayProps {
  currentStressStage: StressStage;
  currentScore: number;
  targetScore: number;
  stageTitle: string;
  firstName: string;
}

/**
 * Slider Component for displaying metric levels
 */
function MetricSlider({
  label,
  value,
  isHigh
}: {
  label: string;
  value: string;
  isHigh: boolean;
}) {
  const percentage = isHigh ? 75 : 25;

  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] text-gray-700 font-medium">{label}</span>
        <span className="text-[10px] text-gray-600">{value}</span>
      </div>
      <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all ${
            isHigh ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white shadow-sm ${
            isHigh ? 'bg-green-600' : 'bg-red-600'
          }`}
          style={{ left: `calc(${percentage}% - 4px)` }}
        />
      </div>
    </div>
  );
}

export function TransformationDisplay({
  currentStressStage,
  currentScore,
  targetScore,
  stageTitle,
  firstName,
}: TransformationDisplayProps) {
  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto">
        {/* Two-column layout with arrow */}
        <div className="grid grid-cols-2 gap-3 items-start">

          {/* LEFT SIDE - "Dnes" (Before) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Pink "Dnes" Label */}
            <div className="flex justify-center mb-1.5">
              <span className="inline-block px-2.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-200">
                Dnes
              </span>
            </div>

            {/* Stressed Woman Image - MUCH SMALLER */}
            <div className="relative mb-2 bg-white rounded-md overflow-hidden shadow-sm">
              <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                {/* Placeholder for stressed woman image */}
                <div className="text-center text-gray-400">
                  <div className="text-3xl mb-0.5">😰</div>
                  <p className="text-[9px]">Stresovaná</p>
                </div>
              </div>
            </div>

            {/* Stats Card - Before - VERY COMPACT */}
            <div className="bg-gray-50 rounded-md p-2 shadow-sm border border-gray-100">
              {/* Úroveň stresu */}
              <div className="mb-1.5 pb-1.5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-700 font-medium">Úroveň stresu</span>
                  <span className="inline-block px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-semibold rounded border border-red-200">
                    Vysoká
                  </span>
                </div>
              </div>

              {/* Hladina energie */}
              <MetricSlider label="Hladina energie" value="Nízká" isHigh={false} />

              {/* Úroveň sebevědomí */}
              <MetricSlider label="Úroveň sebevědomí" value="Nízká" isHigh={false} />
            </div>

            {/* Arrow positioned absolutely between cards */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:block">
              <div className="text-gray-300 text-2xl font-light">
                »
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE - "Tvůj cíl" (After) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Dark Green "Tvůj cíl" Label */}
            <div className="flex justify-center mb-1.5">
              <span className="inline-block px-2.5 py-0.5 bg-green-700 text-white text-[10px] font-bold rounded-full">
                Tvůj cíl
              </span>
            </div>

            {/* Calm Woman Image - MUCH SMALLER */}
            <div className="relative mb-2 bg-white rounded-md overflow-hidden shadow-sm">
              <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                {/* Placeholder for calm woman image */}
                <div className="text-center text-gray-400">
                  <div className="text-3xl mb-0.5">😊</div>
                  <p className="text-[9px]">Klidná</p>
                </div>
              </div>
            </div>

            {/* Stats Card - After - VERY COMPACT */}
            <div className="bg-gray-50 rounded-md p-2 shadow-sm border border-gray-100">
              {/* Úroveň stresu */}
              <div className="mb-1.5 pb-1.5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-700 font-medium">Úroveň stresu</span>
                  <span className="inline-block px-1.5 py-0.5 bg-green-50 text-green-600 text-[9px] font-semibold rounded border border-green-200">
                    Nízká
                  </span>
                </div>
              </div>

              {/* Hladina energie */}
              <MetricSlider label="Hladina energie" value="Vysoká" isHigh={true} />

              {/* Úroveň sebevědomí */}
              <MetricSlider label="Úroveň sebevědomí" value="Vysoká" isHigh={true} />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
