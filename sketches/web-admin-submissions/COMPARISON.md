# 웹 어드민 제보 검수 페이지 — 3가지 디자인 변형 비교

## 개요
기존 구현된 `AdminSubmissionsPage`(Next.js + Tailwind)를 분석하여, **Instagram/Threads 스타일 디자인 시스템**을 준수하면서 관리자 업무 효율/확장성/접근성을 높이는 3가지 방향성으로 목업 제작.

| Dimension | **001 Instagram Style** | **002 Clean Editorial** | **003 Dense Utilitarian** |
|-----------|------------------------|------------------------|---------------------------|
| **기반 레퍼런스** | Instagram Web, Threads Web | Notion, Linear, Cal.com, Mintlify | Superhuman, Linear, Raycast, Warp |
| **레이아웃** | 사이드바 + 카드 리스트 + 확장 패널 | 사이드바 + 데이터 테이블 + 모달 | 사이드바 + 테이블 + 우측 사이드 패널 |
| **밀도** | 중간 (카드, 여백 넉넉) | 중간-높음 (테이블, 페이지네이션) | 높음 (컴팩트 토글, 사이드 패널) |
| **타이포그래피** | Geist 28/16/14/11px | DM Sans 32/14/13/12px | IBM Plex Sans 18/13/12/11/10px + Mono |
| **주 액션** | 카드 내 인라인 버튼 | 행 버튼 + 모달 상세 | 행 버튼 + 사이드 패널 |
| **상세 보기** | 카드 확장 (아코디언) | 모달 다이얼로그 | 우측 슬라이드오버 패널 |
| **검색/필터** | 칩 필터만 | 칩 필터 + 검색 박스 | 칩 필터 + 검색 + 밀도 토글 |
| **다중 선택** | 미지원 | 체크박스 + 전체 선택 | 체크박스 + 전체 선택 |
| **페이지네이션** | 없음 (전체 렌더) | 있음 | 있음 |
| **모바일 대응** | 사이드바 드로어, 카드 스택 | 테이블 가로 스크롤 | 사이드바 드로어, 사이드 패널 풀스크린 |
| **접근성** | 시맨틱 색상, ARIA, 포커스 링 | 테이블 ARIA, 모달 포커스 트랩 | 키보드 네비게이션, 사이드 패널 포커스 |
| **확장성** | ~50건 적합 | ~500건 적합 (페이징) | ~1000+건 적합 (고밀도) |

---

## 🎯 추천: **하이브리드 접근 (001 + 002 결합)**

### 이유
1. **프로젝트 요구사항**: "Instagram/Threads 스타일" 명시 → 001이 브랜드 일관성에 최적
2. **현재 구현 분석**: 기존 `AdminSubmissionsPage`는 이미 카드 리스트 + 아코디언 확장 형태 → 001이 자연스러운 진화
3. **실제 운영 규모**: 일일 제보 수 고려 시 002의 페이지네이션/검색은 필수 기능
4. **모바일 어드민**: 반응형 카드 레이아웃(001)이 모바일 웹에서 더 사용하기 좋음

### 권장 하이브리드 스펙
```
기반: 001 Instagram Style (카드 리스트, 아코디언 확장, 시맨틱 색상)
+ 002 기능 추가:
  - 검색 박스 (제품명/브랜드/제보자)
  - 페이지네이션 (페이지당 20건)
  - 다중 선택 체크박스 (일괄 승인/반려 미래 확장)
  - 정렬 옵션 (최신순, 상태순, 제품명순)
+ 003 아이디어 차용:
  - 밀도 설정 (컴팩트/컴포트 토글) → 카드 간격 조절
  - 키보드 단축키 힌트 (Enter: 상세, A: 승인, R: 반려)
```

---

## 다음 단계 (개발 핸드오프용)

### 1. 디자인 토큰 확정 (globals.css 확장)
```css
@theme {
  /* 기존 유지 */
  --color-primary-500: #4f63d7;
  --color-success-500: #22c55e;
  --color-warning-500: #f59e0b;
  --color-error-500: #ef4444;

  /* Admin 전용 추가 */
  --sidebar-width: 260px;
  --header-height: 64px;
  --card-gap: 16px;
  --density-compact: 8px;    /* 카드 간격 */
  --density-comfortable: 16px;

  /* 상태 배지 시맨틱 매핑 */
  --status-pending: #f59e0b;
  --status-approved: #22c55e;
  --status-rejected: #ef4444;
  --status-review: #3b82f6;
  --status-duplicate: #9ca3af;
}
```

