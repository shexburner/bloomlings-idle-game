<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/02-bloomling-mechanics.md -->

# Bloomlings Game Design — Section 2: Bloomling Mechanics (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- What Are Bloomlings?
- Bloomling Attributes
- Leveling
  - Buy Multipliers
- Evolution System
  - Stage Progression
  - Evolution Details
- The Garden (Active Roster)
  - Garden Slots
  - Garden Strategy
- Synergy System
  - How Synergies Work
  - Synergy Tiers
  - Special Synergies
- Bloomling Abilities
  - Ability Types
  - Ability Scaling
- Rarity and Acquisition
  - Rarity Tiers
  - Unlock Methods
- Bloomling Collection Screen
- Next Section

## Key Points
### What Are Bloomlings?
- Bloomlings are **living, conscious plant creatures**. They are the heart of the game — not just production units but characters with names, personalities, backstories, and relationships. The player bonds with them. Every mechanical system reinforces this bond.

### Bloomling Attributes
- Each Bloomling has:

### Leveling
- Bloomlings are leveled up by spending **Sunlight**
- Each level increases their Sunlight production
- Cost to level: `baseCost * 1.10^level` (10% increase per level)
- Production per level: `baseProduction * level` (linear scaling)

### Buy Multipliers
- xMax calculates the maximum levels affordable and buys them all in one tap
- Keeps the shop snappy in late game

### Evolution System
- Bloomlings evolve through 3 stages. Each evolution changes their appearance, boosts their stats, and unlocks their ability.

### Stage Progression
- (No concise bullet/summary found; use grep in source file for details.)

### Evolution Details
- When a Bloomling evolves, its **level resets to 1** but its base production permanently multiplies
- This creates a "mini-prestige" feel at the individual Bloomling level
- Evolution has a **visual transformation sequence** — the Bloomling visually changes, sparkle effects, the screen celebrates
- Elder evolution requires Nectar (prestige currency), gating it behind at least one Rebirth

### The Garden (Active Roster)
- The Garden is the player's **active team** of Bloomlings. Only Bloomlings placed in the Garden produce Sunlight.

### Garden Slots
- (No concise bullet/summary found; use grep in source file for details.)

### Garden Strategy
- Limited slots force **choices**: which Bloomlings to prioritize?
- Players must consider raw production vs. synergy bonuses vs. abilities
- Swapping Bloomlings in/out is free and instant
- Bloomlings NOT in the Garden still retain their levels and evolution — they just don't produce

### Synergy System
- Certain Bloomlings **boost each other** when placed in the Garden together. This adds a team-building meta-game.

### How Synergies Work
- Each Bloomling (at Elder stage) has **Synergy Tags** (e.g., "Mossy," "Luminous," "Thorned," "Aquatic")
- When 2+ Bloomlings in the Garden share a tag, a **Synergy Bonus** activates
- Bonuses scale with the number of matching Bloomlings

### Synergy Tiers
- (No concise bullet/summary found; use grep in source file for details.)

### Special Synergies
- Some specific Bloomling **pairs** have unique named synergies
- Example: Fernley + Thornwick = "Undergrowth Alliance" (+25% idle production for both)
- These are discoverable — not shown until the player places both in the Garden
- Discovering a synergy triggers a pop-up with lore and a small Dewdrop reward (first time only)

### Bloomling Abilities
- Each Bloomling unlocks a passive or active ability at Bloom stage, which enhances at Elder stage.

### Ability Types
- (No concise bullet/summary found; use grep in source file for details.)

### Ability Scaling
- Bloom stage: ability at base power
- Elder stage: ability at 2x power (e.g., +10% becomes +20%)
- Abilities are always passive (no manual activation required) — they just work while the Bloomling is in the Garden

### Rarity and Acquisition
- (No concise bullet/summary found; use grep in source file for details.)

### Rarity Tiers
- (No concise bullet/summary found; use grep in source file for details.)

### Unlock Methods
- **Zone milestones**: Reach a specific zone for the first time
- **Biome boss defeat**: Beat a biome boss to unlock its signature Bloomling
- **Achievement rewards**: Complete specific achievements
- **Prestige unlocks**: Some Bloomlings require Nectar or Essence to awaken

### Bloomling Collection Screen
- Grid view of **all** Bloomlings (discovered and undiscovered)
- Undiscovered Bloomlings shown as shadowed silhouettes with "???" name
- Tapping a Bloomling shows their detail card: lore, stats, evolution progress, ability
- Collection completion percentage displayed prominently

### Next Section
- See `03-zone-progression.md` for the zone/biome system, gates, and bosses.
