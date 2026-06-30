import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SLIDES, type Slide } from '../../features/onboarding/slides';
import { OnboardingSlide } from '../../features/onboarding/OnboardingSlide';
import { PaginationDots } from '../../features/onboarding/PaginationDots';

export const ONBOARDING_DONE_KEY = 'onboarding_done';

const OnboardingScreen = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const isLast = activeIndex === SLIDES.length - 1;
  const activeSlide = SLIDES[activeIndex];

  // ── Scroll → index mapping ────────────────────────────────
  // contentOffset.x increases by exactly `width` per slide page,
  // so rounding (offset / width) gives the integer slide index.
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const raw = e.nativeEvent.contentOffset.x / width;
      const clamped = Math.max(0, Math.min(Math.round(raw), SLIDES.length - 1));
      if (clamped !== activeIndex) setActiveIndex(clamped);
    },
    [width, activeIndex],
  );

  // ── Completion ────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    router.replace('/(auth)/login');
  }, [router]);

  const handleNext = useCallback(() => {
    if (isLast) {
      handleComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  }, [isLast, activeIndex, handleComplete]);

  // ── Button press animation (scale feedback) ───────────────
  const buttonScale = useSharedValue<number>(1);
  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Slide>) => (
      <OnboardingSlide
        slide={item}
        width={width}
        height={height}
        isActive={index === activeIndex}
      />
    ),
    [width, height, activeIndex],
  );

  return (
    <View style={{ flex: 1 }}>
      {/* ── Swipeable slides ── */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        // getItemLayout eliminates the need for a measurement pass on
        // scrollToIndex since all pages have an identical known width.
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* ── Skip button (top-right overlay) ── */}
      {/* Minimum touch area: padding + hitSlop together exceed 44 × 44 px */}
      <TouchableOpacity
        onPress={handleComplete}
        hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
        style={{
          position: 'absolute',
          top: insets.top + 14,
          right: 22,
          paddingHorizontal: 16,
          paddingVertical: 9,
          borderRadius: 999,
          backgroundColor: `${activeSlide.accent}14`,
          minHeight: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: activeSlide.accent,
            fontSize: 14,
            fontWeight: '600',
            letterSpacing: 0.2,
          }}
        >
          Skip
        </Text>
      </TouchableOpacity>

      {/* ── Bottom controls overlay ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 28,
          paddingBottom: Math.max(insets.bottom + 28, 40),
          paddingTop: 16,
          // Soft gradient-like separation without a hard background colour
          // so the slide bg blends through at the edge.
          pointerEvents: 'box-none',
        }}
      >
        {/* Pagination dots */}
        <PaginationDots
          total={SLIDES.length}
          activeIndex={activeIndex}
          accentColor={activeSlide.accent}
        />

        {/* Next / Get Started button */}
        <Animated.View style={[buttonAnimStyle, { marginTop: 22 }]}>
          <TouchableOpacity
            onPress={handleNext}
            onPressIn={() => {
              buttonScale.value = withSpring(0.96, { damping: 22, stiffness: 300 });
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1, { damping: 22, stiffness: 300 });
            }}
            activeOpacity={1}
            style={{
              backgroundColor: activeSlide.accent,
              borderRadius: 16,
              // Meets 44 px minimum; 56 px is large enough for older users
              height: 56,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: activeSlide.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.28,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '700',
                letterSpacing: 0.2,
                marginRight: 6,
              }}
            >
              {isLast ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={isLast ? 'arrow-forward-circle' : 'chevron-forward'}
              size={isLast ? 22 : 18}
              color="rgba(255,255,255,0.85)"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Slide counter — subtle, useful for accessibility */}
        <Text
          style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 12,
            color: `${activeSlide.accent}70`,
            letterSpacing: 0.5,
            fontWeight: '500',
          }}
        >
          {activeIndex + 1} of {SLIDES.length}
        </Text>
      </View>
    </View>
  );
}

export default OnboardingScreen;
