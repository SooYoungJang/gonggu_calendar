# GongGu Admin Dashboard

React Admin 기반 관리자 대시보드. Supabase 직접 연동 (ra-supabase).

## Tech Stack

- **React Admin 5** — Admin UI framework
- **ra-supabase** — Supabase data provider + auth provider
- **Vite 8** — Build tool
- **TypeScript 6** — Type safety
- **Recharts** — Dashboard charts
- **Vitest** — Testing

## Setup

```bash
# Install dependencies (from monorepo root)
npm install

# Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_ANON_KEY from Supabase dashboard (Project Settings > API)
```

## Development

```bash
# From monorepo root
npm run admin:dev

# Or from apps/admin
cd apps/admin && npm run dev
```

Runs on `http://localhost:5174`.

## Build

```bash
npm run admin:build
```

Output: `apps/admin/dist/`

## Test

```bash
npm run admin:test
```

## Deployment (Vercel)

1. Connect repo to Vercel
2. Set framework to Vite
3. Set root directory: `apps/admin`
4. Add environment variable: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Deploy

## Features

| Feature | Resource | Status |
|---------|----------|--------|
| Admin Auth (Supabase) | — | ✅ |
| Submission Queue | `gonggu_submissions` | ✅ |
| User Management | `users` | ✅ |
| Group-buy CRUD | `group_buys` | ✅ |
| Stats Dashboard | Aggregated | ✅ |
| Influencers | `influencers` | ✅ (ListGuesser) |
| Feed Posts | `feed_posts` | ✅ (ListGuesser) |
| Raw Posts | `raw_posts` | ✅ (ListGuesser) |

## Architecture

- `src/supabase/client.ts` — Supabase client (Singleton)
- `src/providers/dataProvider.ts` — ra-supabase data provider
- `src/providers/authProvider.ts` — ra-supabase auth provider + admin role check
- `src/pages/` — Resource pages (Dashboard, Submissions, Users, GroupBuys)
- `src/components/` — Reusable components (StatCard)

## RLS Notes (CRITICAL)

The admin app reads/writes directly to Supabase via PostgREST (ra-supabase).
All tables must have proper RLS policies that check `auth.jwt() ->> 'role' = 'admin'`:

```sql
CREATE POLICY "Admin full access" ON gonggu_submissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access" ON group_buys
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

Without RLS, the anon key exposes all data. **Add RLS policies before going live.**

## Legacy Parallel Operation

During the 2-week parallel run:
- Old admin: `apps/api` (NestJS) — continues operating
- New admin: `apps/admin` (React Admin) — direct Supabase
- Both read/write the same Supabase database
- After 2 weeks, shut down the NestJS admin
