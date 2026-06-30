import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PickerOption {
  id: string | number;
  name: string;
}

interface PickerFieldProps {
  label: string;
  value: string | number | null | undefined;
  options: PickerOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  isLoading?: boolean;
  searchable?: boolean;
  disabled?: boolean;
}

export const PickerField = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  isLoading,
  searchable = false,
  disabled = false,
}: PickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => String(o.id) === String(value));

  const filtered = useMemo(
    () =>
      searchable && query
        ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
        : options,
    [options, query, searchable],
  );

  const handleSelect = (option: PickerOption) => {
    onChange(option.id);
    setOpen(false);
    setQuery('');
  };

  return (
    <View className="mb-5">
      <Text className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={disabled ? 1 : 0.7}
        className={`flex-row items-center border rounded-xl px-4 h-14 ${
          error ? 'border-red-300' : 'border-slate-200'
        } ${disabled ? 'bg-slate-50 opacity-60' : 'bg-white'}`}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#94A3B8" />
        ) : (
          <>
            <Text
              className={`flex-1 text-base ${
                selected ? 'text-slate-800' : 'text-slate-300'
              }`}
              numberOfLines={1}
            >
              {selected ? selected.name : placeholder}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#CBD5E1" />
          </>
        )}
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-xs mt-1.5">{error}</Text>
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => { setOpen(false); setQuery(''); }}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => { setOpen(false); setQuery(''); }}
        >
          <TouchableOpacity activeOpacity={1}>
            <SafeAreaView className="bg-white rounded-t-3xl">
              {/* Handle */}
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 bg-slate-200 rounded-full" />
              </View>

              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pb-3 border-b border-slate-100">
                <Text className="text-navy-900 text-base font-bold">{label}</Text>
                <TouchableOpacity onPress={() => { setOpen(false); setQuery(''); }}>
                  <Ionicons name="close" size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Search */}
              {searchable && (
                <View className="px-4 py-3">
                  <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 h-11">
                    <Ionicons name="search-outline" size={16} color="#94A3B8" />
                    <TextInput
                      className="flex-1 ml-2 text-slate-800 text-sm"
                      placeholder="Search…"
                      placeholderTextColor="#CBD5E1"
                      value={query}
                      onChangeText={setQuery}
                      autoFocus
                    />
                  </View>
                </View>
              )}

              {/* Options */}
              <FlatList
                data={filtered}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 380 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = String(item.id) === String(value);
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelect(item)}
                      className={`flex-row items-center px-5 py-4 border-b border-slate-50 ${
                        isSelected ? 'bg-navy-50' : ''
                      }`}
                    >
                      <Text
                        className={`flex-1 text-sm ${
                          isSelected ? 'text-navy-900 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {item.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color="#1877E8" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View className="py-10 items-center">
                    <Text className="text-slate-400 text-sm">No options found</Text>
                  </View>
                }
              />
            </SafeAreaView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
