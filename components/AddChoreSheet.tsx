import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Repeat, CircleDot } from 'lucide-react-native';
import { useChoreStore, CHORE_ICONS, FREQUENCY_PRESETS } from '@/lib/store';
import type { ChoreType, FrequencyPreset } from '@/lib/store';

interface AddChoreSheetProps {
  visible: boolean;
  onClose: () => void;
}

const POINT_OPTIONS = [5, 10, 15, 20, 25];

export function AddChoreSheet({ visible, onClose }: AddChoreSheetProps) {
  const { flatmates, addChore } = useChoreStore();
  const [title, setTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [choreType, setChoreType] = useState<ChoreType>('recurring');
  const [frequencyPreset, setFrequencyPreset] = useState<FrequencyPreset>('weekly');
  const [customDays, setCustomDays] = useState('');
  const [useCustomDays, setUseCustomDays] = useState(false);
  const [points, setPoints] = useState(10);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

  const choreNames = Object.keys(CHORE_ICONS);

  const handleAdd = () => {
    const finalTitle = title || customTitle;
    if (!finalTitle.trim()) return;

    let frequencyDays: number | null = null;
    let frequencyLabel = 'One-off';

    if (choreType === 'recurring') {
      if (useCustomDays && customDays) {
        frequencyDays = parseInt(customDays, 10);
        frequencyLabel = frequencyDays === 1 ? 'Daily' : `Every ${frequencyDays} days`;
      } else {
        const preset = FREQUENCY_PRESETS[frequencyPreset];
        frequencyDays = preset.days;
        frequencyLabel = preset.label;
      }
    }

    addChore(finalTitle.trim(), choreType, frequencyDays, frequencyLabel, points, assignedTo);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setCustomTitle('');
    setChoreType('recurring');
    setFrequencyPreset('weekly');
    setCustomDays('');
    setUseCustomDays(false);
    setPoints(10);
    setAssignedTo(null);
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
          <View className="bg-background rounded-t-3xl border-t border-border px-5 pb-8 pt-4 max-h-[85%]">
            {/* Handle */}
            <View className="items-center mb-3">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-foreground">Add Chore</Text>
              <Pressable
                onPress={handleClose}
                className="w-8 h-8 rounded-full bg-muted items-center justify-center"
              >
                <View>
                  <X size={16} color="hsl(150, 10%, 45%)" />
                </View>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Quick pick chores */}
              <Text className="text-sm font-medium text-muted-foreground mb-2">Quick Pick</Text>
              <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                {choreNames.map((name) => (
                  <Pressable
                    key={name}
                    onPress={() => {
                      setTitle(name);
                      setCustomTitle('');
                    }}
                    className={`flex-row items-center rounded-xl px-3 py-2 border ${
                      title === name
                        ? 'bg-primary/15 border-primary'
                        : 'bg-card border-border'
                    }`}
                  >
                    <Text style={{ fontSize: 16 }} className="mr-1.5">
                      {CHORE_ICONS[name]}
                    </Text>
                    <Text
                      className={`text-sm ${
                        title === name ? 'text-primary font-semibold' : 'text-foreground'
                      }`}
                    >
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Custom name */}
              <Text className="text-sm font-medium text-muted-foreground mb-2">
                Or Custom Name
              </Text>
              <TextInput
                value={customTitle}
                onChangeText={(t) => {
                  setCustomTitle(t);
                  setTitle('');
                }}
                placeholder="e.g. Feed the cat"
                placeholderTextColor="hsl(150, 10%, 55%)"
                className="bg-input border border-border rounded-xl px-4 py-3 text-foreground text-base mb-4"
              />

              {/* Task type */}
              <Text className="text-sm font-medium text-muted-foreground mb-2">Task Type</Text>
              <View className="flex-row mb-4" style={{ gap: 8 }}>
                <Pressable
                  onPress={() => setChoreType('recurring')}
                  className={`flex-1 flex-row items-center justify-center rounded-xl py-3 border ${
                    choreType === 'recurring'
                      ? 'bg-primary/15 border-primary'
                      : 'bg-card border-border'
                  }`}
                >
                  <View className="mr-1.5">
                    <Repeat
                      size={16}
                      color={
                        choreType === 'recurring'
                          ? 'hsl(152, 55%, 42%)'
                          : 'hsl(150, 10%, 45%)'
                      }
                    />
                  </View>
                  <Text
                    className={`text-sm font-medium ${
                      choreType === 'recurring' ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    Recurring
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setChoreType('oneOff')}
                  className={`flex-1 flex-row items-center justify-center rounded-xl py-3 border ${
                    choreType === 'oneOff'
                      ? 'bg-primary/15 border-primary'
                      : 'bg-card border-border'
                  }`}
                >
                  <View className="mr-1.5">
                    <CircleDot
                      size={16}
                      color={
                        choreType === 'oneOff'
                          ? 'hsl(152, 55%, 42%)'
                          : 'hsl(150, 10%, 45%)'
                      }
                    />
                  </View>
                  <Text
                    className={`text-sm font-medium ${
                      choreType === 'oneOff' ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    One-off
                  </Text>
                </Pressable>
              </View>

              {/* Frequency (only for recurring) */}
              {choreType === 'recurring' && (
                <>
                  <Text className="text-sm font-medium text-muted-foreground mb-2">
                    Frequency
                  </Text>
                  <View className="flex-row flex-wrap mb-2" style={{ gap: 8 }}>
                    {(Object.keys(FREQUENCY_PRESETS) as FrequencyPreset[]).map((preset) => (
                      <Pressable
                        key={preset}
                        onPress={() => {
                          setFrequencyPreset(preset);
                          setUseCustomDays(false);
                        }}
                        className={`rounded-xl px-3 py-2 border ${
                          !useCustomDays && frequencyPreset === preset
                            ? 'bg-primary/15 border-primary'
                            : 'bg-card border-border'
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            !useCustomDays && frequencyPreset === preset
                              ? 'text-primary font-semibold'
                              : 'text-foreground'
                          }`}
                        >
                          {FREQUENCY_PRESETS[preset].label}
                        </Text>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => setUseCustomDays(true)}
                      className={`rounded-xl px-3 py-2 border ${
                        useCustomDays
                          ? 'bg-primary/15 border-primary'
                          : 'bg-card border-border'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          useCustomDays ? 'text-primary font-semibold' : 'text-foreground'
                        }`}
                      >
                        Custom
                      </Text>
                    </Pressable>
                  </View>

                  {useCustomDays && (
                    <View className="flex-row items-center mb-4" style={{ gap: 8 }}>
                      <Text className="text-sm text-muted-foreground">Every</Text>
                      <TextInput
                        value={customDays}
                        onChangeText={(t) => setCustomDays(t.replace(/[^0-9]/g, ''))}
                        placeholder="5"
                        placeholderTextColor="hsl(150, 10%, 55%)"
                        keyboardType="number-pad"
                        className="bg-input border border-border rounded-xl px-3 py-2 text-foreground text-base w-16 text-center"
                      />
                      <Text className="text-sm text-muted-foreground">days</Text>
                    </View>
                  )}

                  {!useCustomDays && <View className="mb-2" />}
                </>
              )}

              {/* Points */}
              <Text className="text-sm font-medium text-muted-foreground mb-2">Points</Text>
              <View className="flex-row mb-4" style={{ gap: 8 }}>
                {POINT_OPTIONS.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setPoints(p)}
                    className={`flex-1 rounded-xl py-2 items-center border ${
                      points === p
                        ? 'bg-primary/15 border-primary'
                        : 'bg-card border-border'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        points === p ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Assign to */}
              {flatmates.length > 0 && (
                <>
                  <Text className="text-sm font-medium text-muted-foreground mb-2">
                    Assign To
                  </Text>
                  <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                    <Pressable
                      onPress={() => setAssignedTo(null)}
                      className={`rounded-xl px-3 py-2 border ${
                        assignedTo === null
                          ? 'bg-primary/15 border-primary'
                          : 'bg-card border-border'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          assignedTo === null
                            ? 'text-primary font-semibold'
                            : 'text-foreground'
                        }`}
                      >
                        Unassigned
                      </Text>
                    </Pressable>
                    {flatmates.map((f) => (
                      <Pressable
                        key={f.id}
                        onPress={() => setAssignedTo(f.id)}
                        className={`flex-row items-center rounded-xl px-3 py-2 border ${
                          assignedTo === f.id
                            ? 'bg-primary/15 border-primary'
                            : 'bg-card border-border'
                        }`}
                      >
                        <Text style={{ fontSize: 14 }} className="mr-1">
                          {f.avatar}
                        </Text>
                        <Text
                          className={`text-sm ${
                            assignedTo === f.id
                              ? 'text-primary font-semibold'
                              : 'text-foreground'
                          }`}
                        >
                          {f.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {/* Add button */}
              <Pressable
                onPress={handleAdd}
                disabled={!title && !customTitle.trim()}
                className={`rounded-2xl py-4 items-center mt-2 ${
                  title || customTitle.trim() ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    title || customTitle.trim()
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  Add Chore
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
