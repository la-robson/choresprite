import React from 'react';
import { View, Text } from 'react-native';
import { Star, Flame } from 'lucide-react-native';

interface PointsBadgeProps {
  points: number;
  variant?: 'points' | 'streak';
  size?: 'sm' | 'md';
}

export function PointsBadge({ points, variant = 'points', size = 'md' }: PointsBadgeProps) {
  const isStreak = variant === 'streak';
  const isSm = size === 'sm';

  return (
    <View
      className={`flex-row items-center rounded-full ${
        isStreak ? 'bg-accent' : 'bg-secondary'
      } ${isSm ? 'px-2 py-0.5' : 'px-3 py-1'}`}
    >
      <View className="mr-1">
        {isStreak ? (
          <Flame size={isSm ? 12 : 16} color="hsl(42, 80%, 45%)" />
        ) : (
          <Star size={isSm ? 12 : 16} color="hsl(330, 40%, 55%)" />
        )}
      </View>
      <Text
        className={`font-semibold ${
          isStreak ? 'text-accent-foreground' : 'text-secondary-foreground'
        } ${isSm ? 'text-xs' : 'text-sm'}`}
      >
        {points}
      </Text>
    </View>
  );
}
