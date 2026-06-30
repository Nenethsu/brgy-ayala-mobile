import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DigitalIdScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        gap: 10,
      }}
    >
      <Ionicons name="card-outline" size={48} color="#CBD5E1" />
      <Text style={{ color: '#0D2B5E', fontSize: 18, fontWeight: '700' }}>Digital ID</Text>
      <Text style={{ color: '#94A3B8', fontSize: 13 }}>Coming soon</Text>
    </View>
  );
}

export default DigitalIdScreen;
