// Stat derivation formulas based on the Dark and Darker wiki.
// These approximate the in-game math. Each attribute provides primary + derived effects.
//
// Primary attribute effects (per wiki):
//   Strength       -> +1.5 Max HP per point, +1% Physical Damage Bonus per point
//   Agility        -> +0.3% Move Speed per point, +1% Action Speed per point,
//                     +0.2% Projectile Reduction per point
//   Will           -> +1% Magic Damage Bonus per point, +1 Magical Resistance per point,
//                     +1 Buff/Debuff Duration per point
//   Knowledge      -> +1 Spell Memory Cap per point, +1% Magical Healing per point
//   Resourcefulness-> +1% Interaction Speed per point, +1% Gear-Skill Cooldown reduction
//   Vigor          -> +5 Max HP per point, +0.5 HP Regen per point (per 5s)
//
// Item bonuses are additive. "Additional Physical Damage" appears as flat bonus.

import { ClassDef } from './classes';
import { ItemInstance, ITEM_DB } from './items';

export interface ItemStatBonus {
  // raw attribute bonuses
  strength?: number;
  agility?: number;
  will?: number;
  knowledge?: number;
  resourcefulness?: number;
  vigor?: number;
  // raw derived
  maxHp?: number;
  hpRegen?: number;
  armorRating?: number;
  magicResist?: number;
  physicalDamageBonus?: number; // %
  magicDamageBonus?: number; // %
  additionalPhysicalDamage?: number; // flat
  additionalMagicDamage?: number; // flat
  moveSpeed?: number; // flat units
  actionSpeed?: number; // %
  projectileDamageReduction?: number; // %
  physicalDamageReduction?: number; // %
  magicalDamageReduction?: number; // %
  trueDamage?: number;
  weaponDamage?: number; // displayed for weapons
  buffDuration?: number; // %
  magicalHealing?: number; // %
  spellMemory?: number;
  interactionSpeed?: number; // %
  knockbackResistance?: number;
  attackPower?: number; // %
  magicalPower?: number; // %
}

export interface DerivedStats {
  // primary
  strength: number;
  agility: number;
  will: number;
  knowledge: number;
  resourcefulness: number;
  vigor: number;
  // primary effects / derived
  maxHp: number;
  hpRegen: number;
  moveSpeed: number;
  actionSpeed: number;
  armorRating: number;
  magicResist: number;
  physicalDamageBonus: number;
  magicDamageBonus: number;
  additionalPhysicalDamage: number;
  additionalMagicDamage: number;
  projectileDamageReduction: number;
  physicalDamageReduction: number;
  magicalDamageReduction: number;
  weaponDamage: number;
  spellMemory: number;
  magicalHealing: number;
  buffDuration: number;
  interactionSpeed: number;
  knockbackResistance: number;
  attackPower: number;
  magicalPower: number;
  armorReduction: number; // % from armor rating
  magicReduction: number; // % from magic resist
}

const KEYS: (keyof ItemStatBonus)[] = [
  'strength', 'agility', 'will', 'knowledge', 'resourcefulness', 'vigor',
  'maxHp', 'hpRegen', 'armorRating', 'magicResist',
  'physicalDamageBonus', 'magicDamageBonus',
  'additionalPhysicalDamage', 'additionalMagicDamage',
  'moveSpeed', 'actionSpeed',
  'projectileDamageReduction', 'physicalDamageReduction', 'magicalDamageReduction',
  'trueDamage', 'weaponDamage', 'buffDuration', 'magicalHealing', 'spellMemory',
  'interactionSpeed', 'knockbackResistance', 'attackPower', 'magicalPower',
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

// Armor rating -> physical damage reduction %, smooth curve approximating in-game scaling.
// Roughly: reduction = ar / (ar + 100) capped at 75%. Tunable.
export function armorToReduction(ar: number): number {
  return Math.min(75, (ar / (ar + 100)) * 100);
}

export function magicResistToReduction(mr: number): number {
  return Math.min(75, (mr / (mr + 100)) * 100);
}

export function deriveStats(cls: ClassDef, equipped: Record<string, string | null>): DerivedStats {
  const b = sumItemBonuses(equipped);

  const strength = cls.baseStats.strength + (b.strength || 0);
  const agility = cls.baseStats.agility + (b.agility || 0);
  const will = cls.baseStats.will + (b.will || 0);
  const knowledge = cls.baseStats.knowledge + (b.knowledge || 0);
  const resourcefulness = cls.baseStats.resourcefulness + (b.resourcefulness || 0);
  const vigor = cls.baseStats.vigor + (b.vigor || 0);

  // primary effects
  const strHpBonus = strength * 1.5; // +1.5 HP per Strength
  const vigHpBonus = vigor * 5; // +5 HP per Vigor
  const vigHpRegen = vigor * 0.5;

  const maxHp = cls.baseMaxHp + strHpBonus + vigHpBonus + (b.maxHp || 0);
  const hpRegen = vigHpRegen + (b.hpRegen || 0);

  const physicalDamageBonus = strength * 1 + (b.physicalDamageBonus || 0);
  const magicDamageBonus = will * 1 + (b.magicDamageBonus || 0);

  const moveSpeed = cls.baseMoveSpeed + agility * 0.3 + (b.moveSpeed || 0);
  const actionSpeed = cls.baseActionSpeed + agility * 1 + (b.actionSpeed || 0);

  const armorRating = cls.baseArmorRating + (b.armorRating || 0);
  const magicResist = cls.baseMagicResist + will + (b.magicResist || 0);

  const armorReduction = armorToReduction(armorRating);
  const magicReduction = magicResistToReduction(magicResist);

  return {
    strength, agility, will, knowledge, resourcefulness, vigor,
    maxHp: Math.round(maxHp),
    hpRegen: round1(hpRegen),
    moveSpeed: Math.round(moveSpeed),
    actionSpeed: round1(actionSpeed),
    armorRating: Math.round(armorRating),
    magicResist: Math.round(magicResist),
    physicalDamageBonus: round1(physicalDamageBonus),
    magicDamageBonus: round1(magicDamageBonus),
    additionalPhysicalDamage: b.additionalPhysicalDamage || 0,
    additionalMagicDamage: b.additionalMagicDamage || 0,
    projectileDamageReduction: round1(agility * 0.2 + (b.projectileDamageReduction || 0)),
    physicalDamageReduction: round1(b.physicalDamageReduction || 0),
    magicalDamageReduction: round1(b.magicalDamageReduction || 0),
    weaponDamage: b.weaponDamage || 0,
    spellMemory: knowledge + (b.spellMemory || 0),
    magicalHealing: round1(knowledge * 1 + (b.magicalHealing || 0)),
    buffDuration: round1(will + (b.buffDuration || 0)),
    interactionSpeed: round1(resourcefulness * 1 + (b.interactionSpeed || 0)),
    knockbackResistance: b.knockbackResistance || 0,
    attackPower: round1(b.attackPower || 0),
    magicalPower: round1(b.magicalPower || 0),
    armorReduction: round1(armorReduction),
    magicReduction: round1(magicReduction),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Used for comparing stats vs an equipped item -- given a hypothetical replacement item.
export function previewStats(
  cls: ClassDef,
  equipped: Record<string, string | null>,
  slotId: string,
  hypotheticalItemId: string | null,
): DerivedStats {
  const next = { ...equipped, [slotId]: hypotheticalItemId };
  return deriveStats(cls, next);
}

export interface InstancedItem extends ItemInstance {
  id: string;
}
