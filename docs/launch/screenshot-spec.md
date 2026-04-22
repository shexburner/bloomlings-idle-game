# Bloomlings — Screenshot Specification

## Required Sizes

### iOS (App Store Connect)
| Device | Size (px) |
|---|---|
| iPhone 6.7" (15 Pro Max) | 1290 × 2796 |
| iPhone 6.5" (11 Pro Max) | 1242 × 2688 |
| iPad Pro 12.9" | 2048 × 2732 |

### Android (Google Play Console)
| Type | Size (px) |
|---|---|
| Phone | 1080 × 1920 (min) |
| 7" Tablet | 1200 × 1920 |
| 10" Tablet | 1600 × 2560 |

## Screenshot Plan (6 Screenshots)

---

### Screenshot 1 — "The Garden" (Hero Shot)
**What to show**: Garden screen during active tapping. Combo meter active at 10+, tap feedback particles visible, a Bloomling displayed in the center, CurrencyBar showing Sunlight ticking up, zone progress partially filled.

**Caption overlay**: "Tap to Grow Your Bloomlings"

**Key testIDs**:
- `tap-area` — main tap interaction zone
- `combo-meter` / `combo-count` / `combo-multiplier` — combo state
- `currency-bar` / `currency-sunlight` / `currency-sunlight-rate` — currency display
- `zone-progress` / `zone-label` / `zone-biome` — zone info

**Notes**: This is the hero screenshot. Capture mid-combo with floating tap numbers visible. The screen should feel alive and tactile.

---

### Screenshot 2 — "Your Collection"
**What to show**: Collection grid with 8–12 Bloomlings discovered (mix of locked silhouettes and unlocked cards across rarities). One Bloomling detail modal open showing name, rarity, lore, and evolution stage.

**Caption overlay**: "Discover 28+ Unique Bloomlings"

**Key testIDs**:
- `collection-grid` / `collection-discovered-count` — grid view
- `bloomling-card-{id}` — individual cards (unlocked)
- `bloomling-card-{id}-locked` — silhouette cards
- `bloomling-detail` — detail modal
- `bloomling-detail-evolve` — evolution button
- `bloomling-detail-garden-toggle` — garden placement

**Notes**: Show a mix of Common/Uncommon/Rare to hint at depth. Detail modal should show a Bloom-stage Bloomling with evolution available.

---

### Screenshot 3 — "Upgrade Shop"
**What to show**: Shop screen on the Tap upgrades tab. Several UpgradeCards visible at different levels, BuyMultiplierToggle set to x10. One upgrade affordable, one just out of reach.

**Caption overlay**: "Power Up Your Garden"

**Key testIDs**:
- `shop-screen` — shop container
- `shop-tab-tap` / `shop-tab-idle` — category tabs
- `upgrade-card-{id}` — individual upgrade cards
- `upgrade-level-{id}` — level indicators
- `upgrade-buy-{id}` — buy buttons
- `buy-multiplier-toggle` / `multiplier-{label}` — bulk buy toggle

**Notes**: Show enough Sunlight in the CurrencyBar to make one purchase look tempting. Idle tab should be visible but not selected.

---

### Screenshot 4 — "Rebirth & Prestige"
**What to show**: Rebirth screen with the Rebirth panel open. Show Nectar balance, the rebirth preview (Nectar to earn), and the Nectar Shop tab visible. Transcendence tab locked/greyed.

**Caption overlay**: "Rebirth. Grow Stronger. Repeat."

**Key testIDs**:
- `rebirth-screen` — main container
- `rebirth-nectar-balance` / `rebirth-essence-balance` — currency display
- `rebirth-tab-rebirth` / `rebirth-tab-shop` — tab navigation
- `rebirth-button` — main rebirth action
- `rebirth-tab-transcendence` — locked transcendence tab

**Notes**: The preview should show a meaningful Nectar reward (e.g., 150+ Nectar). Show that Transcendence exists but is locked to tease deeper progression.

---

### Screenshot 5 — "Nectar & Essence Shops"
**What to show**: Nectar Shop tab active with several NectarUpgradeCards visible (some purchased, some available). Essence Shop tab visible in the tab bar to hint at the second prestige layer.

**Caption overlay**: "Spend Prestige, Unlock Power"

**Key testIDs**:
- `nectar-shop` — shop container
- `nectar-shop-item-{id}` — individual upgrade cards
- `nectar-shop-buy-{id}` — buy buttons
- `rebirth-tab-shop` — active tab
- `rebirth-tab-essence-shop` — essence shop tab (visible)

**Notes**: Show 2–3 upgrades already purchased (level > 0) to demonstrate progression. Nectar balance should show enough for one more purchase.

---

### Screenshot 6 — "Achievements & Rewards"
**What to show**: Achievements list with a mix of completed (with checkmarks/gold), in-progress, and locked/hidden achievements. Daily reward modal overlaid or shown as an inset.

**Caption overlay**: "Earn Rewards Every Day"

**Key testIDs**:
- `achievements-list` — main list
- `achievement-card-{id}` — individual achievement cards (mix of states)
- `daily-reward-modal` — daily reward overlay
- `daily-reward-collect` — collect button

**Notes**: Show achievements from different categories (Progression, Collection, Prestige). Include at least one hidden achievement to create curiosity.

---

## General Guidelines

- **Background**: Use the app's dark theme. No custom backgrounds — let the UI speak.
- **Device frames**: Add device frames in post-processing (iPhone 15 Pro, Pixel 8).
- **Caption style**: White text, semi-bold, centered above or below the screenshot. Keep captions under 6 words.
- **State setup**: Use debug/dev tools to set game state before capture. Ensure currencies show meaningful numbers (not 0, not absurdly high).
- **Localization**: Captions will need localization. Keep text in a separate overlay layer for easy swapping.
- **Order matters**: Screenshot 1 (Garden) is the most important — it appears in search results.
