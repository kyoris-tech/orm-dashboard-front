# Plano de Migração — DecifraCV (Vite) → Orm (Next.js)

> O projeto de origem (`decifracv-web-mvp`) é React 19 + Vite + TypeScript
> (não Vue). A migração é **Vite SPA → Next.js 16 (App Router)**, mantendo
> React, TypeScript e Tailwind, com backend em `orm-back-node` (NestJS + Prisma).

## 1.1 Desempenho e dados (react-query + axios único)

- **Um único axios por lado**: `lib/http/backend-client.ts` (server-only, fala
  com o Nest) e `lib/http/client.ts` (browser, fala só com `/api/*` do
  próprio Next). Nenhuma outra instância axios é criada — evita configuração
  duplicada e interceptors divergentes.
- **TanStack Query** é a única forma de buscar/cachear dados no client a
  partir da Fase 2 (`features/*/hooks`). Nada de `useEffect` + `fetch` solto:
  isso deduplica requisições concorrentes automaticamente, evita refetch
  desnecessário (`staleTime`/`gcTime` configurados em
  `lib/query/query-client.ts`) e cobre retry/erro de forma consistente.
- **`lib/query/keys.ts`** centraliza as query keys — nunca montar array de key
  inline num componente, para não gerar cache duplicado do mesmo dado.
- **Mutations** (`useMutation`) sempre invalidam/atualizam a query key certa
  via `queryClient` em vez de forçar refetch amplo.
- **`useMemo`** para qualquer valor derivado que não seja trivial (filtragem,
  ordenação, `columns` do TanStack Table, mensagens de erro computadas) —
  evita recalcular em cada render. Componentes puramente apresentacionais em
  `components/ui` usam `React.memo`.
- **Sessão do usuário no Header não usa react-query**: o `RootLayout` (Server
  Component) já lê o cookie e passa `user` como prop — zero requisição extra
  no client só para mostrar nome/empresa. React Query fica reservado para
  dados de verdade (resumes, métricas, tabelas) a partir da Fase 2.
- **TanStack Table**: a partir da Fase 3, `columns` e `data` memoizados
  (`useMemo`); paginação/filtragem client-side não deve recriar arrays a cada
  render.

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

### Fase 1 — Fundação (design system + auth real) ✅
- [x] `components/ui`: `Button`, `Input`, `PasswordInput`, `Card`, `Text`,
      `Badge`, `ConfirmDialog`, `ModalPortal`, `OrmLogo` — portados do projeto
      antigo, tipados, memoizados (`React.memo`) e sem duplicação entre
      features. `Toggle` genérico fica para a Fase 2, junto do `ImportToggle`
      que o vai consumir (evita componente sem consumidor ainda).
      Mapeamento: `components/Button.tsx` → `components/ui/Button.tsx`, etc.
- [x] `components/layout`: `Header`, `Footer`, `PageContainer`.
- [x] `components/motion/FadeIn.tsx`: wrapper reutilizável de `framer-motion`.
- [x] `@tanstack/react-query` instalado; `app/providers.tsx` com
      `QueryClientProvider` (um único `QueryClient` por sessão de browser via
      `useState`, `staleTime`/`gcTime`/`refetchOnWindowFocus` configurados) +
      devtools em dev. `lib/query/keys.ts` como fábrica central de query keys.
- [x] `lib/http/client.ts` — único axios client-side, aponta para `/api/*`,
      interceptor 401 → redireciona para `/login`.
- [x] `app/api/auth/login/route.ts` + `app/api/auth/logout/route.ts` (BFF:
      chamam o Nest com `x-api-key` só no servidor, gravam cookies httpOnly).
- [x] `lib/auth/session.ts` — cookie httpOnly do token **e** cookie httpOnly
      com os dados seguros do usuário (nome/empresa/role), lido direto pelo
      `RootLayout` (Server Component) sem custar requisição ao client.
