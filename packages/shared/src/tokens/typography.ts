/**
 * @gonggu/shared/tokens — Typography Tokens
 *
 * ★ SINGLE SOURCE OF TRUTH ★
 * Shared font size scale with both rem (web) and pt (mobile) mappings.
 *
 * Architecture:
 *   - Web uses rem (1rem = 16px base)
 *   - Mobile uses pt (1pt ≈ 1px at 1x, scaled by device)
 *   - Semantic names map to different concrete values per platform
 *
 * Font stacks are platform-specific — defined in platform token files.
 * This file holds scale, weight, line-height, letter-spacing only.
 */

// ============================================================================
// FONT SIZE SCALE
// ============================================================================

export interface FontSizeEntry {
  /** Web value in rem (1rem = 16px base) */
  web: string;
  /** Mobile value in pt (integer or decimal, React Native uses pt) */
  mobile: number;
}

/** Font size scale — semantic names with platform-specific values */
export const fontSizeScale: Record<string, FontSizeEntry> = {
  xs: {
    web: '0.75rem',   // 12px
    mobile: 12,
  },
  sm: {
    web: '0.875rem',  // 14px
    mobile: 14,
  },
  base: {
    web: '1rem',      // 16px
    mobile: 16,
  },
  lg: {
    web: '1.125rem',  // 18px
    mobile: 18,
  },
  xl: {
    web: '1.25rem',   // 20px
    mobile: 20,
  },
  '2xl': {
    web: '1.5rem',    // 24px
    mobile: 24,
  },
  '3xl': {
    web: '1.875rem',  // 30px
    mobile: 28,
  },
  '4xl': {
    web: '2.25rem',   // 36px
    mobile: 32,
  },
  '5xl': {
    web: '3rem',      // 48px
    mobile: 36,
  },
  display: {
    web: '4rem',      // 64px
    mobile: 40,
  },
  'display-lg': {
    web: '5rem',      // 80px
    mobile: 48,
  },
} as const;

// ============================================================================
// FONT WEIGHT
// ============================================================================

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ============================================================================
// LINE HEIGHT
// ============================================================================

export const lineHeight = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
} as const;

// ============================================================================
// LETTER SPACING
// ============================================================================

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.02em',
} as const;

// ============================================================================
// FONT FAMILY (SHARED ROLE NAMES)
// ============================================================================

/**
 * Font role definitions — platform-specific stacks resolve these.
 * Web: packages/ui-web uses Geist (next/font) + system fallback.
 * Mobile: apps/mobile uses Pretendard (Korean) / SF Pro (English).
 */
export const fontFamilyRoles = {
  display: 'var(--font-display, var(--font-sans))',
  sans: 'var(--font-sans, system-ui, sans-serif)',
  mono: 'var(--font-mono, monospace)',
} as const;

// ============================================================================
// COMPOSITE TYPOGRAPHY EXPORT
// ============================================================================

export const typography = {
  fontSize: fontSizeScale,
  fontWeight,
  lineHeight,
  letterSpacing,
  fontFamily: fontFamilyRoles,
} as const;

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Convert web rem value to pixels (assuming 16px base)
 * Example: "1.5rem" → 24
 */
export function remToPx(rem: string): number {
  const num = parseFloat(rem.replace('rem', ''));
  return num * 16;
}

/**
 * Get the web CSS value for a font size token
 */
export function webFontSize(name: keyof typeof fontSizeScale): string {
  return fontSizeScale[name].web;
}

/**
 * Get the mobile pt value for a font size token
 */
export function mobileFontSize(name: keyof typeof fontSizeScale): number {
  return fontSizeScale[name].mobile;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type FontSizeName = keyof typeof fontSizeScale;
export type FontWeightName = keyof typeof fontWeight;
export type LineHeightName = keyof typeof lineHeight;
