'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UpsellPageProps {
  onAddToPlan: () => void;
  onSkip: () => void;
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
    bio: 'Pomáhá ženám eliminovat stres a znovu najít vnitřní klid. Ukazuje, jak si pomocí dechu, jednoduchých technik a otužování přirozeně zklidnit nervový systém.',
  },
  {
    id: 'dominik',
    name: 'Dominik Fujtík',
    title: 'Expert na hubnutí',
    bio: 'Pomáhá ženám pochopit, jak jejich tělo funguje, proč se jim nedaří hubnout i když se snaží, a co s tím dělat.',
  },
];

const PROBLEM_TAGS = [
  'Nedostatek energie',
  'Pochyby o sobě',
  'Pocit zahlcení',
  'Ztráta motivace',
  'Soustředění',
  'Každodenní starosti',
  'Vyhoření v práci',
  'Rozpory v rodině',
];

const TESTIMONIALS = [
  {
    name: 'Alena',
    quote:
      'Díky Mirku, že jsi mi dal možnost zúčastnit se tohoto programu. Cítím se mnohem klidnější a vyrovnanější. Dechová cvičení mi opravdu pomáhají zvládat stresové situace.',
  },
  {
    name: 'Šárka',
    quote:
      'Skončila jsem školu a nastoupila do svojí první práce. Stres byl obrovský. Díky mentorovi jsem se naučila, jak si udržet klid i v náročných situacích.',
  },
  {
    name: 'Eva',
    quote:
      'Myslela jsem si, že dechová cvičení jsou spíš pro mladé. Ale po měsíci s mentorem musím říct, že se cítím lépe než za posledních 10 let.',
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
  return (
    <div className="flex items-start justify-center gap-0 w-full max-w-[440px] mx-auto">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-start flex-1">
          {/* Step */}
          <div className="flex flex-col items-center gap-2 flex-1">
            {/* Circle */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              {step.state === 'completed' && (
                <div className="w-8 h-8 rounded-full bg-[#327455] flex items-center justify-center">
                  <svg
                    width="14"
                    height="10"
                    viewBox="0 0 14 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 5L5 9L13 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
              {step.state === 'active' && (
                <div className="w-8 h-8 rounded-full border border-[#327455] flex items-center justify-center">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#327455]" />
                </div>
              )}
              {step.state === 'incomplete' && (
                <div className="w-8 h-8 rounded-full border border-[#d6d6d6]" />
              )}
            </div>
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
          </div>

          {/* Connection line (between steps) */}
          {i < STEPS.length - 1 && (
            <div className="flex items-center h-8 -mx-1">
              <div
                className={`w-12 sm:w-16 h-px ${
                  STEPS[i + 1]?.state === 'completed' ||
                  STEPS[i + 1]?.state === 'active'
                    ? 'bg-[#327455]'
                    : 'bg-[#d6d6d6]'
                }`}
              />
            </div>
          )}
        </div>
      ))}
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
}: {
  onAddToPlan: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="w-full bg-[#e6eeeb] rounded-[16px] overflow-hidden mt-8">
      {/* Header Badge */}
      <div className="bg-[#327455] text-white text-[14px] font-bold text-center py-2 px-4">
        Skvělý doplněk na tvé cestě ke klidu.
      </div>

      {/* Padded content */}
      <div className="p-5 sm:p-6">
        {/* Plan label */}
        <p className="text-[18px] font-bold text-[#292424] mt-4">
          4-TÝDENNÍ PLÁN
        </p>

        {/* Pricing row */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[16px] font-normal text-[#919191] line-through">
            1395 Kč
          </span>
          <div className="bg-[#ffd2d2] border border-[#e60000] rounded-[8px] px-3 py-1 flex items-center gap-1.5">
            <DiscountTagIcon />
            <span className="text-[18px] font-bold text-[#e60000]">
              895 Kč
            </span>
          </div>
        </div>

        {/* Benefits list */}
        <div className="mt-4 flex flex-col gap-2.5">
          {BENEFITS.map((b) => (
            <BenefitRow
              key={b.name}
              name={b.name}
              originalPrice={b.originalPrice}
            />
          ))}
        </div>

        {/* +Další dárky badge */}
        <span className="bg-[#327455] text-white text-[14px] font-bold rounded-full px-4 py-1.5 inline-block mt-3">
          +Další dárky
        </span>

        {/* Legal disclaimer */}
        <p className="text-[12px] font-normal text-[#919191] leading-[15.6px] mt-4">
          Kliknutím na &bdquo;PŘIDAT DO MÉHO PLÁNU&ldquo; souhlasíš s
          automatickým obnovením předplatného pomocí platebních údajů, které jsi
          zadala dříve. První měsíc stojí 895 Kč, poté 1395 Kč/měsíčně.
          Předplatné můžeš kdykoliv zrušit.
        </p>

        {/* Primary CTA */}
        <button
          onClick={onAddToPlan}
          className="w-full h-14 bg-[#f9a201] hover:bg-[#e09201] active:scale-[0.98] text-white text-[16px] font-extrabold rounded-[10px] transition-all uppercase tracking-wide mt-4"
        >
          PŘIDAT DO MÉHO PLÁNU
        </button>

        {/* Secondary CTA */}
        <button
          onClick={onSkip}
          className="w-full text-center text-[16px] font-normal text-[#919191] mt-3 cursor-pointer hover:text-[#292424] transition-colors"
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
      className={`w-full rounded-[16px] overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'border-[#327455] border-2'
          : 'border border-[#e4e4e4]'
      }`}
    >
      {/* Hero image area */}
      <div className="w-full h-[280px] sm:h-[338px] bg-[#f5f5f5] relative flex items-center justify-center text-[#919191]">
        Mentor Photo
        {/* Badge overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/64 backdrop-blur-sm rounded-[10px] p-3">
          <StarRating />
          <p className="text-[16px] font-normal text-[#292424] mt-1">
            {mentor.name} &middot; {mentor.title}
          </p>
        </div>
      </div>

      {/* Bio section */}
      <div className="p-4 sm:p-5">
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
  placeholder,
}: {
  heading: string;
  text: string;
  placeholder: string;
}) {
  return (
    <div className="w-full mt-8">
      <div className="bg-[#f5f5f5] rounded-[12px] p-4 sm:p-5">
        <h3 className="text-[20px] font-bold text-[#292424]">{heading}</h3>
        <p className="text-[15px] font-normal text-[#292424] leading-[21px] mt-2">
          {text}
        </p>
      </div>
      <div className="w-full h-[400px] sm:h-[472px] bg-linear-to-b from-[#f5f5f5] to-white rounded-[16px] flex items-center justify-center text-[#919191] mt-3">
        {placeholder}
      </div>
    </div>
  );
}

function TestimonialCard({
  name,
  quote,
}: {
  name: string;
  quote: string;
}) {
  return (
    <div className="w-full border border-[#e4e4e4] rounded-[10px] p-5">
      {/* Top row */}
      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div className="w-12 h-12 rounded-full bg-[#f5f5f5] shrink-0" />
        <span className="text-[18px] font-bold text-[#292424]">{name}</span>
      </div>
      {/* Star rating */}
      <div className="mt-1">
        <StarRating />
      </div>
      {/* Quote */}
      <p className="text-[16px] font-normal text-[#292424] leading-[22.4px] mt-3">
        {quote}
      </p>
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
  return (
    <div
      className={`w-full rounded-[10px] overflow-hidden cursor-pointer transition-colors ${
        isExpanded ? 'bg-[#949ba1]' : 'bg-[#f5f5f5]'
      }`}
      onClick={onToggle}
    >
      {/* Question row */}
      <div className="flex items-center gap-3 px-4 h-16">
        {/* ? icon */}
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
          <span className="text-[20px] font-bold text-[#949ba1]">?</span>
        </div>
        {/* Question text */}
        <span
          className={`text-[18px] font-bold ${
            isExpanded ? 'text-white' : 'text-[#292424]'
          }`}
        >
          {question}
        </span>
        {/* Chevron */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`ml-auto shrink-0 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <path
            d="M5 8L10 13L15 8"
            stroke={isExpanded ? 'white' : '#292424'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Answer (animated) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-[16px] font-normal text-[#140c0c] leading-[22.4px]">
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

export function UpsellPage({ onAddToPlan, onSkip }: UpsellPageProps) {
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
        <div className="flex items-center justify-between pt-6 sm:pt-8">
          {/* Invisible spacer */}
          <div className="w-[72px]" />
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
            className="text-[16px] font-normal text-[#919191] hover:text-[#292424] transition-colors"
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
        <PricingCard onAddToPlan={onAddToPlan} onSkip={onSkip} />

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
        {/* 11. Comparison Graph */}
        {/* ----------------------------------------------------------------- */}
        <h3 className="text-[20px] sm:text-[22px] font-bold text-[#292424] text-center mt-6">
          Tvůj klíč k lepším výsledkům
        </h3>
        <div className="mt-4">
          <ComparisonGraph />
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 12. Three Benefit Sections */}
        {/* ----------------------------------------------------------------- */}
        <BenefitSection
          heading="Skutečné konzultace s mentorem"
          text="Získej přímou podporu od svého mentora. Zapomeň na AI, tohle je skutečné vedení od odborníků."
          placeholder="Consultation Mockup"
        />
        <BenefitSection
          heading="Podpora, na kterou se můžeš spolehnout"
          text="Kdykoliv potřebuješ poradit, je tu pro tebe tvůj osobní mentor. Garantujeme maximální diskrétnost – tvé soukromí je u nás na prvním místě."
          placeholder="Support Circles"
        />
        <BenefitSection
          heading="Přehledně sleduj svůj pokrok"
          text="Díky osobnímu vedení už z cesty nesejdeš. Sleduj, jak se tvé úsilí mění v reálné výsledky den za dnem."
          placeholder="Progress Tracking"
        />

        {/* ----------------------------------------------------------------- */}
        {/* 13. Problem Tags Section */}
        {/* ----------------------------------------------------------------- */}
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#292424] text-center mt-12 sm:mt-16">
          Co máš právě na srdci?
          <br />
          Tvoji mentoři jsou tu pro tebe.
        </h2>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6">
          {PROBLEM_TAGS.map((tag) => (
            <div
              key={tag}
              className="bg-white border border-[#e4e4e4] rounded-[10px] h-[45px] px-3 flex items-center gap-2"
            >
              {/* Icon placeholder */}
              <div className="bg-[#e4e4e4] rounded-full w-5 h-5 shrink-0" />
              <span className="text-[15px] font-normal text-[#292424]">
                {tag}
              </span>
            </div>
          ))}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* 14. Testimonials Section */}
        {/* ----------------------------------------------------------------- */}
        <h2 className="text-[24px] sm:text-[28px] font-bold text-[#292424] text-center mt-12 sm:mt-16">
          Recenze
        </h2>
        <div className="flex flex-col gap-4 mt-6">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} name={t.name} quote={t.quote} />
          ))}
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
        <div className="w-full bg-[#fffaef] border border-[#f9a201] rounded-[10px] p-5 sm:p-6 mt-12 sm:mt-16 mb-8 relative">
          {/* Badge icon placeholder */}
          <div className="w-[74px] h-[78px] bg-[#f5f5f5] rounded-[10px] mx-auto -mt-14 flex items-center justify-center text-[#919191] text-[11px]">
            Shield
          </div>
          <h3 className="text-[20px] font-bold text-[#140c0c] leading-[28px] text-center mt-3">
            30 denní záruka vrácení peněz
          </h3>
          <p className="text-[16px] font-normal text-[#140c0c] leading-[22.4px] text-center mt-2">
            Na tvůj plán se vztahuje 100% záruka vrácení peněz. Jsme si natolik
            jistí, že ti program pomůže, že ti v případě nespokojenosti vrátíme
            peníze.
          </p>
          <p className="text-[16px] font-normal text-[#327455] text-center mt-2 cursor-pointer hover:underline">
            Zjistit více
          </p>
        </div>
      </motion.div>
    </div>
  );
}
