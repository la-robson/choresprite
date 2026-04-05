import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogIn, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useChoreStore } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import { FlatmateAvatar } from '@/components/FlatmateAvatar';

export default function LoginScreen() {
  const router = useRouter();
  const { flatmates, addFlatmate, login } = useChoreStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSelectFlatmate = (id: string) => {
    login(id);
    router.replace('/(tabs)');
  };

  const handleCreateAndLogin = () => {
    if (!newName.trim()) return;
    const id = addFlatmate(newName.trim());
    login(id);
    setNewName('');
    setShowCreate(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center pt-8 pb-2">
            <Mascot mood="happy" size="lg" />
            <Text className="text-3xl font-bold text-foreground mt-4">ChoreSprite</Text>
            <Text className="text-base text-muted-foreground mt-1">
              Who&apos;s cleaning today?
            </Text>
          </View>

          {/* Flatmate list */}
          {flatmates.length > 0 && (
            <View className="px-5 mt-6">
              <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Log in as
              </Text>
              <View style={{ gap: 10 }}>
                {flatmates.map((flatmate) => (
                  <Pressable
                    key={flatmate.id}
                    onPress={() => handleSelectFlatmate(flatmate.id)}
                    className="flex-row items-center bg-card border border-border rounded-2xl p-4 active:opacity-70"
                  >
                    <FlatmateAvatar flatmate={flatmate} size="md" showName={false} />
                    <View className="flex-1 ml-3">
                      <Text className="text-base font-semibold text-foreground">
                        {flatmate.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {flatmate.points} pts · {flatmate.streak} streak
                      </Text>
                    </View>
                    <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center">
                      <LogIn size={18} color="hsl(152, 55%, 42%)" />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Divider */}
          {flatmates.length > 0 && !showCreate && (
            <View className="px-5 mt-6">
              <View className="flex-row items-center">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-xs text-muted-foreground mx-3">or</Text>
                <View className="flex-1 h-px bg-border" />
              </View>
            </View>
          )}

          {/* Create new flatmate */}
          {!showCreate ? (
            <View className="px-5 mt-4">
              <Pressable
                onPress={() => setShowCreate(true)}
                className="flex-row items-center justify-center bg-primary rounded-2xl py-4 active:opacity-80"
              >
                <View className="mr-2">
                  <UserPlus size={20} color="white" />
                </View>
                <Text className="text-base font-semibold text-primary-foreground">
                  {flatmates.length === 0 ? 'Create Your Profile' : 'New Flatmate'}
                </Text>
              </Pressable>
              {flatmates.length === 0 && (
                <Text className="text-xs text-muted-foreground text-center mt-3">
                  Create a profile to start tracking chores
                </Text>
              )}
            </View>
          ) : (
            <View className="px-5 mt-4">
              <View className="bg-card border border-border rounded-2xl p-5">
                <Text className="text-base font-semibold text-foreground mb-3">
                  Create Profile
                </Text>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Your name"
                  placeholderTextColor="hsl(150, 10%, 55%)"
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-2"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreateAndLogin}
                />
                <Text className="text-xs text-muted-foreground mb-4">
                  An avatar will be assigned automatically. You can change it later in your profile.
                </Text>
                <View className="flex-row" style={{ gap: 10 }}>
                  <Pressable
                    onPress={() => {
                      setShowCreate(false);
                      setNewName('');
                    }}
                    className="flex-1 rounded-2xl py-3.5 items-center bg-muted"
                  >
                    <Text className="text-sm font-semibold text-muted-foreground">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateAndLogin}
                    disabled={!newName.trim()}
                    className={`flex-1 rounded-2xl py-3.5 items-center ${
                      newName.trim() ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        newName.trim() ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Create & Log In
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
