// =============================================================================
// Save Manager — MMKV-based persistence with auto-save and export/import
// =============================================================================
// Uses react-native-mmkv for fast synchronous storage.
// Handles serialization, validation, migration, and base64 export/import.
// =============================================================================

import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { createMMKV } from "react-native-mmkv";
import type { MMKV } from "react-native-mmkv";
import { useGameStore } from "~/state/store";
import type { GameStore } from "~/state/store";
import type { SaveData, GameState } from "~/types/game";
import { buildInitialAchievements } from "~/data/achievementTemplates";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Current save format version. Bump this when the save schema changes. */
const CURRENT_SAVE_VERSION = 1;

/** MMKV storage key for the game save. */
const SAVE_KEY = "bloomlings_save";

/** Auto-save interval in milliseconds (30 seconds). */
const AUTO_SAVE_INTERVAL_MS = 30_000;

// -----------------------------------------------------------------------------
// MMKV Instance
// -----------------------------------------------------------------------------

/** Shared MMKV storage instance. Lazy-initialized to avoid native module issues at import time. */
let _storage: MMKV | null = null;

function getStorage(): MMKV {
  if (_storage === null) {
    _storage = createMMKV({ id: "bloomlings-game-storage" });
  }
  return _storage;
}

// -----------------------------------------------------------------------------
// Save to Disk
// -----------------------------------------------------------------------------

/**
 * Extract the saveable portion of GameState (excluding transient fields).
 */
function extractSaveState(
  state: GameStore
): Omit<GameState, "combo" | "engineRunning"> {
  // Destructure out transient fields we don't save
  return {
    resources: state.resources,
    bloomlings: state.bloomlings,
    garden: state.garden,
    upgrades: state.upgrades,
    perks: state.perks,
    zoneProgress: state.zoneProgress,
    prestige: state.prestige,
    activeBoosts: state.activeBoosts,
    adStates: state.adStates,
    daily: state.daily,
    achievements: state.achievements,
    synergies: state.synergies,
    stats: state.stats,
    settings: state.settings,
    lastTickAt: state.lastTickAt,
    lastActiveAt: state.lastActiveAt,
    unlockedFeatures: state.unlockedFeatures,
    lastLuckySproutAt: state.lastLuckySproutAt,
    luckySproutTapBoostExpiresAt: state.luckySproutTapBoostExpiresAt,
    lastComboKeeperAt: state.lastComboKeeperAt,
    pendingNectarBonus: state.pendingNectarBonus,
  };
}

/**
 * Generate a simple checksum for basic integrity validation.
 * This is NOT cryptographic — just a quick check for corruption.
 */
function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Save the current game state to MMKV.
 *
 * @param state - The full game store state.
 */
export function saveToDisk(state: GameStore): void {
  try {
    const saveState = extractSaveState(state);

    const saveData: SaveData = {
      version: CURRENT_SAVE_VERSION,
      savedAt: Date.now(),
      state: saveState,
      checksum: "", // Placeholder — computed after serialization of state
    };

    // Serialize state portion for checksum
    const stateJson = JSON.stringify(saveState);
    saveData.checksum = generateChecksum(stateJson);

    const fullJson = JSON.stringify(saveData);
    getStorage().set(SAVE_KEY, fullJson);
  } catch {
    // Never crash on save failure — silently fail.
    // In production, this would log to an error reporting service.
  }
}

// -----------------------------------------------------------------------------
// Load from Disk
// -----------------------------------------------------------------------------

/**
 * Load saved game data from MMKV.
 *
 * @returns The parsed SaveData, or null if no save exists or data is corrupted.
 */
export function loadFromDisk(): SaveData | null {
  try {
    const raw = getStorage().getString(SAVE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidSaveData(parsed)) return null;

    return parsed;
  } catch {
    // Corrupted data — return null, never crash.
    return null;
  }
}

/**
 * Basic structural validation of a parsed save object.
 * Checks that required top-level fields exist and have correct types.
 */
function isValidSaveData(data: unknown): data is SaveData {
  if (typeof data !== "object" || data === null) return false;

  const obj = data as Record<string, unknown>;

  // Must have version (number)
  if (typeof obj["version"] !== "number") return false;

  // Must have savedAt (number)
  if (typeof obj["savedAt"] !== "number") return false;

  // Must have state (object)
  if (typeof obj["state"] !== "object" || obj["state"] === null) return false;

  // Must have checksum (string)
  if (typeof obj["checksum"] !== "string") return false;

  // Validate that state has resources
  const state = obj["state"] as Record<string, unknown>;
  if (typeof state["resources"] !== "object" || state["resources"] === null) {
    return false;
  }

  // Validate that resources has sunlight (number)
  const resources = state["resources"] as Record<string, unknown>;
  if (typeof resources["sunlight"] !== "number") return false;

  return true;
}

// -----------------------------------------------------------------------------
// Migration
// -----------------------------------------------------------------------------

/**
 * Apply any needed migrations to bring a save up to the current version.
 *
 * Migrations are applied sequentially: v1->v2, v2->v3, etc.
 * Each migration function takes a SaveData and returns a new SaveData
 * at the next version.
 *
 * @param save - The loaded save data (potentially at an old version).
 * @returns The migrated save data at CURRENT_SAVE_VERSION.
 */
export function migrateIfNeeded(save: SaveData): SaveData {
  let migrated = save;

  // Apply migrations sequentially
  while (migrated.version < CURRENT_SAVE_VERSION) {
    const migration = migrations[migrated.version];
    if (!migration) {
      // No migration path — cannot upgrade this save version.
      // Return as-is and hope for the best, or the caller can
      // treat it as invalid.
      break;
    }
    migrated = migration(migrated);
  }

  return migrated;
}

