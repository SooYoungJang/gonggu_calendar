# 🗺️ 관리자 페이지 IA & 플로우 정의서

**작성일**: 2026-06-16
**버전**: v1.1
**상태**: 초안

---

## 1. 관리자 전체 IA (Information Architecture)

```
/admin                                   [로그인 필요: x-admin-token]
├── /dashboard                           📊 대시보드 (홈)
│   ├── 상단: StatCards (4개)            신규제보 | 승인율 | 처리대기 | 반려율
│   ├── 중간: Chart (일별 제보 추이)     LineChart + BarChart
│   └── 하단: RecentActivity (최근 10건)  실시간 활동 피드
│
├── /submissions                         📋 제보 검수
│   ├── 상단: FilterBar                  FilterChips + SearchInput + DateRange
│   ├── 중간: SubmissionCard[]           카드 리스트 (Pinterest 스타일)
│   │   └── 확장 시: 상세 패널           아코디언 확장
│   │       ├── 제보 정보 섹션           제목, URL, 날짜, 설명, 이미지
│   │       ├── 검수 폼 섹션            승인/반려 select + 메모 textarea + 저장 버튼
│   │       └── 히스토리 섹션           처리 이력 (승인/반려/상태 변경 로그)
│   └── 하단: Pagination / LoadMore
│
├── /group-buys                          🛒 공구 관리 (향후)
│   ├── DataTable                         전체 공구 목록
│   └── 상세 모달                         공구 상세 + 수정
│
├── /influencers                         🏆 인플루언서 관리 (향후)
│   ├── DataTable                         인플루언서 목록
│   └── 상세 페이지                       인플루언서 상세 + 공구 히스토리
│
└── /settings                            ⚙️ 설정 (향후)
    ├── 관리자 계정 관리
    └── 시스템 설정
```

---

## 2. 주요 사용자 플로우

### 2.1 Flow A: 제보 검수 (승인/반려)

```
[접근] /admin/submissions
    │
    ├── FilterBar 필터 설정 (선택)
    │   ├── 상태: 전체 / PENDING / APPROVED / REJECTED
    │   ├── 검색: 키워드 검색 (제목, 설명)
    │   └── 날짜: 시작일 ~ 종료일
    │
    ├── SubmissionCard 목록 조회
    │   ├── 요약 정보: 제목, 상태 배지, 제보일시
    │   ├── 호버 시: 그림자 효과 + 미리보기
    │   └── 클릭 시: 아코디언 확장
    │
    ├── [확장] 상세 정보 조회
    │   ├── 제보 정보 섹션
    │   │   ├── 제목 (링크 복사)
    │   │   ├── 상품 URL (외부 링크 새탭)
    │   │   ├── 공구 기간 (시작일 ~ 종료일)
    │   │   ├── 설명 (텍스트)
    │   │   └── 첨부 이미지 (확대 가능)
    │   ├── 검수 폼 섹션
    │   │   ├── 승인 시: GroupBuy 전환 필드
    │   │   │   ├── 확정 제목 (자동 채움, 수정 가능)
    │   │   │   ├── 확정 이미지 URL
    │   │   │   ├── 인플루언서 선택 (드롭다운)
    │   │   │   ├── 카테고리 선택
    │   │   │   └── 메모 (선택)
    │   │   ├── 반려 시:
    │   │   │   ├── 반려 사유 (필수 select + text)
    │   │   │   └── 메모 (선택)
    │   │   └── 확인 버튼: 승인 / 반려
    │   └── 히스토리 섹션
    │       └── 처리 이력 리스트 (날짜, 처리자, 액션, 메모)
    │
    └── [완료] Toast 알림
        ├── 성공: "승인 완료" / "반려 완료"
        └── 실패: "처리 중 오류가 발생했습니다"
```

### 2.2 Flow B: 대시보드 모니터링

