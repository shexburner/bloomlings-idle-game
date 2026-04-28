import { BiomeType } from '~/types/game';

export enum BiomeMechanicType {
  None = 'none',
  Sunbursts = 'sunbursts',
  Luminescence = 'luminescence',
  Resonance = 'resonance',
  EruptionSurge = 'eruption_surge',
  PressureTide = 'pressure_tide',
  Windfall = 'windfall',
  ThawCycle = 'thaw_cycle',
}

export interface BiomeMechanicState {
  sunburstNextSpawnAt: number | null;
  sunburstActiveUntil: number | null;
  glowMeterPercent: number;
  glowMeterCooldownUntil: number | null;
  eruptionSurgeActiveUntil: number | null;
  eruptionNextSurgeAt: number | null;
  pressurePercent: number;
  pressureCooldownUntil: number | null;
  windfallEventActiveUntil: number | null;
  windfallNextEventAt: number | null;
  windfallBuffStacks: number;
  windfallBuffExpiresAt: number | null;
  frostPenaltyPercent: number;
  warmthPercent: number;
  thawBloomCooldownUntil: number | null;
}

export function initialBiomeMechanicState(): BiomeMechanicState {
  return {
    sunburstNextSpawnAt: null,
    sunburstActiveUntil: null,
    glowMeterPercent: 0,
    glowMeterCooldownUntil: null,
    eruptionSurgeActiveUntil: null,
    eruptionNextSurgeAt: null,
    pressurePercent: 0,
    pressureCooldownUntil: null,
    windfallEventActiveUntil: null,
    windfallNextEventAt: null,
    windfallBuffStacks: 0,
    windfallBuffExpiresAt: null,
    frostPenaltyPercent: 0,
    warmthPercent: 0,
    thawBloomCooldownUntil: null,
  };
}

const BIOME_ZONE_RANGES: readonly [number, number, BiomeType][] = [
  [1, 25, BiomeType.MossyCradle],
  [26, 50, BiomeType.SunlitGlade],
  [51, 75, BiomeType.TwilightHollow],
  [76, 100, BiomeType.CrystalCaverns],
  [101, 125, BiomeType.ScorchedExpanse],
  [126, 150, BiomeType.AbyssalDepths],
  [151, 175, BiomeType.CelestialCanopy],
  [176, 200, BiomeType.FrozenThicket],
];

export function getCurrentBiome(zone: number): BiomeType {
  for (const [start, end, biome] of BIOME_ZONE_RANGES) {
    if (zone >= start && zone <= end) return biome;
  }
  return BiomeType.FrozenThicket;
}

const BIOME_MECHANIC_MAP: Record<BiomeType, BiomeMechanicType> = {
  [BiomeType.MossyCradle]: BiomeMechanicType.None,
  [BiomeType.SunlitGlade]: BiomeMechanicType.Sunbursts,
  [BiomeType.TwilightHollow]: BiomeMechanicType.Luminescence,
  [BiomeType.CrystalCaverns]: BiomeMechanicType.Resonance,
  [BiomeType.ScorchedExpanse]: BiomeMechanicType.EruptionSurge,
  [BiomeType.AbyssalDepths]: BiomeMechanicType.PressureTide,
  [BiomeType.CelestialCanopy]: BiomeMechanicType.Windfall,
  [BiomeType.FrozenThicket]: BiomeMechanicType.ThawCycle,
  [BiomeType.Universal]: BiomeMechanicType.None,
};

export function getBiomeMechanic(biome: BiomeType): BiomeMechanicType {
  return BIOME_MECHANIC_MAP[biome];
}

export interface BiomeMechanicTickResult {
  newState: BiomeMechanicState;
  idleMultiplier: number;
  tapMultiplier: number;
  sunlightBurst: number;
}

function defaultResult(state: BiomeMechanicState): BiomeMechanicTickResult {
  return { newState: { ...state }, idleMultiplier: 1, tapMultiplier: 1, sunlightBurst: 0 };
}

