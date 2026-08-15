# Plano de Migração — DecifraCV (Vite) → Orm (Next.js)

> O projeto de origem (`decifracv-web-mvp`) é React 19 + Vite + TypeScript
> (não Vue). A migração é **Vite SPA → Next.js 16 (App Router)**, mantendo
> React, TypeScript e Tailwind, com backend em `orm-back-node` (NestJS + Prisma).

## 1. Convenções do projeto

- **Idioma do código**: variáveis, funções, classes, tipos e parâmetros em
  **inglês**. Textos visíveis ao usuário (labels, mensagens) podem ficar em
  português quando fizer sentido para o produto.
- **Sem comentários no código** — nomes descritivos substituem comentários.
- **Componentização máxima**: todo elemento reutilizável (texto, botão, input,
  card, tabela, modal, animação) vira componente de UI compartilhado — nunca
  duplicado entre features.
- **Arquitetura limpa por feature** (ver seção 7).
- Sempre validar com `npx eslint .` e `npx next build` antes de considerar uma
  fase concluída.

## 2. Stack de origem (decifracv-web-mvp)

| Camada         | Tecnologia                                              |
|----------------|------------------------------------------------------------|
| Build tool     | Vite 7                                                       |
| Framework      | React 19 (SPA, sem SSR)                                      |
| Roteamento     | `react-router-dom` v7 (`BrowserRouter` + rotas manuais)       |
| Estilo         | Tailwind CSS 3 + CSS custom (theme.css / global.css)           |
| HTTP           | Axios com interceptors (auth header + 401 → redirect)           |
| Auth           | Context API (`AuthContext`) + `localStorage` (token/user)        |
| Tabelas        | `@tanstack/react-table`                                            |
| Ícones/anim.   | `lucide-react`, `framer-motion`                                      |
| Fontes         | `@fontsource/outfit`                                                   |
| Datas          | `dayjs`                                                                  |
| Deploy         | Vercel (SPA rewrite em `vercel.json`)                                    |

### Estrutura antiga (`src/`)
```
api/            axiosInstance.ts, resumes.ts
components/     Button, Card, ConfirmDialog, Header, ImportToggle, Input,
                InputPassword, OrmLogo, PortalModal, ProtectedRoute,
                RecentImports, ResumeModal, UploadArea
context/        AuthContext.tsx
helpers/        maskPhone.ts, match.ts
pages/          HomePage, LoginPage, MetricsPage
routes/         AppRoutes.tsx
sections/analyze/  AnalyzeSection.tsx, mockData.ts,
                    CandidateTable/{CandidateTable,TableHeader,TablePagination,TableRow}
                    FiltersBar/{FiltersBar,FilterButton,SearchInput}
styles/         global.css, theme.css
```

### Rotas antigas
- `/login` → `LoginPage`
- `/home` → `HomePage` (protegida) — abas Import / Analyze / Process / Job Openings
- `/metrics` → `MetricsPage` (protegida)
- `*` → redirect `/login`

Auth 100% client-side: token em `localStorage`, checagem via `useState`/evento
`storage`, sem validação de servidor por rota.

---

## 3. Backend de referência (orm-back-node)

NestJS + Prisma + PostgreSQL. Módulos: `auth`, `company`, `user`, `resumes`,
`audit-log`. Autenticação por **JWT Bearer** (`passport-jwt`,
`ExtractJwt.fromAuthHeaderAsBearerToken()`) — o backend só entende token no
header `Authorization`, não em cookie.

### Login (`POST /api/v1/auth/login`)
Requer header `x-api-key` (chave da empresa) + `{ email, password }`. Resposta:
`{ access_token, token_type, expires_in, user: { id, name, email, company_id, company_name, role } }`.

### Modelo de dados (Prisma) relevante para o front
- `Company { id, name, email, apiKey, status }`
- `User { id, name, email, status, companyId, roleId → Role.name (admin|mod|recruiter) }`
- `Resume { id, fileName, fullName, email, confidence, processingMs, costBrl, dataJson, companyId, createdById, deletedAt }`
- `AuditLog { entityType, entityId, action, oldValue, newValue, performedByUserId, performedByName }`

### Endpoints de `resumes` usados pelo front
`POST /upload`, `POST /upload/bulk`, `POST /upload/bulk/start`,
`GET /upload/bulk/status/:jobId`, `POST /`, `GET /` (busca/filtros),
`GET /recent`, `DELETE /:id` (soft delete), `DELETE /admin/:id/permanent`
(admin), `PATCH /:id/restore`, `GET /:id/pdf`.

---

## 4. Auth — decisão de arquitetura

O backend só aceita `Authorization: Bearer <token>`, então cookie httpOnly não
pode ser lido diretamente por ele. Solução (BFF pattern) — **melhor opção
disponível agora, sem tocar no backend**:

1. O client nunca chama o Nest diretamente nem guarda o token em
   `localStorage`/JS acessível.
2. `app/api/auth/login/route.ts` (Route Handler) recebe `{ email, password }`,
   chama o Nest com `x-api-key` (fica só no servidor Next), e se OK grava o
   `access_token` em **cookie httpOnly** (`lib/auth/session.ts`).
