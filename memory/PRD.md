# Dark and Darker Loadout Builder — PRD

## Overview
A mobile (Expo / React Native) loadout builder for the dark-fantasy dungeon-crawler **Dark and Darker**. Players choose a class, pick gear across every slot at every rarity, and watch their derived stats recalculate live.

## Goals
- Capture the in-game grimoire/medieval aesthetic.
- Make stat-impact of every gear choice instantly visible.
- Let players save and revisit multiple named builds locally.

## Features (v1 — shipped)
1. **Class Selection** – All 9 classes (Fighter, Barbarian, Rogue, Ranger, Wizard, Cleric, Warlock, Bard, Druid) with portrait/tagline/description.
2. **Loadout Builder** – Stats panel on the left (35%), equipment grid on the right (65%) with 14 slots: head, necklace, back, chest, hands, legs, feet, two rings, primary/secondary weapon, three utility slots.
3. **Item Picker** – Curated catalog of ~60 base items × 7 rarities, filtered by slot + class. Browse all rarity variants side-by-side with mini stat preview; rarity filter chips.
4. **Live Stats** – Full derived stat math from in-game formulas: STR (+1.5 HP, +1% PDB), AGI (+0.3% MS, +1% AS, +0.2% projectile red.), WIL (+1% MDB, +1 MR, +1% buff dur), KNO (+1 spell mem, +1% magic heal), RES (+1% interaction), VIG (+5 HP, +0.5 regen). Armor and Magic Resist convert to %-reduction via `x / (x+100)` capped at 75%.
5. **Class Switcher** – Switching classes strips items the new class can’t equip (e.g., Wizard cannot wear plate).
6. **Saved Loadouts** – Persist named builds to AsyncStorage; list view shows class emblem, name, slot count, modified date; delete with confirmation; tap to reload into builder.
7. **Rarity System** – Poor/Common/Uncommon/Rare/Epic/Legendary/Unique with exact wiki colors and rarity-tinted borders/glow on equipped slots.

## Stack
- Expo SDK 54, expo-router 6, React Native 0.81.
- AsyncStorage for persistence.
- No backend integrations — fully offline.

## Stat Math (verified against the official wiki)
All formulas implemented exactly per https://darkanddarker.wiki.spellsandguns.com/Stats (Patch 6.11):
- Physical / Magic Power Bonus piecewise curve (-80% at 0 power → 0% at 15 → +50% at 100).
- Move Speed from Agility piecewise (-10 at 0 → 0 at 15 → +43.5 at 100), hard cap 330.
- Magic Resistance Rating from Will piecewise (-20 at 0 → 30 at 15 → 209 at 100).
- Magical Damage Reduction % piecewise from MR Rating (cap 65%).
- Buff Duration, Debuff Duration, Health Recovery Bonus piecewise from Will/Vigor.
- Action Speed = Agility + Dexterity contributions (both piecewise).
- Armor Rating → PDR piecewise (-22% at 0 AR matching naked Fighter, cap 50% or 75% with perk).

Class baseline HP & attributes seeded directly from each class's wiki page (Fighter 125 HP, Wizard 95 HP, etc.); attribute totals always sum to 105.

## Future Work
- Item search by name.
- Loadout sharing via deep link / cloud sync.
- Stat tooltips explaining each formula.
- Skill / perk tree slots.
- Per-rarity item icons.
