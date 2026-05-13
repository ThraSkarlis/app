import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ImageBackground,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SavedLoadout, deleteLoadout, loadAllLoadouts } from '../src/store/loadout';
import { CLASSES, getClass } from '../src/data/classes';
import { ITEM_DB, SLOTS } from '../src/data/items';
import { colors, fonts, rarityColor, spacing } from '../src/theme';

export default function LoadoutsScreen() {
  const router = useRouter();
  const [loadouts, setLoadouts] = useState<SavedLoadout[]>([]);

  const refresh = useCallback(async () => {
    const all = await loadAllLoadouts();
    setLoadouts(all.sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onDelete = (lo: SavedLoadout) => {
    Alert.alert('Delete Loadout', `Remove "${lo.name}" from your tome?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLoadout(lo.id);
          refresh();
        },
      },
    ]);
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1775315454219-b3817c719290?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80',
      }}
      style={styles.bg}
      imageStyle={{ opacity: 0.12 }}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="loadouts-back">
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>SAVED LOADOUTS</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.divider} />

        {loadouts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>The Tome is Empty</Text>
            <Text style={styles.emptySub}>
              Forge a loadout from the builder, then inscribe it here.
            </Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.replace('/')}
              testID="loadouts-empty-cta"
            >
              <Text style={styles.ctaText}>FORGE A LOADOUT</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {loadouts.map(lo => {
              const cls = getClass(lo.classId);
              const equippedCount = Object.values(lo.equipped).filter(Boolean).length;
              // Sample the rarest equipped item for accent color
              let accent = colors.borderBrass;
              for (const id of Object.values(lo.equipped)) {
                if (!id) continue;
                const it = ITEM_DB[id];
                if (it) accent = rarityColor(it.rarity);
              }
              return (
                <Pressable
                  key={lo.id}
                  style={[styles.card, { borderColor: accent }]}
                  onPress={() =>
                    router.push({ pathname: '/builder', params: { loadoutId: lo.id } })
                  }
                  testID={`loadout-card-${lo.id}`}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardEmblem}>{cls.emblem}</Text>
                    <Text style={styles.cardClass}>{cls.name.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {lo.name}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {equippedCount}/{SLOTS.length} slots · {new Date(lo.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      onDelete(lo);
                    }}
                    style={styles.delBtn}
                    testID={`loadout-delete-${lo.id}`}
                  >
                    <Text style={styles.delText}>✕</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,8,8,0.6)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: colors.borderBrass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.textHighlight, fontSize: 22 },
  title: {
    flex: 1,
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
  },
  divider: { height: 1, backgroundColor: colors.borderGold, opacity: 0.5 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  emptySub: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  cta: {
    borderWidth: 1,
    borderColor: colors.borderGold,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: '#000c',
  },
  ctaText: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '700',
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceParchment,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardLeft: { alignItems: 'center', width: 60 },
  cardEmblem: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: '700',
  },
  cardClass: {
    color: colors.textSecondary,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  cardName: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: '700',
  },
  cardMeta: { color: colors.textMuted, fontSize: 10, marginTop: 4, fontStyle: 'italic' },
  delBtn: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: colors.borderLeather,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delText: { color: colors.textDanger, fontSize: 14, fontWeight: '700' },
});
