import { forwardRef, useState, type HTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "../utils/cn";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface FilterChipsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Options to display */
  options: FilterOption[];
  /** Currently selected value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Whether to show search input */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show as segmented control (connected buttons) */
  segmented?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Name for form submission (when multiple) */
  name?: string;
}

export const FilterChips = forwardRef<HTMLDivElement, FilterChipsProps>(
  (
    {
      options,
      value,
      onChange,
      searchable = false,
      searchPlaceholder = "검색...",
      multiple = false,
      size = "md",
      segmented = false,
      className,
      name,
      ...props
    },
    ref
  ) => {
    const searchId = useId();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOptions = options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChange = (newValue: string) => {
      if (multiple) {
        const values = value ? value.split(",") : [];
        const index = values.indexOf(newValue);
        if (index >= 0) {
          values.splice(index, 1);
        } else {
          values.push(newValue);
        }
        onChange(values.join(","));
      } else {
        onChange(newValue);
      }
    };

    const isSelected = (optionValue: string) => {
      if (multiple) {
        return value.split(",").includes(optionValue);
      }
      return value === optionValue;
    };

    const chipStyles = {
      sm: "px-2 py-1 text-xs gap-1",
      md: "px-3 py-1.5 text-sm gap-1.5",
      lg: "px-4 py-2 text-base gap-2",
    };

    const iconSizes = {
      sm: "size-3",
      md: "size-4",
      lg: "size-5",
    };

    if (segmented && !multiple) {
      return (
        <div ref={ref} className={cn("inline-flex items-center rounded-lg bg-bg-tertiary p-1", className)} {...props}>
          {filteredOptions.map((option) => {
            const selected = isSelected(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(option.value)}
                disabled={option.disabled}
                className={cn(
                  "relative inline-flex items-center gap-1.5 font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100",
                  selected
                    ? "bg-background-primary shadow-sm text-primary-600"
                    : "text-text-secondary hover:text-text-primary",
                  chipStyles[size],
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-pressed={selected}
                aria-current={selected ? "true" : undefined}
              >
                {option.icon && <span className={cn("flex-shrink-0", iconSizes[size])}>{option.icon}</span>}
                {option.label}
                {option.count !== undefined && (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-medium", selected ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-neutral-600")}>
                    {option.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("flex flex-wrap gap-2", className)} {...props}>
        {searchable && (
          <div className="relative flex-1 min-w-[200px]">
            <label htmlFor={searchId} className="sr-only">
              칩 검색
            </label>
            <input
              id={searchId}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-border-primary rounded-lg bg-background-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
              aria-label="칩 검색"
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
        )}
        {filteredOptions.map((option) => {
          const selected = isSelected(option.value);
          if (multiple) {
            return (
              <label
                key={option.value}
                className={cn(
                  "inline-flex items-center gap-1.5 cursor-pointer rounded-full border transition-colors",
                  selected
                    ? "bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900 dark:border-primary-700"
                    : "bg-bg-secondary border-border-primary text-text-primary hover:bg-bg-tertiary",
                  chipStyles[size],
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleChange(option.value)}
                  disabled={option.disabled}
                  className="sr-only"
                  name={name}
                  value={option.value}
                  aria-label={option.label}
                />
                {option.icon && <span className={cn("flex-shrink-0", iconSizes[size])}>{option.icon}</span>}
                {option.label}
                {option.count !== undefined && (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-medium", selected ? "bg-primary-200" : "bg-neutral-100")}>
                    {option.count}
                  </span>
                )}
              </label>
            );
          }
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              disabled={option.disabled}
              className={cn(
                "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors",
                selected
                  ? "bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900 dark:border-primary-700"
                  : "bg-bg-secondary border-border-primary text-text-primary hover:bg-bg-tertiary",
                chipStyles[size],
                option.disabled && "opacity-50 cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
              )}
              aria-pressed={selected}
            >
              {option.icon && <span className={cn("flex-shrink-0", iconSizes[size])}>{option.icon}</span>}
              {option.label}
              {option.count !== undefined && (
                <span className={cn("px-1.5 py-0.5 rounded-full text-xs font-medium", selected ? "bg-primary-200" : "bg-neutral-100")}>
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

FilterChips.displayName = "FilterChips";

/**
 * SegmentedControl - Connected button group for mutually exclusive options
 */
export interface SegmentedControlProps extends Omit<FilterChipsProps, "segmented" | "multiple" | "searchable"> {
  /** Options */
  options: FilterOption[];
  /** Selected value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Full width */
  fullWidth?: boolean;
}

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ options, value, onChange, size = "md", fullWidth = false, className, ...props }, ref) => {
    return (
      <FilterChips
        ref={ref}
        options={options}
        value={value}
        onChange={onChange}
        segmented
        size={size}
        className={cn(fullWidth && "w-full", className)}
        {...props}
      />
    );
  }
);

SegmentedControl.displayName = "SegmentedControl";