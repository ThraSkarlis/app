import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DerivedStats } from '../data/statFormulas';
import { colors, fonts, spacing } from '../theme';

function fmt(n: number, suffix = ''): string {
  if (Number.isInteger(n)) return `${n}${suffix}`;
  return `${n.toFixed(1)}${suffix}`;
}

interface Props {
  stats: DerivedStats;
  preview?: DerivedStats | null;
}

type Row = { label: string; cur: number; suffix?: string; highlight?: boolean; muted?: boolean };

export default function StatsPanel({ stats, preview }: Props) {
  const sections: { title: string; rows: Row[] }[] = [
    {
      title: 'ATTRIBUTES',
      rows: [
        { label: 'Strength', cur: stats.strength, highlight: true },
        { label: 'Agility', cur: stats.agility, highlight: true },
        { label: 'Dexterity', cur: stats.dexterity, highlight: true },
        { label: 'Will', cur: stats.will, highlight: true },
        { label: 'Knowledge', cur: stats.knowledge, highlight: true },
        { label: 'Resourceful', cur: stats.resourcefulness, highlight: true },
        { label: 'Vigor', cur: stats.vigor, highlight: true },
      ],
    },
    {
      title: 'VITALITY',
      rows: [
        { label: 'Max Health', cur: stats.maxHp },
        { label: 'HP Recovery', cur: stats.healthRecoveryBonus, suffix: '%' },
        { label: 'Armor Rating', cur: stats.armorRating },
        { label: 'Phys Reduction', cur: stats.physicalDamageReductionPct, suffix: '%', muted: true },
        { label: 'Resist Rating', cur: stats.magicResistRating },
        { label: 'Magic Resist', cur: stats.magicResistPct, suffix: '%', muted: true },
      ],
    },
    {
      title: 'OFFENSE',
      rows: [
        { label: 'Phys Dmg Bonus', cur: stats.physicalDamageBonus, suffix: '%' },
        { label: 'Magic Dmg Bonus', cur: stats.magicDamageBonus, suffix: '%' },
        { label: '+ Phys Damage', cur: stats.additionalPhysicalDamage },
        { label: '+ Magic Damage', cur: stats.additionalMagicDamage },
        { label: 'True Phys Dmg', cur: stats.truePhysicalDamage },
        { label: 'True Mag Dmg', cur: stats.trueMagicalDamage },
        { label: 'Weapon Damage', cur: stats.weaponDamage },
        { label: 'Armor Pen', cur: stats.armorPenetration, suffix: '%' },
        { label: 'Magic Pen', cur: stats.magicPenetration, suffix: '%' },
      ],
    },
    {
      title: 'MOBILITY / SPEED',
      rows: [
        { label: 'Move Speed', cur: stats.moveSpeed },
        { label: 'Action Speed', cur: stats.actionSpeed, suffix: '%' },
        { label: 'Projectile Red', cur: stats.projectileDamageReduction, suffix: '%' },
      ],
    },
    {
      title: 'UTILITY',
      rows: [
        { label: 'Memory Cap', cur: stats.memoryCapacity },
        { label: 'Buff Duration', cur: stats.buffDuration, suffix: '%' },
        { label: 'Debuff Duration', cur: stats.debuffDuration, suffix: '%' },
        { label: 'Knockback Res', cur: stats.knockbackResistance },
        { label: 'Luck', cur: stats.luck },
      ],
    },
  ];

  // Lookup preview by row label
  const lookupPreview = (label: string): number | undefined => {
    if (!preview) return undefined;
    const map: Record<string, number> = {
      Strength: preview.strength,
      Agility: preview.agility,
      Dexterity: preview.dexterity,
      Will: preview.will,
      Knowledge: preview.knowledge,
      Resourceful: preview.resourcefulness,
      Vigor: preview.vigor,
      'Max Health': preview.maxHp,
      'HP Recovery': preview.healthRecoveryBonus,
      'Armor Rating': preview.armorRating,
      'Phys Reduction': preview.physicalDamageReductionPct,
      'Resist Rating': preview.magicResistRating,
      'Magic Resist': preview.magicResistPct,
      'Phys Dmg Bonus': preview.physicalDamageBonus,
      'Magic Dmg Bonus': preview.magicDamageBonus,
      '+ Phys Damage': preview.additionalPhysicalDamage,
      '+ Magic Damage': preview.additionalMagicDamage,
      'True Phys Dmg': preview.truePhysicalDamage,
      'True Mag Dmg': preview.trueMagicalDamage,
      'Weapon Damage': preview.weaponDamage,
      'Armor Pen': preview.armorPenetration,
      'Magic Pen': preview.magicPenetration,
      'Move Speed': preview.moveSpeed,
      'Action Speed': preview.actionSpeed,
      'Projectile Red': preview.projectileDamageReduction,
      'Memory Cap': preview.memoryCapacity,
      'Buff Duration': preview.buffDuration,
      'Debuff Duration': preview.debuffDuration,
      'Knockback Res': preview.knockbackResistance,
      Luck: preview.luck,
    };
    return map[label];
  };

  return (
    <View style={styles.container} testID="stats-panel">
      <View style={styles.headerBox}>
        <Text style={styles.headerText}>CHARACTER</Text>
        <View style={styles.headerLine} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.rows.map(row => {
              const next = lookupPreview(row.label);
              const diff = next !== undefined ? next - row.cur : 0;
              return (
                <View key={row.label} style={styles.row} testID={`stat-row-${row.label}`}>
                  <Text style={[styles.rowLabel, row.muted && styles.rowLabelMuted]} numberOfLines={1}>
                    {row.label}
                  </Text>
                  <View style={styles.rowValueWrap}>
                    <Text
                      style={[
                        styles.rowValue,
                        row.highlight && styles.rowValueHi,
                        row.muted && styles.rowValueMuted,
                      ]}
                    >
                      {fmt(row.cur, row.suffix || '')}
                    </Text>
                    {next !== undefined && diff !== 0 ? (
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
  headerLine: { height: 1, backgroundColor: colors.borderGold, marginTop: 4, opacity: 0.7 },
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  rowLabel: { color: colors.textSecondary, fontSize: 11, flex: 1, fontFamily: fonts.body },
  rowLabelMuted: { color: colors.textMuted, fontStyle: 'italic' },
  rowValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  rowValueHi: { color: colors.textHighlight, fontSize: 13 },
  rowValueMuted: { color: colors.textMuted },
  diff: { fontSize: 10, fontWeight: '700', marginLeft: 4 },
});
