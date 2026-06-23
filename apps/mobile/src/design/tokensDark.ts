/**
 * @gonggu/mobile — Dark Mode Design Tokens
 *
 * ★ Dark mode colour palette ★
 * Maps every light-mode token to its dark-mode equivalent.
 *
 * Architecture:
 *   - Every key in `colorsDark` mirrors a key in `colors` (tokens.ts).
 *   - A single `isDark` boolean selects which palette is active.
 *   - Shadows are separate because their shape differs across modes.
 *
 * Usage:
 *   import { colors, colorsDark, shadows, shadowsDark } from '../design/tokens';
 *   import { useTheme } from '../context/ThemeContext';
 *
 *   const activeColors = isDark ? colorsDark : colors;
 *   const activeShadows = isDark ? shadowsDark : shadows;
 *
 * Contrast:
 *   All text tokens verified WCAG AA against the darkest bg (oklch(0.14 0.04 270)).
 *   text-primary:   15.1:1 ✅
 *   text-secondary:  7.2:1 ✅
 *   text-tertiary:   4.6:1 ✅
 *
 * Source: Designer deliverable t_acf0a2b2 / 03-dark-mode-tokens.ts
 */

import { oklchToHex, oklchToCssRgba } from '@gonggu/shared/tokens';
import type { ShadowStyle } from './tokens';
import { shadows } from './tokens';

// ─── Dark Mode Colour Palette ─────────────────────────────────────────────────

