/**
 * @gonggu/shared/tokens — Animation / Motion Tokens
 *
 * ★ SINGLE SOURCE OF TRUTH ★
 * Shared duration and easing values for both platforms.
 *
 * Architecture:
 *   - Web: CSS animation-duration / transition-duration + cubic-bezier
 *   - Mobile: Animated.timing duration + Easing functions
 *   - All values expressed in milliseconds (ms) for cross-platform consistency
 */

// ============================================================================
// EASING CURVES
// ============================================================================

export const easings = {
  /** Ease-out — enter animations (elements appearing) */
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Ease-in — exit animations (elements disappearing) */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Ease-in-out — expand/collapse, height transitions */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Spring-like — microinteractions, button press */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ============================================================================
// DURATIONS
// ============================================================================

export const durations = {
  /** 100ms — button press, card tap feedback */
  fast: 100,
  /** 150ms — hover transitions, focus ring appear */
  normal: 150,
  /** 200ms — modal enter, accordion expand, page transitions */
  medium: 200,
  /** 300ms — toast slide in, longer transitions */
  slow: 300,
  /** 400ms — page enter animations */
  xslow: 400,
} as const;

// ============================================================================
// COMPOSITE ANIMATION EXPORT
// ============================================================================

export const animation = {
  easings,
  durations,
} as const;

// ============================================================================
// INTERACTION-SPECIFIC TIMING
// ============================================================================

/**
 * Per-interaction animation specs
 */
export const interactionAnimation = {
  cardHover: {
    duration: durations.normal,
    easing: easings.easeOut,
    properties: ['background-color', 'box-shadow'],
  },
  buttonPress: {
    duration: durations.fast,
    easing: easings.easeOut,
    transform: 'scale(0.98)',
  },
  focusRing: {
    duration: durations.normal,
    easing: easings.easeOut,
  },
  accordionExpand: {
    duration: durations.medium,
    easing: easings.easeInOut,
    properties: ['height', 'opacity'],
  },
  modalEnter: {
    duration: durations.medium,
    easing: easings.easeOut,
    transform: 'scale(0.95 → 1)',
    opacity: '0 → 1',
  },
  modalExit: {
    duration: durations.normal,
    easing: easings.easeIn,
    transform: 'scale(1 → 0.95)',
    opacity: '1 → 0',
  },
  toastEnter: {
    duration: durations.slow,
    easing: easings.easeOut,
    transform: 'translateY(100% → 0)',
    opacity: '0 → 1',
  },
  toastExit: {
    duration: durations.medium,
    easing: easings.easeIn,
    transform: 'translateY(0 → 100%)',
    opacity: '1 → 0',
  },
  pageTransition: {
    duration: durations.medium,
    easing: easings.easeInOut,
    properties: ['opacity', 'transform'],
  },
} as const;

// ============================================================================
// CSS STRING HELPERS
// ============================================================================

/**
 * Get CSS transition shorthand value
 */
export function transition(duration: number, easing: string, property = 'all'): string {
  return `${property} ${duration}ms ${easing}`;
}

/**
 * Get CSS transition with named duration + easing
 */
export function transitionFast(property = 'all'): string {
  return transition(durations.fast, easings.easeOut, property);
}

export function transitionNormal(property = 'all'): string {
  return transition(durations.normal, easings.easeOut, property);
}

export function transitionSlow(property = 'all'): string {
  return transition(durations.slow, easings.easeOut, property);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type EasingKey = keyof typeof easings;
export type DurationKey = keyof typeof durations;
export type InteractionKey = keyof typeof interactionAnimation;