- [x] `features/auth`: `api.ts`, `hooks/use-login-mutation.ts` (React Query
      `useMutation`), `hooks/use-logout-mutation.ts`, `LoginForm.tsx`.
- [x] `app/login/page.tsx`.
- [x] `app/(protected)/layout.tsx` + placeholders `home/page.tsx` e
      `metrics/page.tsx` (conteúdo real nas Fases 2 e 4) — cobertura dupla
      com o `proxy.ts`.
- [x] `npx eslint .` e `npx next build` sem erros; fluxo `/` → redirect
      `/login` testado no browser (proxy funcionando, zero erro de console).

### Fase 2 — Home / Import ✅
- [x] Route Handlers (BFF, token lido do cookie httpOnly server-side):
      `app/api/resumes/recent`, `app/api/resumes/[id]` (DELETE),
      `app/api/resumes/[id]/pdf` (stream binário via `fetch`),
      `app/api/resumes/upload/bulk/start` (multipart via `fetch`, sem axios —
      evita as limitações do adapter Node do axios com `FormData` web),
      `app/api/resumes/upload/bulk/status/[jobId]`.
- [x] `components/ui/SegmentedControl.tsx` — primitivo genérico extraído do
      antigo `ImportToggle`; `features/resumes/components/ImportToggle.tsx`
      agora é só configuração (opções) em cima dele.
- [x] `features/resumes`: `UploadArea`, `RecentImports`, `ResumeCard`
      (memoizado, recebe callbacks via `useCallback` do pai), `ResumeModal`.
- [x] `useBulkUploadMutation` — upload em lote **sem `setInterval`**: uma
      única `useMutation` cujo `mutationFn` inicia o job e faz polling via
      `await` recursivo (intervalo só continua enquanto a mutation está viva,
      cancelamento explícito via `cancelledRef`, progresso exposto por
      `setState` chamado diretamente no fluxo assíncrono — não em efeito).
      Zero listener/interval pendurado, zero requisição perdida.
- [x] `app/(protected)/home/page.tsx` (Server, `metadata`) +
      `home-view.tsx` (Client, estado das abas) — separação necessária
      porque Client Components não exportam `metadata`.
- [x] Assets estáticos portados para `public/` (`whatsapp.svg`, `loader.gif`).
- [x] `lib/utils/phone.ts`, `lib/utils/date.ts` portados de `helpers/*`.
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Testado ponta a ponta no browser contra o `orm-back-node` real**:
      login → `/home` → `RecentImports` carrega dados reais da API →
      `ResumeModal` abre com os dados completos do currículo → Header exibe
      nome/empresa via cookie (zero requisição extra) → logout. Nenhum erro
      de console em nenhuma etapa.

### Fase 3 — Analyze ✅
- [x] `app/api/resumes/route.ts` (GET, repassa querystring + Bearer para o
      Nest, que já faz o ranking de compatibilidade e paginação).
- [x] **`@tanstack/react-table` fixado em `8.21.3`** (`--save-exact`): o
      `npm install` sem versão do início da Fase 0 trouxe a `9.1.2`, que tem
      uma API completamente diferente (`useTable` + sistema de features
      composable, sem `useReactTable`/`getCoreRowModel`/`getSortedRowModel`
      como imports diretos). Como o `decifracv-web-mvp` usa `8.21.3` e é
      essa a API estável documentada, fixei a mesma major/minor/patch em vez
      de reescrever tudo em cima da v9 — evita migrar para uma API ainda não
      validada em produção por ninguém do time.
- [x] `components/ui/DataTable.tsx` e `components/ui/Pagination.tsx` —
      genéricos (`<TData>`), reaproveitáveis por qualquer tabela futura
      (Métricas, Processos, Vagas), sem nada de `resumes` neles.
- [x] `components/ui/SearchInput.tsx` — promovido de dentro do antigo
      `FiltersBar/SearchInput.tsx` para componente de UI genérico.
