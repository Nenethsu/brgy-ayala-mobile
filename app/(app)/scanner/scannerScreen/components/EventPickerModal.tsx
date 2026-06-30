import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatEventSchedule, getEventId } from '@/features/events/eventHelpers';
import { BrgyEvent } from '@/types/event';

interface Props {
  visible: boolean;
  events: BrgyEvent[];
  selectedId: string | null;
  onSelect: (event: BrgyEvent) => void;
  onClose: () => void;
}

const EventPickerModal = ({ visible, events, selectedId, onSelect, onClose }: Props) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity activeOpacity={1}>
          <View className="bg-white rounded-t-3xl">
            <View className="px-5 pt-5 pb-4 border-b border-slate-100 flex-row items-center justify-between">
              <Text className="text-navy-900 text-lg font-bold">Select Event</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {events.length === 0 ? (
              <View className="py-16 items-center">
                <Ionicons name="calendar-outline" size={40} color="#CBD5E1" />
                <Text className="text-slate-400 text-sm mt-3">No ongoing events</Text>
              </View>
            ) : (
              <FlatList
                data={events}
                keyExtractor={(e) => getEventId(e)}
                style={{ maxHeight: 400 }}
                contentContainerStyle={{ paddingBottom: 32 }}
                renderItem={({ item }) => {
                  const isSelected = getEventId(item) === selectedId;
                  return (
                    <TouchableOpacity
                      onPress={() => { onSelect(item); onClose(); }}
                      className={`px-5 py-4 border-b border-slate-50 flex-row items-center ${
                        isSelected ? 'bg-navy-50' : ''
                      }`}
                    >
                      <View className="flex-1">
                        <Text className="text-slate-800 font-semibold">{item.name}</Text>
                        <Text className="text-slate-400 text-xs mt-0.5">{formatEventSchedule(item)}</Text>
                        <Text className="text-slate-400 text-xs">{item.location}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color="#1877E8" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default EventPickerModal;