import { describe, expect, it } from 'vitest';
import { configureSupabase, getSupabase } from '../lib/supabase';

describe('Supabase client', () => {
  it('throws when accessed before configure', () => {
    expect(() => getSupabase()).toThrow(
      'Supabase client not configured',
    );
  });

  it('returns configured client after configureSupabase', () => {
    const client = configureSupabase('test-anon-key');
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it('returns singleton on second configure call', () => {
    const client1 = configureSupabase('test-anon-key');
    const client2 = configureSupabase('test-another-key');
    expect(client1).toBe(client2);
  });
});