- [x] `features/resumes`: `CandidateTable` (colunas com `useMemo`, dados
      mapeados com `useMemo`), `AnalyzeSection` (estado de filtros
      draft/applied + busca com `useDebouncedValue`), `FiltersBar`,
      `FilterButton` — `FilterButton` ficou **totalmente controlado**
      (recebe `isApplied` do pai em vez de guardar esse booleano em estado
      local + `useEffect` sincronizando, que era o padrão do componente
      original e o mesmo anti-padrão corrigido na Fase 2).
- [x] `useDeleteResumeMutation` agora invalida `queryKeys.resumes.all`
      (prefixo) em vez de só `recent()` — a mesma mutation de exclusão é
      reusada por `RecentImports` (Home) e `CandidateTable` (Analyze), e
      invalidar pelo prefixo garante que as duas telas ficam consistentes
      sem duplicar lógica.
- [x] `placeholderData: keepPreviousData` na query de busca — troca de
      página/filtro não pisca a tabela para o estado de loading.
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Testado no browser contra o `orm-back-node` real** (aba nova, log de
      console limpo): aba "Analisar Candidatos" busca `/resumes` de verdade
      e renderiza compatibilidade, nome, escolaridade, cargo e localidade
      calculados pelo backend.

### Fase 4 — Métricas ✅ (feature nova, não migração)
- ⚠️ **Não havia nada para migrar**: `MetricsPage.tsx` no
      `decifracv-web-mvp` era um stub (`<>Metrics</>`) e o `orm-back-node`
      não tem nenhum endpoint de métricas. Decisão do usuário: construir um
      dashboard novo agora, calculado no frontend a partir de `GET
      /resumes`, em vez de esperar um endpoint dedicado.
- [x] `components/ui/StatCard.tsx`, `BarList.tsx`, `DailyBarChart.tsx` —
      genéricos, sem lógica de `resumes`, reaproveitáveis por qualquer outro
      dashboard futuro.
- [x] `features/metrics/compute-metrics.ts` — função pura
      (`computeMetrics(resumes) => MetricsSummary`), sem React, fácil de
      testar isoladamente: total de currículos, confiança média de extração,
      tempo médio de processamento, importações por dia (14 dias), top 8
      habilidades, distribuição de escolaridade.
- [x] `features/metrics/api.ts` **reaproveita** `searchResumes` de
      `features/resumes/api.ts` (pede `pageSize=500` numa chamada só) em vez
      de duplicar lógica de fetch.
- [x] `useResumesMetricsQuery` usa `select: computeMetrics` do React Query —
      o cálculo só reroda quando os dados brutos mudam de referência, não a
      cada render.
- [x] `app/(protected)/metrics/page.tsx` (Server, `metadata`) renderizando
      `MetricsView` (Client) direto — aqui não precisou do split
      page/`*-view.tsx` da Home, porque a página em si não tem estado.
- [x] **Decisão consciente**: não usei o campo `compatibility` do backend
      nas métricas — sem filtros de busca ele sempre retorna `100`
      (`calculateMatchScore` do Nest devolve 100 quando não há critério
      nenhum aplicado), então seria um número enganoso numa agregação.
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Testado no browser contra o `orm-back-node` real** (aba nova, console
      limpo): dashboard populado com os dados reais do banco.
- [x] ⚠️ **Achado durante o teste, não é bug do frontend**: o tempo médio de
      processamento aparecia como `0s` porque `processingMs` era calculado
      *antes* do processamento no backend. **Corrigido** em
      [`upload.service.ts`](../orm-back-node/src/resumes/upload/upload.service.ts)
      — o cálculo de `processingMs` foi movido para depois do
      `extractText`/`analyseResume`, logo antes do `prisma.resume.create`.
      `npx tsc --noEmit` do `orm-back-node` passa sem erros. **Requer restart
      do `orm-back-node`** para o Nest recarregar o serviço (se não estiver
      em `start:dev`/watch mode).

