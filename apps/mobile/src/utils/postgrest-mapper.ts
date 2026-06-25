/**
 * PostgREST Response Mapper
 *
 * Converts PostgREST snake_case response data to app camelCase format.
 * Also provides camelToSnake for building query params (sort, filter).
 *
 * Based on DATA_API_CONTRACT.md §6 — Response Mapper Layer
 */

// ─── Exception Map ───────────────────────────────────────────────────────────
// Columns that don't follow the snake_case → camelCase pattern.
// Key: PostgREST column name, Value: app camelCase property name.
const EXCEPTIONS: Record<string, string> = {
  mediaType: 'mediaType', // DB column is already camelCase (legacy)
};

// ─── Core Conversion ─────────────────────────────────────────────────────────

/**
 * Convert snake_case to camelCase.
 * Example: "instagram_url" → "instagramUrl"
 */
export function snakeToCamel(str: string): string {
  if (EXCEPTIONS[str]) return EXCEPTIONS[str];
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case.
 * Example: "instagramUrl" → "instagram_url"
 * Handles the mediaType exception (already camelCase, stays as-is).
 */
export function camelToSnake(str: string): string {
  // Check if this is an exception key (already snake_case or special)
  for (const [snake, camel] of Object.entries(EXCEPTIONS)) {
    if (camel === str) return snake;
  }
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// ─── Recursive Mapping ───────────────────────────────────────────────────────

/**
 * Recursively convert all keys in an object/array from snake_case to camelCase.
 *
 * Handles:
 *  - plain objects (recursive key conversion)
 *  - arrays (recursive item conversion)
 *  - nested objects (embedded joins)
 *  - null/primitive values (pass-through)
 *  - Date objects (pass-through)
 */
export function mapPostgrestToApp<T>(input: unknown): T {
  if (input === null || input === undefined) return input as T;

  // Arrays — map each item
  if (Array.isArray(input)) {
    return input.map((item) => mapPostgrestToApp(item)) as T;
  }

  // Date objects — pass through
  if (input instanceof Date) {
    return input as T;
  }

  // Objects — convert all keys recursively
  if (typeof input === 'object' && !Array.isArray(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = mapPostgrestToApp(value);
    }
    return result as T;
  }

  // Primitives — pass through
  return input as T;
}

// ─── Sort / Filter Mapping ───────────────────────────────────────────────────

export interface AppSortParams {
  field: string; // camelCase field name
  dir?: 'asc' | 'desc';
}

/**
 * Convert app sort params to PostgREST order parameter.
 * Example: { field: "sortOrder", dir: "asc" } → "sort_order.asc"
 */
export function appSortToPostgrestOrder(sort: AppSortParams): string {
  const snakeField = camelToSnake(sort.field);
  return `${snakeField}.${sort.dir || 'asc'}`;
}

export type AppFilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'isNull'
  | 'notNull';

export interface AppFilterParams {
  field: string; // camelCase field name
  operator: AppFilterOperator;
  value?: unknown;
}

/**
 * Convert app filter params to PostgREST query parameter(s).
 * Returns a tuple of [paramName, paramValue].
 *
 * Examples:
 *   { field: "status", operator: "eq", value: "APPROVED" }
 *     → ["status", "eq.APPROVED"]
 *
 *   { field: "rawPostId", operator: "isNull" }
 *     → ["raw_post_id", "is.null"]
 */
export function appFilterToPostgrestParam(
  filter: AppFilterParams,
): [string, string] {
  const snakeField = camelToSnake(filter.field);

  if (filter.operator === 'isNull') {
    return [snakeField, 'is.null'];
  }
  if (filter.operator === 'notNull') {
    return [snakeField, 'not.is.null'];
  }

  const val = Array.isArray(filter.value)
    ? `(${filter.value.join(',')})`
    : String(filter.value);

  return [snakeField, `${filter.operator}.${val}`];
}

// ─── Type Helpers ───────────────────────────────────────────────────────────

/**
 * Expresses a type that's been mapped from PostgREST snake_case to app camelCase.
 * This is a marker type — actual runtime mapping is done by `mapPostgrestToApp`.
 */
export type Mapped<T> = T;
