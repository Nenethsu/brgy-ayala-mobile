import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetEvents, useGetEventAttendees } from '../../../lib/hooks/useEvents';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  getEventStatus,
  formatEventSchedule,
  getEventCategory,
  getFullName,
} from '../../../features/events/eventHelpers';
import type { EventAttendee } from '../../../types/event';

// ─── Layout constants ─────────────────────────────────────────────────────────
// Kept as JS constants because they're shared between layout AND the Reanimated
// interpolation math — a single source of truth.

/** Full expanded header height. Shorter than citizen screen (no avatar). */
const HERO_H = 210;
/** Compact sticky bar height below the safe-area inset. */
const BAR_BASE = 56;

// ─── Attendee row ─────────────────────────────────────────────────────────────

const AttendeeRow = ({ attendee, index }: { attendee: EventAttendee; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 40).duration(300)}
    className="flex-row items-center py-3.5 border-b border-slate-50"
  >
    <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
      <Text className="text-slate-500 text-xs font-bold">{index + 1}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-slate-800 text-sm font-medium">{getFullName(attendee)}</Text>
      <Text className="text-slate-400 text-xs font-mono">{attendee.citizenId}</Text>
    </View>
    <View>
      {attendee.isAttended === 1 ? (
        <View className="flex-row items-center bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
          <Text className="text-emerald-700 text-xs font-semibold ml-1">Checked In</Text>
        </View>
      ) : (
        <View className="flex-row items-center bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          <Ionicons name="time-outline" size={12} color="#94A3B8" />
          <Text className="text-slate-400 text-xs font-semibold ml-1">Registered</Text>
        </View>
      )}
    </View>
  </Animated.View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const EventDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: events = [], isLoading: eventsLoading } = useGetEvents();
  const event = useMemo(() => events.find((e) => (e.eventId ?? e.id) === id), [events, id]);
  const { data: attendees = [], isLoading: attendeesLoading } = useGetEventAttendees(id ?? null);

  const BAR_H = insets.top + BAR_BASE;
  const COLLAPSE = HERO_H - BAR_H;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const checkedIn = attendees.filter((a) => a.isAttended === 1).length;
  const slotUsed = event ? event.totalSlot - event.remSlot : 0;

  // ── Animated styles (all UI-thread, no JS re-renders during scroll) ────────
  // These stay as `style` — Reanimated computes them from a shared value at
  // runtime, so there's nothing for NativeWind to statically extract.

  const headerHeightStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, COLLAPSE], [HERO_H, BAR_H], Extrapolation.CLAMP),
  }));

  // Hero: fades out in the first 55% of the collapse range + subtle upward drift
  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE * 0.55], [1, 0], Extrapolation.CLAMP),
    transform: [{
      translateY: interpolate(scrollY.value, [0, COLLAPSE], [0, -14], Extrapolation.CLAMP),
    }],
  }));

  // Compact bar: fades in during the last 60% of the collapse range
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE * 0.4, COLLAPSE], [0, 1], Extrapolation.CLAMP),
  }));

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (eventsLoading) return <LoadingState message="Loading event…" />;
  if (!event)
    return (
      <EmptyState
        icon="calendar-outline"
        title="Event not found"
        subtitle="This event could not be found."
      />
    );

  const formattedDate = formatEventSchedule(event);
  const status = getEventStatus(event);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-[#0D2B5E]">

      {/* ── Collapsing sticky header — absolutely pinned, never scrolls ─────── */}
      <Animated.View
        className="absolute top-0 left-0 right-0 z-10 bg-[#0D2B5E] overflow-hidden"
        style={headerHeightStyle}
      >
        {/* Back button — always visible at top-left, min 44 px tap target */}
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
          className="absolute left-2 z-20 flex-row items-center min-h-[44px] px-2"
          style={{ top: insets.top + 7 }}
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>

        {/* EXPANDED STATE — event name + date centered at the hero bottom */}
        <Animated.View
          className="absolute bottom-[22px] left-0 right-0 items-center px-12"
          style={heroStyle}
        >
          <Text
            className="text-white text-lg font-bold text-center mb-2 leading-[26px]"
            numberOfLines={2}
          >
            {event.name}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-[12px] tracking-[0.3px]">
              {formattedDate}
            </Text>
          </View>
        </Animated.View>

        {/* COLLAPSED STATE — name + date right-aligned, back button at far left */}
        <Animated.View
          className="absolute left-[52px] right-4 items-end justify-center"
          style={[{ top: insets.top, height: BAR_BASE }, compactStyle]}
        >
          <Text className="text-white text-xs font-semibold leading-5" numberOfLines={1}>
            {event.name}
          </Text>
          <Text className="text-white/60 text-[11px] tracking-[0.3px] mt-px" numberOfLines={1}>
            {formattedDate}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces
        className="bg-[#F8FAFC]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 52 }}
      >
        {/*
          Spacer = HERO_H so the first real content sits below the expanded header.
          Math: when scrollY === COLLAPSE, the spacer has (HERO_H − COLLAPSE = BAR_H)
          px remaining on-screen, exactly matching the now-collapsed header height.
          Further scrolling pushes content normally under the sticky bar.
        */}
        <View style={{ height: HERO_H }} />

        {/* Content surface — rounded top overlaps the hero bottom */}
        <View className="bg-[#F8FAFC] rounded-t-3xl -mt-6 overflow-hidden">

          {/* Stats */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            className="flex-row mx-4 gap-x-3 pt-10 mb-4"
          >
            {[
              { label: 'Checked In', value: checkedIn, icon: 'checkmark-circle', color: 'text-emerald-600' },
              { label: 'Registered', value: attendees.length, icon: 'people', color: 'text-blue-600' },
              { label: event.noSlotLimit ? 'No Limit' : 'Remaining', value: event.noSlotLimit ? '∞' : event.remSlot, icon: 'ticket', color: 'text-navy-900' },
            ].map((stat) => (
              <View
                key={stat.label}
                className="flex-1 bg-white rounded-2xl p-4 border border-slate-100 items-center"
                style={{ shadowColor: '#0D2B5E', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <Ionicons name={stat.icon as any} size={20} color="#0D2B5E" />
                <Text className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</Text>
                <Text className="text-slate-400 text-xs mt-0.5 text-center">{stat.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Details */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="bg-white rounded-2xl mx-4 mb-4 px-4 py-4 border border-slate-100"
          >
            <Text className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-3">
              Event Details
            </Text>
            <View className="flex-row py-3 border-b border-slate-50">
              <Text className="w-32 text-slate-400 text-sm">Location</Text>
              <Text className="flex-1 text-slate-700 text-sm text-right font-medium" numberOfLines={2}>
                {event.location}
              </Text>
            </View>
            <View className="flex-row items-center py-3 border-b border-slate-50">
              <Text className="w-32 text-slate-400 text-sm">Status</Text>
              <Text className="flex-1 text-sm text-right font-semibold" style={{ color: status.color }}>
                {status.label}
              </Text>
            </View>
            <View className="flex-row py-3 border-b border-slate-50">
              <Text className="w-32 text-slate-400 text-sm">Sectors</Text>
              <Text className="flex-1 text-slate-700 text-sm text-right font-medium">
                {getEventCategory(event)}
              </Text>
            </View>
            <View className="flex-row py-3 border-b border-slate-50">
              <Text className="w-32 text-slate-400 text-sm">Total Slots</Text>
              <Text className="flex-1 text-slate-700 text-sm text-right font-medium">
                {event.noSlotLimit ? 'Unlimited' : event.totalSlot}
              </Text>
            </View>
            <View className="flex-row py-3">
              <Text className="w-32 text-slate-400 text-sm">Slots Used</Text>
              <Text className="flex-1 text-slate-700 text-sm text-right font-medium">
                {slotUsed}
              </Text>
            </View>
          </Animated.View>

          {/* Attendees */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            className="bg-white rounded-2xl mx-4 mb-4 px-4 py-4 border border-slate-100"
          >
            <Text className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-3">
              Attendees · {attendees.length}
            </Text>
            {attendeesLoading ? (
              <LoadingState />
            ) : attendees.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="people-outline" size={32} color="#CBD5E1" />
                <Text className="text-slate-400 text-sm mt-2">No attendees yet</Text>
              </View>
            ) : (
              attendees.map((a, i) => (
                <AttendeeRow key={a.attendeeId ?? `${a.citizenId}-${i}`} attendee={a} index={i} />
              ))
            )}
          </Animated.View>

          <View className="h-5" />
        </View>
      </Animated.ScrollView>
      {/* QR Scan FAB — bottom-right, floats above list */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/scanner/scannerScreen')}
        activeOpacity={0.85}
        className="absolute right-5 bg-navy-900 rounded-full items-center justify-center"
        style={{
          bottom: 10,
          width: 58,
          height: 58,
          zIndex: 20,
        }}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default EventDetailScreen;
