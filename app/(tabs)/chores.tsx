import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Sparkles, Users, User, Home, Undo2 } from 'lucide-react-native';
import { useChoreStore, isOverdue, isDueToday } from '@/lib/store';
import type { Chore } from '@/lib/store';
import { ChoreCard } from '@/components/ChoreCard';
import { AddChoreSheet } from '@/components/AddChoreSheet';
import { AssignChoreSheet } from '@/components/AssignChoreSheet';
import { RoomSetupSheet } from '@/components/RoomSetupSheet';

export default function ChoresScreen() {
  const { flatmates, rooms, currentUserId, getActiveChores, getCompletedOneOffs, removeChore, undoLastCompletion } =
    useChoreStore();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showRoomSetup, setShowRoomSetup] = useState(false);
  const [showAll, setShowAll] = useState(false);
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

  const allActiveChores = getActiveChores();
  const allCompletedOneOffs = getCompletedOneOffs();

  // Filter chores: "My Chores" = assigned to me OR unassigned
  const activeChores = showAll
    ? allActiveChores
    : allActiveChores.filter((c) => c.assignedTo === currentUserId || c.assignedTo === null);

  const completedOneOffs = showAll
    ? allCompletedOneOffs
    : allCompletedOneOffs.filter((c) => c.assignedTo === currentUserId || c.assignedTo === null);

  const overdueChores = activeChores.filter((c) => isOverdue(c.nextDueDate));
  const dueTodayChores = activeChores.filter((c) => isDueToday(c.nextDueDate));
  const upcomingChores = activeChores.filter(
    (c) => !isOverdue(c.nextDueDate) && !isDueToday(c.nextDueDate),
  );

  const totalActive = activeChores.length;

  const handleComplete = (chore: Chore) => {
    if (flatmates.length > 1) {
      // Multiple flatmates: ask who did it
      setAssignChore(chore);
    } else if (currentUserId) {
      // Solo user: complete directly
      useChoreStore.getState().completeChore(chore.id, currentUserId);
      showUndoToast(chore.title);
    }
  };

  const getRoomForChore = (chore: Chore) => {
    if (!chore.roomId) return null;
    return rooms.find((r) => r.id === chore.roomId) ?? null;
  };

  const renderChoreList = (chores: Chore[]) =>
    chores.map((chore) => {
      const flatmate = flatmates.find((f) => f.id === chore.assignedTo);
      const room = getRoomForChore(chore);
      return (
        <ChoreCard
          key={chore.id}
          chore={chore}
          flatmate={flatmate}
          room={room}
          onComplete={() => handleComplete(chore)}
          onDelete={() => removeChore(chore.id)}
        />
      );
    });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">Chores</Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            {totalActive} active task{totalActive !== 1 ? 's' : ''}
            {overdueChores.length > 0 && (
              <Text className="text-destructive">
                {' '}· {overdueChores.length} overdue
              </Text>
            )}
          </Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {rooms.length === 0 && (
            <Pressable
              onPress={() => setShowRoomSetup(true)}
              className="flex-row items-center bg-card border border-border rounded-xl px-3 py-2.5"
            >
              <View className="mr-1.5">
                <Home size={16} color="hsl(152, 55%, 42%)" />
              </View>
              <Text className="text-primary font-semibold text-sm">Rooms</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setShowAddSheet(true)}
            className="flex-row items-center bg-primary rounded-xl px-4 py-2.5"
          >
            <View className="mr-1.5">
              <Plus size={18} color="white" />
            </View>
            <Text className="text-primary-foreground font-semibold text-sm">Add</Text>
          </Pressable>
        </View>
      </View>

      {/* Filter toggle */}
      <View className="px-5 pb-3">
        <View className="flex-row bg-muted rounded-xl p-1" style={{ gap: 4 }}>
          <Pressable
            onPress={() => setShowAll(false)}
            className={`flex-1 flex-row items-center justify-center rounded-lg py-2.5 ${
              !showAll ? 'bg-card' : ''
            }`}
            style={!showAll ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 } : undefined}
          >
            <View className="mr-1.5">
              <User size={15} color={!showAll ? 'hsl(152, 55%, 42%)' : 'hsl(150, 10%, 55%)'} />
            </View>
            <Text
              className={`text-sm font-medium ${
                !showAll ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              My Chores
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowAll(true)}
            className={`flex-1 flex-row items-center justify-center rounded-lg py-2.5 ${
              showAll ? 'bg-card' : ''
            }`}
            style={showAll ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 } : undefined}
          >
            <View className="mr-1.5">
              <Users size={15} color={showAll ? 'hsl(152, 55%, 42%)' : 'hsl(150, 10%, 55%)'} />
            </View>
            <Text
              className={`text-sm font-medium ${
                showAll ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              All Chores
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Empty state */}
        {totalActive === 0 && completedOneOffs.length === 0 && (
          <View className="items-center py-12">
            <View className="bg-card rounded-2xl border border-border p-8 items-center w-full">
              <Text style={{ fontSize: 48 }} className="mb-4">
                ✨
              </Text>
              <Text className="text-lg font-semibold text-foreground mb-2">
                {showAll ? 'No chores yet' : 'No chores assigned to you'}
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-5">
                {showAll
                  ? 'Add your first chore to start tracking cleaning responsibilities with your flatmates'
                  : 'Switch to "All Chores" to see everything, or add a new chore'}
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                {rooms.length === 0 && (
                  <Pressable
                    onPress={() => setShowRoomSetup(true)}
                    className="flex-row items-center bg-card border border-primary rounded-xl px-4 py-3"
                  >
                    <View className="mr-1.5">
                      <Home size={16} color="hsl(152, 55%, 42%)" />
                    </View>
                    <Text className="text-primary font-semibold">Set Up Rooms</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setShowAddSheet(true)}
                  className="flex-row items-center bg-primary rounded-xl px-5 py-3"
                >
                  <View className="mr-1.5">
                    <Sparkles size={16} color="white" />
                  </View>
                  <Text className="text-primary-foreground font-semibold">Add Chore</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Overdue */}
        {overdueChores.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-destructive mb-3">
              Overdue ({overdueChores.length})
            </Text>
            {renderChoreList(overdueChores)}
          </View>
        )}

        {/* Due Today */}
        {dueTodayChores.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-primary mb-3">
              Due Today ({dueTodayChores.length})
            </Text>
            {renderChoreList(dueTodayChores)}
          </View>
        )}

        {/* Upcoming */}
        {upcomingChores.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-foreground mb-3">
              Upcoming ({upcomingChores.length})
            </Text>
            {renderChoreList(upcomingChores)}
          </View>
        )}

        {/* Completed one-offs */}
        {completedOneOffs.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-muted-foreground mb-3">
              Completed ({completedOneOffs.length})
            </Text>
            {completedOneOffs.map((chore) => {
              const flatmate = flatmates.find((f) => f.id === chore.assignedTo);
              const room = getRoomForChore(chore);
              return (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  flatmate={flatmate}
                  room={room}
                  onDelete={() => removeChore(chore.id)}
                />
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

      <AddChoreSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
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
