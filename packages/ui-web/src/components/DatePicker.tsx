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

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Selected date (Date object or ISO string) */
  value?: Date | string | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: Date | string;
  /** Maximum selectable date */
  maxDate?: Date | string;
  /** Disabled dates function */
  disabledDates?: (date: Date) => boolean;
  /** Disabled days of week (0 = Sunday) */
  disabledDays?: number[];
  /** Show time picker */
  showTime?: boolean;
  /** Time step in minutes */
  timeStep?: number;
  /** Date format for display */
  format?: string;
  /** Locale */
  locale?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Required field */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Label */
  label?: string;
  /** Hint text */
  hint?: string;
  /** Name for form submission */
  name?: string;
  /** Additional CSS classes */
  className?: string;
  /** Input className */
  inputClassName?: string;
}

const DEFAULT_FORMAT = "YYYY-MM-DD";
const KOREAN_LOCALE = "ko-KR";

function formatDate(date: Date, format: string, locale: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes);
}

function parseDate(value: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBefore(a: Date, b: Date): boolean {
  return a < b;
}

function isAfter(a: Date, b: Date): boolean {
  return a > b;
}

function clampDate(date: Date, min?: Date, max?: Date): Date {
  if (min && isBefore(date, min)) return min;
  if (max && isAfter(date, max)) return max;
  return date;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "날짜 선택",
      minDate,
      maxDate,
      disabledDates,
      disabledDays = [],
      showTime = false,
      timeStep = 30,
      format = DEFAULT_FORMAT,
      locale = KOREAN_LOCALE,
      disabled = false,
      readOnly = false,
      required = false,
      error,
      label,
      hint,
      name,
      className,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => parseDate(value as string) || new Date());
    const [timeValue, setTimeValue] = useState<string>("00:00");
    const [inputValue, setInputValue] = useState<string>("");

    const parsedValue = parseDate(value as string);
    const min = parseDate(minDate as string);
    const max = parseDate(maxDate as string);

    // Sync internal state with props
    useEffect(() => {
      if (parsedValue) {
        setInputValue(formatDate(parsedValue, format, locale));
        if (showTime) {
          setTimeValue(`${String(parsedValue.getHours()).padStart(2, "0")}:${String(parsedValue.getMinutes()).padStart(2, "0")}`);
        }
      } else {
        setInputValue("");
      }
    }, [parsedValue, format, locale, showTime]);

    const inputRef = useRef<HTMLInputElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
      // Try to parse input
      const date = parseInput(inputValue);
      if (date) {
        const finalDate = clampDate(date, min, max);
        setViewDate(finalDate);
        onChange?.(finalDate);
      } else if (inputValue === "") {
        onChange?.(null);
      } else {
        // Revert to last valid value
        setInputValue(parsedValue ? formatDate(parsedValue, format, locale) : "");
      }
    };

    const parseInput = (input: string): Date | null => {
      if (!input) return null;
      // Try multiple formats
      const formats = [
        /^\d{4}-\d{2}-\d{2}$/,
        /^\d{4}\/\d{2}\/\d{2}$/,
        /^\d{2}\.\d{2}\.\d{4}$/,
        /^\d{2}\/\d{2}\/\d{4}$/,
      ];
      const parsed = new Date(input.replace(/\./g, "-").replace(/\//g, "-"));
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const handleDayClick = (day: Date) => {
      let finalDate = day;
      if (showTime) {
        const [hours, minutes] = timeValue.split(":").map(Number);
        finalDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
      }
      finalDate = clampDate(finalDate, min, max);
      onChange?.(finalDate);
      setViewDate(finalDate);
      setOpen(false);
      inputRef.current?.focus();
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      if (parsedValue) {
        const newDate = new Date(parsedValue.getFullYear(), parsedValue.getMonth(), parsedValue.getDate(), hours, minutes);
        const finalDate = clampDate(newDate, min, max);
        onChange?.(finalDate);
      }
      setTimeValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      const currentDay = parsedValue || viewDate;
      let newDay: Date | null = null;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          handleDayClick(currentDay);
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
        case "ArrowLeft":
          e.preventDefault();
          newDay = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "ArrowRight":
          e.preventDefault();
          newDay = new Date(currentDay.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "ArrowUp":
          e.preventDefault();
          newDay = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "ArrowDown":
          e.preventDefault();
          newDay = new Date(currentDay.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "Home":
          e.preventDefault();
          newDay = startOfMonth(currentDay);
          break;
        case "End":
          e.preventDefault();
          newDay = endOfMonth(currentDay);
          break;
        case "PageUp":
          e.preventDefault();
          newDay = addMonths(currentDay, -1);
          break;
        case "PageDown":
          e.preventDefault();
          newDay = addMonths(currentDay, 1);
          break;
      }

      if (newDay) {
        e.preventDefault();
        const clamped = clampDate(newDay, min, max);
        if (!isDisabledDate(clamped)) {
          setViewDate(clamped);
        }
      }
    };

    const isDisabledDate = (date: Date): boolean => {
      if (min && isBefore(date, min)) return true;
      if (max && isAfter(date, max)) return true;
      if (disabledDays.includes(date.getDay())) return true;
      if (disabledDates?.(date)) return true;
      return false;
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        open &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    useEffect(() => {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [open]);

    // Generate calendar days
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const startDay = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();

    const prevMonthEnd = endOfMonth(addMonths(viewDate, -1));
    const prevMonthDays = Array.from({ length: startDay }, (_, i) => {
      const day = prevMonthEnd.getDate() - startDay + 1 + i;
      return new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), day);
    });

    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
      return new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
    });

    const nextMonthStart = startOfMonth(addMonths(viewDate, 1));
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDaysNeeded = (7 - (totalDays % 7)) % 7;
    const nextMonthDays = Array.from({ length: nextMonthDaysNeeded }, (_, i) => {
      return new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), i + 1);
    });

    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    const monthName = viewDate.toLocaleString(locale, { month: "long", year: "numeric" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
            {required && <span className="text-error-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            onClick={() => !disabled && !readOnly && setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? "datepicker-calendar" : undefined}
            className={cn(
              "w-full px-3 py-2 text-sm bg-background-primary border border-border-primary rounded-lg",
              "placeholder:text-text-tertiary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100",
              error && "border-border-error focus-visible:ring-error-100",
              disabled && "bg-bg-tertiary cursor-not-allowed",
              inputClassName
            )}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        {hint && !error && <p className="mt-1.5 text-sm text-text-tertiary">{hint}</p>}
        {error && <p className="mt-1.5 text-sm text-error-500" role="alert">{error}</p>}
        {name && (
          <input
            type="hidden"
            name={name}
            value={parsedValue ? formatDate(parsedValue, "YYYY-MM-DD", locale) : ""}
            disabled={!parsedValue}
          />
        )}

        {open && (
          <div
            ref={calendarRef}
            id="datepicker-calendar"
            role="dialog"
            aria-label="날짜 선택"
            className="fixed z-[1300] bg-background-primary border border-border-primary rounded-lg shadow-modal p-4 animate-slide-up min-w-[280px]"
            style={{ maxWidth: "320px" } as React.CSSProperties}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, -1))}
                className="p-1 rounded-lg hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                aria-label="이전 달"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3 className="font-medium text-text-primary">{monthName}</h3>
              <button
                type="button"
                onClick={() => setViewDate(addMonths(viewDate, 1))}
                className="p-1 rounded-lg hover:bg-bg-tertiary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                aria-label="다음 달"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-2" role="row">
              {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-text-tertiary py-1"
                  role="columnheader"
                  aria-label={day === "일" ? "일요일" : day === "월" ? "월요일" : day === "화" ? "화요일" : day === "수" ? "수요일" : day === "목" ? "목요일" : day === "금" ? "금요일" : "토요일"}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1" role="grid">
              {allDays.map((day, index) => {
                const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                const isToday = isSameDay(day, today);
                const isSelected = parsedValue && isSameDay(day, parsedValue);
                const disabled = !isCurrentMonth || isDisabledDate(day);

                return (
                  <button
                    key={`${day.getTime()}-${index}`}
                    type="button"
                    role="gridcell"
                    aria-selected={!!isSelected}
                    aria-disabled={disabled}
                    aria-label={`${day.getFullYear()}년 ${day.getMonth() + 1}월 ${day.getDate()}일${isToday ? " (오늘)" : ""}${isSelected ? ", 선택됨" : ""}`}
                    disabled={disabled}
                    onClick={() => !disabled && handleDayClick(day)}
                    onMouseEnter={() => !disabled && setViewDate(day)}
                    className={cn(
                      "relative w-full aspect-square rounded-lg text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100",
                      disabled && "text-text-tertiary/50 cursor-not-allowed",
                      !disabled && "hover:bg-primary-50",
                      isToday && "text-primary-600 font-semibold",
                      isSelected && "bg-primary-600 text-white hover:bg-primary-700",
                      !isCurrentMonth && "text-text-tertiary/50"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Time picker */}
            {showTime && (
              <div className="mt-4 pt-4 border-t border-border-primary">
                <label htmlFor="time-input" className="block text-sm font-medium text-text-primary mb-2">
                  시간
                </label>
                <input
                  id="time-input"
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  step={timeStep * 60}
                  className="w-full px-3 py-2 text-sm border border-border-primary rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
                />
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange?.(null);
                  setInputValue("");
                  setOpen(false);
                }}
                className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-bg-secondary border border-border-primary rounded-lg hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
              >
                지우기
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
              >
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";