import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CLASSES, ClassDef } from '../src/data/classes';
import { colors, fonts, spacing } from '../src/theme';

export default function ClassSelection() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1775315454219-b3817c719290?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80',
      }}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerWrap}>
          <Text style={styles.tinyLabel}>DARK AND DARKER</Text>
          <Text style={styles.title}>Loadout Forge</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Choose thy class, adventurer.</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {CLASSES.map(cls => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onPress={() => router.push({ pathname: '/builder', params: { classId: cls.id } })}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.footerBtn}
            onPress={() => router.push('/loadouts')}
            testID="open-loadouts-btn"
          >
            <Text style={styles.footerBtnText}>⚔  MY SAVED LOADOUTS  ⚔</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function ClassCard({ cls, onPress }: { cls: ClassDef; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      testID={`class-card-${cls.id}`}
    >
      <View style={styles.cardEmblem}>
        <Text style={styles.cardEmblemText}>{cls.emblem}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardName}>{cls.name}</Text>
        <Text style={styles.cardTagline}>{cls.tagline}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {cls.description}
        </Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  bgImage: { opacity: 0.18 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,8,0.55)',
  },
  headerWrap: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  tinyLabel: {
    color: colors.textHighlight,
    fontSize: 10,
    letterSpacing: 5,
    opacity: 0.7,
  },
  title: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  divider: {
    width: 120,
    height: 1,
    backgroundColor: colors.borderGold,
    marginTop: 6,
    opacity: 0.7,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  grid: {
    padding: spacing.md,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceParchment,
    borderWidth: 1,
    borderColor: colors.borderBrass,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  cardPressed: {
    backgroundColor: '#231a12',
    borderColor: colors.borderGold,
  },
  cardEmblem: {
    width: 54,
    height: 54,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceDark,
  },
  cardEmblemText: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 28,
    fontWeight: '700',
  },
  cardName: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTagline: {
    color: colors.textHighlight,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 1,
    opacity: 0.85,
  },
  cardDesc: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardArrow: {
    color: colors.textHighlight,
    fontSize: 28,
    marginLeft: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  footerBtn: {
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: '#000c',
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerBtnText: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '700',
  },
});
