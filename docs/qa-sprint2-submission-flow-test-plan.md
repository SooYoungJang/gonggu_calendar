# Sprint 2 QA 테스트 계획 — 제보 생성 → 운영자 승인/반려 → 캘린더 반영

## 1. 목적 / 범위

Sprint 2의 핵심 변경사항은 Instagram 크롤링 의존도를 낮추고, 사용자가 앱에서 공구 정보를 제보하면 운영자가 검수 후 승인/반려하고, 승인된 제보만 캘린더/목록에 반영되는 플로우를 구축하는 것이다.

### 테스트 대상
- 앱 제보 화면: 입력, 검증, 제출, 완료/실패 UX
- `GongguSubmission` 모델: 저장 필드, 상태 전이, 원본/정규화 데이터 보존
- submissions API: 사용자 제보 생성/조회
- admin submissions API: 운영자 목록/상세/승인/반려
- calendar/group-buys API: 승인된 제보의 캘린더 반영 여부
- 계약 테스트: 앱 ↔ API, admin ↔ API, submission ↔ group-buy/calendar 데이터 매핑

### 전제
현재 Sprint 1 코드 기준으로는 `GroupBuy`, `RawPost`, `GroupBuyStatus`, `/admin/group-buys/:id/approve|reject`, `/group-buys`가 존재한다. Sprint 2에서는 별도 `GongguSubmission` 모델과 `/submissions`, `/admin/submissions` 계열 API가 추가된다는 가정으로 테스트 계획을 작성한다.

---

## 2. 우선순위 기준

| 우선순위 | 의미 | 예시 |
|---|---|---|
| P0 | 릴리즈 차단. 실패 시 Sprint 2 완료 불가 | 제보 생성, 승인 후 캘린더 노출, 반려 후 미노출, 필수값 검증 |
| P1 | 핵심 품질. 릴리즈 전 반드시 확인 권장 | 중복 제보, 상태 전이 제한, 관리자 권한, 날짜/시간대 처리 |
| P2 | 안정성/운영 편의. 후속 보완 가능 | 긴 텍스트, 특수문자, 대량 목록, UX 문구, 관측성 |

---

## 3. 테스트 매트릭스

| 영역 | P0 | P1 | P2 |
|---|---|---|---|
| E2E | 사용자 제보 생성 → 관리자 승인 → 캘린더 노출 / 반려 → 미노출 | 중복 제출, 재승인/재반려 방지, 네트워크 실패 복구 | 접근성, 로딩/빈 상태, 대량 데이터 스크롤 |
| API | `POST /submissions`, `GET /admin/submissions`, approve/reject, `GET /group-buys` 또는 calendar 조회 | 인증/권한, 상태 필터, pagination, idempotency | rate limit, audit log, 응답 시간 |
| 계약 | DTO 필수/선택 필드, enum, 날짜 포맷, 에러 스키마 | 앱 폼 필드 ↔ API 스키마, 승인 시 group-buy 매핑 | Swagger/OpenAPI snapshot, backward compatibility |
| 데이터 | `GongguSubmission` 저장, 승인 시 `GroupBuy` 생성/연결 | uniqueness, transaction rollback, timezone | 관리자 메모/반려 사유 검색 |

---

## 4. E2E 테스트 케이스

