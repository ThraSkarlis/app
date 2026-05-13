import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DerivedStats } from '../data/statFormulas';
import { colors, fonts, spacing } from '../theme';

type StatRow = { label: string; value: string | number; muted?: boolean; highlight?: boolean };

function fmt(n: number, suffix = ''): string {
  if (Number.isInteger(n)) return `${n}${suffix}`;
  return `${n.toFixed(1)}${suffix}`;
}

interface Props {
  stats: DerivedStats;
  preview?: DerivedStats | null;
}

export default function StatsPanel({ stats, preview }: Props) {
  const rows: { section: string; items: StatRow[] }[] = [
    {
      section: 'Attributes',
      items: [
        { label: 'Strength', value: stats.strength, highlight: true },
        { label: 'Agility', value: stats.agility, highlight: true },
        { label: 'Will', value: stats.will, highlight: true },
        { label: 'Knowledge', value: stats.knowledge, highlight: true },
        { label: 'Resourcefulness', value: stats.resourcefulness, highlight: true },
        { label: 'Vigor', value: stats.vigor, highlight: true },
      ],
    },
    {
      section: 'Vitality',
      items: [
        { label: 'Max HP', value: stats.maxHp },
        { label: 'HP Regen', value: fmt(stats.hpRegen, '/s') },
        { label: 'Armor Rating', value: stats.armorRating },
        { label: 'Magic Resist', value: stats.magicResist },
        { label: 'Phys. Reduction', value: fmt(stats.armorReduction, '%'), muted: true },
        { label: 'Magic Reduction', value: fmt(stats.magicReduction, '%'), muted: true },
      ],
    },
    {
      section: 'Offense',
      items: [
        { label: 'Phys. Dmg Bonus', value: fmt(stats.physicalDamageBonus, '%') },
        { label: 'Magic Dmg Bonus', value: fmt(stats.magicDamageBonus, '%') },
        { label: '+ Phys. Damage', value: stats.additionalPhysicalDamage },
        { label: '+ Magic Damage', value: stats.additionalMagicDamage },
        { label: 'Weapon Damage', value: stats.weaponDamage },
      ],
    },
    {
      section: 'Mobility',
      items: [
        { label: 'Move Speed', value: stats.moveSpeed },
        { label: 'Action Speed', value: fmt(stats.actionSpeed, '%') },
        { label: 'Projectile Red.', value: fmt(stats.projectileDamageReduction, '%') },
        { label: 'Phys. Dmg Red.', value: fmt(stats.physicalDamageReduction, '%') },
        { label: 'Magic Dmg Red.', value: fmt(stats.magicalDamageReduction, '%') },
      ],
    },
    {
      section: 'Utility',
      items: [
        { label: 'Spell Memory', value: stats.spellMemory },
        { label: 'Magical Healing', value: fmt(stats.magicalHealing, '%') },
        { label: 'Buff Duration', value: fmt(stats.buffDuration, '%') },
        { label: 'Interaction Spd', value: fmt(stats.interactionSpeed, '%') },
        { label: 'Knockback Res.', value: stats.knockbackResistance },
      ],
    },
  ];

  const previewMap: Record<string, number> = preview
    ? {
        Strength: preview.strength,
        Agility: preview.agility,
        Will: preview.will,
        Knowledge: preview.knowledge,
        Resourcefulness: preview.resourcefulness,
        Vigor: preview.vigor,
        'Max HP': preview.maxHp,
        'HP Regen': preview.hpRegen,
        'Armor Rating': preview.armorRating,
        'Magic Resist': preview.magicResist,
        'Phys. Reduction': preview.armorReduction,
        'Magic Reduction': preview.magicReduction,
        'Phys. Dmg Bonus': preview.physicalDamageBonus,
        'Magic Dmg Bonus': preview.magicDamageBonus,
        '+ Phys. Damage': preview.additionalPhysicalDamage,
        '+ Magic Damage': preview.additionalMagicDamage,
        'Weapon Damage': preview.weaponDamage,
        'Move Speed': preview.moveSpeed,
        'Action Speed': preview.actionSpeed,
        'Projectile Red.': preview.projectileDamageReduction,
        'Phys. Dmg Red.': preview.physicalDamageReduction,
        'Magic Dmg Red.': preview.magicalDamageReduction,
        'Spell Memory': preview.spellMemory,
        'Magical Healing': preview.magicalHealing,
        'Buff Duration': preview.buffDuration,
        'Interaction Spd': preview.interactionSpeed,
        'Knockback Res.': preview.knockbackResistance,
      }
    : {};

  const currentMap: Record<string, number> = {
    Strength: stats.strength,
    Agility: stats.agility,
    Will: stats.will,
    Knowledge: stats.knowledge,
    Resourcefulness: stats.resourcefulness,
    Vigor: stats.vigor,
    'Max HP': stats.maxHp,
    'HP Regen': stats.hpRegen,
    'Armor Rating': stats.armorRating,
    'Magic Resist': stats.magicResist,
    'Phys. Reduction': stats.armorReduction,
    'Magic Reduction': stats.magicReduction,
    'Phys. Dmg Bonus': stats.physicalDamageBonus,
    'Magic Dmg Bonus': stats.magicDamageBonus,
    '+ Phys. Damage': stats.additionalPhysicalDamage,
    '+ Magic Damage': stats.additionalMagicDamage,
    'Weapon Damage': stats.weaponDamage,
    'Move Speed': stats.moveSpeed,
    'Action Speed': stats.actionSpeed,
    'Projectile Red.': stats.projectileDamageReduction,
    'Phys. Dmg Red.': stats.physicalDamageReduction,
    'Magic Dmg Red.': stats.magicalDamageReduction,
    'Spell Memory': stats.spellMemory,
    'Magical Healing': stats.magicalHealing,
    'Buff Duration': stats.buffDuration,
    'Interaction Spd': stats.interactionSpeed,
    'Knockback Res.': stats.knockbackResistance,
  };

  return (
    <View style={styles.container} testID="stats-panel">
      <View style={styles.headerBox}>
        <Text style={styles.headerText}>CHARACTER</Text>
        <View style={styles.headerLine} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {rows.map(section => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section.toUpperCase()}</Text>
            {section.items.map(item => {
              const cur = currentMap[item.label];
              const next = previewMap[item.label];
              const diff = preview ? (next ?? 0) - (cur ?? 0) : 0;
              return (
                <View key={item.label} style={styles.row} testID={`stat-row-${item.label}`}>
                  <Text style={[styles.rowLabel, item.muted && styles.rowLabelMuted]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <View style={styles.rowValueWrap}>
                    <Text
                      style={[
                        styles.rowValue,
                        item.highlight && styles.rowValueHi,
                        item.muted && styles.rowValueMuted,
                      ]}
                      numberOfLines={1}
                    >
                      {item.value}
                    </Text>
                    {preview && diff !== 0 ? (
                      <Text style={[styles.diff, { color: diff > 0 ? '#7CFC7C' : '#FF6B6B' }]}>
                        {diff > 0 ? '▲' : '▼'}
                        {fmt(Math.abs(diff))}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceParchment,
    borderRightWidth: 1,
    borderRightColor: colors.borderBrass,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  headerBox: { marginBottom: spacing.sm },
  headerText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textHighlight,
    letterSpacing: 3,
    textAlign: 'center',
    fontWeight: '700',
  },
  headerLine: {
    height: 1,
    backgroundColor: colors.borderGold,
    marginTop: 4,
    opacity: 0.7,
  },
  section: { marginTop: spacing.md },
  sectionTitle: {
    color: colors.textHighlight,
    fontSize: 10,
    letterSpacing: 2.5,
    marginBottom: 6,
    fontFamily: fonts.heading,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLeather,
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
    fontFamily: fonts.body,
  },
  rowLabelMuted: { color: colors.textMuted, fontStyle: 'italic' },
  rowValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  rowValueHi: { color: colors.textHighlight, fontSize: 13 },
  rowValueMuted: { color: colors.textMuted },
  diff: { fontSize: 10, fontWeight: '700', marginLeft: 4 },
});
