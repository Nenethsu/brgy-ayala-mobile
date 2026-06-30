import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

// ─── Layout constants ─────────────────────────────────────────────────────────
// Kept as JS constants (not Tailwind classes) because they're shared between
// layout AND the Reanimated interpolation math below — a single source of truth.

/** Full expanded header height. */
const HERO_H = 268;
/** Compact sticky bar height below safe-area inset. */
const BAR_BASE = 56;
/** Avatar diameters for each state. */
const AVATAR_LG = 74;
const AVATAR_SM = 34;

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <View className="flex-row items-center gap-3 py-3.5 border-b border-slate-100">
      <Ionicons name={icon} size={18} color="#64748B" />
      <View className="flex-1">
        <Text className="text-slate-400 text-[11px] font-semibold tracking-[0.4px]">
          {label.toUpperCase()}
        </Text>
        <Text className="text-slate-900 text-sm font-medium mt-0.5">{value}</Text>
      </View>
    </View>
  );
};

const DisabledField = ({ label, value }: { label: string; value?: string }) => (
  <View className="mb-3.5">
    <Text className="text-slate-500 text-[11px] font-bold tracking-[0.5px] uppercase mb-1.5">
      {label}
    </Text>
    <View className="bg-slate-100 rounded-[10px] px-3.5 py-[13px] border border-slate-200 flex-row items-center gap-2">
      <Text className="text-slate-400 text-sm font-medium flex-1">{value || '—'}</Text>
      <Ionicons name="lock-closed-outline" size={13} color="#CBD5E1" />
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const AccountScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const BAR_H = insets.top + BAR_BASE;
  const COLLAPSE = HERO_H - BAR_H;

  console.log(user)

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : 'Barangay Admin';

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'BA';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  // ── Animated styles (all UI-thread, no JS re-renders during scroll) ──────────
  // These stay as `style` — Reanimated computes them from a shared value at
  // runtime, so there's nothing for NativeWind to statically extract.

  const headerHeightStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, COLLAPSE], [HERO_H, BAR_H], Extrapolation.CLAMP),
  }));

  // Hero: fades out in the first 55 % of the collapse range + subtle upward drift
  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE * 0.55], [1, 0], Extrapolation.CLAMP),
    transform: [{
      translateY: interpolate(scrollY.value, [0, COLLAPSE], [0, -14], Extrapolation.CLAMP),
    }],
  }));

  // Compact bar: fades in during the last 60 % of the collapse range
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE * 0.4, COLLAPSE], [0, 1], Extrapolation.CLAMP),
  }));

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-navy-900">

      {/* ── Collapsing sticky header — absolutely pinned, never scrolls ─────── */}
      <Animated.View
        className="absolute top-0 left-0 right-0 z-10 bg-navy-900 overflow-hidden"
        style={headerHeightStyle}
      >
        {/* EXPANDED STATE — large centered avatar + name + email + role badge */}
        <Animated.View
          className="absolute bottom-[22px] left-0 right-0 items-center"
          style={heroStyle}
        >
          <View
            style={{ width: AVATAR_LG, height: AVATAR_LG, borderRadius: AVATAR_LG / 2 }}
            className="bg-[rgba(24,119,232,0.13)] border-2 border-[#1877E8] items-center justify-center mb-[13px]"
          >
            <Text className="text-[#3D9AEF] text-2xl font-bold">{initials}</Text>
          </View>

          <Text
            className="text-white text-lg font-bold text-center mb-1 px-8 leading-[26px]"
            numberOfLines={1}
          >
            {fullName}
          </Text>

          {user?.email ? (
            <Text className="text-[rgba(255,255,255,0.45)] text-xs mb-[11px]" numberOfLines={1}>
              {user.email}
            </Text>
          ) : (
            <View className="mb-[11px]" />
          )}

          {user?.accountType ? (
            <View className="bg-white/10 px-2.5 py-1 rounded-lg">
              <Text className="text-white text-[11px] font-semibold">{user.accountType}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* COLLAPSED STATE — name + role right-aligned, small avatar at right edge */}
        <Animated.View
          className="absolute left-5 right-3 flex-row items-center gap-[10px]"
          style={[{ top: insets.top, height: BAR_BASE }, compactStyle]}
        >
          <View className="flex-1 min-w-0 items-end">
            <Text className="text-white text-xs font-semibold leading-5" numberOfLines={1}>
              {fullName}
            </Text>
            {user?.accountType ? (
              <Text
                className="text-white/50 text-[11px] tracking-[0.3px] mt-px"
                numberOfLines={1}
              >
                {user.accountType}
              </Text>
            ) : null}
          </View>

          <View
            style={{
              width: AVATAR_SM + 4,
              height: AVATAR_SM + 4,
              borderRadius: (AVATAR_SM + 4) / 2,
            }}
            className="bg-[rgba(24,119,232,0.18)] border-[1.5px] border-[#1877E8] items-center justify-center shrink-0"
          >
            <Text className="text-[#3D9AEF] text-xs font-bold">{initials}</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces
        className="bg-[#F8FAFC]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/*
          Spacer = HERO_H so the first real content sits below the expanded header.
          When scrollY === COLLAPSE the spacer has (HERO_H − COLLAPSE = BAR_H) px
          remaining on-screen, exactly matching the now-collapsed header height.
        */}
        <View style={{ height: HERO_H }} />

        {/* Content surface — rounded top overlaps the hero bottom */}
        <View className="bg-[#F8FAFC] rounded-t-3xl -mt-6 overflow-hidden pt-4">

          {/* Account Information */}
          <View className="px-5 pt-5 pb-1">
            <Text className="text-slate-500 text-xs font-bold tracking-[0.4px] mb-1">
              ACCOUNT INFORMATION
            </Text>
            <InfoRow icon="call-outline" label="Contact Number" value={user?.contactNumber} />
            <InfoRow icon="mail-outline" label="Email" value={user?.email} />
            <InfoRow icon="card-outline" label="Account ID" value={user?.accountId} />
            <InfoRow icon="business-outline" label="Barangay" value={user?.brgyDesc} />
            <InfoRow icon="location-outline" label="City" value={user?.cityDesc} />
            <InfoRow icon="map-outline" label="Province" value={user?.provinceDesc} />
            <InfoRow icon="globe-outline" label="Region" value={user?.regionDesc} />
          </View>

          {/* Sign out */}
          <View className="px-5 pt-16">
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              className="flex-row items-center gap-3 bg-white rounded-[14px] p-4 border border-red-100"
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 text-sm font-semibold flex-1">Sign Out</Text>
              <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

export default AccountScreen;
