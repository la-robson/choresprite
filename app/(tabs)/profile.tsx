import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Pencil, Star, Flame, Check, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useChoreStore, AVATAR_EMOJIS } from '@/lib/store';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    getCurrentUser,
    updateFlatmateName,
    updateFlatmateAvatar,
    logout,
    completions,
  } = useChoreStore();

  const user = getCurrentUser();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Not logged in</Text>
      </SafeAreaView>
    );
  }

  const userCompletions = completions.filter((c) => c.flatmateId === user.id);

  const handleStartEditName = () => {
    setNameInput(user.name);
    setEditingName(true);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateFlatmateName(user.id, nameInput.trim());
    }
    setEditingName(false);
  };

  const handleSelectAvatar = (emoji: string) => {
    updateFlatmateAvatar(user.id, emoji);
    setShowAvatarPicker(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            Manage your account
          </Text>
        </View>

        {/* Avatar & Name Card */}
        <View className="px-5 mt-2">
          <View className="bg-card border border-border rounded-2xl p-6 items-center">
            {/* Avatar */}
            <Pressable
              onPress={() => setShowAvatarPicker(true)}
              className="relative active:opacity-70"
            >
              <View
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{ backgroundColor: user.color }}
              >
                <Text style={{ fontSize: 44 }}>{user.avatar}</Text>
              </View>
              <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-card">
                <Pencil size={14} color="white" />
              </View>
            </Pressable>

            {/* Name */}
            {editingName ? (
              <View className="flex-row items-center mt-4" style={{ gap: 8 }}>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  className="bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-base flex-1"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <Pressable
                  onPress={handleSaveName}
                  className="w-10 h-10 rounded-xl bg-primary items-center justify-center"
                >
                  <Check size={18} color="white" />
                </Pressable>
                <Pressable
                  onPress={() => setEditingName(false)}
                  className="w-10 h-10 rounded-xl bg-muted items-center justify-center"
                >
                  <X size={18} color="hsl(150, 10%, 45%)" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleStartEditName}
                className="flex-row items-center mt-4 active:opacity-70"
              >
                <Text className="text-xl font-bold text-foreground">{user.name}</Text>
                <View className="ml-2">
                  <Pencil size={14} color="hsl(150, 10%, 55%)" />
                </View>
              </Pressable>
            )}

            <Text className="text-xs text-muted-foreground mt-1">
              Tap name or avatar to edit
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-5 mt-5">
          <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Your Stats
          </Text>
          <View className="flex-row" style={{ gap: 10 }}>
            <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center">
              <View className="w-10 h-10 rounded-full bg-primary/15 items-center justify-center mb-2">
                <Star size={20} color="hsl(152, 55%, 42%)" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{user.points}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">Total Points</Text>
            </View>
            <View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center">
              <View className="w-10 h-10 rounded-full bg-accent/30 items-center justify-center mb-2">
                <Flame size={20} color="hsl(42, 80%, 55%)" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{user.streak}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">Day Streak</Text>
            </View>
          </View>
          <View className="bg-card border border-border rounded-2xl p-4 items-center mt-2.5">
            <Text className="text-2xl font-bold text-foreground">{userCompletions.length}</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">Chores Completed</Text>
          </View>
        </View>

        {/* Logout */}
        <View className="px-5 mt-8">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-destructive/10 border border-destructive/20 rounded-2xl py-4 active:opacity-70"
          >
            <View className="mr-2">
              <LogOut size={18} color="hsl(0, 72%, 55%)" />
            </View>
            <Text className="text-base font-semibold text-destructive">Log Out</Text>
          </Pressable>
          <Text className="text-xs text-muted-foreground text-center mt-2">
            Switch to a different flatmate
          </Text>
        </View>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal visible={showAvatarPicker} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <Pressable className="flex-1" onPress={() => setShowAvatarPicker(false)} />
          <View className="bg-background rounded-t-3xl border-t border-border px-5 pb-8 pt-4">
            <View className="items-center mb-3">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-foreground">Choose Avatar</Text>
              <Pressable
                onPress={() => setShowAvatarPicker(false)}
                className="w-8 h-8 rounded-full bg-muted items-center justify-center"
              >
                <View>
                  <X size={16} color="hsl(150, 10%, 45%)" />
                </View>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap justify-center" style={{ gap: 12 }}>
              {AVATAR_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => handleSelectAvatar(emoji)}
                  className={`w-16 h-16 rounded-2xl items-center justify-center ${
                    emoji === user.avatar
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-muted border border-border'
                  }`}
                >
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
