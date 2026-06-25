/**
 * AuthScreen — Coral Wave Redesign
 *
 * Single-page Login / Signup screen with:
 *  - Tab switching (Login ↔ Signup)
 *  - Social login buttons (Kakao / Apple / Google)
 *  - Floating label inputs with Zod validation
 *  - Password visibility toggle & "Forgot password" link
 *  - 3-step Progressive Disclosure for signup
 *  - Agreement checkboxes (all-agree + required/optional)
 *  - Animated SVG Wave decoration
 *  - Responsive (mobile-first) + WCAG AA accessibility
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../design/tokens';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import type { ColorPalette } from '../context/ThemeContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import {
  loginSchema,
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
  AGREEMENTS,
  type LoginForm,
  type SignupStep1Form,
  type SignupStep2Form,
  type SignupStep3Form,
} from '../schemas/auth';

// ─── Types ──────────────────────────────────────────────────────────────────

type AuthTab = 'login' | 'signup';
type SignupStep = 1 | 2 | 3;

export type AuthScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// ─── Coral Wave Primary Color ───────────────────────────────────────────────

const CORAL = '#ff385c';
const CORAL_LIGHT = 'rgba(255, 56, 92, 0.12)';
const CORAL_EXTRA_LIGHT = 'rgba(255, 56, 92, 0.06)';
const CORAL_FOCUS = 'rgba(255, 56, 92, 0.28)';
const WARM_BG = '#f5f0eb';

// ─── Main Screen ────────────────────────────────────────────────────────────

export function AuthScreen(_props: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { backgroundColor: WARM_BG, paddingTop: insets.top }]}
      accessible
      accessibilityLabel="공구위시 로그인 화면"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader />
          <AuthTabs />
          <AuthContentArea />
        </ScrollView>

        <WaveAnimation />
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Header: App Icon + Name + Welcome ──────────────────────────────────────

function AuthHeader() {
  return (
    <View style={styles.header} accessible accessibilityLabel="공구위시">
      <View style={styles.headerIcon} accessibilityElementsHidden>
        <Text style={styles.headerIconText}>♥</Text>
      </View>
      <Text style={styles.appName}>
        공구<Text style={styles.appNameAccent}>위시</Text>
      </Text>
      <Text style={styles.welcomeText}>함께 사면 더 즐거운 공동구매</Text>
    </View>
  );
}

// ─── Tab Bar: Login / Signup ────────────────────────────────────────────────

function AuthTabs() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Expose active tab via context-like window ref so panels can read without prop drilling
  const switchTab = useCallback((tab: AuthTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <View style={styles.tabBar} accessible accessibilityLabel="인증 방식 선택">
      <Pressable
        accessible
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'login' }}
        accessibilityLabel="로그인 탭"
        accessibilityHint="이메일로 로그인합니다"
        onPress={() => switchTab('login')}
        style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
      >
        <Text style={[styles.tabBtnText, activeTab === 'login' && styles.tabBtnTextActive]}>
          로그인
        </Text>
      </Pressable>
      <Pressable
        accessible
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'signup' }}
        accessibilityLabel="회원가입 탭"
        accessibilityHint="새 계정을 만듭니다"
        onPress={() => switchTab('signup')}
        style={[styles.tabBtn, activeTab === 'signup' && styles.tabBtnActive]}
      >
        <Text style={[styles.tabBtnText, activeTab === 'signup' && styles.tabBtnTextActive]}>
          회원가입
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Auth Content Area ──────────────────────────────────────────────────────

function AuthContentArea() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  // Expose activeTab as a window property so children can read it
  useMemo(() => {
    try {
      (window as any).__authActiveTab = activeTab;
    } catch { /* ignore non-DOM env (test) */ }
  }, [activeTab]);

  return (
    <View>
      {activeTab === 'login' ? (
        <LoginPanel />
      ) : (
        <SignupPanel onSwitchToLogin={() => setActiveTab('login')} />
      )}
    </View>
  );
}

// ─── Login Panel ────────────────────────────────────────────────────────────

