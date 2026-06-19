/**
 * @gonggu/shared — Cross-platform component shared types
 *
 * Base types shared across all component contracts.
 * Both `packages/ui-web` and `apps/mobile` consume these.
 */

/**
 * Platform identifier for platform-specific prop branching.
 * Not used as a runtime value — purely for documentation
 * and conditional type narrowing where rendering differs.
 */
export type Platform = "web" | "mobile";

/**
 * Shared accessibility attributes that every interactive component
 * must implement on both platforms.
 *
 * Web: maps to native ARIA attributes + focus-visible ring.
 * Mobile: maps to accessibilityRole / accessibilityLabel / accessibilityHint
 * in React Native (via @react-native-aria or built-in props).
 */
export interface SharedAccessibilityProps {
  /**
   * Accessible label (replaces visible text for screen readers).
   * Web: `aria-label`. Mobile: `accessibilityLabel`.
   */
  "aria-label"?: string;

  /**
   * Describes the element's purpose in more detail.
   * Web: `aria-describedby` → visually hidden description.
   * Mobile: `accessibilityHint`.
   */
  "aria-describedby"?: string;

  /**
   * Indicates that the element is busy (e.g., loading).
   * Web: `aria-busy`. Mobile: `accessibilityState={{ busy: true }}`.
   */
  "aria-busy"?: boolean;

  /**
   * Indicates that the element is expanded (for collapsible containers).
   * Web: `aria-expanded`. Mobile: `accessibilityState={{ expanded: true }}`.
   */
  "aria-expanded"?: boolean;
}

/**
 * Error state shared between Input and other form controls.
 */
export interface ErrorState {
  /** Error message. When set, component renders in error visual state. */
  error?: string;
}

/**
 * Loading state shared across components.
 */
export interface LoadingState {
  /** Whether the component is in a loading/processing state. */
  loading?: boolean;
}

/**
 * Disabled state shared across interactive components.
 */
export interface DisabledState {
  /** Whether the component is disabled and non-interactive. */
  disabled?: boolean;
}

/**
 * Common size scale used by Button, Badge, Input.
 */
export type ComponentSize = "sm" | "md" | "lg";

/**
 * Base DOM / RN element props that each component extends.
 * Web uses `className` + `style`, Mobile uses `style` only.
 */
export interface BaseStylingProps {
  /** CSS class name(s). Web only — ignored on mobile. @platform web */
  className?: string;
  /** Inline style object. Supported on both platforms. */
  style?: Record<string, unknown>;
  /** Unique identifier for the element. Maps to `id` on web, `nativeID` on mobile. */
  id?: string;
}
