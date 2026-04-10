// =============================================================================
// Root Layout — Initializes game loop, auto-save, and loads saved state
// =============================================================================

import { useEffect } from "react";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useGameLoop } from "~/engine/gameLoop";
import { useAutoSave, initializeFromDisk } from "~/services/saveManager";

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
  // Load saved state on mount
  useEffect(() => {
    initializeFromDisk();
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
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
