// =============================================================================
// Root Layout — Initializes game loop, auto-save, and loads saved state
// =============================================================================

import { useEffect } from "react";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useGameLoop } from "~/engine/gameLoop";
import { initializeAds } from "~/services/adManager";
import * as audioService from "~/services/audioService";
import { useAutoSave, initializeFromDisk } from "~/services/saveManager";
import { useGameStore } from "~/state/store";
import { WelcomeBackModal } from "~/components/offline/WelcomeBackModal";
import { LuckySproutModal } from "~/components/modals/LuckySproutModal";
import { DailyRewardModal } from "~/components/modals/DailyRewardModal";
import { requestNotificationPermissions } from "~/services/notificationService";

/** Custom dark theme for Bloomlings with forest-inspired colors. */
const bloomlingsDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0d1117",
    card: "#1a1a2e",
    text: "#e8f5e9",
    border: "#2d4a3e",
    primary: "#4caf50",
    notification: "#ffd700",
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  // Load saved state on mount, then retroactively grant any Bloomling
  // species the player's zone progress has earned. Fresh installs get
  // Fernley auto-placed in garden slot 0 so idle production starts
  // immediately; returning players pick up species their pre-fix save
  // never recorded.
  useEffect(() => {
    initializeFromDisk();
    useGameStore.getState().ensureInitialDiscoveries();
    void initializeAds();
    void audioService.init().then(() => audioService.syncMusic());
    void requestNotificationPermissions();
  }, []);

  // Sync music on/off whenever the setting changes
  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      if (state.settings.musicEnabled !== prev.settings.musicEnabled) {
        void audioService.syncMusic();
      }
    });
    return unsub;
  }, []);

  // Start the game loop (ticks ~10/sec, handles offline progress)
  useGameLoop();

  // Start auto-save (every 30s + on background)
  useAutoSave();

  return (
    <ThemeProvider value={bloomlingsDarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <WelcomeBackModal />
      <LuckySproutModal />
      <DailyRewardModal />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