/**
 * Migration registry. Key = source version, value = migration function.
 * Each migration bumps the version by 1.
 *
 * Example for future use:
 *   1: (save) => { ...modify save for v2...; save.version = 2; return save; }
 */
const migrations: Record<number, (save: SaveData) => SaveData> = {
  // Currently at v1 — no migrations needed yet.
  // When v2 is introduced, add:
  // 1: (save) => {
  //   // ... apply v1 -> v2 changes ...
  //   return { ...save, version: 2 };
  // },
};

// -----------------------------------------------------------------------------
// Export / Import (Base64)
// -----------------------------------------------------------------------------

/**
 * Export the current game state as a base64-encoded string.
 * Useful for cloud backup, sharing saves, or support debugging.
 *
 * @param state - The full game store state.
 * @returns A base64 string representing the save data.
 */
export function exportSave(state: GameStore): string {
  const saveState = extractSaveState(state);
  const stateJson = JSON.stringify(saveState);

  const saveData: SaveData = {
    version: CURRENT_SAVE_VERSION,
    savedAt: Date.now(),
    state: saveState,
    checksum: generateChecksum(stateJson),
  };

  const fullJson = JSON.stringify(saveData);

  // Use global btoa for base64 encoding (available in React Native via hermes)
  return btoa(fullJson);
}

/**
 * Import a save from a base64-encoded string.
 *
 * @param base64 - A base64-encoded save string (from exportSave).
 * @returns The parsed and validated SaveData, or null if invalid.
 */
export function importSave(base64: string): SaveData | null {
  try {
    const json = atob(base64);
    const parsed: unknown = JSON.parse(json);

    if (!isValidSaveData(parsed)) return null;

    // Apply migrations if save is from an older version
    const migrated = migrateIfNeeded(parsed);

    return migrated;
  } catch {
    // Invalid base64 or JSON — return null, never crash.
    return null;
  }
}

// -----------------------------------------------------------------------------
// Apply Loaded Save to Store
// -----------------------------------------------------------------------------

/**
 * Apply a loaded SaveData to the Zustand store.
 * Restores all persisted fields while re-initializing transient state.
 */
export function applySaveToStore(save: SaveData): void {
  const state = save.state;

  useGameStore.setState({
    resources: state.resources,
    bloomlings: state.bloomlings,
    garden: state.garden,
    upgrades: state.upgrades,
    perks: state.perks,
    zoneProgress: state.zoneProgress,
    prestige: state.prestige,
    activeBoosts: state.activeBoosts,
    adStates: state.adStates,
    daily: state.daily,
    // Merge saved achievements with current templates so achievements added
    // after the save was created appear as uncompleted rather than absent.
    achievements: { ...buildInitialAchievements(), ...(state.achievements ?? {}) },
    synergies: state.synergies,
    stats: {
      ...state.stats,
      // Default any new stat fields for saves that predate them.
      nightOwlOfflineCollections: state.stats.nightOwlOfflineCollections ?? 0,
    },
    settings: state.settings,
    lastTickAt: state.lastTickAt,
    lastActiveAt: state.lastActiveAt,
    unlockedFeatures: state.unlockedFeatures,
    lastLuckySproutAt: state.lastLuckySproutAt ?? null,
    luckySproutTapBoostExpiresAt: state.luckySproutTapBoostExpiresAt ?? null,
    lastComboKeeperAt: state.lastComboKeeperAt ?? null,
    pendingNectarBonus: state.pendingNectarBonus ?? null,
    // Re-initialize transient state
    combo: {
      count: 0,
      lastTapAt: 0,
      frozen: false,
      freezeExpiresAt: null,
      sessionMaxCombo: 0,
    },
    engineRunning: false,
  });
}

// -----------------------------------------------------------------------------
// useAutoSave Hook
// -----------------------------------------------------------------------------

/**
 * React hook that auto-saves the game state.
 *
 * - Saves every 30 seconds via setInterval.
 * - Saves when the app goes to background.
 * - Uses Zustand subscribe to efficiently watch for state changes.
 *
 * Mount this hook once at the root of the app.
 */
export function useAutoSave(): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  useEffect(() => {
    // --- Periodic auto-save ---
    intervalRef.current = setInterval(() => {
      const state = useGameStore.getState();
      saveToDisk(state);
      lastSaveRef.current = Date.now();
    }, AUTO_SAVE_INTERVAL_MS);

    // --- Save on app background ---
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        const state = useGameStore.getState();
        saveToDisk(state);
        lastSaveRef.current = Date.now();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // --- Save on meaningful state changes (debounced by the interval) ---
    // We subscribe to the store but only save on the periodic interval,
    // not on every state change (that would be too frequent).
    // The subscribe is kept for future use (e.g., save on prestige).
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      // Save immediately on prestige events (important state changes)
      if (
        state.prestige.rebirthCount !== prevState.prestige.rebirthCount ||
        state.prestige.transcendenceCount !==
          prevState.prestige.transcendenceCount
      ) {
        saveToDisk(state);
        lastSaveRef.current = Date.now();
      }
    });

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
      unsubscribe();

      // Final save on unmount
      saveToDisk(useGameStore.getState());
    };
  }, []);
}

// -----------------------------------------------------------------------------
// Initialization Helper
// -----------------------------------------------------------------------------

/**
 * Initialize the game by loading a save from disk (if available).
 * Should be called once at app startup, before the game loop starts.
 *
 * @returns The loaded SaveData (for offline progress calculation), or null if no save.
 */
export function initializeFromDisk(): SaveData | null {
  const save = loadFromDisk();
  if (!save) return null;

  const migrated = migrateIfNeeded(save);
  applySaveToStore(migrated);

  return migrated;
}
