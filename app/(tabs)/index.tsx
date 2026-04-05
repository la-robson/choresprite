import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { useChoreStore, isOverdue, isDueToday } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import { ChoreCard } from '@/components/ChoreCard';
import { PointsBadge } from '@/components/PointsBadge';

export default function HomeScreen() {
  const {
    flatmates,
    currentUserId,
    getActiveChores,
    getMascotMood,
    getCompletionRate,
    getLeaderboard,
    completeChore,
    getCurrentUser,
  } = useChoreStore();

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

  const handleComplete = (chore: { id: string }) => {
    // Auto-assign to current logged-in user
    if (currentUserId) {
      completeChore(chore.id, currentUserId);
    }
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

        {/* Progress bar */}
        {myActiveChores.length > 0 && (
          <View className="px-5 mb-6">
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
                      : 'Chore Status'}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-primary">{completionRate}% on track</Text>
              </View>
              <View className="h-3 bg-muted rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${
                    completionRate >= 80 ? 'bg-primary' : completionRate >= 50 ? 'bg-accent' : 'bg-destructive'
                  }`}
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

        {/* Needs attention (overdue + due today) */}
        {needsAttention.length > 0 && (
          <View className="px-5 mb-4">
            <Text className="text-base font-semibold text-foreground mb-3">
              Needs Attention ({needsAttention.length})
            </Text>
            {needsAttention.map((chore) => {
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

        {/* Empty state */}
        {myActiveChores.length === 0 && (
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
      </ScrollView>
    </SafeAreaView>
  );
}