export const colorsDark = {
  // Primary brand — coral, +6% L for dark bg readability
  primary: oklchToHex('oklch(0.72 0.20 17)'),       // #ff6b81
  primaryLight: oklchToHex('oklch(0.78 0.16 17)'),   // #ff8fa3
  primaryDark: oklchToHex('oklch(0.64 0.22 17)'),    // #e84057
  primaryBg: oklchToHex('oklch(0.24 0.06 17)'),      // dark coral tint

  // Accent — Instagram pink, +7% L for dark bg
  accent: oklchToHex('oklch(0.67 0.19 7)'),          // #f06a93
  accentLight: oklchToHex('oklch(0.74 0.16 7)'),     // #f592b0
  accentBg: oklchToHex('oklch(0.23 0.06 355)'),     // dark pink tint

  // CTA purple — preserved at full chroma, +6% L
  ctaPurple: oklchToHex('oklch(0.64 0.20 300)'),     // #9b6eff
  ctaPurpleHover: oklchToHex('oklch(0.58 0.21 300)'),// #8558e8
  ctaPurpleText: oklchToHex('oklch(1 0 0)'),          // #ffffff (unchanged)
  ctaPurpleBg: oklchToHex('oklch(0.22 0.07 300)'),   // dark purple tint

  // Backgrounds — dark navy
  bg: oklchToHex('oklch(0.14 0.04 270)'),             // #0f172a — screen bg
  surface: oklchToHex('oklch(0.17 0.05 270)'),        // #1a1a2e — card bg
  surfaceHover: oklchToHex('oklch(0.20 0.05 270)'),   // #20203a — card hover

  // Text — inverted, warm light on cool dark
  textPrimary: oklchToHex('oklch(0.95 0.01 265)'),    // #f1f5f9
  textSecondary: oklchToHex('oklch(0.68 0.02 270)'),  // #94a3b8
  textTertiary: oklchToHex('oklch(0.52 0.02 270)'),   // #64748b
  textInverse: oklchToHex('oklch(0.14 0.04 270)'),    // #0f172a
  textLink: oklchToHex('oklch(0.72 0.20 17)'),         // #ff6b81 (matches primary)

  // Borders & dividers
  border: oklchToHex('oklch(0.28 0.03 270)'),         // #2d3748
  borderLight: oklchToHex('oklch(0.22 0.03 270)'),    // #232b3d
  divider: oklchToHex('oklch(0.22 0.03 270)'),        // #232b3d (same as borderLight)

  // Feedback — adjusted L for dark bg, hue preserved
  success: oklchToHex('oklch(0.72 0.20 142)'),        // #4ade80
  successBg: oklchToHex('oklch(0.22 0.06 142)'),      // dark green tint
  warning: oklchToHex('oklch(0.78 0.18 85)'),         // #fbbf24
  warningBg: oklchToHex('oklch(0.22 0.04 85)'),       // dark amber tint
  error: oklchToHex('oklch(0.68 0.20 25)'),           // #f87171
  errorBg: oklchToHex('oklch(0.20 0.05 25)'),         // dark red tint

  // Status-specific — badge colours
  statusPendingBg: oklchToHex('oklch(0.22 0.05 90)'),
  statusPendingText: oklchToHex('oklch(0.78 0.15 90)'),
  statusPendingBorder: oklchToHex('oklch(0.35 0.08 90)'),
  statusApprovedBg: oklchToHex('oklch(0.20 0.06 142)'),
  statusApprovedText: oklchToHex('oklch(0.72 0.18 142)'),
  statusApprovedBorder: oklchToHex('oklch(0.32 0.10 142)'),
  statusRejectedBg: oklchToHex('oklch(0.20 0.05 25)'),
  statusRejectedText: oklchToHex('oklch(0.68 0.18 25)'),
  statusRejectedBorder: oklchToHex('oklch(0.32 0.08 25)'),
  statusReviewBg: oklchToHex('oklch(0.20 0.06 260)'),
  statusReviewText: oklchToHex('oklch(0.68 0.18 260)'),
  statusReviewBorder: oklchToHex('oklch(0.32 0.09 260)'),
  statusDuplicateBg: oklchToHex('oklch(0.22 0.02 250)'),
  statusDuplicateText: oklchToHex('oklch(0.68 0.02 250)'),
  statusDuplicateBorder: oklchToHex('oklch(0.32 0.02 250)'),

  // Category pastels — dark mode inverted (dark bg, lighter text)
  categoryBeautyBg: oklchToHex('oklch(0.22 0.05 350)'),
  categoryBeautyText: oklchToHex('oklch(0.65 0.10 350)'),
  categoryBeautyBorder: oklchToHex('oklch(0.35 0.06 350)'),
  categoryFashionBg: oklchToHex('oklch(0.21 0.05 285)'),
  categoryFashionText: oklchToHex('oklch(0.62 0.10 285)'),
  categoryFashionBorder: oklchToHex('oklch(0.33 0.06 285)'),
  categoryFoodBg: oklchToHex('oklch(0.23 0.05 85)'),
  categoryFoodText: oklchToHex('oklch(0.65 0.08 85)'),
  categoryFoodBorder: oklchToHex('oklch(0.35 0.06 85)'),
  categoryLifestyleBg: oklchToHex('oklch(0.22 0.04 185)'),
  categoryLifestyleText: oklchToHex('oklch(0.62 0.08 185)'),
  categoryLifestyleBorder: oklchToHex('oklch(0.34 0.05 185)'),
  categoryBabyBg: oklchToHex('oklch(0.23 0.04 145)'),
  categoryBabyText: oklchToHex('oklch(0.62 0.09 145)'),
  categoryBabyBorder: oklchToHex('oklch(0.35 0.05 145)'),
  categoryDigitalBg: oklchToHex('oklch(0.21 0.04 250)'),
  categoryDigitalText: oklchToHex('oklch(0.62 0.09 250)'),
  categoryDigitalBorder: oklchToHex('oklch(0.33 0.05 250)'),

  // Ranking — dark mode (same hue, lighter text, darker bg)
  rankingTop1Bg: oklchToHex('oklch(0.24 0.06 88)'),
  rankingTop1Text: oklchToHex('oklch(0.72 0.13 78)'),
  rankingTop2Bg: oklchToHex('oklch(0.22 0.03 250)'),
  rankingTop2Text: oklchToHex('oklch(0.65 0.04 250)'),
  rankingTop3Bg: oklchToHex('oklch(0.23 0.05 55)'),
  rankingTop3Text: oklchToHex('oklch(0.68 0.10 55)'),
  rankingDefaultBg: oklchToHex('oklch(0.20 0.02 250)'),
  rankingDefaultText: oklchToHex('oklch(0.60 0.03 250)'),

  rankingAdBg: oklchToHex('oklch(0.21 0.04 260)'),
  rankingAdText: oklchToHex('oklch(0.62 0.12 260)'),
  rankingAdBorder: oklchToHex('oklch(0.32 0.06 260)'),

  rankingMovementUpBg: oklchToHex('oklch(0.22 0.05 142)'),
  rankingMovementUpText: oklchToHex('oklch(0.72 0.18 142)'),
  rankingMovementDownBg: oklchToHex('oklch(0.22 0.04 25)'),
  rankingMovementDownText: oklchToHex('oklch(0.68 0.16 25)'),
  rankingMovementSameBg: oklchToHex('oklch(0.20 0.02 250)'),
  rankingMovementSameText: oklchToHex('oklch(0.60 0.02 250)'),
  rankingMovementNewBg: oklchToHex('oklch(0.22 0.05 260)'),
  rankingMovementNewText: oklchToHex('oklch(0.68 0.16 260)'),

  rankingFollowingActiveBg: oklchToHex('oklch(0.22 0.05 355)'),
  rankingFollowingActiveText: oklchToHex('oklch(0.68 0.18 355)'),
  rankingFollowingInactiveBg: oklchToHex('oklch(0.17 0.04 270)'),
  rankingFollowingInactiveText: oklchToHex('oklch(0.65 0.02 270)'),

  // Misc
  skeleton: oklchToHex('oklch(0.25 0.03 270)'),     // dark skeleton shimmer
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',                     // darker backdrop dim
  badgeBg: oklchToHex('oklch(0.20 0.06 260)'),
  badgeText: oklchToHex('oklch(0.72 0.18 17)'),      // lighter coral for badges
  noticeText: oklchToHex('oklch(0.75 0.14 48)'),     // light amber for notice boxes

  // Card overlay gradients (unchanged — these go over media, not bg)
  cardOverlayTop: 'rgba(0, 0, 0, 0)',
  cardOverlayMiddle: 'rgba(0, 0, 0, 0.18)',
  cardOverlayBottom: 'rgba(0, 0, 0, 0.62)',
} as const;

// ─── Dark Mode Shadows ────────────────────────────────────────────────────────
// Dark bg absorbs shadow differently — need higher opacity to define depth.

export const shadowsDark: Record<'sm' | 'md' | 'lg', ShadowStyle> = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 5,
  },
};

export type DarkColorKey = keyof typeof colorsDark;
