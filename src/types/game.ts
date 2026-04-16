// =============================================================================
// Bloomlings Idle Game — Core Type Definitions
// =============================================================================
// All TypeScript interfaces and enums for the game engine.
// Based on design docs: 01-core-game-loop, 02-bloomling-mechanics,
// 03-zone-progression, 04-prestige-systems, 05-ad-economy, 06-retention-hooks.
// =============================================================================

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

/** Bloomling rarity tier — determines base production multiplier and ability strength. */
export enum Rarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  Epic = "epic",
  Legendary = "legendary",
  Mythic = "mythic",
}

/** Bloomling growth stage — each evolution resets level and multiplies base production. */
export enum EvolutionStage {
  /** Starting stage. Basic idle production only. */
  Sprout = "sprout",
  /** Reached at Sprout Lv.100. Unlocks passive ability. 3x base production. */
  Bloom = "bloom",
  /** Reached at Bloom Lv.100. Enhanced ability + synergy slot. 9x base production. */
  Elder = "elder",
}

/** Biome theme — groups of 25 zones with distinct visuals and native Bloomlings. */
export enum BiomeType {
  MossyCradle = "mossy_cradle",
  SunlitGlade = "sunlit_glade",
  TwilightHollow = "twilight_hollow",
  CrystalCaverns = "crystal_caverns",
  /** Post-Transcendence biomes */
  ScorchedExpanse = "scorched_expanse",
  AbyssalDepths = "abyssal_depths",
  CelestialCanopy = "celestial_canopy",
  FrozenThicket = "frozen_thicket",
}

/** Category of upgrade available in shops. */
export enum UpgradeCategory {
  /** Increases tap value and tap-related stats. */
  Tap = "tap",
  /** Increases idle production rates. */
  Idle = "idle",
  /** Nectar-purchased permanent upgrades (persist through Rebirth). */
  Nectar = "nectar",
  /** Essence-purchased permanent upgrades (persist through Transcendence). */
  Essence = "essence",
}

/** Type of passive/active ability a Bloomling can have. */
export enum AbilityType {
  /** Increases own or all Bloomlings' Sunlight production. */
  ProductionBoost = "production_boost",
  /** Increases tap value or critical tap chance. */
  TapBoost = "tap_boost",
  /** Affects combo system (decay timer, combo multiplier). */
  ComboBoost = "combo_boost",
  /** Helps clear zones faster (threshold reduction). */
  ZoneBoost = "zone_boost",
  /** Affects Rebirth rewards (Nectar bonus). */
  PrestigeBoost = "prestige_boost",
  /** Random bonus events (spawning orbs, bonus drops). */
  Luck = "luck",
}

/** Ad touchpoints — where optional rewarded ads can appear. */
export enum AdTouchpoint {
  /** 2x all Sunlight production for 10 minutes. Unlocks at Zone 15. */
  SunbeamBoost = "sunbeam_boost",
  /** Double offline earnings on return. Once per app open. */
  DoubleOffline = "double_offline",
  /** Watch to earn 1-3 Dewdrops. 3-min cooldown. Unlocks at Zone 20. */
  DewdropGarden = "dewdrop_garden",
  /** Random pop-up every 10-15 min of active play. Reward wheel. */
  LuckySprout = "lucky_sprout",
  /** Help during gate zones: +15s timer or 1.5x Sunlight. */
  GateAssist = "gate_assist",
  /** During boss fights: deal 25% of boss max HP instantly. */
  BossSmash = "boss_smash",
  /** Freeze combo decay for 5 minutes when combo > 50. */
  ComboKeeper = "combo_keeper",
}

/** How a Bloomling can be unlocked/acquired. */
export enum UnlockMethod {
  /** Awarded at a specific zone milestone. */
  ZoneMilestone = "zone_milestone",
  /** Dropped by a biome boss on first defeat. */
  BiomeBoss = "biome_boss",
  /** Rewarded for completing a specific achievement. */
  Achievement = "achievement",
  /** Requires Nectar or Essence to awaken. */
  PrestigeUnlock = "prestige_unlock",
  /** Purchasable in the Dewdrop shop. */
  DewdropShop = "dewdrop_shop",
  /** Hidden unlock — specific conditions must be met. */
  Discovery = "discovery",
}

/** Achievement category for grouping in the UI. */
export enum AchievementCategory {
  Growth = "growth",
  Power = "power",
  Journey = "journey",
  Rebirth = "rebirth",
  Hidden = "hidden",
}