function LoginPanel() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = useCallback(async () => {
    setSubmitError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const authError = await signIn(result.data.email, result.data.password);
      if (authError) {
        setSubmitError(mapAuthErrorMessage(authError));
      }
    } catch {
      setSubmitError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }, [email, password, signIn]);

  const handleForgotPassword = useCallback(() => {
    // TODO: Navigate to password reset screen or show modal
  }, []);

  return (
    <View accessible accessibilityLabel="로그인">
      {/* Social Login */}
      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>간편 로그인</Text>
        <SocialButton
          label="카카오로 로그인"
          icon="💬"
          backgroundColor="#FEE500"
          textColor="#1a1a1a"
          accessibilityLabel="카카오로 로그인"
          onPress={() => {}}
        />
        <SocialButton
          label="Apple로 로그인"
          icon=""
          backgroundColor="#000000"
          textColor="#ffffff"
          iconStyle={styles.appleIcon}
          accessibilityLabel="Apple로 로그인"
          onPress={() => {}}
        />
        <SocialButton
          label="Google로 로그인"
          icon="G"
          backgroundColor="#ffffff"
          textColor="#1a1a1a"
          borderColor={colors.border}
          iconStyle={styles.googleIcon}
          accessibilityLabel="Google로 로그인"
          onPress={() => {}}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} accessible accessibilityRole="none">
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는 이메일 로그인</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email Form */}
      <View>
        <FloatingLabelInput
          label="이메일"
          value={email}
          onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          error={errors.email}
          editable={!submitting}
        />
        <FloatingLabelInput
          label="비밀번호"
          value={password}
          onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="current-password"
          error={errors.password}
          editable={!submitting}
          rightElement={
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              accessibilityState={{ selected: showPassword }}
              onPress={() => setShowPassword((p) => !p)}
              style={s.pwToggle}
              hitSlop={8}
            >
              <Text style={s.pwToggleIcon}>
                {showPassword ? '🙈' : '👁'}
              </Text>
            </Pressable>
          }
        />

        <View style={styles.pwOptions}>
          <Pressable
            accessible
            accessibilityRole="button"
            accessibilityLabel="비밀번호 찾기"
            onPress={handleForgotPassword}
            hitSlop={8}
          >
            <Text style={styles.forgotLink}>비밀번호를 잊으셨나요?</Text>
          </Pressable>
        </View>

        {submitError ? (
          <Text style={[s.errorText, { marginBottom: 12, marginTop: 4 }]}>
            {submitError}
          </Text>
        ) : null}

        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="로그인"
          accessibilityState={{ disabled: submitting }}
          onPress={handleLogin}
          disabled={submitting}
          style={({ pressed }) => [
            styles.ctaBtn,
            submitting && styles.ctaBtnDisabled,
            pressed && !submitting && styles.ctaBtnPressed,
          ]}
        >
          <Text style={styles.ctaBtnText}>
            {submitting ? '로그인 중...' : '로그인'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Signup Panel (3-Step Progressive Disclosure) ──────────────────────────

function SignupPanel({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { signUp } = useAuth();

  const [step, setStep] = useState<SignupStep>(1);

  // Step 1 state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof SignupStep1Form, string>>>({});

  // Step 2 state
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [step2Errors, setStep2Errors] = useState<Partial<Record<keyof SignupStep2Form, string>>>({});

  // Step 3 state
  const [agreements, setAgreements] = useState<Record<string, boolean>>({
    agreeAll: false,
    agreeService: false,
    agreePrivacy: false,
    agreeMarketing: false,
    agreeAge: false,
  });
  const [step3Errors, setStep3Errors] = useState<Partial<Record<keyof SignupStep3Form, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Step navigation ─────────────────────────────────────────────────────

  const goToNextStep = useCallback(() => {
    if (step === 1) {
      const result = signupStep1Schema.safeParse({ email, password, confirmPassword });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setStep1Errors(fieldErrors);
        return;
      }
      setStep1Errors({});
      setStep(2);
    } else if (step === 2) {
      const result = signupStep2Schema.safeParse({ nickname, phone });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setStep2Errors(fieldErrors);
        return;
      }
      setStep2Errors({});
      setStep(3);
    }
  }, [step, email, password, confirmPassword, nickname, phone]);

  const goToPrevStep = useCallback((target: SignupStep) => {
    setStep(target);
  }, []);

  // ── Agreement handling ───────────────────────────────────────────────────

  const toggleAllAgree = useCallback((checked: boolean) => {
    setAgreements((prev) => ({
      ...prev,
      agreeAll: checked,
      agreeService: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
      agreeAge: checked,
    }));
  }, []);

  const toggleAgree = useCallback((key: string, checked: boolean) => {
    setAgreements((prev) => {
      const next = { ...prev, [key]: checked };
      const requiredKeys = AGREEMENTS.filter((a) => a.required).map((a) => a.key);
      const allRequiredChecked = requiredKeys.every((k) => next[k] === true);
      next.agreeAll = allRequiredChecked;
      return next;
    });
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleCompleteSignup = useCallback(async () => {
    setSubmitError(null);
    const agreeData: Record<string, boolean> = {};
    for (const a of AGREEMENTS) {
      agreeData[a.key] = agreements[a.key] ?? false;
    }
    const result = signupStep3Schema.safeParse(agreeData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setStep3Errors(fieldErrors);
      return;
    }
    setStep3Errors({});

    setSubmitting(true);
    try {
      const authError = await signUp(email, password);
      if (authError) {
        setSubmitError(mapAuthErrorMessage(authError));
      } else {
        // On success, switch to login tab
        onSwitchToLogin();
      }
    } catch {
      setSubmitError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }, [email, password, agreements, signUp, onSwitchToLogin]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View accessible accessibilityLabel="회원가입">
      {/* Step Progress */}
      <View
        style={styles.stepProgress}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ now: step, min: 1, max: 3 }}
        accessibilityLabel="회원가입 진행 단계"
      >
        {([1, 2, 3] as const).map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              step === s && styles.stepDotActive,
              step > s && styles.stepDotDone,
            ]}
          />
        ))}
      </View>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <View accessible accessibilityLabel="1단계: 기본 정보">
          <Text style={styles.stepTitle}>기본 정보</Text>
          <Text style={styles.stepDesc}>공구위시 가입을 위한 기본 정보를 입력해주세요</Text>

          <FloatingLabelInput
            label="이메일"
            value={email}
            onChangeText={(t) => { setEmail(t); setStep1Errors((e) => ({ ...e, email: '' })); }}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
            error={step1Errors.email}
            editable={!submitting}
          />
          <FloatingLabelInput
            label="비밀번호 (8자 이상, 영문+숫자 포함)"
            value={password}
            onChangeText={(t) => { setPassword(t); setStep1Errors((e) => ({ ...e, password: '' })); }}
            secureTextEntry={!showPw}
            autoCapitalize="none"
            autoComplete="new-password"
            error={step1Errors.password}
            editable={!submitting}
            rightElement={
              <Pressable
                accessible
                accessibilityRole="button"
                accessibilityLabel={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                onPress={() => setShowPw((p) => !p)}
                style={s.pwToggle}
                hitSlop={8}
              >
                <Text style={s.pwToggleIcon}>
                  {showPw ? '🙈' : '👁'}
                </Text>
              </Pressable>
            }
          />
          <FloatingLabelInput
            label="비밀번호 확인"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setStep1Errors((e) => ({ ...e, confirmPassword: '' })); }}
            secureTextEntry={!showConfirmPw}
            autoCapitalize="none"
            autoComplete="new-password"
            error={step1Errors.confirmPassword}
            editable={!submitting}
            rightElement={
              <Pressable
                accessible
                accessibilityRole="button"
                accessibilityLabel={showConfirmPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                onPress={() => setShowConfirmPw((p) => !p)}
                style={s.pwToggle}
                hitSlop={8}
              >
                <Text style={s.pwToggleIcon}>
                  {showConfirmPw ? '🙈' : '👁'}
                </Text>
              </Pressable>
            }
          />

          <View style={styles.stepNav}>
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel="다음 단계"
              onPress={goToNextStep}
              disabled={submitting}
              style={({ pressed }) => [styles.stepNavBtn, styles.stepNavBtnPrimary, pressed && styles.ctaBtnPressed]}
            >
              <Text style={styles.stepNavBtnPrimaryText}>다음</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Step 2: Additional Info */}
      {step === 2 && (
        <View accessible accessibilityLabel="2단계: 추가 정보">
          <Text style={styles.stepTitle}>추가 정보</Text>
          <Text style={styles.stepDesc}>공구위시에서 사용할 프로필 정보를 입력해주세요</Text>

          <FloatingLabelInput
            label="닉네임"
            value={nickname}
            onChangeText={(t) => { setNickname(t); setStep2Errors((e) => ({ ...e, nickname: '' })); }}
            autoCapitalize="none"
            autoComplete="name"
            error={step2Errors.nickname}
            editable={!submitting}
          />
          <FloatingLabelInput
            label="휴대폰 번호 (선택)"
            value={phone}
            onChangeText={(t) => { setPhone(t); setStep2Errors((e) => ({ ...e, phone: '' })); }}
            autoCapitalize="none"
            autoComplete="tel"
            keyboardType="phone-pad"
            inputMode="numeric"
            error={step2Errors.phone}
            editable={!submitting}
          />

          <View style={styles.stepNav}>
            <Pressable
              accessible
              accessibilityRole="button"
              onPress={() => goToPrevStep(1)}
              disabled={submitting}
              style={({ pressed }) => [styles.stepNavBtn, styles.stepNavBtnSecondary, pressed && styles.btnPressed]}
            >
              <Text style={styles.stepNavBtnSecondaryText}>이전</Text>
            </Pressable>
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel="다음 단계"
              onPress={goToNextStep}
              disabled={submitting}
              style={({ pressed }) => [styles.stepNavBtn, styles.stepNavBtnPrimary, { flex: 2 }, pressed && styles.ctaBtnPressed]}
            >
              <Text style={styles.stepNavBtnPrimaryText}>다음</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Step 3: Agreement */}
      {step === 3 && (
        <View accessible accessibilityLabel="3단계: 약관 동의">
          <Text style={styles.stepTitle}>약관 동의</Text>
          <Text style={styles.stepDesc}>서비스 이용을 위해 약관에 동의해주세요</Text>

          {/* All agree toggle */}
          <View style={styles.agreeGroup}>
            <Pressable
              accessible
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreements.agreeAll }}
              accessibilityLabel="전체 동의하기"
              onPress={() => toggleAllAgree(!agreements.agreeAll)}
              style={[styles.agreeItem, styles.agreeAll]}
            >
              <View style={[styles.checkbox, agreements.agreeAll && styles.checkboxChecked]}>
                {agreements.agreeAll && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.agreeLabelAll}>
                <Text style={styles.agreeLabelBold}>전체 동의하기</Text>
              </Text>
            </Pressable>

            {AGREEMENTS.map((item) => (
              <Pressable
                key={item.key}
                accessible
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreements[item.key] ?? false }}
                accessibilityLabel={`${item.label}${item.required ? ' (필수)' : ' (선택)'}`}
                onPress={() => toggleAgree(item.key, !agreements[item.key])}
                style={styles.agreeItem}
              >
                <View style={[styles.checkbox, agreements[item.key] && styles.checkboxChecked]}>
                  {agreements[item.key] && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.agreeLabel}>{item.label}</Text>
                {item.detailLink && (
                  <Pressable
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`${item.label} 내용 보기`}
                    onPress={() => {}}
                    hitSlop={8}
                  >
                    <Text style={styles.agreeDetail}>보기</Text>
                  </Pressable>
                )}
              </Pressable>
            ))}
          </View>

          {Object.keys(step3Errors).length > 0 && (
            <Text style={[s.errorText, { marginBottom: 12 }]}>
              {Object.values(step3Errors)[0]}
            </Text>
          )}

          {submitError ? (
            <Text style={[s.errorText, { marginBottom: 12 }]}>
              {submitError}
            </Text>
          ) : null}

          <View style={styles.stepNav}>
            <Pressable
              accessible
              accessibilityRole="button"
              onPress={() => goToPrevStep(2)}
              disabled={submitting}
              style={({ pressed }) => [styles.stepNavBtn, styles.stepNavBtnSecondary, pressed && styles.btnPressed]}
            >
              <Text style={styles.stepNavBtnSecondaryText}>이전</Text>
            </Pressable>
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel="가입 완료"
              accessibilityState={{ disabled: submitting }}
              onPress={handleCompleteSignup}
              disabled={submitting}
              style={({ pressed }) => [
                styles.stepNavBtn,
                styles.stepNavBtnPrimary,
                { flex: 2 },
                pressed && styles.ctaBtnPressed,
                submitting && styles.ctaBtnDisabled,
              ]}
            >
              <Text style={styles.stepNavBtnPrimaryText}>
                {submitting ? '가입 처리 중...' : '가입 완료'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Social Login Button ────────────────────────────────────────────────────

function SocialButton({
  label,
  icon,
  backgroundColor,
  textColor,
  borderColor,
  iconStyle,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  iconStyle?: TextStyle;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialBtn,
        {
          backgroundColor,
          borderWidth: borderColor ? 1 : 0,
          borderColor: borderColor ?? 'transparent',
        },
        pressed && styles.socialBtnPressed,
      ]}
    >
      <View style={styles.socialIcon}>
        <Text style={[{ color: textColor, fontSize: 18 }, iconStyle]}>
          {icon}
        </Text>
      </View>
      <Text style={[styles.socialLabel, { color: textColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Floating Label Input ───────────────────────────────────────────────────

type FloatingLabelInputProps = TextInputProps & {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
};

function FloatingLabelInput({
  label,
  value,
  error,
  rightElement,
  style,
  ...inputProps
}: FloatingLabelInputProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const hasValue = typeof value === 'string' && value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <View style={styles.flField}>
      <View
        style={[
          styles.flInputWrapper,
          { borderColor: colors.border, backgroundColor: '#ffffff' },
          isFocused && styles.flInputFocused,
          error && styles.flInputError,
          hasValue && !error && styles.flInputSuccess,
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          placeholder=" "
          style={[styles.flInput, { color: colors.textPrimary }, rightElement ? { paddingRight: 44 } : undefined, style]}
          placeholderTextColor="transparent"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label}
          {...inputProps}
        />
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={styles.flLabelTouchable}
        >
          <Text
            style={[
              styles.flLabel,
              { color: colors.textTertiary },
              isFloating && styles.flLabelFloating,
              isFocused && styles.flLabelFocused,
              error && styles.flLabelError,
              hasValue && !error && !isFocused && styles.flLabelSuccess,
            ]}
          >
            {label}
          </Text>
        </Pressable>
        {rightElement}
      </View>
      {error ? (
        <Text style={styles.flMsg}>{error}</Text>
      ) : (
        <View style={styles.flMsgPlaceholder} />
      )}
    </View>
  );
}

// ─── Wave Animation ─────────────────────────────────────────────────────────

function WaveAnimation() {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { width: winWidth } = Dimensions.get('window');

  useMemo(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animatedValue]);

  const translateX1 = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -winWidth * 0.5],
  });

  const translateX2 = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-winWidth * 0.25, -winWidth * 0.75],
  });

  return (
    <View style={styles.waveContainer} pointerEvents="none" accessibilityElementsHidden>
      <Animated.View
        style={[
          styles.waveSvg,
          { transform: [{ translateX: translateX1 }] },
        ]}
      >
        <View style={[styles.waveShape, { backgroundColor: CORAL_LIGHT }]} />
      </Animated.View>
      <Animated.View
        style={[
          styles.waveSvg,
          {
            transform: [{ translateX: translateX2 }],
            opacity: 0.4,
          },
        ]}
      >
        <View style={[styles.waveShapeSecond, { backgroundColor: CORAL_EXTRA_LIGHT }]} />
      </Animated.View>
    </View>
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

// ─── Style helpers that depend on theme ──────────────────────────────────────

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    pwToggle: {
      position: 'absolute',
      right: 14,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      padding: 4,
    },
    pwToggleIcon: {
      fontSize: 18,
      color: colors.textTertiary,
    },
    errorText: {
      color: colors.error,
      fontSize: 13,
    },
  });

