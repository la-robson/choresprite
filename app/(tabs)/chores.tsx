import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Sparkles } from 'lucide-react-native';
import { useChoreStore } from '@/lib/store';
import { ChoreCard } from '@/components/ChoreCard';
import { AddChoreSheet } from '@/components/AddChoreSheet';
import { AssignChoreSheet } from '@/components/AssignChoreSheet';
import type { Chore } from '@/lib/store';

export default function ChoresScreen() {
  const { chores, flatmates, completeChore, uncompleteChore, removeChore } = useChoreStore();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [assignChore, setAssignChore] = useState<Chore | null>(null);

  const pendingChores = chores.filter((c) => !c.completed);
  const completedChores = chores.filter((c) => c.completed);

  const handleComplete = (chore: Chore) => {
    if (chore.assignedTo) {
      completeChore(chore.id, chore.assignedTo);
    } else if (flatmates.length > 0) {
      setAssignChore(chore);
    } else {
      completeChore(chore.id, '');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">Chores</Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            {chores.length} task{chores.length !== 1 ? 's' : ''} total
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
        {chores.length === 0 && (
          <View className="items-center py-12">
            <View className="bg-card rounded-2xl border border-border p-8 items-center w-full">
              <Text style={{ fontSize: 48 }} className="mb-4">✨</Text>
              <Text className="text-lg font-semibold text-foreground mb-2">
                No chores yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-5">
                Add your first chore to start tracking cleaning responsibilities with your flatmates
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

        {/* Pending */}
        {pendingChores.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-foreground mb-3">
              To Do ({pendingChores.length})
            </Text>
            {pendingChores.map((chore) => {
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
            })}
          </View>
        )}

        {/* Completed */}
        {completedChores.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-muted-foreground mb-3">
              Completed ({completedChores.length})
            </Text>
            {completedChores.map((chore) => {
              const flatmate = flatmates.find((f) => f.id === chore.assignedTo);
              return (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  flatmate={flatmate}
                  onUncomplete={() => uncompleteChore(chore.id)}
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
