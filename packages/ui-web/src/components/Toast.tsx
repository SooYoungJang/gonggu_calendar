import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  createContext,
  useContext,
  type Context,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

export type ToastType = "success" | "error" | "warning" | "info" | "default";
export type ToastPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
}

export interface ToastOptions {
  /** Toast message */
  message: string;
  /** Toast type */
  type?: ToastType;
  /** Duration in ms (0 = persistent) */
  duration?: number;
  /** Action button */
  action?: ToastAction;
  /** Custom ID */
  id?: string;
  /** Dismissible by user */
  dismissible?: boolean;
  /** Icon override */
  icon?: ReactNode;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action: ToastAction;
  dismissible: boolean;
  icon: ReactNode;
  createdAt: number;
}

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 3000;

const typeStyles: Record<ToastType, string> = {
  success: "bg-success-50 border-success-200 text-success-800 dark:bg-success-950 dark:border-success-900 dark:text-success-300",
  error: "bg-error-50 border-error-200 text-error-800 dark:bg-error-950 dark:border-error-900 dark:text-error-300",
  warning: "bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-950 dark:border-warning-900 dark:text-warning-300",
  info: "bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-950 dark:border-primary-900 dark:text-primary-300",
  default: "bg-bg-secondary border-border-primary text-text-primary dark:bg-neutral-800 dark:border-neutral-700",
};

const typeIcons: Record<ToastType, ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  default: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const placementStyles: Record<ToastPlacement, string> = {
  "top-left": "top-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-4 right-4",
};

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  placement?: ToastPlacement;
  maxToasts?: number;
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  placement = "bottom-right",
  maxToasts = MAX_TOASTS,
  defaultDuration = DEFAULT_DURATION,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (options: ToastOptions): string => {
      const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: ToastItem = {
        id,
        message: options.message,
        type: (options.type || "default") as ToastType,
        duration: (options.duration ?? defaultDuration) as number,
        action: (options.action || { label: '', onClick: () => {} }) as ToastAction,
        dismissible: (options.dismissible ?? true) as boolean,
        icon: (options.icon ?? null) as ReactNode,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev].slice(0, maxToasts);
        return updated;
      });

      return id;
    },
    [defaultDuration, maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} placement={placement} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
  placement: ToastPlacement;
}

function ToastContainer({ toasts, onRemove, placement }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={cn(
        "fixed z-[1400] flex flex-col gap-2 p-2 pointer-events-none",
        placementStyles[placement]
      )}
      role="region"
      aria-label="알림"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

interface ToastItemProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(1);
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    if (toast.duration > 0) {
      const startTime = Date.now();
      const duration = toast.duration;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const p = Math.max(0, 1 - elapsed / duration);
        setProgress(p);
        if (p > 0) {
          progressRef.current = requestAnimationFrame(animate);
        } else {
          dismiss();
        }
      };
      progressRef.current = requestAnimationFrame(animate);

      return () => {
        if (progressRef.current) cancelAnimationFrame(progressRef.current);
      };
    }
  }, [toast.duration]);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  }, [onRemove, toast.id]);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.action?.onClick();
    dismiss();
  };

  const handleClick = () => {
    if (toast.dismissible) {
      dismiss();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dismiss();
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 w-full max-w-sm min-w-[280px] p-4 rounded-xl border shadow-toast pointer-events-auto animate-slide-up",
        exiting && "animate-slide-down animate-fade-out",
        typeStyles[toast.type]
      )}
      role="alert"
      aria-live="polite"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        "--progress": progress,
      } as React.CSSProperties}
    >
      <div className="flex-shrink-0">{toast.icon || typeIcons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.action && (
          <button
            type="button"
            onClick={handleActionClick}
            className="mt-2 text-sm font-medium underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-currentColor"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      {toast.dismissible && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="flex-shrink-0 p-1 rounded-lg text-current/60 hover:text-current hover:bg-current/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-currentColor"
          aria-label="닫기"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      {toast.duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 rounded-b-xl bg-current/20"
          style={{ width: `${progress * 100}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Convenience functions for common toast types
 */
export function createToastHelpers(context: ToastContextValue) {
  return {
    success: (message: string, options?: Omit<ToastOptions, "type" | "message">) =>
      context.addToast({ ...options, message, type: "success" }),
    error: (message: string, options?: Omit<ToastOptions, "type" | "message">) =>
      context.addToast({ ...options, message, type: "error" }),
    warning: (message: string, options?: Omit<ToastOptions, "type" | "message">) =>
      context.addToast({ ...options, message, type: "warning" }),
    info: (message: string, options?: Omit<ToastOptions, "type" | "message">) =>
      context.addToast({ ...options, message, type: "info" }),
    default: (message: string, options?: Omit<ToastOptions, "type" | "message">) =>
      context.addToast({ ...options, message, type: "default" }),
    dismiss: context.removeToast,
    clear: context.clearToasts,
  };
}

/**
 * Hook to get typed toast helpers
 */
export function useToasts() {
  const context = useToast();
  return createToastHelpers(context);
}