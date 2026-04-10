# ChoreSprite: App Flow & Improvement Suggestions

## Current App Flow

```
                          +------------------+
                          |   App Launch     |
                          +--------+---------+
                                   |
                          +--------v---------+
                          |  Has currentUser? |
                          +--------+---------+
                                   |
                     No            |           Yes
              +--------------------+--------------------+
              |                                         |
     +--------v---------+                     +---------v--------+
     |   Welcome Screen  |                     |   Home (Tabs)    |
     |   /login           |                     |   /(tabs)        |
     +--------+---------+                     +------------------+
              |
     +--------v---------+
     | "Create a Group"  |----+
     | "Join a Group"    |-+  |
     +-------------------+ |  |
                           |  |
          +----------------+  +------------------+
          |                                      |
 +--------v---------+              +-------------v------+
 |  Join: Enter Code |              |  Create: Name &    |
 |  (6-char code)    |              |  Group Name form   |
 +--------+---------+              +-------------+------+
          |                                      |
          | valid code                           | submit
          |                                      |
 +--------v---------+              +-------------v------+
 | Choose: Claim     |              |  createFlat()      |
 | existing member   |              |  -> generates code |
 | OR join as new    |              |  -> first flatmate |
 +--------+---------+              +-------------+------+
          |                                      |
          | select/create                        |
          |                                      |
          +----------------+---------------------+
                           |
                  +--------v---------+
                  |   MAIN APP       |
                  |   (Tab Navigator) |
                  +--------+---------+
                           |
         +---------+-------+-------+---------+
         |         |               |         |
   +-----v---+ +--v------+ +------v--+ +----v----+
   |  Home    | | Chores  | |Flatmates| | Profile |
   |  Tab     | | Tab     | |  Tab    | |  Tab    |
   +---------++ +---------+ +---------+ +---------+
```

### Home Tab Flow

```
+------------------------------------------+
|              HOME SCREEN                  |
+------------------------------------------+
|  "Hey {name}!"                           |
|  Leaderboard preview (#1 person)         |
|                                          |
|  +------------------------------------+  |
|  |  Mascot (mood-reactive frog)       |  |
|  |  Mood: excited/happy/neutral/sad/  |  |
|  |        sleeping                    |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |  Overall Progress                  |  |
|  |  [=========>        ] 65%          |  |
|  +------------------------------------+  |
|                                          |
|  Room Progress (per room cards)          |
|   [Bathroom 80%] [Kitchen 50%]           |
|   [Bedroom 100%] [General 30%]           |
|                        [Manage Rooms]    |
|                                          |
|  Needs Attention                         |
|   [ChoreCard: overdue]                   |
|   [ChoreCard: due today]                 |
+------------------------------------------+
         |                    |
         v                    v
  Complete chore       Open RoomSetupSheet
  (tap check icon)     (tap manage/setup)
```

### Chores Tab Flow

```
+------------------------------------------+
|             CHORES SCREEN                 |
+------------------------------------------+
|  "Chores" - 5 active, 2 overdue          |
|                          [Rooms] [+ Add]  |
|                                          |
|  [My Chores] [All Chores]  <- filter     |
|                                          |
|  OVERDUE (red)                           |
|   [ChoreCard] [Complete] [Delete]        |
|   [ChoreCard] [Complete] [Delete]        |
|                                          |
|  DUE TODAY (green)                       |
|   [ChoreCard] [Complete] [Delete]        |
|                                          |
|  UPCOMING                                |
|   [ChoreCard] [Complete] [Delete]        |
|                                          |
|  COMPLETED (one-offs only)               |
|   [ChoreCard] [Done badge] [Delete]     |
+------------------------------------------+
         |           |            |
         v           v            v
   Complete     Delete chore   Open AddChoreSheet
   chore        (removeChore)  or RoomSetupSheet
```

### Add Chore Flow

```
+------------------------------------------+
|          ADD CHORE SHEET                  |
+------------------------------------------+
|  Quick picks: [Vacuum] [Mop] [Dishes]    |
|               [Laundry] [Trash] [...]    |
|  OR custom name input                    |
|                                          |
|  Type: [Recurring] / [One-off]           |
|                                          |
|  Frequency (if recurring):               |
|  [Daily] [2 Days] [3 Days]              |
|  [Weekly] [Bi-weekly] [Monthly]         |
|  [Custom: ___ days]                      |
|                                          |
|  Points: [5] [10] [15] [20] [25]        |
|                                          |
|  Room: [General] [Bathroom] [Kitchen]    |
|                                          |
|  Assign to: [Unassigned] [Alice] [Bob]   |
|                                          |
|              [Cancel]  [Add Chore]       |
+------------------------------------------+
         |
         v
   addChore() -> chore appears in lists
```

### Room Setup Flow