/** Buy multiplier options for shop purchases. */
export enum BuyMultiplier {
  X1 = 1,
  X10 = 10,
  X25 = 25,
  X100 = 100,
  Max = -1,
}

/** Zone type — normal zones vs. gate zones (every 5th). */
export enum ZoneType {
  Normal = "normal",
  Gate = "gate",
}

// -----------------------------------------------------------------------------
// Core Data Interfaces
// -----------------------------------------------------------------------------

/** A Bloomling template — static data defining a Bloomling species. */
export interface BloomlingTemplate {
  /** Unique identifier for this Bloomling species. */
  readonly id: string;
  /** Display name (e.g., "Fernley", "Thornwick", "Lumivine"). */
  readonly name: string;
  /** Rarity tier — determines base production multiplier. */
  readonly rarity: Rarity;
  /** Native biome where this Bloomling is found. */
  readonly biome: BiomeType;
  /** Sunlight per second at level 1, Sprout stage. */
  readonly baseProduction: number;
  /** Base cost in Sunlight to level from 1 to 2. */
  readonly baseLevelCost: number;
  /** Passive/active ability type. */
  readonly abilityType: AbilityType;
  /** Human-readable description of the ability. */
  readonly abilityDescription: string;
  /** Numeric strength of the ability at Bloom stage (e.g., 0.10 for +10%). */
  readonly abilityValue: number;
  /** Synergy tags — activate bonuses when paired with matching Bloomlings (Elder only). */
  readonly synergyTags: readonly string[];
  /** How this Bloomling is unlocked. */
  readonly unlockMethod: UnlockMethod;
  /** Zone number, achievement ID, or other condition required to unlock. */
  readonly unlockCondition: string;
  /** Personality flavor text — affects idle animations and dialog. */
  readonly personality: string;
  /** Lore/backstory text. */
  readonly lore: string;
}

/** A player-owned Bloomling instance — mutable runtime state. */
export interface Bloomling {
  /** References BloomlingTemplate.id. */
  readonly templateId: string;
  /** Unique instance ID (a player could theoretically have variants). */
  readonly instanceId: string;
  /** Current level within the current evolution stage (1-100). */
  level: number;
  /** Current evolution stage. */
  evolutionStage: EvolutionStage;
  /** Whether this Bloomling is currently placed in the Garden (active roster). */
  inGarden: boolean;
  /** Garden slot index if placed (0-based), or null if not in Garden. */
  gardenSlot: number | null;
  /** Whether this Bloomling has been discovered/unlocked by the player. */
  unlocked: boolean;
  /** Total Sunlight this Bloomling has produced all-time (for stats). */
  totalProduced: number;
}

/** An upgrade template — static data defining an upgrade available for purchase. */
export interface UpgradeTemplate {
  /** Unique identifier. */
  readonly id: string;
  /** Display name. */
  readonly name: string;
  /** Human-readable description. */
  readonly description: string;
  /** Which shop category this upgrade belongs to. */
  readonly category: UpgradeCategory;
  /** Base cost at level 0 (in the category's currency). */
  readonly baseCost: number;
  /** Cost scaling factor per level (e.g., 1.10 for 10% increase). */
  readonly costScaling: number;
  /** Numeric effect per level (e.g., 0.25 for +25%). */
  readonly effectPerLevel: number;
  /** Maximum level (null = no cap). */
  readonly maxLevel: number | null;
  /** Zone number required to unlock this upgrade in the shop. */
  readonly unlockZone: number;
  /** Minimum rebirth count required (0 = available from start). */
  readonly unlockRebirths: number;
}

/** A player-owned upgrade instance — tracks purchased level. */
export interface Upgrade {
  /** References UpgradeTemplate.id. */
  readonly templateId: string;
  /** Current purchased level. */
  level: number;
}

/** A Dewdrop shop perk — premium items purchased with ad currency. */
export interface Perk {
  /** Unique identifier. */
  readonly id: string;
  /** Display name. */
  readonly name: string;
  /** Human-readable description. */
  readonly description: string;
  /** Cost in Dewdrops. */
  readonly cost: number;
  /** Whether this is a permanent unlock or one-time consumable. */
  readonly permanent: boolean;
  /** Whether the player has purchased this perk. */
  purchased: boolean;
  /** Quantity owned (for consumables). */
  quantity: number;
}

