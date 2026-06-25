/**
 * AuthScreen.test.tsx — Tests for AuthScreen (Coral Wave redesign)
 *
 * Covers:
 *  - Screen renders without crashing
 *  - Header with app name
 *  - Social login buttons
 *  - Login form fields
 *  - Signup tab present
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { AuthScreen } from '../AuthScreen';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthContext';

// ─── Mocks (must be at top level, hoisted by vitest) ────────────────────────

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn().mockResolvedValue(null),
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

vi.mock('../../lib/supabase', () => ({
  configureSupabase: vi.fn(),
  getSupabase: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createTestRenderer() {
  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      React.createElement(ThemeProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(AuthScreen),
        ),
      ),
    );
  });
  return renderer!;
}

function findAllText(
  root: TestRenderer.ReactTestRenderer,
  text: string | RegExp,
): TestRenderer.ReactTestInstance[] {
  return root.root.findAll((node) => {
    const nodeText = node.props?.['children'];
    if (nodeText === undefined || nodeText === null) return false;
    const str = typeof nodeText === 'string' ? nodeText : String(nodeText);
    if (text instanceof RegExp) return text.test(str);
    if (typeof nodeText === 'string' && typeof text === 'string') {
      return nodeText === text || nodeText.includes(text);
    }
    return str.includes(String(text));
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AuthScreen', () => {
  let renderer: TestRenderer.ReactTestRenderer;

  afterEach(() => {
    if (renderer) {
      act(() => { renderer.unmount(); });
    }
  });

  it('renders without crashing', () => {
    renderer = createTestRenderer();
    expect(renderer).toBeDefined();
  });

  it('renders social login buttons', () => {
    renderer = createTestRenderer();
    expect(findAllText(renderer, '카카오로 로그인').length).toBeGreaterThan(0);
    expect(findAllText(renderer, 'Apple로 로그인').length).toBeGreaterThan(0);
    expect(findAllText(renderer, 'Google로 로그인').length).toBeGreaterThan(0);
  });

  it('renders email and password floating labels', () => {
    renderer = createTestRenderer();
    expect(findAllText(renderer, '이메일').length).toBeGreaterThan(0);
    expect(findAllText(renderer, '비밀번호').length).toBeGreaterThan(0);
  });

  it('renders forgot password link', () => {
    renderer = createTestRenderer();
    expect(findAllText(renderer, '비밀번호를 잊으셨나요?').length).toBeGreaterThan(0);
  });

  it('renders signup tab', () => {
    renderer = createTestRenderer();
    expect(findAllText(renderer, '회원가입').length).toBeGreaterThan(0);
  });

  it('renders app name', () => {
    renderer = createTestRenderer();
    expect(findAllText(renderer, '공구').length).toBeGreaterThan(0);
  });

  it('renders welcome message', () => {
    renderer = createTestRenderer();
    expect(findAllText(renderer, '함께 사면 더 즐거운 공동구매').length).toBeGreaterThan(0);
  });
});
