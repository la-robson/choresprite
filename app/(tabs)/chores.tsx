import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Sparkles } from 'lucide-react-native';
import { useChoreStore, isOverdue, isDueToday } from '@/lib/store';
import { ChoreCard } from '@/components/ChoreCard';
import { AddChoreSheet } from '@/components/AddChoreSheet';
import { AssignChoreSheet } from '@/components/AssignChoreSheet';
import type { Chore } from '@/lib/store';

export default function ChoresScreen() {
  const { flatmates, getActiveChores, getCompletedOneOffs, completeChore, removeChore } =
    useChoreStore();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [assignChore, setAssignChore] = useState<Chore | null>(null);

  const activeChores = getActiveChores();
  const completedOneOffs = getCompletedOneOffs();

  const overdueChores = activeChores.filter((c) => isOverdue(c.nextDueDate));
  const dueTodayChores = activeChores.filter((c) => isDueToday(c.nextDueDate));
  const upcomingChores = activeChores.filter(
    (c) => !isOverdue(c.nextDueDate) && !isDueToday(c.nextDueDate),
  );

  const totalActive = activeChores.length;

  const handleComplete = (chore: Chore) => {
    if (chore.assignedTo) {
      completeChore(chore.id, chore.assignedTo);
    } else if (flatmates.length > 0) {
      setAssignChore(chore);
    } else {
      completeChore(chore.id, '');
    }
  };

  const renderChoreList = (chores: Chore[]) =>
    chores.map((chore) => {
      const flatmate = flatmates.find((f) => f.id === chore.assignedTo);
      return (
        <ChoreCard
          key={chore.id}
          chore={chore}
          flatmate={flatmate}
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

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Empty state */}
        {totalActive === 0 && completedOneOffs.length === 0 && (
          <View className="items-center py-12">
            <View className="bg-card rounded-2xl border border-border p-8 items-center w-full">
              <Text style={{ fontSize: 48 }} className="mb-4">
                ✨
              </Text>
              <Text className="text-lg font-semibold text-foreground mb-2">No chores yet</Text>
              <Text className="text-sm text-muted-foreground text-center mb-5">
                Add your first chore to start tracking cleaning responsibilities with your
                flatmates
              </Text>
              <Pressable
                onPress={() => setShowAddSheet(true)}
                className="flex-row items-center bg-primary rounded-xl px-5 py-3"
              >
                <View className="mr-1.5">
                  <Sparkles size={16} color="white" />
                </View>
                <Text className="text-primary-foreground font-semibold">Add First Chore</Text>
              </Pressable>
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
              return (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  flatmate={flatmate}
                  onDelete={() => removeChore(chore.id)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <AddChoreSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
      <AssignChoreSheet
        visible={!!assignChore}
        chore={assignChore}
        onClose={() => setAssignChore(null)}
      />
    </SafeAreaView>
  );
}