/** A biome — thematic area containing 25 zones. */
export interface Biome {
  /** Unique identifier matching BiomeType. */
  readonly id: BiomeType;
  /** Display name (e.g., "The Mossy Cradle"). */
  readonly name: string;
  /** Starting zone number (inclusive). */
  readonly startZone: number;
  /** Ending zone number (inclusive). */
  readonly endZone: number;
  /** Whether this biome has a special mechanic (Sunbursts, Luminescence, etc.). */
  readonly hasSpecialMechanic: boolean;
  /** Description of the special mechanic, if any. */
  readonly specialMechanicDescription: string;
  /** IDs of Bloomlings native to this biome. */
  readonly nativeBloomlingIds: readonly string[];
  /** Boss name (e.g., "The Overgrowth"). */
  readonly bossName: string;
  /** Boss HP multiplier relative to normal zone threshold (e.g., 50 = 50x). */
  readonly bossHpMultiplier: number;
  /** Boss fight timer in seconds. */
  readonly bossTimerSeconds: number;
}

/** A zone — individual progression unit within a biome. */
export interface Zone {
  /** Zone number (1-based, globally unique). */
  readonly zoneNumber: number;
  /** Sunlight threshold required to clear this zone. */
  readonly threshold: number;
  /** Whether this is a gate zone (every 5th zone). */
  readonly type: ZoneType;
  /** Gate timer duration in seconds (only for gate zones). */
  readonly gateTimerSeconds: number | null;
  /** Gate burst threshold (only for gate zones, typically 2x normal threshold). */
  readonly gateBurstThreshold: number | null;
  /** Which biome this zone belongs to. */
  readonly biomeId: BiomeType;
}

/** An achievement definition and player progress. */
export interface Achievement {
  /** Unique identifier. */
  readonly id: string;
  /** Display name. */
  readonly name: string;
  /** Description of what needs to be accomplished. */
  readonly description: string;
  /** Category for UI grouping. */
  readonly category: AchievementCategory;
  /** Whether this is a hidden achievement (shown as "???" until discovered). */
  readonly hidden: boolean;
  /** Reward: Sunlight bonus amount (0 if none). */
  readonly sunlightReward: number;
  /** Reward: Dewdrop bonus amount (0 if none). */
  readonly dewdropReward: number;
  /** Whether the player has completed this achievement. */
  completed: boolean;
  /** Timestamp of completion (ms since epoch), or null. */
  completedAt: number | null;
  /** Current progress value (e.g., taps counted, zones cleared). */
  progress: number;
  /** Target progress value to complete (e.g., 1000 taps). */
  readonly target: number;
}

/** Configuration for an ad reward touchpoint. */
export interface AdRewardConfig {
  /** Which ad touchpoint this configures. */
  readonly touchpoint: AdTouchpoint;
  /** Display label shown on the ad button. */
  readonly label: string;
  /** Human-readable description of what the player gets. */
  readonly rewardDescription: string;
  /** Zone number required to unlock this touchpoint. */
  readonly unlockZone: number;
  /** Cooldown duration in milliseconds between uses. */
  readonly cooldownMs: number;
  /** Whether this touchpoint is currently available (not on cooldown, ad loaded). */
  available: boolean;
  /** Timestamp (ms since epoch) when the cooldown expires, or null if not on cooldown. */
  cooldownExpiresAt: number | null;
}

/** Special synergy definition for specific Bloomling pairs. */
export interface Synergy {
  /** Unique synergy identifier. */
  readonly id: string;
  /** Display name (e.g., "Undergrowth Alliance"). */
  readonly name: string;
  /** Bloomling template IDs that must all be in the Garden to activate. */
  readonly requiredBloomlingIds: readonly string[];
  /** Synergy tag (for tag-based synergies) or null for pair-specific synergies. */
  readonly tag: string | null;
  /** Production bonus multiplier (e.g., 0.25 for +25%). */
  readonly bonusMultiplier: number;
  /** Lore text displayed on first discovery. */
  readonly lore: string;
  /** Whether the player has discovered this synergy. */
  discovered: boolean;
}

// -----------------------------------------------------------------------------
// Combo & Tap State
// -----------------------------------------------------------------------------

/** Transient state for the combo system during active play. */
export interface ComboState {
  /** Current combo hit count. */
  count: number;
  /** Timestamp (ms) of the last registered tap. */
  lastTapAt: number;
  /** Whether the combo is currently frozen (Combo Keeper ad perk). */
  frozen: boolean;
  /** Timestamp (ms) when Combo Keeper freeze expires, or null. */
  freezeExpiresAt: number | null;
  /** Maximum combo achieved in the current session (for stats/achievements). */
  sessionMaxCombo: number;
}