### Fase 4.1 — Evolução: gráficos de verdade + escopo por empresa
- [x] `@tanstack/react-table` fixado; agora **`recharts` instalado** para os
      gráficos — segui o skill de dataviz do projeto antes de desenhar:
      forma pela função dos dados (tendência no tempo → área; ranking de
      magnitude → barra horizontal), **uma única cor sequencial** (o azul
      `--color-accent` já usado no design system) em vez de paleta
      categórica — não há múltiplas séries em nenhum gráfico daqui, então a
      checagem de distinção CVD entre cores não se aplica.
- [x] `components/ui/charts/ImportsTimelineChart.tsx` — `AreaChart` com
      wash de ~15%→0% (baseline), linha 2px, grid hairline só horizontal,
      tooltip com crosshair, eixo Y com ticks inteiros.
- [x] `components/ui/charts/RankedBarChart.tsx` — barra horizontal, extremidade
      arredondada 4px no lado do valor (`radius={[0,4,4,0]}`), espessura
      máxima 20px (dentro do limite de 24px do spec), tooltip por barra.
      Substituiu `DailyBarChart.tsx`/`BarList.tsx` (removidos, sem uso
      restante).
- [x] **Escopo por empresa**: `app/api/resumes/metrics/route.ts` (novo Route
      Handler dedicado) busca `/resumes` no Nest e filtra o resultado por
      `resume.company.id === sessionUser.companyId` antes de devolver ao
      client — funciona mesmo para role `admin`, que no backend enxerga
      currículos de todas as empresas (`findAllWithCompatibility` só
      restringe por `companyId` para não-admin). `features/metrics/api.ts`
      passou a chamar esse endpoint em vez de `searchResumes` genérico.
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Testado no browser** (aba nova, console limpo): gráficos renderizam
      com dados reais, eixos com ticks, tooltip funcional.

### Fase 5 — Ações administrativas e polimento ✅
- [x] `app/api/resumes/[id]/restore/route.ts` (PATCH) e
      `app/api/resumes/admin/[id]/permanent/route.ts` (DELETE) — só
      encaminham o Bearer token; a checagem de role `admin` continua sendo
      feita pelo Nest (`RolesGuard`), o Next não duplica essa regra.
- [x] **`src/context/SessionProvider.tsx`** — Context novo (só agora fez
      sentido criar): expõe `useSessionUser()` para componentes profundos
      (`RecentImports`, `CandidateTable`) decidirem, sem prop-drilling, se
      mostram a ação de exclusão permanente (`role === 'admin'`).
- [x] **Exclusão suave vira "desfazer" em vez de confirmação prévia**:
      `useUndoableDelete` (soft delete + toast com "Desfazer" por 6s,
      chamando `restore` se clicado) substitui o `ConfirmDialog` que existia
      antes de cada soft delete — decisão consciente: como a ação já é
      reversível por 6s, um modal de confirmação antes é fricção redundante.
      A exclusão **permanente** continua atrás de `ConfirmDialog` (tone
      `danger`), por ser irreversível de verdade.
- [x] `components/ui/Toast.tsx` — genérico, reaproveitado por
      `RecentImports` e `CandidateTable`.
- [x] 🐛 **Bug pego no teste manual, corrigido antes de fechar a fase**: o
      `Toast` de undo nunca aparecia quando a lista de currículos ficava
      vazia após a exclusão, porque `RecentImports` tinha `return` antecipado
      para loading/erro/vazio *antes* do bloco que renderizava o `Toast` e o
      `ConfirmDialog` de exclusão permanente. Corrigido extraindo o conteúdo
      condicional para uma função interna (`renderContent()`) e deixando
      `Toast`/`ConfirmDialog`/`ResumeModal` sempre montados no retorno
      principal do componente.
- [x] `vercel.json` — **nada a remover**: o `create-next-app` nunca criou um
      (era específico do `vercel.json` de SPA do `decifracv-web-mvp`).
