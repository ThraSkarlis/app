// Dark and Darker item catalog. Armor pieces have EXACT per-rarity stats from
// https://darkanddarker.wiki.spellsandguns.com/Armors (Patch 6.11) for Head, Hands, Feet, Back.
// Chest/Legs/Weapons/Utilities still use scaled approximations and are marked TODO.
// Rarity ladder order: poor, common, uncommon, rare, epic, legendary, unique.

import { ItemStatBonus } from './statFormulas';
import { ClassId } from './classes';
import { Rarity, rarityOrder } from '../theme';

export type SlotId =
  | 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'back'
  | 'necklace' | 'ring1' | 'ring2'
  | 'primary' | 'secondary'
  | 'utility1' | 'utility2' | 'utility3';

export interface SlotDef {
  id: SlotId;
  label: string;
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
const PLATE_LIGHT: ClassId[] = ['fighter', 'cleric'];

// --- Per-rarity ladder helper ---
// Provide 7 values in rarity order (poor..unique). Ranges like "24~25" use midpoint.
interface LadderInput {
  baseId: string;
  name: string;
  itemSlot: SlotDef['itemSlot'];
  classes: ClassId[] | 'all';
  movementSpeed?: number; // wiki "Movement Speed" penalty (negative) or bonus
  // Per-rarity values (7 entries, poor..unique). Use 0 if not applicable.
  armorRating: number[];
  magicResistRating?: number | number[]; // single value or per-rarity
  attrs?: Partial<Record<keyof ItemStatBonus, number[]>>; // e.g. { strength: [1,2,2,3,4,5,5] }
  others?: Partial<ItemStatBonus>; // flat stats that apply at all rarities
  // Per-rarity extras (e.g., projectile damage reduction increases with rarity)
  rarityExtras?: Partial<Record<keyof ItemStatBonus, number[]>>;
}

function buildLadder(b: LadderInput): ItemInstance[] {
  return rarityOrder.map((r, idx) => {
    const bonuses: ItemStatBonus = { ...b.others };
    bonuses.armorRating = b.armorRating[idx] || 0;
    if (b.magicResistRating !== undefined) {
      bonuses.magicResistRating = Array.isArray(b.magicResistRating)
        ? b.magicResistRating[idx]
        : b.magicResistRating;
    }
    if (b.movementSpeed) bonuses.moveSpeed = b.movementSpeed;
    if (b.attrs) {
      for (const [k, arr] of Object.entries(b.attrs)) {
        if (arr && arr[idx]) bonuses[k as keyof ItemStatBonus] = arr[idx];
      }
    }
    if (b.rarityExtras) {
      for (const [k, arr] of Object.entries(b.rarityExtras)) {
        if (arr && arr[idx]) bonuses[k as keyof ItemStatBonus] = arr[idx];
      }
    }
    return {
      id: `${b.baseId}_${r}`,
      name: b.name,
      itemSlot: b.itemSlot,
      classes: b.classes,
      rarity: r,
      bonuses,
    };
  });
}

// ============ HEAD (wiki-verified, https://.../Armors#Head) ============
const HEADS: LadderInput[] = [
  { baseId: 'arcane_hood', name: 'Arcane Hood', itemSlot: 'head', classes: ['wizard', 'warlock', 'druid'], movementSpeed: -2, armorRating: [21,22,23,24,26,28,29], attrs: { will: [1,2,2,3,4,5,5] } },
  { baseId: 'armet', name: 'Armet', itemSlot: 'head', classes: ['fighter'], movementSpeed: -5, armorRating: [54,55,56,58,60,62,63], attrs: { strength: [1,2,2,3,4,5,5] } },
  { baseId: 'barbuta_helm', name: 'Barbuta Helm', itemSlot: 'head', classes: ['fighter', 'barbarian'], movementSpeed: -4, armorRating: [26,27,28,30,32,34,35], magicResistRating: 30, attrs: { dexterity: [1,2,2,3,4,5,5] } },
  { baseId: 'bycocket', name: 'Bycocket', itemSlot: 'head', classes: ['ranger'], movementSpeed: -2, armorRating: [24,25,26,27,28,29,30], attrs: { dexterity: [1,1,1,2,2,3,3] } },
  { baseId: 'ceremonial_headdress', name: 'Ceremonial Headdress', itemSlot: 'head', classes: ['cleric'], movementSpeed: -2, armorRating: [21,22,23,24,26,28,29], magicResistRating: 20, attrs: { resourcefulness: [1,2,2,3,4,5,5] } },
  { baseId: 'chapel_de_fer', name: 'Chapel De Fer', itemSlot: 'head', classes: ['fighter', 'cleric'], movementSpeed: -3, armorRating: [39,40,41,43,45,47,48], magicResistRating: 10, attrs: { agility: [1,2,2,3,4,5,5] } },
  { baseId: 'chaperon', name: 'Chaperon', itemSlot: 'head', classes: ['cleric'], movementSpeed: -2, armorRating: [23,24,25,26,28,30,31], magicResistRating: 20, attrs: { will: [1,2,2,3,4,5,5] } },
  { baseId: 'coif', name: 'Coif', itemSlot: 'head', classes: ['wizard', 'cleric', 'druid'], movementSpeed: -1, armorRating: [17,18,19,20,22,24,25], attrs: { knowledge: [1,2,2,3,4,5,5] } },
  { baseId: 'crusader_helm', name: 'Crusader Helm', itemSlot: 'head', classes: ['fighter', 'cleric'], movementSpeed: -5, armorRating: [52,53,54,56,58,60,61], attrs: { strength: [1,1,1,2,2,3,3], vigor: [0,1,1,1,2,2,2] } },
  { baseId: 'darkgrove_hood', name: 'Darkgrove Hood', itemSlot: 'head', classes: ['druid'], movementSpeed: -2, armorRating: [24,25,26,27,29,31,32], attrs: { strength: [1,1,1,2,2,3,3], will: [0,1,1,1,2,2,2] } },
  { baseId: 'dryad_mask', name: 'Dryad Mask', itemSlot: 'head', classes: ['warlock', 'druid'], movementSpeed: -2, armorRating: [26,27,28,29,31,33,34], attrs: { strength: [1,1,1,2,2,2,2], knowledge: [1,1,1,1,2,2,2] } },
  { baseId: 'feathered_hat', name: 'Feathered Hat', itemSlot: 'head', classes: ['bard'], movementSpeed: -2, armorRating: [28,29,30,31,33,35,36], attrs: { knowledge: [1,2,2,3,4,5,5] } },
  { baseId: 'gjermundbu', name: 'Gjermundbu', itemSlot: 'head', classes: ['barbarian'], movementSpeed: -4, armorRating: [41,42,43,45,47,49,50], magicResistRating: 15, attrs: { vigor: [1,2,2,3,4,5,5] } },
  { baseId: 'great_helm', name: 'Great Helm', itemSlot: 'head', classes: ['fighter', 'cleric'], movementSpeed: -5, armorRating: [55,56,57,59,61,63,64], attrs: { knowledge: [1,2,2,3,4,5,5] } },
  { baseId: 'hounskull', name: 'Hounskull', itemSlot: 'head', classes: ['fighter', 'cleric'], movementSpeed: -5, armorRating: [58,59,60,62,64,66,67], magicResistRating: -5, attrs: { vigor: [1,2,2,3,4,5,5] } },
  { baseId: 'jester_cap', name: 'Jester Cap', itemSlot: 'head', classes: ['rogue', 'bard'], movementSpeed: -2, armorRating: [24,25,26,27,28,29,30], attrs: { dexterity: [1,1,1,2,2,3,3] } },
  { baseId: 'kettle_hat', name: 'Kettle Hat', itemSlot: 'head', classes: ['fighter', 'cleric'], movementSpeed: -3, armorRating: [36,37,38,40,42,44,45], magicResistRating: 10, attrs: { knowledge: [1,2,2,3,4,5,5] } },
  { baseId: 'leather_bonnet', name: 'Leather Bonnet', itemSlot: 'head', classes: ['bard'], movementSpeed: -2, armorRating: [29,30,31,32,34,36,37], attrs: { resourcefulness: [1,2,2,3,4,5,5] } },
  { baseId: 'leather_cap', name: 'Leather Cap', itemSlot: 'head', classes: ALL, movementSpeed: -3, armorRating: [31,32,33,35,37,39,40], attrs: { vigor: [1,2,2,3,4,5,5] } },
  { baseId: 'mitre', name: 'Mitre', itemSlot: 'head', classes: ['cleric'], movementSpeed: -2, armorRating: [28,29,30,31,32,33,34], attrs: { will: [1,1,1,2,2,3,3] } },
  { baseId: 'occultist_hood', name: 'Occultist Hood', itemSlot: 'head', classes: ['warlock'], movementSpeed: -2, armorRating: [25,26,27,28,30,32,33], rarityExtras: { magicalPower: [0,1,1,1,2,2,2] } },
  { baseId: 'open_sallet', name: 'Open Sallet', itemSlot: 'head', classes: ['fighter', 'ranger', 'cleric', 'bard'], movementSpeed: -3, armorRating: [35,36,37,39,41,43,44], attrs: { will: [1,1,1,2,2,2,2], knowledge: [1,1,1,1,2,2,2] } },
  { baseId: 'ranger_hood', name: 'Ranger Hood', itemSlot: 'head', classes: ['ranger'], movementSpeed: -2, armorRating: [25,26,27,28,30,32,33], attrs: { agility: [1,2,2,3,4,5,5] } },
  { baseId: 'rogue_cowl', name: 'Rogue Cowl', itemSlot: 'head', classes: ['rogue'], movementSpeed: -2, armorRating: [25,26,27,28,30,32,33], attrs: { agility: [1,2,2,3,4,5,5] } },
  { baseId: 'sallet', name: 'Sallet', itemSlot: 'head', classes: ['fighter', 'cleric'], movementSpeed: -3, armorRating: [33,34,35,37,39,41,42], attrs: { strength: [1,1,1,2,2,3,3], vigor: [0,1,1,1,2,2,2] } },
  { baseId: 'shadow_hood', name: 'Shadow Hood', itemSlot: 'head', classes: ['rogue', 'warlock'], movementSpeed: -2, armorRating: [18,19,20,21,23,25,26], magicResistRating: 15, attrs: { strength: [1,2,2,3,4,5,5] } },
  { baseId: 'spangenhelm', name: 'Spangenhelm', itemSlot: 'head', classes: ['fighter', 'ranger', 'cleric'], movementSpeed: -4, armorRating: [40,41,42,44,46,48,49], attrs: { agility: [1,1,1,2,2,3,3], dexterity: [0,1,1,1,2,2,2] } },
  { baseId: 'topfhelm', name: 'Topfhelm', itemSlot: 'head', classes: ['fighter', 'cleric'], movementSpeed: -5, armorRating: [57,58,59,61,63,65,66], attrs: { vigor: [1,1,1,2,2,3,3], will: [0,1,1,1,2,2,2] } },
  { baseId: 'trapper_hat', name: 'Trapper Hat', itemSlot: 'head', classes: ['ranger', 'barbarian'], movementSpeed: -3, armorRating: [33,34,35,36,37,38,39], attrs: { strength: [1,1,1,2,2,3,3] } },
  { baseId: 'viking_helm', name: 'Viking Helm', itemSlot: 'head', classes: ['barbarian'], movementSpeed: -3, armorRating: [37,38,39,41,43,45,46], attrs: { agility: [1,2,2,3,4,5,5] } },
  { baseId: 'visored_barbuta_helm', name: 'Visored Barbuta Helm', itemSlot: 'head', classes: ['fighter'], movementSpeed: -4, armorRating: [48,49,50,52,54,56,57], attrs: { will: [1,2,2,3,4,5,5] } },
  { baseId: 'visored_sallet', name: 'Visored Sallet', itemSlot: 'head', classes: ['barbarian'], movementSpeed: -5, armorRating: [50,51,52,54,56,58,59], attrs: { agility: [1,1,1,2,2,3,3], dexterity: [0,1,1,1,2,2,2] } },
  { baseId: 'wizard_hat', name: 'Wizard Hat', itemSlot: 'head', classes: ['wizard', 'warlock'], movementSpeed: -2, armorRating: [20,21,22,23,25,27,28], others: { memoryCapacity: 3 }, rarityExtras: { magicalPower: [1,2,2,3,4,5,5] } },
  { baseId: 'woolen_cap', name: 'Woolen Cap', itemSlot: 'head', classes: ALL, movementSpeed: -2, armorRating: [20,21,22,23,24,25,26], attrs: { vigor: [1,1,1,2,2,2,2], dexterity: [1,1,1,1,2,2,2] } },
];

// ============ HANDS (wiki-verified) ============
const HANDS: LadderInput[] = [
  { baseId: 'arcane_gloves', name: 'Arcane Gloves', itemSlot: 'hands', classes: ['wizard', 'cleric'], armorRating: [7,8,9,10,11,12,13], attrs: { will: [1,2,2,3,4,5,5] } },
  { baseId: 'bloodwoven_gloves', name: 'Bloodwoven Gloves', itemSlot: 'hands', classes: ['bard', 'warlock', 'druid'], armorRating: [14,15,16,17,18,19,20], attrs: { resourcefulness: [1,1,1,2,2,3,3] } },
  { baseId: 'darkleaf_gloves', name: 'Darkleaf Gloves', itemSlot: 'hands', classes: ['druid'], armorRating: [13,14,15,16,17,18,19], attrs: { will: [1,1,1,2,2,3,3] } },
  { baseId: 'elkwood_gloves', name: 'Elkwood Gloves', itemSlot: 'hands', classes: ['druid', 'ranger'], armorRating: [11,12,13,14,15,16,17], attrs: { dexterity: [1,1,1,2,2,3,3] } },
  { baseId: 'gloves_utility', name: 'Gloves of Utility', itemSlot: 'hands', classes: ALL, armorRating: [9,10,11,12,13,14,15], attrs: { resourcefulness: [1,1,1,2,2,3,3] } },
  { baseId: 'heavy_gauntlets', name: 'Heavy Gauntlets', itemSlot: 'hands', classes: PLATE_LIGHT, movementSpeed: -1, armorRating: [37,38,39,41,43,45,46], magicResistRating: -5, attrs: { strength: [1,2,2,3,4,5,5] }, rarityExtras: { projectileDamageReduction: [0.3,0.6,0.9,1.2,1.5,1.8,2.1] } },
  { baseId: 'leather_gloves', name: 'Leather Gloves', itemSlot: 'hands', classes: ALL, armorRating: [13,14,15,16,17,18,19], attrs: { strength: [1,2,2,3,4,5,5] } },
  { baseId: 'light_gauntlets', name: 'Light Gauntlets', itemSlot: 'hands', classes: PLATE_LIGHT, armorRating: [33,34,35,37,39,41,42], magicResistRating: -5, attrs: { agility: [1,1,1,2,2,3,3] }, rarityExtras: { projectileDamageReduction: [0.3,0.6,0.7,0.9,1.1,1.3,1.5] } },
  { baseId: 'onyx_gloves', name: 'Onyx Gloves', itemSlot: 'hands', classes: ['fighter', 'barbarian', 'rogue', 'ranger'], armorRating: [12,13,14,15,16,17,18], attrs: { strength: [1,1,1,2,2,2,2] } },
  { baseId: 'rawhide_gloves', name: 'Rawhide Gloves', itemSlot: 'hands', classes: ALL, armorRating: [14,15,16,17,18,19,20], attrs: { will: [1,1,1,2,2,3,3], knowledge: [0,1,1,1,2,2,2] } },
  { baseId: 'reinforced_gloves', name: 'Reinforced Gloves', itemSlot: 'hands', classes: ['fighter', 'cleric', 'bard'], armorRating: [18,19,20,21,22,23,24], attrs: { dexterity: [1,2,2,3,4,5,5] } },
  { baseId: 'riveted_gloves', name: 'Riveted Gloves', itemSlot: 'hands', classes: ['fighter', 'barbarian'], armorRating: [16,17,18,19,20,21,22], attrs: { strength: [1,2,2,3,4,5,5] } },
];

// ============ FEET (wiki-verified) ============
const FEET: LadderInput[] = [
  { baseId: 'adventurer_boots', name: 'Adventurer Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 6, armorRating: [23,24,25,26,28,30,31], attrs: { dexterity: [1,2,2,3,4,5,5] } },
  { baseId: 'buckled_boots', name: 'Buckled Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 5, armorRating: [31,32,33,34,36,38,39], rarityExtras: { maxHp: [2,3,3,4,5,6,6] } },
  { baseId: 'buttoned_boots', name: 'Buttoned Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 6, armorRating: [24,25,26,27,29,31,32], attrs: { will: [0,1,1,1,2,2,2], resourcefulness: [1,1,1,2,2,3,3] } },
  { baseId: 'cuffed_boots', name: 'Cuffed Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 7, armorRating: [18,19,20,21,23,25,26], attrs: { knowledge: [0,1,1,1,2,2,2], resourcefulness: [1,1,1,2,2,3,3] } },
  { baseId: 'darkleaf_boots', name: 'Darkleaf Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 6, armorRating: [23,24,25,26,28,30,31], attrs: { strength: [1,1,1,2,2,3,3], will: [0,1,1,1,2,2,2] } },
  { baseId: 'dashing_boots', name: 'Dashing Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 6, armorRating: [26,27,28,29,31,33,34], magicResistRating: [11,13,15,18,20,22,24], attrs: { agility: [1,1,2,2,2,3,3] } },
  { baseId: 'forest_boots', name: 'Forest Boots', itemSlot: 'feet', classes: ['druid', 'ranger'], movementSpeed: 7, armorRating: [22,23,24,25,27,29,30], attrs: { agility: [1,1,1,2,2,3,3], resourcefulness: [0,1,1,1,2,2,2] } },
  { baseId: 'heavy_boots', name: 'Heavy Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 5, armorRating: [33,34,35,36,38,40,41], attrs: { strength: [1,2,2,3,4,5,5] } },
  { baseId: 'jester_poulaines', name: 'Jester Poulaines', itemSlot: 'feet', classes: ['rogue', 'bard'], movementSpeed: 6, armorRating: [16,17,18,19,20,21,22], attrs: { agility: [1,1,1,1,2,3,3] } },
  { baseId: 'laced_turnshoe', name: 'Laced Turnshoe', itemSlot: 'feet', classes: ALL, movementSpeed: 7, armorRating: [14,15,16,17,18,19,20], attrs: { agility: [1,2,2,3,4,5,5] } },
  { baseId: 'lightfoot_boots', name: 'Lightfoot Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 8, armorRating: [3,3,3,3,3,3,3], rarityExtras: {} },
  { baseId: 'low_boots', name: 'Low Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 7, armorRating: [21,22,23,24,26,28,29], attrs: { knowledge: [1,2,2,3,4,5,5] } },
  { baseId: 'occultist_boots', name: 'Occultist Boots', itemSlot: 'feet', classes: ['warlock', 'wizard'], movementSpeed: 6, armorRating: [25,26,27,28,30,32,33], attrs: { will: [1,1,1,2,2,3,3], knowledge: [0,1,1,1,2,2,2] } },
  { baseId: 'old_shoes', name: 'Old Shoes', itemSlot: 'feet', classes: ALL, movementSpeed: 7, armorRating: [16,17,18,19,21,23,24], attrs: { resourcefulness: [1,2,2,3,4,5,5] } },
  { baseId: 'pigache', name: 'Pigache', itemSlot: 'feet', classes: ALL, movementSpeed: 6, armorRating: [12,13,14,15,16,17,18], attrs: { agility: [1,1,1,2,2,3,3], strength: [0,1,1,1,2,2,2] } },
  { baseId: 'plate_boots', name: 'Plate Boots', itemSlot: 'feet', classes: PLATE_LIGHT, movementSpeed: 4, armorRating: [49,50,51,52,54,56,57], magicResistRating: -5, attrs: { vigor: [1,2,2,3,4,5,5] }, rarityExtras: { projectileDamageReduction: [1.8,2,2.3,2.5,2.8,3,3] } },
  { baseId: 'rugged_boots', name: 'Rugged Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 6, armorRating: [25,26,27,28,30,32,33], attrs: { vigor: [1,2,2,3,4,5,5] } },
  { baseId: 'stitched_turnshoe', name: 'Stitched Turnshoe', itemSlot: 'feet', classes: ALL, movementSpeed: 7, armorRating: [19,20,21,22,24,26,27], attrs: { will: [1,2,2,3,4,5,5] } },
  { baseId: 'sturdy_boots', name: 'Sturdy Boots', itemSlot: 'feet', classes: ALL, movementSpeed: 6, armorRating: [24,25,26,27,29,31,32], attrs: { dexterity: [1,1,1,2,2,3,3], vigor: [0,1,1,1,2,2,2] } },
  { baseId: 'turnshoe', name: 'Turnshoe', itemSlot: 'feet', classes: ALL, movementSpeed: 7, armorRating: [15,16,17,18,19,20,21], attrs: { agility: [0,1,1,1,2,2,2], dexterity: [1,1,1,2,2,3,3] } },
  { baseId: 'wizard_shoes', name: 'Wizard Shoes', itemSlot: 'feet', classes: ['wizard', 'warlock', 'druid'], movementSpeed: 8, armorRating: [12,13,14,15,16,17,18], rarityExtras: { magicalPower: [1,2,2,3,4,5,5] } },
];

// ============ BACK (wiki-verified) ============
const BACKS: LadderInput[] = [
  { baseId: 'adventurer_cloak', name: 'Adventurer Cloak', itemSlot: 'back', classes: ALL, armorRating: [6,7,8,9,10,11,12], attrs: { agility: [1,1,1,2,3,4,5] } },
  { baseId: 'mercurial_cloak', name: 'Mercurial Cloak', itemSlot: 'back', classes: ALL, armorRating: [6,7,8,9,10,11,12], attrs: { dexterity: [1,1,1,2,3,4,5] } },
  { baseId: 'radiant_cloak', name: 'Radiant Cloak', itemSlot: 'back', classes: ALL, armorRating: [9,10,11,12,13,14,15], attrs: { knowledge: [1,1,1,2,3,4,5] } },
  { baseId: 'splendid_cloak', name: 'Splendid Cloak', itemSlot: 'back', classes: ALL, armorRating: [9,10,11,12,13,14,15], attrs: { will: [1,1,1,2,3,4,5] } },
  { baseId: 'tattered_cloak', name: 'Tattered Cloak', itemSlot: 'back', classes: ALL, armorRating: [4,5,6,7,8,9,10], attrs: { strength: [1,1,1,2,3,4,5] } },
  { baseId: 'vigilant_cloak', name: 'Vigilant Cloak', itemSlot: 'back', classes: ALL, armorRating: [4,5,6,7,8,9,10], attrs: { vigor: [1,1,1,2,3,4,5] } },
  { baseId: 'watchman_cloak', name: 'Watchman Cloak', itemSlot: 'back', classes: ALL, armorRating: [15,16,17,18,19,20,21], attrs: { resourcefulness: [1,1,1,2,3,4,5] } },
];

// ============ Approximated until wiki data is wired (chest/legs/weapons/jewelry/utility) ============
const tierMult: Record<Rarity, number> = { poor: 0.7, common: 1, uncommon: 1.2, rare: 1.45, epic: 1.7, legendary: 1.95, unique: 2.2 };
function s(n: number, r: Rarity) { return Math.round(n * tierMult[r]); }

interface SimpleBase {
  baseId: string;
  name: string;
  itemSlot: SlotDef['itemSlot'];
  classes: ClassId[] | 'all';
  baseBonuses: ItemStatBonus;
}
function simpleLadder(b: SimpleBase): ItemInstance[] {
  return rarityOrder.map(r => {
    const scaled: ItemStatBonus = {};
    for (const [k, v] of Object.entries(b.baseBonuses)) {
      if (typeof v !== 'number') continue;
      scaled[k as keyof ItemStatBonus] = s(v, r);
    }
    return { id: `${b.baseId}_${r}`, name: b.name, itemSlot: b.itemSlot, classes: b.classes, rarity: r, bonuses: scaled };
  });
}

const SIMPLE_BASE: SimpleBase[] = [
  // Chests (approx — TODO wire from wiki)
  { baseId: 'tunic', name: 'Tunic', itemSlot: 'chest', classes: ALL, baseBonuses: { armorRating: 16 } },
  { baseId: 'leather_armor', name: 'Leather Armor', itemSlot: 'chest', classes: ['rogue','wizard','warlock','bard','druid','ranger'], baseBonuses: { armorRating: 32, agility: 2 } },
  { baseId: 'wizard_robe', name: 'Wizard Robe', itemSlot: 'chest', classes: ['wizard', 'warlock'], baseBonuses: { armorRating: 20, will: 2, knowledge: 3 } },
  { baseId: 'chainmail', name: 'Chainmail', itemSlot: 'chest', classes: ['fighter', 'cleric', 'ranger'], baseBonuses: { armorRating: 50, vigor: 2 } },
  { baseId: 'plate_chest', name: 'Plate Cuirass', itemSlot: 'chest', classes: ['fighter', 'cleric', 'barbarian'], baseBonuses: { armorRating: 65, strength: 2, vigor: 3 } },
  { baseId: 'barbarian_furs', name: 'Barbarian Furs', itemSlot: 'chest', classes: ['barbarian'], baseBonuses: { armorRating: 40, strength: 3, vigor: 2 } },
  // Legs
  { baseId: 'trousers', name: 'Trousers', itemSlot: 'legs', classes: ALL, baseBonuses: { armorRating: 10 } },
  { baseId: 'leather_pants', name: 'Leather Pants', itemSlot: 'legs', classes: ALL, baseBonuses: { armorRating: 22, agility: 1 } },
  { baseId: 'plate_legs', name: 'Plate Greaves', itemSlot: 'legs', classes: ['fighter', 'cleric', 'barbarian'], baseBonuses: { armorRating: 45, strength: 2 } },
  // Necklaces
  { baseId: 'amulet_of_will', name: 'Amulet of Will', itemSlot: 'necklace', classes: ALL, baseBonuses: { will: 3 } },
  { baseId: 'amulet_of_might', name: 'Amulet of Might', itemSlot: 'necklace', classes: ALL, baseBonuses: { strength: 3 } },
  { baseId: 'amulet_of_wisdom', name: 'Amulet of Wisdom', itemSlot: 'necklace', classes: ALL, baseBonuses: { knowledge: 3 } },
  { baseId: 'amulet_of_swiftness', name: 'Amulet of Swiftness', itemSlot: 'necklace', classes: ALL, baseBonuses: { agility: 2, dexterity: 1 } },
  // Rings
  { baseId: 'ring_iron', name: 'Iron Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { strength: 2 } },
  { baseId: 'ring_silver', name: 'Silver Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { will: 1, knowledge: 1 } },
  { baseId: 'ring_gold', name: 'Gold Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { resourcefulness: 2 } },
  { baseId: 'ring_ruby', name: 'Ruby Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { strength: 1, vigor: 1 } },
  { baseId: 'ring_sapphire', name: 'Sapphire Ring', itemSlot: 'ring', classes: ALL, baseBonuses: { will: 2 } },
  // Weapons (approx)
  { baseId: 'longsword', name: 'Longsword', itemSlot: 'primary', classes: ['fighter', 'cleric', 'bard'], baseBonuses: { weaponDamage: 26, additionalPhysicalDamage: 1 } },
  { baseId: 'arming_sword', name: 'Arming Sword', itemSlot: 'primary', classes: ['fighter', 'cleric', 'ranger', 'bard'], baseBonuses: { weaponDamage: 22 } },
  { baseId: 'rapier', name: 'Rapier', itemSlot: 'primary', classes: ['fighter', 'rogue', 'bard'], baseBonuses: { weaponDamage: 20, agility: 1 } },
  { baseId: 'falchion', name: 'Falchion', itemSlot: 'primary', classes: ['fighter', 'ranger'], baseBonuses: { weaponDamage: 25 } },
  { baseId: 'zweihander', name: 'Zweihander', itemSlot: 'primary', classes: ['fighter', 'barbarian'], baseBonuses: { weaponDamage: 38, strength: 1 } },
  { baseId: 'felling_axe', name: 'Felling Axe', itemSlot: 'primary', classes: ['barbarian', 'fighter'], baseBonuses: { weaponDamage: 33 } },
  { baseId: 'war_maul', name: 'War Maul', itemSlot: 'primary', classes: ['barbarian'], baseBonuses: { weaponDamage: 42, actionSpeed: -5 } },
  { baseId: 'morning_star', name: 'Morning Star', itemSlot: 'primary', classes: ['cleric', 'fighter'], baseBonuses: { weaponDamage: 27 } },
  { baseId: 'mace', name: 'Mace', itemSlot: 'primary', classes: ['cleric', 'fighter'], baseBonuses: { weaponDamage: 24 } },
  { baseId: 'dagger', name: 'Dagger', itemSlot: 'primary', classes: ['rogue', 'wizard', 'warlock', 'bard'], baseBonuses: { weaponDamage: 14, actionSpeed: 4 } },
  { baseId: 'rondel_dagger', name: 'Rondel Dagger', itemSlot: 'primary', classes: ['rogue'], baseBonuses: { weaponDamage: 16 } },
  { baseId: 'recurve_bow', name: 'Recurve Bow', itemSlot: 'primary', classes: ['ranger', 'rogue'], baseBonuses: { weaponDamage: 30 } },
  { baseId: 'longbow', name: 'Longbow', itemSlot: 'primary', classes: ['ranger'], baseBonuses: { weaponDamage: 36 } },
  { baseId: 'crossbow', name: 'Crossbow', itemSlot: 'primary', classes: ['ranger', 'fighter'], baseBonuses: { weaponDamage: 40, actionSpeed: -8 } },
  { baseId: 'arming_staff', name: 'Arming Staff', itemSlot: 'primary', classes: ['wizard', 'cleric', 'warlock', 'druid'], baseBonuses: { weaponDamage: 15, will: 1, knowledge: 1 } },
  { baseId: 'crystal_staff', name: 'Crystal Staff', itemSlot: 'primary', classes: ['wizard', 'warlock'], baseBonuses: { weaponDamage: 18, knowledge: 2 } },
  { baseId: 'spellbook', name: 'Spellbook', itemSlot: 'primary', classes: ['wizard', 'warlock'], baseBonuses: { knowledge: 2, will: 1, magicDamageBonus: 4 } },
  { baseId: 'lute', name: 'Lute', itemSlot: 'primary', classes: ['bard'], baseBonuses: { resourcefulness: 2, buffDuration: 3 } },
  // Secondary
  { baseId: 'buckler', name: 'Buckler', itemSlot: 'secondary', classes: ['fighter', 'cleric', 'bard', 'rogue'], baseBonuses: { armorRating: 8, knockbackResistance: 5 } },
  { baseId: 'roundshield', name: 'Round Shield', itemSlot: 'secondary', classes: ['fighter', 'cleric', 'barbarian'], baseBonuses: { armorRating: 16, knockbackResistance: 10 } },
  { baseId: 'kite_shield', name: 'Kite Shield', itemSlot: 'secondary', classes: ['fighter', 'cleric'], baseBonuses: { armorRating: 22, vigor: 1 } },
  { baseId: 'pavise_shield', name: 'Pavise Shield', itemSlot: 'secondary', classes: ['fighter'], baseBonuses: { armorRating: 28, projectileDamageReduction: 15, actionSpeed: -5 } },
  { baseId: 'spellbook_off', name: 'Spellbook (Off)', itemSlot: 'secondary', classes: ['wizard', 'warlock', 'cleric', 'druid'], baseBonuses: { knowledge: 1, magicDamageBonus: 2 } },
  { baseId: 'dagger_off', name: 'Off-hand Dagger', itemSlot: 'secondary', classes: ['rogue'], baseBonuses: { weaponDamage: 10, agility: 1 } },
  // Utilities
  { baseId: 'bandage', name: 'Bandage', itemSlot: 'utility', classes: ALL, baseBonuses: {} },
  { baseId: 'health_potion', name: 'Health Potion', itemSlot: 'utility', classes: ALL, baseBonuses: {} },
  { baseId: 'campfire', name: 'Campfire', itemSlot: 'utility', classes: ALL, baseBonuses: {} },
  { baseId: 'lockpick', name: 'Lockpick', itemSlot: 'utility', classes: ALL, baseBonuses: { interactionSpeed: 3 } },
  { baseId: 'whetstone', name: 'Whetstone', itemSlot: 'utility', classes: ALL, baseBonuses: { additionalPhysicalDamage: 1 } },
  { baseId: 'oil_flask', name: 'Oil Flask', itemSlot: 'utility', classes: ALL, baseBonuses: {} },
];

// --- Build ITEM_DB ---
function buildCatalog(): Record<string, ItemInstance> {
  const out: Record<string, ItemInstance> = {};
  for (const ladder of [...HEADS, ...HANDS, ...FEET, ...BACKS]) {
    for (const inst of buildLadder(ladder)) out[inst.id] = inst;
  }
  for (const b of SIMPLE_BASE) {
    for (const inst of simpleLadder(b)) out[inst.id] = inst;
  }
  return out;
}

export const ITEM_DB: Record<string, ItemInstance> = buildCatalog();

export function findItemsForSlot(itemSlot: SlotDef['itemSlot'], classId: ClassId): ItemInstance[] {
  return Object.values(ITEM_DB).filter(it => {
    if (it.itemSlot !== itemSlot) return false;
    if (it.classes === 'all') return true;
    return it.classes.includes(classId);
  });
}
