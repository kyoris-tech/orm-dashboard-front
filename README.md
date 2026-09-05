# Orm Dashboard

Next.js (App Router) frontend for Orm — recruiter dashboard for resume import,
analysis and metrics.

**[DOCUMENTATION.md](./docs/DOCUMENTATION.md) is the reference for this project**:
conventions, folder layout, data flow, shared components and step-by-step
recipes. Read sections 1–4 before writing code.

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
- Componentize actively: reuse `src/components/ui/` instead of duplicating JSX.
- Feature-based clean architecture: see
  [DOCUMENTATION.md](./docs/DOCUMENTATION.md#4-organização-e-camadas) for the
  folder layout, and section 3 for the full set of rules.
