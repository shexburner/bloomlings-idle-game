# Bloomlings Game Design — Section 4: Prestige Systems

## Overview

Prestige is the engine that keeps an idle game alive for weeks and months. Bloomlings has **two prestige layers**, each resetting different things and offering escalating power. The key principle: **prestige should feel like a power-up, not a punishment.** The player should be excited to reset.

---

## Prestige Layer 1: Rebirth

### Narrative Framing
*"Your garden has grown as far as it can in this season. Let your Bloomlings return their energy to the earth, and begin a new season — stronger, wiser, and with the rich Nectar they've gathered."*

Rebirth is the **seasonal cycle** of the garden. Bloomlings release their accumulated energy as **Nectar**, a golden sap that permanently enriches the soil.

### When Does Rebirth Unlock?
- Rebirth button appears at **Zone 40**
- It's grayed out with a preview showing how much Nectar would be earned
- First viable Rebirth (earning meaningful Nectar) is around **Zone 45-50**
- The button shows a "Recommended" tag when Rebirth would earn 2x+ the player's current total Nectar

### What Gets Reset?
| Reset | Kept |
|---|---|
| Sunlight (to 0) | Nectar (gained) |
| Current zone (to 1) | Bloomling unlocks (all discovered Bloomlings) |
| Bloomling levels (to 1) | Bloomling evolution stages |
| Bloomling evolution (Sprout for all) | Dewdrops |
| Tap upgrades | Nectar upgrades (permanent) |
| Idle upgrades | Achievements |
| Gate progress | Highest zone record |
| Biome special meter progress | Settings |

**Important**: Bloomlings are NOT lost. They return to Sprout stage and level 1, but the player keeps them all. This prevents the emotional loss of losing a favorite Bloomling.

### Nectar Formula
```
nectarEarned = floor(baseNectar * (highestZone / nectarThreshold)^nectarExponent)
```
- `baseNectar`: 1
- `nectarThreshold`: 40 (the zone where Rebirth unlocks)
- `nectarExponent`: 2.2

**Example Nectar earnings:**

| Highest Zone Reached | Nectar Earned |
|---|---|
| 40 | 1 |
| 45 | 2 |
| 50 | 4 |
| 60 | 8 |
| 75 | 18 |
| 100 | 42 |
| 150 | 120 |
| 200 | 260 |

Pushing further is always rewarded, but with diminishing returns per zone — encouraging the player to Rebirth and push faster next time.

### Nectar Upgrades (Rebirth Shop)

Nectar buys **permanent upgrades** that persist through future Rebirths.

| Upgrade | Cost (Nectar) | Effect | Max Level |
|---|---|---|---|
| Enriched Soil | 1, 3, 8, 15, 30... | +25% Sunlight production per level | 20 |
| Stronger Roots | 2, 5, 12, 25... | +20% tap value per level | 20 |
| Rapid Growth | 3, 8, 20... | Bloomlings level up 10% cheaper per level | 15 |
| Garden Expansion | 10, 30 | +1 Garden slot | 2 |
| Seasonal Memory | 5, 15, 40... | Start each Rebirth at zone 5/10/15/20 (skip early zones) | 4 |
| Nectar Roots | 8, 25, 60... | +10% Nectar earned on future Rebirths | 10 |
| Bloom Retention | 20 | Bloomlings keep Bloom stage (not Elder) through Rebirth | 1 |
| Elder Retention | 100 | Bloomlings keep Elder stage through Rebirth | 1 |
| Deep Roots | 15, 40... | +10% offline production rate per level | 10 |
| Combo Memory | 12 | Combo meter starts at 10 after Rebirth (instead of 0) | 1 |

### Rebirth Flow (Player Experience)
1. Player taps "Rebirth" button
2. Confirmation screen shows: Nectar earned, comparison to current total, what resets vs. what stays
3. Player confirms
4. **Cinematic moment**: Bloomlings glow, release golden energy into the soil, the screen fades to white
5. The garden reappears — fresh, but the soil is visibly richer (golden veins in the ground)
6. "Welcome to Season [N]" banner
7. Player immediately feels the power: zones clear faster, production is higher, the early game flies by

