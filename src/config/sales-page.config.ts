/**
 * Sales Page Configuration
 * All static content, pricing, testimonials, FAQs, and features
 */

import type { StressStage } from '@/types/funnel.types';

// ============================================================================
// PRICING PLANS
// ============================================================================

export interface PricingPlan {
  id: string;
  name: string;
  priceCents: number;
  originalPriceCents?: number;
  billingPeriod: string;
  features: string[];
  badge?: string;
  isRecommended: boolean;
  ctaText: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Základní plán',
    priceCents: 399900, // 3,999 Kč
    originalPriceCents: 599900,
    billingPeriod: '90 dní',
    features: [
      'Kompletní program 90 dní',
      'Přístup k základním modulům',
      'Denní cvičení a techniky',
      'Sledování pokroku',
      'Email podpora',
    ],
    isRecommended: false,
    ctaText: 'CHCI SVŮJ PLÁN',
  },
  {
    id: 'standard',
    name: 'Standardní plán',
    priceCents: 599900, // 5,999 Kč
    originalPriceCents: 799900,
    billingPeriod: '90 dní',
    features: [
      'Vše ze Základního plánu',
      'Všechny prémiové moduly',
      'Osobní mapa pokroku',
      'Kruh důvěry (komunita)',
      'Týdenní tipy od expertů',
      'Prioritní email podpora',
    ],
    badge: 'NEJOBLÍBENĚJŠÍ',
    isRecommended: true,
    ctaText: 'CHCI SVŮJ PLÁN',
  },
  {
    id: 'premium',
    name: 'Premium plán',
    priceCents: 999900, // 9,999 Kč
    originalPriceCents: 1299900,
    billingPeriod: '90 dní + 3 měsíce zdarma',
    features: [
      'Vše ze Standardního plánu',
      'Rozšířený přístup (6 měsíců)',
      '3x individuální konzultace (30 min)',
      'Osobní akční plán',
      'Bonusové workshopy',
      'VIP podpora 24/7',
    ],
    isRecommended: false,
    ctaText: 'CHCI SVŮJ PLÁN',
  },
];

/**
 * Get recommended plan based on stress stage
 */
export function getRecommendedPlan(stressStage: StressStage): string {
  if (stressStage === 4) return 'premium'; // High stress -> Premium
  if (stressStage === 3) return 'standard'; // Medium stress -> Standard
  if (stressStage === 2) return 'standard'; // Mild stress -> Standard
  return 'basic'; // Low stress -> Basic
}

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.id === planId);
}

// ============================================================================
// PLAN HIGHLIGHTS
// ============================================================================

export interface HighlightItem {
  icon: string;
  title: string;
  description: string;
}

export const PLAN_HIGHLIGHTS: HighlightItem[] = [
  {
    icon: '🎯',
    title: 'Personalizovaný přístup',
    description: 'Program přizpůsobený tvému aktuálnímu stavu a cílům',
  },
  {
    icon: '📊',
    title: 'Sledování pokroku',
    description: 'Viditelné výsledky každý týden s grafickým přehledem',
  },
  {
    icon: '🧘‍♀️',
    title: 'Denní cvičení',
    description: 'Praktické techniky na zvládání stresu (10-20 min denně)',
  },
  {
    icon: '💬',
    title: 'Podpora komunity',
    description: 'Kruh důvěry s ženami se stejnými cíli',
  },
  {
    icon: '📚',
    title: 'Expertní vedení',
    description: 'Ověřené metody od psychologů a koučů',
  },
];

// ============================================================================
// SOCIAL PROOF STATS
// ============================================================================

export interface SocialProofStat {
  percentage: number;
  label: string;
  description: string;
}

export const SOCIAL_PROOF_STATS: SocialProofStat[] = [
  {
    percentage: 87,
    label: 'Zlepšení v 30 dnech',
    description: 'Účastnice hlásí viditelné snížení stresu',
  },
  {
    percentage: 92,
    label: 'Spokojenost',
    description: 'Doporučily by program své přátelkyni',
  },
  {
    percentage: 78,
    label: 'Lepší spánek',
    description: 'Účastnice spí lépe a kvalitněji',
  },
];

// ============================================================================
// PAIN POINTS
// ============================================================================

export const PAIN_POINTS: string[] = [
  'Neustálé vyčerpání a únava',
  'Pocit, že nestíháš a jsi pod tlakem',
  'Problémy se spánkem a odpočinkem',
  'Ztráta radosti z věcí, které tě bavily',
  'Pocit viny, když si děláš čas pro sebe',
  'Neustálé obavy a přemýšlení',
  'Vztahy trpí kvůli tvému stresu',
  'Necítíš se ve vlastní kůži dobře',
];

// ============================================================================
// GAINS CHECKLIST
// ============================================================================

export interface GainItem {
  title: string;
  description: string;
}