| ID | 우선순위 | 시나리오 | Given | When | Then |
|---|---|---|---|---|---|
| E2E-01 | P0 | 정상 제보 생성 | 앱 사용자가 제보 화면 진입 | 상품명, 브랜드, 시작/종료일, 구매 URL, 설명 등 필수값 입력 후 제출 | 제출 성공 토스트/완료 화면 표시, submission 상태가 `PENDING`/`REVIEW_REQUIRED`로 저장됨 |
| E2E-02 | P0 | 승인 후 캘린더 반영 | `PENDING` 제보 1건 존재 | 운영자가 admin에서 승인 | 해당 제보가 `APPROVED`가 되고 calendar/group-buys 목록에 노출됨 |
| E2E-03 | P0 | 반려 후 캘린더 미반영 | `PENDING` 제보 1건 존재 | 운영자가 반려 사유 입력 후 반려 | submission 상태가 `REJECTED`, calendar/group-buys 목록에 노출되지 않음 |
| E2E-04 | P0 | 필수값 누락 방지 | 제보 화면 진입 | 상품명/날짜/URL 등 필수값을 비운 채 제출 | 클라이언트 검증 메시지 노출, API 호출 없음 또는 400 처리 |
| E2E-05 | P0 | 승인 데이터 상세 진입 | 승인된 제보가 캘린더에 표시됨 | 사용자가 캘린더 이벤트/목록 카드를 탭 | 상세 화면에 제보 입력 정보가 손실 없이 표시됨 |
| E2E-06 | P1 | 중복 제보 처리 | 동일 URL 또는 동일 상품+기간 제보가 이미 존재 | 사용자가 같은 내용을 다시 제출 | 정책에 따라 409/중복 안내 또는 별도 submission 생성. 결과가 명확하고 중복 캘린더 노출 없음 |
| E2E-07 | P1 | 네트워크 실패 후 재시도 | API 서버 오류/오프라인 상태 | 제출 시도 후 재시도 | 실패 메시지와 재시도 가능 상태 유지, 중복 저장 없음 |
| E2E-08 | P1 | 승인 직후 앱 새로고침 | 사용자가 목록/캘린더 화면에 머무름 | 운영자가 제보 승인, 앱에서 pull-to-refresh 또는 재진입 | 승인 건이 최신 데이터로 반영됨 |
| E2E-09 | P1 | 반려 사유 확인 | 제보자 조회 기능이 제공됨 | 운영자가 반려 사유 입력 | 사용자가 상태/사유를 확인 가능하거나 정책상 비노출이면 API에도 비노출됨 |
| E2E-10 | P2 | 긴 입력/이모지/한글 처리 | 긴 설명, 이모지, 한글 브랜드명 입력 | 제출/승인 | 저장/표시 깨짐 없음, UI overflow 없음 |

---

## 5. API 테스트 케이스

### 5.1 사용자 submissions API

| ID | 우선순위 | Endpoint | 검증 내용 | 기대 결과 |
|---|---|---|---|---|
| API-01 | P0 | `POST /submissions` | 정상 payload 생성 | 201, `id`, `status=PENDING`, 생성 시각 반환 |
| API-02 | P0 | `POST /submissions` | 필수 필드 누락 | 400, 필드별 validation error 반환 |
| API-03 | P0 | `POST /submissions` | `endDate < startDate` | 400, 날짜 역전 오류 |
| API-04 | P0 | `POST /submissions` | URL 형식 오류 | 400, URL validation error |
| API-05 | P1 | `POST /submissions` | 동일 `sourceUrl` 재제출 | 정책에 따라 409 또는 중복 허용 시 중복 캘린더 방지 플래그 확인 |
| API-06 | P1 | `GET /submissions/:id` | 본인 또는 공개 조회 정책 | 200 또는 권한 없을 시 403/404 |
| API-07 | P1 | `POST /submissions` | 과도하게 긴 문자열 | 400 또는 trim 저장. DB length 초과로 500 발생하지 않아야 함 |
| API-08 | P2 | `POST /submissions` | rate limit 초과 | 429 및 표준 에러 스키마 |

### 5.2 Admin submissions API

