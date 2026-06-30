import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../components/ui/Badge';
import type { Citizen } from '../../types/citizen';

interface CitizenCardProps {
  citizen: Citizen;
  index: number;
}

const getInitials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

const AVATAR_COLORS = [
  'bg-navy-900', 'bg-teal-700', 'bg-indigo-700',
  'bg-violet-700', 'bg-rose-700', 'bg-amber-700',
];

export const CitizenCard = ({ citizen, index }: CitizenCardProps) => {
  const router = useRouter();
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const fullName = [citizen.firstName, citizen.middleName, citizen.lastName, citizen.suffix]
    .filter(Boolean)
    .join(' ');

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
      <TouchableOpacity
        onPress={() => router.push(`/(app)/citizens/${citizen.accountId}`)}
        activeOpacity={0.75}
        className="bg-white rounded-2xl mb-3 border border-slate-100 overflow-hidden"
        style={{ shadowColor: '#0D2B5E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
      >
        <View className="flex-row items-center px-4 py-3.5">
          {/* Avatar */}
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-3.5 ${avatarColor}`}>
            <Text className="text-white text-base font-bold">
              {getInitials(citizen.firstName, citizen.lastName)}
            </Text>
          </View>

          {/* Info */}
          <View className="flex-1 min-w-0">
            <Text className="text-slate-900 text-[15px] font-semibold mb-0.5" numberOfLines={1}>
              {fullName}
            </Text>
            <Text className="text-slate-400 text-xs mb-2 font-mono" numberOfLines={1}>
              {citizen.idNumber}
            </Text>
            <Badge
              variant={citizen.status === 'APPROVED' ? 'approved' : citizen.status === 'PENDING' ? 'pending' : 'rejected'}
            />
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" className="ml-2" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
