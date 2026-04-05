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
  ChevronLeft,
  AlertCircle,
  Home,
  Hash,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useChoreStore, type Flatmate } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import { FlatmateAvatar } from '@/components/FlatmateAvatar';

export default function LoginScreen() {
  const router = useRouter();
  const { createFlat, joinFlat, claimFlatmate, getFlatmatesByCode } = useChoreStore();

  // View state
  const [view, setView] = useState<
    'welcome' | 'createFlat' | 'joinFlat' | 'joinChoose'
  >('welcome');

  // Create flat form
  const [flatNameInput, setFlatNameInput] = useState('');
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');

  // Join flat form
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinError, setJoinError] = useState('');

  // Existing flatmates found by code
  const [existingFlatmates, setExistingFlatmates] = useState<Flatmate[]>([]);

  const handleCreateFlat = () => {
    if (!flatNameInput.trim()) {
      setCreateError('Group name is required');
      return;
    }
    if (!createName.trim()) {
      setCreateError('Your name is required');
      return;
    }
    createFlat(flatNameInput.trim(), createName.trim());
    router.replace('/(tabs)');
  };

  const handleValidateCode = () => {
    if (!joinCode.trim()) {
      setJoinError('Join code is required');
      return;
    }
    const flatmates = getFlatmatesByCode(joinCode.trim());
    if (!flatmates) {
      setJoinError('Invalid join code. Check with your flatmates.');
      return;
    }
    setExistingFlatmates(flatmates);
    setJoinError('');
    setView('joinChoose');
  };

  const handleClaimFlatmate = (flatmateId: string) => {
    const id = claimFlatmate(joinCode.trim(), flatmateId);
    if (!id) {
      setJoinError('Something went wrong. Try again.');
      setView('joinFlat');
      return;
    }
    router.replace('/(tabs)');
  };

  const handleJoinAsNew = () => {
    if (!joinName.trim()) {
      setJoinError('Your name is required');
      return;
    }
    const id = joinFlat(joinCode.trim(), joinName.trim());
    if (!id) {
      setJoinError('Invalid join code. Check with your flatmates.');
      return;
    }
    router.replace('/(tabs)');
  };

  const goBack = () => {
    if (view === 'joinChoose') {
      setView('joinFlat');
      setExistingFlatmates([]);
      setJoinError('');
      return;
    }
    setView('welcome');
    setFlatNameInput('');
    setCreateName('');
    setCreateError('');
    setJoinCode('');
    setJoinName('');
    setJoinError('');
    setExistingFlatmates([]);
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
              <Text className="text-2xl font-bold text-foreground mt-4">Create a Group</Text>
              <Text className="text-sm text-muted-foreground mt-1 text-center px-8">
                Name your group, then share the join code with your flatmates
              </Text>
            </View>

            {/* Form */}
            <View className="px-5 mt-2">
              <View className="bg-card border border-border rounded-2xl p-5">
                {/* Group name */}
                <Text className="text-sm font-medium text-muted-foreground mb-2">Group Name</Text>
                <TextInput
                  value={flatNameInput}
                  onChangeText={(t) => {
                    setFlatNameInput(t);
                    setCreateError('');
                  }}
                  placeholder="e.g. 42 Oak Street"
                  placeholderTextColor="hsl(150, 10%, 55%)"
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-4"
                  autoFocus
                  returnKeyType="next"
                />

                {/* Your name */}
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
                  returnKeyType="done"
                  onSubmitEditing={handleCreateFlat}
                />

                <Text className="text-xs text-muted-foreground mb-4">
                  A join code will be generated for your group. Share it with your flatmates so they can join.
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
                  disabled={!flatNameInput.trim() || !createName.trim()}
                  className={`rounded-2xl py-4 items-center ${
                    flatNameInput.trim() && createName.trim() ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      flatNameInput.trim() && createName.trim()
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Create Group
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Join Flat – Enter Code view ──
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
              <Text className="text-2xl font-bold text-foreground mt-4">Join a Group</Text>
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
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-2 text-center tracking-widest"
                  style={{ fontSize: 20, letterSpacing: 4 }}
                  autoFocus
                  autoCapitalize="characters"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleValidateCode}
                />

                <Text className="text-xs text-muted-foreground mb-4">
                  Ask your flatmate for the 6-character join code from their profile.
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

                {/* Continue button */}
                <Pressable
                  onPress={handleValidateCode}
                  disabled={!joinCode.trim()}
                  className={`rounded-2xl py-4 items-center ${
                    joinCode.trim() ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      joinCode.trim()
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Continue
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Join Flat – Choose: claim existing or join as new ──
  if (view === 'joinChoose') {
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
              <Text className="text-2xl font-bold text-foreground mt-4">Welcome!</Text>
              <Text className="text-sm text-muted-foreground mt-1 text-center px-8">
                Are you already in this group, or joining for the first time?
              </Text>
            </View>

            <View className="px-5 mt-2">
              {/* Existing flatmates section */}
              {existingFlatmates.length > 0 && (
                <View className="bg-card border border-border rounded-2xl p-5 mb-4">
                  <View className="flex-row items-center mb-3">
                    <View className="mr-2">
                      <Users size={18} color="hsl(152, 55%, 42%)" />
                    </View>
                    <Text className="text-base font-semibold text-foreground">
                      Log in as existing member
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground mb-4">
                    Already in this group on another device? Tap your name to log in.
                  </Text>

                  <View style={{ gap: 8 }}>
                    {existingFlatmates.map((fm) => (
                      <Pressable
                        key={fm.id}
                        onPress={() => handleClaimFlatmate(fm.id)}
                        className="flex-row items-center bg-background border border-border rounded-xl px-4 py-3 active:opacity-70"
                      >
                        <FlatmateAvatar flatmate={fm} size="sm" showName={false} />
                        <View className="ml-3 flex-1">
                          <Text className="text-base font-medium text-foreground">
                            {fm.name}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {fm.points} pts · {fm.streak} day streak
                          </Text>
                        </View>
                        <View>
                          <ChevronLeft
                            size={16}
                            color="hsl(150, 10%, 55%)"
                            style={{ transform: [{ rotate: '180deg' }] }}
                          />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Join as new member section */}
              <View className="bg-card border border-border rounded-2xl p-5">
                <View className="flex-row items-center mb-3">
                  <View className="mr-2">
                    <UserPlus size={18} color="hsl(152, 55%, 42%)" />
                  </View>
                  <Text className="text-base font-semibold text-foreground">
                    Join as new member
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground mb-3">
                  First time in this group? Enter your name to create your profile.
                </Text>

                <TextInput
                  value={joinName}
                  onChangeText={(t) => {
                    setJoinName(t);
                    setJoinError('');
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor="hsl(150, 10%, 55%)"
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-3"
                  returnKeyType="done"
                  onSubmitEditing={handleJoinAsNew}
                />

                {/* Error */}
                {joinError ? (
                  <View className="flex-row items-center mb-3">
                    <View className="mr-1">
                      <AlertCircle size={14} color="hsl(0, 72%, 55%)" />
                    </View>
                    <Text className="text-sm text-destructive">{joinError}</Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handleJoinAsNew}
                  disabled={!joinName.trim()}
                  className={`rounded-2xl py-4 items-center ${
                    joinName.trim() ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      joinName.trim()
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Join Group
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Welcome view ──
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
          {/* Create a group */}
          <Pressable
            onPress={() => setView('createFlat')}
            className="bg-primary rounded-2xl py-5 items-center active:opacity-80"
          >
            <View className="flex-row items-center">
              <View className="mr-2">
                <Home size={22} color="white" />
              </View>
              <Text className="text-lg font-semibold text-primary-foreground">Create a Group</Text>
            </View>
            <Text className="text-xs text-primary-foreground/70 mt-1">
              Start a new group and invite your flatmates
            </Text>
          </Pressable>

          {/* Join a group */}
          <Pressable
            onPress={() => setView('joinFlat')}
            className="bg-card border-2 border-primary rounded-2xl py-5 items-center active:opacity-80"
          >
            <View className="flex-row items-center">
              <View className="mr-2">
                <Hash size={22} color="hsl(152, 55%, 42%)" />
              </View>
              <Text className="text-lg font-semibold text-primary">Join a Group</Text>
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
