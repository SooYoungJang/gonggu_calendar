/**
 * Design Tokens — Single source of truth for design values
 * Used by: Web (CSS vars via tailwindcss v4 @theme), RN (StyleSheet via Style Dictionary), Figma (Tokens Studio)
 * This file exports raw token values for programmatic access.
 */

// ============================================================================
// COLOR TOKENS (Semantic naming — all values in OKLCH for better color interpolation)
// ============================================================================

export const colors = {
  // Brand / Primary
  primary: {
    50: 'oklch(0.97 0.03 252)',
    100: 'oklch(0.93 0.06 252)',
    200: 'oklch(0.88 0.11 252)',
    300: 'oklch(0.81 0.16 252)',
    400: 'oklch(0.72 0.2 252)',
    500: 'oklch(0.62 0.23 252)',  // Main brand color
    600: 'oklch(0.54 0.23 252)',
    700: 'oklch(0.45 0.21 252)',
    800: 'oklch(0.38 0.18 252)',
    900: 'oklch(0.32 0.15 252)',
    950: 'oklch(0.27 0.12 252)',
  },

  // Status / Semantic
  success: {
    50: 'oklch(0.97 0.03 142)',
    100: 'oklch(0.93 0.08 142)',
    500: 'oklch(0.65 0.2 142)',
    600: 'oklch(0.58 0.19 142)',
  },
  warning: {
    50: 'oklch(0.98 0.02 90)',
    100: 'oklch(0.95 0.06 90)',
    500: 'oklch(0.77 0.18 90)',
    600: 'oklch(0.7 0.17 90)',
  },
  error: {
    50: 'oklch(0.98 0.01 25)',
    100: 'oklch(0.94 0.04 25)',
    500: 'oklch(0.62 0.22 25)',
    600: 'oklch(0.55 0.21 25)',
  },

  // Status-specific (for badges, cards, etc.)
  status: {
    pending: {
      bg: 'oklch(0.98 0.02 90)',      // Amber-50
      text: 'oklch(0.7 0.17 90)',     // Amber-600
      border: 'oklch(0.9 0.1 90)',    // Amber-200
    },
    approved: {
      bg: 'oklch(0.97 0.03 142)',     // Green-50
      text: 'oklch(0.58 0.19 142)',   // Green-600
      border: 'oklch(0.85 0.1 142)',  // Green-200
    },
    rejected: {
      bg: 'oklch(0.98 0.01 25)',      // Red-50
      text: 'oklch(0.55 0.21 25)',    // Red-600
      border: 'oklch(0.9 0.08 25)',   // Red-200
    },
    review: {
      bg: 'oklch(0.97 0.03 252)',     // Blue-50
      text: 'oklch(0.54 0.23 252)',   // Blue-600
      border: 'oklch(0.88 0.11 252)', // Blue-200
    },
    duplicate: {
      bg: 'oklch(0.97 0.005 250)',    // Gray-100
      text: 'oklch(0.55 0.01 250)',   // Gray-600
      border: 'oklch(0.9 0.01 250)',  // Gray-200
    },
  },

  // Neutral / Gray scale
  neutral: {
    0: 'oklch(1 0 0)',
    50: 'oklch(0.98 0.005 250)',
    100: 'oklch(0.96 0.01 250)',
    200: 'oklch(0.9 0.01 250)',
    300: 'oklch(0.82 0.01 250)',
    400: 'oklch(0.7 0.01 250)',
    500: 'oklch(0.55 0.01 250)',
    600: 'oklch(0.45 0.01 250)',
    700: 'oklch(0.37 0.01 250)',
    800: 'oklch(0.27 0.01 250)',
    900: 'oklch(0.21 0.01 250)',
    950: 'oklch(0.15 0.01 250)',
  },

  // Background / Surface
  background: {
    primary: 'oklch(1 0 0)',
    secondary: 'oklch(0.98 0.005 250)',
    tertiary: 'oklch(0.96 0.01 250)',
    inverse: 'oklch(0.21 0.01 250)',
  },

  // Text
  text: {
    primary: 'oklch(0.21 0.01 250)',
    secondary: 'oklch(0.45 0.01 250)',
    tertiary: 'oklch(0.55 0.01 250)',
    inverse: 'oklch(1 0 0)',
    disabled: 'oklch(0.7 0.01 250)',
    link: 'oklch(0.62 0.23 252)',
  },

  // Border
  border: {
    primary: 'oklch(0.9 0.01 250)',
    secondary: 'oklch(0.82 0.01 250)',
    focus: 'oklch(0.62 0.23 252)',
    error: 'oklch(0.62 0.22 25)',
  },

  // Overlay / Shadow
  overlay: {
    backdrop: 'oklch(0 0 0 / 0.5)',
    modal: 'oklch(0 0 0 / 0.08)',
    toast: 'oklch(0 0 0 / 0.12)',
    card: 'oklch(0 0 0 / 0.06)',
  },
} as const;

// ============================================================================
// SPACING TOKENS (8px base grid)
// ============================================================================

