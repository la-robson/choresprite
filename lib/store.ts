import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ──────────────────────────────────────────────

export type ChoreFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Flatmate {
  id: string;
  name: string;
  avatar: string; // emoji avatar
  points: number;
  streak: number;
  color: string; // pastel color for identification
}

export interface Chore {
  id: string;
  title: string;
  icon: string; // emoji icon
  frequency: ChoreFrequency;
  points: number;
  assignedTo: string | null; // flatmate id
  completed: boolean;
  lastCompletedAt: string | null;
  createdAt: string;
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  flatmateId: string;
  completedAt: string;
  points: number;
}

// ── Constants ──────────────────────────────────────────

const FLATMATE_COLORS = [
  '#A8D8B9', // pastel green
  '#F4B8C1', // pastel pink
  '#B8D4F4', // pastel blue
  '#F4D8B8', // pastel peach
  '#D8B8F4', // pastel purple
  '#F4F0B8', // pastel yellow
];

const AVATAR_EMOJIS = ['🐸', '🐰', '🐱', '🐶', '🦊', '🐼', '🐨', '🦉'];

export const CHORE_ICONS: Record<string, string> = {
  'Dishes': '🍽️',
  'Vacuum': '🧹',
  'Laundry': '👕',
  'Trash': '🗑️',
  'Bathroom': '🚿',
  'Kitchen': '🍳',
  'Mopping': '🧽',
  'Dusting': '✨',
  'Groceries': '🛒',
  'Plants': '🌱',
  'Recycling': '♻️',
  'Windows': '🪟',
};

export const FREQUENCY_LABELS: Record<ChoreFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
};

// ── Helpers ────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getNextAvatar(flatmates: Flatmate[]): string {
  const used = new Set(flatmates.map((f) => f.avatar));
  return AVATAR_EMOJIS.find((e) => !used.has(e)) || AVATAR_EMOJIS[0];
}

function getNextColor(flatmates: Flatmate[]): string {
  const used = new Set(flatmates.map((f) => f.color));
  return FLATMATE_COLORS.find((c) => !used.has(c)) || FLATMATE_COLORS[0];
}

// ── Store ──────────────────────────────────────────────

interface ChoreStore {
  flatmates: Flatmate[];
  chores: Chore[];
  completions: ChoreCompletion[];

  // Flatmate actions
  addFlatmate: (name: string) => void;
  removeFlatmate: (id: string) => void;

  // Chore actions
  addChore: (title: string, frequency: ChoreFrequency, points: number, assignedTo: string | null) => void;
  removeChore: (id: string) => void;
  completeChore: (choreId: string, flatmateId: string) => void;
  uncompleteChore: (choreId: string) => void;
  reassignChore: (choreId: string, flatmateId: string | null) => void;

  // Queries
  getTodayCompletions: () => ChoreCompletion[];
  getFlatmatePoints: (flatmateId: string) => number;
  getLeaderboard: () => Flatmate[];
  getMascotMood: () => 'happy' | 'excited' | 'neutral' | 'sad' | 'sleeping';
  getCompletionRate: () => number;

  // Reset daily chores
  resetDailyChores: () => void;
}

export const useChoreStore = create<ChoreStore>()(
  persist(
    (set, get) => ({
      flatmates: [],
      chores: [],
      completions: [],

      addFlatmate: (name: string) => {
        const { flatmates } = get();
        const newFlatmate: Flatmate = {
          id: generateId(),
          name,
          avatar: getNextAvatar(flatmates),
          points: 0,
          streak: 0,
          color: getNextColor(flatmates),
        };
        set({ flatmates: [...flatmates, newFlatmate] });
      },

      removeFlatmate: (id: string) => {
        const { flatmates, chores } = get();
        set({
          flatmates: flatmates.filter((f) => f.id !== id),
          chores: chores.map((c) =>
            c.assignedTo === id ? { ...c, assignedTo: null } : c,
          ),
        });
      },

      addChore: (title, frequency, points, assignedTo) => {
        const icon = CHORE_ICONS[title] || '✅';
        const newChore: Chore = {
          id: generateId(),
          title,
          icon,
          frequency,
          points,
          assignedTo,
          completed: false,
          lastCompletedAt: null,
          createdAt: new Date().toISOString(),
        };
        set({ chores: [...get().chores, newChore] });
      },

      removeChore: (id: string) => {
        set({ chores: get().chores.filter((c) => c.id !== id) });
      },

      completeChore: (choreId: string, flatmateId: string) => {
        const { chores, flatmates, completions } = get();
        const chore = chores.find((c) => c.id === choreId);
        if (!chore) return;

        const completion: ChoreCompletion = {
          id: generateId(),
          choreId,
          flatmateId,
          completedAt: new Date().toISOString(),
          points: chore.points,
        };

        set({
          chores: chores.map((c) =>
            c.id === choreId
              ? { ...c, completed: true, lastCompletedAt: new Date().toISOString() }
              : c,
          ),
          flatmates: flatmates.map((f) =>
            f.id === flatmateId
              ? { ...f, points: f.points + chore.points, streak: f.streak + 1 }
              : f,
          ),
          completions: [...completions, completion],
        });
      },

      uncompleteChore: (choreId: string) => {
        const { chores } = get();
        set({
          chores: chores.map((c) =>
            c.id === choreId ? { ...c, completed: false } : c,
          ),
        });
      },

      reassignChore: (choreId: string, flatmateId: string | null) => {
        const { chores } = get();
        set({
          chores: chores.map((c) =>
            c.id === choreId ? { ...c, assignedTo: flatmateId } : c,
          ),
        });
      },

      getTodayCompletions: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().completions.filter((c) => c.completedAt.startsWith(today));
      },

      getFlatmatePoints: (flatmateId: string) => {
        const flatmate = get().flatmates.find((f) => f.id === flatmateId);
        return flatmate?.points ?? 0;
      },

      getLeaderboard: () => {
        return [...get().flatmates].sort((a, b) => b.points - a.points);
      },

      getMascotMood: () => {
        const { chores } = get();
        if (chores.length === 0) return 'sleeping';
        const completed = chores.filter((c) => c.completed).length;
        const total = chores.length;
        const rate = completed / total;
        if (rate >= 1) return 'excited';
        if (rate >= 0.6) return 'happy';
        if (rate >= 0.3) return 'neutral';
        return 'sad';
      },

      getCompletionRate: () => {
        const { chores } = get();
        if (chores.length === 0) return 0;
        const completed = chores.filter((c) => c.completed).length;
        return Math.round((completed / chores.length) * 100);
      },

      resetDailyChores: () => {
        const { chores } = get();
        const today = new Date().toISOString().split('T')[0];
        set({
          chores: chores.map((c) => {
            if (!c.lastCompletedAt) return c;
            const lastDate = c.lastCompletedAt.split('T')[0];
            if (lastDate !== today && c.frequency === 'daily') {
              return { ...c, completed: false };
            }
            return c;
          }),
        });
      },
    }),
    {
      name: 'chore-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
