import { EvolutionStage, UnlockMethod } from "~/types/game";
import type { Bloomling } from "~/types/game";
import {
  parseUnlockCondition,
  createBloomlingInstance,
  getZoneUnlockTemplates,
} from "../discovery";
import { BLOOMLING_TEMPLATES } from "~/data/bloomlingTemplates";

// ---------------------------------------------------------------------------
// parseUnlockCondition
// ---------------------------------------------------------------------------

describe("parseUnlockCondition", () => {
  it("parses 'zone_1' correctly", () => {
    expect(parseUnlockCondition("zone_1")).toEqual({ kind: "zone", zone: 1 });
  });

  it("parses 'zone_25' correctly", () => {
    expect(parseUnlockCondition("zone_25")).toEqual({ kind: "zone", zone: 25 });
  });

  it("parses 'boss_biome1' correctly", () => {
    expect(parseUnlockCondition("boss_biome1")).toEqual({
      kind: "boss",
      biomeIndex: 1,
    });
  });

  it("parses 'boss_biome4' correctly", () => {
    expect(parseUnlockCondition("boss_biome4")).toEqual({
      kind: "boss",
      biomeIndex: 4,
    });
  });

  it("returns null for unknown formats", () => {
    expect(parseUnlockCondition("random_string")).toBeNull();
    expect(parseUnlockCondition("")).toBeNull();
    expect(parseUnlockCondition("zone_")).toBeNull();
    expect(parseUnlockCondition("boss_biome")).toBeNull();
  });

  it("returns null for zone_0 (zone must be > 0)", () => {
    expect(parseUnlockCondition("zone_0")).toBeNull();
  });

  it("returns null for boss_biome0 (biomeIndex must be > 0)", () => {
    expect(parseUnlockCondition("boss_biome0")).toBeNull();
  });

  it("handles large zone numbers", () => {
    expect(parseUnlockCondition("zone_150")).toEqual({ kind: "zone", zone: 150 });
  });
});

// ---------------------------------------------------------------------------
// createBloomlingInstance
// ---------------------------------------------------------------------------

describe("createBloomlingInstance", () => {
  const fernleyTemplate = BLOOMLING_TEMPLATES.find((t) => t.id === "fernley")!;

  it("creates a Bloomling with correct templateId and instanceId", () => {
    const b = createBloomlingInstance(fernleyTemplate);
    expect(b.templateId).toBe("fernley");
    expect(b.instanceId).toBe("fernley-1");
  });

  it("creates a Bloomling at level 1 and Sprout stage", () => {
    const b = createBloomlingInstance(fernleyTemplate);
    expect(b.level).toBe(1);
    expect(b.evolutionStage).toBe(EvolutionStage.Sprout);
  });

  it("creates a Bloomling that is unlocked and not in garden", () => {
    const b = createBloomlingInstance(fernleyTemplate);
    expect(b.unlocked).toBe(true);
    expect(b.inGarden).toBe(false);
    expect(b.gardenSlot).toBeNull();
  });

  it("starts totalProduced at 0", () => {
    const b = createBloomlingInstance(fernleyTemplate);
    expect(b.totalProduced).toBe(0);
  });

  it("is idempotent: two calls produce the same instanceId", () => {
    const b1 = createBloomlingInstance(fernleyTemplate);
    const b2 = createBloomlingInstance(fernleyTemplate);
    expect(b1.instanceId).toBe(b2.instanceId);
  });
});

// ---------------------------------------------------------------------------
// getZoneUnlockTemplates
// ---------------------------------------------------------------------------

describe("getZoneUnlockTemplates", () => {
  const empty: Record<string, Bloomling> = {};

  it("returns fernley at zone 1 (zone_1 unlock)", () => {
    const result = getZoneUnlockTemplates(1, empty);
    const ids = result.map((t) => t.id);
    expect(ids).toContain("fernley");
  });

  it("returns mosswick at zone 3 (zone_3 unlock)", () => {
    const result = getZoneUnlockTemplates(3, empty);
    const ids = result.map((t) => t.id);
    expect(ids).toContain("mosswick");
    expect(ids).toContain("fernley"); // zone_1 also included
  });

  it("does not return templates for zones beyond currentZone", () => {
    const result = getZoneUnlockTemplates(1, empty);
    const ids = result.map((t) => t.id);
    expect(ids).not.toContain("mosswick"); // requires zone_3
  });

  it("excludes templates the player already owns", () => {
    const owned: Record<string, Bloomling> = {
      "fernley-1": {
        templateId: "fernley",
        instanceId: "fernley-1",
        level: 1,
        evolutionStage: EvolutionStage.Sprout,
        inGarden: false,
        gardenSlot: null,
        unlocked: true,
        totalProduced: 0,
      },
    };
    const result = getZoneUnlockTemplates(1, owned);
    const ids = result.map((t) => t.id);
    expect(ids).not.toContain("fernley");
  });

  it("only includes ZoneMilestone unlock method templates", () => {
    const result = getZoneUnlockTemplates(999, empty);
    for (const t of result) {
      expect(t.unlockMethod).toBe(UnlockMethod.ZoneMilestone);
    }
  });

  it("returns an empty array when player owns all zone-unlocked templates for that zone", () => {
    // At zone 1, only fernley is available
    const fernleyOwned: Record<string, Bloomling> = {
      "fernley-1": {
        templateId: "fernley",
        instanceId: "fernley-1",
        level: 1,
        evolutionStage: EvolutionStage.Sprout,
        inGarden: false,
        gardenSlot: null,
        unlocked: true,
        totalProduced: 0,
      },
    };
    const result = getZoneUnlockTemplates(1, fernleyOwned);
    const ids = result.map((t) => t.id);
    expect(ids).not.toContain("fernley");
  });
});
