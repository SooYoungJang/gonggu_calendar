/**
 * @gonggu/shared — Input / FormInput component contract
 *
 * Shared TypeScript interface for text input across web + mobile.
 *
 * ── Platform rendering notes ──────────────────────────────────
 * Web  (`packages/ui-web`): Renders as `<input>` / `<textarea>` element.
 *   Rich implementation with label, hint, error, character count,
 *   focus ring, auto-resize textarea. Uses `useId()` for a11y linking.
 *
 * Mobile  (`apps/mobile`): Renders as `<TextInput>` with a `<Text>` label.
 *   Currently minimal — missing hint, error, character count,
 *   and advanced a11y wiring. These are migration targets.
 *
 * ── State variants ────────────────────────────────────────────
 * | State    | Web implementation             | Mobile implementation     |
 * |----------|--------------------------------|---------------------------|
 * | default  | base border + bg              | default TextInput style   |
 * | focus    | `:focus` ring primary-100 3px  | (not yet supported)       |
 * | error    | red border + red ring + error  | (not yet supported)       |
 * | disabled | grey bg + `[disabled]` attr   | (not yet supported fully) |
 * | readOnly | grey bg + `[readonly]` attr    | (not yet supported)       |
 * | loading  | (n/a — parent form handles)    | (n/a — parent handles)    |
 * | success  | (n/a — parent form handles)    | (n/a — parent handles)    |
 *
 * ── Accessibility ─────────────────────────────────────────────
 * Both platforms must wire:
 * - `label` → `htmlFor`/`id` (web) or `accessibilityLabel` (mobile)
 * - `hint` → `aria-describedby` (web) or `accessibilityHint` (mobile)
 * - `error` → `aria-invalid` + `aria-describedby` (web) or `accessibilityInvalid` (mobile)
 * - `required` → `aria-required` (web) or `accessibilityRequired` (mobile)
 */

import type { ComponentSize, SharedAccessibilityProps } from "./shared-types";

/**
 * Input types supported across both platforms.
 * Mobile uses multiline prop for textarea behavior.
 */
export type InputType =
  | "text"
  | "email"
  | "password"
  | "url"
  | "tel"
  | "number"
  | "date"
  | "datetime-local"
  | "search";

/**
 * Shared props contract for Input / FormInput across web + mobile.
 *
 * Both platforms must implement:
 * - label, value, onChange, placeholder, required
 * - Keyboard handling (Tab/Enter on web, ReturnKeyType on mobile)
 * - Accessible error and hint display
 *
 * Web extends this with: `type`, `maxLength`, `autoResize`, `rows` (textarea).
 * Mobile extends this via `TextInputProps` (keyboardType, returnKeyType, etc.).
 */
export interface InputProps extends SharedAccessibilityProps {
  // ── Input type (web only; mobile uses multiline bool) ───────
  /** Input type. @platform web — mobile uses `keyboardType`. @default "text" */
  type?: InputType;

  // ── Label ───────────────────────────────────────────────────
  /** Visible label text displayed above the input. */
  label: string;

  // ── Value ───────────────────────────────────────────────────
  /** Current value (controlled). */
  value: string;

  /** Change handler. Receives the new string value. */
  onChange: (value: string) => void;

  /** Placeholder text shown when empty. */
  placeholder?: string;

  // ── State flags ─────────────────────────────────────────────

  /** When true, shows an error state with red border and error message. */
  error?: string;

  /** Helper text shown below the input (hidden when error is set). */
  hint?: string;

  /** When true, marks the label with * and sets aria-required. */
  required?: boolean;

  /** When true, disables interaction. */
  disabled?: boolean;

  /** When true, prevents editing but allows focus/selection. */
  readOnly?: boolean;

  /** Maximum character length. Enforced on value change. */
  maxLength?: number;

  /** When true, shows a character counter (e.g., "42/100"). */
  showCount?: boolean;

  // ── Sizing ──────────────────────────────────────────────────
  /** Size preset. @default "md" */
  size?: ComponentSize;

  // ── Textarea-specific (web) ─────────────────────────────────
  /** Number of visible text rows. @platform web — mobile uses multiline: true. @default 3 */
  rows?: number;

  /** When true, auto-resizes height to fit content. @platform web */
  autoResize?: boolean;

  // ── Styling ─────────────────────────────────────────────────
  /** Additional CSS class. Web only. @platform web */
  className?: string;

  /** Inline style overrides. */
  style?: Record<string, unknown>;

  /** Input name attribute. @platform web */
  name?: string;
}

/**
 * Shared props for Textarea variant.
 * Web renders <textarea>, mobile renders <TextInput multiline />.
 */
export interface TextareaProps extends Omit<InputProps, "type"> {
  /** Always multiline. @platform web always <textarea>; mobile uses multiline. */
  type?: "textarea";
  /** Number of visible rows. @default 3 */
  rows?: number;
  /** Auto-resize height. @platform web */
  autoResize?: boolean;
}

/**
 * Reusable form field wrapper props.
 * Used when the label/hint/error is rendered by a parent wrapper
 * rather than the input component itself.
 */
export interface FormFieldProps {
  /** Label text. */
  label: string;
  /** Helper text. */
  hint?: string;
  /** Error message (replaces hint when set). */
  error?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Child input element. */
  children: React.ReactElement;
  /** CSS class. @platform web */
  className?: string;
}

/**
 * Platform-specific rendering notes for implementors.
 */
export const InputPlatformNotes = {
  web: {
    element: "<input> / <textarea>",
    a11y: {
      label: "htmlFor + id linking",
      hint: "aria-describedby to hint element",
      error: "aria-invalid + aria-describedby to error element",
      required: "aria-required",
    },
    states: {
      focus: ":focus-visible ring 3px primary-100",
      error: "border-red-500 + ring red-50",
      disabled: "bg-gray-50 + cursor-not-allowed",
    },
    migration: "No migration needed — fully implemented.",
  },
  mobile: {
    element: "<TextInput> + <Text> label",
    a11y: {
      label: "accessibilityLabel — or separate Text element above",
      hint: "accessibilityHint (not yet implemented)",
      error: "no aria-invalid equivalent (planned)",
      required: "no accessibilityRequired (planned)",
    },
    states: {
      focus: "not yet supported",
      error: "not yet supported — planned: red border on error",
      disabled: "not yet supported (editable={false} exists)",
    },
    migration: [
      "Add error state with red border + error text below input",
      "Add hint/helper text below input",
      "Add maxLength enforcement with character counter",
      "Add aria-invalid / accessibilityState wiring for screen readers",
      "Add focus-visible styling",
    ],
  },
} as const;
