import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { Slide, SlideId } from './slides';

// ─────────────────────────────────────────────────────────────
// Shared illustration prop contract
// ─────────────────────────────────────────────────────────────
interface IllustrationProps {
  accent: string;
  accentLight: string;
  /** When true the illustration's idle animations run; halted otherwise */
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────
// Slide 0 — Splash / Brand intro
// DigiBarangay logo centred with soft halo rings
// ─────────────────────────────────────────────────────────────
const SplashIllustration = ({ accent, accentLight, isActive }: IllustrationProps) => {
  const scale = useSharedValue<number>(0.82);
  const opacity = useSharedValue<number>(0);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1, { damping: 18, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.quad) });
    } else {
      cancelAnimation(scale);
      scale.value = 0.82;
      opacity.value = 0;
    }
  }, [isActive]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer halo */}
      <View
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: accentLight,
          opacity: 0.14,
        }}
      />
      {/* Inner halo */}
      <View
        style={{
          position: 'absolute',
          width: 210,
          height: 210,
          borderRadius: 105,
          backgroundColor: accentLight,
          opacity: 0.20,
        }}
      />
      {/* Ghost ring */}
      <View
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: 160,
          borderWidth: 1,
          borderColor: accentLight,
          opacity: 0.22,
        }}
      />
      {/* Logo — wrapped in Animated.View for spring entrance */}
      <Animated.View style={[logoStyle, { alignItems: 'center' }]}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 200, height: 120 }}
          resizeMode="contain"
        />
      </Animated.View>
      {/* Accent dot top-right */}
      <View
        style={{
          position: 'absolute',
          top: '14%',
          right: '18%',
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: accent,
          opacity: 0.35,
        }}
      />
      {/* Small accent dot bottom-left */}
      <View
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '16%',
          width: 9,
          height: 9,
          borderRadius: 5,
          backgroundColor: accentLight,
          opacity: 0.6,
        }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Slide 1 — Community / Home
