import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
  description?: string;
}

export interface DropdownProps {
  /** Trigger content */
  trigger: ReactNode;
  /** Menu items */
  items: DropdownItem[];
  /** Selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Open state (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Open change handler */
  onOpenChange?: (open: boolean) => void;
  /** Menu placement */
  placement?: "bottom" | "top" | "left" | "right" | "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** Menu width */
  width?: "trigger" | "auto" | number | string;
  /** Maximum height */
  maxHeight?: number;
  /** Show search/filter */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Menu className */
  menuClassName?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Close on item click */
  closeOnSelect?: boolean;
}

const placementMap: Record<string, { origin: string; overlay: string }> = {
  bottom: { origin: "top", overlay: "bottom" },
  top: { origin: "bottom", overlay: "top" },
  left: { origin: "right", overlay: "left" },
  right: { origin: "left", overlay: "right" },
  "bottom-start": { origin: "top left", overlay: "bottom left" },
  "bottom-end": { origin: "top right", overlay: "bottom right" },
  "top-start": { origin: "bottom left", overlay: "top left" },
  "top-end": { origin: "bottom right", overlay: "top right" },
};

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      trigger,
      items,
      value,
      onChange,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      placement = "bottom",
      width = "trigger",
      maxHeight = 280,
      searchable = false,
      searchPlaceholder = "검색...",
      emptyMessage = "일치하는 항목이 없습니다.",
      className,
      menuClassName,
      disabled = false,
      closeOnSelect = true,
      ...props
    },
    ref
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<HTMLButtonElement[]>([]);

    const filteredItems = items.filter(
      (item) =>
        !item.divider &&
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
      setOpen(!open);
    }, [disabled, open, setOpen]);

    const handleItemClick = useCallback(
      (item: DropdownItem) => {
        if (item.disabled) return;
        onChange?.(item.value);
        if (closeOnSelect) {
          setOpen(false);
        }
      },
      [onChange, closeOnSelect, setOpen]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!open) return;

        const enabledItems = items.filter((item) => !item.divider && !item.disabled);
        const filteredEnabledItems = filteredItems.filter((item) => !item.disabled);

        switch (e.key) {
          case "Escape":
            e.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
            break;
          case "ArrowDown":
            e.preventDefault();
            if (searchable && e.target === document.activeElement) {
              setFocusedIndex(0);
              itemRefs.current[0]?.focus();
            } else {
              const nextIndex = Math.min(focusedIndex + 1, filteredEnabledItems.length - 1);
              setFocusedIndex(nextIndex);
              itemRefs.current[nextIndex]?.focus();
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            if (focusedIndex > 0) {
              const prevIndex = focusedIndex - 1;
              setFocusedIndex(prevIndex);
              itemRefs.current[prevIndex]?.focus();
            } else {
              setFocusedIndex(-1);
              triggerRef.current?.focus();
            }
            break;
          case "Home":
            e.preventDefault();
            if (filteredEnabledItems.length > 0) {
              setFocusedIndex(0);
              itemRefs.current[0]?.focus();
            }
            break;
          case "End":
            e.preventDefault();
            if (filteredEnabledItems.length > 0) {
              const lastIndex = filteredEnabledItems.length - 1;
              setFocusedIndex(lastIndex);
              itemRefs.current[lastIndex]?.focus();
            }
            break;
          case "Enter":
          case " ":
            if (focusedIndex >= 0 && filteredEnabledItems[focusedIndex]) {
              e.preventDefault();
              handleItemClick(filteredEnabledItems[focusedIndex]);
            }
            break;
          case "Tab":
            setOpen(false);
            break;
        }
      },
      [open, searchable, items, filteredItems, focusedIndex, setOpen, handleItemClick]
    );

    // Focus first item when opened
    useEffect(() => {
      if (open && searchable) {
        setFocusedIndex(0);
      } else {
        setFocusedIndex(-1);
      }
    }, [open, searchable]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          open &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node) &&
          menuRef.current &&
          !menuRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, setOpen]);

    // Render trigger
    const triggerElement = (
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? "dropdown-menu" : undefined}
        className={cn(
          "inline-flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-text-primary bg-background-primary border border-border-primary rounded-lg",
          "hover:bg-bg-tertiary hover:border-border-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {trigger}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn("flex-shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    );

    if (!open) return triggerElement;

    // Render menu via portal
    const menuContent = (
      <div
        ref={menuRef}
        id="dropdown-menu"
        role="listbox"
        aria-activedescendant={focusedIndex >= 0 ? `dropdown-item-${filteredItems[focusedIndex]?.value}` : undefined}
        className={cn(
          "fixed z-[1300] min-w-[200px] max-h-[280px] overflow-y-auto bg-background-primary border border-border-primary rounded-lg shadow-modal animate-slide-up",
          menuClassName
        )}
        style={{
          maxHeight,
          width: typeof width === "number" ? `${width}px` : width === "trigger" ? undefined : width,
        } as React.CSSProperties}
        tabIndex={-1}
      >
        {searchable && (
          <div className="p-2 border-b border-border-primary sticky top-0 bg-background-primary z-10">
            <label htmlFor="dropdown-search" className="sr-only">
              메뉴 검색
            </label>
            <input
              id="dropdown-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 text-sm border border-border-primary rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
              autoFocus
              aria-label="메뉴 검색"
            />
          </div>
        )}
        {filteredItems.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-text-tertiary">
            {emptyMessage}
          </div>
        ) : (
          <div className="py-1" role="presentation">
            {items.map((item, index) => {
              if (item.divider) {
                return <div key={`divider-${index}`} className="my-1 border-t border-border-primary" role="separator" />;
              }

              const isSelected = value === item.value;
              const isFocused = focusedIndex === index;
              const itemValue = item.value;

              return (
                <button
                  key={item.value}
                  ref={(el) => {
                    itemRefs.current[index] = el!;
                  }}
                  id={`dropdown-item-${itemValue}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={item.disabled}
                  disabled={item.disabled}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={cn(
                    "w-full px-3 py-2.5 text-sm text-left transition-colors",
                    "flex items-center gap-3",
                    isFocused && "bg-primary-50 outline-none",
                    isSelected && "bg-primary-50 text-primary-700 font-medium",
                    item.disabled && "opacity-50 cursor-not-allowed",
                    item.danger && "text-error-600 hover:bg-error-50",
                    "!important"
                  )}
                >
                  {item.icon && <span className="flex-shrink-0 size-4" aria-hidden="true">{item.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{item.label}</span>
                    {item.description && (
                      <span className="truncate block text-xs text-text-tertiary mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-primary-600 flex-shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );

    // Position menu relative to trigger
    const positionMenu = useCallback(() => {
      if (!triggerRef.current || !menuRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      const placementConfig = placementMap[placement] || placementMap.bottom!;

      switch (placementConfig.origin) {
        case "top":
          top = triggerRect.bottom + 4;
          break;
        case "bottom":
          top = triggerRect.top - menuRect.height - 4;
          break;
        case "top left":
          top = triggerRect.bottom + 4;
          left = triggerRect.left;
          break;
        case "top right":
          top = triggerRect.bottom + 4;
          left = triggerRect.right - menuRect.width;
          break;
        case "bottom left":
          top = triggerRect.top - menuRect.height - 4;
          left = triggerRect.left;
          break;
        case "bottom right":
          top = triggerRect.top - menuRect.height - 4;
          left = triggerRect.right - menuRect.width;
          break;
        case "left":
          top = triggerRect.top;
          left = triggerRect.left - menuRect.width - 4;
          break;
        case "right":
          top = triggerRect.top;
          left = triggerRect.right + 4;
          break;
      }

      // Prevent overflow
      if (left + menuRect.width > viewportWidth - 8) {
        left = viewportWidth - menuRect.width - 8;
      }
      if (left < 8) {
        left = 8;
      }
      if (top + menuRect.height > viewportHeight - 8) {
        top = viewportHeight - menuRect.height - 8;
      }
      if (top < 8) {
        top = 8;
      }

      menuRef.current.style.top = `${top}px`;
      menuRef.current.style.left = `${left}px`;
    }, [placement]);

    useEffect(() => {
      if (open) {
        positionMenu();
        window.addEventListener("scroll", positionMenu);
        window.addEventListener("resize", positionMenu);
      }
      return () => {
        window.removeEventListener("scroll", positionMenu);
        window.removeEventListener("resize", positionMenu);
      };
    }, [open, positionMenu]);

    return (
      <>
        {triggerElement}
        {createPortal(menuContent, document.body)}
      </>
    );
  }
);

Dropdown.displayName = "Dropdown";

/**
 * Select - Dropdown specialized for form selection
 */
export interface SelectProps extends Omit<DropdownProps, "trigger" | "items"> {
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Options */
  options: Array<{ value: string; label: string; disabled?: boolean; description?: string; icon?: ReactNode }>;
  /** Name for form submission */
  name?: string;
  /** Required field */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Label */
  label?: string;
  /** Hint text */
  hint?: string;
}

export function Select({
  placeholder = "선택하세요",
  options,
  value,
  onChange,
  name,
  required = false,
  error,
  label,
  hint,
  className,
  menuClassName,
  ...props
}: SelectProps) {
  const trigger = (
    <>
      {value
        ? options.find((o) => o.value === value)?.label
        : <span className="text-text-tertiary">{placeholder}</span>}
    </>
  );

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {required && <span className="text-error-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <Dropdown
        trigger={trigger}
        items={options.map((opt) => ({
          label: opt.label,
          value: opt.value,
          disabled: opt.disabled,
          description: opt.description,
          icon: opt.icon,
        }))}
        value={value || ""}
        onChange={onChange}
        menuClassName={menuClassName}
        {...props}
      />
      {hint && <p className="mt-1.5 text-sm text-text-tertiary">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-error-500" role="alert">{error}</p>}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ""}
          disabled={!value}
        />
      )}
    </div>
  );
}