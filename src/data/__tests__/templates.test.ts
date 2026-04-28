import {
  ACHIEVEMENT_TEMPLATES,
  ACHIEVEMENT_TEMPLATE_MAP,
  buildInitialAchievements,
} from "~/data/achievementTemplates";
import {
  BLOOMLING_TEMPLATES,
  BLOOMLING_TEMPLATE_MAP,
} from "~/data/bloomlingTemplates";
import {
  PERK_TEMPLATES,
  PERK_TEMPLATE_MAP,
} from "~/data/perkTemplates";

// ---------------------------------------------------------------------------
// Achievement Templates
// ---------------------------------------------------------------------------

describe("Achievement Templates", () => {
  it("all achievement IDs are unique", () => {
    const ids = ACHIEVEMENT_TEMPLATES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all achievements have non-empty names", () => {
    for (const a of ACHIEVEMENT_TEMPLATES) {
      expect(a.name.length).toBeGreaterThan(0);
    }
  });

  it("all achievements have non-empty descriptions", () => {
    for (const a of ACHIEVEMENT_TEMPLATES) {
      expect(a.description.length).toBeGreaterThan(0);
    }
  });

  it("all achievements have positive targets", () => {
    for (const a of ACHIEVEMENT_TEMPLATES) {
      expect(a.target).toBeGreaterThan(0);
    }
  });

  it("ACHIEVEMENT_TEMPLATE_MAP has entries for all templates", () => {
    expect(ACHIEVEMENT_TEMPLATE_MAP.size).toBe(ACHIEVEMENT_TEMPLATES.length);
    for (const a of ACHIEVEMENT_TEMPLATES) {
      expect(ACHIEVEMENT_TEMPLATE_MAP.get(a.id)).toBeDefined();
    }
  });

  it("buildInitialAchievements returns correct count", () => {
    const achievements = buildInitialAchievements();
    expect(Object.keys(achievements)).toHaveLength(ACHIEVEMENT_TEMPLATES.length);
  });

  it("buildInitialAchievements returns uncompleted achievements", () => {
    const achievements = buildInitialAchievements();
    for (const a of Object.values(achievements)) {
      expect(a.completed).toBe(false);
      expect(a.completedAt).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Bloomling Templates
// ---------------------------------------------------------------------------

describe("Bloomling Templates", () => {
  it("all bloomling IDs are unique", () => {
    const ids = BLOOMLING_TEMPLATES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all bloomlings have non-empty names", () => {
    for (const b of BLOOMLING_TEMPLATES) {
      expect(b.name.length).toBeGreaterThan(0);
    }
  });

  it("all bloomlings have positive baseProduction", () => {
    for (const b of BLOOMLING_TEMPLATES) {
      expect(b.baseProduction).toBeGreaterThan(0);
    }
  });

  it("all bloomlings have positive baseLevelCost", () => {
    for (const b of BLOOMLING_TEMPLATES) {
      expect(b.baseLevelCost).toBeGreaterThan(0);
    }
  });

  it("BLOOMLING_TEMPLATE_MAP has entries for all templates", () => {
    expect(Object.keys(BLOOMLING_TEMPLATE_MAP)).toHaveLength(BLOOMLING_TEMPLATES.length);
    for (const b of BLOOMLING_TEMPLATES) {
      expect(BLOOMLING_TEMPLATE_MAP[b.id]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Perk Templates
// ---------------------------------------------------------------------------

describe("Perk Templates", () => {
  it("all perk IDs are unique", () => {
    const ids = PERK_TEMPLATES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all perks have non-empty names", () => {
    for (const p of PERK_TEMPLATES) {
      expect(p.name.length).toBeGreaterThan(0);
    }
  });

  it("all perks have positive costs", () => {
    for (const p of PERK_TEMPLATES) {
      expect(p.cost).toBeGreaterThan(0);
    }
  });

  it("all perks have non-empty descriptions", () => {
    for (const p of PERK_TEMPLATES) {
      expect(p.description.length).toBeGreaterThan(0);
    }
  });

  it("PERK_TEMPLATE_MAP has entries for all templates", () => {
    expect(Object.keys(PERK_TEMPLATE_MAP)).toHaveLength(PERK_TEMPLATES.length);
    for (const p of PERK_TEMPLATES) {
      expect(PERK_TEMPLATE_MAP[p.id]).toBeDefined();
    }
  });
});
