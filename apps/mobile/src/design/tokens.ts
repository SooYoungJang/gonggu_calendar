/**
 * @gonggu/mobile — Design Tokens
 *
 * ★ Source of truth: @gonggu/shared/tokens ★
 *
 * This file exposes React Native-friendly values while delegating all
 * color, spacing, radius, elevation, typography, and motion decisions to
 * the shared cross-platform token package.
 *
 * Primary (v2 unified): oklch(0.58 0.22 260)
 * Accent (Instagram pink): oklch(0.6 0.21 7) / #e1306c
 */

import {
  accent,
  animation as sharedAnimation,
  colors as sharedColors,
  mobileFontSize,
  mobileRadius,
  mobileSpacing,
  neutral,
  oklchToCssRgba,
  oklchToHex,
  primary,
  rnShadows,
  status,
} from '@gonggu/shared/tokens';

// ─── Shared Color Palette (React Native hex values) ──────────────────────────
export const colors = {
  // Primary brand — unified with web via @gonggu/shared/tokens
  primary: oklchToHex(primary[500]),
  primaryLight: oklchToHex(primary[400]),
  primaryDark: oklchToHex(primary[600]),
  primaryBg: oklchToHex(primary[50]),

  // Instagram accent (pink/red) — unified with web
  accent: oklchToHex(accent[500]),
  accentLight: oklchToHex(accent[400]),
  accentBg: oklchToHex(accent[50]),

  // Backgrounds
  bg: oklchToHex(sharedColors.surface.secondary),
  surface: oklchToHex(sharedColors.surface.primary),
  surfaceHover: oklchToHex(sharedColors.surface.tertiary),

  // Text
  textPrimary: oklchToHex(sharedColors.text.primary),
  textSecondary: oklchToHex(sharedColors.text.secondary),
  textTertiary: oklchToHex(sharedColors.text.tertiary),
  textInverse: oklchToHex(sharedColors.text.inverse),
  textLink: oklchToHex(primary[500]),

  // Borders & dividers
  border: oklchToHex(sharedColors.border.primary),
  borderLight: oklchToHex(neutral[100]),
  divider: oklchToHex(neutral[100]),

  // Feedback
  success: oklchToHex(sharedColors.success[500]),
  successBg: oklchToHex(sharedColors.success[50]),
  warning: oklchToHex(sharedColors.warning[500]),
  warningBg: oklchToHex(sharedColors.warning[50]),
  error: oklchToHex(sharedColors.error[500]),
  errorBg: oklchToHex(sharedColors.error[50]),

  // Status-specific colors
  statusPendingBg: oklchToHex(status.pending.bg),
  statusPendingText: oklchToHex(status.pending.text),
  statusPendingBorder: oklchToHex(status.pending.border),
  statusApprovedBg: oklchToHex(status.approved.bg),
  statusApprovedText: oklchToHex(status.approved.text),
  statusApprovedBorder: oklchToHex(status.approved.border),
  statusRejectedBg: oklchToHex(status.rejected.bg),
  statusRejectedText: oklchToHex(status.rejected.text),
  statusRejectedBorder: oklchToHex(status.rejected.border),
  statusReviewBg: oklchToHex(status.review.bg),
  statusReviewText: oklchToHex(status.review.text),
  statusReviewBorder: oklchToHex(status.review.border),
  statusDuplicateBg: oklchToHex(status.duplicate.bg),
  statusDuplicateText: oklchToHex(status.duplicate.text),
  statusDuplicateBorder: oklchToHex(status.duplicate.border),

  // Misc
  skeleton: oklchToHex(neutral[200]),
  shadow: '#000000',
  overlay: oklchToCssRgba(sharedColors.overlay.backdrop),
  badgeBg: oklchToHex(status.review.bg),
  badgeText: oklchToHex(primary[600]),
  noticeText: oklchToHex('oklch(0.47 0.12 48)'),  // deep amber for notice boxes
} as const;

// ─── Spacing Scale (8px grid, with 4px micro step) ──────────────────────────
export const spacing = {
  /** 2px — legacy micro step */
  xxs: 2,
  /** 4px */
  xs: mobileSpacing('1'),
  /** 8px */
  sm: mobileSpacing('2'),
  /** 12px */
  md: mobileSpacing('3'),
  /** 16px — standard card padding */
  lg: mobileSpacing('4'),
  /** 20px */
  xl: mobileSpacing('5'),
  /** 24px — section spacing */
  '2xl': mobileSpacing('6'),
  /** 32px */
  '3xl': mobileSpacing('8'),
  /** 48px */
  '4xl': mobileSpacing('12'),
} as const;

// ─── Border Radius ──────────────────────────────────────────────
export const borderRadius = {
  /** 8px — inputs, small elements */
  sm: mobileRadius('sm'),
  /** 10px — buttons */
  md: mobileRadius('md'),
  /** 12px — primary buttons */
  lg: mobileRadius('lg'),
  /** 16px — cards */
  xl: mobileRadius('xl'),
  /** 999px — pills, badges */
  full: mobileRadius('full'),
} as const;

// ─── Shadows (React Native style) ───────────────────────────────────────
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const shadows: Record<'sm' | 'md' | 'lg', ShadowStyle> = {
  /** Subtle card shadow */
  sm: rnShadows.sm,
  /** Standard card shadow */
  md: rnShadows.card,
  /** Modal / overlay shadow */
  lg: rnShadows.lg,
};

// ─── Typography ─────────────────────────────────────────────────
export const typography = {
  eyebrow: {
    fontSize: mobileFontSize('xs'),
    fontWeight: '600' as const,
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: mobileFontSize('3xl'),
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: mobileFontSize('lg'),
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardBrand: {
    fontSize: mobileFontSize('sm'),
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardSummary: {
    fontSize: mobileFontSize('sm'),
    color: oklchToHex(neutral[600]),
    lineHeight: 20,
  },
  body: {
    fontSize: mobileFontSize('sm'),
    color: colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontSize: mobileFontSize('sm'),
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: mobileFontSize('xs'),
    color: colors.textTertiary,
  },
  badge: {
    fontSize: mobileFontSize('xs'),
    fontWeight: '600' as const,
    color: colors.badgeText,
  },
};

// ─── Animation / Motion ─────────────────────────────────────────
export const animation = {
  duration: sharedAnimation.durations,
  easing: sharedAnimation.easings,
} as const;

// ─── NativeWind-Compatible ClassName Fragments ─────────────────
// These strings remain for compatibility with existing NativeWind usage.
// Color values are resolved from shared tokens at module load time.
export const tw = {
  card: 'bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm',
  primaryButton: `mt-6 py-3.5 bg-[${colors.primary}] rounded-xl items-center`,
  secondaryButton: 'py-2.5 px-4 bg-gray-100 rounded-xl self-start',
  primaryButtonText: 'text-base font-semibold text-white',
  secondaryButtonText: 'text-sm font-semibold text-gray-700',
  input: 'border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white',
  notice: 'p-3 bg-amber-100 rounded-lg mb-4',
  noticeText: 'text-xs text-amber-800 text-center',
  badge: `text-xs font-semibold text-[${colors.badgeText}] bg-blue-50 px-2 py-1 rounded-full`,
  headerTitle: `text-3xl font-bold text-[${colors.textPrimary}] mb-1`,
  headerSubtitle: 'text-sm text-gray-500 leading-5 mb-4',
  eyebrow: `text-xs font-semibold text-[${colors.primary}] tracking-wide mb-1`,
} as const;
