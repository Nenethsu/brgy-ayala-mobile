import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { StandaloneBottomTabBar } from '../../components/ui/BottomTabBar';

const AppLayout = () => {
  return (
    <View className="flex-1">
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={() => null}
          backBehavior="history"
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="home"     options={{ title: 'Home'     }} />
          <Tabs.Screen name="citizens" options={{ title: 'Citizens' }} />
          <Tabs.Screen name="scanner"  options={{ title: 'Scan QR'  }} />
          <Tabs.Screen name="events"   options={{ title: 'Events'   }} />
          <Tabs.Screen name="account"  options={{ title: 'Account'  }} />
        </Tabs>
      </View>
      <StandaloneBottomTabBar />
    </View>
  );
}

export default AppLayout;
