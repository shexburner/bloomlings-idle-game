<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/03-zone-progression.md -->

# Bloomlings Game Design — Section 3: Zone & Biome Progression (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Overview
- Zone Mechanics
  - Clearing a Zone
  - Zone Threshold Scaling
- Gate Zones (Every 5th Zone)
  - Gate Mechanics
  - Gate Rewards
- Biomes
  - Biome List
    - Biome 1: The Mossy Cradle (Zones 1-25)
    - Biome 2: The Sunlit Glade (Zones 26-50)
    - Biome 3: The Twilight Hollow (Zones 51-75)
    - Biome 4: The Crystal Caverns (Zones 76-100)
    - Biomes 5+ (Post-Transcendence, Future Content)
- Biome Boss Fights
  - Boss Mechanic
  - Boss Failure
  - Boss Victory
- Zone Milestones
- Highest Zone Tracking
- Next Section

## Key Points
### Overview
- Zones are the primary measure of **how far** the player has pushed. Think of zones like levels in Trimps — each one is a threshold of Sunlight that must be accumulated to clear it. Zones are grouped into **Biomes**, which are thematic areas with distinct visuals, native Bloomlings, and sometimes unique mechanics.

### Zone Mechanics
- (No concise bullet/summary found; use grep in source file for details.)

### Clearing a Zone
- Each zone has a **Sunlight Threshold** — the amount of Sunlight that must be generated (not spent) to clear it
- Sunlight from both tapping and idle production counts toward the threshold
- Progress bar shows percentage toward clearing the current zone
- When the threshold is met, the zone clears automatically, the player advances, and a brief celebration plays

### Zone Threshold Scaling
- `baseThreshold`: 50 Sunlight (Zone 1)
- `zoneScaling`: 1.12 (12% increase per zone)
- Zones 1-10: Tutorial pacing, fast clears
- Zones 10-25: Comfortable rhythm, player learning systems

### Gate Zones (Every 5th Zone)
- Every 5th zone is a **Gate** — a tougher zone that requires a **burst of Sunlight in a short time window**.

### Gate Mechanics
- Gate zones have a **timer** (30 seconds) and a **burst threshold** (2x the normal zone threshold)
- The player must generate the burst threshold within the time limit
- This rewards **active tapping** — idle alone usually can't beat a gate
- Failing a gate is fine: the player stays on the zone, timer resets, they can try again

### Gate Rewards
- Clearing a gate grants a one-time **bonus Sunlight** (equal to 5x the zone threshold)
- First-time gate clear rewards are enhanced (sometimes a new Bloomling or achievement)

### Biomes
- Unique visual background and ambient audio
- Native Bloomlings (only found in this biome)
- A **Biome Boss** at zone 25 of each biome
- Sometimes a unique mechanic

### Biome List
- (No concise bullet/summary found; use grep in source file for details.)

### Biome 1: The Mossy Cradle (Zones 1-25)
- **Theme**: Abandoned greenhouse, warm sunlight filtering through cracked glass, moss everywhere
- **Feel**: Safe, cozy, tutorial-friendly
- **Native Bloomlings**: Fernley (Common), Mosswick (Common), Petaline (Uncommon)
- **Special**: No special mechanic — pure learning environment

### Biome 2: The Sunlit Glade (Zones 26-50)
- **Theme**: Open forest clearing, bright golden light, wildflowers, butterflies
- **Feel**: Expansive, optimistic, the world opens up
- **Native Bloomlings**: Solara (Uncommon), Dapplebark (Uncommon), Honeyveil (Rare)
- **Special Mechanic**: **Sunbursts** — random golden orbs appear on screen during gameplay, tapping them grants bonus Sunlight (2x current zone threshold)

### Biome 3: The Twilight Hollow (Zones 51-75)
- **Theme**: Deep forest, bioluminescent mushrooms, fireflies, dappled moonlight
- **Feel**: Mysterious, magical, slightly eerie
- **Native Bloomlings**: Lumivine (Rare), Glowcap (Uncommon), Nightbloom (Epic)
- **Special Mechanic**: **Luminescence** — Bloomlings in the Garden slowly charge a "Glow Meter." When full, the player can tap it for a massive Sunlight burst (60 seconds of idle income instantly)

### Biome 4: The Crystal Caverns (Zones 76-100)
- **Theme**: Underground caves, crystalline formations, refracted light, underground streams
- **Feel**: Alien, awe-inspiring, high-stakes
- **Native Bloomlings**: Crystalbloom (Rare), Gemsprout (Epic), Prismaflora (Legendary)
- **Special Mechanic**: **Resonance** — tapping creates echoes that bounce off crystals, each echo generates a fraction of the tap's value (essentially +30% tap value in this biome)

### Biomes 5+ (Post-Transcendence, Future Content)
- The Scorched Expanse (volcanic)
- The Abyssal Depths (underwater/deep cave)
- The Celestial Canopy (treetop/sky)
- The Frozen Thicket (tundra/ice)

### Biome Boss Fights
- Biome bosses appear every 25 zones. They are **not** traditional combat — this is an idle game. Instead:

### Boss Mechanic
- Boss has an **HP bar** (displayed as a massive Sunlight threshold, e.g., 50x normal zone)
- The HP bar depletes as the player generates Sunlight (tapping + idle)
- Boss has a **timer**: 2 minutes to defeat it
- During the boss fight, **tap value is doubled** (to make it feel intense and active)

### Boss Failure
- If the timer runs out, the boss resets and the player can retry
- Each failed attempt gives the player a **5% permanent damage boost** against that boss (stacks up to 50%)
- This ensures even struggling players eventually break through
- Optional: watch an ad to deal 25% of the boss's max HP instantly

### Boss Victory
- Dramatic victory animation
- Unique Bloomling reward
- Achievement unlocked
- New biome opens with a narrative transition scene

### Zone Milestones
- Beyond biome structure, specific zones award one-time bonuses:

### Highest Zone Tracking
- The game tracks the player's **all-time highest zone** and **current run highest zone**
- After Rebirth, zones reset to 1, but with Nectar upgrades, early zones clear almost instantly
- The satisfaction comes from pushing *further* each run
- Highest zone is displayed on the main screen as a badge of progress

### Next Section
- See `04-prestige-systems.md` for Rebirth, Transcendence, and the prestige economy.
