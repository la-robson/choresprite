import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, TrendingUp } from 'lucide-react-native';
import { useChoreStore } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import { ChoreCard } from '@/components/ChoreCard';
import { PointsBadge } from '@/components/PointsBadge';
import { AssignChoreSheet } from '@/components/AssignChoreSheet';
import type { Chore } from '@/lib/store';

export default function HomeScreen() {
  const {
    chores,
    flatmates,
    getMascotMood,
    getCompletionRate,
    getLeaderboard,
    completeChore,
    uncompleteChore,
    resetDailyChores,
  } = useChoreStore();

  const [assignChore, setAssignChore] = useState<Chore | null>(null);

  const mood = getMascotMood();
  const completionRate = getCompletionRate();
  const leaderboard = getLeaderboard();
  const completedCount = chores.filter((c) => c.completed).length;
  const totalCount = chores.length;

  useEffect(() => {
    resetDailyChores();
  }, [resetDailyChores]);

  const handleComplete = (chore: Chore) => {
    if (chore.assignedTo) {
      completeChore(chore.id, chore.assignedTo);
    } else if (flatmates.length > 0) {
      setAssignChore(chore);
    } else {
      // No flatmates, just mark complete with no one
      completeChore(chore.id, '');
    }
  };

  const pendingChores = chores.filter((c) => !c.completed);
  const completedChores = chores.filter((c) => c.completed);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">ChoreSprite</Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                Keep your flat sparkling clean
              </Text>
            </View>
            {leaderboard.length > 0 && leaderboard[0].points > 0 && (
              <View className="items-end">
                <View className="flex-row items-center">
                  <View className="mr-1">
                    <TrendingUp size={14} color="hsl(152, 55%, 42%)" />
                  </View>
                  <Text className="text-xs text-primary font-semibold">Top: {leaderboard[0].name}</Text>
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

        {/* Progress bar */}
        {totalCount > 0 && (
          <View className="px-5 mb-6">
            <View className="bg-card rounded-2xl border border-border p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="mr-1.5">
                    <Sparkles size={16} color="hsl(42, 80%, 55%)" />
                  </View>
                  <Text className="text-sm font-semibold text-foreground">Today&apos;s Progress</Text>
                </View>
                <Text className="text-sm font-bold text-primary">
                  {completedCount}/{totalCount}
                </Text>
              </View>
              <View className="h-3 bg-muted rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </View>
              <Text className="text-xs text-muted-foreground mt-1.5 text-center">
                {completionRate === 100
                  ? 'All done! Your sprite is so happy!'
                  : completionRate >= 50
                    ? 'Halfway there, keep it up!'
                    : 'Let\'s get cleaning!'}
              </Text>
            </View>
          </View>
        )}

        {/* Pending chores */}
        {pendingChores.length > 0 && (
          <View className="px-5 mb-4">
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
                />
              );
            })}
          </View>
        )}

        {/* Completed chores */}
        {completedChores.length > 0 && (
          <View className="px-5 mb-4">
            <Text className="text-base font-semibold text-muted-foreground mb-3">
              Done ({completedChores.length})
            </Text>
            {completedChores.map((chore) => {
              const flatmate = flatmates.find((f) => f.id === chore.assignedTo);
              return (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  flatmate={flatmate}
                  onUncomplete={() => uncompleteChore(chore.id)}
                />
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <View className="px-5 items-center py-4">
            <View className="bg-card rounded-2xl border border-border p-6 items-center w-full">
              <Text style={{ fontSize: 40 }} className="mb-3">🧹</Text>
              <Text className="text-base font-semibold text-foreground mb-1">No chores yet!</Text>
              <Text className="text-sm text-muted-foreground text-center">
                Head to the Chores tab to add your first cleaning task
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <AssignChoreSheet
        visible={!!assignChore}
        chore={assignChore}
        onClose={() => setAssignChore(null)}
      />
    </SafeAreaView>
  );
}
