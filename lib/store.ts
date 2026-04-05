import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ──────────────────────────────────────────────

export type ChoreType = 'recurring' | 'oneOff';

/** Frequency presets mapped to number of days */
export type FrequencyPreset = 'daily' | 'every2days' | 'every3days' | 'weekly' | 'biweekly' | 'monthly';

export const FREQUENCY_PRESETS: Record<FrequencyPreset, { label: string; days: number }> = {
  daily: { label: 'Daily', days: 1 },
  every2days: { label: 'Every 2 Days', days: 2 },
  every3days: { label: 'Every 3 Days', days: 3 },
  weekly: { label: 'Weekly', days: 7 },
  biweekly: { label: 'Every 2 Weeks', days: 14 },
  monthly: { label: 'Monthly', days: 30 },
};

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
  choreType: ChoreType;
  /** Number of days between occurrences. null for one-off chores. */
  frequencyDays: number | null;
  /** Human-readable frequency label */
  frequencyLabel: string;
  points: number;
  assignedTo: string | null; // flatmate id
  completed: boolean;
  lastCompletedAt: string | null;
  /** ISO date string for when this chore next needs doing */
  nextDueDate: string;
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

export const FLATMATE_COLORS = [
  '#A8D8B9', // pastel green
  '#F4B8C1', // pastel pink
  '#B8D4F4', // pastel blue
  '#F4D8B8', // pastel peach
  '#D8B8F4', // pastel purple
  '#F4F0B8', // pastel yellow
];

export const AVATAR_EMOJIS = ['🐸', '🐰', '🐱', '🐶', '🦊', '🐼', '🐨', '🦉', '🐧', '🐮', '🐷', '🐵', '🦄', '🐢', '🐙', '🦋'];

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

