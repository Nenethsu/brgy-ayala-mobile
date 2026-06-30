import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState = ({ message, fullScreen = false }: LoadingStateProps) => (
  <View className={`items-center justify-center ${fullScreen ? 'flex-1' : 'py-16'}`}>
    <ActivityIndicator size="large" color="#0D2B5E" />
    {message && (
      <Text className="text-slate-500 text-sm mt-3">{message}</Text>
    )}
  </View>
);

export const SkeletonCard = () => (
  <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
    <View className="flex-row items-center">
      <View className="w-12 h-12 bg-slate-100 rounded-full mr-3" />
      <View className="flex-1">
        <View className="w-40 h-4 bg-slate-100 rounded mb-2" />
        <View className="w-24 h-3 bg-slate-100 rounded" />
      </View>
    </View>
  </View>
);

export const SkeletonList = ({ count = 6 }: { count?: number }) => (
  <View className="px-4 pt-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);