export const GAINS_CHECKLIST: GainItem[] = [
  {
    title: 'Snížení stresu a úzkosti',
    description: 'Naučíš se techniky, které ti pomohou zvládat stresové situace',
  },
  {
    title: 'Lepší spánek a energie',
    description: 'Získáš zpět kvalitní odpočinek a cítíš se energická',
  },
  {
    title: 'Vnitřní klid a vyrovnanost',
    description: 'Dosáhneš pocitu klidu i v náročných situacích',
  },
  {
    title: 'Lepší vztahy',
    description: 'Budeš mít více trpělivosti a energie pro své blízké',
  },
  {
    title: 'Sebedůvěra a síla',
    description: 'Objevíš svou vnitřní sílu a budeš si více věřit',
  },
  {
    title: 'Radost z každého dne',
    description: 'Vrátíš se k aktivitám, které tě naplňují',
  },
];

// ============================================================================
// PROGRAM MODULES
// ============================================================================

export interface ProgramModule {
  id: string;
  title: string;
  description: string;
  lessons: string[];
  duration: string;
}

export const PROGRAM_MODULES: ProgramModule[] = [
  {
    id: 'module-1',
    title: 'Týden 1-2: Porozumění stresu',
    description: 'Nauč se rozpoznat své spouštěče a pochopit, jak stres funguje',
    duration: '2 týdny',
    lessons: [
      'Co je to stres a jak ovlivňuje tvé tělo',
      'Identifikace tvých osobních spouštěčů',
      'Denní deník stresu - jak sledovat své reakce',
      'První techniky na okamžité uklidnění',
    ],
  },
  {
    id: 'module-2',
    title: 'Týden 3-4: Dýchání a uvolnění',
    description: 'Praktické techniky pro okamžité zklidnění těla i mysli',
    duration: '2 týdny',
    lessons: [
      'Dechová cvičení pro rychlé uklidnění',
      'Progresivní svalová relaxace',
      'Mindfulness a práce s přítomným okamžikem',
      'Večerní rutina pro lepší spánek',
    ],
  },
  {
    id: 'module-3',
    title: 'Týden 5-6: Myšlenky a emoce',
    description: 'Změň způsob, jakým přemýšlíš a reaguješ na stres',
    duration: '2 týdny',
    lessons: [
      'Rozpoznání negativních myšlenkových vzorců',
      'Techniky pro změnu perspektivy',
      'Práce s emocemi a jejich přijímání',
      'Jak zvládat obavy a přemýšlení',
    ],
  },
  {
    id: 'module-4',
    title: 'Týden 7-8: Hranice a priority',
    description: 'Nauč se říkat ne a dávat sebe na první místo',
    duration: '2 týdny',
    lessons: [
      'Stanovení zdravých hranic',
      'Jak říkat "ne" bez pocitu viny',
      'Identifikace tvých priorit',
      'Plánování času pro sebe',
    ],
  },
  {
    id: 'module-5',
    title: 'Týden 9-10: Energie a sebeláska',
    description: 'Získej energii a nauč se pečovat o sebe',
    duration: '2 týdny',
    lessons: [
      'Identifikace zdrojů a vyčerpávačů energie',
      'Praktiky sebelásky a sebepéče',
      'Budování pozitivních návyků',
      'Jak si vytvořit podporující rutiny',
    ],
  },
  {
    id: 'module-6',
    title: 'Týden 11-12: Udržitelný klid',
    description: 'Vytvoř si systém pro dlouhodobý klid a pohodu',
    duration: '2 týdny',
    lessons: [
      'Jak udržet dosažený pokrok',
      'Tvorba osobního plánu na následující měsíce',
      'Strategie pro zvládání budoucích stresů',
      'Oslava tvého pokroku a růstu',
    ],
  },
];

// ============================================================================
// FEATURES
// ============================================================================

export interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  icon: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'trust-circle',
    title: 'Kruh důvěry',
    description:
      'Uzavřená komunita žen se stejnými cíli. Sdílej své zkušenosti, hledaj inspiraci a získej podporu.',
    icon: '🤝',
    imageUrl: '/images/features/trust-circle.png',
  },
  {
    id: 'personal-map',
    title: 'Osobní mapa pokroku',
    description:
      'Grafický přehled tvého pokroku. Sleduj, jak se tvůj stres snižuje a jak rosteš.',
    icon: '📍',
    imageUrl: '/images/features/personal-map.png',
  },
  {
    id: 'daily-exercises',
    title: 'Denní cvičení',
    description:
      'Každý den nové cvičení nebo techniku přizpůsobenou tvému aktuálnímu stavu.',
    icon: '✨',
    imageUrl: '/images/features/daily-exercises.png',
  },
  {
    id: 'expert-support',
    title: 'Expertní podpora',
    description:
      'Přístup k týmu psychologů a koučů, kteří ti pomohou s jakýmikoli dotazy.',
    icon: '👩‍⚕️',
    imageUrl: '/images/features/expert-support.png',
  },
];

// ============================================================================
// TESTIMONIALS
// ============================================================================

