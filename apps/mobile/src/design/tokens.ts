/**
 * @gonggu/mobile — Instagram-style Design Tokens
 *
 * Color palette, spacing, shadows, border-radius, and typography
 * inspired by Instagram's clean, card-based UI language.
 */

// ─── Instagram-Inspired Color Palette ──────────────────────────────
export const colors = {
  // Primary brand
  primary: '#4f63d7' as const,
  primaryLight: '#6b7fe8' as const,
  primaryDark: '#3d4fc0' as const,
  primaryBg: '#eff0ff' as const,

  // Instagram accent (pink/red)
  accent: '#e1306c' as const,
  accentLight: '#ff5a8a' as const,
  accentBg: '#fff0f5' as const,

  // Backgrounds
  bg: '#fafafa' as const,
  surface: '#ffffff' as const,
  surfaceHover: '#f8f8f8' as const,

  // Text
  textPrimary: '#1a1a2e' as const,
  textSecondary: '#6b7280' as const,
  textTertiary: '#9ca3af' as const,
  textInverse: '#ffffff' as const,
  textLink: '#4f63d7' as const,

  // Borders & dividers
  border: '#f0f0f0' as const,
  borderLight: '#f5f5f5' as const,
  divider: '#f3f4f6' as const,

  // Feedback
  success: '#22c55e' as const,
  successBg: '#f0fdf4' as const,
  warning: '#f59e0b' as const,
  warningBg: '#fef3c7' as const,
  error: '#ef4444' as const,
  errorBg: '#fef2f2' as const,

  // Misc
  skeleton: '#e5e7eb' as const,
  overlay: 'rgba(0, 0, 0, 0.5)' as const,
  badgeBg: '#eff6ff' as const,
  badgeText: '#4f63d7' as const,
} as const;

// ─── Spacing Scale (4px base) ────────────────────────────────────
export const spacing = {
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px — standard card padding */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px — section spacing */
  '2xl': 24,
  /** 32px */
  '3xl': 32,
} as const;

// ─── Border Radius ──────────────────────────────────────────────
export const borderRadius = {
  /** 8px — inputs, small elements */
  sm: 8,
  /** 10px — buttons */
  md: 10,
  /** 12px — primary buttons */
  lg: 12,
  /** 16px — cards */
  xl: 16,
  /** 999px — pills, badges */
  full: 999,
} as const;

// ─── Shadows (iOS style) ───────────────────────────────────────
export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const shadows: Record<'sm' | 'md' | 'lg', ShadowStyle> = {
  /** Subtle card shadow */
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  /** Standard card shadow */
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  /** Modal / overlay shadow */
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
};

// ─── Typography ─────────────────────────────────────────────────
export const typography = {
  eyebrow: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
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
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardBrand: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardSummary: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.badgeText,
  },
};

// ─── NativeWind-Compatible ClassName Fragments ─────────────────
// These strings can be composed into className for hybrid NativeWind usage.
export const tw = {
  card: 'bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm',
  primaryButton: 'mt-6 py-3.5 bg-[#4f63d7] rounded-xl items-center',
  secondaryButton: 'py-2.5 px-4 bg-gray-100 rounded-xl self-start',
  primaryButtonText: 'text-base font-semibold text-white',
  secondaryButtonText: 'text-sm font-semibold text-gray-700',
  input: 'border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white',
  notice: 'p-3 bg-amber-100 rounded-lg mb-4',
  noticeText: 'text-xs text-amber-800 text-center',
  badge: 'text-xs font-semibold text-[#4f63d7] bg-blue-50 px-2 py-1 rounded-full',
  headerTitle: 'text-3xl font-bold text-[#1a1a2e] mb-1',
  headerSubtitle: 'text-sm text-gray-500 leading-5 mb-4',
  eyebrow: 'text-xs font-semibold text-[#4f63d7] tracking-wide mb-1',
};
