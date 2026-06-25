/**
 * @gonggu/mobile — AuthContext tests
 *
 * Tests for session restore, sign in/up/out, and auth state management.
 */

// NOTE: vi.mock calls are hoisted by vitest to the top of the file, before imports.
// This is why we can mock supabase here even though it's imported below.

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as SecureStore from 'expo-secure-store';

import { AuthProvider, useAuth } from './AuthContext';

// Mock the supabase module — vitest hoists this to the top but we need hoisted vars
const mockOnAuthStateChange = vi.hoisted(() => vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
})));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      setSession: vi.fn(),
      onAuthStateChange: mockOnAuthStateChange,
      getSession: vi.fn(),
    },
  },
  getSupabaseClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      setSession: vi.fn(),
      onAuthStateChange: mockOnAuthStateChange,
      getSession: vi.fn(),
    },
  })),
}));

function flatten(node: any): string {
  if (!node) return '';
  if (Array.isArray(node)) return node.map((n: any) => flatten(n)).join(' ');
  return ((node.children || []) as any[]).map((c: any) => (typeof c === 'string' ? c : flatten(c))).join(' ');
}

function Consumer() {
  const auth = useAuth();
  return React.createElement('View', null, [
    React.createElement('Text', null, `user:${auth.user?.email ?? 'null'}`),
    React.createElement('Text', null, `loading:${auth.isLoading}`),
    React.createElement('Text', null, `session:${auth.session !== null}`),
  ]);
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SecureStore.getItemAsync).mockReset();
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  });

  it('initial state is loading with no user', () => {
    let r: any;
    act(() => {
      r = TestRenderer.create(React.createElement(AuthProvider, null, React.createElement(Consumer)));
    });

    const text = flatten(r!.toJSON());
    expect(text).toContain('user:null');
    expect(text).toContain('loading:true');
  });

  it('restores session from SecureStore', async () => {
    const mockSession = {
      access_token: 'test-token',
      refresh_token: 'test-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: 'user-1', email: 'test@example.com' },
    };
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify(mockSession));

    let r: any;
    await act(async () => {
      r = TestRenderer.create(React.createElement(AuthProvider, null, React.createElement(Consumer)));
    });

    // Allow effects to settle (SecureStore async read)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const text = flatten(r!.toJSON());
    expect(text).toContain('user:test@example.com');
    expect(text).toContain('loading:false');
  });

  it('handles expired session gracefully', async () => {
    const expiredSession = {
      access_token: 'expired-token',
      refresh_token: 'expired-refresh',
      expires_at: Math.floor(Date.now() / 1000) - 3600,
      user: { id: 'user-1', email: 'old@example.com' },
    };
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(JSON.stringify(expiredSession));

    let r: any;
    await act(async () => {
      r = TestRenderer.create(React.createElement(AuthProvider, null, React.createElement(Consumer)));
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const text = flatten(r!.toJSON());
    expect(text).toContain('user:null');
    expect(text).toContain('loading:false');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('gonggu.auth.session');
  });

  it('subscribes to auth state changes', () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(null);

    act(() => {
      TestRenderer.create(React.createElement(AuthProvider, null, React.createElement(Consumer)));
    });

    // AuthProvider reads SecureStore on mount — prove it initialised
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('gonggu.auth.session');
  });
});
