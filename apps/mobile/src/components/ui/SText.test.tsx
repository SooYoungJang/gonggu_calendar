import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => {
  const ReactMock = require('react');
  const passthrough = (type: string) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactMock.createElement(type, props, children);

  return {
    ActivityIndicator: passthrough('ActivityIndicator'),
    FlatList: passthrough('FlatList'),
    ImageBackground: passthrough('ImageBackground'),
    Pressable: passthrough('Pressable'),
    RefreshControl: passthrough('RefreshControl'),
    ScrollView: passthrough('ScrollView'),
    StatusBar: passthrough('StatusBar'),
    StyleSheet: { create: (styles: unknown) => styles },
    Text: passthrough('Text'),
    TextInput: passthrough('TextInput'),
    View: passthrough('View'),
    Platform: { OS: 'ios', select: (obj: any) => obj.ios ?? obj.default },
  };
});

import { SText } from './SText';

describe('SText', () => {
  it('renders text content correctly', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<SText variant="body">Hello World</SText>);
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();

    if (json && !Array.isArray(json)) {
      expect(json.type).toBe('Text');
      expect(json.children).toContain('Hello World');
    }
  });

  it('applies eyebrow typography for variant="eyebrow"', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<SText variant="eyebrow">Eyebrow</SText>);
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      expect(json.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 12, fontWeight: '600' }),
        ]),
      );
    }
  });

  it('applies title typography for variant="title"', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<SText variant="title">Title</SText>);
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      expect(json.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 28, fontWeight: '700' }),
        ]),
      );
    }
  });

  it('applies cardTitle typography for variant="cardTitle"', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<SText variant="cardTitle">Card Title</SText>);
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      expect(json.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 18, fontWeight: '700' }),
        ]),
      );
    }
  });

  it('applies body typography for variant="body"', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<SText variant="body">Body text</SText>);
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      expect(json.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 14 }),
        ]),
      );
    }
  });

  it('applies caption typography for variant="caption"', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<SText variant="caption">Caption</SText>);
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      expect(json.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 12 }),
        ]),
      );
    }
  });

  it('applies label typography for variant="label"', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<SText variant="label">Label</SText>);
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      expect(json.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 14, fontWeight: '600' }),
        ]),
      );
    }
  });

  it('applies badge typography for variant="badge"', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(<SText variant="badge">Badge</SText>);
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      expect(json.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 12, fontWeight: '600' }),
        ]),
      );
    }
  });

  it('merges custom style with variant style, custom winning', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <SText variant="body" style={{ color: '#FF0000', fontSize: 20 }}>
          Custom styled
        </SText>,
      );
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      const style = json.props.style;
      // Custom values should be present (they win over variant defaults)
      expect(style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fontSize: 20, color: '#FF0000' }),
        ]),
      );
    }
  });

  it('forwards numberOfLines prop to Text', () => {
    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <SText variant="body" numberOfLines={2}>
          Truncated
        </SText>,
      );
    });
    const json = renderer!.toJSON();
    expect(json).not.toBeNull();
    if (json && !Array.isArray(json)) {
      expect(json.props.numberOfLines).toBe(2);
    }
  });

  it('all type variants are assignable and render', () => {
    const variants = ['eyebrow', 'title', 'cardTitle', 'body', 'caption', 'label', 'badge'] as const;
    for (const v of variants) {
      let renderer: TestRenderer.ReactTestRenderer;
      act(() => {
        renderer = TestRenderer.create(<SText variant={v}>{v}</SText>);
      });
      const json = renderer!.toJSON();
      expect(json).not.toBeNull();
    }
  });
});