- [x] `metadata` por página — já revisado nas fases anteriores (`Entrar ·
      Orm`, `Início · Orm`, `Métricas · Orm`); nada pendente.
- [x] **`helpers/match.ts` (`calculateMatch`) — decisão consciente de não
      portar**: função já estava morta no `decifracv-web-mvp` (nenhum import
      em nenhum lugar do próprio projeto de origem). Não faz sentido migrar
      código morto para o Next; se a busca por compatibilidade de skills via
      texto livre virar necessidade real, reavaliar então.
      `helpers/maskPhone.ts` já tinha sido portado na Fase 2
      (`lib/utils/phone.ts`).
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Teste ponta a ponta completo no browser** (aba nova, console limpo
      em todas as etapas): login → `/home` → soft delete → toast "Desfazer"
      → clique em Desfazer → currículo volta → `/metrics` (escopado por
      empresa, 3 currículos) → `Analisar Candidatos` → confirmação de
      exclusão permanente abre e cancela corretamente → logout → volta para
      `/login`.

**Pendência que ficou fora do escopo, documentada e não escondida:** não
existe endpoint no backend para *listar* currículos com `deletedAt`
preenchido. Isso significa que, passada a janela de 6s do toast de undo (ou
se o usuário navegar/recarregar a página), não há como restaurar um
currículo pela UI — só via acesso direto ao banco. Se isso virar um problema
real de uso, a solução é um endpoint `GET /resumes?trashed=true` no
`orm-back-node` mais uma tela de "Lixeira", análoga ao que fizemos aqui para
Métricas.

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

---

## 10. Fase 6 — Pós-migração: correções e feature nova (Processos Seletivos)

Trabalho feito depois de fechar as 5 fases originais, a pedido do usuário.

### 10.1 Fix: reload no erro de login
- 🐛 **Bug real**: ao errar a senha, a página parecia "recarregar" e a
  mensagem de erro nunca aparecia. Causa: `lib/http/client.ts` tinha um
  interceptor global que trata **qualquer** 401 como sessão expirada e faz
  `window.location.href = '/login'`. Como login inválido também responde 401
  (repassado pela nossa própria rota `/api/auth/login`), o interceptor
  disparava um reload completo antes da UI conseguir mostrar o erro.
- **Fix**: o interceptor agora ignora esse redirecionamento quando a
  requisição é para `/auth/*` — 401 de login/logout é resultado esperado
  (credencial errada), não sessão expirada, e deve virar estado de erro
  tratado pelo componente (`useLoginMutation`), não um reload forçado.

### 10.2 `cursor-pointer` em todos os botões
- Tailwind Preflight zera o `cursor` de `<button>` para `default` — por isso
  nenhum botão (incluindo o menu pílula `SegmentedControl`) mostrava a mãozinha.
  Resolvido globalmente em `app/globals.css` (`button:not(:disabled) { cursor:
  pointer }` / `button:disabled { cursor: not-allowed }`) em vez de editar
  className em cada um dos ~10 arquivos com `<button>` — mais robusto e cobre
  qualquer botão novo automaticamente.

### 10.3 Feature nova: Processos Seletivos
Não é migração — o `decifracv-web-mvp` não tinha nada parecido. Escopo:
seleção múltipla de candidatos em `CandidateTable`, botão "Abrir Processo
Seletivo", aba "Processos Seletivos" com tabela de processos, clique na linha
abre os candidatos daquele processo num drawer lateral.

**Backend (`orm-back-node`)**:
- [x] `prisma/schema.prisma`: modelos novos `SelectionProcess` (nome, status
      `OPEN`/`CLOSED`, `companyId`, `createdById`) e `SelectionProcessCandidate`
      (join table `selectionProcessId` + `resumeId`, `@@unique` para evitar
      duplicata). Migração `add_selection_process` aplicada
      (`npx prisma migrate dev`) e `npx prisma generate` rodado.
