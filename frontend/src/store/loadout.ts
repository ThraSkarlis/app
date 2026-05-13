import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClassId } from '../data/classes';

const LOADOUTS_KEY = '@dnd_loadouts_v1';
const ACTIVE_KEY = '@dnd_active_loadout_v1';

export interface SavedLoadout {
  id: string;
  name: string;
  classId: ClassId;
  equipped: Record<string, string | null>;
  createdAt: number;
  updatedAt: number;
}

export async function loadAllLoadouts(): Promise<SavedLoadout[]> {
  try {
    const raw = await AsyncStorage.getItem(LOADOUTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveLoadout(loadout: SavedLoadout): Promise<void> {
  const all = await loadAllLoadouts();
  const idx = all.findIndex(l => l.id === loadout.id);
  if (idx >= 0) all[idx] = loadout;
  else all.push(loadout);
  await AsyncStorage.setItem(LOADOUTS_KEY, JSON.stringify(all));
}

export async function deleteLoadout(id: string): Promise<void> {
  const all = await loadAllLoadouts();
  await AsyncStorage.setItem(LOADOUTS_KEY, JSON.stringify(all.filter(l => l.id !== id)));
}

export async function setActiveLoadoutId(id: string | null): Promise<void> {
  if (id) await AsyncStorage.setItem(ACTIVE_KEY, id);
  else await AsyncStorage.removeItem(ACTIVE_KEY);
}

export async function getActiveLoadoutId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_KEY);
}

export function newId() {
  return `lo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
