import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, expect, it } from 'vitest';

import { colors } from '../design/tokens';
import { colorsDark } from '../design/tokensDark';
import { ThemeProvider, useTheme } from './ThemeContext';

// Import mock helpers via dynamic import at module level (avoids ts-ignores in tests)
import * as RN from 'react-native';
const __colorSchemeSetter = (RN as any).__setColorScheme as (s: 'light' | 'dark') => void;

function flatten(node: any): string {
  if (!node) return '';
  if (Array.isArray(node)) return node.map((n: any) => flatten(n)).join(' ');
  return ((node.children || []) as any[]).map((c: any) => (typeof c === 'string' ? c : flatten(c))).join(' ');
}

function Consumer() {
  const t = useTheme();
  return React.createElement('View', null, [
    React.createElement('Text', null, `dark:${t.isDark}`),
    React.createElement('Text', null, `mode:${t.themeMode}`),
  ]);
}

describe('ThemeContext', () => {
  it('defaults to light with system mode', () => {
    let r: any;
    act(() => { r = TestRenderer.create(React.createElement(ThemeProvider, null, React.createElement(Consumer))); });
    const text = flatten(r!.toJSON());
    expect(text).toContain('dark:false');
    expect(text).toContain('mode:system');
  });

  it('responds to system dark scheme', () => {
    __colorSchemeSetter('dark');

    let r: any;
    act(() => { r = TestRenderer.create(React.createElement(ThemeProvider, null, React.createElement(Consumer))); });
    expect(flatten(r!.toJSON())).toContain('dark:true');
  });

  it('dark colors are different from light', () => {
    expect(colorsDark.bg).not.toBe(colors.bg);
  });

  it('toggleTheme switches between modes', () => {
    __colorSchemeSetter('light');
    let toggleRef: any = null;
    function T() {
      const t = useTheme();
      toggleRef = t.toggleTheme;
      return React.createElement('Text', null, `dark:${t.isDark}`);
    }
    let r: any;
    act(() => { r = TestRenderer.create(React.createElement(ThemeProvider, null, React.createElement(T))); });
    expect(flatten(r!.toJSON())).toContain('dark:false');
    act(() => toggleRef());
    expect(flatten(r!.toJSON())).toContain('dark:true');
    act(() => toggleRef());
    expect(flatten(r!.toJSON())).toContain('dark:false');
  });

  it('setThemeMode allows explicit mode', () => {
    __colorSchemeSetter('light');
    let modeRef: any = null;
    function M() {
      const t = useTheme();
      modeRef = t.setThemeMode;
      return React.createElement('Text', null, `mode:${t.themeMode}`);
    }
    let r: any;
    act(() => { r = TestRenderer.create(React.createElement(ThemeProvider, null, React.createElement(M))); });
    expect(flatten(r!.toJSON())).toContain('mode:system');
    act(() => modeRef('dark'));
    expect(flatten(r!.toJSON())).toContain('mode:dark');
    act(() => modeRef('light'));
    expect(flatten(r!.toJSON())).toContain('mode:light');
  });
});
