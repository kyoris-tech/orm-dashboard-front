# Orm Dashboard

Next.js (App Router) frontend for Orm — recruiter dashboard for resume import,
analysis and metrics. Migrated from the legacy Vite SPA (`decifracv-web-mvp`).
See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for the full migration plan and
feature de-para against the old project.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS 4
- Axios, dayjs, framer-motion, lucide-react, @tanstack/react-table

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the backend connection values
(`API_BASE_URL`, `API_KEY`) pointing at `orm-back-node`.

## Conventions

- All variable, function, class and parameter names are in English.
- No inline comments — code should read clearly on its own; use descriptive
  names instead.
- Feature-based clean architecture: see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md#7-arquitetura-do-projeto-next)
  for the folder layout.
