import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface PaginationDotsProps {
  total: number;
  activeIndex: number;
  /** Hex colour for the active (expanded) dot */
  accentColor: string;
}

interface AnimatedDotProps {
  isActive: boolean;
  color: string;
}

// Each dot animates its own width between 8 (inactive) and 24 (active) px
// using a spring so the transition feels physically weighted.
const AnimatedDot = ({ isActive, color }: AnimatedDotProps) => {
  const width = useSharedValue<number>(isActive ? 24 : 8);
  const opacity = useSharedValue<number>(isActive ? 1 : 0.32);

  useEffect(() => {
    width.value = withSpring(isActive ? 24 : 8, { damping: 18, stiffness: 220 });
    opacity.value = withSpring(isActive ? 1 : 0.32, { damping: 18, stiffness: 220 });
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animStyle,
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          marginHorizontal: 4,
        },
      ]}
    />
  );
};

export const PaginationDots = ({ total, activeIndex, accentColor }: PaginationDotsProps) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <AnimatedDot key={i} isActive={i === activeIndex} color={accentColor} />
    ))}
  </View>
);
