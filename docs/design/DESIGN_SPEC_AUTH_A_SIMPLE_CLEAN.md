# Auth 화면 A안 — Simple Clean 디자인 스펙

> **메인 이슈:** GON-132
> **디자인 이슈:** GON-133
> **작성일:** 2026-06-26
> **상태:** 설계 완료 (Dev 전달 준비)

---

## 1. 개요

현재 Auth 화면(로그인/회원가입)에 적용된 Coral Wave 리디자인을 유지하되, 사용자가 선택한 **A안 — Simple Clean** 방향으로 다음을 개선합니다.

### 변경 요약

| 항목 | AS-IS (Coral Wave) | TO-BE (Simple Clean) |
|------|-------------------|---------------------|
| 최상단 뒤로가기 버튼 | 없음 | 좌측 상단에 추가 |
| 하단 Wave 애니메이션 | 있음 (WaveAnimation) | 제거 |
| 전체 톤앤매너 | Coral / Warm Beige | 유지 |
| Auth 컴포넌트 구조 | AuthScreen 단일 | 공통 GoBackHeader 분리 가능 |
| 콘텐츠 하단 여백 | Wave에 가려짐 | 여백 정리 |

---

## 2. 뒤로가기 버튼 (GoBackHeader) 스펙

### 2.1 위치

```
┌──────────────────────────────┐
│ Status Bar (Safe Area top)   │
├──────────────────────────────┤
│ [←]                          │  ← 뒤로가기 버튼
│                              │     (좌측 정렬, 상단 여백 4px)
│       ♥ 공구위시             │  ← AuthHeader (기존 유지)
│   함께 사면 더 즐거운...      │
├──────────────────────────────┤
│  ┌──────┬──────┐             │
│  │로그인│회원가입│            │  ← Tab Bar (기존 유지)
│  └──────┴──────┘             │
│                              │
│  (AuthContentArea)           │
│                              │
└──────────────────────────────┘
```

### 2.2 상세 스펙

| 속성 | 값 | 비고 |
|------|-----|------|
| **배치** | `position: absolute`, top-left | AuthScreen container 기준 |
| **좌측 여백** | `paddingLeft: 8` (spacing.xs) | 화면 가장자리 기준 |
| **상단 여백** | `top: 8` (spacing.xs) | Safe Area top + 8px |
| **버튼 크기** | `44×44 pt` | WCAG 2.5.5 터치 타겟 ≥44px |
| **버튼 내 여백** | `padding: 10` | 아이콘 영역 |
| **아이콘** | `←` (유니코드) 또는 ArrowLeft SVG | `fontSize: 22` |
| **색상** | `#6b6560` (textTertiary) | 기존 Auth 폰트 색상과 통일 |
| **Press 효과** | `opacity: 0.7` | pressed 상태 |
| **배경** | `transparent` (버튼만) | |
| **z-index** | 컨텐츠 위에 배치 | Absolute positioning |
| **접근성** | `accessibilityRole="button"` / `accessibilityLabel="뒤로가기"` | |
| **동작** | `navigation.goBack()` | React Navigation 기본 |

### 2.3 AuthHeader와의 간격

뒤로가기 버튼은 AuthHeader 위에 절대 배치되므로 AuthHeader 자체는 수정하지 않습니다.
버튼이 AuthHeader의 `♥` 아이콘과 겹치지 않도록 AuthHeader의 기존 `paddingTop: 48` 값을 고려하여 버튼 상단을 Safe Area top + 8px로 설정합니다.

```
Status Bar (44px)
    ↓
[←]         (top: 52px = StatusBar 44px + 8px)
    ♥       (headerIcon: marginTop 영역)
  공구위시   (appName)
```

---

## 3. 하단 Wave 제거 스펙

### 3.1 제거 대상

- `AuthScreen.tsx` 내 `<WaveAnimation />` 컴포넌트 → 렌더링 제거
- `WaveAnimation` 함수 컴포넌트 (lines 874-932) → 보관 또는 삭제
- Wave 관련 스타일 (styles.waveContainer / waveSvg / waveShape / waveShapeSecond) → 정리

