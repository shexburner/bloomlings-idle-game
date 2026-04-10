<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/04-prestige-systems.md -->

# Bloomlings Game Design — Section 4: Prestige Systems (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Overview
- Prestige Layer 1: Rebirth
  - Narrative Framing
  - When Does Rebirth Unlock?
  - What Gets Reset?
  - Nectar Formula
  - Nectar Upgrades (Rebirth Shop)
  - Rebirth Flow (Player Experience)
  - Rebirth Pacing Target
- Prestige Layer 2: Transcendence
  - Narrative Framing
  - When Does Transcendence Unlock?
  - What Gets Reset?
  - Essence Formula
  - Essence Upgrades (Transcendence Shop)
  - Transcendence Flow
  - Transcendence Pacing Target
- Prestige Layer Interaction
- Prestige Previews
- Next Section

## Key Points
### Overview
- Prestige is the engine that keeps an idle game alive for weeks and months. Bloomlings has **two prestige layers**, each resetting different things and offering escalating power. The key principle: **prestige should feel like a power-up, not a punishment.** The player should be excited to reset.

### Prestige Layer 1: Rebirth
- (No concise bullet/summary found; use grep in source file for details.)

### Narrative Framing
- *"Your garden has grown as far as it can in this season. Let your Bloomlings return their energy to the earth, and begin a new season — stronger, wiser, and with the rich Nectar they've gathered."*

### When Does Rebirth Unlock?
- Rebirth button appears at **Zone 40**
- It's grayed out with a preview showing how much Nectar would be earned
- First viable Rebirth (earning meaningful Nectar) is around **Zone 45-50**
- The button shows a "Recommended" tag when Rebirth would earn 2x+ the player's current total Nectar

### What Gets Reset?
- **Important**: Bloomlings are NOT lost. They return to Sprout stage and level 1, but the player keeps them all. This prevents the emotional loss of losing a favorite Bloomling.

### Nectar Formula
- `baseNectar`: 1
- `nectarThreshold`: 40 (the zone where Rebirth unlocks)
- `nectarExponent`: 2.2

### Nectar Upgrades (Rebirth Shop)
- Nectar buys **permanent upgrades** that persist through future Rebirths.

### Rebirth Flow (Player Experience)
- Player taps "Rebirth" button
- Confirmation screen shows: Nectar earned, comparison to current total, what resets vs. what stays
- Player confirms
- **Cinematic moment**: Bloomlings glow, release golden energy into the soil, the screen fades to white

### Rebirth Pacing Target
- **First Rebirth**: 2-4 hours of play
- **Early Rebirths** (runs 2-10): 30-60 minutes each (zones clear faster due to Nectar upgrades)
- **Mid Rebirths** (runs 10-30): 20-40 minutes, pushing further each time
- **Late Rebirths** (runs 30+): Player starts considering Transcendence

### Prestige Layer 2: Transcendence
- (No concise bullet/summary found; use grep in source file for details.)

### Narrative Framing
- *"Your garden has seen countless seasons. The Nectar has seeped so deep it has reached the Essence — the primordial life force beneath all things. Release everything, and be reborn as something greater."*

### When Does Transcendence Unlock?
- Teased at Zone 100 (first time reaching it post-Rebirth)
- Actually unlockable after **10+ Rebirths** AND reaching **Zone 150+** in a single run
- The Transcendence button appears on the Prestige screen, initially locked with clear requirements shown

### What Gets Reset?
- (No concise bullet/summary found; use grep in source file for details.)

### Essence Formula
- `baseEssence`: 1
- `essenceThreshold`: 50 (total Nectar ever spent)
- `essenceExponent`: 1.8

### Essence Upgrades (Transcendence Shop)
- (No concise bullet/summary found; use grep in source file for details.)

### Transcendence Flow
- Player taps "Transcend"
- Warning screen: "This will reset ALL progress except Essence and Bloomling collection. Are you sure?"
- Second confirmation (it's a big deal)
- **Major cinematic**: The garden dissolves into pure light, roots reach deep into the earth, Essence wells up as glowing orbs

### Transcendence Pacing Target
- **First Transcendence**: After ~1-2 weeks of play (many Rebirth cycles)
- **Subsequent Transcendences**: Every few days of active play
- Transcendence is the "I'm in this for the long haul" commitment

### Prestige Layer Interaction
- The two layers create a **nested loop**:

### Prestige Previews
- "If you Rebirth now, you'll earn X Nectar (Y% more than your current total)"
- "If you push to Zone [N+10], you'd earn Z Nectar instead"
- This creates the **delicious tension**: do I reset now, or push a bit further?

### Next Section
- See `05-ad-economy.md` for the Dewdrop system, ad touchpoints, and monetization design.
