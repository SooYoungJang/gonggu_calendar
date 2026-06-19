# 📊 관리자 대시보드 지표 & 차트 스펙

**작성일**: 2026-06-16
**버전**: v1.0
**상태**: 초안

---

## 1. 대시보드 개요

관리자 대시보드는 공구 캘린더 서비스의 운영 현황을 한눈에 파악할 수 있는 허브입니다. StatCards, 차트, 활동 피드로 구성됩니다.

---

## 2. 데이터 소스

모든 대시보드 데이터는 **NestJS API**로부터 가져옵니다.

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/admin/stats/summary` | GET | 요약 통계 (StatCards) |
| `/admin/stats/daily` | GET | 일별 추이 차트 |
| `/admin/stats/weekly` | GET | 주별 추이 차트 |
| `/admin/activities/latest` | GET | 최근 활동 피드 |
| `/admin/stats/category` | GET | 카테고리별 분포 (향후) |

---

## 3. 지표 정의

### 3.1 StatCards (4개)

#### Card 1: 신규 제보 (오늘)

| 항목 | 값 |
|------|-----|
| **표시** | 숫자 + 전일 대비 증감률 |
| **색상** | Primary (#3b82f6) |
| **아이콘** | 📝 또는 Lucide `FilePlus` |
| **클릭 액션** | → `/admin/submissions?status=PENDING` |
| **빈 상태** | "0건" |
| **데이터** | `{ count: number, change: number(%), comparedTo: 'yesterday' }` |

#### Card 2: 승인율 (이번 주)

| 항목 | 값 |
|------|-----|
| **표시** | 퍼센트 + 전주 대비 증감 |
| **색상** | Success (#22c55e) |
| **아이콘** | ✅ 또는 Lucide `CheckCircle` |
| **게이지** | 원형 게이지 (0~100%) |
| **빈 상태** | "데이터 없음" |
| **데이터** | `{ rate: number(%), previous: number(%), total: number, approved: number }` |

#### Card 3: 처리 대기 (현재)

| 항목 | 값 |
|------|-----|
| **표시** | 숫자 |
| **색상** | Warning (#f59e0b) |
| **아이콘** | ⏳ 또는 Lucide `Clock` |
| **클릭 액션** | → `/admin/submissions?status=PENDING` |
| **임계값** | ≥ 10건: 빨간색 강조, ≥ 5건: 주황색 |
| **데이터** | `{ count: number }` |

#### Card 4: 반려율 (이번 주)

| 항목 | 값 |
|------|-----|
| **표시** | 퍼센트 + 전주 대비 증감 |
| **색상** | Error (#ef4444) |
| **아이콘** | ❌ 또는 Lucide `XCircle` |
| **미니 차트** | 좁은 영역 sparkline |
| **데이터** | `{ rate: number(%), previous: number(%), total: number, rejected: number }` |

### 3.2 차트

#### Chart 1: 제보 추이 (일별)

| 항목 | 값 |
|------|-----|
| **타입** | LineChart (Recharts) |
| **기본 기간** | 최근 7일 |
| **탭 옵션** | 일별 / 주별 / 월별 |
| **시리즈** | 전체 제보 / 승인 / 반려 |
| **색상** | Primary / Success / Error |
| **X축** | 날짜 |
| **Y축** | 건수 |
| **툴팁** | 호버 시: 날짜, 전체, 승인, 반려 |
| **애니메이션** | 진입 시 페이드인 |
| **빈 상태** | "아직 데이터가 없습니다" |

#### Chart 2: 승인/반려 비율 (파이)

| 항목 | 값 |
|------|-----|
| **타입** | PieChart 또는 DonutChart (Recharts) |
| **기간** | 이번 달 (기본) |
| **시리즈** | 승인 / 반려 / 대기 / 중복 |
| **색상** | Success / Error / Warning / Gray |
| **툴팁** | 호버 시: 카테고리명, 건수, 비율 |
| **라벨** | 비율 퍼센트 표시 |

### 3.3 RecentActivity (최근 활동)

| 항목 | 값 |
|------|-----|
| **표시** | 타임라인 리스트 (최대 10건) |
| **정렬** | 최신순 |
| **액션 타입** | `SUBMITTED`, `APPROVED`, `REJECTED`, `STATUS_CHANGED` |
| **각 항목** | 아이콘 + 액션 + 대상 + 상대 시간 |
| **상대 시간** | "방금 전", "3분 전", "1시간 전", "어제", "3일 전" |
| **클릭 액션** | 제보 제목 클릭 → 해당 제보 상세로 스크롤 |
| **더 보기** | 하단 "모든 활동 보기" → `/admin/submissions` |
| **빈 상태** | "아직 활동이 없습니다" |

---

## 4. 상세 스펙

### 4.1 API 응답 스키마

```typescript
// GET /admin/stats/summary
interface StatsSummaryResponse {
  newSubmissions: {
    count: number;
    change: number;        // 전일 대비 증감률 (%)
  };
  approvalRate: {
    rate: number;          // 0~100
    previous: number;      // 전주 승인율
    total: number;         // 이번 주 전체 제보 수
    approved: number;       // 이번 주 승인 수
  };
  pendingCount: {
    count: number;
  };
  rejectionRate: {
    rate: number;           // 0~100
    previous: number;       // 전주 반려율
    total: number;          // 이번 주 전체 제보 수
    rejected: number;       // 이번 주 반려 수
  };
}

