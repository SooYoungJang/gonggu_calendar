import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGroupBuys } from './api';
import { configurePostgrest } from './lib/postgrest-client';

const originalFetch = global.fetch;

describe('public data fetch diagnostics', () => {
  beforeEach(() => {
    configurePostgrest('sb_publishable_1234567890');
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('logs group buy failures separately from feed failures', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Network request failed')) as unknown as typeof fetch;

    await expect(fetchGroupBuys()).rejects.toThrow('Network request failed');

    expect(console.log).toHaveBeenCalledWith('[GroupBuys] fetch failed:', 'Network request failed');
  });
});
