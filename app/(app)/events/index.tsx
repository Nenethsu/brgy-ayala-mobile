import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGetEvents } from '../../../lib/hooks/useEvents';
import { EventCard } from '../../../features/events/EventCard';
import { SearchBar } from '../../../components/ui/SearchBar';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SkeletonList } from '../../../components/ui/LoadingState';
import { getEventStatus } from '../../../features/events/eventHelpers';
import type { BrgyEvent } from '../../../types/event';
import { useDrawerStore } from '@/store/drawerStore';

type StatusFilter = 'ALL' | 'ONGOING' | 'INCOMING' | 'ENDED';

const EventsScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data: events = [], isLoading, isFetching, refetch } = useGetEvents();
  const { toggle } = useDrawerStore();

  const filtered = useMemo(() => {
    let list = events;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((e) => {
        const s = getEventStatus(e).label.toUpperCase();
        return s === statusFilter;
      });
    }
    return list;
  }, [events, search, statusFilter]);

  const STATUS_TABS: { label: string; value: StatusFilter; color: string }[] = [
    { label: 'All', value: 'ALL', color: 'bg-navy-900 border-navy-900' },
    { label: 'Ongoing', value: 'ONGOING', color: 'bg-teal-600 border-teal-600' },
    { label: 'Incoming', value: 'INCOMING', color: 'bg-blue-600 border-blue-600' },
    { label: 'Ended', value: 'ENDED', color: 'bg-slate-400 border-slate-400' },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        className="bg-navy-900 px-5 pb-5"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-3">
            {/* <TouchableOpacity
              onPress={toggle}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="menu-outline" size={24} color="white" />
            </TouchableOpacity> */}
            <View>
              <Text className="text-white text-xl font-bold">Events</Text>
              <Text className="text-navy-200/60 text-xs mt-0.5">
                {events.length > 0 ? `${events.length} total events` : 'Loading…'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search + Status Filter */}
      <View className="bg-white border-b border-slate-100 px-4 pt-4 pb-3">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search events or locations…"
        />
        <View className="flex-row mt-3 gap-x-2">
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-full border ${
                statusFilter === tab.value
                  ? tab.color
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  statusFilter === tab.value ? 'text-white' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.eventId ?? item.id ?? item.name}
          renderItem={({ item, index }) => <EventCard event={item} index={index} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 24,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No events found"
              subtitle={search ? `No results for "${search}"` : 'No events match the selected filter'}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor="#0D2B5E"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
}

export default EventsScreen;
