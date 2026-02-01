/**
 * Sales Page Content Constants
 * Content from the client-approved document
 * These are the exact texts for the sales/offer page UI
 */

import type { PlanWithPricing } from './pricing.config';
import { formatPrice, getBillingPeriodText } from './pricing.config';

// ============================================================================
// PROBLEMS LIST - "Jak může vypadat život bez Better Lady"
// ============================================================================

export const PROBLEMS: string[] = [
  'Pocity viny, když nejsi produktivní.',
  'Scrollování na sociálních sítích uprostřed rozdělaného úkolu.',
  'Pocity stresu, když máš zrovna volný čas.',
  'Pocit, že v práci pořád jen něco doháníš.',
  'Neustálé kontrolování telefonu, zda ti nepřišla zpráva nebo e-mail.',
  'Nedostatek času na péči o sebe.',
  'Problémy s regenerací a odpočinkem.',
  'Pocit únavy a přehlcení během dne.',
];

// ============================================================================
// SOLUTIONS LIST - "S čím vám Better Lady může pomoci"
// ============================================================================

export const SOLUTIONS: string[] = [
  'Nepřetržité soustředění a koncentrace.',
  'Vyšší hladina energie.',
  'Lepší kvalita spánku a pravidelný spánkový režim.',
  'Emoční stabilita.',
  'Konec výčitek při relaxaci.',
  'Efektivní výkon v práci.',
  'Stabilní rutina v péči o sebe.',
  'Život bez stresu a napětí.',
];

// ============================================================================
// PLAN HIGHLIGHTS - "To nejdůležitější z tvého plánu"
// ============================================================================

export interface PlanHighlight {
  title: string;
  description: string;
}

export const PLAN_HIGHLIGHTS_TITLE = 'To nejdůležitější z tvého plánu';

export const PLAN_HIGHLIGHTS: PlanHighlight[] = [
  {
    title: 'Osobní plán den po dni',
    description: 'sestavený na míru tvým spouštěčům a projevům stresu.',
  },
  {
    title: 'Techniky zaměřené na praxi',
    description: 'rychlá a účinná cvičení, která hladce zapadnou do tvého dne.',
  },
  {
    title: 'Tvá okamžitá opora v kapse',
    description: 'nástroje pro rychlé zklidnění dostupné 24/7, aby ti pomohly přesně tehdy, kdy to nejvíc potřebuješ.',
  },
  {
    title: 'Nulové nároky na vybavení',
    description: 'všechna cvičení jsou navržena tak, aby ti stačila jen vlastní mysl a tělo.',
  },
  {
    title: 'Ověřený obsah založený na datech',
    description: 'vědecky podložené informace pro spolehlivé a efektivní výsledky.',
  },
];

// Legacy export for backwards compatibility
export const PLAN_FEATURES: string[] = PLAN_HIGHLIGHTS.map(h => `${h.title} – ${h.description}`);

// ============================================================================
// SOCIAL PROOF STATS
// ============================================================================

export const SOCIAL_PROOF_TITLE = 'Více než 59 žen začalo dnes svůj plán s Metodou vnitřního klidu™!';

export interface SocialProofStat {
  percentage: number;
  label: string;
}

export const SOCIAL_PROOF_STATS: SocialProofStat[] = [
  { percentage: 81, label: 'méně stresu v běžném dni' },
  { percentage: 73, label: 'nárůst životní energie' },
  { percentage: 72, label: 'vyšší sebevědomí' },
];

export const SOCIAL_PROOF_DISCLAIMER = 'Data vycházejí z průzkumu mezi 357 účastnicemi. Porovnali jsme výsledky jejich diagnostiky v Osobní mapě před zahájením programu a po uplynutí prvních 4 týdnů.';

// Legacy export
export const SOCIAL_PROOF_TEXT = SOCIAL_PROOF_TITLE;

// ============================================================================
// COURSE CURRICULUM - "Co je součástí tvého plánu"
// ============================================================================

export const CURRICULUM_TITLE = 'Co je součástí tvého plánu';

export interface Lesson {
  number: number;
  title: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  image: string;
  goal: string;
  lessons: Lesson[];
}

export interface PlanSection {
  number: number;
  title: string;
  subtitle: string;
  description?: string;
  modules?: CourseModule[];
}