- [x] `src/selection-process/` — módulo Nest no mesmo padrão de `company`/
      `resumes`: `POST /api/v1/selection-processes` (cria processo com os
      currículos selecionados, validando que cada `resumeId` pertence à
      empresa do usuário logado — filtro por `companyId` do JWT, igual o
      resto da API), `GET /api/v1/selection-processes` (lista da empresa,
      com contagem de candidatos), `GET /api/v1/selection-processes/:id`
      (detalhe com candidatos). **Escopado por empresa automaticamente**
      porque toda query já filtra por `user.companyId` do token — não
      depende de o frontend filtrar depois, ao contrário do `/resumes` que
      só restringe para não-admin.
- [x] `npx tsc --noEmit`, `npx nest build` sem erros; testado com o servidor
      rodando de verdade (via `orm-dashboard-front`).

**Frontend (`orm-dashboard-front`)**:
- [x] `components/ui/Checkbox.tsx`, `components/ui/Drawer.tsx` — genéricos,
      novos porque essa é a primeira feature que precisa de seleção múltipla
      e painel lateral.
- [x] `components/ui/Input.tsx` ganhou prop `icon` opcional (default mantém
      o ícone de usuário existente) — reaproveitado pelo diálogo de criação
      de processo em vez de duplicar o componente.
- [x] `types/selection-process.ts`, `app/api/selection-processes/route.ts`
      (GET/POST) e `.../[id]/route.ts` (GET) — mesmo padrão BFF do resto.
- [x] `features/selection-processes/`: `api.ts`, hooks (`useSelectionProcessesQuery`,
      `useSelectionProcessQuery`, `useCreateSelectionProcessMutation`),
      `CreateSelectionProcessDialog`, `SelectionProcessesTable` (reaproveita
      `DataTable`/`Badge`), `SelectionProcessDrawer` (reaproveita `Drawer` e
      **o `ResumeModal` já existente** — clicar num candidato do drawer abre
      o mesmo modal de detalhe usado em Home/Analyze).
- [x] `CandidateTable`: coluna de checkbox (seleção via `RowSelectionState`
      do TanStack Table, `getRowId` fixo no `resume.id` para a seleção
      sobreviver a troca de página/filtro), barra "Abrir Processo Seletivo"
      (desabilitada com 0 selecionados), abre `CreateSelectionProcessDialog`,
      e ao criar com sucesso limpa a seleção e chama `onSelectionProcessCreated`
      — prop opcional que a página usa para trocar a aba automaticamente
      para "Processos Seletivos".
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Testado ponta a ponta no browser** contra o backend real: selecionar
      2 candidatos → botão habilita e mostra contagem → criar processo →
      troca de aba automática → tabela mostra o processo com a contagem
      certa → clique na linha abre o drawer com os 2 candidatos e as datas
      de adição. Zero erros de console em todas as etapas.

**Fora do escopo por ora** (não pedido, não implementado): fechar processo
(`status: CLOSED`), remover candidato de um processo, editar nome do
processo. Se vira necessidade, o padrão dos outros CRUDs do projeto já está
estabelecido para estender rápido.

### 10.4 Cancelar processo seletivo + polimento do botão "Abrir Processo Seletivo"

**Backend**:
- [x] `SelectionProcessService.cancel(id, user)` — escopado por `companyId`,
      idempotente (`BadRequestException` se já `CLOSED`), atualiza `status`
      para `CLOSED`. `PATCH /api/v1/selection-processes/:id/cancel`.

**Frontend**:
- [x] `app/api/selection-processes/[id]/cancel/route.ts` (BFF), `api.ts` +
      `useCancelSelectionProcessMutation` (invalida a lista em `onSettled`,
      não só `onSuccess` — se o cancelamento falhar porque o processo já foi
      cancelado em outra aba/sessão, o cache local se realinha com o
      servidor de qualquer forma).
- [x] `SelectionProcessDrawer`: botão "Cancelar processo seletivo" (só
      aparece quando `status === 'OPEN'`) → `ConfirmDialog` (`tone="danger"`)
      → em erro, a própria mensagem do `ConfirmDialog` mostra o erro do
      backend em vez do texto de confirmação padrão.
