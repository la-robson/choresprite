import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check, RotateCcw, Trash2 } from 'lucide-react-native';
import type { Chore, Flatmate } from '@/lib/store';
import { FREQUENCY_LABELS } from '@/lib/store';

interface ChoreCardProps {
  chore: Chore;
  flatmate?: Flatmate | null;
  onComplete?: () => void;
  onUncomplete?: () => void;
  onDelete?: () => void;
}

export function ChoreCard({ chore, flatmate, onComplete, onUncomplete, onDelete }: ChoreCardProps) {
  return (
    <View
      className={`flex-row items-center rounded-2xl border p-4 mb-3 ${
        chore.completed
          ? 'bg-primary/10 border-primary/30'
          : 'bg-card border-border'
      }`}
    >
      {/* Chore icon */}
      <View className="w-11 h-11 rounded-xl bg-primary/15 items-center justify-center mr-3">
        <Text style={{ fontSize: 22 }}>{chore.icon}</Text>
      </View>

      {/* Chore info */}
      <View className="flex-1 mr-2">
        <Text
          className={`font-semibold text-base ${
            chore.completed ? 'text-primary line-through' : 'text-foreground'
          }`}
        >
          {chore.title}
        </Text>
        <View className="flex-row items-center mt-1 gap-2">
          <View className="bg-muted rounded-full px-2 py-0.5">
            <Text className="text-xs text-muted-foreground">
              {FREQUENCY_LABELS[chore.frequency]}
            </Text>
          </View>
          <Text className="text-xs text-accent-foreground font-medium">
            +{chore.points} pts
          </Text>
          {flatmate && (
            <View className="flex-row items-center">
              <View
                className="w-4 h-4 rounded-full items-center justify-center mr-0.5"
                style={{ backgroundColor: flatmate.color }}
              >
                <Text style={{ fontSize: 8 }}>{flatmate.avatar}</Text>
              </View>
              <Text className="text-xs text-muted-foreground">{flatmate.name}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-1">
        {chore.completed ? (
          <Pressable
            onPress={onUncomplete}
            className="w-10 h-10 rounded-xl bg-muted items-center justify-center"
          >
            <View>
              <RotateCcw size={18} color="hsl(150, 10%, 45%)" />
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={onComplete}
            className="w-10 h-10 rounded-xl bg-primary items-center justify-center"
          >
            <View>
              <Check size={18} color="white" />
            </View>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            onPress={onDelete}
            className="w-10 h-10 rounded-xl bg-destructive/10 items-center justify-center"
          >
            <View>
              <Trash2 size={16} color="hsl(0, 72%, 55%)" />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}
