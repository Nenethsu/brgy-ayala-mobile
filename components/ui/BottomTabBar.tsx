import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Tokens ───────────────────────────────────────────────────────────────────

const NAVY = '#0D2B5E';
const BLUE = '#1877E8';
const MUTED = '#1b1a1a';
const FAB_SIZE = 58;
const BAR_H = 64;

// ─── Tab config — must match Tabs.Screen route order in _layout.tsx ───────────
//
//  Index  Route     Bar position
//  0      home      Left 1   — "Home"
//  1      citizens  Left 2   — "Citizens"
//  2      scanner   CENTER FAB — "Scan QR"
//  3      events    Right 1  — "Events"
//  4      account   Right 2  — "Account"

interface TabCfg {
  icon: string;
  activeIcon?: string;
  mci?: boolean;
  label: string;
}

const TABS: TabCfg[] = [
  { icon: 'home-outline',                  activeIcon: 'home',          label: 'Home'     },
  { icon: 'card-account-details-outline',  mci: true,                   label: 'Citizens' },
  { icon: 'qrcode-scan',                   mci: true,                   label: ''  },
  { icon: 'calendar-outline',              activeIcon: 'calendar',    label: 'Events'  },
  { icon: 'grid-outline',                  activeIcon: 'grid',          label: 'Account'  },
];

// ─── Icon helper ──────────────────────────────────────────────────────────────

const TabIcon = ({ cfg, active, size, color }: {
  cfg: TabCfg;
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

export const BottomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  const go = (routeName: string, routeKey: string, index: number) => {
    const ev = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (state.index !== index && !ev.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const leftRoutes  = state.routes.slice(0, 2);
  const fabRoute    = state.routes[2];
  const rightRoutes = state.routes.slice(3, 5);
  const fabActive   = state.index === 2;

  return (
    // overflow: visible so the FAB circle can escape the container upward
    <View style={{ overflow: 'visible' }}>

      {/* ── Center FAB — floats above bar top ───────────────────────────────── */}
      {/*
        top: -(FAB_SIZE - 16) positions the FAB circle so ~72% is above the bar
        and the remaining ~16px of the circle sits inside the bar area.
        hitSlop covers the gap between FAB bottom and the label below it.
      */}
      <View
        pointerEvents="box-none"
        style={[s.fabAnchor, { top: -(FAB_SIZE - 28) }]}
      >
        <TouchableOpacity
          style={[s.fab, fabActive && s.fabActive]}
          onPress={() => go(fabRoute.name, fabRoute.key, 2)}
          activeOpacity={0.85}
          hitSlop={{ top: 8, left: 28, right: 28, bottom: BAR_H }}
          className={`${fabActive ? "border-white" : "border-[#0D2B5E]"} border-2`}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={26}
            color={fabActive ? '#FFFFFF' : NAVY}
          />
        </TouchableOpacity>
      </View>

      {/* ── Bar ─────────────────────────────────────────────────────────────── */}
      <View style={[s.bar, { height: BAR_H + insets.bottom, paddingBottom: insets.bottom }]}>

        {/* Left: Home, Citizens */}
        {leftRoutes.map((route, i) => {
          const active = state.index === i;
          const color  = active ? NAVY : MUTED;
          return (
            <TouchableOpacity
              key={route.key}
              style={s.tab}
              onPress={() => go(route.name, route.key, i)}
              activeOpacity={0.7}
            >
              <TabIcon cfg={TABS[i]} active={active} size={23} color={color} />
              <Text style={[s.label, { color }]}>{TABS[i].label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Center gap — just the "Scan QR" label; FAB circle floats above */}
        <TouchableOpacity
          style={s.centerSlot}
          onPress={() => go(fabRoute.name, fabRoute.key, 2)}
          activeOpacity={0.7}
        >
          <Text style={[s.label, { color: fabActive ? NAVY : MUTED }]}>
            {TABS[2].label}
          </Text>
        </TouchableOpacity>

        {/* Right: Events, Account */}
        {rightRoutes.map((route, i) => {
          const idx    = i + 3;
          const active = state.index === idx;
          const color  = active ? NAVY : MUTED;
          return (
            <TouchableOpacity
              key={route.key}
              style={s.tab}
              onPress={() => go(route.name, route.key, idx)}
              activeOpacity={0.7}
            >
              <TabIcon cfg={TABS[idx]} active={active} size={23} color={color} />
              <Text style={[s.label, { color }]}>{TABS[idx].label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Standalone variant (no FAB) ─────────────────────────────────────────────

const SA_TABS = [
  { icon: 'home-outline',                 activeIcon: 'home',     mci: false, label: 'Home',     path: '/home'     },
  { icon: 'card-account-details-outline', activeIcon: undefined,  mci: true,  label: 'Citizens', path: '/citizens' },
  { icon: 'calendar-outline',             activeIcon: 'calendar', mci: false, label: 'Events',   path: '/events'   },
  { icon: 'grid-outline',                 activeIcon: 'grid',     mci: false, label: 'Account',  path: '/account'  },
] as const;

export const StandaloneBottomTabBar = () => {
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const pathname = usePathname();

  if (pathname === '/scanner' || pathname.startsWith('/scanner/')) return null;

  const activeIndex = SA_TABS.findIndex(
    t => pathname === t.path || pathname.startsWith(t.path + '/'),
  );

  return (
    <View style={[s.bar, { height: BAR_H + insets.bottom, paddingBottom: insets.bottom }]}>
      {SA_TABS.map((tab, i) => {
        const active = activeIndex === i;
        const color  = active ? NAVY : MUTED;
        const name   = (active && tab.activeIcon ? tab.activeIcon : tab.icon) as any;
        return (
          <TouchableOpacity
            key={tab.path}
            style={s.tab}
            onPress={() => router.push(tab.path as any)}
            activeOpacity={0.7}
          >
            {tab.mci
              ? <MaterialCommunityIcons name={name} size={23} color={color} />
              : <Ionicons name={name} size={23} color={color} />}
            <Text style={[s.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  bar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        // shadowColor: '#0D2B5E',
        // shadowOffset: { width: 0, height: -2 },
        // shadowOpacity: 0.07,
        // shadowRadius: 14,
      },
      android: { elevation: 14 },
    }),
  },

  // Regular nav tab
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    minHeight: 44,
    gap: 3,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.15,
    lineHeight: 14,
  },

  // Center column — shows only the label; FAB circle overlaps from above
  centerSlot: {
    width: FAB_SIZE + 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    minHeight: 0,
  },

  // FAB wrapper (absolutely positioned above bar)
  fabAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },

  // FAB circle
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        // shadowColor: BLUE,
        // shadowOffset: { width: 0, height: 6 },
        // shadowOpacity: 0.50,
        // shadowRadius: 14,
      },
      android: { elevation: 0 },
    }),
  },
  fabActive: {
    backgroundColor: NAVY,
    ...Platform.select({
      // ios: { shadowColor: NAVY },
      android: {},
    }),
  },
});