// GET /admin/stats/daily?period=week | month
interface DailyStatsResponse {
  period: 'week' | 'month';
  labels: string[];         // 날짜 레이블 ['06-10', '06-11', ...]
  datasets: {
    submissions: number[];
    approved: number[];
    rejected: number[];
  };
}

// GET /admin/activities/latest
type ActivityType = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

interface Activity {
  id: string;
  type: ActivityType;
  submissionId: string;
  submissionTitle: string;
  adminName?: string;        // 승인/반려 시
  reason?: string;           // 반려 사유 (반려 시)
  timestamp: string;         // ISO 8601
}

interface LatestActivitiesResponse {
  activities: Activity[];
  total: number;
}
```

---

## 5. 상태별 렌더링

### 5.1 Loading State

```tsx
// StatCards: Skeleton 컴포넌트
<StatCardSkeleton columns={4} />

// Chart: Skeleton 영역
<ChartSkeleton height={300} />

// Activity: Skeleton 리스트
<ActivitySkeleton lines={5} />
```

### 5.2 Error State

```tsx
// 공통 에러 컴포넌트
<ErrorState
  message="대시보드 데이터를 불러올 수 없습니다"
  action="다시 시도"
  onAction={() => refetch()}
/>
```

### 5.3 Empty State

```tsx
// StatCards: "0건" 정상 표시 (데이터 없어도 0 표시)
// Chart: 빈 차트 + "아직 데이터가 없습니다" 메시지
// Activity: "아직 활동이 없습니다" 메시지
```

---

## 6. 상태 관리

### 6.1 데이터 폴링 (실시간 업데이트)

| 데이터 | 폴링 간격 | 자동 갱신 | 비고 |
|--------|-----------|-----------|------|
| StatCards | 60초 | ✅ | 실시간성 필요 |
| Chart | 300초 (5분) | ✅ | 느린 변화 |
| Activity | 30초 | ✅ | 실시간 감지 |
| 알림 배지 | 30초 | ✅ | 새 제보 감지 |

### 6.2 TanStack Query 설정

```typescript
// 예시 쿼리 설정
const statsQuery = useQuery({
  queryKey: ['admin', 'stats', 'summary'],
  queryFn: () => fetch('/admin/stats/summary').then(r => r.json()),
  refetchInterval: 60_000,     // 60초 폴링
  staleTime: 30_000,            // 30초 후 stale
  retry: 3,
});

const dailyStatsQuery = useQuery({
  queryKey: ['admin', 'stats', 'daily', period],
  queryFn: () => fetch(`/admin/stats/daily?period=${period}`).then(r => r.json()),
  refetchInterval: 300_000,     // 5분 폴링
  staleTime: 120_000,
});

const activitiesQuery = useQuery({
  queryKey: ['admin', 'activities', 'latest'],
  queryFn: () => fetch('/admin/activities/latest').then(r => r.json()),
  refetchInterval: 30_000,      // 30초 폴링
  staleTime: 15_000,
});
```

---

## 7. UI/UX 스펙

### 7.1 레이아웃

```
┌────────────────────────────────────────────────┐
│  📊 대시보드                       [새로고침]  │
│                                                   │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ 📝 12│ │ ✅ 68%│ │ ⏳  5│ │ ❌ 12%│           │
│  │신규   │ │승인율 │ │대기   │ │반려율 │           │
│  │ +15% │ │ +6.5%│ │       │ │ +2.2%│           │
│  └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                   │
│  ┌────── [일별] [주별] [월별] ──────────────────┐ │
│  │                                                │ │
│  │           📈 제보 추이                            │ │
│  │           (LineChart)                          │ │
│  │                                                │ │
│  │    ┌──────────────────────────┐               │ │
│  │    │    승인/반려 비율 (파이)   │               │ │
│  │    └──────────────────────────┘               │ │
│  └────────────────────────────────────────────────┘ │
│                                                   │
│  ┌─── 최근 활동 ────────────────────────────────┐ │
│  │ ● 스티븐이 "네이버 빅세일" 승인   3분 전     │ │
│  │ ● 제니가 "11번가 특가" 반려      15분 전     │ │
│  │ ● 새로운 제보 접수 "쿠팡 딜"     1시간 전    │ │
│  │ ● 스티븐이 "G마켓 할인" 승인     2시간 전    │ │
│  │                                              │ │
│  │ [모든 활동 보기 →]                          │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### 7.2 반응형

