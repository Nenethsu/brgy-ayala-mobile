import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const ScreenHeader = ({ title, subtitle, showBack, rightAction }: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="bg-navy-900 px-5 pb-5"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 w-9 h-9 items-center justify-center rounded-full bg-white/10"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="text-white text-xl font-bold tracking-tight">{title}</Text>
            {subtitle && (
              <Text className="text-navy-200 text-xs mt-0.5 opacity-70">{subtitle}</Text>
            )}
          </View>
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>
    </View>
  );
};
