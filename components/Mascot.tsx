import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

type MascotMood = 'happy' | 'excited' | 'neutral' | 'sad' | 'sleeping';

interface MascotProps {
  mood: MascotMood;
  size?: 'sm' | 'md' | 'lg';
}

const MOOD_CONFIG: Record<MascotMood, { face: string; blush: boolean; message: string }> = {
  excited: {
    face: '★ ω ★',
    blush: true,
    message: 'All chores done! Amazing!',
  },
  happy: {
    face: '^ ω ^',
    blush: true,
    message: 'Great job, keep going!',
  },
  neutral: {
    face: '• ᴗ •',
    blush: false,
    message: 'Some chores left to do~',
  },
  sad: {
    face: '• ︵ •',
    blush: false,
    message: 'The flat needs some love...',
  },
  sleeping: {
    face: '- ᴗ -',
    blush: false,
    message: 'Add some chores to get started!',
  },
};

const SIZE_CONFIG = {
  sm: { body: 80, fontSize: 14, faceSize: 11, msgSize: 11 },
  md: { body: 120, fontSize: 20, faceSize: 14, msgSize: 13 },
  lg: { body: 160, fontSize: 28, faceSize: 18, msgSize: 15 },
};

export function Mascot({ mood, size = 'md' }: MascotProps) {
  const config = MOOD_CONFIG[mood];
  const sizeConfig = SIZE_CONFIG[size];

  const bounce = useSharedValue(0);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    if (mood === 'excited') {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        true,
      );
      wiggle.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 150 }),
          withTiming(3, { duration: 150 }),
        ),
        -1,
        true,
      );
    } else if (mood === 'happy') {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 500, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        true,
      );
      wiggle.value = 0;
    } else if (mood === 'sleeping') {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
      wiggle.value = 0;
    } else {
      bounce.value = withTiming(0);
      wiggle.value = withTiming(0);
    }
  }, [mood, bounce, wiggle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { rotate: `${wiggle.value}deg` },
    ],
  }));

  return (
    <View className="items-center">
      <Animated.View style={animatedStyle} className="items-center">
        {/* Frog body */}
        <View
          className="items-center justify-center rounded-full bg-primary/20"
          style={{
            width: sizeConfig.body,
            height: sizeConfig.body,
          }}
        >
          {/* Inner body */}
          <View
            className="items-center justify-center rounded-full bg-primary/30"
            style={{
              width: sizeConfig.body * 0.82,
              height: sizeConfig.body * 0.82,
            }}
          >
            {/* Eyes / ears (little bumps on top) */}
            <View
              className="absolute flex-row justify-between"
              style={{
                top: -sizeConfig.body * 0.08,
                width: sizeConfig.body * 0.55,
              }}
            >
              <View
                className="rounded-full bg-primary/40"
                style={{
                  width: sizeConfig.body * 0.2,
                  height: sizeConfig.body * 0.2,
                }}
              />
              <View
                className="rounded-full bg-primary/40"
                style={{
                  width: sizeConfig.body * 0.2,
                  height: sizeConfig.body * 0.2,
                }}
              />
            </View>

            {/* Face */}
            <Text
              className="text-foreground font-semibold"
              style={{ fontSize: sizeConfig.faceSize, letterSpacing: 1 }}
            >
              {config.face}
            </Text>

            {/* Blush marks */}
            {config.blush && (
              <View className="flex-row mt-0.5" style={{ gap: sizeConfig.body * 0.25 }}>
                <View
                  className="rounded-full"
                  style={{
                    width: sizeConfig.body * 0.1,
                    height: sizeConfig.body * 0.06,
                    backgroundColor: '#F4B8C1',
                    opacity: 0.7,
                  }}
                />
                <View
                  className="rounded-full"
                  style={{
                    width: sizeConfig.body * 0.1,
                    height: sizeConfig.body * 0.06,
                    backgroundColor: '#F4B8C1',
                    opacity: 0.7,
                  }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Little feet */}
        <View className="flex-row -mt-1" style={{ gap: sizeConfig.body * 0.15 }}>
          <View
            className="rounded-full bg-primary/25"
            style={{
              width: sizeConfig.body * 0.18,
              height: sizeConfig.body * 0.1,
            }}
          />
          <View
            className="rounded-full bg-primary/25"
            style={{
              width: sizeConfig.body * 0.18,
              height: sizeConfig.body * 0.1,
            }}
          />
        </View>
      </Animated.View>

      {/* Speech bubble */}
      <View className="mt-3 bg-card rounded-2xl px-4 py-2 border border-border">
        <Text
          className="text-center text-muted-foreground"
          style={{ fontSize: sizeConfig.msgSize }}
        >
          {config.message}
        </Text>
      </View>
    </View>
  );
}