/** Transient state for active boost timers. */
export interface ActiveBoost {
  /** Which ad touchpoint granted this boost. */
  readonly source: AdTouchpoint;
  /** Multiplier applied (e.g., 2 for 2x production). */
  readonly multiplier: number;
  /** Timestamp (ms) when this boost expires. */
  expiresAt: number;
}

// -----------------------------------------------------------------------------
// Prestige State
// -----------------------------------------------------------------------------

/** Tracks all prestige-related state across both layers. */
export interface PrestigeState {
  // --- Rebirth (Prestige Layer 1) ---

  /** Total number of Rebirths completed all-time. */
  rebirthCount: number;
  /** Current season/run number (rebirthCount + 1). */
  currentSeason: number;
  /** Total Nectar earned all-time (across all Rebirths and Transcendences). */
  totalNectarEarned: number;
  /** Total Nectar spent all-time (used for Essence calculation). */
  totalNectarSpent: number;
  /** Highest zone reached in the current run. */
  currentRunHighestZone: number;
  /** Highest zone reached all-time (persists through everything). */
  allTimeHighestZone: number;
  /** Whether the Rebirth button has been unlocked (Zone 40). */
  rebirthUnlocked: boolean;

  // --- Transcendence (Prestige Layer 2) ---

  /** Total number of Transcendences completed. */
  transcendenceCount: number;
  /** Total Essence earned all-time. */
  totalEssenceEarned: number;
  /** Total Essence spent all-time. */
  totalEssenceSpent: number;
  /** Whether Transcendence has been unlocked (10+ Rebirths AND Zone 150+). */
  transcendenceUnlocked: boolean;
}

// -----------------------------------------------------------------------------
// Resource State
// -----------------------------------------------------------------------------

/** All four game currencies. */
export interface Resources {
  /** Primary currency — earned by tapping and idle production. Reset on Rebirth. */
  sunlight: number;
  /** Prestige 1 currency — earned on Rebirth. Reset on Transcendence. */
  nectar: number;
  /** Prestige 2 currency — earned on Transcendence. Never reset. */
  essence: number;
  /** Ad currency — earned by watching rewarded ads. Never reset. */
  dewdrops: number;
  /** Total Sunlight earned all-time (for achievements, never resets). */
  totalSunlightEarned: number;
  /** Total Sunlight earned this run (reset on Rebirth). */
  runSunlightEarned: number;
}

// -----------------------------------------------------------------------------
// Retention & Daily State
// -----------------------------------------------------------------------------

/** Daily login and streak tracking. */
export interface DailyState {
  /** Current position in the 7-day login reward cycle (1-7). */
  loginCycleDay: number;
  /** How many full 7-day cycles the player has completed. */
  loginCyclesCompleted: number;
  /** Whether today's login reward has been collected. */
  todayRewardCollected: boolean;
  /** Consecutive days of opening the app (streak counter). */
  streakDays: number;
  /** Date string (YYYY-MM-DD) of the last day the app was opened. */
  lastOpenDate: string;
  /** Number of ads watched today. */
  adsWatchedToday: number;
  /** Daily ad cap (15 per day). */
  dailyAdCap: number;
  /** Consecutive days of watching at least 1 ad (ad streak). */
  adStreakDays: number;
  /** Whether the streak shield has been used this week. */
  streakShieldUsedThisWeek: boolean;
  /**
   * ms timestamp of the last Dewdrop Garden ad reward. Drives the 3-minute
   * cooldown between Dewdrop earn ads. `null` if no ad has been watched yet.
   */
  lastDewdropAdAt: number | null;
}

// -----------------------------------------------------------------------------
// Settings & Meta
// -----------------------------------------------------------------------------

/** Player-configurable game settings. */
export interface GameSettings {
  /** Master volume (0.0 to 1.0). */
  masterVolume: number;
  /** Sound effects enabled. */
  sfxEnabled: boolean;
  /** Music enabled. */
  musicEnabled: boolean;
  /** Haptic feedback enabled. */
  hapticsEnabled: boolean;
  /** Notification preferences by category. */
  notifications: {
    offlineEarnings: boolean;
    streakReminder: boolean;
    boostExpired: boolean;
    milestoneClose: boolean;
    newBloomlingHint: boolean;
  };
  /** Currently selected buy multiplier in shops. */
  buyMultiplier: BuyMultiplier;
  /** Whether number formatting uses abbreviated notation (e.g., 1.5M). */
  abbreviateNumbers: boolean;
  /** Whether the player has completed the tutorial. */
  tutorialCompleted: boolean;
}

