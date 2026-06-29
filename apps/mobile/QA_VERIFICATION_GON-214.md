# QA 검증 절차 — GON-214 Supabase Network request failed 재조사

## 변경사항 요약

### 1. PostgREST 진단 로그 (`postgrest-client.ts`)
- 모든 PostgREST 요청 전에 `[PostgREST] request` 로그: URL, method, apikey 존재여부/길이/앞8자리, Authorization 헤더 존재여부
- `fetch()` 실패 시 `[PostgREST] fetch failed` 로그: URL, error.name, error.message, error.cause
- `fetch()` 자체에 try-catch 추가하여 Network error 상세 캡처
- URL을 `new URL(path, API_BASE_URL)`로 정규화하여 특수문자 인코딩 문제 방지
- Range 헤더 포맷을 `items=0-19` → `0-19`로 수정 (PostgREST 표준)

### 2. GroupBuys/Feeds 실패 분리 (`api.ts`)
- `fetchGroupBuys()`에 try-catch 추가 → `[GroupBuys] fetch failed:` 로그
- `fetchFeeds()`는 기존 `[Feed] fetch failed:` 로그 유지
- 두 호출의 실패를 로그 프리픽스로 구분 가능

### 3. 홈 화면 에러 메시지 개선 (`HomeScreen.tsx`)
- `"로컬 API가 꺼져 있어 샘플 데이터를 표시 중입니다."`
  → `"네트워크 연결 상태를 확인해주세요. (샘플 데이터를 표시 중입니다)"`
- Supabase 전환 후 "로컬 API" 문구가 오해를 주지 않도록 수정

## 검증 절차

### A. 단위 테스트 (자동화)
```bash
cd apps/mobile
npx vitest run src/lib/postgrest-client.test.ts src/api.test.ts src/screens/HomeScreen.redesign.test.tsx
```
- `postgrestFetch diagnostics` — 진단 로그가 fetch 실패/성공 시 정확히 출력되는지 검증
- `public data fetch diagnostics` — `[GroupBuys] fetch failed:` 로그가 별도로 출력되는지 검증
- `shows network-notice fallback copy, not local-API copy` — "네트워크 연결 상태를 확인해주세요." 문구 표시, "로컬 API" 미표시 검증

### B. TypeScript 컴파일
```bash
npm --workspace @gonggu/mobile run typecheck
```
- `tsc --noEmit` 0 에러 확인

### C. Expo Go 실기기 검증 (수동)
1. Metro 번들 재시작: `npm --workspace @gonggu/mobile start` (앱 재실행)
2. 실기기 Expo Go → 앱 실행
3. Metro 로그에서 다음 로그 확인:
   - `LOG  [PostgREST] request { url: ..., method: 'GET', apikey: { exists: true, length: 46, prefix: 'sb_publi' }, hasAuthorization: false }`
   - ✅ `apikey.exists`가 `true`여야 함 → 설정 정상
   - ✅ `apikey.prefix`가 `sb_publi`여야 함 → 올바른 키
   - ❌ `exists: false`면 .env 파일에 `EXPO_PUBLIC_SUPABASE_ANON_KEY` 누락
4. 네트워크 실패 시:
   - `LOG  [PostgREST] fetch failed { url: ..., name: 'TypeError', message: 'Network request failed', cause: ... }`
   - `LOG  [GroupBuys] fetch failed: Network request failed`
   - `LOG  [Feed] fetch failed: Network request failed`
5. 성공 시:
   - `[PostgREST] request` 로그만 출력되고 `[PostgREST] fetch failed` 없음
   - 샘플 데이터 대신 실제 데이터 표시
6. 화면 검증:
   - 에러 발생 시: "네트워크 연결 상태를 확인해주세요. (샘플 데이터를 표시 중입니다)" 문구 노란색 배너로 표시
   - "로컬 API가 꺼져 있어" 문구는 더 이상 나타나지 않음

### D. 네트워크 진단 (실패 시)
`[PostgREST] fetch failed` 로그의 `cause` 필드를 확인:
- `cause`가 `undefined` → DNS/TCP/SSL 레벨 문제
- 실제 cause 객체 → 특정 네트워크 환경 이슈

## 예상되는 원인 (진단 로그 기반 추정)

진단 로그를 통해 실제 네트워크 실패 원인을 특정할 수 있습니다:

1. **apikey 누락** (`exists: false`) → `.env` 파일 또는 Metro 번들링 문제
2. **URL 인코딩 문제** (`new URL()` 경로에서 인코딩 처리했지만, 특정 RN 버전 이슈 가능)
3. **TLS/SSL 핸드셰이크 실패** → 실기기/Expo Go의 네트워킹 스택 차이
4. **DNS64/NAT64 문제** → 일부 셀룰러 네트워크에서 IPv6 전환 시 발생

## 현재까지 확인된 사실
- Mac 터미널 curl: `feed_posts`, `group_buys` 모두 HTTP 200 정상
- 실기기 Chrome: Supabase URL 접속 시 서버 응답 정상 ("No API key found" — 예상된 동작)
- `.env` 파일: `EXPO_PUBLIC_SUPABASE_ANON_KEY` 정상 설정됨 (46자, `sb_publi` 프리픽스)
- `apps/mobile/.env` → `../../.env` 심볼릭 링크 정상
- 앱 최상위 `index.js` → `registerRootComponent(App)` → `App.tsx` → `configurePostgrest(anonKey)` 정상 호출
