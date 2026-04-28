// =============================================================================
// Root Layout — Initializes game loop, auto-save, and loads saved state
// =============================================================================

import { useEffect } from "react";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import {
  useFonts,
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
  Fraunces_700Bold,
  Fraunces_700Bold_Italic,
} from "@expo-google-fonts/fraunces";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";

import { useGameLoop } from "~/engine/gameLoop";
import { initializeAds } from "~/services/adManager";
import { initAnalytics } from "~/services/analyticsService";
import * as audioService from "~/services/audioService";
import { useAutoSave, initializeFromDisk } from "~/services/saveManager";
import { useGameStore } from "~/state/store";
import { WelcomeBackModal } from "~/components/offline/WelcomeBackModal";
import { LuckySproutModal } from "~/components/modals/LuckySproutModal";
import { DailyRewardModal } from "~/components/modals/DailyRewardModal";
import { requestNotificationPermissions } from "~/services/notificationService";
import { COLORS } from "@/constants/theme";

/** Navigation theme using the design system palette. */
const bloomlingsTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.biomeCradleBg,
    card: COLORS.surface,
    text: COLORS.ink,
    border: COLORS.line,
    primary: COLORS.moss,
    notification: COLORS.sunlight,
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Fraunces_700Bold,
    Fraunces_700Bold_Italic,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    initializeFromDisk();
    useGameStore.getState().ensureInitialDiscoveries();
    void initializeAds();
    void initAnalytics();
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

  // Defer render until fonts are loaded to avoid unstyled flash.
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={bloomlingsTheme}>
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
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
