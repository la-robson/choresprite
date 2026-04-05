import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useChoreStore } from '@/lib/store';

interface AddFlatmateSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddFlatmateSheet({ visible, onClose }: AddFlatmateSheetProps) {
  const { addFlatmate } = useChoreStore();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    addFlatmate(name.trim(), password);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setPassword('');
    setPasswordConfirm('');
    setShowPassword(false);
    setShowConfirm(false);
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
              className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-4"
              autoFocus
            />

            {/* Password input */}
            <Text className="text-sm font-medium text-muted-foreground mb-2">Password</Text>
            <View className="flex-row items-center bg-input border border-border rounded-xl overflow-hidden mb-4">
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                placeholder="Choose a password"
                placeholderTextColor="hsl(150, 10%, 55%)"
                secureTextEntry={!showPassword}
                className="flex-1 px-4 py-3 text-foreground text-base"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} className="px-3 py-3">
                {showPassword ? (
                  <EyeOff size={18} color="hsl(150, 10%, 55%)" />
                ) : (
                  <Eye size={18} color="hsl(150, 10%, 55%)" />
                )}
              </Pressable>
            </View>

            {/* Confirm password */}
            <Text className="text-sm font-medium text-muted-foreground mb-2">Confirm Password</Text>
            <View className="flex-row items-center bg-input border border-border rounded-xl overflow-hidden mb-2">
              <TextInput
                value={passwordConfirm}
                onChangeText={(t) => { setPasswordConfirm(t); setError(''); }}
                placeholder="Re-enter password"
                placeholderTextColor="hsl(150, 10%, 55%)"
                secureTextEntry={!showConfirm}
                className="flex-1 px-4 py-3 text-foreground text-base"
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
              <Pressable onPress={() => setShowConfirm(!showConfirm)} className="px-3 py-3">
                {showConfirm ? (
                  <EyeOff size={18} color="hsl(150, 10%, 55%)" />
                ) : (
                  <Eye size={18} color="hsl(150, 10%, 55%)" />
                )}
              </Pressable>
            </View>

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
              disabled={!name.trim() || !password}
              className={`rounded-2xl py-4 items-center ${
                name.trim() && password ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  name.trim() && password ? 'text-primary-foreground' : 'text-muted-foreground'
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
