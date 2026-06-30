import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const ScannerBackButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
    >
      <Ionicons name="chevron-back" size={20} color="white" />
    </TouchableOpacity>
  );
}