### Rebirth Pacing Target
- **First Rebirth**: 2-4 hours of play
- **Early Rebirths** (runs 2-10): 30-60 minutes each (zones clear faster due to Nectar upgrades)
- **Mid Rebirths** (runs 10-30): 20-40 minutes, pushing further each time
- **Late Rebirths** (runs 30+): Player starts considering Transcendence

---

## Prestige Layer 2: Transcendence

### Narrative Framing
*"Your garden has seen countless seasons. The Nectar has seeped so deep it has reached the Essence — the primordial life force beneath all things. Release everything, and be reborn as something greater."*

Transcendence is the **mega-prestige**. It's a reset of the reset. The player gives up their Nectar upgrades in exchange for **Essence** — a far more powerful currency.

### When Does Transcendence Unlock?
- Teased at Zone 100 (first time reaching it post-Rebirth)
- Actually unlockable after **10+ Rebirths** AND reaching **Zone 150+** in a single run
- The Transcendence button appears on the Prestige screen, initially locked with clear requirements shown

### What Gets Reset?
| Reset | Kept |
|---|---|
| Everything from Rebirth (Sunlight, zones, levels) | Essence (gained) |
| Nectar (to 0) | Bloomling unlocks |
| All Nectar upgrades | Dewdrops |
| Rebirth count (to 0) | Achievements |
| Biome progress | Essence upgrades (permanent) |
| | Highest zone all-time record |

### Essence Formula
```
essenceEarned = floor(baseEssence * (totalNectarSpent / essenceThreshold)^essenceExponent)
```
- `baseEssence`: 1
- `essenceThreshold`: 50 (total Nectar ever spent)
- `essenceExponent`: 1.8

The key insight: Essence scales off **total Nectar spent**, rewarding players who invested heavily in Nectar upgrades before Transcending.

### Essence Upgrades (Transcendence Shop)

| Upgrade | Cost (Essence) | Effect | Max Level |
|---|---|---|---|
| Primordial Vigor | 1, 3, 10... | All Sunlight production x2 per level | 10 |
| Ancient Wisdom | 2, 6, 15... | All Nectar earnings x1.5 per level | 10 |
| Eternal Garden | 5 | +1 permanent Garden slot | 2 |
| Biome Attunement | 3, 8... | Unlock biome special mechanics from Zone 1 | Per biome |
| Accelerated Seasons | 4, 12... | Start Rebirths at higher zones | 5 |
| Bloomling Awakening | 10 | Unlock Legendary-tier Bloomlings | 1 |
| Essence Conduit | 8, 20... | +15% Essence earned on future Transcendences | 5 |
| Mythic Seedbed | 25 | Unlock Mythic-tier Bloomlings (also requires Dewdrops) | 1 |
| Cosmic Roots | 15, 40... | Offline progress rate increased to 100% (from default 50%) | 3 |

### Transcendence Flow
1. Player taps "Transcend"
2. Warning screen: "This will reset ALL progress except Essence and Bloomling collection. Are you sure?"
3. Second confirmation (it's a big deal)
4. **Major cinematic**: The garden dissolves into pure light, roots reach deep into the earth, Essence wells up as glowing orbs
5. The game restarts — but the greenhouse now has a subtle cosmic glow, hinting at the power beneath
6. "Transcendence [N] — A New Beginning" banner
7. Early zones melt away. The player is dramatically more powerful

### Transcendence Pacing Target
- **First Transcendence**: After ~1-2 weeks of play (many Rebirth cycles)
- **Subsequent Transcendences**: Every few days of active play
- Transcendence is the "I'm in this for the long haul" commitment

---

## Prestige Layer Interaction

The two layers create a **nested loop**:

```
Outer Loop (Transcendence — weekly)
└── Inner Loop (Rebirth — hourly)
    └── Core Loop (Zone pushing — minute by minute)
        └── Micro Loop (Tapping + upgrading — second by second)
```

Each outer layer amplifies the inner loops. After a Transcendence, Rebirths come faster, which means zones clear faster, which means tapping feels more impactful. The game accelerates, then resets, then accelerates further.

---

## Prestige Previews

Both prestige screens show **previews before committing**:
- "If you Rebirth now, you'll earn X Nectar (Y% more than your current total)"
- "If you push to Zone [N+10], you'd earn Z Nectar instead"
- This creates the **delicious tension**: do I reset now, or push a bit further?

---

## Next Section
See `05-ad-economy.md` for the Dewdrop system, ad touchpoints, and monetization design.