- [x] **Fix real no `components/ui/Button.tsx`**: o estado desabilitado não
      ficava visualmente diferente do habilitado quando o botão usava
      `className="!bg-accent"` (`!important` sempre vencia, não importa o
      estado). Corrigido adicionando `variant` (`'primary' | 'accent'`) ao
      `Button` — o desabilitado agora tem tratamento visual próprio
      (`bg-border text-muted opacity-70`) que nenhum variant consegue
      sobrescrever sem querer, porque `text-white`/`text-muted` deixaram de
      coexistir na mesma string de classes (o projeto não usa
      `tailwind-merge`, então classes conflitantes de mesma especificidade
      já causaram problema 2x nesta sessão — vale considerar adicionar
      `tailwind-merge` como dependência se aparecer uma terceira vez).
- [x] Botão "Abrir Processo Seletivo" (`CandidateTable`): fonte menor
      (`text-sm`, ícone 16px em vez de 18px), padding reduzido (`!py-2
      !px-4` em vez do `py-3`/`px-6` padrão), usando `variant="accent"` em
      vez de `!bg-accent` cru.
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Testado no browser**: seleção → botão habilita → criar processo →
      cancelar processo pelo drawer → badge muda para "Cancelado" → tentar
      cancelar de novo retorna erro 400 do backend e a mensagem aparece no
      próprio diálogo. Confirmação visual da cor do botão precisou de um
      passo extra (ver nota abaixo) porque a aba de teste automatizada não
      compõe frames — não é um problema real do app.

> **Nota sobre o teste desta sessão**: a aba do browser usada para testar
> não estava sendo renderizada visualmente (erro "Browser pane is not
> displayed" ao tentar tirar screenshot), o que faz o Chrome congelar
> `transition`s CSS no valor inicial quando consultadas via
> `getComputedStyle` — o botão parecia sempre cinza mesmo habilitado. Só foi
> possível confirmar que a cor certa (`bg-accent`/branco/opacidade 1) é
> aplicada forçando `transition: none` no elemento via JS. Isso é uma
> limitação do ambiente de teste, não do código; num navegador normal a
> transição de ~150ms resolve sozinha.

### 10.5 Vagas Publicadas + vínculo com Processo Seletivo

Campos do formulário de vaga baseados no painel "Informações da Vaga" do
`orm-front-candidate` ([src/pages/Home.tsx](../orm-front-candidate/src/pages/Home.tsx))
— título, modelo, requisitos, diferenciais, faixa salarial, tipo de
contrato (empresa vem do usuário logado, não é campo do form).

**Backend**:
- [x] `prisma/schema.prisma`: modelo `JobOpening` (título, `WorkModel`
      enum, `ContractType` enum, `salaryRange` opcional, `requirements`/
      `differentials` como `String[]` nativo do Postgres — sem tabela
      separada, mais simples que o padrão join-table usado em
      `SelectionProcessCandidate` porque aqui não precisa de metadata por
      item), `status` (`OPEN`/`CLOSED`). `SelectionProcess` ganhou
      `jobOpeningId` opcional + relação. Migração `add_job_opening`
      aplicada.
- [x] `src/job-opening/` — módulo Nest (`POST`/`GET /api/v1/job-openings`),
      escopado por `companyId`, mesmo padrão dos outros módulos.
- [x] `SelectionProcessService`: `create()` aceita `jobOpeningId` opcional
      (valida que a vaga pertence à empresa antes de vincular);
      `linkJobOpening(id, dto, user)` novo — `PATCH
      /api/v1/selection-processes/:id/job-opening`, valida processo E vaga
      pertencem à empresa do usuário.
- [x] `npx tsc --noEmit`, `npx nest build` sem erros.

**Frontend**:
- [x] `components/ui/Select.tsx`, `components/ui/TagListInput.tsx` —
      genéricos novos (select estilizado + lista de tags editável,
      reaproveitada para "Requisitos" e "Diferenciais" no mesmo form).
- [x] `features/job-openings/`: `api.ts`, `labels.ts` (mapas PT-BR pros
      enums), hooks, `CreateJobOpeningDialog` (form completo), `JobOpeningsTable`
      (`DataTable` genérico), `JobOpeningsView` (botão "Adicionar Vaga" +
      tabela) — pluga na aba "Vagas Publicadas" do `home-view.tsx`.
- [x] `JobOpeningPicker` — combo reaproveitado em **dois** lugares: no
      `CreateSelectionProcessDialog` (vincular vaga ao abrir um processo
      novo) e no `LinkJobOpeningDialog` novo (vincular/alterar vaga num
      processo já aberto, acionado pelo `SelectionProcessDrawer`).
- [x] `SelectionProcessesTable` e `SelectionProcessDrawer` mostram a vaga
      vinculada (coluna "Vaga" / botão "Vincular vaga" ou "Alterar vaga").
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] 🐛 **Bug pego no teste manual, corrigido**: `LinkJobOpeningDialog` (e
      também `CreateSelectionProcessDialog`) inicializavam o estado do form
      com `useState(valorInicial)` — como o `AnimatePresence` mantém o
      componente montado entre aberturas (só anima a saída, não desmonta),
      o `useState` só roda uma vez pra sempre, então reabrir "Alterar vaga"
      num processo que já tinha vaga vinculada mostrava "Nenhuma vaga
      vinculada" em vez da vaga atual. Corrigido com o padrão do próprio
      React docs pra "ajustar estado quando uma prop muda" (comparar
      `isOpen` com um `wasOpen` guardado em state, resetar durante o
      render) — **não** um `useEffect`, que o lint do projeto já rejeitou
      duas vezes nesta sessão pelo mesmo motivo (cascata de render).
