# Compact Docs

Use files in this folder as the default low-token context.
If more detail is needed, jump to the mapped source file and grep specific sections.

## Workflow

1. Read `docs/compact/**` first.
2. If a detail is missing, run grep on the source file shown in each compact doc header.
3. Update canonical docs under `docs/` only.
4. Regenerate compact files with: `python3 docs/build_compact_docs.py`.

## File Map

- `docs/content/00-task-breakdown.md` → `docs/compact/content/00-task-breakdown.md`
- `docs/content/01-biome1-bloomlings.md` → `docs/compact/content/01-biome1-bloomlings.md`
- `docs/content/02-biome2-bloomlings.md` → `docs/compact/content/02-biome2-bloomlings.md`
- `docs/content/03-upgrades-flavor.md` → `docs/compact/content/03-upgrades-flavor.md`
- `docs/content/04-achievements.md` → `docs/compact/content/04-achievements.md`
- `docs/content/05-biome3-bloomlings.md` → `docs/compact/content/05-biome3-bloomlings.md`
- `docs/content/06-biome4-bloomlings.md` → `docs/compact/content/06-biome4-bloomlings.md`
- `docs/content/07-biome5-bloomlings.md` → `docs/compact/content/07-biome5-bloomlings.md`
- `docs/content/08-biome6-bloomlings.md` → `docs/compact/content/08-biome6-bloomlings.md`
- `docs/content/09-biome7-bloomlings.md` → `docs/compact/content/09-biome7-bloomlings.md`
- `docs/content/10-biome8-bloomlings.md` → `docs/compact/content/10-biome8-bloomlings.md`
- `docs/content/11-legendary-mythic-bloomlings.md` → `docs/compact/content/11-legendary-mythic-bloomlings.md`
- `docs/design/01-core-game-loop.md` → `docs/compact/design/01-core-game-loop.md`
- `docs/design/02-bloomling-mechanics.md` → `docs/compact/design/02-bloomling-mechanics.md`
- `docs/design/03-zone-progression.md` → `docs/compact/design/03-zone-progression.md`
- `docs/design/04-prestige-systems.md` → `docs/compact/design/04-prestige-systems.md`
- `docs/design/05-ad-economy.md` → `docs/compact/design/05-ad-economy.md`
- `docs/design/06-retention-hooks.md` → `docs/compact/design/06-retention-hooks.md`
- `docs/design/07-zone-gates-and-bosses.md` → `docs/compact/design/07-zone-gates-and-bosses.md`
- `docs/design/08-bloomling-abilities.md` → `docs/compact/design/08-bloomling-abilities.md`
- `docs/design/09-biome-content-and-mechanics.md` → `docs/compact/design/09-biome-content-and-mechanics.md`
- `docs/design/10-cosmetics-onboarding-retention.md` → `docs/compact/design/10-cosmetics-onboarding-retention.md`
- `docs/economy/00-task-breakdown.md` → `docs/compact/economy/00-task-breakdown.md`
- `docs/economy/01-currency-rates.md` → `docs/compact/economy/01-currency-rates.md`
- `docs/economy/02-upgrade-costs.md` → `docs/compact/economy/02-upgrade-costs.md`
- `docs/economy/03-bloomling-stats.md` → `docs/compact/economy/03-bloomling-stats.md`
- `docs/economy/04-prestige-math.md` → `docs/compact/economy/04-prestige-math.md`
- `docs/economy/05-ad-reward-values.md` → `docs/compact/economy/05-ad-reward-values.md`
- `docs/economy/06-pacing-sheet.md` → `docs/compact/economy/06-pacing-sheet.md`
- `docs/engine/00-task-breakdown.md` → `docs/compact/engine/00-task-breakdown.md`
- `docs/engine/01-scaffold-plan.md` → `docs/compact/engine/01-scaffold-plan.md`
- `docs/engine/phase4-task-breakdown.md` → `docs/compact/engine/phase4-task-breakdown.md`
- `docs/roadmap.md` → `docs/compact/roadmap.md`
- `docs/status.md` → `docs/compact/status.md`
- `docs/ui/00-task-breakdown.md` → `docs/compact/ui/00-task-breakdown.md`