| ID | 우선순위 | Endpoint | 검증 내용 | 기대 결과 |
|---|---|---|---|---|
| API-09 | P0 | `GET /admin/submissions?status=PENDING` | 검수 대기 목록 | 200, 최신순/페이지네이션, 필요한 요약 필드 포함 |
| API-10 | P0 | `GET /admin/submissions/:id` | 제보 상세 | 200, 원본 입력값/상태/메타데이터 포함 |
| API-11 | P0 | `POST /admin/submissions/:id/approve` | 정상 승인 | 200, 상태 `APPROVED`, 연결된 `groupBuyId`/calendar event 식별자 반환 |
| API-12 | P0 | `POST /admin/submissions/:id/reject` | 정상 반려 | 200, 상태 `REJECTED`, `rejectedReason` 저장 |
| API-13 | P0 | approve/reject | 없는 ID | 404, 표준 에러 스키마 |
| API-14 | P1 | approve | 이미 승인된 제보 재승인 | 409 또는 idempotent 200. 단 group-buy/calendar 중복 생성 금지 |
| API-15 | P1 | reject | 이미 승인된 제보 반려 | 정책에 따라 409 또는 관리자 수정 플로우 요구. 캘린더 상태 일관성 유지 |
| API-16 | P1 | approve/reject | 관리자 권한 없음 | 401/403 |
| API-17 | P1 | approve | 필수 승인 매핑 필드 누락 | 400/422 또는 보완 입력 요구. 불완전 calendar 노출 금지 |
| API-18 | P2 | list | q/status/date range pagination 조합 | 필터 정확도, limit 상한 적용 |

### 5.3 Calendar / Group-buys API

| ID | 우선순위 | Endpoint | 검증 내용 | 기대 결과 |
|---|---|---|---|---|
| API-19 | P0 | `GET /group-buys` 또는 `GET /calendar/events` | 승인 건만 노출 | `APPROVED`만 반환, `PENDING/REJECTED` 미포함 |
| API-20 | P0 | `GET /group-buys/:id` | 승인 상세 조회 | 승인 건 상세 200, 날짜/URL/브랜드/상품명 일치 |
| API-21 | P1 | list | 날짜 범위 조회 | 시작/종료일 경계 포함 여부 정책대로 동작 |
| API-22 | P1 | list | 정렬 | 종료일 오름차순 또는 기획 정의 순서 유지 |
| API-23 | P1 | list | 승인 취소/반려 전환 시 | 캘린더에서 제거 또는 상태 변경 즉시 반영 |
| API-24 | P2 | list | 대량 승인 데이터 | 응답 시간, 페이지네이션, 모바일 렌더링 가능 크기 |

---

## 6. 계약 테스트 케이스

| ID | 우선순위 | 계약 | 체크 포인트 |
|---|---|---|---|
| CT-01 | P0 | `CreateSubmissionRequest` | 필수: 상품명/날짜/URL/설명 또는 기획 확정 필드. 선택: 브랜드/가격/이미지/제보자 연락처 |
| CT-02 | P0 | `SubmissionStatus` enum | `PENDING`, `APPROVED`, `REJECTED` 등 앱/admin/API가 동일 enum 사용 |
| CT-03 | P0 | 날짜 포맷 | ISO-8601 UTC 저장, 앱은 KST 표시. start/end date 경계 일치 |
| CT-04 | P0 | 승인 응답 | 승인 후 `submissionId`, `groupBuyId`, `status`, `startDate`, `endDate` 반환 |
| CT-05 | P0 | 에러 응답 | 400/401/403/404/409가 `{ statusCode, message, error, details? }` 형태로 일관됨 |
| CT-06 | P1 | Admin list item | 목록에 검수에 필요한 최소 필드 포함: 상품명, 브랜드, URL, 기간, createdAt, status |
| CT-07 | P1 | Submission → GroupBuy 매핑 | `productName`, `brandName`, `purchaseUrl`, `startDate`, `endDate`, `summary`, `sourceUrl` 손실 없음 |
| CT-08 | P1 | 이미지/첨부 | 이미지 URL 배열 또는 단일 URL 타입 합의, 잘못된 URL 처리 |
| CT-09 | P2 | OpenAPI snapshot | `/docs` 스키마 snapshot 변경 시 QA/앱 담당 승인 필요 |
| CT-10 | P2 | Backward compatibility | 앱 구버전이 알 수 없는 필드를 받아도 무시 가능 |

---

## 7. 데이터/상태 전이 검증

### 권장 상태 전이

```text
DRAFT(optional) → PENDING → APPROVED
                      └──→ REJECTED
```

