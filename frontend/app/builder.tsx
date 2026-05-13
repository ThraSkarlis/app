import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  ImageBackground,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CLASSES, ClassId, getClass } from '../src/data/classes';
import { SLOTS, SlotDef, ITEM_DB } from '../src/data/items';
import { deriveStats, previewStats } from '../src/data/statFormulas';
import { colors, fonts, spacing } from '../src/theme';
import StatsPanel from '../src/components/StatsPanel';
import GearSlot from '../src/components/GearSlot';
import ItemPicker from '../src/components/ItemPicker';
import {
  newId,
  saveLoadout,
  loadAllLoadouts,
  SavedLoadout,
} from '../src/store/loadout';

const EMPTY_EQUIP = (): Record<string, string | null> =>
  Object.fromEntries(SLOTS.map(s => [s.id, null]));

export default function Builder() {
  const router = useRouter();
  const params = useLocalSearchParams<{ classId?: string; loadoutId?: string }>();
  const initialClassId = (params.classId as ClassId) || 'fighter';

  const [classId, setClassId] = useState<ClassId>(initialClassId);
  const [equipped, setEquipped] = useState<Record<string, string | null>>(EMPTY_EQUIP);
  const [pickerSlot, setPickerSlot] = useState<SlotDef | null>(null);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [saveVisible, setSaveVisible] = useState(false);
  const [classSwitcherVisible, setClassSwitcherVisible] = useState(false);
  const [name, setName] = useState('My Loadout');
  const [currentLoadoutId, setCurrentLoadoutId] = useState<string | null>(null);

  // Load existing loadout if passed
  useEffect(() => {
    if (params.loadoutId) {
      (async () => {
        const all = await loadAllLoadouts();
        const found = all.find(l => l.id === params.loadoutId);
        if (found) {
          setClassId(found.classId);
          setEquipped(found.equipped);
          setName(found.name);
          setCurrentLoadoutId(found.id);
        }
      })();
    }
  }, [params.loadoutId]);

  // When class changes, clear gear that no longer applies
  useEffect(() => {
    setEquipped(prev => {
      const next: Record<string, string | null> = {};
      for (const [slot, itemId] of Object.entries(prev)) {
        if (!itemId) {
          next[slot] = null;
          continue;
        }
        const it = ITEM_DB[itemId];
        if (!it) {
          next[slot] = null;
          continue;
        }
        if (it.classes === 'all' || it.classes.includes(classId)) {
          next[slot] = itemId;
        } else {
          next[slot] = null;
        }
      }
      // Make sure all keys exist
      for (const s of SLOTS) if (!(s.id in next)) next[s.id] = null;
      return next;
    });
  }, [classId]);

  const cls = getClass(classId);
  const stats = useMemo(() => deriveStats(cls, equipped), [cls, equipped]);
  const preview = useMemo(() => {
    if (!pickerSlot || !previewItemId) return null;
    return previewStats(cls, equipped, pickerSlot.id, previewItemId);
  }, [cls, equipped, pickerSlot, previewItemId]);

  const handlePick = (itemId: string | null) => {
    if (!pickerSlot) return;
    setEquipped(prev => ({ ...prev, [pickerSlot.id]: itemId }));
    setPreviewItemId(null);
  };

  const handleClear = (slotId: string) => {
    setEquipped(prev => ({ ...prev, [slotId]: null }));
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this loadout.');
      return;
    }
    const id = currentLoadoutId || newId();
    const now = Date.now();
    const lo: SavedLoadout = {
      id,
      name: name.trim(),
      classId,
      equipped,
      createdAt: now,
      updatedAt: now,
    };
    await saveLoadout(lo);
    setCurrentLoadoutId(id);
    setSaveVisible(false);
    Alert.alert('Saved', `"${lo.name}" was saved to your tome.`);
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1775315454219-b3817c719290?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80',
      }}
      style={styles.bg}
      imageStyle={{ opacity: 0.1 }}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn} testID="back-btn">
            <Text style={styles.iconBtnText}>‹</Text>
          </Pressable>
          <Pressable
            onPress={() => setClassSwitcherVisible(true)}
            style={styles.classChip}
            testID="class-chip"
          >
            <Text style={styles.classChipEmblem}>{cls.emblem}</Text>
            <View>
              <Text style={styles.classChipName}>{cls.name.toUpperCase()}</Text>
              <Text style={styles.classChipTagline}>{cls.tagline}</Text>
            </View>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>
          <Pressable
            onPress={() => setSaveVisible(true)}
            style={styles.iconBtn}
            testID="save-btn"
          >
            <Text style={styles.iconBtnSave}>SAVE</Text>
          </Pressable>
        </View>

        {/* Main split */}
        <View style={styles.split}>
          {/* Left stats */}
          <View style={styles.statsCol}>
            <StatsPanel stats={stats} preview={preview} />
          </View>

          {/* Right gear */}
          <View style={styles.gearCol}>
            <ScrollView contentContainerStyle={styles.gearGrid} showsVerticalScrollIndicator={false}>
              {/* Row 1: Head + Necklace */}
              <Row>
                <Cell slot={SLOTS[0]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
                <Cell slot={SLOTS[1]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
              </Row>
              {/* Row 2: Back + Chest */}
              <Row>
                <Cell slot={SLOTS[2]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
                <Cell slot={SLOTS[3]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
              </Row>
              {/* Row 3: Hands + Legs */}
              <Row>
                <Cell slot={SLOTS[4]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
                <Cell slot={SLOTS[5]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
              </Row>
              {/* Row 4: Feet (full) */}
              <Row>
                <Cell slot={SLOTS[6]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
                <View style={{ flex: 1 }} />
              </Row>

              <Divider label="JEWELRY" />
              <Row>
                <Cell slot={SLOTS[7]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
                <Cell slot={SLOTS[8]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
              </Row>

              <Divider label="WEAPONS" />
              <Row>
                <Cell slot={SLOTS[9]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
                <Cell slot={SLOTS[10]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
              </Row>

              <Divider label="UTILITY" />
              <Row>
                <Cell slot={SLOTS[11]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
                <Cell slot={SLOTS[12]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
              </Row>
              <Row>
                <Cell slot={SLOTS[13]} equipped={equipped} onPress={setPickerSlot} onClear={handleClear} />
                <View style={{ flex: 1 }} />
              </Row>

              <Pressable
                onPress={() => setEquipped(EMPTY_EQUIP())}
                style={styles.clearAllBtn}
                testID="clear-all-btn"
              >
                <Text style={styles.clearAllText}>✕  Clear all gear</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>

        {/* Item Picker */}
        <ItemPicker
          visible={pickerSlot !== null}
          slot={pickerSlot}
          classId={classId}
          currentItemId={pickerSlot ? equipped[pickerSlot.id] : null}
          onPick={handlePick}
          onHover={setPreviewItemId}
          onClose={() => {
            setPickerSlot(null);
            setPreviewItemId(null);
          }}
        />

        {/* Save dialog */}
        <Modal visible={saveVisible} transparent animationType="fade" onRequestClose={() => setSaveVisible(false)}>
          <View style={styles.dialogBackdrop}>
            <View style={styles.dialog} testID="save-dialog">
              <Text style={styles.dialogTitle}>Save Loadout</Text>
              <Text style={styles.dialogSub}>Name your build to preserve it in the tome.</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Build name"
                placeholderTextColor={colors.textMuted}
                testID="loadout-name-input"
              />
              <View style={styles.dialogBtns}>
                <Pressable
                  onPress={() => setSaveVisible(false)}
                  style={[styles.dialogBtn, styles.dialogBtnSecondary]}
                  testID="save-cancel"
                >
                  <Text style={styles.dialogBtnTextSecondary}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onSave} style={styles.dialogBtn} testID="save-confirm">
                  <Text style={styles.dialogBtnText}>Inscribe</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Class switcher */}
        <Modal visible={classSwitcherVisible} transparent animationType="fade" onRequestClose={() => setClassSwitcherVisible(false)}>
          <Pressable style={styles.dialogBackdrop} onPress={() => setClassSwitcherVisible(false)}>
            <View style={styles.classDialog} testID="class-switcher">
              <Text style={styles.dialogTitle}>Switch Class</Text>
              <Text style={styles.dialogSub}>Gear not allowed by the new class will be removed.</Text>
              <ScrollView style={{ maxHeight: 360, marginTop: 10 }}>
                {CLASSES.map(c => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      setClassId(c.id);
                      setClassSwitcherVisible(false);
                    }}
                    style={[
                      styles.classRow,
                      c.id === classId && { borderColor: colors.borderGold, backgroundColor: '#1a140e' },
                    ]}
                    testID={`class-switch-${c.id}`}
                  >
                    <Text style={styles.classRowEmblem}>{c.emblem}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.classRowName}>{c.name}</Text>
                      <Text style={styles.classRowTag}>{c.tagline}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}
function Cell({
  slot,
  equipped,
  onPress,
  onClear,
}: {
  slot: SlotDef;
  equipped: Record<string, string | null>;
  onPress: (s: SlotDef) => void;
  onClear: (id: string) => void;
}) {
  const itemId = equipped[slot.id];
  const item = itemId ? ITEM_DB[itemId] || null : null;
  return (
    <GearSlot
      slot={slot}
      item={item}
      onPress={() => onPress(slot)}
      onClear={() => onClear(slot.id)}
    />
  );
}
function Divider({ label }: { label: string }) {
  return (
    <View style={styles.divWrap}>
      <View style={styles.divLine} />
      <Text style={styles.divLabel}>{label}</Text>
      <View style={styles.divLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,8,8,0.65)' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderBrass,
    backgroundColor: '#0c0a08',
    gap: 8,
  },
  iconBtn: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderBrass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: colors.textHighlight, fontSize: 22, fontWeight: '600' },
  iconBtnSave: {
    color: colors.textHighlight,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  classChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderGold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surfaceParchment,
  },
  classChipEmblem: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 22,
    width: 26,
    textAlign: 'center',
    fontWeight: '700',
  },
  classChipName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: fonts.heading,
  },
  classChipTagline: {
    color: colors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  chevron: { color: colors.textHighlight, fontSize: 14 },
  split: { flex: 1, flexDirection: 'row' },
  statsCol: { width: '38%' },
  gearCol: { flex: 1, padding: 8 },
  gearGrid: { gap: 6, paddingBottom: 20 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  divWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 4, gap: 6 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.borderBrass, opacity: 0.6 },
  divLabel: {
    color: colors.textHighlight,
    fontSize: 9,
    letterSpacing: 2.5,
    fontFamily: fonts.heading,
  },
  clearAllBtn: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLeather,
    paddingVertical: 8,
    alignItems: 'center',
  },
  clearAllText: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: 18,
  },
  classDialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: 18,
  },
  dialogTitle: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  dialogSub: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 14,
    fontFamily: fonts.body,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderBrass,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceParchment,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  dialogBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  dialogBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: colors.borderGold,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  dialogBtnText: { color: '#fff', fontWeight: '700', letterSpacing: 1.5, fontSize: 12 },
  dialogBtnSecondary: { backgroundColor: 'transparent' },
  dialogBtnTextSecondary: { color: colors.textSecondary, fontWeight: '600', fontSize: 12 },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderLeather,
    marginBottom: 6,
  },
  classRowEmblem: {
    color: colors.textHighlight,
    fontFamily: fonts.heading,
    fontSize: 24,
    width: 30,
    textAlign: 'center',
    fontWeight: '700',
  },
  classRowName: {
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  classRowTag: { color: colors.textSecondary, fontSize: 10, fontStyle: 'italic' },
});