/** Statistics tracked for display and achievements. */
export interface GameStats {
  /** Total taps all-time. */
  totalTaps: number;
  /** Total critical taps all-time. */
  totalCriticalTaps: number;
  /** Highest combo achieved all-time. */
  highestCombo: number;
  /** Total time played in milliseconds. */
  totalPlayTimeMs: number;
  /** Total ads watched all-time. */
  totalAdsWatched: number;
  /** Total Bloomlings discovered. */
  bloomlingsDiscovered: number;
  /** Total synergies discovered (length of `discoveredSynergyIds`). */
  synergiesDiscovered: number;
  /**
   * All synergy IDs the player has ever activated. Uses the engine's ID
   * scheme: `tag:<Tag>` for tag synergies, `synergy_<name>` for named pair
   * synergies. Feeds the Dewdrop "first discovery" reward in Phase 5.
   */
  discoveredSynergyIds: string[];
  /** Total achievements completed. */
  achievementsCompleted: number;
  /** Total zones cleared all-time (across all runs). */
  totalZonesCleared: number;
  /** Total gate zones cleared all-time. */
  totalGatesCleared: number;
  /** Total bosses defeated all-time. */
  totalBossesDefeated: number;
}

// -----------------------------------------------------------------------------
// Zone & Boss Runtime State
// -----------------------------------------------------------------------------

/** Current zone progression state. */
export interface ZoneProgressState {
  /** Current zone number the player is on. */
  currentZone: number;
  /** Sunlight generated toward the current zone's threshold. */
  currentZoneProgress: number;
  /** Whether a gate zone is currently active (timer running). */
  gateActive: boolean;
  /** Remaining gate timer in milliseconds, or null. */
  gateTimerRemainingMs: number | null;
  /** Number of failed attempts on the current gate (for stacking 5% bonus). */
  gateFailCount: number;
  /** Whether a boss fight is currently active. */
  bossActive: boolean;
  /** Boss HP remaining, or null if no boss fight. */
  bossHpRemaining: number | null;
  /** Boss max HP for the current fight, or null. */
  bossHpMax: number | null;
  /** Remaining boss fight timer in milliseconds, or null. */
  bossTimerRemainingMs: number | null;
  /** Number of failed attempts on the current boss (for stacking 5% bonus, max 50%). */
  bossFailCount: number;
}

// -----------------------------------------------------------------------------
// Garden State
// -----------------------------------------------------------------------------

/** Tracks the Garden (active Bloomling roster). */
export interface GardenState {
  /** Maximum number of Garden slots currently available. */
  maxSlots: number;
  /** Ordered array of Bloomling instance IDs in each slot (null = empty slot). */
  slots: (string | null)[];
  /** Currently active synergy IDs. */
  activeSynergyIds: string[];
  /** Biome special mechanic meter progress (0.0 to 1.0), if applicable. */
  specialMeterProgress: number;
}

// -----------------------------------------------------------------------------
// Game State (Full Zustand Store Shape)
// -----------------------------------------------------------------------------

/** Complete game state — the full shape of the Zustand store. */
export interface GameState {
  // --- Core Resources ---
  /** All four game currencies and earning trackers. */
  resources: Resources;

  // --- Bloomlings ---
  /** Map of all player-owned Bloomling instances, keyed by instanceId. */
  bloomlings: Record<string, Bloomling>;

  // --- Garden ---
  /** Active Bloomling roster and synergy state. */
  garden: GardenState;

  // --- Upgrades ---
  /** Map of all purchased upgrades, keyed by templateId. */
  upgrades: Record<string, Upgrade>;

  // --- Perks ---
  /** Map of all Dewdrop shop perks, keyed by perk id. */
  perks: Record<string, Perk>;

  // --- Zone Progression ---
  /** Current zone, gate, and boss state. */
  zoneProgress: ZoneProgressState;

  // --- Prestige ---
  /** Rebirth and Transcendence state. */
  prestige: PrestigeState;

  // --- Combo / Tap ---
  /** Active combo state (transient, not saved — rebuilt on app open). */
  combo: ComboState;

