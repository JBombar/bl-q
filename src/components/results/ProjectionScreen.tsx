'use client';

import { motion } from 'framer-motion';
import { ProjectionGraph } from './ProjectionGraph';
import { calculateProjection, STRESS_STAGE_CONFIG } from '@/config/result-screens.config';
import type { TimeCommitmentMinutes, StressStage } from '@/types/funnel.types';

interface ProjectionScreenProps {
  /** User's first name for personalization */
  firstName: string;
  /** Normalized score (0-100) */
  normalizedScore: number;
  /** Time commitment in minutes */
  timeCommitmentMinutes: TimeCommitmentMinutes;
  /** Stress stage (1-4) */
  stressStage: StressStage;
  /** Callback when user continues */
  onContinue: () => void;
}

/**
 * Screen F - Final Projection Graph
 * Shows personalized stress reduction projection
 */
export function ProjectionScreen({
  firstName,
  normalizedScore,
  timeCommitmentMinutes,
  stressStage,
  onContinue,
}: ProjectionScreenProps) {
  // Calculate projection
  const projection = calculateProjection(normalizedScore, timeCommitmentMinutes);

  // Get segment label
  const segmentLabel = STRESS_STAGE_CONFIG.segmentLabels[stressStage];

  // Format target date
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleDateString('cs-CZ', { month: 'long' });
    return `${day}. ${month}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-4 text-center">
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {firstName}, tvuj plan vnitrniho klidu je pripraven!
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Cil: {formatDate(projection.targetDate)}
        </motion.p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Current score display */}
        <motion.div
          className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-gray-600 mb-1">Tvoje aktualni uroven stresu:</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800">
              {projection.displayCurrentScore}
            </span>
            <span className="text-xl text-gray-500">/60</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-sm font-medium ${
              stressStage === 1 ? 'bg-green-100 text-green-700' :
              stressStage === 2 ? 'bg-yellow-100 text-yellow-700' :
              stressStage === 3 ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              ({segmentLabel})
            </span>
          </div>
        </motion.div>

        {/* Projection graph */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <ProjectionGraph
            currentScore={projection.displayCurrentScore}
            targetScore={projection.displayTargetScore}
            targetDate={projection.targetDate}
          />
        </motion.div>

        {/* Target info */}
        <motion.div
          className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cilova uroven stresu:</p>
              <p className="text-xl font-bold text-gray-800">
                {projection.displayTargetScore}/60
                <span className="text-sm font-normal text-green-600 ml-2">
                  (-{projection.reductionPercent}%)
                </span>
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            S {timeCommitmentMinutes} minutami denne muzes dosahnout sveho cile do {formatDate(projection.targetDate)}.
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          className="text-xs text-gray-400 text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Vysledky se mohou lisit v zavislosti na individualnim nasazeni. Toto neni lekarsky nastroj ani diagnoza.
        </motion.p>
      </div>

      {/* Fixed CTA button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <motion.button
          onClick={onContinue}
          className="w-full py-4 bg-[#F9A201] hover:bg-[#e89400] text-white font-semibold rounded-xl transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.98 }}
        >
          Pokracovat
        </motion.button>
      </div>
    </div>
  );
}
