<!-- AUTO-GENERATED FILE: DO NOT EDIT DIRECTLY -->
<!-- Source: docs/design/05-ad-economy.md -->

# Bloomlings Game Design — Section 5: Ad Economy & Dewdrops (Compact Context)

> Auto-generated from the canonical source file. Edit the source markdown, then regenerate compact docs.

## Quick Map
- Monetization Philosophy
- Dewdrops — The Ad Currency
  - What Are Dewdrops?
  - Dewdrop Earn Rate
  - Dewdrop Earn Summary
  - What Can Dewdrops Buy?
    - Cosmetics (Permanent)
    - Quality of Life (Permanent)
    - Exclusive Bloomlings (Permanent)
    - Consumables (One-Time Use)
- Ad Touchpoints — Where Ads Appear
  - 1. Sunbeam Boost (Main Screen)
  - 2. Double Offline Earnings (Welcome Back Screen)
  - 3. Dewdrop Garden (Dewdrop Shop Tab)
  - 4. Lucky Sprout (Random Pop-up)
  - 5. Gate Assist (Gate Zones)
  - 6. Boss Smash (Biome Bosses)
  - 7. Combo Keeper (During Active Play)
- Ad Presentation Rules
- Ad Revenue Optimization Strategy
  - Maximize Voluntary Watch Rate
  - Levers to Increase Watch Rate
  - Expected Watch Rates (Industry Benchmarks + Our Targets)
- Revenue Projection Model (Rough)
- What We Will NEVER Do
- Next Section

## Key Points
### Monetization Philosophy
- **Zero forced ads. Ever.** No interstitials. No banners. No unskippable pre-rolls. The player never sees an ad unless they choose to.

### Dewdrops — The Ad Currency
- (No concise bullet/summary found; use grep in source file for details.)

### What Are Dewdrops?
- Dewdrops are a **premium-feel currency earned exclusively by watching ads**. They cannot be bought with real money, earned through gameplay, or traded. The only way to get Dewdrops is to voluntarily watch a rewarded ad.

### Dewdrop Earn Rate
- **Base**: 1 Dewdrop per ad watched
- **Streak Bonus**: Watch 3 ads in a day = bonus +1 Dewdrop on the 3rd
- **Daily Cap**: 15 ads per day (prevents burnout, keeps ads valuable)
- **Consecutive Day Bonus**: Each consecutive day of watching at least 1 ad grants +1 bonus Dewdrop (caps at +5 for a 5-day streak)

### Dewdrop Earn Summary
- (No concise bullet/summary found; use grep in source file for details.)

### What Can Dewdrops Buy?
- The Dewdrop Shop offers items that feel **premium but never pay-to-win**. Nothing in the shop gives raw power that can't eventually be earned through play.

### Cosmetics (Permanent)
- (No concise bullet/summary found; use grep in source file for details.)

### Quality of Life (Permanent)
- (No concise bullet/summary found; use grep in source file for details.)

### Exclusive Bloomlings (Permanent)
- (No concise bullet/summary found; use grep in source file for details.)

### Consumables (One-Time Use)
- (No concise bullet/summary found; use grep in source file for details.)

### Ad Touchpoints — Where Ads Appear
- Each ad opportunity is a **clearly labeled button** showing exactly what the player gets before they tap it. No tricks, no misleading placement.

### 1. Sunbeam Boost (Main Screen)
- **Button**: Golden sun icon with "2x Production — 10 min" label
- **Reward**: All Sunlight production doubled for 10 minutes (tap + idle)
- **Cooldown**: Can be refreshed immediately by watching another ad (stacks duration, not multiplier)
- **Availability**: Unlocks at Zone 15

### 2. Double Offline Earnings (Welcome Back Screen)
- **Button**: Appears on the "Welcome Back" screen when returning from being away
- **Display**: "You earned X Sunlight while away. Watch to double it!"
- **Reward**: Offline earnings x2
- **Cooldown**: Once per return

### 3. Dewdrop Garden (Dewdrop Shop Tab)
- **Button**: Dewdrop icon with "Watch & Earn" label
- **Reward**: 1-3 Dewdrops (see earn rate above)
- **Cooldown**: 3-minute cooldown between watches (prevents spam)
- **Availability**: Unlocks at Zone 20

### 4. Lucky Sprout (Random Pop-up)
- **Button**: A small sprout icon that occasionally appears on the main screen (every 10-15 minutes of active play)
- **Display**: "A Lucky Sprout appeared! Watch to see what it grows into!"
- **Reward**: Random reward wheel — possibilities include:
- 5 minutes of production as bonus Sunlight (common)

### 5. Gate Assist (Gate Zones)
- **Button**: Appears when a player fails a gate zone or is struggling
- **Options**:
- "+15 seconds" on gate timer
- "1.5x Sunlight during this gate"

### 6. Boss Smash (Biome Bosses)
- **Button**: Appears during boss fights
- **Display**: "Channel the Sun's full power!"
- **Reward**: Deal 25% of boss's max HP as instant damage
- **Cooldown**: Once per boss attempt

### 7. Combo Keeper (During Active Play)
- **Button**: Appears when combo is above 50 hits
- **Display**: "Freeze your combo for 5 minutes!"
- **Reward**: Combo decay paused for 5 minutes
- **Cooldown**: Once per 30 minutes

### Ad Presentation Rules
- **Never interrupt gameplay** — Ads only play when the player taps an ad button
- **Always show the reward first** — The player knows exactly what they get before watching
- **Graceful failure** — If no ad is available (no fill), show "No boost available right now — check back soon!" Never show an error
- **Pre-load ads** — Ads should be loaded in the background so they play instantly when tapped

### Ad Revenue Optimization Strategy
- (No concise bullet/summary found; use grep in source file for details.)

### Maximize Voluntary Watch Rate
- The goal isn't to show the most ads — it's to have the highest **opt-in rate**. Players who *want* to watch ads are more engaged, watch more over time, and have higher lifetime value.

### Levers to Increase Watch Rate
- **Generous rewards** — One ad should feel like 10+ minutes of progress
- **Clear value display** — Show exact numbers: "Watch to earn 45,000 Sunlight" not just "Watch for bonus"
- **Streak incentives** — Daily Dewdrop bonuses for consecutive watches
- **Exclusive content** — Mythic Bloomlings only available through Dewdrops

### Expected Watch Rates (Industry Benchmarks + Our Targets)
- (No concise bullet/summary found; use grep in source file for details.)

### Revenue Projection Model (Rough)
- Average player watches 5-8 ads per day
- eCPM (revenue per 1000 ad views): $10-$20 (rewarded video average)
- DAU: variable

### What We Will NEVER Do
- Force an ad to play
- Show banner ads
- Gate core gameplay behind ads
- Make Dewdrops purchasable with real money (this devalues ad-watching)

### Next Section
- See `06-retention-hooks.md` for daily rewards, streaks, achievements, and addiction mechanics.
