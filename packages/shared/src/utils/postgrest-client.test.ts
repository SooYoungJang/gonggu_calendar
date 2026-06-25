import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  configurePostgrest,
  postgrestGet,
  postgrestPost,
  postgrestPatch,
  postgrestDelete,
} from './postgrest-client';

describe('PostgREST Client', () => {
  const baseUrl = 'https://test.supabase.co';
  const anonKey = 'test-anon-key';

  beforeEach(() => {
    vi.restoreAllMocks();
    configurePostgrest(baseUrl, anonKey);
  });

  it('constructs correct URL for a simple GET', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => [{ id: '1', name: 'Test' }],
    });
    vi.stubGlobal('fetch', mockFetch);

    await postgrestGet('/group_buys');

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseUrl}/rest/v1/group_buys`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          apikey: anonKey,
        }),
      }),
    );
  });

  it('applies Range header for pagination', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-range': 'items 0-9/100' }),
      json: async () => [],
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await postgrestGet('/feed_posts', { pagination: { page: 1, limit: 10 } });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/feed_posts'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Range: 'items=0-9',
          Prefer: 'count=exact',
        }),
      }),
    );
    expect(result.meta?.total).toBe(100);
  });

  it('handles HTTP errors with PostgrestError', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
      json: async () => ({ message: 'Not found', code: 'PGRST116' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(postgrestGet('/unknown_table')).rejects.toThrow('조회');
  });

  it('performs POST request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => [{ id: 'new-id' }],
    });
    vi.stubGlobal('fetch', mockFetch);

    const body = { product_name: 'Test', brand_name: 'Brand' };
    await postgrestPost('/group_buys', body);

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseUrl}/rest/v1/group_buys`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
  });

  it('performs PATCH request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => [{ id: '1', updated: true }],
    });
    vi.stubGlobal('fetch', mockFetch);

    await postgrestPatch('/group_buys', { status: 'APPROVED' });

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseUrl}/rest/v1/group_buys`,
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('performs DELETE request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => [],
    });
    vi.stubGlobal('fetch', mockFetch);

    await postgrestDelete('/group_buys');

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseUrl}/rest/v1/group_buys`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