export interface Testimonial {
  id: string;
  name: string;
  age: number;
  location?: string;
  photo?: string;
  text: string;
  rating: number;
  beforeAfter?: {
    before: string;
    after: string;
  };
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Petra K.',
    age: 34,
    location: 'Praha',
    photo: '/images/testimonials/petra.jpg',
    text: 'Během 60 dní se můj stres snížil o 45%. Konečně mám energii na věci, které miluji. Better Lady mi změnila život.',
    rating: 5,
    beforeAfter: {
      before: '48/60 bodů',
      after: '26/60 bodů',
    },
  },
  {
    id: 'testimonial-2',
    name: 'Jana M.',
    age: 41,
    location: 'Brno',
    photo: '/images/testimonials/jana.jpg',
    text: 'Konečně jsem si uvedomila, že musím myslet i na sebe. Program mi pomohl nastavit hranice a najít čas pro sebe bez pocitu viny.',
    rating: 5,
  },
  {
    id: 'testimonial-3',
    name: 'Marie S.',
    age: 29,
    location: 'Ostrava',
    photo: '/images/testimonials/marie.jpg',
    text: 'Metody jsou jednoduché a fungují v běžném životě. Nemusíš měnit celý život, stačí malé kroky každý den.',
    rating: 5,
  },
  {
    id: 'testimonial-4',
    name: 'Lucie T.',
    age: 37,
    location: 'Plzeň',
    photo: '/images/testimonials/lucie.jpg',
    text: 'Po 3 týdnech jsem konečně začala spát lépe. Ráno vstávám odpočatá a večer usínám bez přemýšlení.',
    rating: 5,
  },
];

// ============================================================================
// FAQ
// ============================================================================

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Jak dlouho program trvá?',
    answer:
      'Program je navržen na 90 dní (12 týdnů) s denními aktivitami. Každý den dostaneš nové cvičení nebo techniku, která ti zabere 10-20 minut. Pokud si vezmeš Premium plán, máš přístup na celých 6 měsíců.',
  },
  {
    id: 'faq-2',
    question: 'Kolik času musím věnovat denně?',
    answer:
      'Doporučujeme 10-20 minut denně. Cvičení a techniky jsou navržené tak, aby byly krátké a efektivní. I 5 minut denně ti může výrazně pomoci.',
  },
  {
    id: 'faq-3',
    question: 'Potřebuji nějaké předchozí zkušenosti?',
    answer:
      'Ne, program je vhodný pro každou ženu bez ohledu na zkušenosti. Vedeme tě krok za krokem od úplných základů.',
  },
  {
    id: 'faq-4',
    question: 'Co když mi program nebude vyhovovat?',
    answer:
      'Nabízíme 30denní záruku vrácení peněz. Pokud do 30 dní zjistíš, že program není pro tebe, vrátíme ti celou částku bez zbytečných otázek.',
  },
  {
    id: 'faq-5',
    question: 'Jak funguje Kruh důvěry?',
    answer:
      'Kruh důvěry je uzavřená online komunita pouze pro účastnice programu. Můžeš sdílet své zkušenosti, klást otázky a získat podporu od žen se stejnými cíli. Je to bezpečný prostor bez soudů.',
  },
  {
    id: 'faq-6',
    question: 'Mohu si koupit program jako dárek?',
    answer:
      'Ano, program lze koupit jako dárkový voucher. Po nákupu ti zašleme speciální dárkový kód, který můžeš předat.',
  },
  {
    id: 'faq-7',
    question: 'Je program nahradou za terapii?',
    answer:
      'Ne, program není náhradou za terapii ani lékařskou péči. Jde o preventivní nástroj pro zvládání běžného stresu. Pokud trpíš vážnými psychickými problémy, doporučujeme konzultovat odborníka.',
  },
  {
    id: 'faq-8',
    question: 'Jak rychle uvidím výsledky?',
    answer:
      'Většina účastnic hlásí první zlepšení během 2-3 týdnů. Výrazné změny nastávají po 4-6 týdnech pravidelné praxe. Každý pokračuje svým tempem.',
  },
];

// ============================================================================
// GUARANTEE
// ============================================================================

export const GUARANTEE = {
  title: '30denní záruka vrácení peněz',
  description:
    'Pokud do 30 dní zjistíš, že program není pro tebe, vrátíme ti celou částku. Žádné otázky, žádné podmínky.',
  icon: '✅',
  features: [
    'Vrácení peněz do 30 dní',
    'Žádné otázky ani podmínky',
    'Jednoduchý proces vrácení',
  ],
};

// ============================================================================
// COUNTDOWN TIMER
// ============================================================================

export const COUNTDOWN_CONFIG = {
  durationMinutes: 30, // 30 minutes countdown
  urgencyMessage: 'Nabídka vyprší za:',
  expiredMessage: 'Nabídka vypršela. Objev ji pro tebe znovu.',
};

// ============================================================================
// FOOTER
// ============================================================================

export const FOOTER = {
  copyright: '© 2026 Better Lady. Všechna práva vyhrazena.',
  links: [
    { label: 'Ochrana soukromí', href: '/privacy' },
    { label: 'Obchodní podmínky', href: '/terms' },
    { label: 'Kontakt', href: '/contact' },
  ],
};
