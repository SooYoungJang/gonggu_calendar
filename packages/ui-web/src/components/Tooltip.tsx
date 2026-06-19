import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  Children,
  cloneElement,
  type ReactNode,
  type ReactElement,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

export type TooltipPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export interface TooltipProps {
  /** Tooltip content */
  content: ReactNode;
  /** Trigger element */
  children: ReactNode;
  /** Placement */
  placement?: TooltipPlacement;
  /** Delay before showing (ms) */
  openDelay?: number;
  /** Delay before hiding (ms) */
  closeDelay?: number;
  /** Maximum width */
  maxWidth?: number | string;
  /** Open state (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Show arrow */
  arrow?: boolean;
  /** Offset from trigger */
  offset?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const placementMap: Record<TooltipPlacement, { origin: string; overlay: string }> = {
  top: { origin: "bottom", overlay: "top" },
  bottom: { origin: "top", overlay: "bottom" },
  left: { origin: "right", overlay: "left" },
  right: { origin: "left", overlay: "right" },
  "top-start": { origin: "bottom left", overlay: "top left" },
  "top-end": { origin: "bottom right", overlay: "top right" },
  "bottom-start": { origin: "top left", overlay: "bottom left" },
  "bottom-end": { origin: "top right", overlay: "bottom right" },
  "left-start": { origin: "right top", overlay: "left top" },
  "left-end": { origin: "right bottom", overlay: "left bottom" },
  "right-start": { origin: "left top", overlay: "right top" },
  "right-end": { origin: "left bottom", overlay: "right bottom" },
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      placement = "top",
      openDelay = 200,
      closeDelay = 100,
      maxWidth = 280,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      arrow = true,
      offset = 8,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const [openTimer, setOpenTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [closeTimer, setCloseTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const setOpen = useCallback(
      (newOpen: boolean) => {
        if (!isControlled) {
          setUncontrolledOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [isControlled, onOpenChange]
    );

    const handleMouseEnter = useCallback(() => {
      if (disabled) return;
      if (closeTimer) {
        clearTimeout(closeTimer);
        setCloseTimer(null);
      }
      if (!openTimer) {
        const timer = setTimeout(() => {
          setOpen(true);
          setOpenTimer(null);
        }, openDelay);
        setOpenTimer(timer);
      }
    }, [disabled, openDelay, openTimer, closeTimer, setOpen]);

    const handleMouseLeave = useCallback(() => {
      if (disabled) return;
      if (openTimer) {
        clearTimeout(openTimer);
        setOpenTimer(null);
      }
      if (!closeTimer) {
        const timer = setTimeout(() => {
          setOpen(false);
          setCloseTimer(null);
        }, closeDelay);
        setCloseTimer(timer);
      }
    }, [disabled, closeDelay, openTimer, closeTimer, setOpen]);

    const handleFocus = useCallback(() => {
      if (disabled) return;
      handleMouseEnter();
    }, [handleMouseEnter]);

    const handleBlur = useCallback(() => {
      handleMouseLeave();
    }, [handleMouseLeave]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          setOpen(false);
        }
      },
      [open, setOpen]
    );

    // Cleanup timers
    useEffect(() => {
      return () => {
        if (openTimer) clearTimeout(openTimer);
        if (closeTimer) clearTimeout(closeTimer);
      };
    }, [openTimer, closeTimer]);

    // Position tooltip
    const positionTooltip = useCallback(() => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      const placementConfig = placementMap[placement];

      switch (placementConfig.origin) {
        case "bottom":
          top = triggerRect.bottom + offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "top":
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "right":
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + offset;
          break;
        case "left":
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - offset;
          break;
        case "bottom left":
          top = triggerRect.bottom + offset;
          left = triggerRect.left;
          break;
        case "bottom right":
          top = triggerRect.bottom + offset;
          left = triggerRect.right - tooltipRect.width;
          break;
        case "top left":
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.left;
          break;
        case "top right":
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.right - tooltipRect.width;
          break;
        case "right top":
          top = triggerRect.top;
          left = triggerRect.right + offset;
          break;
        case "right bottom":
          top = triggerRect.bottom - tooltipRect.height;
          left = triggerRect.right + offset;
          break;
        case "left top":
          top = triggerRect.top;
          left = triggerRect.left - tooltipRect.width - offset;
          break;
        case "left bottom":
          top = triggerRect.bottom - tooltipRect.height;
          left = triggerRect.left - tooltipRect.width - offset;
          break;
      }

      // Prevent overflow
      if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }
      if (left < 8) {
        left = 8;
      }
      if (top + tooltipRect.height > viewportHeight - 8) {
        top = viewportHeight - tooltipRect.height - 8;
      }
      if (top < 8) {
        top = 8;
      }

      tooltipRef.current.style.top = `${top}px`;
      tooltipRef.current.style.left = `${left}px`;
    }, [placement, offset]);

    useEffect(() => {
      if (open) {
        positionTooltip();
        window.addEventListener("scroll", positionTooltip);
        window.addEventListener("resize", positionTooltip);
      }
      return () => {
        window.removeEventListener("scroll", positionTooltip);
        window.removeEventListener("resize", positionTooltip);
      };
    }, [open, positionTooltip]);

    // Wrap children in trigger
    const child = Children.only(children);
    const triggerProps = {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      "aria-describedby": open ? "tooltip-content" : undefined,
    };

    const triggerElement = cloneElement(child as ReactElement, triggerProps);

    if (!open) return triggerElement;

    const tooltipContent = createPortal(
      <div
        ref={tooltipRef}
        id="tooltip-content"
        role="tooltip"
        className={cn(
          "fixed z-[1500] px-3 py-2 text-sm text-white bg-neutral-900 rounded-lg shadow-toast animate-fade-in whitespace-normal break-words",
          `max-w-[${typeof maxWidth === "number" ? maxWidth + "px" : maxWidth}]`,
          arrow && "relative",
          className
        )}
        style={{ maxWidth: typeof maxWidth === "number" ? maxWidth : undefined } as React.CSSProperties}
      >
        {content}
        {arrow && (
          <div
            className={cn(
              "absolute w-2 h-2 bg-neutral-900 transform rotate-45",
              placement.startsWith("top") && "bottom-[-4px] left-1/2 -translate-x-1/2",
              placement.startsWith("bottom") && "top-[-4px] left-1/2 -translate-x-1/2",
              placement.startsWith("left") && "right-[-4px] top-1/2 -translate-y-1/2",
              placement.startsWith("right") && "left-[-4px] top-1/2 -translate-y-1/2"
            )}
            aria-hidden="true"
          />
        )}
      </div>,
      document.body
    );

    return (
      <>
        {triggerElement}
        {tooltipContent}
      </>
    );
  }
);

