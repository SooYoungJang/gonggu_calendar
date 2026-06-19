/**
 * @gonggu/shared — Button component contract
 *
 * Shared TypeScript interface for Button across web + mobile.
 *
 * ── Platform rendering notes ──────────────────────────────────
 * Web  (`packages/ui-web`): Renders as `<button>` element.
 *   Implements all 8 interaction states using CSS pseudo-classes +
 *   Tailwind variant classes. Spinner uses inline SVG.
 *   Extends `ButtonHTMLAttributes<HTMLButtonElement>` for native form support.
 *
 * Mobile  (`apps/mobile`): Renders as `<Pressable>` + `<Text>`.
 *   States handled via `Pressable`'s `{pressed}` render prop.
 *   Currently does NOT implement loading, ghost/destructive variants,
 *   or leftIcon/rightIcon — these are migrations targets.
 *
 * ── State variants ────────────────────────────────────────────
 * | State    | Web implementation           | Mobile implementation         |
 * |----------|------------------------------|-------------------------------|
 * | default  | variant + size Tailwind      | variant + size StyleSheet     |
 * | hover    | `:hover` pseudo-class        | (not yet supported)           |
 * | active   | `:active` pseudo-class       | Pressable `pressed` render    |
 * | focus    | `:focus-visible` ring 3px    | (not yet supported)           |
 * | disabled | `[disabled]` attr            | `disabled` prop on Pressable  |
 * | loading  | inline spinner + disable     | (not yet supported)           |
 * | error    | (handled by parent form)     | (handled by parent form)      |
 * | success  | (handled by parent form)     | (handled by parent form)      |
 *
 * ── Accessibility ─────────────────────────────────────────────
 * Both platforms must set:
 * - `aria-label` / `accessibilityLabel` on icon-only buttons
 * - `aria-busy` / `accessibilityState={{ busy: true }}` during loading
 * - `aria-disabled` / `accessibilityState={{ disabled: true }}` when disabled
 * - `role="button"` / `accessibilityRole="button"` (implicit on web `<button>`)
 */

import type { ComponentSize, SharedAccessibilityProps } from "./shared-types";

/**
 * Visual style variants for Button.
 * Covers all variants used across web + mobile platforms.
 *
 * @platform web — all 5 variants implemented
 * @platform mobile — currently supports `primary`, `secondary`, `accent`.
 *   `ghost`, `destructive`, `outline` are planned.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "outline"
  /** @platform mobile only — Instagram pink accent */
  | "accent";

/**
 * Shared props contract for Button across web + mobile.
 *
 * Both platforms must implement:
 * - variant, size, disabled, loading, onPress, children
 * - Full keyboard accessibility (Enter/Space to activate)
 * - Focus-visible indicator (web: ring, mobile: focus ring via accessibility)
 *
 * Platform-specific extensions:
 * - Web: extends native `<button>` attributes (form, type, autoFocus, etc.)
 * - Mobile: extends `PressableProps` (hitSlop, delayLongPress, etc.)
 */
export interface ButtonProps extends SharedAccessibilityProps {
  // ── Variants & sizing ───────────────────────────────────────

  /** Visual style variant. @default "primary" */
  variant?: ButtonVariant;

  /** Size preset. @default "md" */
  size?: ComponentSize;

  // ── State flags ─────────────────────────────────────────────

  /** When true, shows a loading spinner and disables interaction. */
  loading?: boolean;

  /** When true, prevents interaction and reduces opacity. */
  disabled?: boolean;

  /** When true, stretches the button to fill its container width. */
  fullWidth?: boolean;

  // ── Content ─────────────────────────────────────────────────
  /** Button label text or element children. */
  children: string;

  /** Icon displayed before the label. @platform web */
  leftIcon?: React.ReactNode;

  /** Icon displayed after the label. @platform web */
  rightIcon?: React.ReactNode;

  // ── Events ──────────────────────────────────────────────────

  /** Press/click handler. */
  onPress: () => void;

  // ── Styling ─────────────────────────────────────────────────

  /** Additional CSS class. Web only — mobile uses `style`. @platform web */
  className?: string;

  /** Additional style overrides. */
  style?: Record<string, unknown>;
}

/**
 * Platform-specific rendering notes for implementors.
 */
export const ButtonPlatformNotes = {
  web: {
    element: "<button>",
    states: {
      hover: ":hover pseudo-class",
      active: ":active pseudo-class",
      focus: ":focus-visible with 3px ring",
      disabled: "[disabled] attribute",
      loading: "inline SVG spinner + disabled attr",
    },
    a11y: {
      role: "implicit via <button>",
      busy: "aria-busy",
      disabled: "aria-disabled",
    },
    migration: "No migration needed — fully implemented.",
  },
  mobile: {
    element: "<Pressable> + <Text>",
    states: {
      hover: "not yet supported",
      active: "Pressable {pressed} render prop",
      focus: "not yet supported",
      disabled: "disabled prop on Pressable",
      loading: "not yet supported — planned for v2",
    },
    a11y: {
      role: "accessibilityRole='button'",
      busy: "accessibilityState={{ busy: true }}",
      disabled: "accessibilityState={{ disabled: true }}",
    },
    migration: [
      "Add ghost, destructive, outline, accent variants to AppButton",
      "Add loading state with ActivityIndicator spinner",
      "Add leftIcon/rightIcon support",
      "Add focus-visible handling via accessibility (RN 0.76+)",
    ],
  },
} as const;