3. Toda chamada a dados (`resumes`, etc.) passa por Route Handlers do Next
   (`app/api/resumes/...`) que leem o cookie no servidor e reenviam o request
   ao Nest com `Authorization: Bearer`. O browser nunca vê o JWT.
4. `src/proxy.ts` (equivalente ao antigo `middleware.js`, renomeado no
   Next 16) bloqueia acesso a rotas privadas quando o cookie de sessão não
   existe — proteção de UX/roteamento. A autorização real continua sendo
   validada pelo Nest a cada request (nunca confiar só no proxy).
5. `AuthContext`/hook `useSession` no client expõe só os dados não sensíveis
   do usuário (nome, empresa, role) para renderização condicional de UI.

Melhorias futuras (fora do escopo "melhor modo possível por agora"): refresh
token, rotação de cookie, CSRF token nos Route Handlers de mutação, logout
server-side com blacklist.

---

## 5. Stack de destino (orm-dashboard-front)

| Camada         | Tecnologia                                              |
|----------------|------------------------------------------------------------|
| Framework      | Next.js 16 (App Router, TypeScript, Turbopack)               |
| Roteamento     | File-based routing do App Router                              |
| Estilo         | Tailwind CSS 4 (`@theme` em `globals.css`, tokens de cor)       |
| HTTP (server)  | Axios (`lib/http/backend-client.ts`), só usado em Route Handlers |
| Auth           | Cookie httpOnly + `src/proxy.ts` + Route Handlers (BFF)            |
| Tabelas        | `@tanstack/react-table`                                              |
| Ícones/anim.   | `lucide-react`, `framer-motion`                                        |
| Fontes         | `next/font/google` (Outfit)                                              |
| Deploy         | Vercel                                                                     |

---

## 6. Fases da migração

### Fase 0 — Setup do projeto ✅
- [x] `create-next-app` (TypeScript, App Router, Tailwind, ESLint, `src/`).
- [x] `.env.example` / `.env.local` (`API_BASE_URL`, `API_KEY`, `JWT_COOKIE_NAME`).
- [x] `.prettierrc` alinhado ao backend (`singleQuote`, `trailingComma: all`).
- [x] Tokens de design portados para `globals.css` (`@theme`) a partir das
      cores hardcoded do projeto antigo (`#0C3355`, `#007AFF`, `#5C6B7B`, etc.)
      e da keyframe `fadeInDelayed`.
- [x] Fonte Outfit via `next/font/google` no `app/layout.tsx`.
- [x] `next.config.ts` com `turbopack.root` configurado.
- [x] Esqueleto de arquitetura limpa (`config/`, `lib/http`, `lib/auth`,
      `lib/utils`, `types/`) com tipos de domínio espelhando o Prisma
      (`types/domain.ts`, `types/auth.ts`).
- [x] `src/proxy.ts` — guarda de rota inicial (redireciona sem cookie de sessão).
- [x] `npx eslint .` e `npx next build` passando sem erros.

### Fase 1 — Fundação (design system + auth real)
- [ ] `components/ui`: `Button`, `Input`, `PasswordInput`, `Card`, `Text`,
      `Badge`, `ConfirmDialog`, `Modal`/`PortalModal`, `Toggle` — portados do
      projeto antigo, tipados e sem duplicação entre features.
      Mapeamento: `components/Button.tsx` → `components/ui/Button.tsx`, etc.
- [ ] `components/layout`: `Header`, `Footer`, `PageContainer` (substituem o
      que hoje está hardcoded em `App.tsx`).
- [ ] `components/motion`: wrappers de `framer-motion` reutilizáveis
      (`FadeIn`, etc.) para não duplicar animação em cada seção.
- [ ] `app/api/auth/login/route.ts` + `app/api/auth/logout/route.ts`.
- [ ] `lib/auth/session.ts` (já criado) usado pelos Route Handlers acima.
- [ ] `features/auth`: `LoginForm`, hook `useSession` (client, lê dados do
      usuário retornados no login, sem token).
- [ ] `app/login/page.tsx`.
- [ ] `app/(protected)/layout.tsx` — layout com Header/Footer para rotas
      autenticadas (substitui `ProtectedRoute.tsx`, cobertura dupla com o
      `proxy.ts`).

### Fase 2 — Home / Import
- [ ] `app/api/resumes/upload/route.ts`, `app/api/resumes/recent/route.ts`
      (proxy para o Nest com o token do cookie).
- [ ] `features/resumes`: `UploadArea`, `RecentImports`, `ImportToggle`.
- [ ] `app/(protected)/home/page.tsx`.

### Fase 3 — Analyze
- [ ] `app/api/resumes/route.ts` (list/search com filtros).
- [ ] `features/resumes`: `AnalyzeSection`, `CandidateTable/*`, `FiltersBar/*`.
- [ ] `components/ui` de tabela reutilizáveis (`Table`, `TableHeader`,
      `TablePagination`, `TableRow`) — genéricos o bastante para Metrics
      reaproveitar depois.

### Fase 4 — Metrics
- [ ] `app/(protected)/metrics/page.tsx`.
- [ ] Reaproveitar componentes de tabela/card/badge da Fase 3.

