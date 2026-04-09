# Bloomlings Game Design — Section 2: Bloomling Mechanics

## What Are Bloomlings?

Bloomlings are **living, conscious plant creatures**. They are the heart of the game — not just production units but characters with names, personalities, backstories, and relationships. The player bonds with them. Every mechanical system reinforces this bond.

---

## Bloomling Attributes

Each Bloomling has:

| Attribute | Description |
|---|---|
| **Name** | Unique character name (e.g., Fernley, Thornwick, Lumivine) |
| **Rarity** | Common, Uncommon, Rare, Epic, Legendary, Mythic |
| **Biome** | Native habitat — determines where they're found |
| **Level** | 1-100 per evolution stage, increases production |
| **Evolution Stage** | Sprout -> Bloom -> Elder (3 stages) |
| **Base Production** | Sunlight per second at level 1 |
| **Ability** | Unique passive or active effect |
| **Synergy Tags** | Tags that activate bonuses when paired with certain other Bloomlings |
| **Personality** | Flavor — affects idle animations and dialog |

---

## Leveling

- Bloomlings are leveled up by spending **Sunlight**
- Each level increases their Sunlight production
- Cost to level: `baseCost * 1.10^level` (10% increase per level)
- Production per level: `baseProduction * level` (linear scaling)
- Max level per evolution stage: **100**
- Reaching level 100 triggers evolution eligibility

### Buy Multipliers
Players can toggle buy amounts: **x1, x10, x25, x100, xMax**
- xMax calculates the maximum levels affordable and buys them all in one tap
- Keeps the shop snappy in late game

---

## Evolution System

Bloomlings evolve through 3 stages. Each evolution changes their appearance, boosts their stats, and unlocks their ability.

### Stage Progression

| Stage | Level Required | Additional Cost | Stat Boost | Unlocks |
|---|---|---|---|---|
| **Sprout** | Start | — | Base stats | Basic idle production |
| **Bloom** | Sprout Lv. 100 | Sunlight cost (scaling by rarity) | 3x base production, level resets to 1 | Passive Ability |
| **Elder** | Bloom Lv. 100 | Sunlight + Nectar cost | 3x again (9x total vs. base Sprout), level resets to 1 | Enhanced Ability + Synergy slot |

### Evolution Details
- When a Bloomling evolves, its **level resets to 1** but its base production permanently multiplies
- This creates a "mini-prestige" feel at the individual Bloomling level
- Evolution has a **visual transformation sequence** — the Bloomling visually changes, sparkle effects, the screen celebrates
- Elder evolution requires Nectar (prestige currency), gating it behind at least one Rebirth

---

## The Garden (Active Roster)

The Garden is the player's **active team** of Bloomlings. Only Bloomlings placed in the Garden produce Sunlight.

### Garden Slots
| Progression Point | Slots Available |
|---|---|
| Game start | 1 |
| Zone 5 | 2 |
| Zone 15 | 3 |
| Zone 30 | 4 |
| Rebirth upgrade (Nectar) | 5 |
| Rebirth upgrade (Nectar) | 6 |
| Transcendence upgrade | 7-8 |
| Dewdrop perk | +1 bonus slot |

### Garden Strategy
- Limited slots force **choices**: which Bloomlings to prioritize?
- Players must consider raw production vs. synergy bonuses vs. abilities
- Swapping Bloomlings in/out is free and instant
- Bloomlings NOT in the Garden still retain their levels and evolution — they just don't produce

---

## Synergy System

Certain Bloomlings **boost each other** when placed in the Garden together. This adds a team-building meta-game.

### How Synergies Work
- Each Bloomling (at Elder stage) has **Synergy Tags** (e.g., "Mossy," "Luminous," "Thorned," "Aquatic")
- When 2+ Bloomlings in the Garden share a tag, a **Synergy Bonus** activates
- Bonuses scale with the number of matching Bloomlings

### Synergy Tiers

| Matching Bloomlings | Bonus |
|---|---|
| 2 with same tag | +15% production to all tagged members |
| 3 with same tag | +35% production to all tagged members |
| 4+ with same tag | +60% production to all tagged members |

### Special Synergies
- Some specific Bloomling **pairs** have unique named synergies
- Example: Fernley + Thornwick = "Undergrowth Alliance" (+25% idle production for both)
- These are discoverable — not shown until the player places both in the Garden
- Discovering a synergy triggers a pop-up with lore and a small Dewdrop reward (first time only)

---

## Bloomling Abilities

Each Bloomling unlocks a passive or active ability at Bloom stage, which enhances at Elder stage.

### Ability Types

| Type | Description | Example |
|---|---|---|
| **Production Boost** | Increases own or all Bloomlings' production | "+10% Sunlight/sec for all Garden Bloomlings" |
| **Tap Boost** | Increases tap value or crit chance | "+2% critical tap chance" |
| **Combo Boost** | Affects combo system | "Combo decay timer extended by 0.5 seconds" |
| **Zone Boost** | Helps clear zones faster | "Zone threshold reduced by 5%" |
| **Prestige Boost** | Affects Rebirth rewards | "+5% Nectar earned on Rebirth" |
| **Luck** | Random bonus events | "Every 60 seconds, chance to spawn a bonus Sunlight orb on screen" |

### Ability Scaling
- Bloom stage: ability at base power
- Elder stage: ability at 2x power (e.g., +10% becomes +20%)
- Abilities are always passive (no manual activation required) — they just work while the Bloomling is in the Garden

---

## Rarity and Acquisition

### Rarity Tiers

| Rarity | Base Production Multiplier | Ability Strength | How to Acquire |
|---|---|---|---|
| **Common** | 1x | Modest | Zone progression (early zones) |
| **Uncommon** | 2x | Decent | Zone progression (mid zones) |
| **Rare** | 5x | Strong | Zone milestones, biome bosses |
| **Epic** | 12x | Powerful | Late zone milestones, achievements |
| **Legendary** | 30x | Very powerful | Transcendence unlocks, special events |
| **Mythic** | 100x | Game-changing | Dewdrop shop exclusives, ultra-rare achievements |

### Unlock Methods
1. **Zone milestones**: Reach a specific zone for the first time
2. **Biome boss defeat**: Beat a biome boss to unlock its signature Bloomling
3. **Achievement rewards**: Complete specific achievements
4. **Prestige unlocks**: Some Bloomlings require Nectar or Essence to awaken
5. **Dewdrop shop**: Mythic Bloomlings available for Dewdrops (ad currency)
6. **Discovery**: Certain Bloomlings only appear when specific conditions are met (hidden unlocks)

---

## Bloomling Collection Screen

- Grid view of **all** Bloomlings (discovered and undiscovered)
- Undiscovered Bloomlings shown as shadowed silhouettes with "???" name
- Tapping a Bloomling shows their detail card: lore, stats, evolution progress, ability
- Collection completion percentage displayed prominently
- Collecting milestones (25%, 50%, 75%, 100%) award bonuses

---

## Next Section
See `03-zone-progression.md` for the zone/biome system, gates, and bosses.