```
[접근] /admin/dashboard
    │
    ├── [진입 시] 자동 데이터 로딩
    │   ├── GET /admin/stats/summary      → StatCards
    │   ├── GET /admin/stats/daily        → Chart
    │   └── GET /admin/activities/latest  → RecentActivity
    │
    ├── StatCards 섹션 (4개)
    │   ├── 신규 제보 (오늘 기준)
    │   │   ├── 숫자: N건
    │   │   ├── 추세: ↑↓ 전일 대비
    │   │   └── 아이콘: 상태별 컬러
    │   ├── 승인율 (이번주)
    │   │   ├── 숫자: N%
    │   │   └── 게이지 바
    │   ├── 처리 대기 (현재)
    │   │   ├── 숫자: N건
    │   │   └── 클릭 시: /admin/submissions?status=PENDING
    │   └── 반려율 (이번주)
    │       ├── 숫자: N%
    │       └── 막대 그래프 미니
    │
    ├── Chart 섹션 (일별/주별 제보 추이)
    │   ├── 탭: 일별 | 주별 | 월별
    │   ├── LineChart: 제보 접수 추이
    │   ├── BarChart: 승인/반려 비율
    │   └── 툴팁: 호버 시 상세값
    │
    └── RecentActivity 섹션
        ├── 최근 10건 활동 피드
        │   ├── 타임라인 형식
        │   ├── 액션: 제보접수 / 승인 / 반려 / 상태변경
        │   ├── 대상: 제보 제목 링크
        │   └── 시간: 상대 시간 표시 (3분 전, 1시간 전)
        └── "더 보기" 링크 → /admin/submissions
```

### 2.3 Flow C: 새로운 제보 알림 (실시간)

```
[백그라운드] 폴링 또는 WebSocket
    │
    ├── 새로운 제보 감지
    │   ├── 헤더: 배지 카운트 업데이트 (1+)
    │   ├── Toast 알림: "새로운 제보가 접수되었습니다"
    │   └── Toast 액션: "확인하기" → /admin/submissions
    │
    └── 처리 완료 시
        └── 배지 카운트 감소
```

---

## 3. 내비게이션 & 레이아웃

### 3.1 사이드바 네비게이션

```
┌─────────────────┐
│  🗓️ 공구캘린더   │  ← 로고/브랜드 (클릭 시 /admin/dashboard)
├─────────────────┤
│  📊 대시보드     │  ← /admin/dashboard
│  📋 제보 검수    │  ← /admin/submissions
│  🛒 공구 관리    │  ← /admin/group-buys (향후)
│  🏆 인플루언서    │  ← /admin/influencers (향후)
│  ⚙️ 설정        │  ← /admin/settings (향후)
├─────────────────┤
│  🔵 관리자명     │  ← 프로필 영역
│  🌙 다크모드     │  ← 테마 토글 (향후)
│  🚪 로그아웃     │  ← 로그아웃
└─────────────────┘
```

### 3.2 헤더

```
┌─────────────────────────────────────────────┐
│ [햄버거☰]  제보 검수        [🔔3] [👤관리자]│
│ (모바일)    (현재 페이지)    (알림) (프로필) │
└─────────────────────────────────────────────┘
```

### 3.3 키보드 단축키 (Toss 스타일)

| 단축키 | 기능 | 비고 |
|--------|------|------|
| `?` | 단축키 도움말 | 모든 페이지 |
| `g` + `d` | 대시보드 이동 | Global |
| `g` + `s` | 제보 검수 이동 | Global |
| `j` / `k` | 다음/이전 카드 이동 | Submissions 페이지 |
| `Space` | 카드 확장/접기 | Submissions 페이지 |
| `a` | 승인 | 카드 확장 시 |
| `r` | 반려 | 카드 확장 시 |
| `s` | 저장/임시저장 | 편집 중 |
| `f` | 검색 포커스 | Submissions 페이지 |
| `Escape` | 모달/확장 닫기 | 전역 |

---

## 4. 데이터 흐름도

### 4.1 제보 검수 데이터 흐름

