import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { useChoreStore } from '@/lib/store';

interface AddFlatmateSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddFlatmateSheet({ visible, onClose }: AddFlatmateSheetProps) {
  const { addFlatmate } = useChoreStore();
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addFlatmate(name.trim());
    setName('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end">
          <Pressable className="flex-1" onPress={handleClose} />
          <View className="bg-background rounded-t-3xl border-t border-border px-5 pb-8 pt-4">
            {/* Handle */}
            <View className="items-center mb-3">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-foreground">Add Flatmate</Text>
              <Pressable onPress={handleClose} className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                <View>
                  <X size={16} color="hsl(150, 10%, 45%)" />
                </View>
              </Pressable>
            </View>

            {/* Name input */}
            <Text className="text-sm font-medium text-muted-foreground mb-2">Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter flatmate's name"
              placeholderTextColor="hsl(150, 10%, 55%)"
              className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-2"
              autoFocus
            />
            <Text className="text-xs text-muted-foreground mb-6">
              An avatar and color will be assigned automatically
            </Text>

            {/* Add button */}
            <Pressable
              onPress={handleAdd}
              disabled={!name.trim()}
              className={`rounded-2xl py-4 items-center ${
                name.trim() ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  name.trim() ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Add Flatmate
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
