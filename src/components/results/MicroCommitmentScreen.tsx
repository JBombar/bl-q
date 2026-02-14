'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StageLayout } from '@/components/layout';
import { MICRO_COMMITMENT_CONFIG } from '@/config/result-screens.config';
import type { MicroCommitmentKey } from '@/types/funnel.types';

// ─── Phase state machine ───────────────────────────────────────────
type Phase =
  | 'counting_0_35'
  | 'modal_1'
  | 'counting_35_56'
  | 'modal_2'
  | 'counting_56_78'
  | 'modal_3'
  | 'counting_78_100'
  | 'complete';

const PHASE_TARGET: Record<string, number> = {
  counting_0_35: 35,
  counting_35_56: 56,
  counting_56_78: 78,
  counting_78_100: 100,
};

const NEXT_PHASE: Record<string, Phase> = {
  counting_0_35: 'modal_1',
  counting_35_56: 'modal_2',
  counting_56_78: 'modal_3',
  counting_78_100: 'complete',
};

const MODAL_NEXT: Record<string, Phase> = {
  modal_1: 'counting_35_56',
  modal_2: 'counting_56_78',
  modal_3: 'counting_78_100',
};

const MODAL_INDEX: Record<string, number> = {
  modal_1: 0,
  modal_2: 1,
  modal_3: 2,
};

// ─── Hardcoded testimonials (Figma Slide 8) ────────────────────────
const TESTIMONIALS = [
  {
    name: 'Eliška',
    text: 'Hlavní věc, které jsem si na sobě všimla, je, že už nereaguji tak impulzivně na různé situace, které během dne přijdou. Když se objeví něco, co mě dříve dokázalo rozhodit, použiji tu čtvrtou techniku z programu. Nečekala jsem, že to bude fungovat až tak dobře.',
  },
  {
    name: 'Lucka',
    text: 'Když jsem s Better Lady začala spolupracovat, začalo to být jiné. Najednou jsem dokázala vypnout, aspoň na chvíli. Spala jsem lépe, byla jsem klidnější a měla víc trpělivosti. A hlavně jsem zase měla pocit, že nejsem jen máma na plný úvazek, ale že žiju i svůj vlastní život.',
  },
  {
    name: 'Petra',
    text: 'Keď som začala s Better Lady, prvýkrát po dlhej dobe som mala pocit, že veci ovládam ja a nie ony mňa. Dokázala som sa upokojiť aj po šialenom dni. Zrazu som mala viac energie a čistejšiu hlavu. Bolo to, akoby sa mi vrátila iskra, ktorú som už dávno stratila.',
  },
];

