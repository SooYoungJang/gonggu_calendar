import { useState, useMemo, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { SText } from '../components/ui/SText';
import { FormInput } from '../components/FormInput';
import { AppButton } from '../components/AppButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { spacing } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import type { ColorPalette } from '../context/ThemeContext';

type AuthMode = 'login' | 'signup';

export function MyPageScreen() {
  const { colors } = useTheme();
  const { user, isLoading: authLoading, signIn, signUp, signOut } = useAuth();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={s.container}>
      {authLoading ? (
        <View style={[s.center, { backgroundColor: colors.bg }]}>
          <SText variant="body">로딩 중...</SText>
        </View>
      ) : user ? (
        <ProfileView
          user={user}
          onLogout={signOut}
          colors={colors}
        />
      ) : (
        <AuthView
          onSignIn={signIn}
          onSignUp={signUp}
          colors={colors}
        />
      )}
    </View>
  );
}

// ─── Profile View (Logged In) ────────────────────────────────────────────────

function ProfileView({
  user,
  onLogout,
  colors,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  onLogout: () => Promise<void>;
  colors: ColorPalette;
}) {
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  }, [onLogout]);

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          eyebrow="MY"
          title="마이페이지"
          subtitle="내 계정 정보를 확인하고 관리하세요."
        />

        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <SText variant="title" style={s.avatarText}>
              {(user.email ?? '?')[0].toUpperCase()}
            </SText>
          </View>
          <SText variant="cardTitle" style={s.profileEmail}>
            {user.email}
          </SText>
          <SText variant="caption" style={s.profileJoined}>
            가입일:{' '}
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString('ko-KR')
              : '알 수 없음'}
          </SText>
        </View>

        <View style={s.logoutSection}>
          <AppButton
            variant="secondary"
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? '로그아웃 중...' : '로그아웃'}
          </AppButton>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Auth View (Login / Signup) ──────────────────────────────────────────────

function AuthView({
  onSignIn,
  onSignUp,
  colors,
}: {
  onSignIn: (email: string, password: string) => Promise<unknown>;
  onSignUp: (email: string, password: string) => Promise<unknown>;
  colors: ColorPalette;
}) {
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = useCallback(() => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);

    // Basic validation
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setSubmitting(true);
    try {
      const authError =
        mode === 'login'
          ? await onSignIn(email.trim(), password)
          : await onSignUp(email.trim(), password);

      if (authError) {
        setError(mapAuthErrorMessage(authError));
      } else if (mode === 'signup') {
        // On signup success, show confirmation message
        setError(null);
        setMode('login');
      }
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }, [email, password, confirmPassword, mode, onSignIn, onSignUp]);

  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          eyebrow="MY"
          title={isLogin ? '로그인' : '회원가입'}
          subtitle={
            isLogin
              ? '이메일과 비밀번호로 로그인하세요.'
              : '계정을 만들어 공구 알림을 받아보세요.'
          }
        />

        <FormInput
          label="이메일"
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          editable={!submitting}
        />

        <FormInput
          label="비밀번호"
          placeholder="비밀번호 입력"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          editable={!submitting}
        />

        {!isLogin && (
          <FormInput
            label="비밀번호 확인"
            placeholder="비밀번호 다시 입력"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!submitting}
          />
        )}

        {error ? (
          <SText variant="caption" style={s.errorText}>
            {error}
          </SText>
        ) : null}

        <AppButton
          variant="primary"
          onPress={handleSubmit}
          disabled={submitting}
          style={s.submitButton}
        >
          {submitting
            ? '처리 중...'
            : isLogin
              ? '로그인'
              : '회원가입'}
        </AppButton>

        <View style={s.switchRow}>
          <SText variant="body">
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          </SText>
          <Pressable onPress={switchMode} disabled={submitting}>
            <SText
              variant="body"
              style={s.switchLink}
            >
              {isLogin ? '회원가입' : '로그인'}
            </SText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Error Message Mapping ───────────────────────────────────────────────────

function mapAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; code?: string; status?: number };
    const msg = err.message ?? err.code ?? '';

    if (msg.includes('Invalid login credentials')) {
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    }
    if (msg.includes('Email not confirmed')) {
      return '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.';
    }
    if (msg.includes('User already registered')) {
      return '이미 가입된 이메일입니다. 로그인해주세요.';
    }
    if (msg.includes('Password should be at least 6 characters')) {
      return '비밀번호는 6자 이상이어야 합니다.';
    }
    if (msg.includes('rate limit')) {
      return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
    }
  }
  return '오류가 발생했습니다. 다시 시도해주세요.';
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    center: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    scrollContent: {
      padding: spacing['2xl'],
      paddingTop: spacing['3xl'],
    },
    profileCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: spacing['2xl'],
      padding: spacing['2xl'],
    },
    avatarCircle: {
      alignItems: 'center',
      backgroundColor: colors.primaryBg,
      borderRadius: 40,
      height: 80,
      justifyContent: 'center',
      marginBottom: spacing.md,
      width: 80,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: '700',
    },
    profileEmail: {
      marginBottom: spacing.xs,
    },
    profileJoined: {
      marginBottom: 0,
    },
    logoutSection: {
      marginTop: spacing.sm,
    },
    submitButton: {
      marginTop: spacing.lg,
    },
    errorText: {
      color: colors.error,
      marginBottom: spacing.sm,
      marginTop: spacing.xs,
    },
    switchRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    switchLink: {
      color: colors.primary,
      fontWeight: '600',
      marginLeft: spacing.xs,
    },
  });
}