```
+------------------------------------------+
|        ROOM SETUP SHEET                   |
+------------------------------------------+
|  Step 1: Add Rooms                       |
|                                          |
|  Room types to add:                      |
|  [Bathroom] [Bedroom] [Kitchen]          |
|  [Living Room] [Garden] [Other]          |
|                                          |
|  Added rooms:                            |
|  [Bathroom    ] [x]                      |
|  [Kitchen     ] [x]                      |
|  (names are editable)                    |
|                                          |
|            [Review Tasks ->]             |
+------------------------------------------+
         |
         v
+------------------------------------------+
|  Step 2: Review Suggested Tasks          |
|                                          |
|  Tabs: [Bathroom] [Kitchen]              |
|                                          |
|  For Bathroom:                           |
|  [x] Clean toilet          10pts        |
|  [x] Scrub shower          10pts        |
|  [ ] Clean mirror           5pts        |
|  [x] Mop floor             10pts        |
|                                          |
|  [Select All / Deselect All]            |
|                                          |
|  [<- Back]         [Add 3 Tasks]        |
+------------------------------------------+
         |
         v
   Creates rooms + selected chores
```

### Flatmates Tab Flow

```
+------------------------------------------+
|          FLATMATES SCREEN                 |
+------------------------------------------+
|  "Flatmates" - 3 flatmates              |
|                                          |
|  +------------------------------------+  |
|  |  Your group code: ABC123  [Copy]   |  |
|  +------------------------------------+  |
|                                          |
|  Leaderboard Podium:                     |
|       [2nd]   [1st]   [3rd]            |
|              [crown]                     |
|                                          |
|  Full Rankings:                          |
|  #1 [avatar] Alice  120pts  5 streak    |
|  #2 [avatar] Bob     85pts  3 streak    |
|  #3 [avatar] Carol   60pts  2 streak    |
+------------------------------------------+
         |
         v
   Copy code / Remove flatmate
```

### Profile Tab Flow

```
+------------------------------------------+
|            PROFILE SCREEN                 |
+------------------------------------------+
|                                          |
|     [Large Avatar - tap to change]       |
|     [Name - tap to edit]                 |
|                                          |
|  +----------+----------+----------+      |
|  | 120      | 5        | 23       |      |
|  | Points   | Streak   | Chores   |      |
|  +----------+----------+----------+      |
|                                          |
|  Group: "42 Oak Street"                  |
|  Code: ABC123              [Copy]        |
|                                          |
|  [Logout]                                |
+------------------------------------------+
         |            |
         v            v
   Edit avatar/    Logout -> /login
   name inline
```

### Chore Completion Flow

```
User taps Complete on ChoreCard
         |
         v
+-------------------+
| Is chore assigned |
| to someone else?  |
+--------+----------+
         |
    No   |   (Yes -> AssignChoreSheet
         |    exists but currently unused)
         v
  completeChore(choreId, currentUserId)
         |
         +---> Recurring chore?
         |       Yes -> nextDueDate += frequencyDays
         |       No  -> completed = true (one-off)
         |
         +---> flatmate.points += chore.points
         +---> flatmate.streak += 1
         +---> Create ChoreCompletion record
         |
         v
  UI updates: mascot mood, progress bars,
  leaderboard, room stats all recalculate
```

---

## Suggested Improvements

### High Priority (Core Experience)

#### 1. Streak Reset Logic
**Current**: Streak increments on every completion but never resets.
**Problem**: A user who completes 10 chores in one day gets streak=10, which misses the point of consecutive-day tracking.
**Suggestion**: Track `lastCompletionDate` per flatmate. Only increment streak if the last completion was yesterday. Reset to 1 if there's a gap. This makes streaks meaningful and motivating.
**Files**: `lib/store.ts` (completeChore action, Flatmate type)

#### 2. Chore Assignment During Completion
**Current**: The `AssignChoreSheet` component exists but isn't used. When completing a chore, it always credits the current user.
**Problem**: If Bob completes Alice's chore, Bob gets the points but there's no way for Alice to log that Bob did it, or for unassigned shared chores to ask "who did this?"
**Suggestion**: When completing unassigned chores (or optionally any chore), show the `AssignChoreSheet` to ask "Who did it?" before awarding points. The component already exists -- it just needs to be wired up.
**Files**: `app/(tabs)/chores.tsx`, `app/(tabs)/index.tsx`, `components/AssignChoreSheet.tsx`

