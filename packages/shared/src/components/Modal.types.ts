/**
 * @gonggu/shared — Modal component contract
 *
 * Shared TypeScript interface for Modal across web + mobile.
 *
 * ── Platform rendering notes ──────────────────────────────────
 * Web  (`packages/ui-web`): Renders using `createPortal` to `document.body`.
 *   HTML `<dialog>`-like with backdrop, focus trap, ESC close, scroll lock.
 *   Supports center + bottom placement. Includes AlertDialog and useConfirmation.
 *
 * Mobile  (`apps/mobile`): NOT YET IMPLEMENTED. Planned as a cross-platform
 *   bottom sheet / modal that uses React Native's `Modal` component or
 *   `@gorhom/bottom-sheet` for sheet-style modals.
 *
 * ── State variants ────────────────────────────────────────────
 * | State     | Web                         | Mobile                     |
 * |-----------|-----------------------------|----------------------------|
 * | closed    | not rendered (null)          | visible={false}            |
 * | open      | portal to body + backdrop    | visible={true} + overlay   |
 * | entering  | scale(0.95→1) + fade 200ms   | slide-up animation         |
 * | exiting   | scale(1→0.95) + fade 150ms   | slide-down animation       |
 * | focus     | focus trap inside modal      | auto-focus first element   |
 * | expanded  | (n/a — fixed size)           | sheet drag-expand          |
 *
 * ── Accessibility ─────────────────────────────────────────────
 * Both platforms must implement:
 * - `role="dialog"` / `accessibilityRole="dialog"`
 * - `aria-modal="true"` / `accessibilityViewIsModal={true}`
 * - `aria-labelledby` pointing to the title element
 * - Focus trap: tab cycles inside modal (web only — RN handles natively)
 * - ESC / accessibility back button to close
 * - Restore focus to trigger element on close
 * - Body scroll lock while modal is open
 */

import type { SharedAccessibilityProps } from "./shared-types";

/**
 * Modal width presets.
 * @platform web — all 5 implemented
 * @platform mobile — "full" for bottom sheet, "md" for center dialog
 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Modal placement.
 * @platform web — both implemented
 * @platform mobile — "bottom" via bottom sheet, "center" via RN Modal
 */
export type ModalPlacement = "center" | "bottom";

/**
 * Shared props contract for Modal across web + mobile.
 *
 * Both platforms must implement:
 * - Open/close with backdrop overlay
 * - Title + description + children content
 * - Footer action area
 * - Keyboard/gesture dismissal (ESC or swipe-down)
 * - Focus management and scroll lock
 * - Accessible dialog semantics
 */
export interface ModalProps extends SharedAccessibilityProps {
  /** Whether the modal is visible. */
  open: boolean;

  /** Close handler (ESC, backdrop click, close button). */
  onClose: () => void;

  /** Dialog title shown in the header. */
  title: string;

  /** Optional description text below the title. */
  description?: string;

  /** Modal body content. */
  children: React.ReactNode;

  /** Width preset. @default "md" */
  size?: ModalSize;

  /** Placement on screen. @default "center" */
  placement?: ModalPlacement;

  /** Show the X close button in the header. @default true */
  showCloseButton?: boolean;

  /** Close when clicking/tapping the backdrop overlay. @default true */
  closeOnOverlayClick?: boolean;

  /** Close on Escape key press. @platform web — mobile uses back button. @default true */
  closeOnEscape?: boolean;

  /** Footer content (typically action buttons). */
  footer?: React.ReactNode;

  /** Lock body scroll while modal is open. @default true */
  preventScroll?: boolean;

  /** CSS class. @platform web */
  className?: string;

  /** Unique identifier for aria-labelledby wiring. */
  id?: string;
}

/**
 * AlertDialog — confirmation dialog variant built on Modal.
 * Used for destructive confirmations, approvals, and important choices.
 */
export interface AlertDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Close/cancel handler. */
  onClose: () => void;
  /** Confirm action handler. */
  onConfirm: () => void;
  /** Dialog title. */
  title: string;
  /** Dialog description / body text. */
  description?: string;
  /** Confirm button label. @default "확인" */
  confirmText?: string;
  /** Cancel button label. @default "취소" */
  cancelText?: string;
  /** Visual variant. "destructive" uses red confirm button. @default "default" */
  variant?: "default" | "destructive";
  /** Show loading state on confirm button. */
  confirmLoading?: boolean;
}

/**
 * useConfirmation — imperative confirmation hook state type.
 * Alternative to rendering AlertDialog directly in JSX.
 */
export interface ConfirmationState {
  open: boolean;
  title: string;
  description?: string;
  variant: "default" | "destructive";
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Platform-specific rendering notes.
 */
export const ModalPlatformNotes = {
  web: {
    element: "createPortal → document.body",
    animation: {
      enter: "scale(0.95→1) + fade, 200ms ease-out",
      exit: "scale(1→0.95) + fade, 150ms ease-in",
    },
    focus: "focus trap via Tab key cycle + restore on close",
    a11y: "role='dialog' aria-modal='true' aria-labelledby focus-trap",
    migration: "No migration needed — fully implemented.",
  },
  mobile: {
    element: "NOT YET IMPLEMENTED — use RN Modal or @gorhom/bottom-sheet",
    animation: {
      enter: "planned: slide-up from bottom, 300ms",
      exit: "planned: slide-down, 200ms",
    },
    focus: "RN Modal handles natively on iOS/Android",
    a11y: "accessibilityViewIsModal + accessibilityRole='dialog' + focus auto-managed",
    migration: [
      "Create Modal component using React Native <Modal>",
      "Implement bottom sheet variant (with drag to close)",
      "Implement center dialog variant",
      "Add backdrop overlay with opacity animation",
      "Add AlertDialog variant",
      "Add useConfirmation hook equivalent",
      "Ensure accessibilityViewIsModal + focused element management",
    ],
  },
} as const;