/** Calculate next due date from a base date + frequency in days */
function calculateNextDueDate(baseDate: string, frequencyDays: number): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + frequencyDays);
  // Set to start of day
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/** Get start of today as ISO string */
function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Check if a date is before today (overdue) */
export function isOverdue(dateStr: string): boolean {
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

/** Check if a date is today */
export function isDueToday(dateStr: string): boolean {
  const dueDate = new Date(dateStr);
  const today = new Date();
  return (
    dueDate.getFullYear() === today.getFullYear() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getDate() === today.getDate()
  );
}

/** Format a due date for display */
export function formatDueDate(dateStr: string): string {
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;

  return due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Sort chores: overdue first (most overdue first), then by nextDueDate ascending. Completed one-offs go last. */
export function sortChoresByDue(chores: Chore[]): Chore[] {
  return [...chores].sort((a, b) => {
    // Completed one-off tasks go to the bottom
    const aCompletedOneOff = a.choreType === 'oneOff' && a.completed;
    const bCompletedOneOff = b.choreType === 'oneOff' && b.completed;
    if (aCompletedOneOff && !bCompletedOneOff) return 1;
    if (!aCompletedOneOff && bCompletedOneOff) return -1;
    if (aCompletedOneOff && bCompletedOneOff) return 0;

    // Sort by nextDueDate ascending (earliest/most overdue first)
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });
}

// ── Store ──────────────────────────────────────────────

interface ChoreStore {
  flatmates: Flatmate[];
  chores: Chore[];
  completions: ChoreCompletion[];

  /** Currently logged-in flatmate id (null = not logged in) */
  currentUserId: string | null;

  // Auth actions
  login: (flatmateId: string) => void;
  logout: () => void;
  getCurrentUser: () => Flatmate | null;

  // Flatmate actions
  addFlatmate: (name: string) => string; // returns new flatmate id
  removeFlatmate: (id: string) => void;
  updateFlatmateName: (id: string, name: string) => void;
  updateFlatmateAvatar: (id: string, avatar: string) => void;

  // Chore actions
  addChore: (
    title: string,
    choreType: ChoreType,
    frequencyDays: number | null,
    frequencyLabel: string,
    points: number,
    assignedTo: string | null,
  ) => void;
  removeChore: (id: string) => void;
  completeChore: (choreId: string, flatmateId: string) => void;
  uncompleteChore: (choreId: string) => void;
  reassignChore: (choreId: string, flatmateId: string | null) => void;

  // Queries
  getSortedChores: () => Chore[];
  getActiveChores: () => Chore[];
  getCompletedOneOffs: () => Chore[];
  getTodayCompletions: () => ChoreCompletion[];
  getFlatmatePoints: (flatmateId: string) => number;
  getLeaderboard: () => Flatmate[];
  getMascotMood: () => 'happy' | 'excited' | 'neutral' | 'sad' | 'sleeping';
  getCompletionRate: () => number;
}

export const useChoreStore = create<ChoreStore>()(
  persist(
    (set, get) => ({
      flatmates: [],
      chores: [],
      completions: [],
      currentUserId: null,

      login: (flatmateId: string) => {
        set({ currentUserId: flatmateId });
      },

      logout: () => {
        set({ currentUserId: null });
      },

      getCurrentUser: () => {
        const { flatmates, currentUserId } = get();
        if (!currentUserId) return null;
        return flatmates.find((f) => f.id === currentUserId) ?? null;
      },

      addFlatmate: (name: string) => {
        const { flatmates } = get();
        const id = generateId();
        const newFlatmate: Flatmate = {
          id,
          name,
          avatar: getNextAvatar(flatmates),
          points: 0,
          streak: 0,
          color: getNextColor(flatmates),
        };
        set({ flatmates: [...flatmates, newFlatmate] });
        return id;
      },

      removeFlatmate: (id: string) => {
        const { flatmates, chores, currentUserId } = get();
        set({
          flatmates: flatmates.filter((f) => f.id !== id),
          chores: chores.map((c) =>
            c.assignedTo === id ? { ...c, assignedTo: null } : c,
          ),
          // If the removed flatmate is the current user, log out
          currentUserId: currentUserId === id ? null : currentUserId,
        });
      },

      updateFlatmateName: (id: string, name: string) => {
        const { flatmates } = get();
        set({
          flatmates: flatmates.map((f) =>
            f.id === id ? { ...f, name } : f,
          ),
        });
      },

      updateFlatmateAvatar: (id: string, avatar: string) => {
        const { flatmates } = get();
        set({
          flatmates: flatmates.map((f) =>
            f.id === id ? { ...f, avatar } : f,
          ),
        });
      },

      addChore: (title, choreType, frequencyDays, frequencyLabel, points, assignedTo) => {
        const icon = CHORE_ICONS[title] || '✅';
        const now = new Date().toISOString();
        // For new chores, they're due immediately (today)
        const newChore: Chore = {
          id: generateId(),
          title,
          icon,
          choreType,
          frequencyDays,
          frequencyLabel,
          points,
          assignedTo,
          completed: false,
          lastCompletedAt: null,
          nextDueDate: startOfToday(),
          createdAt: now,
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

        const now = new Date().toISOString();

        const completion: ChoreCompletion = {
          id: generateId(),
          choreId,
          flatmateId,
          completedAt: now,
          points: chore.points,
        };

        set({
          chores: chores.map((c) => {
            if (c.id !== choreId) return c;

            if (c.choreType === 'oneOff') {
              // One-off: mark completed permanently
              return { ...c, completed: true, lastCompletedAt: now };
            }

            // Recurring: set lastCompletedAt, recalculate nextDueDate
            const nextDue = c.frequencyDays
              ? calculateNextDueDate(now, c.frequencyDays)
              : c.nextDueDate;

            return {
              ...c,
              completed: false, // recurring chores don't stay "completed"
              lastCompletedAt: now,
              nextDueDate: nextDue,
            };
          }),
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

      getSortedChores: () => {
        return sortChoresByDue(get().chores);
      },

      getActiveChores: () => {
        const chores = get().chores.filter(
          (c) => !(c.choreType === 'oneOff' && c.completed),
        );
        return sortChoresByDue(chores);
      },

      getCompletedOneOffs: () => {
        return get().chores.filter(
          (c) => c.choreType === 'oneOff' && c.completed,
        );
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
        const chores = get().getActiveChores();
        if (chores.length === 0) return 'sleeping';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueCount = chores.filter((c) => isOverdue(c.nextDueDate)).length;
        const dueTodayCount = chores.filter((c) => isDueToday(c.nextDueDate)).length;
        const total = chores.length;

        // If nothing overdue and nothing due today, happy
        if (overdueCount === 0 && dueTodayCount === 0) return 'excited';
        // If some overdue
        const overdueRate = overdueCount / total;
        if (overdueRate >= 0.5) return 'sad';
        if (overdueRate > 0) return 'neutral';
        // Due today but not overdue
        return 'happy';
      },

      getCompletionRate: () => {
        const chores = get().getActiveChores();
        if (chores.length === 0) return 100;

        const notOverdue = chores.filter((c) => !isOverdue(c.nextDueDate)).length;
        return Math.round((notOverdue / chores.length) * 100);
      },
    }),
    {
      name: 'chore-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
