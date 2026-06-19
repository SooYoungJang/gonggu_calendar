import { forwardRef, type ReactNode, type HTMLAttributes, useId } from "react";
import { cn } from "../utils/cn";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Image source */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Fallback text (initials) */
  fallback?: string;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Shape */
  shape?: "circle" | "square" | "rounded";
  /** Status indicator */
  status?: "online" | "offline" | "busy" | "away";
  /** Status position */
  statusPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const sizeStyles = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-24 h-24 text-xl",
};

const shapeStyles = {
  circle: "rounded-full",
  square: "rounded-none",
  rounded: "rounded-lg",
};

const statusSizes = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-3.5 h-3.5",
  "2xl": "w-4 h-4",
};

const statusColors = {
  online: "bg-success-500",
  offline: "bg-neutral-400",
  busy: "bg-error-500",
  away: "bg-warning-500",
};

const statusPositions = {
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      fallback,
      size = "md",
      shape = "circle",
      status,
      statusPosition = "bottom-right",
      className,
      ...props
    },
    ref
  ) => {
    const hasImage = !!src;
    const [imageError, setImageError] = React.useState(false);

    const displayText = fallback || (alt ? getInitials(alt) : "?");

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden bg-bg-tertiary text-text-secondary font-medium",
          sizeStyles[size],
          shapeStyles[shape],
          className
        )}
        {...props}
      >
        {hasImage && !imageError ? (
          <img
            src={src}
            alt={alt || ""}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span aria-hidden={!!alt}>{displayText}</span>
        )}
        {status && (
          <span
            className={cn(
              "absolute rounded-full border-2 border-background-primary",
              statusColors[status],
              statusSizes[size],
              statusPositions[statusPosition]
            )}
            aria-label={`상태: ${status === "online" ? "온라인" : status === "offline" ? "오프라인" : status === "busy" ? "바쁨" : "자리 비움"}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

/**
 * AvatarGroup - Stacked avatars with count overflow
 */
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar sources */
  sources: Array<{ src?: string; alt?: string; fallback?: string }>;
  /** Maximum avatars to show */
  max?: number;
  /** Size */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Shape */
  shape?: "circle" | "square" | "rounded";
  /** Overlap amount */
  overlap?: "none" | "sm" | "md" | "lg";
}

const overlapStyles = {
  none: "space-x-1",
  sm: "-space-x-1",
  md: "-space-x-2",
  lg: "-space-x-3",
};

export function AvatarGroup({
  sources,
  max = 5,
  size = "md",
  shape = "circle",
  overlap = "md",
  className,
  ...props
}: AvatarGroupProps) {
  const visibleSources = sources.slice(0, max);
  const remainingCount = sources.length - max;

  return (
    <div className={cn("flex items-center", overlapStyles[overlap], className)} {...props}>
      {visibleSources.map((source, index) => (
        <Avatar
          key={index}
          src={source.src}
          alt={source.alt}
          fallback={source.fallback}
          size={size}
          shape={shape}
          className={cn("ring-2 ring-background-primary", index === 0 && "z-10")}
        />
      ))}
      {remainingCount > 0 && (
        <div className={cn("flex items-center justify-center bg-bg-tertiary text-text-secondary font-medium", sizeStyles[size], shapeStyles[shape])}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}