### 검증 항목
- `PENDING`만 승인/반려 가능해야 한다.
- `APPROVED` 처리 시 transaction으로 `GongguSubmission.status` 변경과 `GroupBuy`/calendar 생성이 함께 성공해야 한다.
- 승인 중 일부 실패 시 submission은 `PENDING` 유지 또는 명시적 `APPROVAL_FAILED`로 남아야 하며, 반쪽짜리 calendar 이벤트가 남으면 안 된다.
- 반려 시 calendar/group-buy가 생성되지 않아야 한다.
- 동일 submission으로 여러 group-buy가 생성되지 않아야 한다.
- 감사 필드 권장: `reviewedAt`, `reviewedBy`, `rejectedReason`, `createdAt`, `updatedAt`.

---

## 8. 엣지 케이스

| 구분 | 케이스 | 기대 |
|---|---|---|
| 입력값 | 상품명 공백/이모지/특수문자/HTML script | trim/escape 처리, XSS 없음 |
| 날짜 | 종료일이 시작일보다 빠름 | 400 및 앱 validation |
| 날짜 | 같은 날 시작/종료 | 정책상 허용 시 정상 노출, 아니면 validation 메시지 |
| 날짜 | 월말/연말/윤년/타임존 KST↔UTC | 캘린더 날짜 밀림 없음 |
| URL | http/https, 쿼리스트링, 단축 URL, 인스타 URL 외 쇼핑몰 URL | 허용 정책대로 validation |
| 중복 | 동일 sourceUrl, 동일 상품명+브랜드+기간 | 중복 calendar 생성 방지 |
| 동시성 | 운영자 2명이 동시에 승인/반려 | 하나만 성공, 나머지는 409 또는 최신 상태 반환 |
| 권한 | 일반 사용자가 admin API 호출 | 401/403 |
| 데이터 | 승인 직후 API cache/React Query stale | refresh 후 반영, stale time 정책 검증 |
| 실패 | 승인 중 DB 오류 | transaction rollback, 상태 일관성 |
| 실패 | 앱 제출 timeout 후 재시도 | 중복 생성 방지 또는 중복 안내 |
| 보안 | 반려 사유에 개인정보/악성 HTML | 저장/표시 escape, 로그 마스킹 |
| 운영 | 대량 PENDING 1,000건 | 관리자 목록 pagination/응답 시간 안정 |

---

## 9. 테스트 데이터 세트

| 데이터명 | 상태 | 핵심 값 |
|---|---|---|
| `submission_pending_valid` | PENDING | 정상 상품명, 브랜드, 오늘~7일 후, 정상 구매 URL |
| `submission_pending_no_brand` | PENDING | 브랜드 없음, 나머지 정상 |
| `submission_invalid_date` | 요청용 | 종료일 < 시작일 |
| `submission_invalid_url` | 요청용 | URL 아님 |
| `submission_duplicate_url_a/b` | PENDING/요청용 | 동일 sourceUrl |
| `submission_approved_calendar` | APPROVED | 캘린더 노출 검증용 |
| `submission_rejected_reason` | REJECTED | 반려 사유 포함 |

---

## 10. 자동화 권장 범위

### P0 자동화 필수
- API integration: 생성/승인/반려/캘린더 조회
- Contract: DTO validation, enum, error schema
- E2E smoke: 앱 제보 제출 성공, 승인 후 목록/캘린더 노출

### P1 자동화 권장
- 중복 URL 처리
- 동시 승인 race condition
- 날짜 경계/타임존
- 권한 없는 admin 접근

### 수동 QA 병행
- 앱 입력 UX, 키보드/스크롤, 로딩/빈 상태
- 관리자 검수 화면 사용성
- 실제 디바이스에서 날짜 표시 및 링크 이동

---

## 11. Sprint 2 Done Criteria

### 기능 완료
- [ ] 사용자가 앱에서 공구 제보를 생성할 수 있다.
- [ ] 생성된 제보는 DB에 `PENDING`/검수대기 상태로 저장된다.
- [ ] 운영자는 제보 목록/상세를 보고 승인 또는 반려할 수 있다.
- [ ] 승인된 제보만 캘린더/group-buys 목록과 상세에 노출된다.
- [ ] 반려된 제보는 캘린더에 노출되지 않고 반려 사유가 저장된다.
- [ ] 승인/반려 상태 전이가 중복 생성 없이 일관되게 동작한다.