### 3.2 WaveAnimation 참조하는 요소

| 파일 | 위치 | 조치 |
|------|------|------|
| `AuthScreen.tsx` line 94 | `<WaveAnimation />` | 제거 |
| `AuthScreen.tsx` lines 874-932 | `WaveAnimation()` 함수 | 삭제 (향후 재사용 필요 시 별도 파일로 분리) |
| `AuthScreen.tsx` lines 1331-1357 | Wave 스타일 | 삭제 |
| `Dimensions` import | line 20 | WaveAnimation 삭제 시 import도 제거 |
| `Animated` import | line 17 | WaveAnimation 삭제 시 import도 제거 |
| `Easing` import | line 19 | WaveAnimation 삭제 시 import도 제거 |

### 3.3 Wave 제거 후 콘텐츠 하단 여백

현재 Wave가 `height: 80`을 차지하고 있습니다. Wave 제거 후:

- `ScrollView`의 `contentContainerStyle.paddingBottom`을 `16`으로 설정 (기존 `0`)
- 마지막 CTA 버튼과 화면 하단 사이 여백 확보
- `KeyboardAvoidingView` 하단 여백 자연스럽게 처리

---

## 4. 공통 GoBackHeader 컴포넌트 제안

### 4.1 구조

```tsx
// components/GoBackHeader.tsx
interface GoBackHeaderProps {
  /** 기본값: '뒤로가기' */
  accessibilityLabel?: string;
  /** 기본값: navigation.goBack() */
  onPress?: () => void;
  /** 아이콘 색상, 기본값: colors.textTertiary */
  color?: string;
}
```

### 4.2 배치 경로

`apps/mobile/src/components/GoBackHeader.tsx`

모든 Stack 화면(Detail, FeedDetail, CalendarScreen 등)에서 재사용 가능.

### 4.3 권장 구현

```tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GoBackHeaderProps {
  accessibilityLabel?: string;
  onPress?: () => void;
  color?: string;
}

export function GoBackHeader({
  accessibilityLabel = '뒤로가기',
  onPress,
  color = '#6b6560',
}: GoBackHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handlePress = onPress ?? (() => navigation.goBack());

  return (
    <Pressable
      style={[
        styles.button,
        { top: insets.top + 8, left: 8 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      hitSlop={8}
    >
      <Text style={[styles.icon, { color }]}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  icon: {
    fontSize: 22,
  },
});
```

### 4.4 재사용 시나리오

| 화면 | 적용 방법 |
|------|----------|
| `AuthScreen` (Login) | Stack 상단에 `<GoBackHeader />` 렌더링 |
| `DetailScreen` | 상단에 `<GoBackHeader />` 렌더링 |
| `FeedDetailScreen` | 상단에 `<GoBackHeader />` 렌더링 |
| `CalendarScreen` | 상단에 `<GoBackHeader />` 렌더링 |
| `InfluencerGroupBuysScreen` | 상단에 `<GoBackHeader />` 렌더링 |
| 기타 Stack 화면 | 동일한 패턴으로 적용 |

---

## 5. AuthScreen 구현 상세

### 5.1 AuthScreen 구조 변경 (TO-BE)

```tsx
export function AuthScreen(_props: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { backgroundColor: WARM_BG, paddingTop: insets.top }]}
      accessible
      accessibilityLabel="공구위시 로그인 화면"
    >
      <GoBackHeader />   {/* ← NEW: 뒤로가기 버튼 추가 */}

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
          <AuthTabs activeTab={activeTab} onSwitchTab={setActiveTab} />
          <AuthContentArea activeTab={activeTab} />
        </ScrollView>

        {/* ← WaveAnimation 제거 */}
      </KeyboardAvoidingView>
    </View>
  );
}
```

### 5.2 변경되지 않는 요소 (회귀 방지)

