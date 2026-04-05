import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { useChoreStore } from '@/lib/store';

interface AddFlatmateSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddFlatmateSheet({ visible, onClose }: AddFlatmateSheetProps) {
  const { addFlatmate } = useChoreStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    addFlatmate(name.trim());
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
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
              onChangeText={(t) => { setName(t); setError(''); }}
              placeholder="Enter flatmate's name"
              placeholderTextColor="hsl(150, 10%, 55%)"
              className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-2"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />

            <Text className="text-xs text-muted-foreground mb-4">
              An avatar and color will be assigned automatically
            </Text>

            {/* Error */}
            {error ? (
              <View className="flex-row items-center mb-3">
                <View className="mr-1">
                  <AlertCircle size={14} color="hsl(0, 72%, 55%)" />
                </View>
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            ) : null}

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
