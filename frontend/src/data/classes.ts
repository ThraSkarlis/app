// Base class data sourced from https://darkanddarker.wiki.spellsandguns.com (Patch 6.11)
// Every class's 7 attributes sum to exactly 105.

export type ClassId =
  | 'fighter'
  | 'barbarian'
  | 'rogue'
  | 'ranger'
  | 'wizard'
  | 'cleric'
  | 'warlock'
  | 'bard'
  | 'druid';

export interface ClassDef {
  id: ClassId;
  name: string;
  tagline: string;
  description: string;
  emblem: string;
  baseStats: {
    strength: number;
    vigor: number;
    agility: number;
    dexterity: number;
    will: number;
    knowledge: number;
    resourcefulness: number;
  };
  // Final naked-character Health as shown on each wiki class page.
  baseMaxHp: number;
  // Class-level memory capacity baseline (some casters get bonus).
  baseMemoryCap?: number;
}

export const CLASSES: ClassDef[] = [
  {
    id: 'fighter',
    name: 'Fighter',
    tagline: 'A Master of Arms',
    description:
      'A versatile warrior with balanced attributes, trained in every weapon and armor.',
    emblem: 'F',
    baseStats: { strength: 15, vigor: 15, agility: 15, dexterity: 15, will: 15, knowledge: 15, resourcefulness: 15 },
    baseMaxHp: 125,
  },
  {
    id: 'barbarian',
    name: 'Barbarian',
    tagline: 'The Brutal Marauder',
    description:
      'A savage warrior wielding massive weapons. Trades finesse for sheer overwhelming force.',
    emblem: 'B',
    baseStats: { strength: 20, vigor: 23, agility: 15, dexterity: 10, will: 15, knowledge: 5, resourcefulness: 17 },
    baseMaxHp: 140,
  },
  {
    id: 'rogue',
    name: 'Rogue',
    tagline: 'The Shadow Stalker',
    description:
      'A nimble assassin who strikes from darkness with daggers, traps, and treachery.',
    emblem: 'R',
    baseStats: { strength: 8, vigor: 8, agility: 18, dexterity: 22, will: 10, knowledge: 14, resourcefulness: 25 },
    baseMaxHp: 95,
  },
  {
    id: 'ranger',
    name: 'Ranger',
    tagline: 'The Wilderness Hunter',
    description:
      'A patient archer who strikes from afar. Master of the bow, traps, and the wilds.',
    emblem: 'A',
    baseStats: { strength: 15, vigor: 15, agility: 17, dexterity: 17, will: 12, knowledge: 14, resourcefulness: 15 },
    baseMaxHp: 110,
  },
  {
    id: 'wizard',
    name: 'Wizard',
    tagline: 'The Arcane Scholar',
    description:
      'A keeper of forbidden spells. Devastating damage at the cost of fragility.',
    emblem: 'W',
    baseStats: { strength: 8, vigor: 10, agility: 12, dexterity: 14, will: 14, knowledge: 25, resourcefulness: 22 },
    baseMaxHp: 95,
    baseMemoryCap: 19,
  },
  {
    id: 'cleric',
    name: 'Cleric',
    tagline: 'The Holy Champion',
    description:
      'A divine warrior who heals allies and smites the wicked with sacred power.',
    emblem: 'C',
    baseStats: { strength: 15, vigor: 15, agility: 13, dexterity: 8, will: 22, knowledge: 22, resourcefulness: 10 },
    baseMaxHp: 120,
    baseMemoryCap: 16,
  },
  {
    id: 'warlock',
    name: 'Warlock',
    tagline: 'The Cursed Pact-Bearer',
    description:
      'A wielder of dark magics who trades flesh for power. Strong sustain, hexes the soul.',
    emblem: 'L',
    baseStats: { strength: 15, vigor: 15, agility: 12, dexterity: 11, will: 22, knowledge: 20, resourcefulness: 10 },
    baseMaxHp: 115,
    baseMemoryCap: 14,
  },
  {
    id: 'bard',
    name: 'Bard',
    tagline: 'The Wandering Minstrel',
    description:
      'A charismatic performer whose songs empower allies and bewilder enemies.',
    emblem: 'D',
    baseStats: { strength: 10, vigor: 10, agility: 13, dexterity: 22, will: 12, knowledge: 13, resourcefulness: 25 },
    baseMaxHp: 100,
  },
  {
    id: 'druid',
    name: 'Druid',
    tagline: 'The Wildshape Mystic',
    description:
      'A primal caster who shapeshifts into beasts and channels the fury of nature.',
    emblem: 'U',
    baseStats: { strength: 11, vigor: 13, agility: 14, dexterity: 11, will: 20, knowledge: 20, resourcefulness: 16 },
    baseMaxHp: 105,
    baseMemoryCap: 14,
  },
];

export const getClass = (id: ClassId) => CLASSES.find(c => c.id === id)!;
