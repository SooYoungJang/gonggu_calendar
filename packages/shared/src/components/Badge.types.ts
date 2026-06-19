/**
 * @gonggu/shared — Badge / StatusBadge component contract
 *
 * Shared TypeScript interface for Badge across web + mobile.
 *
 * ── Platform rendering notes ──────────────────────────────────
 * Web  (`packages/ui-web`): Rendered as `<span>` with Badge (10 variants)
 *   and StatusBadge (5 submission-specific statuses). Includes DotBadge
 *   for inline indicators. Fully implemented with removable, icon, sizes.
 *
 * Mobile  (`apps/mobile`): NOT YET IMPLEMENTED. Current codebase uses
 *   inline styled `<Text>` for status display in InstagramCard and
 *   AlertCard. These must be migrated to the shared Badge component.
 *
 * ── State variants ────────────────────────────────────────────
 * Badge is a static (non-interactive) display element by default.
 * Interactive states apply only when `removable` is true:
 *
 * | State    | Web                           | Mobile                       |
 * |----------|-------------------------------|------------------------------|
 * | default  | bg + text per variant          | (not yet implemented)        |
 * | hover    | (n/a — static unless removable) | (not yet implemented)        |
 * | focus    | focus-visible ring (removable)  | (not yet implemented)        |
 * | active   | press feedback (close button)   | (not yet implemented)        |
 * | removed  | removed from DOM                | (not yet implemented)        |
 *
 * ── Accessibility ─────────────────────────────────────────────
 * - Static badges: `<span>` with no ARIA role needed
 * - Removable badges: `role="button"` + `aria-label="{label}, 제거"` (web)
 * - StatusBadge: should announce status changes via `aria-live="polite"`
 *
 * ── Status values (from schema) ───────────────────────────────
 * These mirror the SubmissionStatus enum from packages/shared/schemas:
 *   PENDING | APPROVED | REJECTED | REVIEW_REQUIRED | DUPLICATE
 */

import type { ComponentSize, SharedAccessibilityProps } from "./shared-types";

/**
 * Badge visual variants.
 * Covers both generic semantic variants and submission-status-specific variants.
 *
 * @platform web — all 10 implemented
 * @platform mobile — none implemented yet
 */
export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "approved"
  | "rejected"
  | "review"
  | "duplicate";

/**
 * Submission status badge type.
 * Mirrors SubmissionStatus from shared schemas.
 */
export type StatusType = "PENDING" | "APPROVED" | "REJECTED" | "REVIEW_REQUIRED" | "DUPLICATE";

/**
 * Shared props contract for Badge across web + mobile.
 *
 * Badge is a static display element.
 * When `removable` is true, it becomes an interactive element
 * with a close button and keyboard accessibility.
 */
export interface BadgeProps extends SharedAccessibilityProps {
  /** Visual variant. @default "default" */
  variant?: BadgeVariant;

  /** Size preset. @default "md" */
  size?: ComponentSize;

  /** Label text content. */
  children: string;

  /** Icon shown before the text. @platform web */
  icon?: React.ReactNode;

  /** When true, shows a close button and makes badge removable. */
  removable?: boolean;

  /** Close handler for removable badges. */
  onClose?: () => void;

  /** CSS class. @platform web */
  className?: string;

  /** Inline style overrides. */
  style?: Record<string, unknown>;
}

/**
 * StatusBadge props — specialized badge for submission status display.
 * Maps StatusType to BadgeVariant and provides localized labels.
 */
export interface StatusBadgeProps {
  /** Submission status value. */
  status: StatusType;
  /** Size preset. @default "md" */
  size?: "sm" | "md";
  /** When true, shows a status-specific icon alongside the label. @platform web */
  showIcon?: boolean;
  /** CSS class. @platform web */
  className?: string;
}

/**
 * Status label map (Korean). Used by both platforms for display.
 */
export const STATUS_LABELS: Record<StatusType, string> = {
  PENDING: "대기 중",
  APPROVED: "승인됨",
  REJECTED: "반려됨",
  REVIEW_REQUIRED: "검수 필요",
  DUPLICATE: "중복",
} as const;

/**
 * Variant mapping from StatusType to BadgeVariant.
 */
export const STATUS_VARIANT_MAP: Record<StatusType, BadgeVariant> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REVIEW_REQUIRED: "review",
  DUPLICATE: "duplicate",
} as const;

/**
 * DotBadge — small colored dot indicator for inline status display.
 */
export interface DotBadgeProps {
  /** Visual variant for the dot color. */
  variant?: BadgeVariant;
  /** Dot size. @default "md" */
  size?: ComponentSize;
  /** Optional label text beside the dot. */
  children?: string;
  className?: string;
}

/**
 * Platform-specific rendering notes.
 */
export const BadgePlatformNotes = {
  web: {
    element: "<span> with Tailwind classes",
    variants: "10 variants — 5 generic + 5 status-specific",
    a11y: {
      static: "no role needed (decorative)",
      removable: "role='button' + aria-label + keyboard Enter/Space",
    },
    migration: "No migration needed — fully implemented.",
  },
  mobile: {
    element: "NOT YET IMPLEMENTED — use inline <Text> for now",
    variants: "none — must build Badge and StatusBadge from scratch",
    a11y: {
      static: "no accessibilityRole needed",
      removable: "accessibilityRole='button' + accessibilityLabel",
    },
    migration: [
      "Create Badge component using <View> + <Text> with StyleSheet",
      "Implement all 10 variants as StyleSheet records",
      "Create StatusBadge wrapper with STATUS_LABELS mapping",
      "Create DotBadge component",
      "Add removable badge support with close button",
      "Replace inline status <Text> in InstagramCard with StatusBadge",
    ],
  },
} as const;