function tickSunbursts(
  state: BiomeMechanicState,
  now: number,
): BiomeMechanicTickResult {
  const r = defaultResult(state);
  const s = r.newState;
  if (s.sunburstActiveUntil !== null && now >= s.sunburstActiveUntil) {
    s.sunburstActiveUntil = null;
  }
  if (s.sunburstNextSpawnAt === null && s.sunburstActiveUntil === null) {
    s.sunburstNextSpawnAt = now + 15000 + Math.random() * 15000;
  }
  if (s.sunburstNextSpawnAt !== null && now >= s.sunburstNextSpawnAt) {
    s.sunburstActiveUntil = now + 4000;
    s.sunburstNextSpawnAt = null;
  }
  return r;
}

function tickLuminescence(
  state: BiomeMechanicState,
  deltaMs: number,
  now: number,
  gardenBloomlingCount: number,
): BiomeMechanicTickResult {
  const r = defaultResult(state);
  const s = r.newState;
  if (s.glowMeterCooldownUntil !== null) {
    if (now >= s.glowMeterCooldownUntil) {
      s.glowMeterCooldownUntil = null;
    } else {
      return r;
    }
  }
  const chargeRate = gardenBloomlingCount / 10;
  s.glowMeterPercent = Math.min(100, s.glowMeterPercent + chargeRate * (deltaMs / 1000));
  return r;
}

function tickEruptionSurge(
  state: BiomeMechanicState,
  now: number,
): BiomeMechanicTickResult {
  const r = defaultResult(state);
  const s = r.newState;
  if (s.eruptionSurgeActiveUntil !== null) {
    if (now >= s.eruptionSurgeActiveUntil) {
      s.eruptionSurgeActiveUntil = null;
      s.eruptionNextSurgeAt = now + 45000;
      r.idleMultiplier = 0.5;
    } else {
      r.idleMultiplier = 2.0;
    }
    return r;
  }
  if (s.eruptionNextSurgeAt === null) {
    s.eruptionNextSurgeAt = now + 45000;
    r.idleMultiplier = 0.5;
    return r;
  }
  if (now >= s.eruptionNextSurgeAt) {
    s.eruptionSurgeActiveUntil = now + 8000;
    s.eruptionNextSurgeAt = null;
    r.idleMultiplier = 2.0;
  } else {
    r.idleMultiplier = 0.5;
  }
  return r;
}

function tickPressureTide(
  state: BiomeMechanicState,
  deltaMs: number,
  now: number,
  idlePerSecond: number,
): BiomeMechanicTickResult {
  const r = defaultResult(state);
  const s = r.newState;
  if (s.pressureCooldownUntil !== null) {
    if (now >= s.pressureCooldownUntil) {
      s.pressureCooldownUntil = null;
    } else {
      return r;
    }
  }
  s.pressurePercent = Math.min(100, s.pressurePercent + (deltaMs / 1000));
  if (s.pressurePercent >= 100) {
    r.sunlightBurst = 0.5 * 60 * idlePerSecond;
    s.pressurePercent = 0;
    s.pressureCooldownUntil = now + 30000;
  }
  return r;
}

function tickWindfall(
  state: BiomeMechanicState,
  now: number,
): BiomeMechanicTickResult {
  const r = defaultResult(state);
  const s = r.newState;
  if (s.windfallBuffExpiresAt !== null && now >= s.windfallBuffExpiresAt) {
    s.windfallBuffStacks = 0;
    s.windfallBuffExpiresAt = null;
  }
  if (s.windfallEventActiveUntil !== null) {
    if (now >= s.windfallEventActiveUntil) {
      s.windfallBuffStacks += 1;
      s.windfallBuffExpiresAt = now + 30000;
      s.windfallEventActiveUntil = null;
      s.windfallNextEventAt = now + 60000;
    }
  } else {
    if (s.windfallNextEventAt === null) {
      s.windfallNextEventAt = now + 60000;
    }
    if (now >= s.windfallNextEventAt) {
      s.windfallEventActiveUntil = now + 10000;
      s.windfallNextEventAt = null;
    }
  }
  r.idleMultiplier = 1 + s.windfallBuffStacks * 0.05;
  return r;
}

