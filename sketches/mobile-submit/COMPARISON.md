# 모바일 제보 화면 — 3가지 디자인 변형 비교

## 개요
기존 구현된 `SubmitScreen`(React Native)을 분석하여, **Instagram/Threads 스타일 디자인 시스템**을 준수하면서 사용성/접근성/브랜드 일관성을 높이는 3가지 방향성으로 목업 제작.

| Dimension | **001 Instagram Style** | **002 Clean Editorial** | **003 Dense Utilitarian** |
|-----------|------------------------|------------------------|---------------------------|
| **기반 레퍼런스** | Instagram, Threads 네이티브 | Notion, Linear, Cal.com | Superhuman, Linear, Raycast |
| **밀도** | 중간 (카드 래퍼, 여백 넉넉) | 낮음 (섹션 분리, 진행 바) | 높음 (래퍼 없음, 스티키 푸터) |
| **타이포그래피** | Geist 28/15/13px | DM Sans 32/16/14px | IBM Plex Sans 20/14/12px |
| **주 액션 가시성** | 높음 (하단 고정 버튼 쌍) | 높음 (대형 단일 버튼) | 높음 (스티키 푸터) |
| **검증 UX** | 실시간 인라인 + 포커스링 | 실시간 + 문자수 카운트 + 단계바 | 실시간 + 압축 텍스트 |
| **접근성** | 시맨틱 색상, 라벨 연결, ARIA | 진행률 ARIA, 필드셋 그룹핑 | 축약 텍스트, 키보드 중심 |
| **한 화면 필드 수** | ~4-5개 | ~3-4개 | ~6-7개 |
| **시각적 차별성** | 낮음 (기존 앱과 유사) | 중간 (부드러운 에디토리얼) | 높음 (도구적/전문적) |

---

## 🎯 추천: **001 Instagram Style** (기본) + **002 Clean Editorial** (웹/온보딩용)

### 이유
1. **프로젝트 요구사항 부합**: "Instagram/Threads 스타일 모던 소셜 앱 디자인 언어" 명시 → 001이 가장 충실
2. **앱/웹 통일성**: 모바일 앱(React Native)과 웹 어드민 모두에서 동일 컴포넌트 토큰 사용 가능
3. **사용자 친숙도**: 인스타그램/스레드 사용자는 별도 학습 없이 즉시 사용 가능
4. **접근성 기본 탑재**: 4.5:1 대비, 라벨-인풋 연결, 포커스 링, 시맨틱 색상 모두 충족

### 하이브리드 접근 제안
- **모바일 앱**: 001 Instagram Style을 기본으로 하되, 002의 **진행 단계 표시기**와 **필수/선택 섹션 분리** 아이디어 차용
- **웹 어드민(제보 등록 페이지 추후 구현 시)**: 002 Clean Editorial 적용 (더 넓은 화면, 에디토리얼 레이아웃 강점)
- **파워유저/관리자용 단축 경로**: 003 Dense Utilitarian을 "빠른 제보" 모드로 별도 제공 고려

---

## 다음 단계 (개발 핸드오프용)

### 1. 디자인 토큰 확정 (globals.css 확장)
```css
@theme {
  /* 기존 유지 */
  --color-primary-500: #4f63d7;  /* Instagram Blue */
  --color-success-500: #22c55e;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;

  /* 추가 제안 */
  --radius-sm: 8px;    /* 입력 필드 */
  --radius-md: 12px;   /* 카드, 버튼 */
  --radius-lg: 16px;   /* 모달, 시트 */
  --shadow-card: 0 2px 8px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04);
  --spacing-unit: 4px; /* 8px 그리드 = 2 units */
}
```

### 2. 공통 컴포넌트 스펙 (Figma DevMode로 전달)
| 컴포넌트 | Variants | States | Props Interface |
|----------|----------|--------|-----------------|
| `Button` | primary/secondary/ghost/destructive, sm/md/lg | default/hover/active/disabled/loading | `variant`, `size`, `disabled`, `loading`, `onPress` |
| `Input` | text/url/email/date/textarea | default/focus/error/disabled | `type`, `value`, `onChange`, `error`, `placeholder`, `label`, `hint`, `required` |
| `Card` | elevated/outlined/filled | default/selected | `variant`, `selected`, `children` |
| `Toast` | success/error/info | entering/exiting | `type`, `message`, `duration`, `onClose` |
| `Select` | single/multi/searchable | default/focus/error | `options`, `value`, `onChange`, `searchable` |
| `Modal/BottomSheet` | small/medium/full | open/closing | `size`, `open`, `onClose`, `title`, `children` |

### 3. 모바일 SubmitScreen 리팩토링 체크리스트
- [ ] `AdminInput` → 디자인 시스템 `Input` 컴포넌트로 교체 (label, hint, error, required props 지원)
- [ ] `Pressable` 버튼 → `Button` 컴포넌트 (loading 상태, variant 지원)
- [ ] 인라인 검증 → `useForm` 훅 + zod 스키마 연동 (공통 validation 로직)
- [ ] 토스트 → 공통 `ToastProvider` + `useToast` 훅
- [ ] 키보드 회피 → `KeyboardAvoidingView` + `useKeyboard` 훅
- [ ] 접근성: `accessibilityLabel`, `accessibilityHint`, `accessibilityRole` 모두 추가
- [ ] 다크 모드: 모든 색상 토큰 다크 대응 확인

### 4. 웹 어드민 `/admin/submissions` 페이지 개선 사항 (기반: 현재 구현 분석)
- [ ] `SubmissionCard` 필드명 스키마 일치 (`reporterName`, `isAnonymous`, `imageUrls[]` 등)
- [ ] 상태 배지 색상 → 디자인 토큰 시맨틱 색상 매핑
- [ ] 모달/바텀시트 상세 보기 → `Dialog`/`BottomSheet` 컴포넌트 통일
- [ ] 필터 탭 → `SegmentedControl` 컴포넌트
- [ ] 빈 상태/로딩/에러 → `EmptyState`/`Skeleton`/`Alert` 컴포넌트
- [ ] 반응형: 모바일 웹에서 카드 스택, 데스크톱에서 테이블/사이드바 레이아웃

---

## 파일 구조
```
sketches/mobile-submit/
├── 001-instagram-style/
│   ├── index.html      # 메인 목업 (열어서 확인)
│   └── README.md       # 이 문서
├── 002-clean-editorial/
│   ├── index.html
│   └── README.md
└── 003-dense-utilitarian/
    ├── index.html
    └── README.md
```

## 확인 방법
```bash
# macOS
open sketches/mobile-submit/001-instagram-style/index.html
open sketches/mobile-submit/002-clean-editorial/index.html
open sketches/mobile-submit/003-dense-utilitarian/index.html

# Linux
xdg-open sketches/mobile-submit/001-instagram-style/index.html
...

# Windows
start sketches/mobile-submit/001-instagram-style/index.html
```

각 파일은 완전한 인터랙션(실시간 검증, 토스트, 제출 플로우, 키보드 네비게이션) 포함. 브라우저에서 직접 테스트 가능.