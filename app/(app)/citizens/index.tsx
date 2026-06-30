import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { useGetCitizens } from '../../../lib/hooks/useCitizens';
import { useDrawerStore } from '@/store/drawerStore';
import { CitizenCard } from '../../../features/citizens/CitizenCard';
import { SearchBar } from '../../../components/ui/SearchBar';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SkeletonList } from '../../../components/ui/LoadingState';

const PAGE_SIZE = 20;

const CitizensScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  const { data: citizensData, isLoading, isFetching, refetch } = useGetCitizens({
    page,
    limit: PAGE_SIZE,
    firstName: search || undefined,
    status: filterStatus,
  });
  const { toggle } = useDrawerStore();

  const citizenList = Array.isArray(citizensData) ? citizensData : (citizensData?.data ?? []);
  const totalPages = Array.isArray(citizensData) ? 1 : (citizensData?.totalPages ?? 1);

  const STATUS_FILTERS = [
    { label: 'All', value: undefined },
    { label: 'Verified', value: 'APPROVED' },
    { label: 'Pending', value: 'PENDING' },
  ];
  
  const handleLoadMore = () => {
    if (!isFetching && page < totalPages) setPage((p) => p + 1);
  };

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
            <Text className="text-white text-xl font-bold">Citizens</Text>
          </View>
          <View className="flex-row items-center gap-x-2">
            <TouchableOpacity
              onPress={() => router.push('/(app)/citizens/createCitizen/create')}
              className="flex-row items-center border border-white px-4 py-2 rounded-full"
            >
              <Ionicons name="person-add-outline" size={15} color="white" />
              <Text className="text-white text-sm font-bold ml-1.5">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search + Filters */}
      <View className="px-4 pt-4 pb-2 bg-white border-b border-slate-100">
        <SearchBar
          value={search}
          onChangeText={(t) => { setSearch(t); setPage(1); }}
          placeholder="Search by first name…"
        />
        <View className="flex-row mt-3 gap-x-2">
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={String(f.value)}
              onPress={() => { setFilterStatus(f.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-full border ${
                filterStatus === f.value
                  ? 'bg-navy-900 border-navy-900'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterStatus === f.value ? 'text-white' : 'text-slate-500'
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {isLoading && page === 1 ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={citizenList}
          keyExtractor={(item) => item.accountId}
          renderItem={({ item, index }) => (
            <CitizenCard citizen={item} index={index} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 24,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No citizens found"
              subtitle={search ? `No results for "${search}"` : 'Try adjusting your filters'}
            />
          }
          ListFooterComponent={
            isFetching && page > 1 ? (
              <View className="py-4 items-center">
                <Text className="text-slate-400 text-sm">Loading more…</Text>
              </View>
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 1}
              onRefresh={() => { setPage(1); refetch(); }}
              tintColor="#0D2B5E"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* QR Scan FAB — bottom-right, floats above list */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/citizens/citizenScanner')}
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

export default CitizensScreen;