### 2. 공통 컴포넌트 스펙 (Figma DevMode로 전달)
| 컴포넌트 | Variants | States | Props Interface |
|----------|----------|--------|-----------------|
| `Sidebar` | fixed/collapsed/drawer | open/closed | `items`, `activeItem`, `onNavigate`, `collapsed` |
| `FilterChips` | status/search/sort | active/hover/disabled | `options`, `value`, `onChange`, `searchable` |
| `SubmissionCard` | default/expanded/selected | hover/focus/loading | `submission`, `expanded`, `selected`, `onToggle`, `onApprove`, `onReject`, `onSave`, `onView` |
| `SidePanel` / `Modal` | small/medium/large/full | open/closing | `size`, `open`, `onClose`, `title`, `children`, `footer` |
| `DataTable` | dense/comfortable | sorting/filtering/paging | `columns`, `data`, `selection`, `onSort`, `onPageChange`, `rowActions` |
| `StatusBadge` | pending/approved/rejected/review/duplicate | default | `status`, `label` (자동 매핑) |
| `Toast` | success/error/info/warning | entering/exiting | `type`, `message`, `duration`, `action` |

### 3. 현재 AdminSubmissionsPage 리팩토링 체크리스트
- [ ] `SubmissionCard` 필드명 스키마 완전 일치 (`reporterName`, `isAnonymous`, `imageUrls[]`, `groupBuy` relation)
- [ ] 상태 배지 → 디자인 토큰 시맨틱 색상(`--status-*`) 매핑
- [ ] 아코디언 확장 → `Collapsible` 컴포넌트로 분리 (애니메이션, 키보드 지원)
- [ ] 인라인 편집 폼 → `FormField` 배열로 선언형 렌더링 (zod 스키마 연동)
- [ ] 승인/반려 모달 → `Dialog`/`SidePanel` 컴포넌트 통일 (포커스 트랩, ESC 닫기)
- [ ] 필터 칩 → `SegmentedControl` + `SearchInput` 컴포넌트
- [ ] 페이지네이션/정렬/검색 → `useTable` 훅으로 상태 관리
- [ ] 빈 상태/로딩/에러 → `EmptyState`/`Skeleton`/`Alert` 컴포넌트
- [ ] 반응형: < 900px 사이드바 드로어, 카드 스택 레이아웃
- [ ] 접근성: `role="grid"`/`row`/`cell`, `aria-selected`, `aria-expanded`, 키보드 네비게이션 완비
- [ ] 다크 모드: 모든 색상 토큰 다크 대응, 상태 배지 대비 4.5:1 확보

### 4. API 연동 타입 (기존 `@gonggu/shared/hooks` 확장)
```typescript
// hooks/useSubmissions.ts 확장
interface UseSubmissionsOptions {
  status?: SubmissionStatus | 'ALL';
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'productName' | 'status';
  sortOrder?: 'asc' | 'desc';
}

interface UseSubmissionsResult {
  data: Submission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

// hooks/useModerateSubmission.ts
interface ModerateVariables {
  id: string;
  action: { action: 'approve' | 'reject'; reason?: string };
}

// hooks/useUpdateSubmission.ts
interface UpdateVariables {
  id: string;
  data: Partial<SubmissionReviewForm>;
}
```

---

## 파일 구조
```
sketches/web-admin-submissions/
├── 001-instagram-style/
│   ├── index.html      # 카드 리스트 + 아코디언 확장 (메인 권장)
│   └── README.md
├── 002-clean-editorial/
│   ├── index.html      # 데이터 테이블 + 모달 상세 + 페이지네이션
│   └── README.md
├── 003-dense-utilitarian/
│   ├── index.html      # 고밀도 테이블 + 우측 사이드 패널 + 밀도 토글
│   └── README.md
└── COMPARISON.md       # 이 파일
```

## 확인 방법
```bash
# macOS
open sketches/web-admin-submissions/001-instagram-style/index.html
open sketches/web-admin-submissions/002-clean-editorial/index.html
open sketches/web-admin-submissions/003-dense-utilitarian/index.html

# Linux
xdg-open sketches/web-admin-submissions/001-instagram-style/index.html
...

# Windows
start sketches/web-admin-submissions/001-instagram-style/index.html
```

각 파일은 완전한 인터랙션(필터/검색/페이지네이션, 카드 확장/편집, 승인/반려 모달/사이드 패널, 토스트, 키보드 네비게이션) 포함. 브라우저에서 직접 테스트 가능.