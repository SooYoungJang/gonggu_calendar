import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for efficient class name composition.
 * Handles Tailwind conflicts intelligently (e.g., 'p-2 p-4' -> 'p-4').
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Variant-specific class composition.
 * Useful for component variants where you want to merge base + variant classes.
 */
export function cv(base: string, variants: Record<string, string>, ...inputs: ClassValue[]) {
  return twMerge(base, clsx(variants), clsx(inputs));
}

/**
 * Creates a variant helper for components.
 * Returns a function that composes base + selected variants + additional classes.
 */
export function createVariants<T extends Record<string, Record<string, string>>>(
  base: string,
  variantMap: T
) {
  return function getVariants(
    variants: Partial<Record<keyof T, string>>,
    ...inputs: ClassValue[]
  ): string {
    const variantClasses = Object.entries(variants).reduce((acc, [key, value]) => {
      if (value && variantMap[key]?.[value]) {
        acc.push(variantMap[key][value]);
      }
      return acc;
    }, [] as string[]);

    return cn(base, ...variantClasses, ...inputs);
  };
}