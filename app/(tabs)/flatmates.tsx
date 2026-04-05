import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Trophy, Flame, Star } from 'lucide-react-native';
import { useChoreStore } from '@/lib/store';
import { FlatmateAvatar } from '@/components/FlatmateAvatar';
import { PointsBadge } from '@/components/PointsBadge';
import { AddFlatmateSheet } from '@/components/AddFlatmateSheet';

export default function FlatmatesScreen() {
  const { flatmates, getLeaderboard, removeFlatmate } = useChoreStore();
  const [showAddSheet, setShowAddSheet] = useState(false);

  const leaderboard = getLeaderboard();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">Flatmates</Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            {flatmates.length} flatmate{flatmates.length !== 1 ? 's' : ''}
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
        {flatmates.length === 0 && (
          <View className="items-center py-12">
            <View className="bg-card rounded-2xl border border-border p-8 items-center w-full">
              <Text style={{ fontSize: 48 }} className="mb-4">🏠</Text>
              <Text className="text-lg font-semibold text-foreground mb-2">
                No flatmates yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-5">
                Add your flatmates to start splitting chores and competing for points
              </Text>
              <Pressable
                onPress={() => setShowAddSheet(true)}
                className="flex-row items-center bg-primary rounded-xl px-5 py-3"
              >
                <View className="mr-1.5">
                  <Plus size={16} color="white" />
                </View>
                <Text className="text-primary-foreground font-semibold">Add First Flatmate</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="mr-2">
                <Trophy size={20} color="hsl(42, 80%, 55%)" />
              </View>
              <Text className="text-lg font-bold text-foreground">Leaderboard</Text>
            </View>

            {/* Top 3 podium */}
            {leaderboard.length >= 2 && (
              <View className="bg-card rounded-2xl border border-border p-5 mb-4">
                <View className="flex-row items-end justify-center" style={{ gap: 16 }}>
                  {/* 2nd place */}
                  {leaderboard[1] && (
                    <View className="items-center flex-1">
                      <FlatmateAvatar flatmate={leaderboard[1]} size="md" rank={1} />
                      <View className="bg-muted rounded-xl w-full items-center py-3 mt-2" style={{ minHeight: 60 }}>
                        <PointsBadge points={leaderboard[1].points} size="sm" />
                      </View>
                    </View>
                  )}

                  {/* 1st place */}
                  <View className="items-center flex-1">
                    <FlatmateAvatar flatmate={leaderboard[0]} size="lg" rank={0} />
                    <View className="bg-primary/15 rounded-xl w-full items-center py-3 mt-2" style={{ minHeight: 80 }}>
                      <PointsBadge points={leaderboard[0].points} />
                      <View className="flex-row items-center mt-1">
                        <View className="mr-0.5">
                          <Flame size={12} color="hsl(42, 80%, 55%)" />
                        </View>
                        <Text className="text-xs text-accent-foreground font-medium">
                          {leaderboard[0].streak} streak
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 3rd place */}
                  {leaderboard[2] && (
                    <View className="items-center flex-1">
                      <FlatmateAvatar flatmate={leaderboard[2]} size="md" rank={2} />
                      <View className="bg-muted rounded-xl w-full items-center py-3 mt-2" style={{ minHeight: 45 }}>
                        <PointsBadge points={leaderboard[2].points} size="sm" />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Full list */}
            <View style={{ gap: 10 }}>
              {leaderboard.map((flatmate, index) => (
                <View
                  key={flatmate.id}
                  className="flex-row items-center bg-card border border-border rounded-2xl p-4"
                >
                  {/* Rank */}
                  <View className="w-8 items-center mr-2">
                    <Text className="text-base font-bold text-muted-foreground">
                      #{index + 1}
                    </Text>
                  </View>

                  {/* Avatar */}
                  <View
                    className="w-11 h-11 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: flatmate.color }}
                  >
                    <Text style={{ fontSize: 22 }}>{flatmate.avatar}</Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {flatmate.name}
                    </Text>
                    <View className="flex-row items-center mt-1" style={{ gap: 8 }}>
                      <View className="flex-row items-center">
                        <View className="mr-0.5">
                          <Star size={12} color="hsl(330, 40%, 55%)" />
                        </View>
                        <Text className="text-xs text-muted-foreground">
                          {flatmate.points} pts
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="mr-0.5">
                          <Flame size={12} color="hsl(42, 80%, 55%)" />
                        </View>
                        <Text className="text-xs text-muted-foreground">
                          {flatmate.streak} streak
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Delete */}
                  <Pressable
                    onPress={() => removeFlatmate(flatmate.id)}
                    className="w-9 h-9 rounded-xl bg-destructive/10 items-center justify-center"
                  >
                    <View>
                      <Trash2 size={15} color="hsl(0, 72%, 55%)" />
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Single flatmate (no podium) */}
        {leaderboard.length === 1 && (
          <View className="bg-card rounded-2xl border border-border p-5 mb-4 items-center">
            <FlatmateAvatar flatmate={leaderboard[0]} size="lg" rank={0} />
            <View className="flex-row items-center mt-3" style={{ gap: 12 }}>
              <PointsBadge points={leaderboard[0].points} />
              <PointsBadge points={leaderboard[0].streak} variant="streak" />
            </View>
            <Text className="text-xs text-muted-foreground mt-2">
              Add more flatmates to see the leaderboard!
            </Text>
          </View>
        )}
      </ScrollView>

      <AddFlatmateSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
    </SafeAreaView>
  );
}
