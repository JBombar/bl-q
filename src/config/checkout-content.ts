/**
 * Checkout Modal Content Configuration
 * Bonus modules data for the BonusModulesModal (Modal #1)
 */

export interface BonusModule {
  id: number;
  name: string;
  originalPriceCents: number; // in halere (cents)
}

export const BONUS_MODULES: BonusModule[] = [
  { id: 1, name: 'Štíhlá za 28 dní', originalPriceCents: 159000 },
  { id: 2, name: '15 Minutové hormonální tréninky', originalPriceCents: 129000 },
  { id: 3, name: 'Tělo v akci s mentorem Dominikem Fujtíkem', originalPriceCents: 199000 },
  { id: 4, name: 'Hormonální kuchařka', originalPriceCents: 69000 },
  { id: 5, name: 'Zdravý nákupní seznam', originalPriceCents: 99000 },
  { id: 6, name: '2-minutový ranní rituál proti nadýmání', originalPriceCents: 99000 },
  { id: 7, name: 'Průvodce přírodních doplňků výživy', originalPriceCents: 99000 },
];

// Total value: 8,530 Kč (853,000 halere)
export const BONUS_TOTAL_VALUE_CENTS = BONUS_MODULES.reduce(
  (sum, m) => sum + m.originalPriceCents,
  0
);
