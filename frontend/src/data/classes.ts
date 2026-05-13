// Base classes for Dark and Darker. Base stats per class (lvl 1, no gear).
// Source: Dark and Darker wiki community values (approximations sufficient for builder).

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
  emblem: string; // single rune-like glyph for portrait
  baseStats: {
    strength: number;
    agility: number;
    will: number;
    knowledge: number;
    resourcefulness: number;
    vigor: number;
  };
  // Health = (vigor base) -> derived; using game's max-hp baseline at lvl 1
  baseMaxHp: number;
  baseMoveSpeed: number; // base value in raw "move speed" units (300 = walking baseline)
  baseActionSpeed: number; // 100 = neutral
  baseArmorRating: number;
  baseMagicResist: number;
  // Allowed equipment slots for this class (some classes can't wear plate, etc.)
  forbiddenItemTypes?: string[];
}

export const CLASSES: ClassDef[] = [
  {
    id: 'fighter',
    name: 'Fighter',
    tagline: 'The Versatile Warrior',
    description:
      'A masterful tactician trained in every weapon and armor. Balanced, durable, and dangerous.',
    emblem: 'F',
    baseStats: { strength: 15, agility: 15, will: 15, knowledge: 10, resourcefulness: 15, vigor: 15 },
    baseMaxHp: 115,
    baseMoveSpeed: 300,
    baseActionSpeed: 100,
    baseArmorRating: 30,
    baseMagicResist: 8,
  },
  {
    id: 'barbarian',
    name: 'Barbarian',
    tagline: 'The Brutal Marauder',
    description:
      'A savage warrior who wields massive weapons. Trades finesse for sheer overwhelming force.',
    emblem: 'B',
    baseStats: { strength: 20, agility: 10, will: 13, knowledge: 8, resourcefulness: 8, vigor: 18 },
    baseMaxHp: 135,
    baseMoveSpeed: 290,
    baseActionSpeed: 95,
    baseArmorRating: 18,
    baseMagicResist: 10,
  },
  {
    id: 'rogue',
    name: 'Rogue',
    tagline: 'The Shadow Stalker',
    description:
      'A nimble assassin who strikes from darkness. Specializes in daggers, traps, and treachery.',
    emblem: 'R',
    baseStats: { strength: 9, agility: 20, will: 10, knowledge: 12, resourcefulness: 20, vigor: 9 },
    baseMaxHp: 90,
    baseMoveSpeed: 305,
    baseActionSpeed: 105,
    baseArmorRating: 10,
    baseMagicResist: 5,
  },
  {
    id: 'ranger',
    name: 'Ranger',
    tagline: 'The Wilderness Hunter',
    description:
      'A patient archer who strikes from afar. Master of the bow, traps, and the wilds.',
    emblem: 'A',
    baseStats: { strength: 12, agility: 18, will: 12, knowledge: 13, resourcefulness: 18, vigor: 12 },
    baseMaxHp: 100,
    baseMoveSpeed: 300,
    baseActionSpeed: 100,
    baseArmorRating: 15,
    baseMagicResist: 5,
  },
  {
    id: 'wizard',
    name: 'Wizard',
    tagline: 'The Arcane Scholar',
    description:
      'A keeper of forbidden spells. Devastating damage at the cost of fragility.',
    emblem: 'W',
    baseStats: { strength: 8, agility: 11, will: 14, knowledge: 22, resourcefulness: 10, vigor: 10 },
    baseMaxHp: 85,
    baseMoveSpeed: 295,
    baseActionSpeed: 100,
    baseArmorRating: 8,
    baseMagicResist: 12,
  },
  {
    id: 'cleric',
    name: 'Cleric',
    tagline: 'The Holy Champion',
    description:
      'A divine warrior who heals allies and smites the wicked with sacred power.',
    emblem: 'C',
    baseStats: { strength: 13, agility: 9, will: 19, knowledge: 17, resourcefulness: 10, vigor: 14 },
    baseMaxHp: 110,
    baseMoveSpeed: 285,
    baseActionSpeed: 95,
    baseArmorRating: 28,
    baseMagicResist: 15,
  },
  {
    id: 'warlock',
    name: 'Warlock',
    tagline: 'The Cursed Pact-Bearer',
    description:
      'A wielder of dark magics who trades flesh for power. Strong sustain, hexes the soul.',
    emblem: 'L',
    baseStats: { strength: 12, agility: 12, will: 18, knowledge: 18, resourcefulness: 10, vigor: 12 },
    baseMaxHp: 100,
    baseMoveSpeed: 295,
    baseActionSpeed: 100,
    baseArmorRating: 14,
    baseMagicResist: 14,
  },
  {
    id: 'bard',
    name: 'Bard',
    tagline: 'The Wandering Minstrel',
    description:
      'A charismatic performer whose songs empower allies and bewilder enemies.',
    emblem: 'D',
    baseStats: { strength: 11, agility: 14, will: 14, knowledge: 15, resourcefulness: 18, vigor: 12 },
    baseMaxHp: 95,
    baseMoveSpeed: 300,
    baseActionSpeed: 102,
    baseArmorRating: 14,
    baseMagicResist: 10,
  },
  {
    id: 'druid',
    name: 'Druid',
    tagline: 'The Wildshape Mystic',
    description:
      'A primal caster who shapeshifts into beasts and channels the fury of nature.',
    emblem: 'U',
    baseStats: { strength: 11, agility: 13, will: 17, knowledge: 17, resourcefulness: 12, vigor: 14 },
    baseMaxHp: 100,
    baseMoveSpeed: 298,
    baseActionSpeed: 100,
    baseArmorRating: 12,
    baseMagicResist: 12,
  },
];

export const getClass = (id: ClassId) => CLASSES.find(c => c.id === id)!;
