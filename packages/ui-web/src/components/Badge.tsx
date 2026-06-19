import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

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
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size */
  size?: BadgeSize;
  /** Removable badge with onClose handler */
  removable?: boolean;
  /** Close handler for removable badges */
  onClose?: () => void;
  /** Icon to show before text */
  icon?: ReactNode;
  /** Children content (text) */
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
  success: "bg-success-50 text-success-600 border border-success-100 dark:bg-success-950 dark:text-success-400 dark:border-success-900",
  warning: "bg-warning-50 text-warning-600 border border-warning-100 dark:bg-warning-950 dark:text-warning-400 dark:border-warning-900",
  error: "bg-error-50 text-error-600 border border-error-100 dark:bg-error-950 dark:text-error-400 dark:border-error-900",
  info: "bg-primary-50 text-primary-600 border border-primary-100 dark:bg-primary-950 dark:text-primary-400 dark:border-primary-900",

  // Status-specific variants (semantic)
  pending: "bg-status-pending-bg text-status-pending-text border border-status-pending-border",
  approved: "bg-status-approved-bg text-status-approved-text border border-status-approved-border",
  rejected: "bg-status-rejected-bg text-status-rejected-text border border-status-rejected-border",
  review: "bg-status-review-bg text-status-review-text border border-status-review-border",
  duplicate: "bg-status-duplicate-bg text-status-duplicate-text border border-status-duplicate-border",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-sm gap-1.5",
  lg: "px-3 py-1.5 text-base gap-2",
};

const iconSizeStyles: Record<BadgeSize, string> = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
};

export function Badge({
  variant = "default",
  size = "md",
  removable = false,
  onClose,
  icon,
  children,
  className,
  ...props
}: BadgeProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (removable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClose?.();
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors duration-150",
        variantStyles[variant],
        sizeStyles[size],
        removable && "pr-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100",
        className
      )}
      {...props}
      onKeyDown={handleKeyDown}
      role={removable ? "button" : undefined}
      tabIndex={removable ? 0 : undefined}
      aria-label={removable ? `${children}, 제거` : undefined}
    >
      {icon && <span className={cn("flex-shrink-0", iconSizeStyles[size])} aria-hidden="true">{icon}</span>}
      <span className="truncate">{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          className={cn(
            "ml-1 flex items-center justify-center rounded-full transition-colors",
            "hover:bg-black/10 dark:hover:bg-white/10",
            size === "sm" && "p-0.5",
            size === "md" && "p-1",
            size === "lg" && "p-1.5"
          )}
          aria-label="제거"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
}

/**
 * StatusBadge - Specialized badge for submission statuses
 */
export type StatusType = "PENDING" | "APPROVED" | "REJECTED" | "REVIEW_REQUIRED" | "DUPLICATE";

export interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant; icon?: ReactNode }> = {
  PENDING: { label: "대기 중", variant: "pending" },
  APPROVED: { label: "승인됨", variant: "approved" },
  REJECTED: { label: "반려됨", variant: "rejected" },
  REVIEW_REQUIRED: { label: "검수 필요", variant: "review" },
  DUPLICATE: { label: "중복", variant: "duplicate" },
};

const statusIcons: Record<StatusType, ReactNode> = {
  PENDING: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  APPROVED: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  REJECTED: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  REVIEW_REQUIRED: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  DUPLICATE: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="2" />
      <rect x="13" y="13" width="9" height="9" rx="2" />
    </svg>
  ),
};

export function StatusBadge({ status, size = "md", showIcon = false, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const icon = showIcon ? statusIcons[status] : undefined;

  return <Badge variant={config.variant} size={size} icon={icon} className={className}>{config.label}</Badge>;
}

/**
 * DotBadge - Small colored dot indicator (for inline status)
 */
export interface DotBadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}

const dotSizeStyles = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-3 h-3",
};

const dotVariantStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-400",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
  info: "bg-primary-500",
  pending: "bg-status-pending-text",
  approved: "bg-status-approved-text",
  rejected: "bg-status-rejected-text",
  review: "bg-status-review-text",
  duplicate: "bg-status-duplicate-text",
};

export function DotBadge({ variant = "default", size = "md", className, children }: DotBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("rounded-full flex-shrink-0", dotVariantStyles[variant], dotSizeStyles[size])} />
      {children}
    </span>
  );
}