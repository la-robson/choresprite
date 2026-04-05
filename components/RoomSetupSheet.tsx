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
import { X, Plus, Check, Trash2, ChevronRight } from 'lucide-react-native';
import {
  useChoreStore,
  ROOM_TYPE_META,
  ROOM_TASK_SUGGESTIONS,
} from '@/lib/store';
import type { RoomType } from '@/lib/store';

interface RoomSetupSheetProps {
  visible: boolean;
  onClose: () => void;
}

type SetupStep = 'rooms' | 'tasks';

const ROOM_TYPES = Object.keys(ROOM_TYPE_META) as RoomType[];

interface PendingRoom {
  name: string;
  type: RoomType;
  selectedTasks: Set<number>;
}

export function RoomSetupSheet({ visible, onClose }: RoomSetupSheetProps) {
  const { addRoom, addSuggestedTasks, rooms } = useChoreStore();
  const [step, setStep] = useState<SetupStep>('rooms');
  const [pendingRooms, setPendingRooms] = useState<PendingRoom[]>([]);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);

  const resetForm = () => {
    setPendingRooms([]);
    setStep('rooms');
    setEditingRoomIndex(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddRoomType = (type: RoomType) => {
    const meta = ROOM_TYPE_META[type];
    // Auto-number if same type already exists
    const existingCount = [
      ...rooms.filter((r) => r.type === type),
      ...pendingRooms.filter((r) => r.type === type),
    ].length;
    const name =
      existingCount > 0
        ? `${meta.defaultName} ${existingCount + 1}`
        : meta.defaultName;

    const suggestions = ROOM_TASK_SUGGESTIONS[type];
    // Select all tasks by default
    const allSelected = new Set<number>(suggestions.map((_, i) => i));

    setPendingRooms([...pendingRooms, { name, type, selectedTasks: allSelected }]);
  };

  const handleRemovePendingRoom = (index: number) => {
    setPendingRooms(pendingRooms.filter((_, i) => i !== index));
  };

  const handleToggleTask = (roomIndex: number, taskIndex: number) => {
    setPendingRooms(
      pendingRooms.map((room, i) => {
        if (i !== roomIndex) return room;
        const newSet = new Set(room.selectedTasks);
        if (newSet.has(taskIndex)) {
          newSet.delete(taskIndex);
        } else {
          newSet.add(taskIndex);
        }
        return { ...room, selectedTasks: newSet };
      }),
    );
  };

  const handleSelectAllTasks = (roomIndex: number) => {
    setPendingRooms(
      pendingRooms.map((room, i) => {
        if (i !== roomIndex) return room;
        const suggestions = ROOM_TASK_SUGGESTIONS[room.type];
        const allSelected = suggestions.length === room.selectedTasks.size;
        return {
          ...room,
          selectedTasks: allSelected
            ? new Set<number>()
            : new Set<number>(suggestions.map((_, idx) => idx)),
        };
      }),
    );
  };

  const handleUpdateRoomName = (index: number, name: string) => {
    setPendingRooms(
      pendingRooms.map((room, i) => (i === index ? { ...room, name } : room)),
    );
  };

  const handleContinueToTasks = () => {
    if (pendingRooms.length === 0) return;
    setStep('tasks');
    setEditingRoomIndex(0);
  };

  const handleFinish = () => {
    // Create all rooms and their selected tasks
    for (const room of pendingRooms) {
      const roomId = addRoom(room.name, room.type);
      const suggestions = ROOM_TASK_SUGGESTIONS[room.type];
      const selectedTasks = suggestions.filter((_, i) => room.selectedTasks.has(i));
      if (selectedTasks.length > 0) {
        addSuggestedTasks(roomId, selectedTasks);
      }
    }
    handleClose();
  };

  const totalSelectedTasks = pendingRooms.reduce(
    (sum, r) => sum + r.selectedTasks.size,
    0,
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end">
          <Pressable className="flex-1" onPress={handleClose} />
          <View className="bg-background rounded-t-3xl border-t border-border px-5 pb-8 pt-4 max-h-[90%]">
            {/* Handle */}
            <View className="items-center mb-3">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">
                  {step === 'rooms' ? 'Set Up Rooms' : 'Review Tasks'}
                </Text>
                <Text className="text-sm text-muted-foreground mt-0.5">
                  {step === 'rooms'
                    ? 'Add the rooms in your apartment'
                    : 'Choose which tasks to add for each room'}
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                className="w-8 h-8 rounded-full bg-muted items-center justify-center"
              >
                <View>
                  <X size={16} color="hsl(150, 10%, 45%)" />
                </View>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {step === 'rooms' && (
                <>
                  {/* Room type picker */}
                  <Text className="text-sm font-medium text-muted-foreground mb-2">
                    Tap to add a room
                  </Text>
                  <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
                    {ROOM_TYPES.map((type) => {
                      const meta = ROOM_TYPE_META[type];
                      return (
                        <Pressable
                          key={type}
                          onPress={() => handleAddRoomType(type)}
                          className="flex-row items-center rounded-xl px-3 py-2.5 border bg-card border-border"
                        >
                          <Text style={{ fontSize: 18 }} className="mr-2">
                            {meta.icon}
                          </Text>
                          <Text className="text-sm font-medium text-foreground">
                            {meta.label}
                          </Text>
                          <View className="ml-2">
                            <Plus size={14} color="hsl(152, 55%, 42%)" />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Added rooms list */}
                  {pendingRooms.length > 0 && (
                    <>
                      <Text className="text-sm font-medium text-muted-foreground mb-2">
                        Your Rooms ({pendingRooms.length})
                      </Text>
                      {pendingRooms.map((room, index) => {
                        const meta = ROOM_TYPE_META[room.type];
                        const suggestions = ROOM_TASK_SUGGESTIONS[room.type];
                        return (
                          <View
                            key={index}
                            className="flex-row items-center rounded-xl border border-border bg-card p-3 mb-2"
                          >
                            <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center mr-3">
                              <Text style={{ fontSize: 20 }}>{meta.icon}</Text>
                            </View>
                            <View className="flex-1 mr-2">
                              <TextInput
                                value={room.name}
                                onChangeText={(t) =>
                                  handleUpdateRoomName(index, t)
                                }
                                className="text-base font-semibold text-foreground p-0"
                                placeholder="Room name"
                                placeholderTextColor="hsl(150, 10%, 55%)"
                              />
                              <Text className="text-xs text-muted-foreground mt-0.5">
                                {suggestions.length} suggested task
                                {suggestions.length !== 1 ? 's' : ''}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => handleRemovePendingRoom(index)}
                              className="w-8 h-8 rounded-lg bg-destructive/10 items-center justify-center"
                            >
                              <View>
                                <Trash2 size={14} color="hsl(0, 72%, 55%)" />
                              </View>
                            </Pressable>
                          </View>
                        );
                      })}
                    </>
                  )}

                  {/* Continue button */}
                  <Pressable
                    onPress={handleContinueToTasks}
                    disabled={pendingRooms.length === 0}
                    className={`rounded-2xl py-4 items-center mt-4 flex-row justify-center ${
                      pendingRooms.length > 0 ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <Text
                      className={`text-base font-semibold mr-1 ${
                        pendingRooms.length > 0
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Review Tasks
                    </Text>
                    <View>
                      <ChevronRight
                        size={18}
                        color={
                          pendingRooms.length > 0 ? 'white' : 'hsl(150, 10%, 55%)'
                        }
                      />
                    </View>
                  </Pressable>
                </>
              )}

              {step === 'tasks' && (
                <>
                  {/* Room tabs */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-4"
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {pendingRooms.map((room, index) => {
                      const meta = ROOM_TYPE_META[room.type];
                      const isActive = editingRoomIndex === index;
                      return (
                        <Pressable
                          key={index}
                          onPress={() => setEditingRoomIndex(index)}
                          className={`flex-row items-center rounded-xl px-3 py-2 border ${
                            isActive
                              ? 'bg-primary/15 border-primary'
                              : 'bg-card border-border'
                          }`}
                        >
                          <Text style={{ fontSize: 14 }} className="mr-1.5">
                            {meta.icon}
                          </Text>
                          <Text
                            className={`text-sm font-medium ${
                              isActive ? 'text-primary' : 'text-foreground'
                            }`}
                          >
                            {room.name}
                          </Text>
                          {room.selectedTasks.size > 0 && (
                            <View className="ml-1.5 bg-primary rounded-full w-5 h-5 items-center justify-center">
                              <Text className="text-xs text-primary-foreground font-bold">
                                {room.selectedTasks.size}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* Task list for selected room */}
                  {editingRoomIndex !== null &&
                    pendingRooms[editingRoomIndex] && (
                      <>
                        <View className="flex-row items-center justify-between mb-3">
                          <Text className="text-sm font-medium text-muted-foreground">
                            Tasks for {pendingRooms[editingRoomIndex].name}
                          </Text>
                          <Pressable
                            onPress={() =>
                              handleSelectAllTasks(editingRoomIndex)
                            }
                          >
                            <Text className="text-sm font-medium text-primary">
                              {pendingRooms[editingRoomIndex].selectedTasks
                                .size ===
                              ROOM_TASK_SUGGESTIONS[
                                pendingRooms[editingRoomIndex].type
                              ].length
                                ? 'Deselect All'
                                : 'Select All'}
                            </Text>
                          </Pressable>
                        </View>

                        {ROOM_TASK_SUGGESTIONS[
                          pendingRooms[editingRoomIndex].type
                        ].map((task, taskIndex) => {
                          const isSelected =
                            pendingRooms[editingRoomIndex].selectedTasks.has(
                              taskIndex,
                            );
                          return (
                            <Pressable
                              key={taskIndex}
                              onPress={() =>
                                handleToggleTask(editingRoomIndex, taskIndex)
                              }
                              className={`flex-row items-center rounded-xl border p-3 mb-2 ${
                                isSelected
                                  ? 'bg-primary/10 border-primary/40'
                                  : 'bg-card border-border'
                              }`}
                            >
                              <View
                                className={`w-6 h-6 rounded-lg items-center justify-center mr-3 ${
                                  isSelected
                                    ? 'bg-primary'
                                    : 'bg-muted border border-border'
                                }`}
                              >
                                {isSelected && (
                                  <View>
                                    <Check size={14} color="white" />
                                  </View>
                                )}
                              </View>
                              <Text
                                style={{ fontSize: 18 }}
                                className="mr-2"
                              >
                                {task.icon}
                              </Text>
                              <View className="flex-1">
                                <Text
                                  className={`text-sm font-medium ${
                                    isSelected
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {task.title}
                                </Text>
                                <View
                                  className="flex-row items-center mt-0.5"
                                  style={{ gap: 6 }}
                                >
                                  <Text className="text-xs text-muted-foreground">
                                    {task.frequencyLabel}
                                  </Text>
                                  <Text className="text-xs text-accent-foreground font-medium">
                                    +{task.points} pts
                                  </Text>
                                </View>
                              </View>
                            </Pressable>
                          );
                        })}
                      </>
                    )}

                  {/* Back + Finish buttons */}
                  <View className="flex-row mt-4" style={{ gap: 12 }}>
                    <Pressable
                      onPress={() => setStep('rooms')}
                      className="flex-1 rounded-2xl py-4 items-center bg-muted"
                    >
                      <Text className="text-base font-semibold text-foreground">
                        Back
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleFinish}
                      className="flex-1 rounded-2xl py-4 items-center bg-primary"
                    >
                      <Text className="text-base font-semibold text-primary-foreground">
                        Add {totalSelectedTasks} Task
                        {totalSelectedTasks !== 1 ? 's' : ''}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
