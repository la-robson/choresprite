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
import { LogIn, UserPlus, Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useChoreStore } from '@/lib/store';
import { Mascot } from '@/components/Mascot';
import { FlatmateAvatar } from '@/components/FlatmateAvatar';

export default function LoginScreen() {
  const router = useRouter();
  const { flatmates, addFlatmate, login, verifyPassword } = useChoreStore();

  // View state
  const [view, setView] = useState<'list' | 'login' | 'create'>('list');
  const [selectedFlatmate, setSelectedFlatmate] = useState<string | null>(null);

  // Login form
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Create form
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [createError, setCreateError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const selectedFlatmateObj = flatmates.find((f) => f.id === selectedFlatmate);

  const handleSelectFlatmate = (id: string) => {
    setSelectedFlatmate(id);
    setLoginPassword('');
    setLoginError('');
    setShowLoginPassword(false);
    setView('login');
  };

  const handleLogin = () => {
    if (!selectedFlatmate || !loginPassword) return;
    const valid = verifyPassword(selectedFlatmate, loginPassword);
    if (!valid) {
      setLoginError('Incorrect password');
      return;
    }
    login(selectedFlatmate);
    router.replace('/(tabs)');
  };

  const handleCreateAndLogin = () => {
    if (!newName.trim()) {
      setCreateError('Name is required');
      return;
    }
    if (newPassword.length < 4) {
      setCreateError('Password must be at least 4 characters');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setCreateError('Passwords do not match');
      return;
    }
    const id = addFlatmate(newName.trim(), newPassword);
    login(id);
    resetCreate();
    router.replace('/(tabs)');
  };

  const resetCreate = () => {
    setNewName('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setCreateError('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const goBack = () => {
    setView('list');
    setSelectedFlatmate(null);
    setLoginPassword('');
    setLoginError('');
    resetCreate();
  };

  // ── Login view (enter password for selected flatmate) ──
  if (view === 'login' && selectedFlatmateObj) {
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

            {/* Avatar */}
            <View className="items-center pt-8 pb-4">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: selectedFlatmateObj.color }}
              >
                <Text style={{ fontSize: 44 }}>{selectedFlatmateObj.avatar}</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground">
                {selectedFlatmateObj.name}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Enter your password to log in
              </Text>
            </View>

            {/* Password input */}
            <View className="px-5 mt-4">
              <View className="bg-card border border-border rounded-2xl p-5">
                <Text className="text-sm font-medium text-muted-foreground mb-2">Password</Text>
                <View className="flex-row items-center bg-input border border-border rounded-xl overflow-hidden">
                  <TextInput
                    value={loginPassword}
                    onChangeText={(t) => {
                      setLoginPassword(t);
                      setLoginError('');
                    }}
                    placeholder="Enter password"
                    placeholderTextColor="hsl(150, 10%, 55%)"
                    secureTextEntry={!showLoginPassword}
                    className="flex-1 px-4 py-3 text-foreground text-base"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    onPress={() => setShowLoginPassword(!showLoginPassword)}
                    className="px-3 py-3"
                  >
                    {showLoginPassword ? (
                      <EyeOff size={18} color="hsl(150, 10%, 55%)" />
                    ) : (
                      <Eye size={18} color="hsl(150, 10%, 55%)" />
                    )}
                  </Pressable>
                </View>

                {/* Error */}
                {loginError ? (
                  <View className="flex-row items-center mt-2">
                    <View className="mr-1">
                      <AlertCircle size={14} color="hsl(0, 72%, 55%)" />
                    </View>
                    <Text className="text-sm text-destructive">{loginError}</Text>
                  </View>
                ) : null}

                {/* Login button */}
                <Pressable
                  onPress={handleLogin}
                  disabled={!loginPassword}
                  className={`rounded-2xl py-4 items-center mt-4 ${
                    loginPassword ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      loginPassword ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    Log In
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Create view ──
  if (view === 'create') {
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
              <Text className="text-2xl font-bold text-foreground mt-4">Create Profile</Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Set up your account to get started
              </Text>
            </View>

            {/* Form */}
            <View className="px-5 mt-2">
              <View className="bg-card border border-border rounded-2xl p-5">
                {/* Name */}
                <Text className="text-sm font-medium text-muted-foreground mb-2">Name</Text>
                <TextInput
                  value={newName}
                  onChangeText={(t) => {
                    setNewName(t);
                    setCreateError('');
                  }}
                  placeholder="Your name"
                  placeholderTextColor="hsl(150, 10%, 55%)"
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-4"
                  autoFocus
                />

                {/* Password */}
                <Text className="text-sm font-medium text-muted-foreground mb-2">Password</Text>
                <View className="flex-row items-center bg-input border border-border rounded-xl overflow-hidden mb-4">
                  <TextInput
                    value={newPassword}
                    onChangeText={(t) => {
                      setNewPassword(t);
                      setCreateError('');
                    }}
                    placeholder="Choose a password"
                    placeholderTextColor="hsl(150, 10%, 55%)"
                    secureTextEntry={!showNewPassword}
                    className="flex-1 px-4 py-3 text-foreground text-base"
                  />
                  <Pressable
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    className="px-3 py-3"
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} color="hsl(150, 10%, 55%)" />
                    ) : (
                      <Eye size={18} color="hsl(150, 10%, 55%)" />
                    )}
                  </Pressable>
                </View>

                {/* Confirm password */}
                <Text className="text-sm font-medium text-muted-foreground mb-2">
                  Confirm Password
                </Text>
                <View className="flex-row items-center bg-input border border-border rounded-xl overflow-hidden mb-2">
                  <TextInput
                    value={newPasswordConfirm}
                    onChangeText={(t) => {
                      setNewPasswordConfirm(t);
                      setCreateError('');
                    }}
                    placeholder="Re-enter password"
                    placeholderTextColor="hsl(150, 10%, 55%)"
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1 px-4 py-3 text-foreground text-base"
                    returnKeyType="done"
                    onSubmitEditing={handleCreateAndLogin}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="px-3 py-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color="hsl(150, 10%, 55%)" />
                    ) : (
                      <Eye size={18} color="hsl(150, 10%, 55%)" />
                    )}
                  </Pressable>
                </View>

                <Text className="text-xs text-muted-foreground mb-4">
                  An avatar will be assigned automatically. You can change it later in your profile.
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

                {/* Buttons */}
                <Pressable
                  onPress={handleCreateAndLogin}
                  disabled={!newName.trim() || !newPassword}
                  className={`rounded-2xl py-4 items-center ${
                    newName.trim() && newPassword ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      newName.trim() && newPassword
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    Create & Log In
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── List view (select flatmate or create new) ──
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
        {flatmates.length > 0 && (
          <View className="px-5 mt-6">
            <View className="flex-row items-center">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-xs text-muted-foreground mx-3">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>
          </View>
        )}

        {/* Create new flatmate button */}
        <View className="px-5 mt-4">
          <Pressable
            onPress={() => setView('create')}
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
      </ScrollView>
    </SafeAreaView>
  );
}
