// =============================================================================
// Bloomlings Design System — all design tokens
// =============================================================================
// Translated from the Claude Design handoff (colors_and_type.css).
// Fantasy / enchanted-garden direction: parchment + heraldic gold + enchanted greens.
// =============================================================================

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const COLORS = {
  // Warm neutrals — enchanted parchment & twilight ink
  paper:       "#F3E4BE",
  paperDeep:   "#E8D4A0",
  surface:     "#FBF0CF",
  surface2:    "#E5CF94",
  ink:         "#1A1225",
  ink2:        "#3D2E4A",
  ink3:        "#6F5A7A",
  line:        "#D4B87A",
  lineStrong:  "#B8913A",
  gilt:        "#D4A74A",

  // Core brand — enchanted greens
  moss:        "#2D5A3A",
  mossDeep:    "#1A3A26",
  sage:        "#6FAE7C",
  sageSoft:    "#C3DFA8",
  fern:        "#8FD19E",
  emerald:     "#0F7A4A",

  // Currencies
  sunlight:    "#F4B21C",
  sunlightHi:  "#FFE47A",
  sunlightBg:  "#FFEBB5",
  nectar:      "#D53C5E",
  nectarHi:    "#F58AA3",
  nectarBg:    "#FBCFD9",
  essence:     "#7B3FCF",
  essenceHi:   "#B88DFF",
  essenceBg:   "#DBC8FA",
  dewdrop:     "#2596B0",
  dewdropHi:   "#8FDCEC",
  dewdropBg:   "#C0E5EE",
  moonsilver:  "#B8C8D8",

  // Rarity — heraldic jewels
  rarityCommon:    "#7A6B52",
  rarityUncommon:  "#2E8750",
  rarityRare:      "#2566BF",
  rarityEpic:      "#8B3FC9",
  rarityLegendary: "#DE8E0C",
  rarityMythic:    "#C91E5A",

  // Biome tints
  biomeCradleBg:    "#D8C896",
  biomeCradleGlow:  "#FFDE8A",
  biomeCradleDeep:  "#2D5A3A",
  biomeGladeBg:     "#F5C960",
  biomeGladeGlow:   "#FFF0A8",
  biomeGladeDeep:   "#8A5A1A",
  biomeHollowBg:    "#142A38",
  biomeHollowGlow:  "#5FBFA8",
  biomeHollowDeep:  "#0A1820",
  biomeCavernsBg:   "#1E1530",
  biomeCavernsGlow: "#C89FFF",
  biomeCavernsDeep: "#0E0820",

  // Semantic
  success: "#4F9A52",
  warning: "#E0A035",
  danger:  "#C4452E",
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const FONTS = {
  display:             "Fraunces_700Bold",
  displayItalic:       "Fraunces_700Bold_Italic",
  displayMedium:       "Fraunces_500Medium",
  displayMediumItalic: "Fraunces_500Medium_Italic",
  body:                "Nunito_400Regular",
  bodyMedium:          "Nunito_600SemiBold",
  bodySemiBold:        "Nunito_700Bold",
  bodyBold:            "Nunito_800ExtraBold",
  bodyBlack:           "Nunito_900Black",
} as const;

export const TEXT_SIZE = {
  xs:    12,
  sm:    13,
  base:  15,
  md:    17,
  lg:    20,
  xl:    24,
  "2xl": 30,
  "3xl": 38,
  "4xl": 48,
} as const;

// ---------------------------------------------------------------------------
// Spacing (4pt grid)
// ---------------------------------------------------------------------------

export const SPACING = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ---------------------------------------------------------------------------
// Radii
// ---------------------------------------------------------------------------

export const RADII = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  pill: 999,
} as const;

// ---------------------------------------------------------------------------
// Shadows (React Native)
// ---------------------------------------------------------------------------

export const SHADOWS = {
  sm: {
    shadowColor: "#1A1225",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#1A1225",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: "#1A1225",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
  glowSun: {
    shadowColor: "#F4B21C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 8,
  },
  glowMoss: {
    shadowColor: "#6FAE7C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.50,
    shadowRadius: 18,
    elevation: 8,
  },
  glowNectar: {
    shadowColor: "#D53C5E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.50,
    shadowRadius: 18,
    elevation: 8,
  },
} as const;

// ---------------------------------------------------------------------------
// Gradient color arrays (for use with expo-linear-gradient)
// ---------------------------------------------------------------------------

export const GRADIENTS = {
  surface:    [COLORS.surface, COLORS.paperDeep] as const,
  primary:    [COLORS.sage, COLORS.moss, COLORS.mossDeep] as const,
  gold:       [COLORS.sunlightHi, COLORS.sunlight, "#B8913A"] as const,
  nectar:     ["#F5B8A8", COLORS.nectar] as const,
  activeTab:  [COLORS.sageSoft, COLORS.sage] as const,
  biomeCradle: ["#E8D88A", "#D4C070", "#C0AA58"] as const,
} as const;
