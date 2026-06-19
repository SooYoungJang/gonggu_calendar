/**
 * @gonggu/shared — Card / InstagramCard component contract
 *
 * Shared TypeScript interface for Card across web + mobile.
 *
 * ── Platform rendering notes ──────────────────────────────────
 * Web  (`packages/ui-web`): Renders as `<div>`. Supports 4 visual variants
 *   (default, outlined, elevated, filled), 4 padding options, hover effects,
 *   and sub-components (CardHeader, CardTitle, CardContent, CardFooter).
 *   Also includes SubmissionCard for admin review.
 *
 * Mobile  (`apps/mobile`): Renders as `<View>` (or `<Pressable>` when
 *   onPress is provided). Instagram-style with rounded corners, shadow,
 *   and border. Simpler than web — no variant/padding sub-component API.
 *
 * ── State variants ────────────────────────────────────────────
 * | State    | Web                         | Mobile                     |
 * |----------|-----------------------------|----------------------------|
 * | default  | bg + border per variant     | bg-white + border + shadow |
 * | hover    | `.card-hover` class (CSS)   | (not relevant on touch)    |
 * | active   | (via parent interactions)   | Pressable scale(0.995)     |
 * | expanded | SubmissionCard accordion    | (not yet supported)        |
 *
 * ── Accessibility ─────────────────────────────────────────────
 * - Interactive cards must have `role="button"` / `accessibilityRole="button"`
 * - Expanded state must set `aria-expanded` / `accessibilityState.expanded`
 * - Card groups should be wrapped in a `<section>` with `aria-label`
 */

import type { SharedAccessibilityProps } from "./shared-types";

/**
 * Card visual variants.
 * @platform web — all 4 implemented
 * @platform mobile — only "default" (outlined border + shadow)
 */
export type CardVariant = "default" | "outlined" | "elevated" | "filled";

/**
 * Card padding options.
 * @platform web — all 4 implemented
 * @platform mobile — uses `padding` prop from contentStyle
 */
export type CardPadding = "none" | "sm" | "md" | "lg";

/**
 * Shared props contract for Card across web + mobile.
 *
 * Web supports the full Card + sub-components API.
 * Mobile renders a simpler card container (InstagramCard).
 * Both support pressable/interactive cards when onPress is set.
 */
export interface CardProps extends SharedAccessibilityProps {
  // ── Visual style ────────────────────────────────────────────

  /** Visual variant. @default "default" @platform web */
  variant?: CardVariant;

  /** Inner padding. @default "md" @platform web */
  padding?: CardPadding;

  /** Enable hover effect (lift + shadow change). @platform web */
  hoverable?: boolean;

  // ── Interactivity ───────────────────────────────────────────
  /** Press handler — makes the card interactive. */
  onPress?: () => void;

  // ── Content ─────────────────────────────────────────────────
  /** Card content. */
  children: React.ReactNode;

  // ── Styling ─────────────────────────────────────────────────
  /** CSS class. @platform web */
  className?: string;
  /** Inline style overrides. */
  style?: Record<string, unknown>;
  /** Inner content style. @platform mobile */
  contentStyle?: Record<string, unknown>;
}

/**
 * Card header sub-component props.
 * @platform web
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  /** Action element (e.g., button, dropdown) placed on the right. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Card title sub-component props.
 * @platform web
 */
export interface CardTitleProps {
  children: React.ReactNode;
  /** Optional subtitle text below the title. */
  subtitle?: string;
  className?: string;
}

/**
 * Card content sub-component props.
 * @platform web
 */
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card footer sub-component props.
 * @platform web
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Submission status type — shared with submissions schema.
 */
type SubmissionStatus = import("../schemas/submission").SubmissionStatus;

/**
 * SubmissionCard — specialized card for admin submission review.
 * Used on both web admin page and (future) mobile admin screen.
 */
export interface SubmissionCardProps {
  /** Submission data object. */
  submission: import("../schemas/submission").Submission;
  /** Whether the detail/accordion area is expanded. */
  isExpanded?: boolean;
  /** Toggle expanded state. */
  onToggle?: () => void;
  /** Approve the submission (creates GroupBuy). */
  onApprove?: (id: string) => void;
  /** Reject the submission with optional reason. */
  onReject?: (id: string, reason?: string) => void;
  /** Save review form edits. */
  onSave?: (id: string, data: Record<string, unknown>) => void;
  /** Open/view submission detail in a modal or separate page. */
  onView?: (id: string) => void;
  /** Current review form values. */
  reviewForm?: Record<string, unknown>;
  /** Review form field change handler. */
  onFormChange?: (field: string, value: string) => void;
  /** Whether the approve/reject action is in progress. */
  moderating?: boolean;
  /** Whether the save action is in progress. */
  updating?: boolean;
  className?: string;
}

/**
 * Platform-specific rendering notes.
 */
export const CardPlatformNotes = {
  web: {
    element: "<div> with CardHeader/CardTitle/CardContent/CardFooter sub-components",
    variants: {
      default: "bg-white + border",
      outlined: "bg-white + border-2",
      elevated: "bg-white + shadow-card",
      filled: "bg-gray-50",
    },
    padding: { sm: "p-3", md: "p-4", lg: "p-6" },
    a11y: "role='button' + aria-expanded for interactive cards",
    migration: "No migration needed — fully implemented.",
  },
  mobile: {
    element: "<View> or <Pressable> (InstagramCard)",
    variants: "default only (white bg + border + shadow)",
    padding: "fixed at 16px (spacing.lg) — not configurable",
    a11y: "accessibilityRole='button' for pressable cards",
    migration: [
      "Add variant support (outlined, elevated) to InstagramCard",
      "Add padding prop support",
      "Add SubmissionCard for mobile admin screen",
      "Add aria-expanded for expandable cards",
    ],
  },
} as const;
