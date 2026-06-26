import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => {
  const ReactMock = require('react');
  const passthrough = (type: string) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactMock.createElement(type, props, children);

  function AnimatedValue(this: any, value: number) {
    this._value = value;
    this.interpolate = vi.fn(() => 0);
  }

  return {
    Alert: { alert: vi.fn() },
    Animated: {
      Value: AnimatedValue,
      View: passthrough('View'),
      timing: () => ({ start: (cb?: () => void) => cb?.() }),
      loop: () => ({ start: vi.fn(), stop: vi.fn() }),
      sequence: () => ({ start: vi.fn(), stop: vi.fn() }),
    },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    Easing: { inOut: vi.fn(() => vi.fn()), sin: vi.fn() },
    KeyboardAvoidingView: passthrough('KeyboardAvoidingView'),
    Platform: { OS: 'ios', select: (obj: Record<string, unknown>) => obj.ios ?? obj.default },
    Pressable: ({ children, onPress, ...props }: any) =>
      ReactMock.createElement('Pressable', { onPress, ...props }, children),
    ScrollView: passthrough('ScrollView'),
    StyleSheet: { create: (styles: unknown) => styles, flatten: (style: unknown) => style },
    Text: passthrough('Text'),
    TextInput: ReactMock.forwardRef(({ children, ...props }: any, ref: React.Ref<unknown>) =>
      ReactMock.createElement('TextInput', { ref, ...props }, children),
    ),
    View: passthrough('View'),
  };
});

vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: vi.fn(), goBack: vi.fn() }),
  useRoute: () => ({ params: {} }),
}));

vi.mock('@react-navigation/native-stack', () => ({}));

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#000',
      textTertiary: '#999',
      border: '#ccc',
      error: '#f00',
    },
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
  }),
}));

vi.mock('../schemas/auth', () => ({
  loginSchema: { safeParse: vi.fn() },
  signupStep1Schema: { safeParse: vi.fn() },
  signupStep2Schema: { safeParse: vi.fn() },
  signupStep3Schema: { safeParse: vi.fn() },
  AGREEMENTS: [
    { key: 'agreeService', label: '서비스 이용약관', required: true },
    { key: 'agreePrivacy', label: '개인정보 수집 및 이용', required: true },
    { key: 'agreeAge', label: '만 14세 이상입니다', required: true },
    { key: 'agreeMarketing', label: '마케팅 정보 수신', required: false, detailLink: true },
  ],
}));

vi.mock('../utils/authHelpers', () => ({
  mapAuthErrorMessage: vi.fn(() => '오류가 발생했습니다. 다시 시도해주세요.'),
  SOCIAL_PROVIDERS: [
    { provider: 'kakao', label: '카카오로 로그인', icon: '💬', backgroundColor: '#FEE500', textColor: '#1a1a1a', accessibilityLabel: '카카오로 로그인' },
    { provider: 'apple', label: 'Apple로 로그인', icon: '', backgroundColor: '#000000', textColor: '#ffffff', accessibilityLabel: 'Apple로 로그인' },
    { provider: 'google', label: 'Google로 로그인', icon: 'G', backgroundColor: '#ffffff', textColor: '#1a1a1a', accessibilityLabel: 'Google로 로그인' },
  ],
}));

import { AuthScreen } from '../screens/AuthScreen';

function renderAuthScreen() {
  let renderer: TestRenderer.ReactTestRenderer | null = null;
  act(() => {
    renderer = TestRenderer.create(<AuthScreen {...({} as any)} />);
  });
  return renderer!;
}

function containsText(renderer: TestRenderer.ReactTestRenderer, text: string): boolean {
  const root = renderer.root;
  const found = root.findAll((node) => {
    if (typeof node.type !== 'string') return false;
    const props = node.props as any;
    const children = props?.children;
    if (typeof children === 'string' && children.includes(text)) return true;
    if (Array.isArray(children)) {
      return children.some((c: any) => typeof c === 'string' && c.includes(text));
    }
    return false;
  });
  return found.length > 0;
}

function pressByAccessibilityLabel(renderer: TestRenderer.ReactTestRenderer, label: string) {
  const targets = renderer.root.findAll((node) => node.props.accessibilityLabel === label);
  expect(targets.length).toBeGreaterThan(0);
  act(() => {
    targets[0].props.onPress();
  });
}

describe('AuthScreen tab switching', () => {
  it('회원가입 탭 클릭 시 SignupPanel을 렌더링하고 로그인 탭으로 돌아올 수 있다', () => {
    const renderer = renderAuthScreen();

    // Initial state: LoginPanel should render the email login divider.
    expect(containsText(renderer, '또는 이메일 로그인')).toBe(true);

    // Press signup tab
    pressByAccessibilityLabel(renderer, '회원가입 탭');

    // SignupPanel should now show "기본 정보" (step 1 title)
    expect(containsText(renderer, '기본 정보')).toBe(true);

    // Press login tab
    pressByAccessibilityLabel(renderer, '로그인 탭');

    // LoginPanel should render again
    expect(containsText(renderer, '또는 이메일 로그인')).toBe(true);
  });
});
