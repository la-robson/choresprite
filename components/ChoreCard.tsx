import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check, Trash2, AlertTriangle, Clock, Repeat, CircleDot } from 'lucide-react-native';
import type { Chore, Flatmate, Room } from '@/lib/store';
import { isOverdue, isDueToday, formatDueDate } from '@/lib/store';

interface ChoreCardProps {
  chore: Chore;
  flatmate?: Flatmate | null;
  room?: Room | null;
  onComplete?: () => void;
  onDelete?: () => void;
}

export function ChoreCard({ chore, flatmate, room, onComplete, onDelete }: ChoreCardProps) {
  const overdue = !chore.completed && isOverdue(chore.nextDueDate);
  const dueToday = !chore.completed && isDueToday(chore.nextDueDate);
  const completedOneOff = chore.choreType === 'oneOff' && chore.completed;
  const dueDateText = formatDueDate(chore.nextDueDate);

  return (
    <View
      className={`flex-row items-center rounded-2xl border p-4 mb-3 ${
        completedOneOff
          ? 'bg-primary/10 border-primary/30'
          : overdue
            ? 'bg-destructive/5 border-destructive/30'
            : dueToday
              ? 'bg-accent/50 border-primary/40'
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
            completedOneOff ? 'text-primary line-through' : 'text-foreground'
          }`}
        >
          {chore.title}
        </Text>
        <View className="flex-row items-center mt-1 flex-wrap" style={{ gap: 6 }}>
          {/* Type badge */}
          <View className="flex-row items-center bg-muted rounded-full px-2 py-0.5">
            <View className="mr-0.5">
              {chore.choreType === 'recurring' ? (
                <Repeat size={10} color="hsl(150, 10%, 45%)" />
              ) : (
                <CircleDot size={10} color="hsl(150, 10%, 45%)" />
              )}
            </View>
            <Text className="text-xs text-muted-foreground">
              {chore.frequencyLabel}
            </Text>
          </View>

          {/* Due date badge */}
          {!completedOneOff && (
            <View
              className={`flex-row items-center rounded-full px-2 py-0.5 ${
                overdue
                  ? 'bg-destructive/15'
                  : dueToday
                    ? 'bg-primary/15'
                    : 'bg-muted'
              }`}
            >
              <View className="mr-0.5">
                {overdue ? (
                  <AlertTriangle size={10} color="hsl(0, 72%, 55%)" />
                ) : (
                  <Clock size={10} color={dueToday ? 'hsl(152, 55%, 42%)' : 'hsl(150, 10%, 45%)'} />
                )}
              </View>
              <Text
                className={`text-xs font-medium ${
                  overdue
                    ? 'text-destructive'
                    : dueToday
                      ? 'text-primary'
                      : 'text-muted-foreground'
                }`}
              >
                {dueDateText}
              </Text>
            </View>
          )}

          {/* Points */}
          <Text className="text-xs text-accent-foreground font-medium">
            +{chore.points} pts
          </Text>

          {/* Assigned flatmate */}
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

          {/* Room badge */}
          {room && (
            <View className="flex-row items-center bg-primary/10 rounded-full px-2 py-0.5">
              <Text style={{ fontSize: 10 }} className="mr-0.5">{room.icon}</Text>
              <Text className="text-xs text-primary font-medium">{room.name}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-1">
        {!completedOneOff && onComplete && (
          <Pressable
            onPress={onComplete}
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              overdue ? 'bg-destructive' : 'bg-primary'
            }`}
          >
            <View>
              <Check size={18} color="white" />
            </View>
          </Pressable>
        )}
        {completedOneOff && (
          <View className="bg-primary/20 rounded-xl px-2 py-1">
            <Text className="text-xs text-primary font-semibold">Done</Text>
          </View>
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