  // --- Active Boosts ---
  /** Currently active timed boosts from ads. */
  activeBoosts: ActiveBoost[];

  // --- Ads ---
  /** State of each ad touchpoint (availability, cooldowns). */
  adStates: Record<AdTouchpoint, AdRewardConfig>;

  // --- Daily / Retention ---
  /** Daily login, streak, and ad tracking. */
  daily: DailyState;

  // --- Achievements ---
  /** Map of all achievements, keyed by achievement id. */
  achievements: Record<string, Achievement>;

  // --- Synergies ---
  /** Map of all synergy definitions, keyed by synergy id. */
  synergies: Record<string, Synergy>;

  // --- Stats ---
  /** Lifetime statistics for display and achievement tracking. */
  stats: GameStats;

  // --- Settings ---
  /** Player-configurable settings. */
  settings: GameSettings;

  // --- Meta ---
  /** Timestamp (ms since epoch) of the last game tick. Used for delta-time and offline calc. */
  lastTickAt: number;
  /** Timestamp (ms since epoch) when the app was last in the foreground. */
  lastActiveAt: number;
  /** Whether the game engine is currently running (app is in foreground). */
  engineRunning: boolean;
  /** Feature unlock flags — tracks which features have been revealed to the player. */
  unlockedFeatures: {
    tapUpgradeShop: boolean;
    idleUpgradeShop: boolean;
    bloomlingEvolution: boolean;
    adRewards: boolean;
    dewdropShop: boolean;
    synergies: boolean;
    rebirth: boolean;
    elderEvolution: boolean;
    transcendence: boolean;
  };
}

// -----------------------------------------------------------------------------
// Save Data
// -----------------------------------------------------------------------------

/** Serializable save format — wraps GameState with metadata for persistence. */
export interface SaveData {
  /** Save format version (for migration support). */
  version: number;
  /** Timestamp (ms since epoch) when this save was created. */
  savedAt: number;
  /** The full game state snapshot. */
  state: Omit<GameState, "combo" | "engineRunning">;
  /** Checksum for basic integrity validation. */
  checksum: string;
}

// -----------------------------------------------------------------------------
// Computed / Derived Types (not stored, calculated at runtime)
// -----------------------------------------------------------------------------

/** Computed production rates — derived from current state. */
export interface ProductionRates {
  /** Total Sunlight per second from all Garden Bloomlings (before boosts). */
  baseIdleRate: number;
  /** Total Sunlight per second after all multipliers (Nectar, Essence, boosts). */
  totalIdleRate: number;
  /** Current tap value (before combo and crit). */
  baseTapValue: number;
  /** Current tap multiplier from upgrades and prestige. */
  tapMultiplier: number;
  /** Current critical tap chance (0.0 to 1.0). */
  critChance: number;
  /** Current critical tap multiplier. */
  critMultiplier: number;
  /** Current combo multiplier: 1 + (comboCount * 0.05). */
  comboMultiplier: number;
}

/** Preview of what a Rebirth would yield at the current moment. */
export interface RebirthPreview {
  /** Nectar that would be earned. */
  nectarEarned: number;
  /** Percentage increase over player's current Nectar total. */
  percentageIncrease: number;
  /** Whether this Rebirth is "recommended" (2x+ current total). */
  recommended: boolean;
  /** How much more Nectar if the player pushed N more zones. */
  projections: ReadonlyArray<{ additionalZones: number; nectarEarned: number }>;
}

/** Preview of what a Transcendence would yield. */
export interface TranscendencePreview {
  /** Essence that would be earned. */
  essenceEarned: number;
  /** Whether the player meets unlock requirements. */
  eligible: boolean;
  /** Reason(s) the player is not eligible, if any. */
  ineligibleReasons: string[];
}

/**
 * Transient summary of the most recent offline session.
 * Written by the game loop on foreground, read by the Welcome Back modal,
 * and cleared on dismiss. Not persisted to disk.
 */
export interface OfflineSessionSummary {
  /** Sunlight credited to the player for this offline window. */
  sunlightEarned: number;
  /** Duration (ms) actually used in the calc, after the 24h cap. */
  durationMs: number;
  /** Whether the raw away time exceeded the 24h cap. */
  wasCapped: boolean;
  /** Effective efficiency fraction applied (0.5 base, up to 1.0 with Cosmic Roots). */
  efficiency: number;
}
