/**
 * @gonggu/shared/tokens — Spacing Tokens
 *
 * ★ SINGLE SOURCE OF TRUTH ★
 * 8px grid-based spacing scale with semantic names.
 *
 * Architecture:
 *   - Web uses CSS px values (string)
 *   - Mobile uses px values (number — React Native uses density-independent pixels)
 *   - Both platforms share the same numeric values; only type differs
 *
 * Scale: 0, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
 * Base grid: 8px (with 4px for fine adjustments at space-1)
 */

// ============================================================================
// SPACING SCALE
// ============================================================================

export interface SpacingEntry {
  /** CSS px value for web */
  web: string;
  /** Numeric px value for React Native */
  mobile: number;
}

export const spacing: Record<string, SpacingEntry> = {
  /** 0px — no spacing */
  0: { web: '0', mobile: 0 },
  /** 4px — micro spacing (icon gaps, fine adjustments) */
  1: { web: '4px', mobile: 4 },
  /** 8px — tight spacing (badge padding, small element gaps) */
  2: { web: '8px', mobile: 8 },
  /** 12px — comfortable tight spacing */
  3: { web: '12px', mobile: 12 },
  /** 16px — default spacing (card padding, button padding) */
  4: { web: '16px', mobile: 16 },
  /** 20px — comfortable spacing */
  5: { web: '20px', mobile: 20 },
  /** 24px — section spacing (between cards, form section gaps) */
  6: { web: '24px', mobile: 24 },
  /** 32px — large spacing (section to section) */
  8: { web: '32px', mobile: 32 },
  /** 40px — extra large spacing */
  10: { web: '40px', mobile: 40 },
  /** 48px — page section gap */
  12: { web: '48px', mobile: 48 },
  /** 64px — hero / page padding */
  16: { web: '64px', mobile: 64 },
  /** 80px — large hero spacing */
  20: { web: '80px', mobile: 80 },
  /** 96px — maximum spacing */
  24: { web: '96px', mobile: 96 },
} as const;

// ============================================================================
// SEMANTIC SPACING ALIASES
// ============================================================================

/**
 * Semantic names for common spacing use-cases.
 * Both platforms resolve to the same numeric value.
 */
export const semanticSpacing: Record<string, { web: string; mobile: number }> = {
  /** 0px */
  none: { web: '0', mobile: 0 },
  /** 4px — super tight */
  xxs: { web: '4px', mobile: 4 },
  /** 8px — tight (icon-to-label, small badge) */
  xs: { web: '8px', mobile: 8 },
  /** 12px — comfortable tight */
  sm: { web: '12px', mobile: 12 },
  /** 16px — default / standard */
  md: { web: '16px', mobile: 16 },
  /** 24px — section spacing */
  lg: { web: '24px', mobile: 24 },
  /** 32px — large section separation */
  xl: { web: '32px', mobile: 32 },
  /** 48px — page section gap */
  '2xl': { web: '48px', mobile: 48 },
  /** 64px — hero gap */
  '3xl': { web: '64px', mobile: 64 },
} as const;

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Get web CSS spacing value by scale index
 */
export function webSpacing(name: keyof typeof spacing): string {
  return spacing[name].web;
}

/**
 * Get mobile numeric spacing value by scale index
 */
export function mobileSpacing(name: keyof typeof spacing): number {
  return spacing[name].mobile;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SpacingKey = keyof typeof spacing;
export type SemanticSpacingKey = keyof typeof semanticSpacing;
