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
    name: 'Alena',
    age: 35,
    photo: '/images/testimonials/alena.jpg',
    text: 'Díky Mirku, že jsi mi dal možnost zúčastnit se tohoto programu. Velmi mi to pomohlo. Celkově je to super strukturované, přesně něco takového jsem potřebovala. Co se týče výsledků, tak hned po prvních 2 dnech jsem cítila pozitivní změny, přesně jak jsi mi popisoval na hovoru minulý týden. Hlavní věc, kterou jsem si na sobě všimla, je, že už nereaguji tak impulzivně na různé situace, které mi během dne vyskočí. Když něco na mě přijde, co mě dříve zvyklo rozhodit, tak používám tu 4. techniku z programu. Nečekala jsem, že to bude až tak dobře fungovat. Těším se na hovor v pátek.',
    rating: 5,
  },
  {
    id: 'testimonial-2',
    name: 'Eva',
    age: 62,
    photo: '/images/testimonials/eva.jpg',
    text: 'Myslela jsem si, že dechová cvičení jsou spíš pro mladé. Ale opak je pravdou. Já už jsem v důchodu a dlouho mě trápila nespavost a vysoký stres, hlavně kvůli zdraví manžela. Byla jsem vyčerpaná a bez nálady. Když jsem začala dělat techniky z programu, konečně jsem se po letech pořádně vyspala. Překvapilo mě, jak moc se zlepšila moje energie přes den a i tlak se mi stabilizoval. Dneska se cítím klidnější, vyrovnanější a mám víc radosti z maličkostí. Nelituju ani minuty, že jsem to zkusila.',
    rating: 5,
  },
  {
    id: 'testimonial-3',
    name: 'Šárka',
    age: 24,
    photo: '/images/testimonials/sarka.jpg',
    text: 'Skončila jsem školu a nastoupila do svojí první práce. Myslela jsem si, že si konečně oddechnu, ale spíš to bylo naopak. Všechno nové: lidi, úkoly, šéf, zodpovědnost. Pořád jsem měla pocit, že musím něco dokazovat a že nesmím udělat chybu. Byla jsem z toho úplně vystresovaná. Domů jsem chodila vyřízená a i když jsem si lehla, hlava mi pořád jela. Nespala jsem skoro vůbec a ráno jsem vstávala už unavená. Když jsem začala dělat ty dechový věci s Mirkem, tak jsem poprvé cítila, že umím vypnout. Najednou jsem spala líp, přes den jsem měla víc energie a i ten stres v práci se mi líp zvládal. Už se necítím, že mě to semele hned na začátku. Fakt mi to hodně pomohlo.',
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
    question: 'Co je to vlastně Metoda vnitřního klidu™?',
    answer:
      'Metoda vnitřního klidu™ je ucelený systém, který propojuje vědomou práci s dechem s moderními technikami pro regeneraci nervového systému. Je navržena tak, aby přepnula tvé tělo z režimu „přežití" do stavu hlubokého klidu a bezpečí. Na rozdíl od léků nebo obecných rad, které často řeší jen následky, jde tato metoda přímo ke kořenům problému – k fyziologické reakci tvého těla.',
  },
  {
    id: 'faq-2',
    question: 'Co když už jsem podobné nástroje zkoušela a nefungovaly?',
    answer:
      'Tento program je jiný než nástroje, které jsi možná zkoušela dřív, protože je založený na vědě. Nejde o žádné obecné rady, které kloužou po povrchu. Kombinujeme techniky podložené výzkumem a vytvořené odborníky tak, aby garantovaly tvůj úspěch. Na rozdíl od univerzálních návodů je tento plán navržen tak, aby řešil tvé konkrétní potřeby a výzvy. Jdeme přímo k příčině stresu v nervovém systému, místo abychom jen hasili následky.',
  },
  {
    id: 'faq-3',
    question: 'Co když nemám dostatečně pevnou vůli na to, abych plán dodržela?',
    answer:
      'Metoda vnitřního klidu™ není o tvrdém drilu nebo přemáhání se. Je navržena tak, aby byla jednoduchá, příjemná a zabrala ti jen pár minut denně. Místo tlaku stavíme na malých, přirozených krocích, které se ti snadno dostanou pod kůži, aniž bys musela bojovat sama se sebou. Program tě spíše „ponese", než abys ho musela „tlačit".',
  },
  {
    id: 'faq-4',
    question: 'Za jak dlouho se začnu cítit lépe? A vydrží výsledky?',
    answer:
      'Mnoho žen se cítí klidně a vyrovnaně už po pár dnech. A co je na tom nejlepší – nejde jen o dočasnou úlevu. Techniky v programu pomáhají změnit, jak tvoje tělo i duše zvládají stres. Díky tomu se klid a pohoda stanou tvým novým normálem, ne jen chvilkovým stavem.',
  },
  {
    id: 'faq-5',
    question: 'Budu mít nějakou podporu, nebo v tom budu sama?',
    answer:
      'Neboj, nikdy nejsi sama. Čeká tě pravidelný skupinový mentoring, prostor pro tvé dotazy a komunita žen, které procházejí tím samým, čím možná zrovna ty. A když budeš mít kdykoli otázku, Mirek a náš přátelský tým podpory jsou tu pro tebe.',
  },
];

// ============================================================================
// GUARANTEE
// ============================================================================

export const GUARANTEE = {
  title: '30 denní záruka vrácení peněz',
  description:
    'Na tvůj plán se vztahuje 100% záruka vrácení peněz. Jsme si natolik jistí, že ti program pomůže, že garantujeme vrácení peněz v plné výši do 30 dnů od nákupu, pokud i přes dodržování plánu nezaznamenáš viditelné výsledky. Zjistit více.',
  icon: '✅',
  features: [
    'Vrácení peněz do 30 dní',
    '100% záruka',
    'Bez zbytečných otázek',
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
  copyright: '© Copyrights by betterlady.cz All Rights Reserved.',
  links: [
    { label: 'Ochrana osobních údajů', href: '/privacy' },
    { label: 'Obchodní podmínky', href: '/terms' },
  ],
};
