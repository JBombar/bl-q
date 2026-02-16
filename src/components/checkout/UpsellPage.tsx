'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Testimonials } from '@/components/sales/Testimonials';
import { GuaranteeBox } from '@/components/sales/GuaranteeBox';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UpsellPageProps {
  onAddToPlan: () => void | Promise<void>;
  onSkip: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const STEPS = [
  { label: 'Plán', state: 'completed' as const },
  { label: 'Kontrola emailu', state: 'completed' as const },
  { label: 'Bonus', state: 'active' as const },
  { label: 'Přihlášení', state: 'incomplete' as const },
];

const BENEFITS = [
  { name: 'SMS podpora od mentora', originalPrice: 499 },
  { name: 'Osobní video zpětná vazba', originalPrice: 699 },
  { name: 'Týdenní hovory pro dotazy - živě', originalPrice: 599 },
  { name: 'Vedené dechové lekce - živě', originalPrice: 399 },
];

const MENTORS = [
  {
    id: 'miroslav',
    name: 'Miroslav Macháček',
    title: 'Expert na stres',
    bio: 'Pomáhá ženám eliminovat stres a znovu najít vnitřní klid. Ukazuje, jak si pomocí dechu, jednoduchých technik a otužování přirozeně zklidnit nervový systém a zvládat tlak každodenního života. Nečekej žádné ezo ani složité rituály – Mirek všechno vysvětluje lidsky, srozumitelně a tak, aby sis to mohla hned vyzkoušet doma. Jeho přístup pomohl už stovkám žen konečně si vydechnout.',
    image: '/images/upsell-page/mentor_miroslav.png',
  },
  {
    id: 'dominik',
    name: 'Dominik Fujtík',
    title: 'Expert na hubnutí',
    bio: 'Pomáhá ženám pochopit, jak jejich tělo funguje, proč se jim nedaří hubnout i když se snaží, a co s tím dělat.',
    image: null,
  },
];

const FAQ_ITEMS = [
  {
    question: 'Jak mentoring vlastně funguje?',
    answer:
      'Funguje to úplně jednoduše – vše probíhá přímo v aplikaci. Svého mentora máš neustále po ruce a můžeš mu napsat kdykoliv tě něco napadne. Odpovědi dostaneš rychle a vždy s ohledem na tvou situaci.',
  },
  {
    question: 'Je mentoring to samé co terapie?',
    answer:
      'Ne, mentoring není terapie. Mentor ti pomáhá s motivací, návyky a každodenními výzvami. Pokud potřebuješ odbornou psychologickou pomoc, doporučíme ti vyhledat terapeuta.',
  },
  {
    question: 'Co když se mi rada od mentora nebude líbit?',
    answer:
      'Každý mentor respektuje tvůj pohled. Pokud ti něco nesedí, můžeš to otevřeně říct. Cílem je najít přístup, který ti vyhovuje.',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressIndicator() {
  const activeIndex = STEPS.findIndex(s => s.state === 'active');
  const greenEnd = activeIndex >= 0 ? activeIndex : STEPS.filter(s => s.state === 'completed').length - 1;

  return (
    <div className="relative w-full max-w-[440px] mx-auto">
      {/* Green line through completed/active circles (bottom-aligned with circles) */}
      {greenEnd > 0 && (
        <div
          className="absolute bottom-[16px] h-px bg-[#327455]"
          style={{ left: 16, right: `calc(100% - 100% * ${greenEnd} / ${STEPS.length - 1} - 16px)` }}
        />
      )}
      {/* Gray line from active to last circle */}
      {greenEnd < STEPS.length - 1 && (
        <div
          className="absolute bottom-[16px] h-px bg-[#d6d6d6]"
          style={{ left: `calc(100% * ${greenEnd} / ${STEPS.length - 1} + 16px)`, right: 16 }}
        />
      )}

      {/* Steps */}
      <div className="relative flex items-start justify-between">
        {STEPS.map((step) => (
          <div key={step.label} className="flex flex-col items-center gap-2 z-10">
            {/* Label */}
            <span
              className={`text-[12px] leading-[12px] text-center whitespace-nowrap ${
                step.state === 'active'
                  ? 'font-bold text-[#292424]'
                  : 'font-normal text-[#919191]'
              }`}
            >
              {step.label}
            </span>
            {/* Circle */}
            <div className="w-8 h-8 flex items-center justify-center">
              {step.state === 'completed' && (
                <div className="w-8 h-8 rounded-full bg-[#327455] flex items-center justify-center">
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {step.state === 'active' && (
                <div className="w-8 h-8 rounded-full border border-[#327455] bg-white flex items-center justify-center">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#327455]" />
                </div>
              )}
              {step.state === 'incomplete' && (
                <div className="w-8 h-8 rounded-full border border-[#d6d6d6] bg-white" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscountTagIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.59 1.41L1.41 8.59a2 2 0 000 2.83l3.17 3.17a2 2 0 002.83 0l7.18-7.18A2 2 0 0015.17 6L12 2.83a2 2 0 00-1.41-.59H8.59z"
        stroke="#e60000"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="6" r="1" fill="#e60000" />
    </svg>
  );
}

function BenefitRow({
  name,
  originalPrice,
}: {
  name: string;
  originalPrice: number;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[13px] sm:text-[15px] font-normal text-[#919191] truncate min-w-0">
        {name}
      </span>
      <div className="flex-1 border-b border-dotted border-[#919191] min-w-[8px] sm:min-w-[20px] self-end mb-[3px]" />
      <span className="text-[13px] sm:text-[15px] font-normal text-[#919191] line-through whitespace-nowrap shrink-0">
        {originalPrice} Kč
      </span>
      <span className="text-[14px] sm:text-[16px] font-bold text-[#327455] whitespace-nowrap shrink-0 ml-1">
        0 Kč
      </span>
    </div>
  );
}

function PricingCard({
  onAddToPlan,
  onSkip,
  isLoading,
  error,
}: {
  onAddToPlan: () => void | Promise<void>;
  onSkip: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="w-full bg-[#e6eeeb] rounded-[16px] overflow-hidden mt-8">
      {/* Padded content */}
      <div className="p-5 sm:p-6">
        {/* Heading */}
        <h3 className="text-[22px] sm:text-[24px] font-bold text-[#292424] text-center">
          Vyzkoušej to s 35% slevou!
        </h3>

        {/* Plan label + pricing row */}
        <div className="flex items-center justify-between mt-5">
          <span className="text-[18px] font-bold text-[#292424]">
            4-TÝDENNÍ PLÁN
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-normal text-[#919191] line-through">
              1395 Kč
            </span>
            <div className="bg-[#ffd2d2] border border-[#e60000] rounded-[8px] px-2.5 py-1 flex items-center gap-1">
              <span className="text-[14px]">🔥</span>
              <span className="text-[18px] font-bold text-[#e60000]">
                895 Kč
              </span>
            </div>
          </div>
        </div>

        {/* Benefits card with badge on bottom edge */}
        <div className="relative mt-4 pb-4">
          <div className="bg-white rounded-[10px] border border-[#e4e4e4]">
            {/* Benefits header */}
            <p className="text-[15px] font-bold text-[#292424] text-center py-3">
              Zdarma k tvému předplatnému
            </p>
            {/* Benefits list */}
            <div className="px-4 pb-7 flex flex-col gap-2.5">
              {BENEFITS.map((b) => (
                <div key={b.name} className="flex items-baseline gap-1">
                  <span className="text-[14px] sm:text-[15px] font-normal text-[#919191] truncate min-w-0">
                    {b.name}
                  </span>
                  <div className="flex-1 border-b border-dotted border-[#919191] min-w-[8px] sm:min-w-[20px] self-end mb-[3px]" />
                  <span className="text-[15px] sm:text-[16px] font-bold text-[#292424] whitespace-nowrap shrink-0">
                    0 Kč
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* +Další dárky badge — straddles the bottom border */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-[#327455] text-white text-[14px] font-bold rounded-full px-5 py-2 whitespace-nowrap shadow-sm">
              +Další dárky
            </span>
          </div>
        </div>

        {/* Legal disclaimer */}
        <p className="text-[12px] font-normal text-[#919191] leading-[15.6px] mt-4">
          Kliknutím na &bdquo;PŘIDAT DO MÉHO PLÁNU&ldquo; souhlasíš s
          automatickým obnovením předplatného pomocí platebních údajů, které
          jsi zadala dříve. První měsíc stojí 895 Kč, poté 1395 Kč/měsíčně.
          Předplatné můžeš kdykoliv zrušit v aplikaci nebo e-mailem na
          podpora@betterlady.cz.
        </p>

        {/* Error message */}
        {error && (
          <p className="text-[13px] text-[#e60000] text-center mt-3">{error}</p>
        )}

        {/* Primary CTA */}
        <button
          onClick={onAddToPlan}
          disabled={isLoading}
          className="w-full h-14 bg-[#f9a201] hover:bg-[#e09201] active:scale-[0.98] text-white text-[16px] font-extrabold rounded-[10px] transition-all uppercase tracking-wide mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ZPRACOVÁVÁM...
            </>
          ) : (
            'PŘIDAT DO MÉHO PLÁNU'
          )}
        </button>

        {/* Secondary CTA */}
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="w-full text-center text-[16px] font-normal text-[#919191] underline mt-3 cursor-pointer hover:text-[#292424] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Pokračovat bez osobní podpory
        </button>
      </div>
    </div>
  );
}

function StarRating() {
  return (
    <div className="flex gap-0.5 text-[#f9a201] text-[16px]" aria-label="5 out of 5 stars">
      {'★★★★★'.split('').map((star, i) => (
        <span key={i}>{star}</span>
      ))}
    </div>
  );
}

function MentorCard({
  mentor,
  isSelected,
  onSelect,
}: {
  mentor: (typeof MENTORS)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="w-full rounded-[16px] overflow-hidden cursor-pointer transition-all"
    >
      {/* Hero image area */}
      <div className="w-full h-[280px] sm:h-[338px] bg-[#f5f5f5] relative flex items-center justify-center text-[#919191] rounded-[16px] overflow-hidden">
        {mentor.image ? (
          <Image
            src={mentor.image}
            alt={mentor.name}
            fill
            className="object-cover"
          />
        ) : (
          'Mentor Photo'
        )}
        {/* Badge overlay — only show for mentors without image */}
        {!mentor.image && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/64 backdrop-blur-sm rounded-[10px] p-3">
            <StarRating />
            <p className="text-[16px] font-normal text-[#292424] mt-1">
              {mentor.name} &middot; {mentor.title}
            </p>
          </div>
        )}
      </div>

      {/* Bio section */}
      <div className="pt-4">
        <p className="text-[16px] font-normal text-[#292424] leading-[24px]">
          {mentor.bio}
        </p>
      </div>
    </div>
  );
}

function CarouselDots({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      {MENTORS.map((_, i) => (
        <div
          key={i}
          className={
            i === activeIndex
              ? 'w-[30px] h-1.5 bg-[#327455] rounded-full'
              : 'w-1.5 h-1.5 bg-[#d6d6d6] rounded-full'
          }
        />
      ))}
    </div>
  );
}

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

      {/* Red area fill (without support) */}
      <path
        d="M 35,67 C 80,67 80,74 125,76 S 260,82 305,84 L 305,186 L 35,186 Z"
        fill="#e60000"
        opacity="0.07"
      />

      {/* Green area fill (with support) */}
      <path
        d="M 35,67 C 65,75 80,100 125,118 S 260,162 305,169 L 305,186 L 35,186 Z"
        fill="#327455"
        opacity="0.07"
      />

      {/* Red line (stress stays high) */}
      <path
        d="M 35,67 C 80,67 80,74 125,76 S 260,82 305,84"
        fill="none"
        stroke="#e60000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Green line (stress drops) */}
      <path
        d="M 35,67 C 65,75 80,100 125,118 S 260,162 305,169"
        fill="none"
        stroke="#327455"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Data point circles */}
      <circle cx="35" cy="67" r="6" fill="white" stroke="#e60000" strokeWidth="2" />
      <circle cx="305" cy="84" r="6" fill="white" stroke="#e60000" strokeWidth="2" />
      <circle cx="305" cy="169" r="6" fill="white" stroke="#327455" strokeWidth="2.5" />

      {/* "Tady začíná tvá podpora" badge at week 1 */}
      <rect x="2" y="28" width="130" height="22" rx="6" fill="#e60000" />
      <text x="67" y="43" textAnchor="middle" fontSize="11" fill="white" fontFamily="Figtree, sans-serif" fontWeight="700">
        Tady začíná tvá podpora
      </text>
      <polygon points="33,50 39,58 45,50" fill="#e60000" />

      {/* "Bez podpory" badge at week 4 red endpoint */}
      <rect x="248" y="58" width="76" height="20" rx="6" fill="#e60000" />
      <text x="286" y="72" textAnchor="middle" fontSize="11" fill="white" fontFamily="Figtree, sans-serif" fontWeight="700">
        Bez podpory
      </text>
      <polygon points="299,78 305,84 311,78" fill="#e60000" />

      {/* "Nepřestávej a jdi dál!" badge at week 4 green endpoint */}
      <rect x="218" y="140" width="112" height="22" rx="6" fill="#7fde1d" />
      <text x="274" y="155" textAnchor="middle" fontSize="11" fill="white" fontFamily="Figtree, sans-serif" fontWeight="700">
        Nepřestávej a jdi dál!
      </text>
      <polygon points="298,162 304,169 310,162" fill="#7fde1d" />
    </svg>
  );
}

function BenefitSection({
  heading,
  text,
  image,
}: {
  heading: string;
  text: string;
  image: string;
}) {
  return (
    <div className="w-full mt-8">
      <div className="bg-[#f5f5f5] rounded-t-[16px] p-4 sm:p-5">
        <h3 className="text-[20px] font-bold text-[#292424]">{heading}</h3>
        <p className="text-[15px] font-normal text-[#292424] leading-[21px] mt-2">
          {text}
        </p>
      </div>
      <Image
        src={image}
        alt={heading}
        width={500}
        height={472}
        className="w-full h-auto"
      />
    </div>
  );
}

function FaqItem({
  question,
  answer,
  isExpanded,
  onToggle,
}: {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const iconColor = isExpanded ? '#FFFFFF' : '#292424';

  return (
    <div className="rounded-[10px] overflow-hidden font-figtree">
      {/* Question Header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-3 transition-colors text-left"
        style={{ backgroundColor: isExpanded ? '#949BA1' : '#F5F5F5' }}
      >
        {/* Question Mark Icon */}
        <div className="shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2"/>
            <path d="M9.5 9.5C9.5 8.12 10.62 7 12 7C13.38 7 14.5 8.12 14.5 9.5C14.5 10.88 13.38 12 12 12V13.5" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16.5" r="1" fill={iconColor}/>
          </svg>
        </div>

        {/* Question Text */}
        <h3
          className="flex-1 text-[18px] font-bold leading-[1.4em]"
          style={{ color: isExpanded ? '#FFFFFF' : '#292424' }}
        >
          {question}
        </h3>

        {/* Plus/Minus Icon */}
        <div className="shrink-0">
          {isExpanded ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12H19" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      </button>

      {/* Answer Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-white px-5 py-5">
              <p className="text-[16px] text-[#140C0C] leading-[1.6em]">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function UpsellPage({ onAddToPlan, onSkip, isLoading, error }: UpsellPageProps) {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  const [activeMentorCard, setActiveMentorCard] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white font-figtree">
      <motion.div
        className="max-w-[500px] mx-auto px-4 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* 1. Header */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex items-center justify-between pt-6 sm:pt-8 pb-4 border-b border-[#e4e4e4] -mx-[calc(50vw-50%)] px-[calc(50vw-50%)]">
          {/* Logo */}
          <Image
            src="/images/logo-no-arrow.svg"
            alt="Better Lady"
            width={156}
            height={24}
            priority
          />
          {/* Skip link */}
          <button
            onClick={onSkip}
            disabled={isLoading}
            className="text-[16px] font-normal text-[#919191] hover:text-[#292424] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Přeskočit
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 2. Progress Indicator */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-10 sm:mt-[46px]">
          <ProgressIndicator />
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 3. Main Heading */}
        {/* ----------------------------------------------------------------- */}
        <h1 className="text-[24px] sm:text-[28px] font-bold text-[#292424] leading-[30.8px] text-center mt-8 sm:mt-[34px]">
          Přidej si 24/7 nepřetržitou podporu mentora ke svému plánu vnitřního klidu
        </h1>

        {/* ----------------------------------------------------------------- */}
        {/* 4. Subtitle */}
        {/* ----------------------------------------------------------------- */}
        <p className="text-[16px] font-normal text-[#292424] leading-[22.4px] text-center max-w-[376px] mx-auto mt-4">
          Soustřeď se na pokrok, ne na dokonalost, a dosáhni svých výsledku s jistotou.
        </p>

        {/* ----------------------------------------------------------------- */}
        {/* 5. Chat Preview Section */}
        {/* ----------------------------------------------------------------- */}
        <div className="w-full rounded-[16px] overflow-hidden mt-8">
          <Image
            src="/images/upsell-page/upsell_img1.png"
            alt="Chat preview"
            width={500}
            height={338}
            className="w-full h-auto"
          />
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 5b. Value Proposition Card */}
        {/* ----------------------------------------------------------------- */}
        <div className="w-full rounded-[10px] overflow-hidden border border-[#e4e4e4] mt-6">
          {/* Green header */}
          <div className="bg-[#327455] h-[34px] flex items-center justify-center">
            <span className="text-[14px] font-bold text-white">
              Skvělý doplněk na tvé cestě ke klidu.
            </span>
          </div>
          {/* Content */}
          <div className="bg-white p-5 flex flex-col gap-6">
            {/* Item 1 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#e6e6e6] rounded-[10px] flex items-center justify-center shrink-0">
                <Image src="/icons/value_icon1.svg" alt="" width={36} height={36} />
              </div>
              <span className="text-[16px] font-normal text-[#292424] leading-[22.4px]">
                Osobní vedení na každém kroku
              </span>
            </div>
            <div className="h-px bg-[#e4e4e4]" />
            {/* Item 2 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#e6e6e6] rounded-[10px] flex items-center justify-center shrink-0">
                <Image src="/icons/value_icon2.svg" alt="" width={36} height={36} />
              </div>
              <span className="text-[16px] font-normal text-[#292424] leading-[22.4px]">
                Podpora v reálném čase, kdykoliv potřebuješ
              </span>
            </div>
            <div className="h-px bg-[#e4e4e4]" />
            {/* Item 3 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#e6e6e6] rounded-[10px] flex items-center justify-center shrink-0">
                <Image src="/icons/value_icon3.svg" alt="" width={36} height={36} />
              </div>
              <span className="text-[16px] font-normal text-[#292424] leading-[22.4px]">
                Pravidelné sledování tvého pokroku
              </span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 6. Pricing Card */}
        {/* ----------------------------------------------------------------- */}
        <PricingCard onAddToPlan={onAddToPlan} onSkip={onSkip} isLoading={isLoading} error={error} />

        {/* ----------------------------------------------------------------- */}
        {/* 7. Mentor Selection Heading */}
        {/* ----------------------------------------------------------------- */}
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#292424] text-center mt-12 sm:mt-16">
          Vyber si svého osobního mentora
        </h2>
        <p className="text-[16px] font-normal text-[#292424] leading-[22.4px] text-center max-w-[376px] mx-auto mt-4">
          Najdi si parťáka, který ti bude naslouchat a pomůže ti zvládnout každou překážku.
        </p>

        {/* ----------------------------------------------------------------- */}
        {/* 8. Mentor Cards */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex flex-col gap-4 mt-6">
          {MENTORS.map((mentor, i) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              isSelected={selectedMentor === mentor.id}
              onSelect={() => {
                setSelectedMentor(mentor.id);
                setActiveMentorCard(i);
              }}
            />
          ))}
        </div>

        {/* Carousel dots */}
        <CarouselDots activeIndex={activeMentorCard} />

        {/* ----------------------------------------------------------------- */}
        {/* 9. Social Proof Call-out */}
        {/* ----------------------------------------------------------------- */}
        <div className="w-full bg-[#327455]/8 rounded-[12px] p-4 sm:p-5 mt-8">
          <p className="text-[16px] font-normal text-[#292424] leading-[20.8px] text-center">
            V průměru 8 z 10 našich uživatelek se rozhodne pro vedení osobním
            mentorem. Přidej se k nim, zkrať si cestu k výsledkům a měj jistotu,
            že každý tvůj krok dává smysl.
          </p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 10. Results Heading */}
        {/* ----------------------------------------------------------------- */}
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#292424] text-center mt-12 sm:mt-16">
          Komplexní přístup a výsledky, které ti změní život
        </h2>

        {/* ----------------------------------------------------------------- */}
        {/* 10b. Value List */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex flex-col gap-3 mt-6">
          <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-[12px] h-[72px] px-3">
            <div className="w-12 h-12 bg-[#e6e6e6] rounded-[10px] flex items-center justify-center shrink-0">
              <Image src="/icons/icon-magnify-glass.svg" alt="" width={36} height={36} />
            </div>
            <span className="text-[15px] font-normal text-[#292424] leading-[21px]">
              Spoznej samu sebe s Better Lady
            </span>
          </div>
          <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-[12px] h-[72px] px-3">
            <div className="w-12 h-12 bg-[#e6e6e6] rounded-[10px] flex items-center justify-center shrink-0">
              <Image src="/icons/icon-chat.svg" alt="" width={36} height={36} />
            </div>
            <span className="text-[15px] font-normal text-[#292424] leading-[21px]">
              Konzultace s tvými mentory
            </span>
          </div>
          <div className="flex items-center gap-3 bg-[#f5f5f5] rounded-[12px] h-[72px] px-3">
            <div className="w-12 h-12 bg-[#e6e6e6] rounded-[10px] flex items-center justify-center shrink-0">
              <Image src="/icons/icon-growth.svg" alt="" width={36} height={36} />
            </div>
            <span className="text-[15px] font-normal text-[#292424] leading-[21px]">
              Sleduj svůj pokrok v přehledných plánech
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 11. Comparison Graph */}
        {/* ----------------------------------------------------------------- */}
        <h3 className="text-[20px] sm:text-[22px] font-bold text-[#292424] text-center mt-6">
          Tvůj klíč k lepším výsledkům
        </h3>
        <div className="mt-4">
          <Image
            src="/images/upsell-page/results_graph.png"
            alt="Tvůj klíč k lepším výsledkům"
            width={500}
            height={258}
            className="w-full h-auto"
          />
        </div>

        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#292424] text-center mt-12 sm:mt-16">
          Proč vyzkoušet Osobní mentoring?
        </h2>

        {/* ----------------------------------------------------------------- */}
        {/* 12. Three Benefit Sections */}
        {/* ----------------------------------------------------------------- */}
        <BenefitSection
          heading="Skutečné konzultace s mentorem"
          text="Získej přímou podporu od svého mentora. Zapomeň na AI, tohle je skutečné vedení od odborníků."
          image="/images/upsell-page/consultation_mockup1.png"
        />
        <BenefitSection
          heading="Podpora, na kterou se můžeš spolehnout"
          text="Kdykoliv potřebuješ poradit, je tu pro tebe tvůj osobní mentor. Garantujeme maximální diskrétnost – tvé soukromí je u nás na prvním místě."
          image="/images/upsell-page/support_circles.png"
        />
        <BenefitSection
          heading="Přehledně sleduj svůj pokrok"
          text="Díky osobnímu vedení už z cesty nesejdeš. Sleduj, jak se tvé úsilí mění v reálné výsledky den za dnem."
          image="/images/upsell-page/progress_tracking.png"
        />

        {/* ----------------------------------------------------------------- */}
        {/* 13. Problem Tags Section */}
        {/* ----------------------------------------------------------------- */}
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#292424] text-center mt-12 sm:mt-16">
          Co máš právě na srdci?
          <br />
          Tvoji mentoři jsou tu pro tebe.
        </h2>
        <div className="mt-6">
          <Image
            src="/images/upsell-page/worries.png"
            alt="Co máš právě na srdci?"
            width={500}
            height={400}
            className="w-full h-auto"
          />
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 14. Testimonials Section */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-12 sm:mt-16 -mx-4">
          <Testimonials />
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 15. FAQ Section */}
        {/* ----------------------------------------------------------------- */}
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#292424] text-center mt-12 sm:mt-16">
          FAQ
        </h2>
        <div className="flex flex-col gap-3 mt-6">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              question={item.question}
              answer={item.answer}
              isExpanded={expandedFaq === i}
              onToggle={() =>
                setExpandedFaq(expandedFaq === i ? null : i)
              }
            />
          ))}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 16. Guarantee Section */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-12 sm:mt-16 -mx-4">
          <GuaranteeBox />
        </div>
      </motion.div>
    </div>
  );
}
