import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { useChoreStore } from '@/lib/store';
import type { Chore } from '@/lib/store';

interface AssignChoreSheetProps {
  visible: boolean;
  chore: Chore | null;
  onClose: () => void;
}

export function AssignChoreSheet({ visible, chore, onClose }: AssignChoreSheetProps) {
  const { flatmates, completeChore } = useChoreStore();

  const handleSelect = (flatmateId: string) => {
    if (!chore) return;
    completeChore(chore.id, flatmateId);
    onClose();
  };

  if (!chore) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-background rounded-t-3xl border-t border-border px-5 pb-8 pt-4">
          {/* Handle */}
          <View className="items-center mb-3">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-foreground">Who did it?</Text>
            <Pressable onPress={onClose} className="w-8 h-8 rounded-full bg-muted items-center justify-center">
              <View>
                <X size={16} color="hsl(150, 10%, 45%)" />
              </View>
            </Pressable>
          </View>

          <Text className="text-sm text-muted-foreground mb-5">
            Select who completed &quot;{chore.title}&quot; to earn {chore.points} points
          </Text>

          {/* Flatmate list */}
          {flatmates.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-muted-foreground">Add flatmates first!</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {flatmates.map((f) => (
                <Pressable
                  key={f.id}
                  onPress={() => handleSelect(f.id)}
                  className="flex-row items-center bg-card border border-border rounded-2xl p-4"
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: f.color }}
                  >
                    <Text style={{ fontSize: 24 }}>{f.avatar}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{f.name}</Text>
                    <Text className="text-xs text-muted-foreground">{f.points} points</Text>
                  </View>
                  <Text className="text-primary font-bold text-sm">+{chore.points}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
