import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FRAME_SIZE } from '@/constants/scanner';

const ScanBeam = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * (FRAME_SIZE - 4) }],
  }));

  return (
    <Animated.View style={[beamStyle, { position: 'absolute', width: FRAME_SIZE - 20, height: 2, left: 10 }]}>
      <View style={{ flex: 1, backgroundColor: '#10B981', opacity: 0.9, borderRadius: 2 }} />
    </Animated.View>
  );
};


export default ScanBeam;