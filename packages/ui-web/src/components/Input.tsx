import {
  forwardRef,
  useId,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type ReactElement,
  isValidElement,
  cloneElement,
} from "react";
import { cn } from "../utils/cn";

export type InputSize = "sm" | "md" | "lg";
export type InputType = "text" | "email" | "password" | "url" | "tel" | "number" | "date" | "datetime-local" | "search";

interface BaseInputProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: InputSize;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export interface InputProps extends Omit<BaseInputProps, "onChange" | "onBlur" | "onFocus"> {
  type?: InputType;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface TextareaProps extends Omit<BaseInputProps, "onChange" | "onBlur" | "onFocus"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  rows?: number;
  autoResize?: boolean;
}

interface InputRef {
  focus: () => void;
  blur: () => void;
  select: () => void;
}

const baseInputStyles =
  "w-full bg-background-primary border border-border-primary text-text-primary placeholder-text-tertiary transition-all duration-150 ease-out";

const sizeStyles: Record<InputSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-3 text-base",
  lg: "h-12 px-4 text-lg",
};

function getStateStyles(error: string | undefined, focused: boolean, disabled: boolean, readOnly: boolean) {
  if (error) return "border-border-error focus:border-border-focus-error focus:ring focus:ring-error-100";
  if (focused) return "border-border-focus focus:ring focus:ring-primary-100";
  if (disabled || readOnly) return "bg-bg-tertiary cursor-not-allowed";
  return "hover:border-border-secondary";
}

export const Input = forwardRef<{ focus: () => void; blur: () => void; select: () => void }, InputProps>(
  (
    {
      label,
      hint,
      error,
      required = false,
      size = "md",
      disabled = false,
      readOnly = false,
      placeholder,
      maxLength,
      showCount = false,
      className,
      id: providedId,
      name,
      type = "text",
      value: controlledValue,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const countId = `${id}-count`;
    const [focused, setFocused] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "");
    const inputRef = useRef<HTMLInputElement>(null);

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const finalValue = maxLength && newValue.length > maxLength ? newValue.slice(0, maxLength) : newValue;
      if (!isControlled) {
        setUncontrolledValue(finalValue);
      }
      onChange?.(finalValue);
    };

    const handleBlur = () => {
      setFocused(false);
      onBlur?.();
    };

    const handleFocus = () => {
      setFocused(true);
      onFocus?.();
    };

    const hasHintOrError = hint || error;
    const describedBy = hasHintOrError ? [hint && hintId, error && errorId].filter(Boolean).join(" ") : undefined;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      select: () => inputRef.current?.select(),
    }), []);

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium text-text-primary mb-1.5",
              required && "after:content-['*'] after:ml-0.5 after:text-error-500"
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          aria-required={required}
          aria-readonly={readOnly}
          className={cn(
            baseInputStyles,
            sizeStyles[size],
            getStateStyles(error, focused, disabled, readOnly),
            "rounded-md focus-visible:outline-none"
          )}
          {...props}
        />
        {(hint || error || (showCount && maxLength)) && (
          <div className="flex items-center justify-between mt-1.5 gap-2">
            {error ? (
              <p id={errorId} className="text-sm text-error-500" role="alert" aria-live="polite">
                {error}
              </p>
            ) : hint ? (
              <p id={hintId} className="text-sm text-text-tertiary">
                {hint}
              </p>
            ) : null}
            {showCount && maxLength && (
              <p id={countId} className="text-sm text-text-tertiary font-mono" aria-live="polite">
                {currentValue.length}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      required = false,
      size = "md",
      disabled = false,
      readOnly = false,
      placeholder,
      maxLength,
      showCount = false,
      className,
      id: providedId,
      name,
      value: controlledValue,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      rows = 3,
      autoResize = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const countId = `${id}-count`;
    const [focused, setFocused] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || "");
    const [height, setHeight] = useState("auto");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
        setHeight(`${scrollHeight}px`);
      }
    }, [currentValue, autoResize]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const finalValue = maxLength && newValue.length > maxLength ? newValue.slice(0, maxLength) : newValue;
      if (!isControlled) {
        setUncontrolledValue(finalValue);
      }
      onChange?.(finalValue);
    };

    const handleBlur = () => {
      setFocused(false);
      onBlur?.();
    };

    const handleFocus = () => {
      setFocused(true);
      onFocus?.();
    };

    const hasHintOrError = hint || error;
    const describedBy = hasHintOrError ? [hint && hintId, error && errorId].filter(Boolean).join(" ") : undefined;

    useImperativeHandle(ref, () => textareaRef.current!, []);

    const baseTextareaStyles =
      "w-full bg-background-primary border border-border-primary text-text-primary placeholder-text-tertiary resize-none transition-all duration-150 ease-out";

    const textareaSizeStyles: Record<InputSize, string> = {
      sm: "px-3 py-2 text-sm",
      md: "px-3 py-3 text-base",
      lg: "px-4 py-4 text-lg",
    };

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium text-text-primary mb-1.5",
              required && "after:content-['*'] after:ml-0.5 after:text-error-500"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          rows={autoResize ? undefined : rows}
          style={{ height: autoResize ? height : undefined, minHeight: autoResize ? `${rows * 1.5}rem` : undefined }}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          aria-required={required}
          aria-readonly={readOnly}
          className={cn(
            baseTextareaStyles,
            textareaSizeStyles[size],
            getStateStyles(error, focused, disabled, readOnly),
            "rounded-lg focus-visible:outline-none"
          )}
          {...props}
        />
        {(hint || error || (showCount && maxLength)) && (
          <div className="flex items-center justify-between mt-1.5 gap-2">
            {error ? (
              <p id={errorId} className="text-sm text-error-500" role="alert" aria-live="polite">
                {error}
              </p>
            ) : hint ? (
              <p id={hintId} className="text-sm text-text-tertiary">
                {hint}
              </p>
            ) : null}
            {showCount && maxLength && (
              <p id={countId} className="text-sm text-text-tertiary font-mono" aria-live="polite">
                {currentValue.length}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactElement<InputProps | TextareaProps>;
  className?: string;
}

export function FormField({ label, hint, error, required = false, children, className }: FormFieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {isValidElement(children) && (
        cloneElement(children as ReactElement<InputProps | TextareaProps>, {
          label,
          hint,
          error,
          required,
        })
      )}
    </div>
  );
}