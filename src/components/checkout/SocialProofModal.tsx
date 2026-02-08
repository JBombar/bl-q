'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export interface SocialProofModalProps {
  onContinue: () => void;
  onClose: () => void;
}

/**
 * Static comparison graph SVG
 * Red line: stress stays high without Better Lady (45 → 40)
 * Green line: stress drops dramatically with Better Lady (45 → 15)
 */
function ComparisonGraph() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="w-full max-w-[320px] mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid lines */}
      <line x1="35" y1="50" x2="305" y2="50" stroke="#f0f0f0" strokeWidth="1" />
      <line x1="35" y1="84" x2="305" y2="84" stroke="#f0f0f0" strokeWidth="1" />
      <line x1="35" y1="118" x2="305" y2="118" stroke="#f0f0f0" strokeWidth="1" />
      <line x1="35" y1="152" x2="305" y2="152" stroke="#f0f0f0" strokeWidth="1" />
      <line x1="35" y1="186" x2="305" y2="186" stroke="#f0f0f0" strokeWidth="1" />

      {/* Y-axis labels */}
      <text x="28" y="54" textAnchor="end" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">50</text>
      <text x="28" y="88" textAnchor="end" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">40</text>
      <text x="28" y="122" textAnchor="end" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">30</text>
      <text x="28" y="156" textAnchor="end" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">20</text>
      <text x="28" y="190" textAnchor="end" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">10</text>

      {/* X-axis labels */}
      <text x="35" y="206" textAnchor="middle" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">Týden 1</text>
      <text x="125" y="206" textAnchor="middle" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">Týden 2</text>
      <text x="215" y="206" textAnchor="middle" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">Týden 3</text>
      <text x="305" y="206" textAnchor="middle" fontSize="10" fill="#919191" fontFamily="Figtree, sans-serif">Týden 4</text>

      {/* Red area fill (without Better Lady) — smooth S-curve */}
      <path
        d="M 35,67 C 80,67 80,74 125,76 S 260,82 305,84 L 305,186 L 35,186 Z"
        fill="#e60000"
        opacity="0.07"
      />

      {/* Green area fill (with Better Lady) — smooth S-curve */}
      <path
        d="M 35,67 C 65,75 80,100 125,118 S 260,162 305,169 L 305,186 L 35,186 Z"
        fill="#327455"
        opacity="0.07"
      />

      {/* Red line — smooth S-curve */}
      <path
        d="M 35,67 C 80,67 80,74 125,76 S 260,82 305,84"
        fill="none"
        stroke="#e60000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Green line — smooth S-curve */}
      <path
        d="M 35,67 C 65,75 80,100 125,118 S 260,162 305,169"
        fill="none"
        stroke="#327455"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Data point circles */}
      {/* Start point (shared) */}
      <circle cx="35" cy="67" r="6" fill="white" stroke="#e60000" strokeWidth="2" />
      {/* Red end point */}
      <circle cx="305" cy="84" r="6" fill="white" stroke="#e60000" strokeWidth="2" />
      {/* Green end point */}
      <circle cx="305" cy="169" r="6" fill="white" stroke="#c8f29d" strokeWidth="2.5" />

      {/* "Dnes" badge */}
      <rect x="15" y="33" width="48" height="26" rx="6" fill="#ffd2d2" />
      <text x="39" y="50" textAnchor="middle" fontSize="14" fill="#292424" fontFamily="Figtree, sans-serif" fontWeight="400">Dnes</text>
      <polygon points="33,59 39,67 45,59" fill="#ffd2d2" />

      {/* "bez Better Lady" badge */}
      <rect x="218" y="50" width="105" height="26" rx="6" fill="#ffd2d2" />
      <text x="270" y="67" textAnchor="middle" fontSize="14" fill="#292424" fontFamily="Figtree, sans-serif" fontWeight="400">bez Better Lady</text>
      <polygon points="298,76 304,84 310,76" fill="#ffd2d2" />

      {/* "s Better Lady" badge */}
      <rect x="222" y="136" width="92" height="26" rx="6" fill="#e6eeeb" />
      <text x="268" y="153" textAnchor="middle" fontSize="14" fill="#292424" fontFamily="Figtree, sans-serif" fontWeight="400">s Better Lady</text>
      <polygon points="298,162 304,170 310,162" fill="#e6eeeb" />
    </svg>
  );
}

/**
 * SocialProofModal (Modal #3)
 * Exit intent modal showing comparison graph and offering additional discount
 */
export function SocialProofModal({
  onContinue,
  onClose,
}: SocialProofModalProps) {
  // ESC key handler
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* Modal Card — slower entrance so user notices the change */}
      <motion.div
        className="relative bg-white rounded-t-[16px] sm:rounded-[10px] shadow-2xl w-full max-w-[500px] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto p-4 sm:p-6 font-figtree"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-[16px] sm:text-[18px] font-bold text-[#292424] flex-1 text-center pl-8">
            Věděla jsi, že?
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#f6f6f6] rounded-[10px] flex items-center justify-center shrink-0"
            aria-label="Zavřít"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="#292424" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Statistic text */}
        <p className="text-[15px] sm:text-[18px] font-bold text-[#292424] leading-[20px] sm:leading-[23.4px] mb-4 sm:mb-5">
          <span className="text-[#327455]">86% studentek</span>, které začaly
          svůj plán s Better Lady, zaznamenalo během prvního měsíce{' '}
          <span className="text-[#327455]">výrazné snížení hladiny stresu</span>.
        </p>

        {/* Comparison Graph */}
        <div className="mb-4 sm:mb-5">
          <ComparisonGraph />
        </div>

        {/* Call-out Box */}
        <div className="bg-[#327455]/[0.08] rounded-[12px] p-3 sm:p-4 mb-4 sm:mb-5">
          <p className="text-[14px] sm:text-[16px] font-bold text-[#292424] leading-[18px] sm:leading-[20.8px] text-center">
            Chceme, abys podobné výsledky zaznamenala i ty, proto ti na tvůj
            plán nabízíme dodatečnou slevu.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="w-full h-12 sm:h-14 bg-[#f9a201] hover:bg-[#e09201] active:scale-[0.98] text-white text-[16px] font-extrabold rounded-[10px] transition-all uppercase tracking-wide"
        >
          Pokračovat
        </button>
      </motion.div>
    </div>
  );
}
