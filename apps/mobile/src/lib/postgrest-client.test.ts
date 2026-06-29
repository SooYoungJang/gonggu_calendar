import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configurePostgrest, postgrestFetch } from './postgrest-client';

const originalFetch = global.fetch;

describe('postgrestFetch diagnostics', () => {
  beforeEach(() => {
    configurePostgrest('sb_publishable_1234567890');
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('logs safe request and failure diagnostics when native fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Network request failed')) as unknown as typeof fetch;

    await expect(postgrestFetch('feed_posts')).rejects.toThrow('Network request failed');

    expect(console.log).toHaveBeenCalledTimes(2);

    expect(console.log).toHaveBeenNthCalledWith(1, '[PostgREST] request', {
      url: 'https://iosdoheblabfimkjnvfj.supabase.co/rest/v1/feed_posts',
      method: 'GET',
      apikey: { exists: true, length: 25, prefix: 'sb_publi' },
      hasAuthorization: false,
    });

    expect(console.log).toHaveBeenNthCalledWith(2, '[PostgREST] fetch failed', {
      url: 'https://iosdoheblabfimkjnvfj.supabase.co/rest/v1/feed_posts',
      name: 'TypeError',
      message: 'Network request failed',
      cause: undefined,
    });
  });
});
