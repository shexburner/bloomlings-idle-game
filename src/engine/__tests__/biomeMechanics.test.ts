import { BiomeType } from '~/types/game';
import {
  getCurrentBiome,
  getBiomeMechanic,
  BiomeMechanicType,
  initialBiomeMechanicState,
  biomeMechanicTick,
} from '../biomeMechanics';

describe('getCurrentBiome', () => {
  it.each([
    [1, BiomeType.MossyCradle],
    [25, BiomeType.MossyCradle],
    [26, BiomeType.SunlitGlade],
    [50, BiomeType.SunlitGlade],
    [51, BiomeType.TwilightHollow],
    [75, BiomeType.TwilightHollow],
    [76, BiomeType.CrystalCaverns],
    [100, BiomeType.CrystalCaverns],
    [101, BiomeType.ScorchedExpanse],
    [125, BiomeType.ScorchedExpanse],
    [126, BiomeType.AbyssalDepths],
    [150, BiomeType.AbyssalDepths],
    [151, BiomeType.CelestialCanopy],
    [175, BiomeType.CelestialCanopy],
    [176, BiomeType.FrozenThicket],
    [200, BiomeType.FrozenThicket],
    [201, BiomeType.FrozenThicket],
    [999, BiomeType.FrozenThicket],
  ])('zone %i -> %s', (zone, expected) => {
    expect(getCurrentBiome(zone)).toBe(expected);
  });
});

describe('getBiomeMechanic', () => {
  it.each([
    [BiomeType.MossyCradle, BiomeMechanicType.None],
    [BiomeType.SunlitGlade, BiomeMechanicType.Sunbursts],
    [BiomeType.TwilightHollow, BiomeMechanicType.Luminescence],
    [BiomeType.CrystalCaverns, BiomeMechanicType.Resonance],
    [BiomeType.ScorchedExpanse, BiomeMechanicType.EruptionSurge],
    [BiomeType.AbyssalDepths, BiomeMechanicType.PressureTide],
    [BiomeType.CelestialCanopy, BiomeMechanicType.Windfall],
    [BiomeType.FrozenThicket, BiomeMechanicType.ThawCycle],
    [BiomeType.Universal, BiomeMechanicType.None],
  ])('%s -> %s', (biome, expected) => {
    expect(getBiomeMechanic(biome)).toBe(expected);
  });
});

describe('initialBiomeMechanicState', () => {
  it('returns all zeros and nulls', () => {
    const s = initialBiomeMechanicState();
    expect(s.sunburstNextSpawnAt).toBeNull();
    expect(s.sunburstActiveUntil).toBeNull();
    expect(s.glowMeterPercent).toBe(0);
    expect(s.glowMeterCooldownUntil).toBeNull();
    expect(s.eruptionSurgeActiveUntil).toBeNull();
    expect(s.eruptionNextSurgeAt).toBeNull();
    expect(s.pressurePercent).toBe(0);
    expect(s.pressureCooldownUntil).toBeNull();
    expect(s.windfallEventActiveUntil).toBeNull();
    expect(s.windfallNextEventAt).toBeNull();
    expect(s.windfallBuffStacks).toBe(0);
    expect(s.windfallBuffExpiresAt).toBeNull();
    expect(s.frostPenaltyPercent).toBe(0);
    expect(s.warmthPercent).toBe(0);
    expect(s.thawBloomCooldownUntil).toBeNull();
  });
});

describe('Resonance', () => {
  it('returns tapMultiplier 1.3', () => {
    const result = biomeMechanicTick(
      BiomeType.CrystalCaverns,
      initialBiomeMechanicState(),
      1000, Date.now(), 0, 0,
    );
    expect(result.tapMultiplier).toBe(1.3);
    expect(result.idleMultiplier).toBe(1);
    expect(result.sunlightBurst).toBe(0);
  });
});

describe('EruptionSurge', () => {
  it('starts with 0.5x idle (between surges)', () => {
    const now = 100000;
    const result = biomeMechanicTick(
      BiomeType.ScorchedExpanse,
      initialBiomeMechanicState(),
      1000, now, 0, 100,
    );
    expect(result.idleMultiplier).toBe(0.5);
    expect(result.newState.eruptionNextSurgeAt).toBe(now + 45000);
  });

  it('activates surge at scheduled time with 2.0x idle', () => {
    const now = 100000;
    const state = { ...initialBiomeMechanicState(), eruptionNextSurgeAt: now - 1 };
    const result = biomeMechanicTick(
      BiomeType.ScorchedExpanse, state, 1000, now, 0, 100,
    );
    expect(result.idleMultiplier).toBe(2.0);
    expect(result.newState.eruptionSurgeActiveUntil).toBe(now + 8000);
    expect(result.newState.eruptionNextSurgeAt).toBeNull();
  });

  it('returns 2.0x during active surge', () => {
    const now = 100000;
    const state = { ...initialBiomeMechanicState(), eruptionSurgeActiveUntil: now + 5000 };
    const result = biomeMechanicTick(
      BiomeType.ScorchedExpanse, state, 1000, now, 0, 100,
    );
    expect(result.idleMultiplier).toBe(2.0);
  });

  it('returns 0.5x after surge expires and schedules next', () => {
    const now = 100000;
    const state = { ...initialBiomeMechanicState(), eruptionSurgeActiveUntil: now - 1 };
    const result = biomeMechanicTick(
      BiomeType.ScorchedExpanse, state, 1000, now, 0, 100,
    );
    expect(result.idleMultiplier).toBe(0.5);
    expect(result.newState.eruptionNextSurgeAt).toBe(now + 45000);
  });
});

