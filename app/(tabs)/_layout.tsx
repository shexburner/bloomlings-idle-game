// =============================================================================
// Tab Layout — Bloomlings parchment tab bar with custom SVG icons
// =============================================================================

import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Rect, Circle } from "react-native-svg";

import { COLORS, FONTS, RADII, SHADOWS } from "@/constants/theme";

// -----------------------------------------------------------------------------
// SVG Icons
// -----------------------------------------------------------------------------

function LeafIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 19c0-7 6-13 14-14-1 8-7 14-14 14z" fill={color} opacity={0.25} />
      <Path d="M5 19c0-7 6-13 14-14-1 8-7 14-14 14z" />
      <Path d="M5 19c4-4 7-7 11-11" />
    </Svg>
  );
}

function ShopIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 21h12l-2-4H8z" />
      <Path d="M8 17V11a4 4 0 0 1 8 0v6" />
      <Path d="M12 7V3" />
      <Path d="M10 5l2-2 2 2" />
    </Svg>
  );
}

function CollectionIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="3" width="8" height="8" rx="2" />
      <Rect x="13" y="3" width="8" height="8" rx="2" />
      <Rect x="3" y="13" width="8" height="8" rx="2" />
      <Rect x="13" y="13" width="8" height="8" rx="2" />
    </Svg>
  );
}

function DropIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3c-3 5-6 8-6 12a6 6 0 0 0 12 0c0-4-3-7-6-12z" fill={color} opacity={0.25} />
      <Path d="M12 3c-3 5-6 8-6 12a6 6 0 0 0 12 0c0-4-3-7-6-12z" />
      <Path d="M9 14c-.3 1 0 2 1 2.5" />
    </Svg>
  );
}

function RebirthIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 12a8 8 0 1 1-3-6.2" />
      <Path d="M20 4v4h-4" />
    </Svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.47-1 1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.32h.01a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77v.01a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.47 1z" />
    </Svg>
  );
}

// -----------------------------------------------------------------------------
// Custom Tab Button — active gets sage gradient pill
// -----------------------------------------------------------------------------

function BloomlingsTabButton(props: BottomTabBarButtonProps) {
  const { accessibilityState, onPress, onLongPress, children } = props;
  const focused = accessibilityState?.selected ?? false;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      accessibilityState={accessibilityState}
    >
      {focused ? (
        <LinearGradient
          colors={[COLORS.sageSoft, COLORS.sage]}
          style={styles.activeTabPill}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={styles.inactiveTabPill}>{children}</View>
      )}
    </Pressable>
  );
}

// -----------------------------------------------------------------------------
// Tab bar background — parchment gradient card
// -----------------------------------------------------------------------------

function TabBarBackground() {
  return (
    <LinearGradient
      colors={[COLORS.surface, COLORS.paperDeep]}
      style={StyleSheet.absoluteFill}
    />
  );
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: BloomlingsTabButton,
        tabBarActiveTintColor: COLORS.mossDeep,
        tabBarInactiveTintColor: COLORS.ink3,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "GARDEN",
          tabBarIcon: ({ color }) => <LeafIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "SHOP",
          tabBarIcon: ({ color }) => <ShopIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "COLLECT",
          tabBarIcon: ({ color }) => <CollectionIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="dewdrop-shop"
        options={{
          title: "DEWDROPS",
          tabBarIcon: ({ color }) => <DropIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="rebirth"
        options={{
          title: "REBIRTH",
          tabBarIcon: ({ color }) => <RebirthIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "SETTINGS",
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 16,
    left: 12,
    right: 12,
    height: 72,
    borderRadius: RADII.xl,
    borderTopWidth: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: `${COLORS.gilt}60`,
    ...SHADOWS.md,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  activeTabPill: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADII.lg,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: `${COLORS.gilt}80`,
    gap: 2,
  },
  inactiveTabPill: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 2,
  },
  tabLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 8,
    letterSpacing: 0.6,
  },
});