// Layered halo rings + pulsing main circle + scattered accent dots
// ─────────────────────────────────────────────────────────────
const CommunityIllustration = ({ accent, accentLight, isActive }: IllustrationProps) => {
  const scale = useSharedValue<number>(1);

  useEffect(() => {
    if (isActive) {
      // Slow breathing pulse so the illustration feels alive without being distracting
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 350 });
    }
  }, [isActive]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer faint halo */}
      <View
        style={{
          position: 'absolute',
          width: 236,
          height: 236,
          borderRadius: 118,
          backgroundColor: accentLight,
          opacity: 0.22,
        }}
      />
      {/* Secondary halo — slightly off-centre for depth */}
      <View
        style={{
          position: 'absolute',
          width: 186,
          height: 186,
          borderRadius: 93,
          backgroundColor: accentLight,
          opacity: 0.3,
          top: '16%',
          left: '22%',
        }}
      />
      {/* Ghost ring (border only) */}
      <View
        style={{
          position: 'absolute',
          width: 272,
          height: 272,
          borderRadius: 136,
          borderWidth: 1,
          borderColor: accentLight,
          opacity: 0.28,
        }}
      />
      {/* Main pulsing circle */}
      <Animated.View
        style={[
          circleStyle,
          {
            width: 144,
            height: 144,
            borderRadius: 72,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: accent,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.38,
            shadowRadius: 22,
            elevation: 12,
          },
        ]}
      >
        <Ionicons name="home" size={60} color="white" />
      </Animated.View>
      {/* Warm amber accent dot */}
      <View
        style={{
          position: 'absolute',
          top: '13%',
          right: '19%',
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#D97706',
        }}
      />
      {/* Small accent-light dot */}
      <View
        style={{
          position: 'absolute',
          bottom: '24%',
          left: '15%',
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: accentLight,
          opacity: 0.8,
        }}
      />
      {/* Tiny amber echo */}
      <View
        style={{
          position: 'absolute',
          bottom: '18%',
          right: '16%',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#D97706',
          opacity: 0.45,
        }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Slide 2 — Events / QR Check-In
// Scan-frame corners + animated beam + success badge
// ─────────────────────────────────────────────────────────────
const EventsIllustration = ({ accent, accentLight, isActive }: IllustrationProps) => {
  const frameScale = useSharedValue<number>(1);
  const beamY = useSharedValue<number>(0);

  useEffect(() => {
    if (isActive) {
      frameScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
      // Scan beam sweeps top-to-bottom inside the frame clip region
      beamY.value = withRepeat(
        withSequence(
          withTiming(104, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(frameScale);
      cancelAnimation(beamY);
      frameScale.value = withTiming(1, { duration: 350 });
      beamY.value = 0;
    }
  }, [isActive]);

  const frameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: frameScale.value }],
  }));
  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: beamY.value }],
  }));

  const FRAME = 152;
  const B = 24; // bracket arm length
  const T = 3;  // bracket thickness

  type CornerPos = 'tl' | 'tr' | 'bl' | 'br';

  const cornerStyle = (pos: CornerPos) => ({
    position: 'absolute' as const,
    width: B,
    height: B,
    borderColor: accent,
    ...(pos === 'tl' && { top: 0, left: 0, borderTopWidth: T, borderLeftWidth: T, borderTopLeftRadius: 6 }),
    ...(pos === 'tr' && { top: 0, right: 0, borderTopWidth: T, borderRightWidth: T, borderTopRightRadius: 6 }),
    ...(pos === 'bl' && { bottom: 0, left: 0, borderBottomWidth: T, borderLeftWidth: T, borderBottomLeftRadius: 6 }),
    ...(pos === 'br' && { bottom: 0, right: 0, borderBottomWidth: T, borderRightWidth: T, borderBottomRightRadius: 6 }),
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background halo */}
      <View
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: accentLight,
          opacity: 0.2,
        }}
      />
      {/* Scan frame */}
      <Animated.View style={[frameStyle, { width: FRAME, height: FRAME, position: 'relative' }]}>
        {/* Corner brackets — four separate Views, one per corner */}
        {(['tl', 'tr', 'bl', 'br'] as CornerPos[]).map((pos) => (
          <View key={pos} style={cornerStyle(pos)} />
        ))}
        {/* Clipped inner region where the beam travels */}
        <View
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            right: 14,
            bottom: 14,
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: `${accentLight}28`,
          }}
        >
          <Animated.View
            style={[
              beamStyle,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: accent,
                opacity: 0.65,
                borderRadius: 1,
              },
            ]}
          />
        </View>
        {/* QR code icon centred inside frame */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="qr-code" size={68} color={accent} />
        </View>
      </Animated.View>

      {/* Success check badge */}
      <View
        style={{
          position: 'absolute',
          bottom: '22%',
          right: '17%',
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#10B981',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Ionicons name="checkmark" size={24} color="white" />
      </View>

      {/* Small halo dot top-left */}
      <View
        style={{
          position: 'absolute',
          top: '15%',
          left: '19%',
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: accentLight,
          opacity: 0.55,
        }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Slide 3 — Records / Documents
// Two rotated document cards behind a pulsing shield circle
// ─────────────────────────────────────────────────────────────
const RecordsIllustration = ({ accent, accentLight, isActive }: IllustrationProps) => {
  const scale = useSharedValue<number>(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 350 });
    }
  }, [isActive]);

  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // A simplified document card: white rectangle with line stubs representing text
  const DocCard = ({
    rotation,
    tx,
    ty,
  }: {
    rotation: number;
    tx: number;
    ty: number;
  }) => (
    <View
      style={{
        position: 'absolute',
        width: 88,
        height: 114,
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: `${accentLight}CC`,
        transform: [{ rotate: `${rotation}deg` }, { translateX: tx }, { translateY: ty }],
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.09,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Simulated text lines */}
      {[55, 80, 70, 45].map((widthPct, i) => (
        <View
          key={i}
          style={{
            height: 5,
            borderRadius: 3,
            backgroundColor: accentLight,
            marginBottom: 9,
            width: `${widthPct}%`,
            opacity: 0.75,
          }}
        />
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background halo */}
      <View
        style={{
          position: 'absolute',
          width: 224,
          height: 224,
          borderRadius: 112,
          backgroundColor: accentLight,
          opacity: 0.18,
        }}
      />
      {/* Document cards — rendered before shield so shield sits on top */}
      <DocCard rotation={-11} tx={-44} ty={8} />
      <DocCard rotation={9} tx={44} ty={8} />
      {/* Main shield circle */}
      <Animated.View
        style={[
          shieldStyle,
          {
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: accent,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.38,
            shadowRadius: 22,
            elevation: 12,
            zIndex: 2,
          },
        ]}
      >
        <Ionicons name="shield-checkmark" size={58} color="white" />
      </Animated.View>
      {/* Amber accent dot */}
      <View
        style={{
          position: 'absolute',
          top: '12%',
          right: '21%',
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: '#D97706',
        }}
      />
      {/* Small echo */}
      <View
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '17%',
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: accentLight,
          opacity: 0.7,
        }}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Illustration factory — maps slide id → component
// ─────────────────────────────────────────────────────────────
const ILLUSTRATIONS: Record<SlideId, React.ComponentType<IllustrationProps>> = {
  splash: SplashIllustration,
  community: CommunityIllustration,
  events: EventsIllustration,
  records: RecordsIllustration,
};

// ─────────────────────────────────────────────────────────────
// OnboardingSlide
// ─────────────────────────────────────────────────────────────
interface OnboardingSlideProps {
  slide: Slide;
  /** Screen width from useWindowDimensions — used to size each FlatList page */
  width: number;
  /** Screen height from useWindowDimensions */
  height: number;
  /** Drives text enter animation and illustration idle animations */
  isActive: boolean;
}

export const OnboardingSlide = ({ slide, width, height, isActive }: OnboardingSlideProps) => {
  // Cap illustration area so text doesn't get squeezed on very tall phones
  const illustrationHeight = Math.min(height * 0.50, 340);

  // Text block fades + rises when the slide becomes active;
  // resets instantly when leaving so the next entry feels fresh.
  const textOpacity = useSharedValue<number>(0);
  const textTranslateY = useSharedValue<number>(30);

  useEffect(() => {
    if (isActive) {
      textOpacity.value = withDelay(180, withTiming(1, { duration: 500 }));
      textTranslateY.value = withDelay(180, withSpring(0, { damping: 22, stiffness: 110 }));
    } else {
      textOpacity.value = withTiming(0, { duration: 160 });
      textTranslateY.value = 30;
    }
  }, [isActive]);

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const Illustration = ILLUSTRATIONS[slide.id];

  return (
    <View style={{ width, height, backgroundColor: slide.bg }}>
      {/* ── Illustration area ── */}
      <View style={{ height: illustrationHeight }}>
        <Illustration accent={slide.accent} accentLight={slide.accentLight} isActive={isActive} />
      </View>

      {/* ── Text area ── */}
      <Animated.View
        style={[
          textAnimStyle,
          {
            flex: 1,
            paddingHorizontal: 32,
            paddingTop: 4,
            // Reserve space for the absolutely-positioned bottom controls overlay
            paddingBottom: 156,
          },
        ]}
      >
        {/* Tag pill — uppercase label, very tight tracking for a typographic stamp feel */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: `${slide.accent}16`,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: slide.accent,
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 2.8,
              textTransform: 'uppercase',
            }}
          >
            {slide.tag}
          </Text>
        </View>

        {/* Headline — heavy weight, tight leading for authority */}
        <Text
          style={{
            color: '#18261F',
            fontSize: 30,
            fontWeight: '800',
            lineHeight: 38,
            letterSpacing: -0.4,
            marginBottom: 14,
          }}
        >
          {slide.headline}
        </Text>

        {/* Body — comfortable reading size for mixed-age audience */}
        <Text
          style={{
            color: '#527063',
            fontSize: 16,
            lineHeight: 26,
            fontWeight: '400',
          }}
        >
          {slide.subtext}
        </Text>
      </Animated.View>
    </View>
  );
};
