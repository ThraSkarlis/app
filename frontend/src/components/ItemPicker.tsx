import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { ItemInstance, SlotDef, findItemsForSlot } from '../data/items';
import { ClassId } from '../data/classes';
import { colors, fonts, rarityColor, rarityOrder, Rarity } from '../theme';

interface Props {
  visible: boolean;
  slot: SlotDef | null;
  classId: ClassId;
  currentItemId: string | null;
  onPick: (itemId: string | null) => void;
  onClose: () => void;
  onHover?: (itemId: string | null) => void;
}

export default function ItemPicker({
  visible,
  slot,
  classId,
  currentItemId,
  onPick,
  onClose,
  onHover,
}: Props) {
  const [filterRarity, setFilterRarity] = useState<Rarity | 'all'>('all');

  const allItems = useMemo(() => {
    if (!slot) return [];
    return findItemsForSlot(slot.itemSlot, classId);
  }, [slot, classId]);

  // Group by base name (strip rarity suffix from id), then order by rarity.
  const grouped = useMemo(() => {
    const byBase: Record<string, ItemInstance[]> = {};
    for (const it of allItems) {
      if (filterRarity !== 'all' && it.rarity !== filterRarity) continue;
      const key = it.id.replace(/_(poor|common|uncommon|rare|epic|legendary|unique)$/, '');
      if (!byBase[key]) byBase[key] = [];
      byBase[key].push(it);
    }
    return Object.entries(byBase).map(([key, items]) => ({
      key,
      name: items[0].name,
      items: items.sort(
        (a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity),
      ),
    }));
  }, [allItems, filterRarity]);

  if (!slot) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="item-picker-modal">
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{slot.label.toUpperCase()}</Text>
              <Text style={styles.subtitle}>Choose an item</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} testID="picker-close">
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Rarity filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rarityRow}
          >
            <RarityChip
              label="All"
              active={filterRarity === 'all'}
              color={colors.textHighlight}
              onPress={() => setFilterRarity('all')}
              testID="rarity-chip-all"
            />
            {rarityOrder.map(r => (
              <RarityChip
                key={r}
                label={r}
                color={rarityColor(r)}
                active={filterRarity === r}
                onPress={() => setFilterRarity(r)}
                testID={`rarity-chip-${r}`}
              />
            ))}
          </ScrollView>

          {/* Unequip */}
          <Pressable
            style={styles.unequip}
            onPress={() => {
              onPick(null);
              onClose();
            }}
            testID="picker-unequip"
          >
            <Text style={styles.unequipText}>— Unequip Slot —</Text>
          </Pressable>

          <FlatList
            data={grouped}
            keyExtractor={item => item.key}
            renderItem={({ item }) => (
              <View style={styles.groupBox}>
                <Text style={styles.groupName}>{item.name}</Text>
                <View style={styles.rarityRowInline}>
                  {item.items.map(inst => {
                    const isCurrent = inst.id === currentItemId;
                    return (
                      <Pressable
                        key={inst.id}
                        onPress={() => {
                          onPick(inst.id);
                          onClose();
                        }}
                        onPressIn={() => onHover?.(inst.id)}
                        onHoverIn={() => onHover?.(inst.id)}
                        onHoverOut={() => onHover?.(null)}
                        style={({ pressed }) => [
                          styles.rarityBtn,
                          {
                            borderColor: rarityColor(inst.rarity),
                            backgroundColor: isCurrent ? `${rarityColor(inst.rarity)}25` : 'transparent',
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                        testID={`item-pick-${inst.id}`}
                      >
                        <Text
                          style={[
                            styles.rarityBtnText,
                            { color: rarityColor(inst.rarity) },
                          ]}
                        >
                          {inst.rarity.slice(0, 3).toUpperCase()}
                        </Text>
                        <View style={styles.statRow}>
                          {Object.entries(inst.bonuses).slice(0, 3).map(([k, v]) => (
                            <Text key={k} style={styles.statText}>
                              {labelFor(k)} {formatBonus(k, v as number)}
                            </Text>
                          ))}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No items match this filter.</Text>
            }
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </View>
      </View>
    </Modal>
  );
}

function RarityChip({
  label,
  color,
  active,
  onPress,
  testID,
}: {
  label: string;
  color: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: color,
          backgroundColor: active ? `${color}30` : 'transparent',
        },
      ]}
      testID={testID}
    >
      <Text style={[styles.chipText, { color }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

function labelFor(k: string): string {
  const map: Record<string, string> = {
    strength: 'STR',
    agility: 'AGI',
    dexterity: 'DEX',
    will: 'WIL',
    knowledge: 'KNO',
    resourcefulness: 'RES',
    vigor: 'VIG',
    maxHp: 'HP',
    armorRating: 'AR',
    magicResistRating: 'MR',
    physicalDamageBonus: 'PDB',
    magicDamageBonus: 'MDB',
    additionalPhysicalDamage: '+PHYS',
    additionalMagicDamage: '+MAG',
    truePhysicalDamage: 'TRU.P',
    trueMagicalDamage: 'TRU.M',
    moveSpeed: 'MS',
    actionSpeed: 'AS',
    weaponDamage: 'DMG',
    projectileDamageReduction: 'PDR',
    magicalHealing: 'HEAL',
    buffDuration: 'BUFF',
    interactionSpeed: 'INT',
    knockbackResistance: 'KB',
    memoryCapacity: 'MEM',
    armorPenetration: 'ARM.P',
    magicPenetration: 'MAG.P',
    luck: 'LCK',
  };
  return map[k] || k.toUpperCase();
}

function formatBonus(k: string, v: number): string {
  const isPct = ['physicalDamageBonus', 'magicDamageBonus', 'actionSpeed', 'magicalHealing', 'buffDuration', 'interactionSpeed'].includes(k);
  const sign = v > 0 ? '+' : '';
  return `${sign}${v}${isPct ? '%' : ''}`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '85%',
    backgroundColor: colors.surfaceDark,
    borderTopWidth: 2,
    borderTopColor: colors.borderGold,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderBrass,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textHighlight,
    letterSpacing: 3,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontFamily: fonts.body,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: colors.borderBrass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.textPrimary, fontSize: 16 },
  rarityRow: {
    paddingVertical: 10,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  unequip: {
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLeather,
    marginBottom: 10,
    backgroundColor: '#1a1410',
  },
  unequipText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontStyle: 'italic',
    fontSize: 12,
    letterSpacing: 1,
  },
  groupBox: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLeather,
  },
  groupName: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 15,
    marginBottom: 5,
  },
  rarityRowInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rarityBtn: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 80,
    marginRight: 6,
    marginBottom: 6,
  },
  rarityBtnText: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  statText: { color: colors.textSecondary, fontSize: 9 },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
});
