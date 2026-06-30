import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type ResultType = 'success' | 'error' | 'idle';

interface ScanResultOverlayProps {
  type: ResultType;
  message: string;
  onHide?: () => void;
}

export const ScanResultOverlay = ({ type, message, onHide }: ScanResultOverlayProps) => {
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);

  const isVisible = type !== 'idle';

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(80, { duration: 300 }, (finished) => {
          if (finished && onHide) runOnJS(onHide)();
        });
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      translateY.value = 120;
      opacity.value = 0;
    }
  }, [type, message]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const isSuccess = type === 'success';

  return (
    <Animated.View
      style={[animStyle]}
      className="absolute bottom-10 left-5 right-5"
      pointerEvents="none"
    >
      <View
        className={`rounded-2xl px-5 py-4 flex-row items-center ${
          isSuccess ? 'bg-emerald-500' : 'bg-red-500'
        }`}
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 }}
      >
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
            isSuccess ? 'bg-emerald-400' : 'bg-red-400'
          }`}
        >
          <Ionicons
            name={isSuccess ? 'checkmark' : 'close'}
            size={22}
            color="white"
          />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-base">
            {isSuccess ? 'Check-In Successful' : 'Check-In Failed'}
          </Text>
          <Text className="text-white/80 text-sm mt-0.5" numberOfLines={2}>
            {message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};
