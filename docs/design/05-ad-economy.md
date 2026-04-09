# Bloomlings Game Design — Section 5: Ad Economy & Dewdrops

## Monetization Philosophy

**Zero forced ads. Ever.** No interstitials. No banners. No unskippable pre-rolls. The player never sees an ad unless they choose to.

The entire monetization model rests on one principle: **make watching an ad feel like finding a treasure chest, not paying a toll.**

---

## Dewdrops — The Ad Currency

### What Are Dewdrops?
Dewdrops are a **premium-feel currency earned exclusively by watching ads**. They cannot be bought with real money, earned through gameplay, or traded. The only way to get Dewdrops is to voluntarily watch a rewarded ad.

This makes Dewdrops feel **special and earned** — the player invested their time (30 seconds) to earn them.

### Dewdrop Earn Rate
- **Base**: 1 Dewdrop per ad watched
- **Streak Bonus**: Watch 3 ads in a day = bonus +1 Dewdrop on the 3rd
- **Daily Cap**: 15 ads per day (prevents burnout, keeps ads valuable)
- **Consecutive Day Bonus**: Each consecutive day of watching at least 1 ad grants +1 bonus Dewdrop (caps at +5 for a 5-day streak)

### Dewdrop Earn Summary

| Action | Dewdrops Earned |
|---|---|
| Watch 1 ad | 1 |
| Watch 3 ads in a day | 3 + 1 bonus = 4 |
| Watch all 15 in a day | 15 + 5 bonuses (every 3rd) = 20 |
| Daily streak bonus (day 5+) | +5 per day |
| Max possible per day (with streak) | 25 |

### What Can Dewdrops Buy?

The Dewdrop Shop offers items that feel **premium but never pay-to-win**. Nothing in the shop gives raw power that can't eventually be earned through play.

#### Cosmetics (Permanent)
| Item | Cost | Effect |
|---|---|---|
| Bloomling Skin Variants | 10-30 | Alternate colors/appearances for specific Bloomlings |
| Garden Themes | 25-50 | Change the visual theme of your garden background |
| Tap Effect Packs | 15-20 | Custom tap visual effects (sparkles, leaves, stars) |
| Number Fonts | 10 | Change how damage/income numbers display |
| Bloomling Hats | 5-15 | Tiny cosmetic hats for your Bloomlings (purely fun) |

#### Quality of Life (Permanent)
| Item | Cost | Effect |
|---|---|---|
| Auto-Tap (Slow) | 50 | Automatic 1 tap per second while app is open |
| Auto-Tap (Fast) | 150 | Automatic 5 taps per second while app is open |
| Buy-Max Button | 20 | Adds "Buy Max" option to all upgrade shops |
| Offline Boost | 40 | Offline earnings increased from 50% to 75% rate |
| Extra Garden Slot | 75 | +1 Garden slot (stacks with other slot sources) |
| Ad-Free Boost Timer | 30 | Boost timers display remaining time precisely |

#### Exclusive Bloomlings (Permanent)
| Bloomling | Cost | Rarity | Special |
|---|---|---|---|
| Dewpetal | 100 | Mythic | Generates 1 bonus Dewdrop per 50 ads watched while in Garden |
| Shimmerleaf | 80 | Legendary | +25% Nectar on Rebirth |
| Auroravine | 200 | Mythic | All Bloomling abilities enhanced by 50% |

#### Consumables (One-Time Use)
| Item | Cost | Effect |
|---|---|---|
| Instant Rebirth Boost | 5 | Next Rebirth grants +50% Nectar |
| Zone Skip | 3 | Instantly clear current zone |
| Evolution Shard | 8 | Reduce next evolution cost by 50% |

---

## Ad Touchpoints — Where Ads Appear

Each ad opportunity is a **clearly labeled button** showing exactly what the player gets before they tap it. No tricks, no misleading placement.

### 1. Sunbeam Boost (Main Screen)
- **Button**: Golden sun icon with "2x Production — 10 min" label
- **Reward**: All Sunlight production doubled for 10 minutes (tap + idle)
- **Cooldown**: Can be refreshed immediately by watching another ad (stacks duration, not multiplier)
- **Availability**: Unlocks at Zone 15
- **Why players watch**: The most straightforward value. Obvious, immediate, satisfying

### 2. Double Offline Earnings (Welcome Back Screen)
- **Button**: Appears on the "Welcome Back" screen when returning from being away
- **Display**: "You earned X Sunlight while away. Watch to double it!"
- **Reward**: Offline earnings x2
- **Cooldown**: Once per return
- **Why players watch**: It's free money for 30 seconds. Most-watched ad in most idle games