- [x] **Testado no browser** (JS-driven, não coordenadas — ver nota da
      Fase 10.4 sobre a aba de teste não compor frames): vaga criada com
      requisitos/diferenciais → aparece na tabela → processo seletivo novo
      criado já vinculado à vaga (aparece na coluna "Vaga" da tabela de
      processos) → "Alterar vaga" no drawer abre com a vaga atual
      corretamente pré-selecionada. Zero erros de console em todas as
      etapas.

### 10.6 Drawer de detalhes da vaga (clicar na vaga publicada)

Mesmo padrão do `SelectionProcessDrawer`: clicar na linha da tabela abre um
`Drawer` lateral com os detalhes completos e os processos vinculados.

**Backend**:
- [x] `JobOpeningService.findOne(id, user)` — escopado por `companyId`,
      inclui `selectionProcesses` (com `_count.candidates`). `GET
      /api/v1/job-openings/:id`.

**Frontend**:
- [x] `JobOpeningDetail` (tipo), `getJobOpening` (`api.ts`),
      `useJobOpeningQuery`, `app/api/job-openings/[id]/route.ts` (BFF) —
      mesmo padrão dos outros detalhes.
- [x] `JobOpeningDrawer` — reaproveita `Drawer`, `Badge` (requisitos e
      diferenciais viram badges, não só texto solto) e, principal reuso:
      **o próprio `SelectionProcessDrawer` já existente** — clicar num
      processo vinculado dentro do drawer da vaga abre o drawer do processo
      empilhado por cima (mesmo padrão que abrir `ResumeModal` de dentro do
      `SelectionProcessDrawer`).
- [x] `JobOpeningsTable`: `onRowClick` abre o drawer.
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Testado no browser** (JS-driven): clicar na vaga → drawer com
      modelo/contrato/faixa salarial/requisitos/diferenciais/processo
      vinculado → clicar no processo dentro do drawer → `SelectionProcessDrawer`
      abre empilhado com os dados corretos. Zero erros de console em toda a
      cadeia de drawers aninhados.
