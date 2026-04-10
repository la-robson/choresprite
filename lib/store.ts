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
  /** ISO date string for when the current streak started. null = no active streak (has overdue chores). */
  streakStartDate: string | null;
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
  /** Room this chore belongs to. null = apartment-level / general */
  roomId: string | null;
}

// ── Room types ────────────────────────────────────────

export type RoomType = 'bathroom' | 'bedroom' | 'kitchen' | 'living_room' | 'garden' | 'other';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  icon: string; // emoji
}

export const ROOM_TYPE_META: Record<RoomType, { label: string; icon: string; defaultName: string }> = {
  bathroom: { label: 'Bathroom', icon: '🚿', defaultName: 'Bathroom' },
  bedroom: { label: 'Bedroom', icon: '🛏️', defaultName: 'Bedroom' },
  kitchen: { label: 'Kitchen', icon: '🍳', defaultName: 'Kitchen' },
  living_room: { label: 'Living Room', icon: '🛋️', defaultName: 'Living Room' },
  garden: { label: 'Garden', icon: '🌿', defaultName: 'Garden' },
  other: { label: 'Other', icon: '🏠', defaultName: 'Room' },
};

export interface SuggestedTask {
  title: string;
  icon: string;
  frequencyDays: number;
  frequencyLabel: string;
  points: number;
}

