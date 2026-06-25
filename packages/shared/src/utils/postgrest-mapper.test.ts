import { describe, it, expect } from 'vitest';
import {
  snakeToCamel,
  camelToSnake,
  mapPostgrestToApp,
  appSortToPostgrestOrder,
  appFilterToPostgrestParam,
} from './postgrest-mapper';

describe('snakeToCamel', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamel('instagram_url')).toBe('instagramUrl');
  });

  it('handles single word', () => {
    expect(snakeToCamel('id')).toBe('id');
  });

  it('handles multiple underscores', () => {
    expect(snakeToCamel('raw_post_id')).toBe('rawPostId');
  });

  it('handles empty string', () => {
    expect(snakeToCamel('')).toBe('');
  });
});

describe('camelToSnake', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnake('instagramUrl')).toBe('instagram_url');
  });

  it('handles single word', () => {
    expect(camelToSnake('id')).toBe('id');
  });

  it('handles uppercase letters in a row', () => {
    const result = camelToSnake('idTestURL');
    expect(result).toBe('id_test_url');
  });
});

describe('mapPostgrestToApp', () => {
  it('converts all keys from snake_case to camelCase', () => {
    const input = { instagram_url: 'https://ig.com/p/abc', media_type: 'IMAGE' };
    const result = mapPostgrestToApp<Record<string, unknown>>(input);
    expect(result).toEqual({ instagramUrl: 'https://ig.com/p/abc', mediaType: 'IMAGE' });
  });

  it('handles nested objects', () => {
    const input = { raw_post: { post_url: 'https://ig.com/p/abc' } };
    const result = mapPostgrestToApp<Record<string, unknown>>(input);
    expect(result).toEqual({ rawPost: { postUrl: 'https://ig.com/p/abc' } });
  });

  it('handles arrays of objects', () => {
    const input = [{ id: '1', product_name: 'Test' }, { id: '2', product_name: 'Test 2' }];
    const result = mapPostgrestToApp<Array<Record<string, unknown>>>(input);
    expect(result).toEqual([{ id: '1', productName: 'Test' }, { id: '2', productName: 'Test 2' }]);
  });

  it('passes through null and undefined', () => {
    expect(mapPostgrestToApp(null)).toBeNull();
    expect(mapPostgrestToApp(undefined)).toBeUndefined();
  });

  it('passes through primitives', () => {
    expect(mapPostgrestToApp(42)).toBe(42);
    expect(mapPostgrestToApp('hello')).toBe('hello');
    expect(mapPostgrestToApp(true)).toBe(true);
  });
});

describe('appSortToPostgrestOrder', () => {
  it('converts sort params to PostgREST order string', () => {
    expect(appSortToPostgrestOrder({ field: 'sortOrder', dir: 'asc' })).toBe('sort_order.asc');
  });

  it('defaults to asc direction', () => {
    expect(appSortToPostgrestOrder({ field: 'createdAt' })).toBe('created_at.asc');
  });
});

describe('appFilterToPostgrestParam', () => {
  it('converts eq filter', () => {
    const [key, val] = appFilterToPostgrestParam({ field: 'status', operator: 'eq', value: 'APPROVED' });
    expect(key).toBe('status');
    expect(val).toBe('eq.APPROVED');
  });

  it('converts isNull filter', () => {
    const [key, val] = appFilterToPostgrestParam({ field: 'deletedAt', operator: 'isNull' });
    expect(key).toBe('deleted_at');
    expect(val).toBe('is.null');
  });

  it('converts array in filter', () => {
    const [key, val] = appFilterToPostgrestParam({ field: 'status', operator: 'in', value: ['A', 'B'] });
    expect(key).toBe('status');
    expect(val).toBe('in.(A,B)');
  });
});
