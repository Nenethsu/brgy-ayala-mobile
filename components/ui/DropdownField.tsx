import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DropdownOption {
  id: string | number;
  name: string;
}

interface DropdownFieldProps {
  label: string;
  value: string | number | null | undefined;
  options: DropdownOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const DropdownField = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  error,
  isLoading = false,
  disabled = false,
}: DropdownFieldProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => String(o.id) === String(value));

  const filtered = useMemo(
    () =>
      query
        ? options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
        : options,
    [options, query],
  );

  const handleToggle = () => {
    if (disabled) return;
    if (open) setQuery('');
    setOpen((prev) => !prev);
  };

  const handleSelect = (option: DropdownOption) => {
    onChange(option.id);
    setOpen(false);
    setQuery('');
  };

  return (
    <View className="mb-5">
      <Text className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
        {label}
      </Text>

      {/* Trigger */}
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={disabled ? 1 : 0.7}
        className={`flex-row items-center border rounded-xl px-4 h-14 ${
          error
            ? 'border-red-300 bg-white'
            : open
            ? 'border-navy-900 bg-white'
            : 'border-slate-200 bg-white'
        } ${disabled ? 'bg-slate-50 opacity-60' : ''}`}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#94A3B8" />
        ) : (
          <>
            <Text
              className={`flex-1 text-base ${selected ? 'text-slate-800' : 'text-slate-300'}`}
              numberOfLines={1}
            >
              {selected ? selected.name : placeholder}
            </Text>
            <Ionicons
              name={open ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={open ? '#0D2B5E' : '#CBD5E1'}
            />
          </>
        )}
      </TouchableOpacity>

      {/* Inline panel */}
      {open && (
        <View
          className="border border-slate-200 rounded-xl mt-1 bg-white overflow-hidden"
          style={{
            shadowColor: '#0D2B5E',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* Search */}
          <View className="flex-row items-center px-3 py-2.5 border-b border-slate-100">
            <Ionicons name="search-outline" size={15} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-2 text-slate-800 text-sm"
              placeholder="Search…"
              placeholderTextColor="#CBD5E1"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={15} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>

          {/* Options */}
          <ScrollView
            style={{ maxHeight: 220 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {filtered.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-slate-400 text-sm">No results found</Text>
              </View>
            ) : (
              filtered.map((item) => {
                const isSelected = String(item.id) === String(value);
                return (
                  <TouchableOpacity
                    key={String(item.id)}
                    onPress={() => handleSelect(item)}
                    className={`flex-row items-center px-4 py-3.5 border-b border-slate-50 ${
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
                    {isSelected && <Ionicons name="checkmark" size={16} color="#1877E8" />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {error && <Text className="text-red-500 text-xs mt-1.5">{error}</Text>}
    </View>
  );
};
