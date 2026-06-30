import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export const EmptyState = ({
  icon = 'document-outline',
  title,
  subtitle,
}: EmptyStateProps) => (
  <Animated.View entering={FadeIn.duration(400)} className="flex-1 items-center justify-center py-20 px-8">
    <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
      <Ionicons name={icon} size={36} color="#94A3B8" />
    </View>
    <Text className="text-slate-700 text-base font-semibold text-center mb-1">{title}</Text>
    {subtitle && (
      <Text className="text-slate-400 text-sm text-center leading-5">{subtitle}</Text>
    )}
  </Animated.View>
);