export const PLAN_SECTIONS: PlanSection[] = [
  {
    number: 1,
    title: 'Detox stresu: Cesta k vnitřnímu klidu',
    subtitle: 'Lekce krok za krokem, hluboká regenerace a nástroje pro okamžité zklidnění.',
    modules: [
      {
        id: 'module-1',
        moduleNumber: 1,
        title: 'Restart nervového systému',
        image: '/images/modules/module-1.png',
        goal: 'Okamžitá úleva, pochopení signálů těla a první hluboký nádech.',
        lessons: [
          { number: 1, title: 'Vítej na cestě: Jak si nastavit tento program pro úspěch' },
          { number: 2, title: 'Tlačítko "Start": Jak okamžitě aktivovat energii' },
          { number: 3, title: 'Dekódování signálů těla: Co se ti tvůj dech snaží říct?' },
          { number: 4, title: 'Chemie klidu: Proč se cítíš ve stresu (a jak to změnit)' },
          { number: 5, title: 'Uvolnění fyzického krunýře: Jak povolit stažené svaly' },
          { number: 6, title: 'Nalezení vlastního tempa: Technika pro zpomalení světa' },
          { number: 7, title: 'Hluboký ponor: První uvolnění emočních bloků' },
        ],
      },
      {
        id: 'module-2',
        moduleNumber: 2,
        title: 'Budování odolnosti a vnitřní síly',
        image: '/images/modules/module-2.png',
        goal: 'Zlepšit spánek, naučit se říkat "ne" a zvládnout větší tlak bez zhroucení.',
        lessons: [
          { number: 8, title: 'Rituál vitality: Jak nastartovat den (Dobrovolná výzva)' },
          { number: 9, title: 'Architektura spánku: Jak se ráno budit skutečně odpočatá' },
          { number: 10, title: 'Rozšíření kapacity I: Jak nevybuchnout, když je toho moc' },
          { number: 11, title: 'Rozšíření kapacity II: Trénink klidu pod tlakem' },
          { number: 12, title: 'Síla zdravých hranic: Umění říkat "Ne" bez pocitu viny' },
          { number: 13, title: 'Aktivní regenerace: Co dělat, když hlava neumí vypnout' },
          { number: 14, title: 'Mentální detox: Vizualizace pro vyčištění mysli' },
        ],
      },
      {
        id: 'module-3',
        moduleNumber: 3,
        title: 'Emoční stabilita v každodenním životě',
        image: '/images/modules/module-3.png',
        goal: 'Vypnout hlavu a mít po ruce nástroje pro krizové situace.',
        lessons: [
          { number: 15, title: 'Druhá vlna uvolnění: Hlubší práce s dechem' },
          { number: 16, title: 'Povzbuzení metabolismu: Energie pro náročné dny' },
          { number: 17, title: 'SOS tlačítko: Technika pro okamžité zastavení paniky' },
          { number: 18, title: 'Regulace nervového systému: Jak se rychle vrátit do rovnováhy' },
          { number: 19, title: 'Konec myšlenkovému kolotoči: Jak zastavit "Overthinking"' },
          { number: 20, title: 'Dechová kotva: Ranní a večerní rituál pro stabilitu' },
          { number: 21, title: 'Soustředění mnicha: Jak získat laserovou pozornost' },
        ],
      },
      {
        id: 'module-4',
        moduleNumber: 4,
        title: 'Vnitřní klid a trvalá rovnováha',
        image: '/images/modules/module-4.png',
        goal: 'Uzdravení starých zranění, prevence vyhoření a udržení výsledků.',
        lessons: [
          { number: 22, title: 'Body Scan: Propojení mysli a těla (Mindfulness)' },
          { number: 23, title: 'Výzva odolnosti: Překonání vlastního pohodlí' },
          { number: 24, title: 'Reset po vyhoření: Jak chytit druhý dech' },
          { number: 25, title: 'Uzdravení vnitřního dítěte: Práce s traumatem' },
          { number: 26, title: 'Velké finále: Závěrečný transformační dech' },
          { number: 27, title: 'Plán udržitelnosti: Jak si udržet klid dlouhodobě' },
        ],
      },
    ],
  },
  {
    number: 2,
    title: 'Kruh důvěry',
    subtitle: 'Pravidelná živá setkání, skupinový mentoring a prostor pro tvé konkrétní dotazy.',
    description: 'Týdenní 90 minutové skupinové hovory, kde Mirek prezentuje téma a následně odpovídá na tvé otázky. Pomůže ti odhalit tvé aktuální stresové spouštěče a získat vhled, který tě posune blíž ke klidu a rovnováze každý týden.',
  },
  {
    number: 3,
    title: 'Osobní mapa vnitřního světa',
    subtitle: 'Unikátní diagnostika, odhalení skrytých stresových spouštěčů a určení jasného směru.',
    description: 'Pomůže ti krok za krokem pochopit, co v tvém těle a mysli spouští stres, jaké změny se v tobě během programu dějí a kam se posouváš. Na začátku si vytvoříš detailní sebehodnocení a zjistíš, kde je tvůj nervový systém právě teď. Každým týdnem pak budeš sledovat své pokroky a zaznamenávat pocity.',
  },
  {
    number: 4,
    title: 'Komunita stejně naladěných žen',
    subtitle: 'Bezpečný prostor pro sdílení, vzájemná motivace a jistota.',
    description: 'Cesta ke klidu je mnohem snazší, když na ni nejsi sama. V naší uzavřené skupině najdeš pochopení a podporu od žen, které řeší stejné výzvy jako ty. Je to místo bez souzení, kde můžeš sdílet své pocity, oslavit úspěchy a načerpat motivaci, kdykoliv budeš potřebovat.',
  },
];

