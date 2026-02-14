/**
 * Configuration for Post-Quiz Result Screens
 * All display text, thresholds, and mappings
 */

import type { StressStage, TimeCommitmentMinutes, MicroCommitmentKey } from '@/types/funnel.types';

/**
 * Stress stage configuration (4 quartiles)
 */
export const STRESS_STAGE_CONFIG = {
  // Quartile thresholds (inclusive upper bound)
  thresholds: [25, 50, 75, 100] as const,

  // Image paths for each stage
  images: {
    1: '/images/stress_calc/stres1.png',
    2: '/images/stress_calc/stres2.png',
    3: '/images/stress_calc/stres3.png',
    4: '/images/stress_calc/stres4.png',
  } as Record<StressStage, string>,

  // Stage titles
  titles: {
    1: 'Nízká úroveň',
    2: 'Mírná úroveň',
    3: 'Střední úroveň',
    4: 'Vysoká úroveň',
  } as Record<StressStage, string>,

  // Stage descriptions
  descriptions: {
    1: 'V praxi to znamená, že se můžeš častěji cítit pod tlakem a mít větší starosti, které ti berou energii a narušují tvůj klidný spánek.',
    2: 'V praxi to znamená, že se můžeš častěji cítit pod tlakem a mít větší starosti, které ti berou energii a narušují tvůj klidný spánek.',
    3: 'V praxi to znamená, že se můžeš častěji cítit pod tlakem a mít větší starosti, které ti berou energii a narušují tvůj klidný spánek.',
    4: 'V praxi to znamená, že se můžeš častěji cítit pod tlakem a mít větší starosti, které ti berou energii a narušují tvůj klidný spánek.',
  } as Record<StressStage, string>,

  // Segment labels (for display like "Vysoká")
  segmentLabels: {
    1: 'Nízká',
    2: 'Mírná',
    3: 'Střední',
    4: 'Vysoká',
  } as Record<StressStage, string>,
};

/**
 * Get stress stage from normalized score (0-100)
 */
export function getStressStage(normalizedScore: number): StressStage {
  if (normalizedScore <= 25) return 1;
  if (normalizedScore <= 50) return 2;
  if (normalizedScore <= 75) return 3;
  return 4;
}

/**
 * Convert normalized score (0-100) to display score (0-60)
 */
export function toDisplayScore(normalizedScore: number): number {
  return Math.round((normalizedScore / 100) * 60);
}

/**
 * Insight card configuration
 * Maps anchor question keys to card display
 */
export const INSIGHT_CARD_CONFIG = {
  cards: [
    {
      type: 'main_challenge' as const,
      questionKey: 'q26',
      label: 'Hlavní výzva',
      icon: 'target',
      fallback: 'Vnitřní klid',
    },
    {
      type: 'trigger' as const,
      questionKey: 'q02',
      label: 'Spouštěč',
      icon: 'lightning',
      fallback: 'Každodenní stres',
    },
    {
      type: 'tough_period' as const,
      questionKey: 'q05',
      label: 'Náročné období',
      icon: 'calendar',
      fallback: 'Nedávné období',
    },
    {
      type: 'energy_level' as const,
      questionKey: 'q10',
      label: 'Hladina energie',
      icon: 'battery',
      fallback: 'Proměnlivá',
    },
  ],
};

/**
 * Micro-commitment screen configuration
 */
export const MICRO_COMMITMENT_CONFIG: {
  screens: Array<{
    id: 'C1' | 'C2' | 'C3';
    progress: number;
    key: MicroCommitmentKey;
    question: string;
    testimonial: string;
  }>;
} = {
  screens: [
    {
      id: 'C1',
      progress: 35,
      key: 'completer',
      question: 'Patříš mezi lidi, kteří vždy dokončí to, co začali?',
      testimonial: '',
    },
    {
      id: 'C2',
      progress: 56,
      key: 'prioritizeSelf',
      question: 'Cítíš, že nastal čas začít dát sebe a svůj klid na první místo?',
      testimonial: '',
    },
    {
      id: 'C3',
      progress: 78,
      key: 'learnStress',
      question: 'Chceš se naučit, jak přirozeně zvládat stres?',
      testimonial: '',
    },
  ],
};

/**
 * Time commitment options
 */
export const TIME_COMMITMENT_OPTIONS: Array<{
  value: TimeCommitmentMinutes;
  label: string;
}> = [
  { value: 5, label: '5 min / denně' },
  { value: 10, label: '10 min / denně' },
  { value: 15, label: '15 min / denně' },
  { value: 20, label: '20+ min / denně' },
];

/**
 * Projection configuration
 */
export const PROJECTION_CONFIG = {
  // Duration of the program in days
  durationDays: 90,

  // Minimum target score (floor)
  minTargetScore: 10,

  // Display scale maximum
  displayScaleMax: 60,

  // Reduction factors based on time commitment
  // Higher commitment = higher reduction
  reductionFactors: {
    5: 0.25,   // 25% reduction
    10: 0.40,  // 40% reduction
    15: 0.55,  // 55% reduction
    20: 0.70,  // 70% reduction
  } as Record<TimeCommitmentMinutes, number>,
};

/**
 * Calculate projection based on current score and time commitment
 */
export function calculateProjection(
  normalizedScore: number,
  timeCommitmentMinutes: TimeCommitmentMinutes
): {
  targetScore: number;
  displayCurrentScore: number;
  displayTargetScore: number;
  reductionPercent: number;
  targetDate: Date;
} {
  const reductionFactor = PROJECTION_CONFIG.reductionFactors[timeCommitmentMinutes];
  let targetScore = normalizedScore * (1 - reductionFactor);

  // Apply floor
  if (targetScore < PROJECTION_CONFIG.minTargetScore) {
    targetScore = PROJECTION_CONFIG.minTargetScore;
  }

  // Calculate reduction percentage achieved
  const reductionPercent = Math.round(
    ((normalizedScore - targetScore) / normalizedScore) * 100
  );

  // Target date (90 days from now)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + PROJECTION_CONFIG.durationDays);

  return {
    targetScore: Math.round(targetScore),
    displayCurrentScore: Math.round((normalizedScore / 100) * 50),
    displayTargetScore: Math.round((targetScore / 100) * 50),
    reductionPercent,
    targetDate,
  };
}

/**
 * Screen flow order
 */
export const FUNNEL_SCREEN_ORDER: readonly string[] = [
  'A',   // Stress State
  'B',   // Time Commitment
  'C1',  // Micro-commitment 1
  'C2',  // Micro-commitment 2
  'C3',  // Micro-commitment 3
  'D',   // Email Capture
  'E',   // Name Capture
  'F',   // Projection Graph
  'complete',
] as const;

/**
 * Get next screen in funnel
 */
export function getNextScreen(currentScreen: string): string | null {
  const currentIndex = FUNNEL_SCREEN_ORDER.indexOf(currentScreen);
  if (currentIndex === -1 || currentIndex === FUNNEL_SCREEN_ORDER.length - 1) {
    return null;
  }
  const nextScreen = FUNNEL_SCREEN_ORDER[currentIndex + 1];
  return nextScreen !== undefined ? nextScreen : null;
}

/**
 * Get previous screen in funnel
 */
export function getPreviousScreen(currentScreen: string): string | null {
  const currentIndex = FUNNEL_SCREEN_ORDER.indexOf(currentScreen);
  if (currentIndex <= 0) {
    return null;
  }
  const prevScreen = FUNNEL_SCREEN_ORDER[currentIndex - 1];
  return prevScreen !== undefined ? prevScreen : null;
}