| Breakpoint | StatCards | Chart | Activity |
|------------|-----------|-------|----------|
| ≥ 1280px | 4열 그리드 | 좌:Line 60% + 우:Pie 40% | 전체 너비 |
| 1024-1280px | 4열 그리드 | 전체 너비 (2줄) | 전체 너비 |
| 768-1024px | 2열 그리드 | 전체 너비 (1줄) | 전체 너비 |
| < 768px | 2열 그리드 | 전체 너비 (1줄) | 전체 너비 |

---

## 8. 차트 라이브러리: Recharts

### 설치

```bash
npm install recharts
```

### 사용 컴포넌트

| Recharts 컴포넌트 | 용도 |
|-------------------|------|
| `LineChart` + `Line` | 일별/주별 제보 추이 |
| `BarChart` + `Bar` | 승인/반려 막대 비교 |
| `PieChart` + `Pie` | 승인/반려/대기 비율 |
| `Tooltip` | 호버 툴팁 |
| `Legend` | 범례 |
| `ResponsiveContainer` | 반응형 래퍼 |
| `XAxis` / `YAxis` | 축 |
| `CartesianGrid` | 그리드 라인 |

### 스타일링

```tsx
// Tailwind v4 토큰 적용
<LineChart data={data}>
  <Line
    type="monotone"
    dataKey="submissions"
    stroke="var(--color-primary-500)"
    strokeWidth={2}
    dot={false}
    activeDot={{ r: 6 }}
  />
  <Line
    type="monotone"
    dataKey="approved"
    stroke="var(--color-success-500)"
    strokeWidth={2}
    dot={false}
  />
  <Line
    type="monotone"
    dataKey="rejected"
    stroke="var(--color-error-500)"
    strokeWidth={2}
    dot={false}
  />
  <Tooltip
    contentStyle={{
      borderRadius: '12px',
      boxShadow: 'var(--shadow-lg)',
      border: 'none',
    }}
  />
</LineChart>
```

---

## 9. 성능 고려사항

| 항목 | 권장사항 |
|------|----------|
| 차트 렌더링 | `React.memo`로 불필요한 리렌더링 방지 |
| 데이터 크기 | daily: 최대 31일, weekly: 최대 12주 |
| 애니메이션 | 진입 시 한 번만 (반복 금지) |
| 번들 사이즈 | Recharts 트리쉐이킹 지원 (gzip ~30KB) |
| 메모리 | 활동 피드: 최대 50건 유지 (페이지네이션) |

---

## 10. 마일스톤

| 단계 | 내용 | 예상 시간 |
|------|------|-----------|
| 1 | StatCards 구현 + API 연동 | 4h |
| 2 | LineChart 구현 (일별/주별/월별 탭) | 6h |
| 3 | PieChart (승인/반려 비율) | 2h |
| 4 | RecentActivity 타임라인 | 3h |
| 5 | 로딩/에러/빈 상태 처리 | 2h |
| 6 | 폴링 + 캐싱 (TanStack Query) | 2h |
| 7 | 반응형 레이아웃 | 2h |
| **총합** | | **~21h** |

---

## 11. API 구현 (NestJS)

### StatsModule

```typescript
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  async getSummary(): Promise<StatsSummaryResponse> {
    return this.statsService.getSummary();
  }

  @Get('daily')
  async getDailyStats(
    @Query('period') period: 'week' | 'month' = 'week'
  ): Promise<DailyStatsResponse> {
    return this.statsService.getDailyStats(period);
  }
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<StatsSummaryResponse> {
    const today = new Date();
    const yesterday = addDays(today, -1);

    const [todayCount, yesterdayCount, weeklyStats, pendingCount] =
      await Promise.all([
        // 오늘 제보 수
        this.prisma.submission.count({
          where: { createdAt: { gte: startOfDay(today) } },
        }),
        // 어제 제보 수
        this.prisma.submission.count({
          where: {
            createdAt: { gte: startOfDay(yesterday), lt: startOfDay(today) },
          },
        }),
        // 이번 주 승인/반려 통계
        this.getWeeklyStats(),
        // 처리 대기 건수
        this.prisma.submission.count({
          where: { status: 'PENDING' },
        }),
      ]);

    return {
      newSubmissions: {
        count: todayCount,
        change: yesterdayCount > 0
          ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
          : 0,
      },
      approvalRate: {
        rate: weeklyStats.total > 0
          ? (weeklyStats.approved / weeklyStats.total) * 100
          : 0,
        previous: weeklyStats.previousApprovalRate,
        total: weeklyStats.total,
        approved: weeklyStats.approved,
      },
      pendingCount: { count: pendingCount },
      rejectionRate: {
        rate: weeklyStats.total > 0
          ? (weeklyStats.rejected / weeklyStats.total) * 100
          : 0,
        previous: weeklyStats.previousRejectionRate,
        total: weeklyStats.total,
        rejected: weeklyStats.rejected,
      },
    };
  }
}
```