### 품질 게이트
- [ ] P0 E2E 테스트 전부 통과.
- [ ] P0 API/계약 테스트 전부 통과.
- [ ] `POST /submissions` validation 실패가 500이 아닌 4xx로 반환된다.
- [ ] admin API는 인증/권한 없이 접근할 수 없다.
- [ ] 승인 처리 transaction 실패 시 데이터가 rollback된다.
- [ ] Swagger/OpenAPI 문서가 최신 API와 일치한다.
- [ ] 모바일 앱에서 승인 전/반려 건이 노출되지 않는 것을 확인했다.

### 릴리즈 판단
- P0 결함 0개.
- P1 결함은 PM/개발 리드 승인하에 known issue로 문서화된 경우만 허용.
- 테스트 데이터 초기화/seed 절차가 문서화되어 재현 가능하다.
- QA 결과와 미해결 리스크가 PM에게 공유되었다.

---

## 12. 주요 리스크 / PM 확인 필요

1. 중복 제보 정책: 동일 URL을 409로 막을지, 중복 접수 후 운영자가 병합할지 결정 필요.
2. 반려 사유 노출 정책: 제보자에게 보여줄지, admin 내부 기록으로만 둘지 결정 필요.
3. 승인 후 수정/승인 취소 플로우: Sprint 2 범위에 포함할지 후속으로 미룰지 결정 필요.
4. 캘린더 API 명칭: 기존 `/group-buys`를 그대로 쓸지 별도 `/calendar/events`를 만들지 확정 필요.
5. 관리자 인증: Sprint 2에서 실제 auth를 붙일지 임시 토큰/Basic Auth로 갈지 결정 필요.

---

## 13. 비주얼 리그레션 테스트 (Visual Regression)

Figma 고해상도 목업(`sketches/` 폴더 6종) 대비 구현 화면 픽셀 단위 비교.

| ID | 우선순위 | 화면 | 기준 목업 | 검증 도구 | 허용 임계값 |
|---|---|---|---|---|---|
| VR-01 | P0 | 모바일 제보 화면 (SubmitScreen) | `sketches/mobile-submit/001-instagram-style/index.html` | Chromatic / Playwright + pixelmatch | 0.1% pixel diff |
| VR-02 | P0 | 모바일 제보 성공 토스트/완료 | 동일 | 동일 | 0.1% pixel diff |
| VR-03 | P0 | 모바일 제보 검증 에러 상태 | 동일 | 동일 | 0.1% pixel diff |
| VR-04 | P0 | 웹 어드민 제보 목록 (AdminSubmissionsPage) | `sketches/web-admin-submissions/001-instagram-style/index.html` | 동일 | 0.1% pixel diff |
| VR-05 | P0 | 웹 어드민 제보 상세 아코디언 확장 | 동일 | 동일 | 0.1% pixel diff |
| VR-06 | P0 | 웹 어드민 승인/반려 모달 | 동일 | 동일 | 0.1% pixel diff |

### 상태별 검증 (각 화면당)
| 상태 | 모바일 제보 | 웹 어드민 목록/상세 |
|---|---|---|
| 기본 (empty/default) | ✅ | ✅ |
| 입력 중 (focus/typing) | ✅ | N/A |
| 검증 에러 (inline error) | ✅ | ✅ (반려 사유 입력) |
| 로딩 (submitting/approving) | ✅ | ✅ |
| 성공 (toast/complete) | ✅ | ✅ (상태 배지 변경) |
| 비활성 (disabled) | ✅ | ✅ |

