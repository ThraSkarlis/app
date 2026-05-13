import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ItemInstance, SlotDef } from '../data/items';
import { colors, fonts, rarityColor } from '../theme';

interface Props {
  slot: SlotDef;
  item: ItemInstance | null;
  onPress: () => void;
  onClear?: () => void;
}

const SLOT_GLYPH: Record<SlotDef['itemSlot'], string> = {
  head: '⛑',
  chest: '🛡',
  legs: '╳',
  feet: '☗',
  hands: '✋',
  back: '~',
  necklace: '◇',
  ring: '◯',
  primary: '⚔',
  secondary: '🛡',
  utility: '✚',
};

export default function GearSlot({ slot, item, onPress, onClear }: Props) {
  const borderColor = item ? rarityColor(item.rarity) : colors.borderBrass;
  const glyph = SLOT_GLYPH[slot.itemSlot] || '◇';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onClear}
      style={({ pressed }) => [
        styles.box,
        { borderColor, opacity: pressed ? 0.85 : 1, shadowColor: item ? borderColor : '#000' },
      ]}
      testID={`gear-slot-${slot.id}`}
    >
      <Text style={styles.slotLabel}>{slot.label}</Text>
      {item ? (
        <>
          <Text
            style={[styles.itemName, { color: rarityColor(item.rarity) }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text style={[styles.rarityTag, { color: rarityColor(item.rarity) }]}>
            {item.rarity.toUpperCase()}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.glyph}>{glyph}</Text>
          <Text style={styles.empty}>empty</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceSlot,
    borderWidth: 1.5,
    minHeight: 78,
    flex: 1,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  slotLabel: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  rarityTag: {
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 2,
    opacity: 0.85,
  },
  glyph: {
    fontSize: 22,
    color: colors.borderBrass,
    marginVertical: 2,
  },
  empty: {
    fontSize: 9,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