// ─── 5-star rating ─────────────────────────────────────────────────
function FiveStars() {
  return (
    <div className="flex gap-[2px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="19" height="19" viewBox="0 0 19 19" fill="#F9A201">
          <path d="M9.5 0l2.5 6.2h6.5l-5.3 3.8 2 6.5L9.5 12.7 3.8 16.5l2-6.5L.5 6.2H7z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Progress Circle (172×172, green #327455, gray #ebebeb) ────────
function ProgressCircle({ progress }: { progress: number }) {
  const size = 172;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ebebeb"
          strokeWidth={strokeWidth}
        />
      </svg>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#327455"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[32px] leading-[35.2px] font-extrabold text-[#327455] font-figtree">
          {progress}%
        </span>
      </div>
    </div>
  );
}

// ─── Modal overlay ─────────────────────────────────────────────────
function CommitmentModal({
  question,
  onAnswer,
}: {
  question: string;
  onAnswer: (value: boolean) => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Overlay — #292424 at 56% */}
      <div className="absolute inset-0 bg-[#292424]/[0.56]" />

      {/* Modal card — 339px, 10px radius, 24px padding */}
      <motion.div
        className="relative w-[339px] bg-white rounded-[10px] p-[24px] flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Question — 18px/19.8px bold, centered, max-w 291px */}
        <p className="text-[18px] leading-[19.8px] font-bold text-[#292424] font-figtree text-center max-w-[291px]">
          {question}
        </p>

        {/* Buttons — 140.5px × 48px each, 10px gap, green bg */}
        <div className="flex gap-[10px] mt-[10px] w-full max-w-[291px]">
          <button
            onClick={() => onAnswer(false)}
            className="flex-1 h-[48px] rounded-[10px] bg-[#327455] text-[15px] leading-[15px] font-bold text-white font-figtree active:opacity-80"
          >
            Ne
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="flex-1 h-[48px] rounded-[10px] bg-[#327455] text-[15px] leading-[15px] font-bold text-white font-figtree active:opacity-80"
          >
            Ano
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main unified component ────────────────────────────────────────
interface MicroCommitmentScreenProps {
  onSave: (key: MicroCommitmentKey, value: boolean) => Promise<void>;
  onComplete: () => void;
  isSaving: boolean;
}

/**
 * Unified counter + micro-commitment modal flow (Slide 8 / 8.1)
 *
 * Single screen with animated percent counter 0→35→56→78→100.
 * Pauses at 35/56/78 to show Yes/No modal questions.
 * Testimonials and layout remain visible the entire time.
 */
export function MicroCommitmentScreen({
  onSave,
  onComplete,
  isSaving,
}: MicroCommitmentScreenProps) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('counting_0_35');

  const screens = MICRO_COMMITMENT_CONFIG.screens;

  // ── Counter animation (increments 1-by-1) ─────────────────────
  useEffect(() => {
    if (!phase.startsWith('counting')) return;
    const target = PHASE_TARGET[phase] ?? 0;

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          setPhase(NEXT_PHASE[phase] ?? 'complete');
          return target;
        }
        return prev + 1;
      });
    }, 160);

    return () => clearInterval(interval);
  }, [phase]);

  // ── Auto-advance to next screen after reaching 100% ───────────
  useEffect(() => {
    if (phase !== 'complete') return;
    const timeout = setTimeout(onComplete, 1800);
    return () => clearTimeout(timeout);
  }, [phase, onComplete]);

  // ── Modal answer handler ───────────────────────────────────────
  const handleModalAnswer = useCallback(
    async (value: boolean) => {
      const idx = MODAL_INDEX[phase];
      if (idx === undefined) return;
      const config = screens[idx];
      if (!config) return;
      await onSave(config.key, value);
      setPhase(MODAL_NEXT[phase] ?? 'complete');
    },
    [phase, screens, onSave]
  );

  const showModal = phase.startsWith('modal_');
  const modalIdx = MODAL_INDEX[phase] ?? 0;
  const modalQuestion = showModal ? screens[modalIdx]?.question ?? '' : '';

  const statusText =
    phase === 'complete'
      ? 'Tvůj osobní plán je připraven!'
      : 'Analyzujeme tvé odpovědi...';

  return (
    <StageLayout
      variant="result"
      bgClass="bg-white"
      showBackButton={false}
      showHeaderLogo={true}
    >
      {/* Progress circle — 172×172, centered */}
      <div className="flex flex-col items-center mt-[43px]">
        <ProgressCircle progress={count} />

        {/* Status text — 14px/15.4px regular, #292424, 8px below circle */}
        <p className="mt-[8px] text-[14px] leading-[15.4px] font-normal text-[#292424] font-figtree text-center">
          {statusText}
        </p>
      </div>

      {/* Main heading — 22px/24.2px bold, #292424, centered */}
      <h2 className="mt-[38px] text-[22px] leading-[24.2px] font-bold text-[#292424] font-figtree text-center max-w-[338px] mx-auto">
        Více než 8500 žen důvěřuje Better Lady
      </h2>

      {/* Testimonials carousel — horizontal scroll, 339×179 cards */}
      <div className="mt-[16px] w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-[10px] w-max">
          <div className="w-[12px] shrink-0" />
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="w-[339px] h-[179px] bg-[#f5f5f5] rounded-[10px] p-[12px] shrink-0"
            >
              <div className="flex items-center gap-[4px]">
                <FiveStars />
                <span className="text-[15px] leading-[15px] font-bold text-[#292424] font-figtree ml-[8px]">
                  {t.name}
                </span>
              </div>
              <p className="mt-[10px] text-[15px] leading-[21px] font-normal text-[#292424] font-figtree max-w-[315px]">
                {t.text}
              </p>
            </div>
          ))}
          <div className="w-[12px] shrink-0" />
        </div>
      </div>

      {/* Modal overlay — shown at 35%, 56%, 78% */}
      <AnimatePresence>
        {showModal && (
          <CommitmentModal
            question={modalQuestion}
            onAnswer={handleModalAnswer}
          />
        )}
      </AnimatePresence>
    </StageLayout>
  );
}