### 반응형 브레이크포인트 검증
| Breakpoint | Width | 모바일 제보 | 웹 어드민 |
|---|---|---|---|
| mobile | < 640px | 단일 컬럼, 바텀시트 모달 | 단일 컬럼 스택, 드로어 사이드바 |
| tablet | 640-1024px | N/A | 카드 그리드 2열, 드로어 사이드바 |
| desktop | 1024-1440px | N/A | 카드 그리드/테이블, 고정 사이드바 |
| wide | > 1440px | N/A | 다중 패널, 최대 폭 제한 |

### 컴포넌트 단위 스냅샷 (Storybook/Chromatic)
| 컴포넌트 | 상태 변형 | 우선순위 |
|---|---|---|
| Button | primary/secondary/ghost/destructive + loading/disabled | P0 |
| Input/TextArea | default/focus/error/disabled + required/hint | P0 |
| Card/SubmissionCard | collapsed/expanded + status badge | P0 |
| StatusBadge | PENDING/APPROVED/REJECTED/REVIEW_REQUIRED/DUPLICATE | P0 |
| Modal/BottomSheet | open/closing + size variants | P0 |
| Toast | success/error/info/warning + action | P1 |
| FilterChips/SegmentedControl | selected/unselected + searchable | P1 |
| DataTable | sortable/paginated/selectable + density | P1 (웹) |

### 실행 파이프라인
1. **로컬**: `npm run storybook` + Chromatic CLI 로컬 스냅샷
2. **CI**: PR 열릴 때 Chromatic 자동 실행 → UI 변경사항 리뷰 요구
3. **릴리즈**: main 브랜치 머지 시 기준선(baseline) 업데이트

---

## 14. 프론트엔드 성능/접근성 체크리스트 (Frontend Perf/a11y)

### 성능 예산 (Performance Budget)
| 지표 | 모바일 제보 화면 | 웹 어드민 목록 | 측정 도구 |
|---|---|---|---|
| TTI (Time to Interactive) | < 3.5s (3G slow) | < 2.5s (4G) | Lighthouse / WebPageTest |
| LCP (Largest Contentful Paint) | < 2.5s | < 2.0s | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.1 | Lighthouse |
| TBT (Total Blocking Time) | < 200ms | < 150ms | Lighthouse |
| JS 번들 크기 (gz) | < 150KB (첫 화면) | < 200KB (첫 화면) | webpack-bundle-analyzer |
| 이미지 최적화 | WebP/AVIF, 반응형 srcset | 동일 | Lighthouse |

### Core Web Vitals 목표 (모바일/데스크톱 공통)
- **LCP**: Good ≤ 2.5s, Needs Improvement ≤ 4.0s
- **INP** (Interaction to Next Paint): Good ≤ 200ms
- **CLS**: Good ≤ 0.1

### API 응답 시간 (p95)
| Endpoint | 목표 | 비고 |
|---|---|---|
| `POST /submissions` | < 500ms | 이미지 업로드 제외 |
| `GET /admin/submissions` | < 300ms | pagination 20개 기준 |
| `POST /admin/submissions/:id/approve` | < 800ms | transaction 포함 |
| `GET /group-buys` | < 300ms | 캐시 활용 |

### 접근성 (WCAG 2.1 AA) — 디자인 시스템 체크리스트 연계

| 영역 | 검증 항목 | 도구/방법 | 우선순위 |
|---|---|---|---|
| **색상 대비** | 텍스트 4.5:1, UI 3:1 (모든 토큰 검증) | axe-core, 색상 대비 분석기 | P0 |
| **키보드 네비게이션** | Tab 순서 논리적, 포커스 링 3px 명확 | 수동 Tab 탐색, axe-core | P0 |
| **스크린 리더** | label-input 연결, aria-describedby 힌트/에러 | NVDA/VoiceOver/TalkBack 실기기 | P0 |
| **동적 타입** | 시스템 폰트 확대 시 레이아웃 깨지지 않음 | iOS/Android 설정 변경 테스트 | P0 |
| **포커스 트랩** | 모달/사이드 패널 시 포커스 가두기, ESC 닫기 | 수동 + axe-core | P0 |
| **ARIA 속성** | role, aria-modal, aria-labelledby, aria-expanded | axe-core, 코드 리뷰 | P0 |
| **에러 안내** | 인라인 에러 + 토스트, aria-live="polite" | 스크린 리더 실기기 | P0 |
| **언어 선언** | html lang="ko", 다국어 확장 시 동적 변경 | 코드 리뷰 | P1 |
| **터치 타겟** | 최소 44×44pt (버튼 48px 높이) | 수동 측정, 디자인 토큰 검증 | P0 |
| **키보드 회피** | KeyboardAvoidingView + useKeyboard 훅 | 실기기 테스트 | P0 |
| **VoiceOver/TalkBack** | accessibilityLabel/Hint/Role 모든 인터랙티브 요소 | 실기기 탐색 테스트 | P0 |