| 요소 | 유지 사항 |
|------|----------|
| 로그인/회원가입 탭 전환 | ✅ 그대로 유지 |
| 로그인 성공 후 goBack | ✅ 그대로 유지 (`navigation.goBack()`) |
| 소셜 로그인 버튼 (Kakao/Apple/Google) | ✅ 그대로 유지 |
| 비밀번호 표시 토글 | ✅ 그대로 유지 |
| 비밀번호 찾기 링크 | ✅ 그대로 유지 |
| 이메일/비밀번호 FloatingLabelInput | ✅ 그대로 유지 |
| 회원가입 3단계 Progressive Disclosure | ✅ 그대로 유지 |
| Zod 검증 | ✅ 그대로 유지 |
| 접근성 라벨 | ✅ 그대로 유지 (+ GoBackHeader 추가) |

---

## 6. Dev 전달 체크리스트

### 6.1 필수 구현 항목

- [ ] `components/GoBackHeader.tsx` 생성
  - [ ] `position: absolute` + `useSafeAreaInsets` 기반 배치
  - [ ] `accessibilityRole="button"`, `accessibilityLabel="뒤로가기"`
  - [ ] `hitSlop={8}` (터치 영역 44×44 확보)
  - [ ] `navigation.goBack()` 기본 동작
  - [ ] 외부 onPress prop 지원 (커스텀 핸들러)
- [ ] `AuthScreen.tsx` 최상단 GoBackHeader 추가
- [ ] `AuthScreen.tsx`에서 `<WaveAnimation />` 렌더링 제거
- [ ] `WaveAnimation` 함수 컴포넌트 및 관련 스타일 정리
- [ ] 사용하지 않는 `Animated`, `Easing`, `Dimensions` import 정리
- [ ] `scrollContent.paddingBottom` 하단 여백 조정 (16px 권장)
- [ ] TypeScript 타입체크 통과

### 6.2 검증 항목

- [ ] 뒤로가기 버튼이 AuthHeader와 겹치지 않음
- [ ] 하단 Wave 영역이 보이지 않음 (핑크색 장식 없음)
- [ ] 로그인 탭 전환 정상 동작
- [ ] 로그인 성공 후 goBack 정상 동작
- [ ] 회원가입 3단계 정상 동작
- [ ] 소셜 로그인 버튼 정상 동작
- [ ] 접근성 라벨 정상 적용
- [ ] iOS / Android 모두 정상 렌더링

### 6.3 선택적 개선

- [ ] `WaveAnimation` 코드를 별도 파일로 분리 후 삭제 (필요 없으면 제거)
- [ ] 기존 CORAL 하드코딩 색상을 shared token으로 대체 (장기 개선)

---

## 7. 설계 근거

### 7.1 뒤로가기 버튼을 absolute로 배치하는 이유

- AuthHeader 중앙 정렬(icon + title + subtitle) 구조를 유지하면서
- 최소한의 변경으로 뒤로가기 버튼을 추가할 수 있음
- AuthHeader의 레이아웃을 깨지 않음
- 컴포넌트 재사용성: `GoBackHeader`는 어느 화면에든 독립적으로 추가 가능

### 7.2 Wave를 제거하는 이유

- 화면 하단 80pt의 공간을 차지하여 실제 콘텐츠 영역을 압박
- 화려한 애니메이션이 로그인/회원가입이라는 본 기능에서 주의를 분산
- A안 Simple Clean 방향성과 일치 (심플하고 깔끔한 UX)

### 7.3 색상 유지

```
Coral (Primary): #ff385c  — 기존 브랜드 컬러 유지
Warm Beige BG:  #f5f0eb  — 따뜻한 배경 유지
Back Icon:      #6b6560  — 기존 textTertiary 계열 사용
```

---

## 8. 이슈 트래킹

| 의존성 | 상태 | 설명 |
|--------|------|------|
| GON-132 | 진행 중 | 부모 이슈 |
| GON-133 (Designer) | 완료 | ✅ 디자인 스펙 완료 |
| GON-134 (Dev) | 대기 | Dev 구현 시작 대기 |
| GON-135 (QA) | 대기 |
| GON-136 (Critic) | 대기 |
