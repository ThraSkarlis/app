// Curated Dark and Darker item catalog. Stat values approximated from wiki sources.
// Each item: id, name, slot, allowed classes, rarity, and bonuses.

import { ItemStatBonus } from './statFormulas';
import { ClassId } from './classes';
import { Rarity } from '../theme';

export type SlotId =
  | 'head'
  | 'chest'
  | 'legs'
  | 'feet'
  | 'hands'
  | 'back'
  | 'necklace'
  | 'ring1'
  | 'ring2'
  | 'primary'
  | 'secondary'
  | 'utility1'
  | 'utility2'
  | 'utility3';

export interface SlotDef {
  id: SlotId;
  label: string;
  // The underlying item-type slot used for filtering items
  itemSlot: 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'back' | 'necklace' | 'ring' | 'primary' | 'secondary' | 'utility';
}

export const SLOTS: SlotDef[] = [
  { id: 'head', label: 'Head', itemSlot: 'head' },
  { id: 'necklace', label: 'Necklace', itemSlot: 'necklace' },
  { id: 'back', label: 'Back', itemSlot: 'back' },
  { id: 'chest', label: 'Chest', itemSlot: 'chest' },
  { id: 'hands', label: 'Hands', itemSlot: 'hands' },
  { id: 'legs', label: 'Legs', itemSlot: 'legs' },
  { id: 'feet', label: 'Feet', itemSlot: 'feet' },
  { id: 'ring1', label: 'Ring I', itemSlot: 'ring' },
  { id: 'ring2', label: 'Ring II', itemSlot: 'ring' },
  { id: 'primary', label: 'Primary', itemSlot: 'primary' },
  { id: 'secondary', label: 'Secondary', itemSlot: 'secondary' },
  { id: 'utility1', label: 'Utility I', itemSlot: 'utility' },
  { id: 'utility2', label: 'Utility II', itemSlot: 'utility' },
  { id: 'utility3', label: 'Utility III', itemSlot: 'utility' },
];

export interface ItemInstance {
  id: string;
  name: string;
  itemSlot: SlotDef['itemSlot'];
  classes: ClassId[] | 'all';
  rarity: Rarity;
  bonuses: ItemStatBonus;
  flavor?: string;
}

const ALL: 'all' = 'all';

// Helper: scale primary bonus by rarity tier
const tierMult: Record<Rarity, number> = {
  poor: 0.5,
  common: 1,
  uncommon: 1.4,
  rare: 1.9,
  epic: 2.5,
  legendary: 3.2,
  unique: 4.0,
};

const tierExtraRolls: Record<Rarity, number> = {
  poor: 0,
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  unique: 5,
};

function s(n: number, r: Rarity) {
  return Math.round(n * tierMult[r]);
}

function pct(n: number, r: Rarity) {
  return Math.round(n * tierMult[r] * 10) / 10;
}

// Random-ish but deterministic extra rolls based on slot type.
function extraRolls(slot: SlotDef['itemSlot'], r: Rarity): ItemStatBonus {
  const rolls = tierExtraRolls[r];
  if (rolls === 0) return {};
  const out: ItemStatBonus = {};
  const armorRolls: (keyof ItemStatBonus)[] = ['strength', 'vigor', 'will', 'agility', 'maxHp', 'magicResistRating'];
  const weaponRolls: (keyof ItemStatBonus)[] = ['additionalPhysicalDamage', 'physicalDamageBonus', 'agility', 'strength', 'actionSpeed'];
  const jewelryRolls: (keyof ItemStatBonus)[] = ['will', 'knowledge', 'resourcefulness', 'magicDamageBonus', 'magicalHealing', 'buffDuration'];
  const utilityRolls: (keyof ItemStatBonus)[] = ['hpRegen', 'maxHp', 'interactionSpeed'];

  let pool: (keyof ItemStatBonus)[];
  if (slot === 'primary' || slot === 'secondary') pool = weaponRolls;
  else if (slot === 'necklace' || slot === 'ring') pool = jewelryRolls;
  else if (slot === 'utility') pool = utilityRolls;
  else pool = armorRolls;

  for (let i = 0; i < rolls; i++) {
    const key = pool[i % pool.length];
    const v = key.includes('Damage') || key.includes('Speed') || key.includes('Healing') || key.includes('Duration') ? pct(1.5, r) : s(1, r);
    out[key] = (out[key] || 0) + v;
  }
  return out;
}