```
[Client (Web)]
    │
    ├── GET /admin/submissions?status=PENDING&page=1&search=키워드
    │       └─▶ [API] SubmissionService.findAllAdmin()
    │               └─▶ [DB] Prisma: submission.findMany({where, orderBy, skip, take})
    │                       └─▶ Response: { data: Submission[], meta: { total, page, pageSize } }
    │
    ├── POST /admin/submissions/:id/approve
    │       └─▶ [API] SubmissionService.approve(id, data)
    │               ├─▶ Validation: Zod schema
    │               ├─▶ Transaction:
    │               │    ├─▶ submission.update({ status: 'APPROVED' })
    │               │    └─▶ groupBuy.create({ ...formData })
    │               └─▶ Response: { success: true, groupBuy: GroupBuy }
    │
    └── POST /admin/submissions/:id/reject
            └─▶ [API] SubmissionService.reject(id, reason)
                    └─▶ Transaction:
                         ├─▶ submission.update({ status: 'REJECTED', rejectionReason: reason })
                         └─▶ Audit log 생성
```

### 4.2 대시보드 데이터 흐름

```
[Client (Web)]
    │
    ├── GET /admin/stats/summary
    │       └─▶ Response: {
    │               newSubmissions: { count: 12, change: 15.5 },
    │               approvalRate: { rate: 68.5, previous: 62.0 },
    │               pendingCount: { count: 5 },
    │               rejectionRate: { rate: 12.3, previous: 10.1 }
    │           }
    │
    └── GET /admin/stats/daily?period=week
            └─▶ Response: {
                    labels: ['06-10', '06-11', '06-12', '06-13', '06-14', '06-15', '06-16'],
                    submissions: [5, 3, 8, 6, 12, 7, 4],
                    approved: [2, 1, 4, 3, 5, 3, 2],
                    rejected: [1, 0, 1, 2, 1, 1, 0]
                }
```

---

## 5. 상태 전이 다이어그램

```
                    ┌──────────┐
                    │  PENDING  │  ← 초기 상태 (제보 접수)
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
        ┌─────────┐ ┌─────────┐ ┌───────────┐
        │APPROVED │ │REJECTED │ │DUPLICATE  │
        └────┬────┘ └─────────┘ └───────────┘
             │
             ▼
        ┌──────────┐
        │ GroupBuy  │  ← 승인 시 자동 생성
        │ (ACTIVE)  │
        └──────────┘
```

---

## 6. 에러/엣지 케이스 처리

| 상황 | 처리 | 사용자 피드백 |
|------|------|--------------|
| API 500 에러 | 재시도 버튼 + 토스트 | "서버 오류가 발생했습니다. 다시 시도해주세요." |
| 네트워크 오프라인 | 오프라인 배지 + 자동 재연결 | "인터넷 연결을 확인해주세요." |
| 빈 제보 목록 | EmptyState 컴포넌트 | "아직 접수된 제보가 없습니다." |
| 중복 URL 제보 | 409 Conflict | "이미 동일한 제보가 접수되었습니다." |
| 동시 승인/반려 시도 | 낙관적 업데이트 + 충돌 감지 | "다른 관리자가 먼저 처리했습니다." |
| 잘못된 필터 값 | 필터 리셋 + 토스트 | "올바른 값을 입력해주세요." |
| 403 권한 없음 | 로그인 페이지 리디렉션 | "접근 권한이 없습니다." |
| 페이지네이션 끝 | "더 이상 없음" 표시 | "모든 제보를 확인했습니다." |

---

## 7. 구현 우선순위 (MVP)

| 순위 | 기능 | 예상工时 | 비고 |
|------|------|---------|------|
| P0 | 사이드바 + 헤더 레이아웃 | 4h | 반응형 포함 |
| P0 | SubmissionCard (확장/접기) | 6h | 아코디언 애니메이션 |
| P0 | 승인/반려 폼 + API 연동 | 8h | 검증 + 트랜잭션 |
| P0 | StatusBadge + Toast | 3h | 공통 컴포넌트 |
| P0 | FilterBar (검색 + 상태 필터) | 4h | FilterChips |
| P0 | 페이지네이션 | 2h | - |
| P1 | 대시보드 StatCards | 4h | API 연동 |
| P1 | Chart 섹션 | 6h | Recharts |
| P1 | RecentActivity | 3h | 타임라인 |
| P1 | EmptyState + 에러 처리 | 3h | - |
| P1 | 키보드 단축키 | 2h | - |
| P2 | 다크모드 | 3h | Post-MVP |
| P2 | 실시간 알림 | 4h | 폴링/WS |