Tooltip.displayName = "Tooltip";

/**
 * Popover - Interactive tooltip with richer content
 */
export interface PopoverProps extends Omit<TooltipProps, "content"> {
  /** Popover content */
  children: ReactNode;
  /** Popover trigger content */
  trigger: ReactNode;
  /** Close on outside click */
  closeOnOutsideClick?: boolean;
}

export function Popover({
  trigger,
  children,
  placement = "bottom",
  openDelay = 100,
  closeDelay = 100,
  maxWidth = 320,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  arrow = true,
  offset = 8,
  disabled = false,
  closeOnOutsideClick = true,
  className,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [openTimer, setOpenTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [closeTimer, setCloseTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const handleTriggerClick = useCallback(() => {
    if (disabled) return;
    if (openTimer) {
      clearTimeout(openTimer);
      setOpenTimer(null);
    }
    setOpen(!open);
  }, [disabled, open, setOpen]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    if (closeTimer) {
      clearTimeout(closeTimer);
      setCloseTimer(null);
    }
    if (!openTimer) {
      const timer = setTimeout(() => {
        setOpen(true);
        setOpenTimer(null);
      }, openDelay);
      setOpenTimer(timer);
    }
  }, [disabled, openDelay, openTimer, closeTimer, setOpen]);

  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    if (openTimer) {
      clearTimeout(openTimer);
      setOpenTimer(null);
    }
    if (!closeTimer) {
      const timer = setTimeout(() => {
        setOpen(false);
        setCloseTimer(null);
      }, closeDelay);
      setCloseTimer(timer);
    }
  }, [disabled, closeDelay, openTimer, closeTimer, setOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        open &&
        closeOnOutsideClick &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, closeOnOutsideClick, setOpen]);

  useEffect(() => {
    return () => {
      if (openTimer) clearTimeout(openTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [openTimer, closeTimer]);

  const triggerElement = (
    <div
      ref={triggerRef}
      onClick={handleTriggerClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("inline-flex", className)}
    >
      {trigger}
    </div>
  );

  if (!open) return triggerElement;

  const popoverContent = createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="팝오버"
      className={cn(
        "fixed z-[1300] bg-background-primary border border-border-primary rounded-lg shadow-modal p-3 animate-slide-up",
        `max-w-[${typeof maxWidth === "number" ? maxWidth + "px" : maxWidth}]`,
        arrow && "relative",
        className
      )}
    >
      {children}
      {arrow && (
        <div
          className={cn(
            "absolute w-2 h-2 bg-background-primary border border-border-primary transform rotate-45",
            placement.startsWith("top") && "bottom-[-5px] left-1/2 -translate-x-1/2",
            placement.startsWith("bottom") && "top-[-5px] left-1/2 -translate-x-1/2",
            placement.startsWith("left") && "right-[-5px] top-1/2 -translate-y-1/2",
            placement.startsWith("right") && "left-[-5px] top-1/2 -translate-y-1/2"
          )}
          aria-hidden="true"
        />
      )}
    </div>,
    document.body
  );

  return (
    <>
      {triggerElement}
      {popoverContent}
    </>
  );
}