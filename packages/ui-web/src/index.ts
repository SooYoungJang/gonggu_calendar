/**
 * @gonggu/ui-web — Design System Components
 * Main entry point exporting all components, hooks, utils, and tokens
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { Button, PrimaryButton, SecondaryButton, GhostButton, DestructiveButton, OutlineButton } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";

export { Input, Textarea, FormField } from "./components/Input";
export type { InputProps, TextareaProps, FormFieldProps, InputSize, InputType } from "./components/Input";

export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  SubmissionCard,
} from "./components/Card";
export type { CardProps, CardHeaderProps, CardTitleProps, CardContentProps, CardFooterProps } from "./components/Card";
export type { SubmissionCardProps, Submission, SubmissionStatus, CardVariant, CardPadding } from "./components/Card";

export { Badge, StatusBadge, DotBadge } from "./components/Badge";
export type { BadgeProps, StatusBadgeProps, DotBadgeProps, BadgeVariant, BadgeSize, StatusType } from "./components/Badge";

export { Modal, AlertDialog, useConfirmation } from "./components/Modal";
export type { ModalProps, AlertDialogProps, ModalSize, ModalPlacement } from "./components/Modal";

export {
  ToastProvider,
  useToast,
  useToasts,
  createToastHelpers,
} from "./components/Toast";
export type {
  ToastOptions,
  ToastType,
  ToastPlacement,
  ToastAction,
  ToastItem,
} from "./components/Toast";

export { FilterChips, SegmentedControl } from "./components/FilterChips";
export type { FilterChipsProps, SegmentedControlProps, FilterOption } from "./components/FilterChips";

export { DataTable } from "./components/DataTable";
export type { DataTableProps, ColumnDef, RowAction } from "./components/DataTable";

export { Avatar, AvatarGroup } from "./components/Avatar";
export type { AvatarProps, AvatarGroupProps } from "./components/Avatar";

export { Dropdown, Select } from "./components/Dropdown";
export type { DropdownProps, SelectProps, DropdownItem } from "./components/Dropdown";

export { DatePicker } from "./components/DatePicker";
export type { DatePickerProps } from "./components/DatePicker";

export { Tooltip, Popover } from "./components/Tooltip";
export type { TooltipProps, PopoverProps, TooltipPlacement } from "./components/Tooltip";

// ============================================================================
// HOOKS
// ============================================================================

export * from "./hooks";

// ============================================================================
// UTILS
// ============================================================================

export { cn, cv, createVariants } from "./utils/cn";

// ============================================================================
// TOKENS
// ============================================================================

export * from "./tokens";

// ============================================================================
// STYLES
// ============================================================================

// CSS file is exported via package.json exports
// Import: import "@gonggu/ui-web/styles/globals.css"