function tickThawCycle(
  state: BiomeMechanicState,
  deltaMs: number,
  now: number,
  idlePerSecond: number,
): BiomeMechanicTickResult {
  const r = defaultResult(state);
  const s = r.newState;
  const warmthDecay = (deltaMs / 3000);
  s.warmthPercent = Math.max(0, s.warmthPercent - warmthDecay);
  if (s.warmthPercent < 50) {
    const frostAccum = 2 * (deltaMs / 10000);
    s.frostPenaltyPercent = Math.min(50, s.frostPenaltyPercent + frostAccum);
  }
  if (s.warmthPercent >= 100) {
    r.sunlightBurst = 90 * idlePerSecond;
    s.warmthPercent = 50;
    s.frostPenaltyPercent = 0;
  }
  if (s.warmthPercent >= 80) {
    r.idleMultiplier = 1.2;
  }
  return r;
}

export function biomeMechanicTick(
  biome: BiomeType,
  state: BiomeMechanicState,
  deltaMs: number,
  now: number,
  gardenBloomlingCount: number,
  idlePerSecond: number,
): BiomeMechanicTickResult {
  const mechanic = getBiomeMechanic(biome);
  switch (mechanic) {
    case BiomeMechanicType.Sunbursts:
      return tickSunbursts(state, now);
    case BiomeMechanicType.Luminescence:
      return tickLuminescence(state, deltaMs, now, gardenBloomlingCount);
    case BiomeMechanicType.Resonance:
      return { ...defaultResult(state), tapMultiplier: 1.3 };
    case BiomeMechanicType.EruptionSurge:
      return tickEruptionSurge(state, now);
    case BiomeMechanicType.PressureTide:
      return tickPressureTide(state, deltaMs, now, idlePerSecond);
    case BiomeMechanicType.Windfall:
      return tickWindfall(state, now);
    case BiomeMechanicType.ThawCycle:
      return tickThawCycle(state, deltaMs, now, idlePerSecond);
    default:
      return defaultResult(state);
  }
}

// ---------------------------------------------------------------------------
// Legacy helpers (used by BiomeMechanicHUD)
// ---------------------------------------------------------------------------

export interface BiomeMechanicInfo {
  readonly id: BiomeType;
  readonly name: string;
  readonly startZone: number;
  readonly endZone: number;
  readonly mechanicName: string | null;
}

const BIOME_LIST: readonly BiomeMechanicInfo[] = [
  { id: BiomeType.MossyCradle, name: "The Mossy Cradle", startZone: 1, endZone: 25, mechanicName: null },
  { id: BiomeType.SunlitGlade, name: "Sunlit Glade", startZone: 26, endZone: 50, mechanicName: "Sunburst" },
  { id: BiomeType.TwilightHollow, name: "Twilight Hollow", startZone: 51, endZone: 75, mechanicName: "Luminescence" },
  { id: BiomeType.CrystalCaverns, name: "Crystal Caverns", startZone: 76, endZone: 100, mechanicName: "Resonance" },
  { id: BiomeType.ScorchedExpanse, name: "Scorched Expanse", startZone: 101, endZone: 125, mechanicName: "Heatwave" },
  { id: BiomeType.AbyssalDepths, name: "Abyssal Depths", startZone: 126, endZone: 150, mechanicName: "Pressure" },
  { id: BiomeType.CelestialCanopy, name: "Celestial Canopy", startZone: 151, endZone: 175, mechanicName: "Starfall" },
  { id: BiomeType.FrozenThicket, name: "Frozen Thicket", startZone: 176, endZone: 200, mechanicName: "Permafrost" },
];

export function getCurrentBiomeInfo(zoneNumber: number): BiomeMechanicInfo {
  return BIOME_LIST.find((b) => zoneNumber >= b.startZone && zoneNumber <= b.endZone) ?? BIOME_LIST[0]!;
}

export function getBiomeIndex(zoneNumber: number): number {
  const idx = BIOME_LIST.findIndex((b) => zoneNumber >= b.startZone && zoneNumber <= b.endZone);
  return idx >= 0 ? idx + 1 : 1;
}

export { BIOME_LIST };

/** Check if the player has reached a specific biome (by BiomeType). */
export function hasReachedBiome(currentZone: number, biome: BiomeType): boolean {
  const info = BIOME_LIST.find((b) => b.id === biome);
  if (!info) return false;
  return currentZone >= info.startZone;
}

/** Get biome display name by BiomeType. */
export function getBiomeNameByType(biome: BiomeType): string {
  return BIOME_LIST.find((b) => b.id === biome)?.name ?? "Unknown";
}
