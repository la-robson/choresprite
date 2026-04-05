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
import {
  LogIn,
  UserPlus,
  ChevronLeft,
  AlertCircle,
  Home,
  Hash,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useChoreStore } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import { FlatmateAvatar } from '@/components/FlatmateAvatar';

export default function LoginScreen() {
  const router = useRouter();
  const { flatmates, flatCode, login, createFlat, joinFlat } = useChoreStore();

  // View state: 'welcome' | 'createFlat' | 'joinFlat' | 'selectUser'
  const [view, setView] = useState<'welcome' | 'createFlat' | 'joinFlat' | 'selectUser'>('welcome');

  // Create flat form
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');

  // Join flat form
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');

  // If a flat already exists (flatCode is set), show user selection
  const hasFlat = !!flatCode;

  const handleCreateFlat = () => {
    if (!createName.trim()) {
      setCreateError('Name is required');
      return;
    }
    createFlat(createName.trim());
    router.replace('/(tabs)');
  };

  const handleJoinFlat = () => {
    if (!joinCode.trim()) {
      setJoinError('Join code is required');
      return;
    }
    if (!joinName.trim()) {
      setJoinError('Name is required');
      return;
    }
    const id = joinFlat(joinCode.trim(), joinName.trim());
    if (!id) {
      setJoinError('Invalid join code. Check with your flatmates.');
      return;
    }
    router.replace('/(tabs)');
  };

  const handleSelectUser = (id: string) => {
    login(id);
    router.replace('/(tabs)');
  };

  const goBack = () => {
    if (hasFlat) {
      setView('selectUser');
    } else {
      setView('welcome');
    }
    setCreateName('');
    setCreateError('');
    setJoinCode('');
    setJoinName('');
    setJoinError('');
  };

  // ── Create Flat view ──
  if (view === 'createFlat') {
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
            {/* Back button */}
            <View className="px-5 pt-4">
              <Pressable onPress={goBack} className="flex-row items-center active:opacity-70">
                <View className="mr-1">
                  <ChevronLeft size={20} color="hsl(152, 55%, 42%)" />
                </View>
                <Text className="text-base text-primary font-medium">Back</Text>
              </Pressable>
            </View>

            {/* Header */}
            <View className="items-center pt-6 pb-4">
              <Mascot mood="happy" size="lg" />
              <Text className="text-2xl font-bold text-foreground mt-4">Create a Flat</Text>
              <Text className="text-sm text-muted-foreground mt-1 text-center px-8">
                Start a new flat and share the join code with your flatmates
              </Text>
            </View>

            {/* Form */}
            <View className="px-5 mt-2">
              <View className="bg-card border border-border rounded-2xl p-5">
                <Text className="text-sm font-medium text-muted-foreground mb-2">Your Name</Text>
                <TextInput
                  value={createName}
                  onChangeText={(t) => {
                    setCreateName(t);
                    setCreateError('');
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor="hsl(150, 10%, 55%)"
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-2"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreateFlat}
                />

                <Text className="text-xs text-muted-foreground mb-4">
                  A join code will be generated for your flat. Share it with your flatmates so they can join.
                </Text>

                {/* Error */}
                {createError ? (
                  <View className="flex-row items-center mb-3">
                    <View className="mr-1">
                      <AlertCircle size={14} color="hsl(0, 72%, 55%)" />
                    </View>
                    <Text className="text-sm text-destructive">{createError}</Text>
                  </View>
                ) : null}

                {/* Create button */}
                <Pressable
                  onPress={handleCreateFlat}
                  disabled={!createName.trim()}
                  className={`rounded-2xl py-4 items-center ${
                    createName.trim() ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      createName.trim() ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    Create Flat
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Join Flat view ──
  if (view === 'joinFlat') {
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
            {/* Back button */}
            <View className="px-5 pt-4">
              <Pressable onPress={goBack} className="flex-row items-center active:opacity-70">
                <View className="mr-1">
                  <ChevronLeft size={20} color="hsl(152, 55%, 42%)" />
                </View>
                <Text className="text-base text-primary font-medium">Back</Text>
              </Pressable>
            </View>

            {/* Header */}
            <View className="items-center pt-6 pb-4">
              <Mascot mood="excited" size="lg" />
              <Text className="text-2xl font-bold text-foreground mt-4">Join a Flat</Text>
              <Text className="text-sm text-muted-foreground mt-1 text-center px-8">
                Enter the join code from your flatmate to get started
              </Text>
            </View>

            {/* Form */}
            <View className="px-5 mt-2">
              <View className="bg-card border border-border rounded-2xl p-5">
                {/* Join code */}
                <Text className="text-sm font-medium text-muted-foreground mb-2">Join Code</Text>
                <TextInput
                  value={joinCode}
                  onChangeText={(t) => {
                    setJoinCode(t.toUpperCase());
                    setJoinError('');
                  }}
                  placeholder="e.g. ABC123"
                  placeholderTextColor="hsl(150, 10%, 55%)"
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-4 text-center tracking-widest"
                  style={{ fontSize: 20, letterSpacing: 4 }}
                  autoFocus
                  autoCapitalize="characters"
                  maxLength={6}
                />

                {/* Name */}
                <Text className="text-sm font-medium text-muted-foreground mb-2">Your Name</Text>
                <TextInput
                  value={joinName}
                  onChangeText={(t) => {
                    setJoinName(t);
                    setJoinError('');
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor="hsl(150, 10%, 55%)"
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-2"
                  returnKeyType="done"
                  onSubmitEditing={handleJoinFlat}
                />

                <Text className="text-xs text-muted-foreground mb-4">
                  Ask your flatmate for the 6-character join code from their profile or settings.
                </Text>

                {/* Error */}
                {joinError ? (
                  <View className="flex-row items-center mb-3">
                    <View className="mr-1">
                      <AlertCircle size={14} color="hsl(0, 72%, 55%)" />
                    </View>
                    <Text className="text-sm text-destructive">{joinError}</Text>
                  </View>
                ) : null}

                {/* Join button */}
                <Pressable
                  onPress={handleJoinFlat}
                  disabled={!joinCode.trim() || !joinName.trim()}
                  className={`rounded-2xl py-4 items-center ${
                    joinCode.trim() && joinName.trim() ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      joinCode.trim() && joinName.trim()
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Join Flat
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Select User view (flat already exists, pick who you are) ──
  if (view === 'selectUser' || hasFlat) {
    return (
      <SafeAreaView className="flex-1 bg-background">
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

          {/* Flat code badge */}
          {flatCode && (
            <View className="px-5 mt-4">
              <View className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex-row items-center justify-center">
                <View className="mr-2">
                  <Hash size={18} color="hsl(152, 55%, 42%)" />
                </View>
                <Text className="text-sm text-muted-foreground">Flat Code: </Text>
                <Text className="text-base font-bold text-primary tracking-widest">{flatCode}</Text>
              </View>
              <Text className="text-xs text-muted-foreground text-center mt-1.5">
                Share this code with new flatmates so they can join
              </Text>
            </View>
          )}

          {/* Flatmate list */}
          {flatmates.length > 0 && (
            <View className="px-5 mt-5">
              <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Log in as
              </Text>
              <View style={{ gap: 10 }}>
                {flatmates.map((flatmate) => (
                  <Pressable
                    key={flatmate.id}
                    onPress={() => handleSelectUser(flatmate.id)}
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

          {/* Join as new flatmate */}
          <View className="px-5 mt-5">
            <View className="flex-row items-center mb-3">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-xs text-muted-foreground mx-3">not listed?</Text>
              <View className="flex-1 h-px bg-border" />
            </View>
            <Pressable
              onPress={() => setView('joinFlat')}
              className="flex-row items-center justify-center bg-secondary border border-border rounded-2xl py-4 active:opacity-80"
            >
              <View className="mr-2">
                <UserPlus size={20} color="hsl(152, 55%, 42%)" />
              </View>
              <Text className="text-base font-semibold text-foreground">
                Join with Code
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Welcome view (no flat exists yet) ──
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center pb-6">
          <Mascot mood="happy" size="lg" />
          <Text className="text-3xl font-bold text-foreground mt-4">ChoreSprite</Text>
          <Text className="text-base text-muted-foreground mt-1 text-center px-8">
            Split chores with your flatmates and make cleaning fun
          </Text>
        </View>

        {/* Action buttons */}
        <View className="px-5" style={{ gap: 12 }}>
          {/* Create a flat */}
          <Pressable
            onPress={() => setView('createFlat')}
            className="bg-primary rounded-2xl py-5 items-center active:opacity-80"
          >
            <View className="flex-row items-center">
              <View className="mr-2">
                <Home size={22} color="white" />
              </View>
              <Text className="text-lg font-semibold text-primary-foreground">Create a Flat</Text>
            </View>
            <Text className="text-xs text-primary-foreground/70 mt-1">
              Start a new flat and invite your flatmates
            </Text>
          </Pressable>

          {/* Join a flat */}
          <Pressable
            onPress={() => setView('joinFlat')}
            className="bg-card border-2 border-primary rounded-2xl py-5 items-center active:opacity-80"
          >
            <View className="flex-row items-center">
              <View className="mr-2">
                <Hash size={22} color="hsl(152, 55%, 42%)" />
              </View>
              <Text className="text-lg font-semibold text-primary">Join a Flat</Text>
            </View>
            <Text className="text-xs text-muted-foreground mt-1">
              Enter a join code from your flatmate
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
