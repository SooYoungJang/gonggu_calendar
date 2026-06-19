/**
 * @gonggu/shared/tokens — Elevation / Shadow Tokens
 *
 * ★ SINGLE SOURCE OF TRUTH ★
 * Shared shadow definitions used by both platforms.
 *
 * Architecture:
 *   - Web: CSS box-shadow string (OKLCH-based)
 *   - Mobile: React Native shadow style objects
 *   - Shadow levels: none, sm, md, lg, xl, card, modal, toast, focus, focusError
 */

// ============================================================================
// SHADOW TOKENS (CSS format)
// ============================================================================

export const shadows: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
  md: '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)',
  card: '0 2px 8px oklch(0 0 0 / 0.06), 0 0 1px oklch(0 0 0 / 0.04)',
  modal: '0 8px 24px oklch(0 0 0 / 0.08)',
  toast: '0 4px 16px oklch(0 0 0 / 0.12)',
  focus: '0 0 0 3px oklch(0.93 0.06 260)',
  focusError: '0 0 0 3px oklch(0.94 0.04 25)',
} as const;

/**
 * React Native shadow style interface
 */
export interface RNShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * React Native shadow style equivalents
 * These are the same visual depth as the CSS shadows above,
 * expressed as RN-compatible style objects.
 */
export const rnShadows: Record<string, RNShadowStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  toast: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ShadowKey = keyof typeof shadows;