describe('PressureTide', () => {
  it('fills pressure at 1%/s', () => {
    const result = biomeMechanicTick(
      BiomeType.AbyssalDepths,
      initialBiomeMechanicState(),
      10000, Date.now(), 0, 100,
    );
    expect(result.newState.pressurePercent).toBeCloseTo(10);
    expect(result.sunlightBurst).toBe(0);
  });

  it('auto-releases at 100% with burst and cooldown', () => {
    const now = 100000;
    const state = { ...initialBiomeMechanicState(), pressurePercent: 99.5 };
    const result = biomeMechanicTick(
      BiomeType.AbyssalDepths, state, 1000, now, 0, 200,
    );
    // 99.5 + 1 = 100.5 >= 100 -> release
    expect(result.newState.pressurePercent).toBe(0);
    expect(result.sunlightBurst).toBe(0.5 * 60 * 200); // 6000
    expect(result.newState.pressureCooldownUntil).toBe(now + 30000);
  });

  it('does not fill during cooldown', () => {
    const now = 100000;
    const state = {
      ...initialBiomeMechanicState(),
      pressurePercent: 0,
      pressureCooldownUntil: now + 10000,
    };
    const result = biomeMechanicTick(
      BiomeType.AbyssalDepths, state, 5000, now, 0, 100,
    );
    expect(result.newState.pressurePercent).toBe(0);
  });
});

describe('ThawCycle', () => {
  it('accumulates frost when warmth < 50', () => {
    const state = { ...initialBiomeMechanicState(), warmthPercent: 0 };
    const result = biomeMechanicTick(
      BiomeType.FrozenThicket, state, 10000, Date.now(), 0, 100,
    );
    // Frost: 2 * (10000/10000) = 2
    expect(result.newState.frostPenaltyPercent).toBeCloseTo(2);
  });

  it('caps frost at 50%', () => {
    const state = { ...initialBiomeMechanicState(), frostPenaltyPercent: 49.5 };
    const result = biomeMechanicTick(
      BiomeType.FrozenThicket, state, 10000, Date.now(), 0, 100,
    );
    expect(result.newState.frostPenaltyPercent).toBe(50);
  });

  it('pauses frost when warmth >= 50', () => {
    // warmth 60 decays by 1%/3s over 1s = ~0.33, so stays above 50
    const state = { ...initialBiomeMechanicState(), warmthPercent: 60, frostPenaltyPercent: 10 };
    const result = biomeMechanicTick(
      BiomeType.FrozenThicket, state, 1000, Date.now(), 0, 100,
    );
    // Frost should not increase
    expect(result.newState.frostPenaltyPercent).toBe(10);
  });

  it('returns idleMultiplier 1.2 when warmth >= 80', () => {
    // warmth 85 decays by ~0.33 over 1s -> ~84.67, still >= 80
    const state = { ...initialBiomeMechanicState(), warmthPercent: 85 };
    const result = biomeMechanicTick(
      BiomeType.FrozenThicket, state, 1000, Date.now(), 0, 100,
    );
    expect(result.idleMultiplier).toBe(1.2);
  });

  it('bursts at warmth 100, resets warmth to 50 and frost to 0', () => {
    const state = { ...initialBiomeMechanicState(), warmthPercent: 100.5, frostPenaltyPercent: 30 };
    const result = biomeMechanicTick(
      BiomeType.FrozenThicket, state, 100, Date.now(), 0, 200,
    );
    // Warmth decays slightly but stays >= 100 with 100ms delta: 100.5 - (100/3000) ≈ 100.47
    expect(result.sunlightBurst).toBe(90 * 200);
    expect(result.newState.warmthPercent).toBe(50);
    expect(result.newState.frostPenaltyPercent).toBe(0);
  });

  it('decays warmth over time', () => {
    const state = { ...initialBiomeMechanicState(), warmthPercent: 30 };
    const result = biomeMechanicTick(
      BiomeType.FrozenThicket, state, 3000, Date.now(), 0, 100,
    );
    // Decay: 3000/3000 = 1% -> 29
    expect(result.newState.warmthPercent).toBeCloseTo(29);
  });
});

describe('MossyCradle (None)', () => {
  it('returns default multipliers', () => {
    const result = biomeMechanicTick(
      BiomeType.MossyCradle,
      initialBiomeMechanicState(),
      1000, Date.now(), 0, 0,
    );
    expect(result.idleMultiplier).toBe(1);
    expect(result.tapMultiplier).toBe(1);
    expect(result.sunlightBurst).toBe(0);
  });
});
