import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import LOGO from "../../assets/images/logo-word.png"

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);

  const router = useRouter();
  const initials   = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map(n => n!.charAt(0).toUpperCase())
    .join('');
  const avatarUrl: string | null = null;

  return (
    <View className="flex-1 bg-white">

      {/* ── Header ── */}
      <View
        className="bg-white flex-row items-center justify-between px-5 pb-4 border-b border-slate-100"
        style={{ paddingTop: insets.top + 10 }}
      >
        {/* Logo */}
        <Image source={LOGO} style={{ width: 110, height: 40 }} resizeMode="contain" />

        {/* Right — greeting + avatar */}
        <TouchableOpacity onPress={() => router.push('/account')} activeOpacity={0.7} className="flex-row items-center gap-3">
          <View className="items-end">
            <Text className="text-[#1877E8] text-sm font-bold leading-[18px]">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-slate-400 text-xs leading-[16px]">Welcome to DigiApp</Text>
          </View>

          {/* Avatar */}
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-11 h-11 rounded-full"
            />
          ) : (
            <View className="w-11 h-11 rounded-full bg-[#1877E8] items-center justify-center">
              <Text className="text-white text-sm font-bold">{initials || '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Body placeholder ── */}
      <View className="bg-white flex-1 items-center justify-center gap-2.5">
        <Text className="text-navy-900 text-lg font-bold">Home</Text>
        <Text className="text-slate-400 text-[13px]">Dashboard coming soon</Text>
      </View>

    </View>
  );
};

export default HomeScreen;