export const spacing = {
  0: '0',
  1: '4px',   // --space-1
  2: '8px',   // --space-2
  3: '12px',  // --space-3
  4: '16px',  // --space-4
  5: '20px',  // --space-5
  6: '24px',  // --space-6
  8: '32px',  // --space-8
  10: '40px', // --space-10
  12: '48px', // --space-12
  16: '64px', // --space-16
  20: '80px', // --space-20
  24: '96px', // --space-24
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
    mono: ['var(--font-geist-mono)', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '4px',   // --radius-sm
  md: '8px',   // --radius-md (default)
  lg: '12px',  // --radius-lg
  xl: '16px',  // --radius-xl
  '2xl': '24px',
  full: '9999px', // --radius-full
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
  md: '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)',
  card: '0 2px 8px oklch(0 0 0 / 0.06), 0 0 1px oklch(0 0 0 / 0.04)', // --shadow-card
  modal: '0 8px 24px oklch(0 0 0 / 0.08)', // --shadow-modal
  toast: '0 4px 16px oklch(0 0 0 / 0.12)', // --shadow-toast
  focus: '0 0 0 3px oklch(0.93 0.06 252)', // primary-100 ring
  focusError: '0 0 0 3px oklch(0.94 0.04 25)', // error-50 ring
} as const;

// ============================================================================
// TRANSITION / ANIMATION TOKENS
// ============================================================================

export const transitions = {
  fast: '100ms ease-out',
  normal: '150ms ease-out',
  medium: '200ms ease-in-out',
  slow: '300ms ease-out',
  easings: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  durations: {
    hover: '150ms',
    accordion: '200ms',
    modalEnter: '200ms',
    modalExit: '150ms',
    toastEnter: '300ms',
    toastExit: '200ms',
    buttonTap: '100ms',
    focusRing: '150ms',
    pageTransition: '200ms',
  },
} as const;

// ============================================================================
// LAYOUT TOKENS
// ============================================================================

export const layout = {
  sidebarWidth: '260px',
  headerHeight: '64px',
  cardGap: '16px',
  density: {
    compact: '8px',
    comfortable: '16px',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '1024px',
    desktop: '1440px',
    wide: '1920px',
  },
  zIndex: {
    dropdown: '1000',
    sticky: '1100',
    modal: '1200',
    popover: '1300',
    toast: '1400',
    tooltip: '1500',
  },
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKEN OVERRIDES
// ============================================================================

export const componentTokens = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 24px',
    },
    fontSize: {
      sm: '0.8125rem', // 13px
      md: '0.875rem',  // 14px
      lg: '1rem',      // 16px
    },
    borderRadius: '8px',
  },
  input: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '0 10px',
      md: '0 12px',
      lg: '0 16px',
    },
    fontSize: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    },
    borderRadius: '8px',
  },
  card: {
    padding: {
      sm: '12px',
      md: '16px',
      lg: '24px',
    },
    borderRadius: '12px',
  },
  badge: {
    height: {
      sm: '20px',
      md: '24px',
    },
    fontSize: {
      sm: '0.6875rem', // 11px
      md: '0.75rem',   // 12px
    },
    padding: {
      sm: '0 6px',
      md: '0 8px',
    },
    borderRadius: '9999px',
  },
  toast: {
    maxWidth: '384px',
    minWidth: '280px',
    padding: '16px',
    borderRadius: '12px',
    gap: '12px',
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ColorScale = typeof colors.primary;
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type FontSizeToken = keyof typeof typography.fontSize;
export type BorderRadiusToken = keyof typeof borderRadius;
export type ShadowToken = keyof typeof shadows;
export type TransitionToken = keyof typeof transitions;
export type BreakpointToken = keyof typeof layout.breakpoints;

// ============================================================================
// UTILITY: Generate CSS custom properties from tokens (for programmatic use)
// ============================================================================

export function generateCSSVariables(prefix = 'gonggu'): Record<string, string> {
  const cssVars: Record<string, string> = {};

  // Colors
  Object.entries(colors).forEach(([category, scales]) => {
    if (typeof scales === 'object' && scales !== null) {
      Object.entries(scales as Record<string, unknown>).forEach(([scale, value]) => {
        if (typeof value === 'string') {
          cssVars[`--${prefix}-color-${category}-${scale}`] = value;
        } else if (typeof value === 'object' && value !== null) {
          // Nested objects like status.pending.bg
          Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'string') {
              cssVars[`--${prefix}-color-${category}-${scale}-${subKey}`] = subValue;
            }
          });
        }
      });
    }
  });

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--${prefix}-space-${key}`] = value;
  });

  // Border radius
  Object.entries(borderRadius).forEach(([key, value]) => {
    cssVars[`--${prefix}-radius-${key}`] = value;
  });

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    cssVars[`--${prefix}-shadow-${key}`] = value;
  });

  // Transitions
  Object.entries(transitions.durations).forEach(([key, value]) => {
    cssVars[`--${prefix}-duration-${key}`] = value;
  });

  // Layout
  Object.entries(layout).forEach(([key, value]) => {
    if (typeof value === 'string') {
      cssVars[`--${prefix}-${key}`] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        cssVars[`--${prefix}-${key}-${subKey}`] = subValue;
      });
    }
  });

  return cssVars;
}