// Builds a full rarity ladder for one base item.
function ladder(
  base: Omit<ItemInstance, 'id' | 'rarity' | 'bonuses'> & { baseBonuses: ItemStatBonus; baseId: string },
  rarities: Rarity[] = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'unique'],
): ItemInstance[] {
  return rarities.map(r => {
    const scaled: ItemStatBonus = {};
    for (const [k, v] of Object.entries(base.baseBonuses)) {
      if (typeof v !== 'number') continue;
      const isPercent = ['physicalDamageBonus', 'magicDamageBonus', 'actionSpeed', 'magicalHealing', 'buffDuration', 'interactionSpeed', 'attackPower', 'magicalPower'].includes(k);
      scaled[k as keyof ItemStatBonus] = isPercent ? pct(v, r) : s(v, r);
    }
    const extras = extraRolls(base.itemSlot, r);
    for (const [k, v] of Object.entries(extras)) {
      scaled[k as keyof ItemStatBonus] = (scaled[k as keyof ItemStatBonus] || 0) + (v as number);
    }
    return {
      id: `${base.baseId}_${r}`,
      name: base.name,
      itemSlot: base.itemSlot,
      classes: base.classes,
      rarity: r,
      bonuses: scaled,
      flavor: base.flavor,
    };
  });
}

// Helper to specify class restrictions cleanly
const PLATE_CLASSES: ClassId[] = ['fighter', 'cleric', 'barbarian'];
const LIGHT_CLASSES: ClassId[] = ['rogue', 'wizard', 'warlock', 'bard', 'druid', 'ranger'];

// ==== Items ====

