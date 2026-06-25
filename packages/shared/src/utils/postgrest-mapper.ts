/**
 * PostgREST Response Mapper
 *
 * Converts PostgREST snake_case response data to app camelCase format.
 * Also provides camelToSnake for building query params (sort, filter).
 */

// ─── Exception Map ───────────────────────────────────────────────────────────
// Columns that don't follow the snake_case → camelCase pattern.
const EXCEPTIONS: Record<string, string> = {
  mediaType: 'mediaType',
};

// ─── Core Conversion ─────────────────────────────────────────────────────────

export function snakeToCamel(str: string): string {
  if (EXCEPTIONS[str]) return EXCEPTIONS[str];
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function camelToSnake(str: string): string {
  for (const [snake, camel] of Object.entries(EXCEPTIONS)) {
    if (camel === str) return snake;
  }
  // Handle consecutive uppercase: "idTestURL" → "id_test_url"
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, (_, p1, p2) => `${p1}_${p2}`)
    .replace(/([a-z0-9])([A-Z])/g, (_, p1, p2) => `${p1}_${p2}`)
    .toLowerCase();
}

// ─── Recursive Mapping ───────────────────────────────────────────────────────

/**
 * Recursively convert all keys in an object/array from snake_case to camelCase.
 * Handles nested objects, arrays, null, Date objects, and primitives.
 */
export function mapPostgrestToApp<T>(input: unknown): T {
  if (input === null || input === undefined) return input as T;
  if (Array.isArray(input)) {
    return input.map((item) => mapPostgrestToApp(item)) as T;
  }
  if (input instanceof Date) return input as T;
  if (typeof input === 'object' && !Array.isArray(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = mapPostgrestToApp(value);
    }
    return result as T;
  }
  return input as T;
}

// ─── Sort / Filter Mapping ───────────────────────────────────────────────────

export interface AppSortParams {
  field: string;
  dir?: 'asc' | 'desc';
}

export function appSortToPostgrestOrder(sort: AppSortParams): string {
  return `${camelToSnake(sort.field)}.${sort.dir || 'asc'}`;
}

export type AppFilterOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'isNull' | 'notNull';

export interface AppFilterParams {
  field: string;
  operator: AppFilterOperator;
  value?: unknown;
}

export function appFilterToPostgrestParam(filter: AppFilterParams): [string, string] {
  const snakeField = camelToSnake(filter.field);
  if (filter.operator === 'isNull') return [snakeField, 'is.null'];
  if (filter.operator === 'notNull') return [snakeField, 'not.is.null'];
  const val = Array.isArray(filter.value)
    ? `(${filter.value.join(',')})`
    : String(filter.value);
  return [snakeField, `${filter.operator}.${val}`];
}
