import {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type MouseEvent,
  Fragment,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalPlacement = "center" | "bottom";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  placement?: ModalPlacement;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  className?: string;
  preventScroll?: boolean;
  id?: string;
  description?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      children,
      size = "md",
      placement = "center",
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      footer,
      className,
      preventScroll = true,
      id,
      description,
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const focusableElementsRef = useRef<HTMLElement[]>([]);

    const trapFocus = useCallback((e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusableElementsRef.current.length === 0) return;

      const firstElement = focusableElementsRef.current[0];
      const lastElement = focusableElementsRef.current[focusableElementsRef.current.length - 1];
      if (!firstElement || !lastElement) return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }, []);

    const updateFocusableElements = useCallback(() => {
      if (modalRef.current) {
        const focusableSelectors = [
          'button:not([disabled]):not([tabindex="-1"])',
          '[href]:not([disabled]):not([tabindex="-1"])',
          'input:not([disabled]):not([tabindex="-1"])',
          'select:not([disabled]):not([tabindex="-1"])',
          'textarea:not([disabled]):not([tabindex="-1"])',
          '[tabindex]:not([tabindex="-1"]):not([disabled])',
        ];
        const elements = modalRef.current.querySelectorAll(focusableSelectors.join(","));
        focusableElementsRef.current = Array.from(elements) as HTMLElement[];
      }
    }, []);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (!closeOnEscape || e.key !== "Escape") return;
        onClose();
      },
      [closeOnEscape, onClose]
    );

    const handleOverlayClick = useCallback(
      (e: MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    useEffect(() => {
      if (open) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        if (preventScroll) {
          document.body.style.overflow = "hidden";
        }
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keydown", trapFocus);
        setTimeout(() => {
          modalRef.current?.focus();
          updateFocusableElements();
        }, 0);
      } else {
        if (preventScroll) {
          document.body.style.overflow = "";
        }
        previousActiveElement.current?.focus();
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keydown", trapFocus);
        if (preventScroll) {
          document.body.style.overflow = "";
        }
      };
    }, [open, handleKeyDown, trapFocus, preventScroll, updateFocusableElements]);

    if (!open) return null;

    const modalContent = (
      <div
        className={cn(
          "fixed inset-0 z-[1200] flex items-center justify-center p-4",
          placement === "bottom" && "items-end"
        )}
        onClick={handleOverlayClick}
        role="presentation"
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          aria-hidden="true"
        />
        <div
          ref={modalRef}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-labelledby={id ? `${id}-title` : undefined}
          aria-describedby={description ? `${id}-description` : undefined}
          className={cn(
            "relative w-full bg-background-primary rounded-xl shadow-modal animate-modal-enter",
            sizeStyles[size],
            placement === "bottom" && "rounded-t-xl max-w-full",
            className
          )}
          tabIndex={-1}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 p-6 border-b border-border-primary">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id={id ? `${id}-title` : undefined}
                    className="text-lg font-semibold text-text-primary"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={id ? `${id}-description` : undefined}
                    className="mt-1 text-sm text-text-secondary"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                  aria-label="닫기"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className={cn("p-6", !title && !showCloseButton && "pt-6")}>{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border-primary">
              {footer}
            </div>
          )}
        </div>
      </div>
    );

    if (typeof window !== "undefined") {
      return createPortal(modalContent, document.body);
    }

    return null;
  }
);

Modal.displayName = "Modal";

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  confirmLoading?: boolean;
}

export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
  confirmLoading = false,
}: AlertDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={confirmLoading}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-bg-secondary border border-border-primary rounded-lg hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmLoading}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-lg focus-visible:outline-none focus-visible:ring-2",
              variant === "destructive"
                ? "bg-error-600 hover:bg-error-700 focus-visible:ring-error-100"
                : "bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-100"
            )}
          >
            {confirmLoading ? "처리 중..." : confirmText}
          </button>
        </>
      }
    >
      {description && <p className="text-text-secondary">{description}</p>}
    </Modal>
  );
}

export function useConfirmation() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: "default" | "destructive";
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const confirm = useCallback(
    (options: {
      title: string;
      description?: string;
      variant?: "default" | "destructive";
      confirmText?: string;
      cancelText?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setState({
        open: true,
        title: options.title,
        description: options.description,
        variant: options.variant || "default",
        confirmText: options.confirmText || "확인",
        cancelText: options.cancelText || "취소",
        onConfirm: options.onConfirm,
        onCancel: options.onCancel || (() => {}),
      });
    },
    []
  );

  const close = useCallback(() => {
    setState((prev) => (prev ? { ...prev, open: false } : null));
    if (state?.onCancel) {
      state.onCancel();
    }
  }, [state]);

  const handleConfirm = useCallback(() => {
    if (state?.onConfirm) {
      state.onConfirm();
    }
    setState(null);
  }, [state]);

  return {
    confirm,
    close,
    handleConfirm,
    state: state ? { ...state, onClose: close } : null,
  };
}