const BASE_ITEMS: Array<Omit<ItemInstance, 'id' | 'rarity' | 'bonuses'> & { baseBonuses: ItemStatBonus; baseId: string }> = [
  // HEADS
  { baseId: 'hood', name: 'Hood', itemSlot: 'head', classes: ALL, baseBonuses: { armorRating: 4 }, flavor: 'A simple cloth hood.' },
  { baseId: 'leather_cap', name: 'Leather Cap', itemSlot: 'head', classes: LIGHT_CLASSES, baseBonuses: { armorRating: 7, agility: 1 } },
  { baseId: 'wizard_hat', name: 'Wizard Hat', itemSlot: 'head', classes: ['wizard', 'warlock'], baseBonuses: { will: 1, knowledge: 1, magicDamageBonus: 2 } },
  { baseId: 'bard_cap', name: 'Bard Cap', itemSlot: 'head', classes: ['bard'], baseBonuses: { knowledge: 1, resourcefulness: 1 } },
  { baseId: 'druid_circlet', name: "Druid's Circlet", itemSlot: 'head', classes: ['druid'], baseBonuses: { will: 1, knowledge: 1 } },
  { baseId: 'kettle_helm', name: 'Kettle Helm', itemSlot: 'head', classes: ['fighter', 'cleric'], baseBonuses: { armorRating: 10, strength: 1 } },
  { baseId: 'barbuta_helm', name: 'Barbuta Helm', itemSlot: 'head', classes: PLATE_CLASSES, baseBonuses: { armorRating: 12, vigor: 1 } },
  { baseId: 'plate_helmet', name: 'Plate Helmet', itemSlot: 'head', classes: PLATE_CLASSES, baseBonuses: { armorRating: 15, strength: 1, vigor: 1 } },
  { baseId: 'horned_helmet', name: 'Horned Helmet', itemSlot: 'head', classes: ['barbarian'], baseBonuses: { armorRating: 11, strength: 2 } },
  { baseId: 'ranger_hood', name: 'Ranger Hood', itemSlot: 'head', classes: ['ranger', 'rogue'], baseBonuses: { armorRating: 6, agility: 1, resourcefulness: 1 } },

  // CHEST
  { baseId: 'tunic', name: 'Tunic', itemSlot: 'chest', classes: ALL, baseBonuses: { armorRating: 6 } },
  { baseId: 'leather_armor', name: 'Leather Armor', itemSlot: 'chest', classes: LIGHT_CLASSES, baseBonuses: { armorRating: 14, agility: 1 } },
  { baseId: 'studded_leather', name: 'Studded Leather', itemSlot: 'chest', classes: LIGHT_CLASSES, baseBonuses: { armorRating: 18, agility: 1, strength: 1 } },
  { baseId: 'wizard_robe', name: 'Wizard Robe', itemSlot: 'chest', classes: ['wizard', 'warlock'], baseBonuses: { armorRating: 7, will: 1, knowledge: 2, magicDamageBonus: 2 } },
  { baseId: 'druid_robe', name: 'Druid Robe', itemSlot: 'chest', classes: ['druid'], baseBonuses: { armorRating: 8, will: 1, knowledge: 1 } },
  { baseId: 'bard_doublet', name: 'Bard Doublet', itemSlot: 'chest', classes: ['bard'], baseBonuses: { armorRating: 10, resourcefulness: 2 } },
  { baseId: 'chainmail', name: 'Chainmail', itemSlot: 'chest', classes: ['fighter', 'cleric', 'ranger'], baseBonuses: { armorRating: 24, vigor: 1 } },
  { baseId: 'plate_chest', name: 'Plate Cuirass', itemSlot: 'chest', classes: PLATE_CLASSES, baseBonuses: { armorRating: 32, strength: 1, vigor: 2 } },
  { baseId: 'barbarian_furs', name: 'Barbarian Furs', itemSlot: 'chest', classes: ['barbarian'], baseBonuses: { armorRating: 16, strength: 2, vigor: 1 } },

  // LEGS
  { baseId: 'trousers', name: 'Trousers', itemSlot: 'legs', classes: ALL, baseBonuses: { armorRating: 4 } },
  { baseId: 'leather_pants', name: 'Leather Pants', itemSlot: 'legs', classes: LIGHT_CLASSES, baseBonuses: { armorRating: 8, agility: 1 } },
  { baseId: 'wizard_pants', name: 'Wizard Pants', itemSlot: 'legs', classes: ['wizard', 'warlock', 'druid'], baseBonuses: { armorRating: 5, knowledge: 1 } },
  { baseId: 'chain_pants', name: 'Chain Pants', itemSlot: 'legs', classes: ['fighter', 'cleric', 'ranger'], baseBonuses: { armorRating: 12, vigor: 1 } },
  { baseId: 'plate_legs', name: 'Plate Greaves', itemSlot: 'legs', classes: PLATE_CLASSES, baseBonuses: { armorRating: 18, strength: 1 } },

  // FEET
  { baseId: 'sandals', name: 'Sandals', itemSlot: 'feet', classes: ALL, baseBonuses: { armorRating: 2, moveSpeed: 2 } },
  { baseId: 'leather_boots', name: 'Leather Boots', itemSlot: 'feet', classes: ALL, baseBonuses: { armorRating: 6, agility: 1 } },
  { baseId: 'rogue_boots', name: 'Rogue Boots', itemSlot: 'feet', classes: ['rogue', 'ranger'], baseBonuses: { armorRating: 5, agility: 1, moveSpeed: 4 } },
  { baseId: 'plate_boots', name: 'Plate Boots', itemSlot: 'feet', classes: PLATE_CLASSES, baseBonuses: { armorRating: 12 } },

  // HANDS
  { baseId: 'cloth_gloves', name: 'Cloth Gloves', itemSlot: 'hands', classes: ALL, baseBonuses: { armorRating: 2 } },
  { baseId: 'leather_gloves', name: 'Leather Gloves', itemSlot: 'hands', classes: ALL, baseBonuses: { armorRating: 4, agility: 1 } },
  { baseId: 'mail_gauntlets', name: 'Mail Gauntlets', itemSlot: 'hands', classes: ['fighter', 'cleric', 'ranger'], baseBonuses: { armorRating: 8 } },
  { baseId: 'plate_gauntlets', name: 'Plate Gauntlets', itemSlot: 'hands', classes: PLATE_CLASSES, baseBonuses: { armorRating: 11, strength: 1 } },

  // BACK
  { baseId: 'cloak', name: 'Cloak', itemSlot: 'back', classes: ALL, baseBonuses: { armorRating: 2 } },
  { baseId: 'cape', name: 'Cape', itemSlot: 'back', classes: ALL, baseBonuses: { armorRating: 3, magicResistRating: 2 } },
  { baseId: 'rogue_cloak', name: 'Rogue Cloak', itemSlot: 'back', classes: ['rogue'], baseBonuses: { armorRating: 3, agility: 2 } },

  // NECKLACE
  { baseId: 'old_necklace', name: 'Old Necklace', itemSlot: 'necklace', classes: ALL, baseBonuses: { will: 1 } },
  { baseId: 'amulet_of_will', name: 'Amulet of Will', itemSlot: 'necklace', classes: ALL, baseBonuses: { will: 2, magicDamageBonus: 1 } },
  { baseId: 'amulet_of_might', name: 'Amulet of Might', itemSlot: 'necklace', classes: ALL, baseBonuses: { strength: 2 } },
  { baseId: 'amulet_of_wisdom', name: 'Amulet of Wisdom', itemSlot: 'necklace', classes: ALL, baseBonuses: { knowledge: 2 } },
  { baseId: 'amulet_of_swiftness', name: 'Amulet of Swiftness', itemSlot: 'necklace', classes: ALL, baseBonuses: { agility: 2 } },

  // RINGS
  { baseId: 'ring_iron', name: 'Iron Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { strength: 1 } },
  { baseId: 'ring_silver', name: 'Silver Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { will: 1, knowledge: 1 } },
  { baseId: 'ring_gold', name: 'Gold Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { resourcefulness: 2 } },
  { baseId: 'ring_ruby', name: 'Ruby Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { strength: 1, vigor: 1, maxHp: 4 } },
  { baseId: 'ring_sapphire', name: 'Sapphire Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { will: 2, magicDamageBonus: 1 } },

  // PRIMARY WEAPONS
  { baseId: 'longsword', name: 'Longsword', itemSlot: 'primary', classes: ['fighter', 'cleric', 'bard'], baseBonuses: { weaponDamage: 26, additionalPhysicalDamage: 1, strength: 1 } },
  { baseId: 'arming_sword', name: 'Arming Sword', itemSlot: 'primary', classes: ['fighter', 'cleric', 'ranger', 'bard'], baseBonuses: { weaponDamage: 22, additionalPhysicalDamage: 1 } },
  { baseId: 'rapier', name: 'Rapier', itemSlot: 'primary', classes: ['fighter', 'rogue', 'bard'], baseBonuses: { weaponDamage: 20, agility: 1 } },
  { baseId: 'falchion', name: 'Falchion', itemSlot: 'primary', classes: ['fighter', 'ranger'], baseBonuses: { weaponDamage: 25, additionalPhysicalDamage: 1 } },
  { baseId: 'zweihander', name: 'Zweihander', itemSlot: 'primary', classes: ['fighter', 'barbarian'], baseBonuses: { weaponDamage: 38, strength: 1, additionalPhysicalDamage: 2 } },
  { baseId: 'felling_axe', name: 'Felling Axe', itemSlot: 'primary', classes: ['barbarian', 'fighter'], baseBonuses: { weaponDamage: 33, strength: 1 } },
  { baseId: 'francisca_axe', name: 'Francisca Axe', itemSlot: 'primary', classes: ['barbarian', 'fighter'], baseBonuses: { weaponDamage: 18, strength: 1, additionalPhysicalDamage: 1 } },
  { baseId: 'war_maul', name: 'War Maul', itemSlot: 'primary', classes: ['barbarian'], baseBonuses: { weaponDamage: 42, strength: 2, actionSpeed: -5 } },
  { baseId: 'morning_star', name: 'Morning Star', itemSlot: 'primary', classes: ['cleric', 'fighter'], baseBonuses: { weaponDamage: 27, strength: 1 } },
  { baseId: 'mace', name: 'Mace', itemSlot: 'primary', classes: ['cleric', 'fighter'], baseBonuses: { weaponDamage: 24, strength: 1 } },
  { baseId: 'dagger', name: 'Dagger', itemSlot: 'primary', classes: ['rogue', 'wizard', 'warlock', 'bard'], baseBonuses: { weaponDamage: 14, agility: 1, actionSpeed: 4 } },
  { baseId: 'rondel_dagger', name: 'Rondel Dagger', itemSlot: 'primary', classes: ['rogue'], baseBonuses: { weaponDamage: 16, agility: 2 } },
  { baseId: 'stiletto', name: 'Stiletto', itemSlot: 'primary', classes: ['rogue'], baseBonuses: { weaponDamage: 12, agility: 2, additionalPhysicalDamage: 1 } },
  { baseId: 'recurve_bow', name: 'Recurve Bow', itemSlot: 'primary', classes: ['ranger', 'rogue'], baseBonuses: { weaponDamage: 30, agility: 1 } },
  { baseId: 'longbow', name: 'Longbow', itemSlot: 'primary', classes: ['ranger'], baseBonuses: { weaponDamage: 36, strength: 1 } },
  { baseId: 'crossbow', name: 'Crossbow', itemSlot: 'primary', classes: ['ranger', 'fighter'], baseBonuses: { weaponDamage: 40, actionSpeed: -8 } },
  { baseId: 'arming_staff', name: 'Arming Staff', itemSlot: 'primary', classes: ['wizard', 'cleric', 'warlock', 'druid'], baseBonuses: { weaponDamage: 15, will: 1, knowledge: 1 } },
  { baseId: 'crystal_staff', name: 'Crystal Staff', itemSlot: 'primary', classes: ['wizard', 'warlock'], baseBonuses: { weaponDamage: 18, knowledge: 2, magicDamageBonus: 3 } },
  { baseId: 'spellbook', name: 'Spellbook', itemSlot: 'primary', classes: ['wizard', 'warlock'], baseBonuses: { knowledge: 2, will: 1, magicDamageBonus: 4 } },
  { baseId: 'lute', name: 'Lute', itemSlot: 'primary', classes: ['bard'], baseBonuses: { resourcefulness: 2, buffDuration: 3 } },
  { baseId: 'rondel_druid', name: 'Druid Sickle', itemSlot: 'primary', classes: ['druid'], baseBonuses: { weaponDamage: 16, will: 1, knowledge: 1 } },

  // SECONDARY (off-hand)
  { baseId: 'buckler', name: 'Buckler', itemSlot: 'secondary', classes: ['fighter', 'cleric', 'bard', 'rogue'], baseBonuses: { armorRating: 8, knockbackResistance: 5 } },
  { baseId: 'roundshield', name: 'Round Shield', itemSlot: 'secondary', classes: ['fighter', 'cleric', 'barbarian'], baseBonuses: { armorRating: 16, knockbackResistance: 10 } },
  { baseId: 'kite_shield', name: 'Kite Shield', itemSlot: 'secondary', classes: ['fighter', 'cleric'], baseBonuses: { armorRating: 22, vigor: 1 } },
  { baseId: 'pavise_shield', name: 'Pavise Shield', itemSlot: 'secondary', classes: ['fighter'], baseBonuses: { armorRating: 28, projectileDamageReduction: 15, actionSpeed: -5 } },
  { baseId: 'torch_off', name: 'Torch', itemSlot: 'secondary', classes: ALL, baseBonuses: {} },
  { baseId: 'lantern_off', name: 'Lantern', itemSlot: 'secondary', classes: ALL, baseBonuses: {} },
  { baseId: 'spellbook_off', name: 'Spellbook (Off)', itemSlot: 'secondary', classes: ['wizard', 'warlock', 'cleric', 'druid'], baseBonuses: { knowledge: 1, magicDamageBonus: 2 } },
  { baseId: 'dagger_off', name: 'Off-hand Dagger', itemSlot: 'secondary', classes: ['rogue'], baseBonuses: { weaponDamage: 10, agility: 1 } },

  // UTILITY
  { baseId: 'bandage', name: 'Bandage', itemSlot: 'utility', classes: ALL, baseBonuses: {} },
  { baseId: 'health_potion', name: 'Health Potion', itemSlot: 'utility', classes: ALL, baseBonuses: { hpRegen: 1 } },
  { baseId: 'campfire', name: 'Campfire', itemSlot: 'utility', classes: ALL, baseBonuses: {} },
  { baseId: 'lockpick', name: 'Lockpick', itemSlot: 'utility', classes: ALL, baseBonuses: { interactionSpeed: 3 } },
  { baseId: 'horn', name: 'Horn of Vigor', itemSlot: 'utility', classes: ['fighter', 'cleric', 'bard', 'barbarian'], baseBonuses: { maxHp: 5 } },
  { baseId: 'whetstone', name: 'Whetstone', itemSlot: 'utility', classes: ALL, baseBonuses: { additionalPhysicalDamage: 1 } },
  { baseId: 'oil_flask', name: 'Oil Flask', itemSlot: 'utility', classes: ALL, baseBonuses: {} },
];

// Generate full catalog
function buildCatalog(): Record<string, ItemInstance> {
  const out: Record<string, ItemInstance> = {};
  for (const b of BASE_ITEMS) {
    for (const inst of ladder(b)) {
      out[inst.id] = inst;
    }
  }
  return out;
}

export const ITEM_DB: Record<string, ItemInstance> = buildCatalog();

// Query items applicable to a slot+class.
export function findItemsForSlot(
  itemSlot: SlotDef['itemSlot'],
  classId: ClassId,
): ItemInstance[] {
  return Object.values(ITEM_DB).filter(it => {
    if (it.itemSlot !== itemSlot) return false;
    if (it.classes === 'all') return true;
    return it.classes.includes(classId);
  });
}