export const ROOM_TASK_SUGGESTIONS: Record<RoomType, SuggestedTask[]> = {
  bathroom: [
    { title: 'Clean toilet', icon: '🚽', frequencyDays: 7, frequencyLabel: 'Weekly', points: 15 },
    { title: 'Clean shower', icon: '🚿', frequencyDays: 7, frequencyLabel: 'Weekly', points: 15 },
    { title: 'Clean bathroom floor', icon: '🧹', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
    { title: 'Clean mirror', icon: '🪞', frequencyDays: 14, frequencyLabel: 'Every 2 Weeks', points: 5 },
    { title: 'Replace towels', icon: '🧺', frequencyDays: 7, frequencyLabel: 'Weekly', points: 5 },
    { title: 'Scrub tiles', icon: '🧽', frequencyDays: 30, frequencyLabel: 'Monthly', points: 20 },
  ],
  bedroom: [
    { title: 'Change bed sheets', icon: '🛏️', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
    { title: 'Vacuum bedroom', icon: '🧹', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
    { title: 'Dust surfaces', icon: '✨', frequencyDays: 14, frequencyLabel: 'Every 2 Weeks', points: 10 },
    { title: 'Tidy wardrobe', icon: '👕', frequencyDays: 30, frequencyLabel: 'Monthly', points: 15 },
  ],
  kitchen: [
    { title: 'Clean surfaces', icon: '🧽', frequencyDays: 1, frequencyLabel: 'Daily', points: 5 },
    { title: 'Do the dishes', icon: '🍽️', frequencyDays: 1, frequencyLabel: 'Daily', points: 5 },
    { title: 'Take out bins', icon: '🗑️', frequencyDays: 2, frequencyLabel: 'Every 2 Days', points: 5 },
    { title: 'Check fridge for expired food', icon: '🧊', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
    { title: 'Clean oven', icon: '🔥', frequencyDays: 30, frequencyLabel: 'Monthly', points: 20 },
    { title: 'Deep clean kitchen', icon: '🍳', frequencyDays: 30, frequencyLabel: 'Monthly', points: 25 },
    { title: 'Clean microwave', icon: '📦', frequencyDays: 14, frequencyLabel: 'Every 2 Weeks', points: 10 },
    { title: 'Mop kitchen floor', icon: '🧹', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
  ],
  living_room: [
    { title: 'Vacuum living room', icon: '🧹', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
    { title: 'Dust surfaces', icon: '✨', frequencyDays: 14, frequencyLabel: 'Every 2 Weeks', points: 10 },
    { title: 'Clean floor', icon: '🧽', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
    { title: 'Tidy cushions & throws', icon: '🛋️', frequencyDays: 3, frequencyLabel: 'Every 3 Days', points: 5 },
    { title: 'Clean windows', icon: '🪟', frequencyDays: 30, frequencyLabel: 'Monthly', points: 15 },
  ],
  garden: [
    { title: 'Water plants', icon: '🌱', frequencyDays: 2, frequencyLabel: 'Every 2 Days', points: 5 },
    { title: 'Mow lawn', icon: '🌿', frequencyDays: 14, frequencyLabel: 'Every 2 Weeks', points: 20 },
    { title: 'Weed garden', icon: '🌾', frequencyDays: 14, frequencyLabel: 'Every 2 Weeks', points: 15 },
    { title: 'Sweep patio', icon: '🧹', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
    { title: 'Trim hedges', icon: '✂️', frequencyDays: 30, frequencyLabel: 'Monthly', points: 20 },
  ],
  other: [
    { title: 'Vacuum', icon: '🧹', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
    { title: 'Dust surfaces', icon: '✨', frequencyDays: 14, frequencyLabel: 'Every 2 Weeks', points: 10 },
    { title: 'Clean floor', icon: '🧽', frequencyDays: 7, frequencyLabel: 'Weekly', points: 10 },
  ],
};

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

/** Generate a 6-character alphanumeric flat join code */
function generateFlatCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
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

/** Count full days between a start date and today (inclusive of today) */
function daysSince(dateStr: string): number {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
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
  rooms: Room[];

  /** Currently logged-in flatmate id (null = not logged in) */
  currentUserId: string | null;

  /** The flat's join code (null = no flat created yet) */
  flatCode: string | null;

  /** The flat's display name (null = no flat created yet) */
  flatName: string | null;

  // Auth actions
  login: (flatmateId: string) => void;
  logout: () => void;
  getCurrentUser: () => Flatmate | null;
  /** Create a new flat with a join code and first flatmate. Returns the flatmate id. */
  createFlat: (flatName: string, userName: string) => string;
  /** Join an existing flat by code. Returns flatmate id or null if code is wrong. */
  joinFlat: (code: string, name: string) => string | null;
  /** Claim an existing flatmate account (multi-device login). Returns flatmate id or null if code/id is wrong. */
  claimFlatmate: (code: string, flatmateId: string) => string | null;
  /** Look up flatmates by join code. Returns flatmates array or null if code is wrong. */
  getFlatmatesByCode: (code: string) => Flatmate[] | null;
  /** Get the flat join code */
  getFlatCode: () => string | null;

  // Flatmate actions
  addFlatmate: (name: string) => string; // returns new flatmate id
  removeFlatmate: (id: string) => void;
  updateFlatmateName: (id: string, name: string) => void;
  updateFlatmateAvatar: (id: string, avatar: string) => void;

  // Room actions
  addRoom: (name: string, type: RoomType) => string;
  removeRoom: (id: string) => void;
  /** Add suggested tasks for a room. Takes room id and array of selected task indices. */
  addSuggestedTasks: (roomId: string, tasks: SuggestedTask[]) => void;

  // Chore actions
  addChore: (
    title: string,
    choreType: ChoreType,
    frequencyDays: number | null,
    frequencyLabel: string,
    points: number,
    assignedTo: string | null,
    roomId?: string | null,
  ) => void;
  removeChore: (id: string) => void;
  completeChore: (choreId: string, flatmateId: string) => void;
  uncompleteChore: (choreId: string) => void;
  reassignChore: (choreId: string, flatmateId: string | null) => void;

  /** Recalculate all flatmate streaks based on overdue chores. Call on app open and after chore changes. */
  refreshStreaks: () => void;

  // Queries
  getSortedChores: () => Chore[];
  getActiveChores: () => Chore[];
  getCompletedOneOffs: () => Chore[];
  getTodayCompletions: () => ChoreCompletion[];
  getFlatmatePoints: (flatmateId: string) => number;
  getLeaderboard: () => Flatmate[];
  getMascotMood: () => 'happy' | 'excited' | 'neutral' | 'sad' | 'sleeping';
  getCompletionRate: () => number;
  /** Get completion rate for a specific room's chores */
  getRoomCompletionRate: (roomId: string) => number;
  /** Get completion rate for chores with no room (general/apartment) */
  getGeneralCompletionRate: () => number;
}

export const useChoreStore = create<ChoreStore>()(
  persist(
    (set, get) => ({
      flatmates: [],
      chores: [],
      completions: [],
      rooms: [],
      currentUserId: null,
      flatCode: null,
      flatName: null,

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

      createFlat: (flatName: string, userName: string) => {
        const code = generateFlatCode();
        const id = generateId();
        const newFlatmate: Flatmate = {
          id,
          name: userName,
          avatar: getNextAvatar([]),
          points: 0,
          streak: 0,
          streakStartDate: startOfToday(),
          color: getNextColor([]),
        };
        set({
          flatCode: code,
          flatName,
          flatmates: [newFlatmate],
          chores: [],
          completions: [],
          currentUserId: id,
        });
        return id;
      },

      joinFlat: (code: string, name: string) => {
        const { flatCode, flatmates } = get();
        if (!flatCode || code.toUpperCase() !== flatCode.toUpperCase()) return null;
        const id = generateId();
        const newFlatmate: Flatmate = {
          id,
          name,
          avatar: getNextAvatar(flatmates),
          points: 0,
          streak: 0,
          streakStartDate: startOfToday(),
          color: getNextColor(flatmates),
        };
        set({
          flatmates: [...flatmates, newFlatmate],
          currentUserId: id,
        });
        return id;
      },

      claimFlatmate: (code: string, flatmateId: string) => {
        const { flatCode, flatmates } = get();
        if (!flatCode || code.toUpperCase() !== flatCode.toUpperCase()) return null;
        const existing = flatmates.find((f) => f.id === flatmateId);
        if (!existing) return null;
        set({ currentUserId: flatmateId });
        return flatmateId;
      },

      getFlatmatesByCode: (code: string) => {
        const { flatCode, flatmates } = get();
        if (!flatCode || code.toUpperCase() !== flatCode.toUpperCase()) return null;
        return flatmates;
      },

      getFlatCode: () => {
        return get().flatCode;
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
          streakStartDate: startOfToday(),
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

      // Room actions
      addRoom: (name: string, type: RoomType) => {
        const id = generateId();
        const meta = ROOM_TYPE_META[type];
        const newRoom: Room = { id, name: name || meta.defaultName, type, icon: meta.icon };
        set({ rooms: [...get().rooms, newRoom] });
        return id;
      },

      removeRoom: (id: string) => {
        set({
          rooms: get().rooms.filter((r) => r.id !== id),
          // Clear roomId on chores that referenced this room
          chores: get().chores.map((c) =>
            c.roomId === id ? { ...c, roomId: null } : c,
          ),
        });
      },

      addSuggestedTasks: (roomId: string, tasks: SuggestedTask[]) => {
        const now = new Date().toISOString();
        const newChores: Chore[] = tasks.map((t) => ({
          id: generateId(),
          title: t.title,
          icon: t.icon,
          choreType: 'recurring' as ChoreType,
          frequencyDays: t.frequencyDays,
          frequencyLabel: t.frequencyLabel,
          points: t.points,
          assignedTo: null,
          completed: false,
          lastCompletedAt: null,
          nextDueDate: startOfToday(),
          createdAt: now,
          roomId,
        }));
        set({ chores: [...get().chores, ...newChores] });
      },

      addChore: (title, choreType, frequencyDays, frequencyLabel, points, assignedTo, roomId) => {
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
          roomId: roomId ?? null,
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
              ? { ...f, points: f.points + chore.points }
              : f,
          ),
          completions: [...completions, completion],
        });

        // Recalculate streaks after chore state changed
        get().refreshStreaks();
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

      refreshStreaks: () => {
        const { flatmates, chores } = get();
        // Active chores = not completed one-offs
        const activeChores = chores.filter((c) => !(c.choreType === 'oneOff' && c.completed));
        const today = startOfToday();

        const updated = flatmates.map((f) => {
          // Chores relevant to this flatmate: assigned to them or unassigned
          const myChores = activeChores.filter(
            (c) => c.assignedTo === f.id,
          );
          const hasOverdue = myChores.some((c) => isOverdue(c.nextDueDate));

          if (hasOverdue) {
            // Streak broken - reset
            return { ...f, streak: 0, streakStartDate: null };
          }

          // No overdue chores - start or continue streak
          const streakStart = f.streakStartDate ?? today;
          const streak = daysSince(streakStart);
          return { ...f, streak, streakStartDate: streakStart };
        });

        set({ flatmates: updated });
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

      getRoomCompletionRate: (roomId: string) => {
        const chores = get().getActiveChores().filter((c) => c.roomId === roomId);
        if (chores.length === 0) return 100;
        const notOverdue = chores.filter((c) => !isOverdue(c.nextDueDate)).length;
        return Math.round((notOverdue / chores.length) * 100);
      },

      getGeneralCompletionRate: () => {
        const chores = get().getActiveChores().filter((c) => !c.roomId);
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