### Fase 5 — Ações administrativas e polimento
- [ ] `app/api/resumes/[id]/route.ts` (soft delete), `.../restore`,
      `.../pdf`, `/admin/[id]/permanent` (guardado por role `admin`).
- [ ] Revisar `metadata` por página, remover `vercel.json` (rewrite de SPA
      não se aplica ao Next).
- [ ] Teste ponta a ponta: login → upload → analyze → metrics → logout.
- [ ] Portar `helpers/match.ts` e `helpers/maskPhone.ts` para
      `lib/utils/match.ts` e `lib/utils/phone.ts` (sem comentários, inglês).

---

## 7. Arquitetura do projeto Next (feature-based, clean-ish)

```
src/
  app/
    layout.tsx
    page.tsx                       # redirect -> /home
    globals.css
    login/
      page.tsx
    (protected)/
      layout.tsx                   # Header/Footer + guarda de sessão
      home/
        page.tsx
      metrics/
        page.tsx
    api/
      auth/
        login/route.ts
        logout/route.ts
      resumes/
        route.ts
        recent/route.ts
        upload/route.ts
        [id]/route.ts
        [id]/pdf/route.ts
        [id]/restore/route.ts
        admin/[id]/permanent/route.ts

  components/
    ui/                            # Button, Input, Card, Text, Badge, Modal, Table...
    layout/                        # Header, Footer, PageContainer
    motion/                        # FadeIn e outros wrappers de framer-motion

  features/
    auth/
      components/                  # LoginForm
      hooks/                       # useSession
    resumes/
      components/                  # UploadArea, RecentImports, CandidateTable, FiltersBar
      hooks/
      api.ts                       # fetch client-side para os Route Handlers do próprio Next
    metrics/
      components/

  lib/
    http/
      backend-client.ts            # axios server-only para o Nest (usa API_KEY)
    auth/
      session.ts                   # cookie httpOnly (get/set/clear)
    utils/
      cn.ts
      match.ts
      phone.ts
      date.ts                      # wrappers dayjs

  types/
    domain.ts                      # Status, Role, Company, User, Resume, AuditLog
    auth.ts                        # SessionUser, LoginCredentials, LoginResponse

  config/
    env.ts                         # leitura tipada de variáveis de ambiente

  proxy.ts                         # guarda de rota (equivalente ao antigo middleware.js)
```

Camadas: **domain** (`types/`) → **infra** (`lib/http`, `lib/auth`) →
**application** (`features/*/hooks`, `features/*/api.ts`) → **presentation**
(`components/`, `features/*/components`, `app/`).

---

## 8. Mapeamento rápido de arquivos

| Origem (decifracv-web-mvp)              | Destino (orm-dashboard-front)                          |
|-------------------------------------------|-----------------------------------------------------------|
| `src/main.tsx` + `src/App.tsx`            | `app/layout.tsx` + `app/(protected)/layout.tsx`             |
| `src/routes/AppRoutes.tsx`                | estrutura de pastas do App Router                             |
| `src/components/ProtectedRoute.tsx`       | `src/proxy.ts` + `app/(protected)/layout.tsx`                   |
| `src/pages/LoginPage.tsx`                 | `app/login/page.tsx` + `features/auth/components/LoginForm.tsx`  |
| `src/pages/HomePage.tsx`                  | `app/(protected)/home/page.tsx`                                    |
| `src/pages/MetricsPage.tsx`               | `app/(protected)/metrics/page.tsx`                                   |
| `src/components/Button.tsx` etc.          | `components/ui/*`                                                      |
| `src/context/AuthContext.tsx`             | `features/auth/hooks/useSession.ts` + `app/api/auth/*`                   |
| `src/api/axiosInstance.ts`                | `lib/http/backend-client.ts` (server-only) + `features/*/api.ts` (client) |
| `src/api/resumes.ts`                      | `app/api/resumes/*` + `features/resumes/api.ts`                            |
| `src/helpers/*`                           | `lib/utils/*`                                                                |
| `src/sections/analyze/*`                  | `features/resumes/components/*`                                               |
| `src/styles/*`                            | `app/globals.css` (`@theme`)                                                    |

---

## 9. Pontos de atenção
- `react-router-dom` (`useNavigate`, `Link`, `useLocation`) → `next/navigation`
  (`useRouter`, `redirect`) / `next/link`.
- `import.meta.env.*` → `process.env.*` lido só no servidor via `config/env.ts`
  (nenhuma env sensível fica `NEXT_PUBLIC_*`).
- Interceptor 401 do Axios: nos Route Handlers, ao receber 401 do Nest, limpar
  o cookie de sessão e devolver 401 ao client, que redireciona via
  `useRouter().push('/login')`.
- Download de PDF (`downloadResumePDF`) precisa de Client Component
  (`document.createElement`, `window.URL.createObjectURL`).
- `middleware.js` foi renomeado para `proxy.js`/`proxy.ts` no Next 16 — já
  usamos o nome novo desde o início.
- Vercel: remover `vercel.json` (rewrite de SPA não se aplica a projeto Next).
