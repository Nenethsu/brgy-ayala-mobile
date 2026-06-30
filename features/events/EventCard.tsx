import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import type { BrgyEvent } from '../../types/event';
import { getEventStatus, formatEventSchedule, getEventCategory } from './eventHelpers';

interface EventCardProps {
  event: BrgyEvent;
  index: number;
}

const STATUS_STRIP: Record<string, string> = {
  ONGOING:   'bg-teal-500',
  INCOMING:  'bg-blue-500',
  ENDED:     'bg-slate-300',
  CANCELLED: 'bg-red-400',
};

export const EventCard = ({ event, index }: EventCardProps) => {
  const router = useRouter();
  const status = useMemo(() => getEventStatus(event), [event]);
  const eventId = event.eventId ?? event.id ?? '';
  const slotUsed = event.totalSlot - event.remSlot;
  const slotPct = event.noSlotLimit ? 0 : Math.min((slotUsed / event.totalSlot) * 100, 100);

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(400).springify()}>
      <TouchableOpacity
        onPress={() => router.push(`/(app)/events/${eventId}`)}
        activeOpacity={0.75}
        className="bg-white rounded-2xl mb-3 border border-slate-100 overflow-hidden flex-row"
        style={{ shadowColor: '#0D2B5E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
      >
        {/* Status strip */}
        <View className={`w-1.5 ${STATUS_STRIP[status.label.toUpperCase()] ?? 'bg-slate-300'}`} />

        <View className="flex-1 p-4">
          {/* Header row */}
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-slate-900 text-[15px] font-bold flex-1 mr-3 leading-5" numberOfLines={2}>
              {event.name}
            </Text>
            <Badge variant={status.label.toLowerCase() as any} label={status.label} />
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-1.5">
            <Ionicons name="location-outline" size={13} color="#94A3B8" />
            <Text className="text-slate-500 text-xs ml-1" numberOfLines={1}>{event.location}</Text>
          </View>

          {/* Schedule */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
            <Text className="text-slate-500 text-xs ml-1">{formatEventSchedule(event)}</Text>
          </View>

          {/* Sectors */}
          <Text className="text-xs text-slate-400 mb-2.5 uppercase tracking-wide font-medium">
            {getEventCategory(event)}
          </Text>

          {/* Slot bar */}
          {!event.noSlotLimit && (
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-slate-400">Slots filled</Text>
                <Text className="text-xs font-semibold text-slate-600">
                  {slotUsed} / {event.totalSlot}
                </Text>
              </View>
              <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-navy-900 rounded-full"
                  style={{ width: `${slotPct}%` }}
                />
              </View>
            </View>
          )}
          {event.noSlotLimit === 1 && (
            <Text className="text-xs text-teal-600 font-medium">No slot limit</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
