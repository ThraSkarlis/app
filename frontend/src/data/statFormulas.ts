// Stat formulas from https://darkanddarker.wiki.spellsandguns.com/Stats (Patch 6.11).
// All piecewise curves implemented exactly.

import { ClassDef } from './classes';
import { ItemInstance, ITEM_DB } from './items';

export interface ItemStatBonus {
  strength?: number;
  agility?: number;
  dexterity?: number;
  will?: number;
  knowledge?: number;
  resourcefulness?: number;
  vigor?: number;
  maxHp?: number;
  armorRating?: number;
  magicResistRating?: number; // flat MR rating added by gear
  physicalDamageBonus?: number; // flat % added (e.g. enchant)
  magicDamageBonus?: number; // flat %
  additionalPhysicalDamage?: number;
  additionalMagicDamage?: number;
  truePhysicalDamage?: number;
  trueMagicalDamage?: number;
  moveSpeed?: number; // flat move-speed add (e.g. "+5 move speed")
  actionSpeed?: number; // flat %
  projectileDamageReduction?: number; // flat %
  physicalDamageReduction?: number; // flat %
  magicalDamageReduction?: number; // flat %
  weaponDamage?: number; // for display only
  buffDuration?: number; // flat %
  memoryCapacity?: number;
  magicalHealing?: number;
  interactionSpeed?: number;
  knockbackResistance?: number;
  attackPower?: number;
  magicalPower?: number;
  armorPenetration?: number;
  magicPenetration?: number;
  spellCastingSpeed?: number;
  luck?: number;
}

export interface DerivedStats {
  // Attributes
  strength: number;
  agility: number;
  dexterity: number;
  will: number;
  knowledge: number;
  resourcefulness: number;
  vigor: number;

  // Hybrid / derived
  maxHp: number;
  moveSpeed: number;
  actionSpeed: number; // %
  physicalDamageBonus: number; // %
  magicDamageBonus: number; // %
  magicResistRating: number;
  magicResistPct: number; // %
  armorRating: number;
  physicalDamageReductionPct: number; // %
  projectileDamageReduction: number; // %
  buffDuration: number; // %
  debuffDuration: number; // %
  healthRecoveryBonus: number; // %
  weaponDamage: number;
  additionalPhysicalDamage: number;
  additionalMagicDamage: number;
  truePhysicalDamage: number;
  trueMagicalDamage: number;
  memoryCapacity: number;
  knockbackResistance: number;
  armorPenetration: number;
  magicPenetration: number;
  luck: number;
}

