import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDrawerStore } from '@/store/drawerStore';

// ─── Tokens ───────────────────────────────────────────────────────────────────

const DRAWER_W = 280;
const NAVY = '#0D2B5E';
const BLUE = '#1877E8';
const MUTED = '#64748B';
const ANIM_MS = 260;

// ─── Nav items — Scanner excluded per product requirement ─────────────────────

interface NavItem {
  icon: string;
  activeIcon?: string;
  mci?: boolean;
  label: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  // { icon: 'home-outline',                 activeIcon: 'home',     label: 'Home',     route: '/home'     },
  { icon: 'card-account-details-outline', mci: true,              label: 'Citizens', route: '/citizens' },
  { icon: 'calendar-outline',             activeIcon: 'calendar', label: 'Events',   route: '/events'   },
  { icon: 'grid-outline',                 activeIcon: 'grid',     label: 'Account',  route: '/account'  },
];

// ─── Icon helper ──────────────────────────────────────────────────────────────

const NavIcon = ({
  cfg,
  active,
  size,
  color,
}: {
  cfg: NavItem;
  active: boolean;
  size: number;
  color: string;
}) => {
  const name = (active && cfg.activeIcon ? cfg.activeIcon : cfg.icon) as any;
  return cfg.mci
    ? <MaterialCommunityIcons name={name} size={size} color={color} />
    : <Ionicons name={name} size={size} color={color} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AppDrawer = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, close } = useDrawerStore();

  const translateX = useSharedValue(-DRAWER_W);

  useEffect(() => {
    translateX.value = withTiming(
      isOpen ? 0 : -DRAWER_W,
      { duration: ANIM_MS, easing: isOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic) },
    );
  }, [isOpen]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const navigate = (route: string) => {
    close();
    router.push(route as any);
  };

  return (
    <>
      {/* Backdrop — tap to close */}
      {isOpen && (
        <Pressable
          className="absolute inset-0 bg-black/[45%]"
          style={{ zIndex: 99 }}
          onPress={close}
        />
      )}

      {/* Drawer panel — shadows and dynamic insets stay in style */}
      <Animated.View
        className="absolute top-0 left-0 bottom-0 bg-white"
        style={[
          panelStyle,
          {
            width: DRAWER_W,
            zIndex: 100,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.14,
            shadowRadius: 16,
            elevation: 24,
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        {/* Branding header */}
        <View className="flex-row items-center px-5 pb-4 gap-3">
          <View className="w-[38px] h-[38px] rounded-[10px] bg-blue-50 items-center justify-center">
            <Ionicons name="shield-checkmark" size={20} color={BLUE} />
          </View>
          <View>
            <Text className="text-[15px] font-bold text-navy-900 tracking-[0.2px]">Brgy. Ayala</Text>
            <Text className="text-[11px] text-slate-500 mt-px tracking-[0.3px]">Admin Portal</Text>
          </View>
        </View>

        <View className="h-px bg-slate-200 mx-5 mb-2" />

        {/* Nav items — vertical list */}
        <View className="px-2.5 pt-2 gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.route;
            const color = active ? NAVY : MUTED;
            return (
              <TouchableOpacity
                key={item.route}
                className={`flex-row items-center px-3.5 py-3.5 rounded-[10px] gap-3.5${active ? ' bg-[#EEF4FF]' : ''}`}
                onPress={() => navigate(item.route)}
                activeOpacity={0.7}
              >
                <NavIcon cfg={item} active={active} size={22} color={color} />
                <Text
                  className="flex-1 text-[14.5px] font-semibold tracking-[0.1px]"
                  style={{ color }}
                >
                  {item.label}
                </Text>
                {active && <View className="w-[3px] h-[18px] rounded-[2px] bg-[#1877E8]" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
}
