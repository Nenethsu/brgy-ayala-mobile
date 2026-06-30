import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar = ({ value, onChangeText, placeholder = 'Search...', onClear }: SearchBarProps) => (
  <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3.5 h-12 shadow-sm">
    <Ionicons name="search-outline" size={18} color="#94A3B8" />
    <TextInput
      className="flex-1 ml-2.5 text-slate-800 text-sm"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      returnKeyType="search"
      clearButtonMode="never"
    />
    {value.length > 0 && (
      <TouchableOpacity
        onPress={() => { onChangeText(''); onClear?.(); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View className="bg-slate-200 rounded-full w-5 h-5 items-center justify-center">
          <Ionicons name="close" size={12} color="#64748B" />
        </View>
      </TouchableOpacity>
    )}
  </View>
);