// Legacy COURSE_MODULES export for backwards compatibility
export const COURSE_MODULES = PLAN_SECTIONS.map(s => ({
  number: s.number,
  title: s.title,
  description: s.subtitle,
}));

// ============================================================================
// PLAN INFO CARDS
// ============================================================================

export interface PlanInfoCard {
  icon: 'brain' | 'target';
  label: string;
  value: string;
}

export const PLAN_INFO_CARDS: PlanInfoCard[] = [
  {
    icon: 'brain',
    label: 'Hlavní spouštěč',
    value: 'Stres',
  },
  {
    icon: 'target',
    label: 'Cíl plánu',
    value: 'Reset nervového systému',
  },
];

// ============================================================================
// STRESS LEVEL STATES
// ============================================================================

export interface StressLevelState {
  stressLevel: 'Vysoká' | 'Nízká';
  stressLevelVariant: 'high' | 'low';
  energyLevel: 'Nízká' | 'Vysoká';
  confidenceLevel: 'Nízká' | 'Vysoká';
}

export const CURRENT_STATE: StressLevelState = {
  stressLevel: 'Vysoká',
  stressLevelVariant: 'high',
  energyLevel: 'Nízká',
  confidenceLevel: 'Nízká',
};

export const GOAL_STATE: StressLevelState = {
  stressLevel: 'Nízká',
  stressLevelVariant: 'low',
  energyLevel: 'Vysoká',
  confidenceLevel: 'Vysoká',
};

// ============================================================================
// COUNTDOWN TIMER CONFIG
// ============================================================================

export const COUNTDOWN_TIMER = {
  durationSeconds: 600, // 10 minutes
  discountText: '30% sleva je rezervovaná na:',
};

// ============================================================================
// CTA BUTTON TEXT
// ============================================================================

export const CTA_BUTTON_TEXT = 'CHCI SVŮJ PLÁN';

// ============================================================================
// SECTION HEADINGS
// ============================================================================

export const SECTION_HEADINGS = {
  problemsList: 'Jak může vypadat život bez Better Lady',
  solutionsList: 'S čím vám Better Lady může pomoci',
  testimonials: 'Pár slov od našich studentek',
  hero: 'Tvůj personalizovaný plán vnitřního klidu je připraven!',
  planHighlights: 'To nejdůležitější z tvého plánu',
  curriculum: 'Co je součástí tvého plánu',
  faq: 'Často kladené otázky',
};

// ============================================================================
// PROMO CODE
// ============================================================================

export const PROMO_CODE = {
  appliedText: 'Tvůj slevový kód je uplatněn!',
  timerLabels: {
    minutes: 'minut',
    seconds: 'sekund',
  },
};

// ============================================================================
// STATUS BADGES
// ============================================================================

export const STATUS_BADGES = {
  today: 'Dnes',
  goal: 'Tvůj cíl',
};

// ============================================================================
// STRESS CARD LABELS
// ============================================================================

export const STRESS_CARD_LABELS = {
  stressLevel: 'Úroveň stresu',
  energyLevel: 'Hladina energie',
  confidenceLevel: 'Úroveň sebevědomí',
};

// ============================================================================
// DISCLAIMER TEXT
// ============================================================================

/**
 * Generate dynamic disclaimer text based on selected plan and pricing tier
 */
export function getPricingDisclaimer(plan: PlanWithPricing): string {
  const initialPrice = formatPrice(plan.initialPriceCents);
  const recurringPrice = formatPrice(plan.recurringPriceCents);
  const billingPeriod = getBillingPeriodText(plan.billingInterval);

  if (plan.initialPriceCents === plan.recurringPriceCents) {
    // No discount - full price tier
    return `Kliknutím na „CHCI SVŮJ PLÁN" souhlasíte s předplatným za ${recurringPrice} Kč / ${billingPeriod}, které se automaticky obnovuje. Zrušit lze v aplikaci nebo e-mailem: podpora@betterlady.cz. Podrobnosti viz Podmínky předplatného.`;
  }

  // With introductory discount
  return `Kliknutím na „CHCI SVŮJ PLÁN" souhlasíte s úvodní cenou ${initialPrice} Kč za první ${billingPeriod}, která poté automaticky přejde na ${recurringPrice} Kč / ${billingPeriod}, pokud nebude zrušeno. Zrušit lze v aplikaci nebo e-mailem: podpora@betterlady.cz. Podrobnosti viz Podmínky předplatného.`;
}

// Legacy static export for backwards compatibility (uses placeholder)
export const PRICING_DISCLAIMER = 'Kliknutím na „CHCI SVŮJ PLÁN" souhlasíte s úvodním obdobím za zvýhodněnou cenu, které poté automaticky přejde na standardní předplatné, pokud nebude zrušeno. Zrušit lze v aplikaci nebo e-mailem: podpora@betterlady.cz. Podrobnosti viz Podmínky předplatného.';