#### 3. Data Sync Between Devices
**Current**: Each device has completely independent data. The join code only lets you "claim" an existing flatmate slot, but data doesn't sync.
**Problem**: If Alice adds a chore on her phone, Bob won't see it. The join code creates a false expectation of shared state.
**Suggestion**: Add a lightweight backend (Firebase Realtime DB, Supabase, or Expo's built-in sync). Alternatively, add a clear disclaimer that data is device-local and the join code is for initial setup only.
**Files**: `lib/store.ts`, potentially new `lib/sync.ts`

### Medium Priority (UX Polish)

#### 4. Undo Chore Completion
**Current**: No undo for recurring chore completion. One-off chores have uncomplete, but recurring chores immediately advance the due date.
**Problem**: Accidental taps complete chores irreversibly and award points.
**Suggestion**: Show a brief "Undo" toast/snackbar (3-5 seconds) after completing a chore. Store the previous state to revert if needed.
**Files**: `lib/store.ts`, `app/(tabs)/chores.tsx`, `app/(tabs)/index.tsx`

#### 5. Chore Rotation / Fair Assignment
**Current**: Chores are manually assigned to one person or left unassigned.
**Problem**: No automatic rotation. "Clean bathroom" stays with Alice forever unless manually changed.
**Suggestion**: Add an optional "rotate" mode for recurring chores. After completion, automatically reassign to the next flatmate in order. This is a key feature for shared-living apps.
**Files**: `lib/store.ts` (completeChore action), `components/AddChoreSheet.tsx`

#### 6. Confirmation Before Destructive Actions
**Current**: Removing a flatmate or deleting a chore happens instantly on tap.
**Problem**: Easy to accidentally delete a flatmate (losing their points/history) or remove a chore.
**Suggestion**: Add a confirmation dialog ("Remove Alice? This will unassign all their chores and remove their points.") before destructive actions.
**Files**: `app/(tabs)/flatmates.tsx`, `app/(tabs)/chores.tsx`

#### 7. Chore History / Activity Feed
**Current**: Completions are stored but never displayed. Only cumulative points and streak are visible.
**Problem**: No way to see who did what and when. Can't verify fairness or review past activity.
**Suggestion**: Add a simple activity feed (on Home or a new tab) showing recent completions: "Alice completed 'Clean bathroom' (+10 pts) - 2h ago". The `completions` array already has all the data.
**Files**: New component or section in `app/(tabs)/index.tsx`, reading from `store.completions`

#### 8. Notifications / Reminders
**Current**: No push notifications. Users must open the app to see overdue chores.
**Problem**: Chores go overdue silently. Defeats the purpose of scheduling.
**Suggestion**: Add local push notifications via `expo-notifications` for chores due today and overdue reminders. No backend needed for local notifications.
**Files**: New `lib/notifications.ts`, `app.config.ts` (add expo-notifications plugin), `lib/store.ts`

### Lower Priority (Nice to Have)

#### 9. Chore Editing
**Current**: Chores can only be created or deleted. No way to edit title, frequency, points, or assignment after creation.
**Problem**: Typos or wrong settings require deleting and recreating the chore (losing completion history).
**Suggestion**: Add an edit mode to ChoreCard or a dedicated EditChoreSheet (can reuse AddChoreSheet with pre-filled values).
**Files**: `components/AddChoreSheet.tsx` (add edit mode), `lib/store.ts` (add `updateChore` action)

#### 10. Customizable Points Per Chore
**Current**: Points are set at creation from fixed presets (5, 10, 15, 20, 25).
**Problem**: Users can't set custom point values (e.g., 50 for a deep clean).
**Suggestion**: Allow custom point input alongside the presets. The store already accepts any number.
**Files**: `components/AddChoreSheet.tsx`

#### 11. Mascot Personalization
**Current**: The mascot is always a frog with fixed appearance.
**Suggestion**: Let users choose or name the mascot. Add unlockable mascot accessories/outfits as rewards for streaks or point milestones. This deepens the gamification.
**Files**: `components/Mascot.tsx`, `lib/store.ts`

#### 12. Weekly/Monthly Stats Summary
**Current**: Only cumulative all-time stats are shown.
**Suggestion**: Add weekly and monthly breakdowns: "This week: 8 chores completed, 45 points earned. Best day: Tuesday." Helps users see patterns and stay motivated.
**Files**: New component, reading from `store.completions` with date filtering

#### 13. Dark Mode Splash Screen
**Current**: Splash screen background is hardcoded to `#f3f9f3` (light green).
**Suggestion**: Use `expo-system-ui` to set the root background to match the current theme, or use Expo's dark/light splash screen support.
**Files**: `app.config.ts`

#### 14. Onboarding Tutorial
**Current**: Users land on an empty home screen after creating a group. No guidance on what to do next.
**Suggestion**: Add a brief first-time walkthrough: "Step 1: Set up your rooms, Step 2: Add or pick chores, Step 3: Invite flatmates with your code." Could be simple tooltip overlays or a guided flow.
**Files**: New `components/OnboardingOverlay.tsx`, `lib/store.ts` (add `hasSeenOnboarding` flag)
