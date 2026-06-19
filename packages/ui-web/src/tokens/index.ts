/**
 * @gonggu/ui-web/tokens — Web token compatibility wrapper
 *
 * ★ Source of truth moved to @gonggu/shared/tokens ★
 * This file keeps existing @gonggu/ui-web token imports working while
 * delegating every value to the shared cross-platform token package.
 */

import {
  animation,
  colors,
  durations,
  easings,
  radii,
  shadows,
  spacing,
  typography,
  webRadius,
} from '@gonggu/shared/tokens';

export {
  animation,
  colors,
  durations,
  easings,
  radii,
  shadows,
  spacing,
  typography,
} from '@gonggu/shared/tokens';

export type {
  AccentScale,
  ColorCategory,
  DurationKey,
  EasingKey,
  FontSizeName,
  FontWeightName,
  LineHeightName,
  NeutralScale,
  PrimaryScale,
  RadiusKey,
  SemanticSpacingKey,
  ShadowKey,
  SpacingKey,
  StatusName,
} from '@gonggu/shared/tokens';

// Backward-compatible aliases used by older ui-web components.
export const borderRadius = radii;
export const transitions = animation;
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

export const componentTokens = {
  button: {
    height: { sm: '32px', md: '40px', lg: '48px' },
    padding: { sm: '0 12px', md: '0 16px', lg: '0 24px' },
    fontSize: { sm: '0.8125rem', md: '0.875rem', lg: '1rem' },
    borderRadius: webRadius('md'),
  },
  input: {
    height: { sm: '32px', md: '40px', lg: '48px' },
    padding: { sm: '0 10px', md: '0 12px', lg: '0 16px' },
    fontSize: { sm: '0.875rem', md: '1rem', lg: '1.125rem' },
    borderRadius: webRadius('md'),
  },
  card: {
    padding: { sm: '12px', md: '16px', lg: '24px' },
    borderRadius: webRadius('lg'),
  },
  badge: {
    height: { sm: '20px', md: '24px' },
    fontSize: { sm: '0.6875rem', md: '0.75rem' },
    padding: { sm: '0 6px', md: '0 8px' },
    borderRadius: webRadius('full'),
  },
  toast: {
    maxWidth: '384px',
    minWidth: '280px',
    padding: '16px',
    borderRadius: webRadius('lg'),
    gap: '12px',
  },
} as const;

/**
 * Generate CSS custom properties from shared tokens.
 * Defaults to the legacy `gonggu` prefix for compatibility.
 */
export function generateCSSVariables(prefix = 'gonggu'): Record<string, string> {
  const cssVars: Record<string, string> = {};

  Object.entries(colors).forEach(([category, scales]) => {
    if (typeof scales === 'object' && scales !== null) {
      Object.entries(scales as Record<string, unknown>).forEach(([scale, value]) => {
        if (typeof value === 'string') {
          cssVars[`--${prefix}-color-${category}-${scale}`] = value;
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) => {
            if (typeof subValue === 'string') {
              cssVars[`--${prefix}-color-${category}-${scale}-${subKey}`] = subValue;
            }
          });
        }
      });
    }
  });

  Object.entries(spacing).forEach(([key, value]) => {
    cssVars[`--${prefix}-space-${key}`] = value.web;
  });

  Object.entries(radii).forEach(([key, value]) => {
    cssVars[`--${prefix}-radius-${key}`] = value.web;
  });

  Object.entries(shadows).forEach(([key, value]) => {
    cssVars[`--${prefix}-shadow-${key}`] = value;
  });

  Object.entries(durations).forEach(([key, value]) => {
    cssVars[`--${prefix}-duration-${key}`] = `${value}ms`;
  });

  return cssVars;
}

export type ColorScale = typeof colors.primary;
export type ColorToken = keyof typeof colors;
export type BorderRadiusToken = keyof typeof radii;
export type TransitionToken = keyof typeof animation;
export type BreakpointToken = keyof typeof layout.breakpoints;
