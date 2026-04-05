import React from 'react';
import { View, Text } from 'react-native';
import type { Flatmate } from '@/lib/store';

interface FlatmateAvatarProps {
  flatmate: Flatmate;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  rank?: number;
}

const SIZE_MAP = {
  sm: { container: 36, emoji: 16, name: 11 },
  md: { container: 48, emoji: 22, name: 13 },
  lg: { container: 64, emoji: 30, name: 15 },
};

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export function FlatmateAvatar({ flatmate, size = 'md', showName = true, rank }: FlatmateAvatarProps) {
  const s = SIZE_MAP[size];

  return (
    <View className="items-center">
      <View className="relative">
        <View
          className="rounded-full items-center justify-center"
          style={{
            width: s.container,
            height: s.container,
            backgroundColor: flatmate.color,
          }}
        >
          <Text style={{ fontSize: s.emoji }}>{flatmate.avatar}</Text>
        </View>
        {rank !== undefined && rank < 3 && (
          <View className="absolute -top-2 -right-2">
            <Text style={{ fontSize: s.emoji * 0.7 }}>{RANK_MEDALS[rank]}</Text>
          </View>
        )}
      </View>
      {showName && (
        <Text
          className="text-foreground font-medium mt-1 text-center"
          style={{ fontSize: s.name }}
          numberOfLines={1}
        >
          {flatmate.name}
        </Text>
      )}
    </View>
  );
}