### 모바일 특화 성능
- **콜드 스타트**: 앱 실행 → 제보 화면 진입 < 2s
- **이미지 선택/압축**: 갤러리 선택 후 압축 완료 < 1s (2MB 이하)
- **오프라인 큐**: 네트워크 끊김 시 로컬 저장 → 복구 시 자동 동기화

---

## 15. Sprint 2 Done Criteria (확장)

### 기능 완료
- [ ] 사용자가 앱에서 공구 제보를 생성할 수 있다.
- [ ] 생성된 제보는 DB에 `PENDING`/검수대기 상태로 저장된다.
- [ ] 운영자는 제보 목록/상세를 보고 승인 또는 반려할 수 있다.
- [ ] 승인된 제보만 캘린더/group-buys 목록과 상세에 노출된다.
- [ ] 반려된 제보는 캘린더에 노출되지 않고 반려 사유가 저장된다.
- [ ] 승인/반려 상태 전이가 중복 생성 없이 일관되게 동작한다.

### 품질 게이트
- [ ] P0 E2E 테스트 전부 통과.
- [ ] P0 API/계약 테스트 전부 통과.
- [ ] `POST /submissions` validation 실패가 500이 아닌 4xx로 반환된다.
- [ ] admin API는 인증/권한 없이 접근할 수 없다.
- [ ] 승인 처리 transaction 실패 시 데이터가 rollback된다.
- [ ] Swagger/OpenAPI 문서가 최신 API와 일치한다.
- [ ] 모바일 앱에서 승인 전/반려 건이 노출되지 않는 것을 확인했다.

### 비주얼/UX 품질 게이트 (신규)
- [ ] **VR-01~06** 비주얼 리그레션 테스트 0.1% 임계값 내 통과.
- [ ] **모바일/웹 6개 핵심 화면** 모든 상태(에러/로딩/성공/비활성) 스냅샷 기준선 저장.
- [ ] **Storybook/Chromatic** PR 시 자동 비주얼 리뷰 게이트 활성화.
- [ ] 반응형 브레이크포인트 4종(mobile/tablet/desktop/wide) 레이아웃 깨짐 없음.

### 성능/접근성 품질 게이트 (신규)
- [ ] Lighthouse CI: 모바일 제보 화면 **Performance ≥ 90**, **Accessibility ≥ 95**, **Best Practices ≥ 90**.
- [ ] Lighthouse CI: 웹 어드민 목록 **Performance ≥ 90**, **Accessibility ≥ 95**, **Best Practices ≥ 90**.
- [ ] Core Web Vitals 실측: LCP/INP/CLS 모두 "Good" 구간.
- [ ] axe-core 자동화: **critical/serious 위반 0개** (CI 게이트).
- [ ] 스크린 리더 실기기 탐색: 제보 작성→제출→완료, 승인/반려 플로우 무장애 완료.

### 릴리즈 판단
- P0 결함 0개 (기능/비주얼/성능/접근성 통합).
- P1 결함은 PM/개발 리드 승인하에 known issue로 문서화된 경우만 허용.
- 테스트 데이터 초기화/seed 절차가 문서화되어 재현 가능하다.
- QA 결과와 미해결 리스크가 PM에게 공유되었다.
- 비주얼 리그레션 기준선(baseline) Chromatic에 저장 완료.
- 성능 예산 문서(`docs/performance-budget.md`) 업데이트 완료.