### 3. Dewdrop Garden (Dewdrop Shop Tab)
- **Button**: Dewdrop icon with "Watch & Earn" label
- **Reward**: 1-3 Dewdrops (see earn rate above)
- **Cooldown**: 3-minute cooldown between watches (prevents spam)
- **Availability**: Unlocks at Zone 20
- **Why players watch**: Dewdrops buy exclusive stuff. Clear long-term investment

### 4. Lucky Sprout (Random Pop-up)
- **Button**: A small sprout icon that occasionally appears on the main screen (every 10-15 minutes of active play)
- **Display**: "A Lucky Sprout appeared! Watch to see what it grows into!"
- **Reward**: Random reward wheel — possibilities include:
  - 5 minutes of production as bonus Sunlight (common)
  - 2x tap value for 5 minutes (uncommon)
  - 1 bonus Dewdrop (rare)
  - Free Bloomling level-up (rare)
  - 10% Nectar bonus on next Rebirth (very rare)
- **Cooldown**: Appears naturally, 10-15 minute interval
- **Why players watch**: Mystery box psychology. The "what will I get?" excitement

### 5. Gate Assist (Gate Zones)
- **Button**: Appears when a player fails a gate zone or is struggling
- **Options**: 
  - "+15 seconds" on gate timer
  - "1.5x Sunlight during this gate"
- **Reward**: As described
- **Cooldown**: Once per gate attempt
- **Why players watch**: They're stuck and this unblocks them. Feels like a lifeline, not a tax

### 6. Boss Smash (Biome Bosses)
- **Button**: Appears during boss fights
- **Display**: "Channel the Sun's full power!"
- **Reward**: Deal 25% of boss's max HP as instant damage
- **Cooldown**: Once per boss attempt
- **Why players watch**: Boss fights feel epic. This is a dramatic power moment

### 7. Combo Keeper (During Active Play)
- **Button**: Appears when combo is above 50 hits
- **Display**: "Freeze your combo for 5 minutes!"
- **Reward**: Combo decay paused for 5 minutes
- **Cooldown**: Once per 30 minutes
- **Why players watch**: They've built up a massive combo and don't want to lose it

---

## Ad Presentation Rules

1. **Never interrupt gameplay** — Ads only play when the player taps an ad button
2. **Always show the reward first** — The player knows exactly what they get before watching
3. **Graceful failure** — If no ad is available (no fill), show "No boost available right now — check back soon!" Never show an error
4. **Pre-load ads** — Ads should be loaded in the background so they play instantly when tapped
5. **"Ad" label required** — Every ad button clearly labeled per AdMob policies
6. **No dark patterns** — Ad buttons never look like gameplay buttons. Distinct styling (golden/special border)
7. **Reward delivered instantly** — The moment the ad finishes, the reward applies. No delay

---

## Ad Revenue Optimization Strategy

### Maximize Voluntary Watch Rate
The goal isn't to show the most ads — it's to have the highest **opt-in rate**. Players who *want* to watch ads are more engaged, watch more over time, and have higher lifetime value.

### Levers to Increase Watch Rate
1. **Generous rewards** — One ad should feel like 10+ minutes of progress
2. **Clear value display** — Show exact numbers: "Watch to earn 45,000 Sunlight" not just "Watch for bonus"
3. **Streak incentives** — Daily Dewdrop bonuses for consecutive watches
4. **Exclusive content** — Mythic Bloomlings only available through Dewdrops
5. **Social proof** (future) — "Gardeners watched 1M ads today" community counter
6. **No burnout** — Daily cap prevents ad fatigue. Leave players wanting more, not exhausted

### Expected Watch Rates (Industry Benchmarks + Our Targets)
| Touchpoint | Industry Average | Our Target |
|---|---|---|
| Double Offline | 60-70% | 80%+ |
| Sunbeam Boost | 30-40% | 50%+ |
| Dewdrop Garden | 20-30% | 40%+ |
| Lucky Sprout | 40-50% | 60%+ |
| Gate/Boss Assist | 50-60% | 70%+ |

---

## Revenue Projection Model (Rough)

Assuming:
- Average player watches 5-8 ads per day
- eCPM (revenue per 1000 ad views): $10-$20 (rewarded video average)
- DAU: variable

```
Daily Revenue = DAU * avgAdsPerDay * (eCPM / 1000)
Example: 10,000 DAU * 6 ads * ($15/1000) = $900/day
```

The model scales linearly with DAU. Focus on retention to grow DAU.

---

## What We Will NEVER Do

- Force an ad to play
- Show banner ads
- Gate core gameplay behind ads
- Make Dewdrops purchasable with real money (this devalues ad-watching)
- Punish players who don't watch ads
- Use misleading "X" buttons on ad screens
- Show ads to players under 13 (COPPA compliance)

---

## Next Section
See `06-retention-hooks.md` for daily rewards, streaks, achievements, and addiction mechanics.
