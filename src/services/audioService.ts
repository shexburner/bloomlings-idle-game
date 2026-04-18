// =============================================================================
// Audio Service — Singleton manager for SFX and background music.
// Respects sfxEnabled, musicEnabled, and masterVolume from the game settings.
// All calls are fire-and-forget; errors are swallowed so a missing asset never
// crashes the game.
// =============================================================================

import { Audio } from "expo-av";
import { Platform } from "react-native";
import { useGameStore } from "~/state/store";

// -----------------------------------------------------------------------------
// Sound registry — maps key → require() call (must be static for Metro)
// -----------------------------------------------------------------------------

const SOUND_SOURCES = {
  tap: require("../../assets/sounds/tap.wav"),
  crit: require("../../assets/sounds/crit.wav"),
  combo: require("../../assets/sounds/combo.wav"),
  purchase: require("../../assets/sounds/purchase.wav"),
  zoneAdvance: require("../../assets/sounds/zone-advance.wav"),
  achievement: require("../../assets/sounds/achievement.wav"),
  luckySprout: require("../../assets/sounds/lucky-sprout.wav"),
  boost: require("../../assets/sounds/boost.wav"),
} as const;

const BGM_SOURCE = require("../../assets/sounds/bgm.wav");

export type SoundKey = keyof typeof SOUND_SOURCES;

// -----------------------------------------------------------------------------
// Internal state
// -----------------------------------------------------------------------------

const soundCache = new Map<SoundKey, Audio.Sound>();
let bgmSound: Audio.Sound | null = null;
let bgmLoaded = false;

// -----------------------------------------------------------------------------
// Init
// -----------------------------------------------------------------------------

/**
 * Load all sounds into the cache. Call once at app startup.
 * Safe to call multiple times — already-loaded sounds are skipped.
 */
export async function init(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });
  } catch {
    // ignore
  }

  await Promise.allSettled(
    (Object.keys(SOUND_SOURCES) as SoundKey[]).map(async (key) => {
      if (soundCache.has(key)) return;
      try {
        const { sound } = await Audio.Sound.createAsync(SOUND_SOURCES[key], {
          shouldPlay: false,
        });
        soundCache.set(key, sound);
      } catch {
        // missing or invalid file — degrade silently
      }
    })
  );

  // Pre-load BGM
  if (!bgmLoaded) {
    try {
      const { sound } = await Audio.Sound.createAsync(BGM_SOURCE, {
        shouldPlay: false,
        isLooping: true,
        volume: 0.4,
      });
      bgmSound = sound;
      bgmLoaded = true;
    } catch {
      // no BGM file yet
    }
  }
}

// -----------------------------------------------------------------------------
// SFX playback
// -----------------------------------------------------------------------------

/**
 * Play a named sound effect, respecting sfxEnabled and masterVolume.
 * Fire-and-forget — never throws.
 */
export function play(key: SoundKey): void {
  if (Platform.OS === "web") return;
  const { sfxEnabled, masterVolume } = useGameStore.getState().settings;
  if (!sfxEnabled) return;

  const sound = soundCache.get(key);
  if (!sound) return;

  sound
    .setVolumeAsync(masterVolume)
    .then(() => sound.replayAsync())
    .catch(() => {
      // reload on error (sound object can go stale)
      soundCache.delete(key);
      Audio.Sound.createAsync(SOUND_SOURCES[key], { shouldPlay: true, volume: masterVolume })
        .then(({ sound: fresh }) => soundCache.set(key, fresh))
        .catch(() => {});
    });
}

// -----------------------------------------------------------------------------
// Background music
// -----------------------------------------------------------------------------

/** Start the BGM loop. No-op if music is disabled or not loaded. */
export async function startMusic(): Promise<void> {
  if (Platform.OS === "web" || !bgmSound) return;
  const { musicEnabled, masterVolume } = useGameStore.getState().settings;
  if (!musicEnabled) return;
  try {
    await bgmSound.setVolumeAsync(masterVolume * 0.4);
    await bgmSound.playAsync();
  } catch {
    // ignore
  }
}

/** Stop the BGM loop. */
export async function stopMusic(): Promise<void> {
  if (!bgmSound) return;
  try {
    await bgmSound.stopAsync();
  } catch {
    // ignore
  }
}

/** React to a settings change: start or stop music based on musicEnabled. */
export async function syncMusic(): Promise<void> {
  const { musicEnabled } = useGameStore.getState().settings;
  if (musicEnabled) {
    await startMusic();
  } else {
    await stopMusic();
  }
}