// --- Helper: evaluate a piecewise-linear curve defined by breakpoints.
// breakpoints: [[x0, y0], [x1, y1], ...] inclusive on the left.
function piecewise(x: number, points: [number, number][]): number {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    if (x >= x1 && x <= x2) {
      const t = (x - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return points[points.length - 1][1];
}

// --- Curves from wiki ---

// Physical Power Bonus (also Magic Power Bonus — same curve).
// Inputs: physical/magic POWER (which = attribute value, 0..100).
export function powerBonus(power: number): number {
  return piecewise(power, [
    [0, -0.8],
    [5, -0.3],
    [7, -0.2],
    [11, -0.08],
    [15, 0],
    [50, 0.35],
    [60, 0.4],
    [100, 0.5],
  ]);
}

// Move Speed bonus from Agility (added to baseline 300). Capped at 330 total.
export function moveSpeedFromAgility(agi: number): number {
  return piecewise(agi, [
    [0, -10],
    [10, -5],
    [15, 0],
    [75, 36],
    [100, 43.5],
  ]);
}

// Magic Resistance Rating from Will.
export function magicResistRating(will: number): number {
  return piecewise(will, [
    [0, -20],
    [5, 0],
    [15, 30],
    [33, 102],
    [48, 147],
    [58, 167],
    [100, 209],
  ]);
}

// Magic Resistance % from MR Rating. Capped at 65%.
export function magicResistPct(mr: number): number {
  const p = piecewise(mr, [
    [-300, -5.95],
    [-15, -0.25],
    [8, -0.02],
    [18, 0.03],
    [33, 0.09],
    [53, 0.15],
    [85, 0.23],
    [280, 0.62],
    [340, 0.71],
    [430, 0.8],
    [500, 0.835],
  ]);
  return Math.min(0.65, p);
}

// Buff Duration from Will.
export function buffDuration(will: number): number {
  return piecewise(will, [
    [0, -0.8],
    [5, -0.3],
    [7, -0.2],
    [11, -0.08],
    [15, 0],
    [50, 0.35],
    [100, 0.6],
  ]);
}

// Health Recovery Bonus from Vigor.
export function healthRecoveryBonus(vig: number): number {
  return piecewise(vig, [
    [0, -0.55],
    [5, -0.3],
    [15, 0],
    [25, 0.7],
    [35, 1.2],
    [84, 2.18],
    [85, 2.19],
    [86, 2.22],
    [100, 2.5],
  ]);
}

// Debuff Duration from Will (lower is better, lower cap -95%).
export function debuffDuration(will: number): number {
  const v = piecewise(will, [
    [0, 4],
    [5, 0.429],
    [10, 0.124],
    [15, 0],
    [50, -0.259],
    [100, -0.375],
  ]);
  return Math.max(-0.95, v);
}

// Armor Rating → Physical Damage Reduction %. From -22% at 0 AR (Fighter naked).
// Approximation of wiki curve (post-Hotfix): linear segments hitting known anchors.
export function physicalDmgReduction(ar: number): number {
  const p = piecewise(ar, [
    [0, -0.22],
    [30, -0.07],
    [50, 0.0],
    [100, 0.15],
    [150, 0.27],
    [175, 0.31],
    [200, 0.345],
    [230, 0.38],
    [300, 0.45],
    [500, 0.5],
  ]);
  return Math.min(0.5, p);
}

// Projectile Damage Reduction has no attribute scaling — only from enchants.
// Action Speed is a sum of Agility & Dexterity contributions (hybrid).
export function actionSpeedFromAgility(agi: number): number {
  return piecewise(agi, [
    [0, -0.3],
    [15, 0],
    [50, 0.175],
    [100, 0.25],
  ]);
}
export function actionSpeedFromDexterity(dex: number): number {
  return piecewise(dex, [
    [0, -0.3],
    [15, 0],
    [50, 0.175],
    [100, 0.25],
  ]);
}

// Memory Capacity from Knowledge. Wiki shows Fighter (KNO 15) → memory 9; Wizard (KNO 25) → 19; etc.
export function memoryCapacity(kno: number): number {
  // Roughly +1 per Knowledge above 6, capped at 30
  return Math.max(0, Math.round(kno - 6));
}

// --- Aggregate gear bonuses ---
const KEYS: (keyof ItemStatBonus)[] = [
  'strength', 'agility', 'dexterity', 'will', 'knowledge', 'resourcefulness', 'vigor',
  'maxHp', 'armorRating', 'magicResistRating',
  'physicalDamageBonus', 'magicDamageBonus',
  'additionalPhysicalDamage', 'additionalMagicDamage',
  'truePhysicalDamage', 'trueMagicalDamage',
  'moveSpeed', 'actionSpeed',
  'projectileDamageReduction', 'physicalDamageReduction', 'magicalDamageReduction',
  'weaponDamage', 'buffDuration', 'memoryCapacity', 'magicalHealing',
  'interactionSpeed', 'knockbackResistance', 'attackPower', 'magicalPower',
  'armorPenetration', 'magicPenetration', 'spellCastingSpeed', 'luck',
];

export function sumItemBonuses(equipped: Record<string, string | null>): ItemStatBonus {
  const total: ItemStatBonus = {};
  for (const itemId of Object.values(equipped)) {
    if (!itemId) continue;
    const item = ITEM_DB[itemId];
    if (!item) continue;
    for (const k of KEYS) {
      const v = item.bonuses[k];
      if (v) total[k] = (total[k] || 0) + v;
    }
  }
  return total;
}

// Final derived character sheet, applying gear + wiki formulas.
export function deriveStats(
  cls: ClassDef,
  equipped: Record<string, string | null>,
): DerivedStats {
  const b = sumItemBonuses(equipped);

  const strength = cls.baseStats.strength + (b.strength || 0);
  const agility = cls.baseStats.agility + (b.agility || 0);
  const dexterity = cls.baseStats.dexterity + (b.dexterity || 0);
  const will = cls.baseStats.will + (b.will || 0);
  const knowledge = cls.baseStats.knowledge + (b.knowledge || 0);
  const resourcefulness = cls.baseStats.resourcefulness + (b.resourcefulness || 0);
  const vigor = cls.baseStats.vigor + (b.vigor || 0);

  // Max HP: class baseline + gear deltas via STR/VIG (community values: +1 per STR over base, +3 per VIG over base).
  // This keeps Fighter naked at exactly 125 HP.
  const dStr = strength - cls.baseStats.strength;
  const dVig = vigor - cls.baseStats.vigor;
  const maxHp = Math.round(cls.baseMaxHp + dStr * 1 + dVig * 3 + (b.maxHp || 0));

  // Physical / Magic Power Bonus (curves use raw attribute = power value).
  const physicalDamageBonus = powerBonus(strength) * 100 + (b.physicalDamageBonus || 0);
  const magicDamageBonus = powerBonus(will) * 100 + (b.magicDamageBonus || 0);

  // Move Speed
  const rawMs = 300 + moveSpeedFromAgility(agility) + (b.moveSpeed || 0);
  const moveSpeed = Math.min(330, Math.round(rawMs));

  // Action Speed
  const actionSpeed = round1(
    (actionSpeedFromAgility(agility) + actionSpeedFromDexterity(dexterity)) * 100 +
      (b.actionSpeed || 0),
  );

  // Magic Resist
  const mrRating = magicResistRating(will) + (b.magicResistRating || 0);
  const mrPct = magicResistPct(mrRating) * 100 + (b.magicalDamageReduction || 0);

  // Armor rating: gear-only; PDR derived via curve.
  const armorRating = b.armorRating || 0;
  const pdrPct =
    physicalDmgReduction(armorRating) * 100 + (b.physicalDamageReduction || 0);

  // Buff / Debuff Duration
  const buff = buffDuration(will) * 100 + (b.buffDuration || 0);
  const debuff = debuffDuration(will) * 100;

  // Health Recovery
  const healthRecov = healthRecoveryBonus(vigor) * 100;

  return {
    strength, agility, dexterity, will, knowledge, resourcefulness, vigor,
    maxHp,
    moveSpeed,
    actionSpeed,
    physicalDamageBonus: round1(physicalDamageBonus),
    magicDamageBonus: round1(magicDamageBonus),
    magicResistRating: Math.round(mrRating),
    magicResistPct: round1(mrPct),
    armorRating: Math.round(armorRating),
    physicalDamageReductionPct: round1(pdrPct),
    projectileDamageReduction: round1(b.projectileDamageReduction || 0),
    buffDuration: round1(buff),
    debuffDuration: round1(debuff),
    healthRecoveryBonus: round1(healthRecov),
    weaponDamage: b.weaponDamage || 0,
    additionalPhysicalDamage: b.additionalPhysicalDamage || 0,
    additionalMagicDamage: b.additionalMagicDamage || 0,
    truePhysicalDamage: b.truePhysicalDamage || 0,
    trueMagicalDamage: b.trueMagicalDamage || 0,
    memoryCapacity: memoryCapacity(knowledge) + (b.memoryCapacity || 0),
    knockbackResistance: b.knockbackResistance || 0,
    armorPenetration: b.armorPenetration || 0,
    magicPenetration: b.magicPenetration || 0,
    luck: b.luck || 0,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function previewStats(
  cls: ClassDef,
  equipped: Record<string, string | null>,
  slotId: string,
  hypotheticalItemId: string | null,
): DerivedStats {
  const next = { ...equipped, [slotId]: hypotheticalItemId };
  return deriveStats(cls, next);
}