// ─── Static Styles (no theme dependency) ─────────────────────────────────────

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 0,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    width: 52,
    height: 52,
    backgroundColor: CORAL,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  headerIconText: {
    fontSize: 26,
    color: '#ffffff',
  },
  appName: {
    fontWeight: '800',
    fontSize: 22,
    color: '#1c1b1a',
    letterSpacing: -0.5,
  },
  appNameAccent: {
    color: CORAL,
    fontWeight: '800',
    fontSize: 22,
  },
  welcomeText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#6b6560',
    marginTop: 6,
    letterSpacing: -0.2,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: CORAL,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8c8681',
  },
  tabBtnTextActive: {
    color: '#ffffff',
  },

  // Social section
  socialSection: {
    gap: 10,
    marginBottom: 20,
  },
  socialTitle: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: '#8c8681',
    marginBottom: 4,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8e3de',
  },
  dividerText: {
    fontSize: 12,
    color: '#8c8681',
    fontWeight: '500',
  },

  // CTA Button
  ctaBtn: {
    width: '100%',
    height: 54,
    backgroundColor: CORAL,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  ctaBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  ctaBtnPressed: {
    opacity: 0.85,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },

  // Floating label input
  flField: {
    marginBottom: 4,
  },
  flInputWrapper: {
    position: 'relative',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
  },
  flInputFocused: {
    borderColor: CORAL,
    shadowColor: CORAL_FOCUS,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
  flInputError: {
    borderColor: '#d93f4c',
    shadowColor: 'rgba(217, 63, 76, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  flInputSuccess: {
    borderColor: '#2d9c5e',
    shadowColor: 'rgba(45, 156, 94, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  flInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  flLabelTouchable: {
    position: 'absolute',
    left: 16,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  flLabel: {
    position: 'absolute',
    left: 16,
    top: 18,
    fontSize: 15,
  },
  flLabelFloating: {
    top: 6,
    fontSize: 11,
    fontWeight: '600',
  },
  flLabelFocused: {
    color: CORAL,
  },
  flLabelError: {
    color: '#d93f4c',
  },
  flLabelSuccess: {
    color: '#2d9c5e',
  },
  flMsg: {
    fontSize: 12,
    color: '#d93f4c',
    marginTop: 4,
    paddingLeft: 4,
  },
  flMsgPlaceholder: {
    height: 18,
  },

  // Password options
  pwOptions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b6560',
  },

  // ── Signup Steps ──

  stepProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d6d0ca',
  },
  stepDotActive: {
    backgroundColor: CORAL,
    width: 28,
    borderRadius: 4,
  },
  stepDotDone: {
    backgroundColor: '#2d9c5e',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1b1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  stepDesc: {
    fontSize: 13,
    color: '#6b6560',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  stepNav: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  stepNavBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNavBtnPrimary: {
    backgroundColor: CORAL,
    borderWidth: 0,
  },
  stepNavBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepNavBtnSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#d6d0ca',
  },
  stepNavBtnSecondaryText: {
    color: '#6b6560',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.8,
  },

  // ── Agreement ──

  agreeGroup: {
    gap: 12,
    marginBottom: 20,
  },
  agreeAll: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e3de',
  },
  agreeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#d6d0ca',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: CORAL,
    borderColor: CORAL,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  agreeLabelAll: {
    fontSize: 14,
    color: '#1c1b1a',
    flex: 1,
  },
  agreeLabelBold: {
    fontWeight: '700',
  },
  agreeLabel: {
    fontSize: 14,
    color: '#1c1b1a',
    flex: 1,
    letterSpacing: -0.2,
  },
  agreeDetail: {
    fontSize: 12,
    color: '#8c8681',
  },

  // ── Social Button Styles ──

  appleIcon: {
    fontSize: 22,
  },
  googleIcon: {
    fontWeight: '700',
    fontSize: 16,
    color: '#4285F4',
  },

  // ── Wave ──

  waveContainer: {
    height: 80,
    marginHorizontal: -28,
    overflow: 'hidden',
    position: 'relative',
  },
  waveSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '200%',
    height: '100%',
  },
  waveShape: {
    flex: 1,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 300,
    marginTop: -40,
  },
  waveShapeSecond: {
    flex: 1,
    borderTopLeftRadius: 300,
    borderTopRightRadius: 200,
    marginTop: -30,
  },

  // Social buttons
  socialBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  socialBtnPressed: {
    opacity: 0.85,
  },
  socialIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
    paddingRight: 28,
  },
});
