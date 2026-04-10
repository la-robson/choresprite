import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, TrendingUp, AlertTriangle, Home, Settings2, Undo2, Clock } from 'lucide-react-native';
import { useChoreStore, isOverdue, isDueToday } from '@/lib/store';
import type { Chore } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import { ChoreCard } from '@/components/ChoreCard';
import { PointsBadge } from '@/components/PointsBadge';
import { AssignChoreSheet } from '@/components/AssignChoreSheet';
import { RoomSetupSheet } from '@/components/RoomSetupSheet';

export default function HomeScreen() {
  const {
    flatmates,
    currentUserId,
    rooms,
    chores,
    getActiveChores,
    getMascotMood,
    getCompletionRate,
    getLeaderboard,
    getCurrentUser,
    getRoomCompletionRate,
    getGeneralCompletionRate,
    getRecentActivity,
    undoLastCompletion,
  } = useChoreStore();

  const [showRoomSetup, setShowRoomSetup] = useState(false);
  const [assignChore, setAssignChore] = useState<Chore | null>(null);

  // Undo toast state
  const [undoMessage, setUndoMessage] = useState<string | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showUndoToast = useCallback((choreTitle: string) => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoMessage(`Completed "${choreTitle}"`);
    Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    undoTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setUndoMessage(null);
      });
    }, 5000);
  }, [toastOpacity]);

  const handleUndo = useCallback(() => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoLastCompletion();
    Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setUndoMessage(null);
    });
  }, [undoLastCompletion, toastOpacity]);

  useEffect(() => {
    return () => { if (undoTimer.current) clearTimeout(undoTimer.current); };
  }, []);

  const mood = getMascotMood();
  const completionRate = getCompletionRate();
  const leaderboard = getLeaderboard();
  const activeChores = getActiveChores();
  const currentUser = getCurrentUser();

  // Filter to user's chores (assigned to them or unassigned) for the dashboard
  const myActiveChores = activeChores.filter(
    (c) => c.assignedTo === currentUserId || c.assignedTo === null,
  );

  const overdueChores = myActiveChores.filter((c) => isOverdue(c.nextDueDate));
  const dueTodayChores = myActiveChores.filter((c) => isDueToday(c.nextDueDate));
  const needsAttention = [...overdueChores, ...dueTodayChores];

  // Room progress data
  const generalRate = getGeneralCompletionRate();
  const generalChoreCount = chores.filter(
    (c) => !c.roomId && !(c.choreType === 'oneOff' && c.completed),
  ).length;

  const roomProgressData = rooms.map((room) => {
    const rate = getRoomCompletionRate(room.id);
    const roomChoreCount = chores.filter(
      (c) => c.roomId === room.id && !(c.choreType === 'oneOff' && c.completed),
    ).length;
    return { room, rate, choreCount: roomChoreCount };
  });

  const handleComplete = (chore: Chore) => {
    if (flatmates.length > 1) {
      setAssignChore(chore);
    } else if (currentUserId) {
      useChoreStore.getState().completeChore(chore.id, currentUserId);
      showUndoToast(chore.title);
    }
  };

  const recentActivity = getRecentActivity(10);

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-primary';
    if (rate >= 50) return 'bg-accent';
    return 'bg-destructive';
  };

  const getProgressTextColor = (rate: number) => {
    if (rate >= 80) return 'text-primary';
    if (rate >= 50) return 'text-accent-foreground';
    return 'text-destructive';
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">ChoreSprite</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {currentUser ? `Hey ${currentUser.name}!` : 'Keep your flat sparkling clean'}
              </Text>
            </View>
            {leaderboard.length > 0 && leaderboard[0].points > 0 && (
              <View className="items-end">
                <View className="flex-row items-center">
                  <View className="mr-1">
                    <TrendingUp size={14} color="hsl(152, 55%, 42%)" />
                  </View>
                  <Text className="text-xs text-primary font-semibold">
                    Top: {leaderboard[0].name}
                  </Text>
                </View>
                <PointsBadge points={leaderboard[0].points} size="sm" />
              </View>
            )}
          </View>
        </View>

        {/* Mascot section */}
        <View className="items-center py-6">
          <Mascot mood={mood} size="lg" />
        </View>

        {/* Apartment overall progress */}
        {myActiveChores.length > 0 && (
          <View className="px-5 mb-4">
            <View className="bg-card rounded-2xl border border-border p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="mr-1.5">
                    {overdueChores.length > 0 ? (
                      <AlertTriangle size={16} color="hsl(0, 72%, 55%)" />
                    ) : (
                      <Sparkles size={16} color="hsl(42, 80%, 55%)" />
                    )}
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {overdueChores.length > 0
                      ? `${overdueChores.length} overdue`
                      : 'Apartment Status'}
                  </Text>
                </View>
                <Text className={`text-sm font-bold ${getProgressTextColor(completionRate)}`}>
                  {completionRate}% on track
                </Text>
              </View>
              <View className="h-3 bg-muted rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${getProgressColor(completionRate)}`}
                  style={{ width: `${completionRate}%` }}
                />
              </View>
              <Text className="text-xs text-muted-foreground mt-1.5 text-center">
                {completionRate === 100
                  ? 'All caught up! Your sprite is so happy!'
                  : overdueChores.length > 0
                    ? 'Some chores need attention!'
                    : 'Looking good, keep it up!'}
              </Text>
            </View>
          </View>
        )}

        {/* Room-by-room progress */}
        {(rooms.length > 0 || generalChoreCount > 0) && (
          <View className="px-5 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-foreground">
                Room Progress
              </Text>
              <Pressable
                onPress={() => setShowRoomSetup(true)}
                className="flex-row items-center"
              >
                <View className="mr-1">
                  <Settings2 size={14} color="hsl(152, 55%, 42%)" />
                </View>
                <Text className="text-sm text-primary font-medium">Manage</Text>
              </Pressable>
            </View>

            {/* General / apartment-level chores */}
            {generalChoreCount > 0 && (
              <View className="bg-card rounded-xl border border-border p-3 mb-2">
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-lg bg-primary/15 items-center justify-center mr-2.5">
                      <Text style={{ fontSize: 16 }}>🏠</Text>
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-foreground">General</Text>
                      <Text className="text-xs text-muted-foreground">
                        {generalChoreCount} task{generalChoreCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <Text className={`text-sm font-bold ${getProgressTextColor(generalRate)}`}>
                    {generalRate}%
                  </Text>
                </View>
                <View className="h-2 bg-muted rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${getProgressColor(generalRate)}`}
                    style={{ width: `${generalRate}%` }}
                  />
                </View>
              </View>
            )}

            {/* Per-room progress */}
            {roomProgressData.map(({ room, rate, choreCount }) => (
              <View
                key={room.id}
                className="bg-card rounded-xl border border-border p-3 mb-2"
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-lg bg-primary/15 items-center justify-center mr-2.5">
                      <Text style={{ fontSize: 16 }}>{room.icon}</Text>
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-foreground">{room.name}</Text>
                      <Text className="text-xs text-muted-foreground">
                        {choreCount} task{choreCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <Text className={`text-sm font-bold ${getProgressTextColor(rate)}`}>
                    {rate}%
                  </Text>
                </View>
                <View className="h-2 bg-muted rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${getProgressColor(rate)}`}
                    style={{ width: `${rate}%` }}
                  />
                </View>
              </View>
            ))}

            {rooms.length === 0 && generalChoreCount === 0 && (
              <View className="bg-card rounded-xl border border-border p-4 items-center">
                <Text className="text-sm text-muted-foreground">No rooms set up yet</Text>
              </View>
            )}
          </View>
        )}

        {/* Set up rooms CTA (when no rooms exist and no chores) */}
        {rooms.length === 0 && chores.length === 0 && (
          <View className="px-5 mb-4">
            <Pressable
              onPress={() => setShowRoomSetup(true)}
              className="bg-card rounded-2xl border border-primary/30 p-5 items-center"
            >
              <View className="w-14 h-14 rounded-2xl bg-primary/15 items-center justify-center mb-3">
                <View>
                  <Home size={24} color="hsl(152, 55%, 42%)" />
                </View>
              </View>
              <Text className="text-base font-semibold text-foreground mb-1">
                Set Up Your Apartment
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-3">
                Add your rooms and get suggested cleaning tasks automatically
              </Text>
              <View className="bg-primary rounded-xl px-5 py-2.5">
                <Text className="text-primary-foreground font-semibold text-sm">Get Started</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Set up rooms CTA (when rooms don't exist but chores do) */}
        {rooms.length === 0 && chores.length > 0 && (
          <View className="px-5 mb-4">
            <Pressable
              onPress={() => setShowRoomSetup(true)}
              className="bg-card rounded-2xl border border-border p-4 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center mr-3">
                <View>
                  <Home size={18} color="hsl(152, 55%, 42%)" />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Add Rooms</Text>
                <Text className="text-xs text-muted-foreground">
                  Organize chores by room for better tracking
                </Text>
              </View>
              <View className="bg-primary rounded-lg px-3 py-1.5">
                <Text className="text-primary-foreground font-semibold text-xs">Set Up</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Needs attention (overdue + due today) */}
        {needsAttention.length > 0 && (
          <View className="px-5 mb-4">
            <Text className="text-base font-semibold text-foreground mb-3">
              Needs Attention ({needsAttention.length})
            </Text>
            {needsAttention.map((chore) => {
              const flatmate = flatmates.find((f) => f.id === chore.assignedTo);
              const room = chore.roomId ? rooms.find((r) => r.id === chore.roomId) : null;
              return (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  flatmate={flatmate}
                  room={room}
                  onComplete={() => handleComplete(chore)}
                />
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {myActiveChores.length === 0 && rooms.length > 0 && (
          <View className="px-5 items-center py-4">
            <View className="bg-card rounded-2xl border border-border p-6 items-center w-full">
              <Text style={{ fontSize: 40 }} className="mb-3">
                🧹
              </Text>
              <Text className="text-base font-semibold text-foreground mb-1">No chores yet!</Text>
              <Text className="text-sm text-muted-foreground text-center">
                Head to the Chores tab to add your first cleaning task
              </Text>
            </View>
          </View>
        )}

        {/* Recent Activity Feed */}
        {recentActivity.length > 0 && (
          <View className="px-5 mb-4">
            <Text className="text-base font-semibold text-foreground mb-3">
              Recent Activity
            </Text>
            {recentActivity.map(({ completion, flatmate, choreTitle, choreIcon }) => {
              const completedDate = new Date(completion.completedAt);
              const now = new Date();
              const diffMs = now.getTime() - completedDate.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const timeAgo =
                diffMins < 1
                  ? 'just now'
                  : diffMins < 60
                    ? `${diffMins}m ago`
                    : diffHours < 24
                      ? `${diffHours}h ago`
                      : completedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

              return (
                <View
                  key={completion.id}
                  className="flex-row items-center bg-card border border-border rounded-xl p-3 mb-2"
                >
                  {flatmate && (
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: flatmate.color }}
                    >
                      <Text style={{ fontSize: 14 }}>{flatmate.avatar}</Text>
                    </View>
                  )}
                  <View className="flex-1 mr-2">
                    <Text className="text-sm text-foreground" numberOfLines={1}>
                      <Text className="font-semibold">{flatmate?.name ?? 'Someone'}</Text>
                      {' completed '}
                      <Text className="font-semibold">{choreIcon} {choreTitle}</Text>
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                      <View className="mr-1">
                        <Clock size={10} color="hsl(150, 10%, 55%)" />
                      </View>
                      <Text className="text-xs text-muted-foreground">{timeAgo}</Text>
                      <Text className="text-xs text-accent-foreground font-medium ml-2">+{completion.points} pts</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Undo toast */}
      {undoMessage && (
        <Animated.View
          style={{ opacity: toastOpacity, position: 'absolute', bottom: 100, left: 20, right: 20 }}
        >
          <View className="bg-foreground rounded-2xl px-4 py-3 flex-row items-center justify-between">
            <Text className="text-background text-sm font-medium flex-1 mr-3" numberOfLines={1}>
              {undoMessage}
            </Text>
            <Pressable onPress={handleUndo} className="flex-row items-center bg-background/20 rounded-xl px-3 py-1.5">
              <View className="mr-1">
                <Undo2 size={14} color="hsl(120, 20%, 97%)" />
              </View>
              <Text className="text-background text-sm font-semibold">Undo</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      <AssignChoreSheet
        visible={!!assignChore}
        chore={assignChore}
        onClose={() => {
          if (assignChore) showUndoToast(assignChore.title);
          setAssignChore(null);
        }}
      />
      <RoomSetupSheet visible={showRoomSetup} onClose={() => setShowRoomSetup(false)} />
    </SafeAreaView>
  );
}
