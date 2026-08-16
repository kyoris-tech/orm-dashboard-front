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

### 10.7 Adicionar candidato a um processo seletivo já existente

Como o `SelectionProcessDrawer` já é reaproveitado tanto em "Processos
Seletivos" quanto dentro do drawer da vaga (Fase 10.6), essa única mudança
cobre os dois casos que o usuário pediu ("adicionar um candidato em uma
vaga e processo seletivo já existente") — vaga e processo seletivo se
conectam pelo mesmo drawer.

**Backend**:
- [x] `SelectionProcessService.addCandidates(id, dto, user)` — escopado por
      empresa, bloqueia se o processo estiver `CLOSED`
      (`BadRequestException`), ignora silenciosamente currículos que já
      estão no processo (`createMany` só com os que faltam, sem duplicar
      via `@@unique([selectionProcessId, resumeId])` do schema). `POST
      /api/v1/selection-processes/:id/candidates`.

**Frontend**:
- [x] **Extraí a lógica de "currículos escopados por empresa"** (que já
      existia só dentro da rota de métricas) para
      `lib/resumes/get-company-scoped-resumes.ts` — reaproveitada agora por
      **dois** consumidores: `app/api/resumes/metrics/route.ts` (já
      existia) e o novo `app/api/resumes/company/route.ts` (lista completa
      para o seletor de candidatos). Evita duplicar o filtro defensivo por
      `companyId` numa terceira rota.
- [x] `AddCandidatesDialog` — reaproveita `SearchInput` e `Checkbox`
      (ambos já genéricos), busca via `useCompanyResumesQuery` (novo hook),
      filtra localmente por nome e exclui quem já está no processo
      (`existingResumeIds`).
- [x] `SelectionProcessDrawer`: botão "Adicionar candidato" (só quando
      `status === 'OPEN'`, ao lado da contagem de candidatos) abre o
      diálogo; ao confirmar, invalida `selectionProcesses.all` — a lista
      de candidatos do drawer atualiza sozinha.
- [x] `npx eslint .` (0 erros) e `npx next build` sem erros.
- [x] **Testado no browser** contra o backend real: abri um processo com 1
      candidato, cliquei "Adicionar candidato", o seletor mostrou só os
      currículos da empresa que ainda não estavam no processo (excluindo
      corretamente um currículo soft-deleted de um teste anterior — mesmo
      comportamento do resto do app), selecionei um, confirmei, o drawer
      atualizou para "2 candidatos neste processo." sem reload. Zero erros
      de console.

### 10.8 Tela de Administração (Empresas, Usuários, Métricas)

Nova tela `/admin`, com o mesmo padrão de menu pílula (`SegmentedControl`) já
usado em Início, exibindo três abas: **Empresas**, **Usuários** e
**Métricas**. Apenas o role `admin` pode ver o link "Administração" no menu
do header e acessar a rota — usuários sem esse papel são redirecionados para
`/home` no próprio Server Component da página
(`src/app/(protected)/admin/page.tsx`), lendo `getSessionUser()` do cookie
httpOnly antes de renderizar qualquer coisa no cliente.

Nesta primeira entrega, apenas a aba **Empresas** foi totalmente
implementada; Usuários e Métricas ficam com um estado "em construção"
(`ComingSoonSection`), preparando a estrutura para as próximas fases sem
bloquear a entrega.

**Backend**: o módulo `company` já existia (create, listAll, updateStatus)
mas não tinha edição de nome nem rotação de token. Adicionados:
- `PATCH /api/v1/companies/:id` — `UpdateCompanyDto { name }`, grava log de
  auditoria (`UPDATE_NAME`).
- `POST /api/v1/companies/:id/regenerate-token` — gera um novo `apiKey`
  (`randomBytes(24).toString('hex')`, mesmo esquema usado na criação),
  grava log de auditoria (`REGENERATE_TOKEN`).
- Exclusão (soft delete) reaproveita o endpoint já existente
  `PATCH /:id/status` com `status: DELETED`, que já bloqueia excluir a
  própria empresa e empresas com usuários ativos — nenhuma mudança de
  backend foi necessária aqui.

Todas as três rotas continuam protegidas por `@Roles('admin')` +
`RolesGuard`, então mesmo chamando a API diretamente sem ser admin, o
backend responde 403.

**Frontend**: seguindo o padrão dos módulos anteriores —
- `types/company.ts`, `features/admin/companies/api.ts` (client HTTP),
  4 Route Handlers em `app/api/admin/companies/**` como BFF (GET lista,
  PATCH nome, PATCH status, POST regenerate-token), hooks React Query
  (`useCompaniesQuery`, `useUpdateCompanyNameMutation`,
  `useDeleteCompanyMutation`, `useRegenerateCompanyTokenMutation`), todos
  invalidando `queryKeys.companies.all` no sucesso.
- `CompaniesTable.tsx`: tabela `TanStack Table` com colunas Nome, E-mail,
  Status (badge colorido por status) e Criada em, mais uma coluna de Ações
  com três ícones (editar nome, gerar novo token, excluir), desabilitados
  quando a empresa já está `DELETED`.
- `EditCompanyNameDialog.tsx`: reaproveita o padrão de modal com
  `ModalPortal`/`AnimatePresence` e o reset de estado no corpo do render
  (`wasOpen`) para pré-popular o campo com o nome atual sempre que reaberto
  — mesmo problema do `LinkJobOpeningDialog` documentado na seção 10.x foi
  evitado desde o início aqui.
- `NewTokenDialog.tsx`: modal novo, mostra o token gerado uma única vez com
  botão de copiar (`navigator.clipboard`), reforçando que ele não será
  exibido novamente — o backend não guarda o token em texto plano em
  nenhum lugar visível além dessa resposta.
- Exclusão reaproveita o `ConfirmDialog` já existente (tone `danger`),
  assim como a confirmação de regeneração de token (tone padrão).
- Erros de qualquer mutação (nome duplicado, empresa com usuários ativos,
  etc.) são exibidos via `Toast`, extraindo a mensagem do backend com o
  mesmo helper `isAxiosError` usado no cancelamento de processo seletivo.

**Testado no navegador** contra o backend real: acessei `/admin` como
admin, a aba Empresas carregou as duas empresas cadastradas; editei o nome
de "Mux Tech" para "Mux Tech LTDA" e a tabela atualizou sem reload; gerei
um novo token e o modal exibiu a nova chave (confirmada batendo com a
resposta de rede); tentei excluir "Mux Tech LTDA" (que tem usuário ativo)
e o backend corretamente recusou com 403 "Não é possível deletar empresa
com usuários ativos", exibido no Toast. Nenhuma mudança indevida foi
persistida. Zero erros de console fora do 403 esperado do teste de
exclusão bloqueada.

### 10.9 Tooltips em ícones sem label e aba Usuários

**Varredura de tooltips**: percorri todos os componentes que usam
`lucide-react` procurando botões só-com-ícone sem `title`/`aria-label`.
Adicionados nos que faltavam: baixar PDF e excluir (`CandidateTable`,
`ResumeCard`), fechar (`Toast`, `Drawer`, `ConfirmDialog`), adicionar e
remover tag (`TagListInput`), copiar token (`NewTokenDialog`), notificações
(`Header`), e os três ícones de ação de `CompaniesTable` (que já tinham
`aria-label` mas não `title` — sem `title` não existe tooltip visível no
hover, só leitura de acessibilidade). Os botões que já tinham texto visível
ao lado do ícone (ex.: "Cancelar processo seletivo", "Adicionar vaga") não
precisavam de tooltip e foram deixados como estavam.

**Aba Usuários** (dentro de Administração): reaproveita o módulo `user`
que já existia no backend (create, listAll, updateStatus — nenhuma mudança
de backend necessária, ao contrário de Empresas). Adicionados no frontend:
- `types/user.ts`, `features/admin/users/api.ts`, 2 Route Handlers em
  `app/api/admin/users/**` (GET+POST lista/criação, PATCH status), hooks
  React Query (`useUsersQuery`, `useCreateUserMutation`,
  `useUpdateUserStatusMutation`).
- `UsersTable.tsx`: colunas Nome, E-mail, Empresa, Permissão, Status,
  Criado em, e uma coluna de Ações com dois ícones — bloquear/ativar
  (alterna `ACTIVE`↔`BLOCKED`) e excluir (soft delete para `DELETED`). O
  botão de excluir fica desabilitado no próprio usuário logado (mesma regra
  que o backend já aplicava — `ForbiddenException` — mas bloqueada também
  na UI com tooltip explicando o motivo, evitando a viagem de rede
  desnecessária).
- `CreateUserDialog.tsx`: formulário com nome, e-mail, senha (mínimo 6
  caracteres, via `PasswordInput`) e, conforme pedido, um **select com o
  nome das empresas** (`useCompaniesQuery` reaproveitado da aba Empresas,
  populando `<Select>` com `{value: company.id, label: company.name}` e
  filtrando empresas já excluídas) em vez de exigir o UUID da empresa
  digitado à mão. Select de permissão com as três roles do backend
  (Administrador/Moderador/Recrutador).

**Testado no navegador**: criei o usuário "Teste QA" selecionando "Mux Tech
LTDA" pelo nome no select (POST 200, apareceu na tabela sem reload);
bloqueei o mesmo usuário e o status mudou para "Bloqueado" ao vivo; conferi
que o botão de excluir do próprio usuário logado (Paulo Paiva) está
desabilitado com o tooltip "Você não pode excluir seu próprio usuário".
Zero erros de console além do 403 esperado de um teste anterior de exclusão
bloqueada.

### 10.10 Ocultar usuários excluídos + exportação LGPD

**Tabela de usuários**: agora filtra `status !== 'DELETED'` no cliente antes
de montar as linhas do `TanStack Table` — usuários excluídos (soft delete)
somem da listagem principal, mas continuam no banco (nada muda no
backend aqui).

**Exportação de usuários**: novo botão "Exportar usuários" ao lado de
"Adicionar usuário", que baixa um CSV (`;` como separador e BOM UTF-8,
formato que o Excel PT-BR abre corretamente com acentuação) com **todos**
os usuários da base, inclusive bloqueados e excluídos — diferente da
tabela, que só mostra os ativos/bloqueados no dia a dia.

- Backend: `GET /api/v1/users/export` (`admin` only) — busca todos os
  usuários (`findMany` sem filtro de status) e cruza com `AuditLog`
  (`entityType: 'USER'`, `action: 'UPDATE_STATUS'`) para reconstruir,
  por usuário, a última vez que o status virou `BLOCKED` e a última vez
  que virou `DELETED`, junto com quem executou cada mudança
  (`performedByName`). Nenhuma tabela nova — reaproveita o log de
  auditoria que já existia.
- Colunas do CSV: ID, Nome, E-mail, Empresa (ID e nome), Permissão, Status
  atual, Data de cadastro, Última atualização, Data de bloqueio + quem
  bloqueou, Data de exclusão + quem excluiu — cobrindo o que a LGPD exige
  para prestar contas sobre tratamento e eliminação de dados pessoais
  (quem processou, quando, e o histórico de mudanças de status de cada
  titular).
- Frontend: `exportUsers()` no `api.ts`, Route Handler
  `app/api/admin/users/export`, `useExportUsersMutation` (mutation simples,
  sem cache — é uma ação, não uma leitura) e `exportUsersToCsv()` que
  monta o CSV (`lib/utils/csv.ts`, novo utilitário reutilizável) e dispara
  o download via `Blob` + link temporário no navegador.

**Testado no navegador**: confirmei que um usuário com status `DELETED`
(criado e depois bloqueado/excluído durante os testes da feature
anterior) sumiu da tabela de Usuários, mas apareceu completo na resposta
de `/api/admin/users/export` com `blockedAt`/`blockedBy` e
`deletedAt`/`deletedBy` preenchidos corretamente com o timestamp e o
e-mail de quem executou cada ação. Cliquei no botão real "Exportar
usuários" na UI e confirmei a chamada de rede 200 e o botão retornando ao
estado normal após o download. `eslint`/`next build` e `tsc`/`nest build`
limpos nos dois repos.

### 10.11 Exportação de usuários em PDF + bloqueio de empresas

**Exportação em PDF**: ao lado de "Exportar CSV", novo botão "Exportar
PDF" que gera o mesmo conteúdo (todos os usuários, inclusive bloqueados e
excluídos, com histórico de bloqueio/exclusão) num PDF timbrado com a
marca Orm/Kyoris — faixa superior na cor primária da marca com o logo Orm
(rasterizado do SVG para PNG via `<canvas>` no navegador, sem depender de
plugin de SVG no jsPDF) e o nome "Kyoris Tech" (controlador dos dados),
faixa inferior na cor de destaque com data de geração e numeração de
página, repetidas em todas as páginas via o hook `didDrawPage` do
`jspdf-autotable`. Bibliotecas novas: `jspdf` e `jspdf-autotable`
(client-side, sem infraestrutura de geração de PDF no servidor).

- `lib/utils/branding.ts`: paths do `OrmLogo` reaproveitados em uma
  versão para fundo escuro (fill branco), cores da marca e o nome do
  controlador (`Kyoris Tech`) centralizados aqui.
- `lib/utils/pdf.ts`: `svgToPngDataUrl` (rasteriza o SVG via `Image` +
  `canvas` em 2x para nitidez) e `hexToRgb` (jsPDF trabalha com RGB
  numérico).
- `features/admin/users/export.ts`: `exportUsersToPdf()`, paisagem A4,
  mesmas 10 colunas do CSV.

**Bloqueio de empresas**: `CompaniesTable` ganhou um quarto ícone de ação
(bloquear/ativar, ao lado de editar nome/token/excluir), alternando entre
`ACTIVE` e `BLOCKED` via o endpoint que já existia
(`PATCH /companies/:id/status`) — nenhuma mudança de backend foi
necessária, porque o `AuthService.login` **já** rejeitava login de
empresas com `status !== 'ACTIVE'` desde a migração original (mensagem
"Empresa inativa ou bloqueada"), então bastou expor essa capacidade na UI.
Criado `useUpdateCompanyStatusMutation` (genérico, usado tanto para
bloquear/ativar quanto para excluir, substituindo o hook dedicado
`useDeleteCompanyMutation` que existia antes).

**Testado**: bloqueei "Mux Tech LTDA" pela UI (PATCH 200, badge mudou para
"Bloqueada" sem reload) e confirmei via `curl` direto no backend que um
login com a `x-api-key` dessa empresa passou a retornar 403 "Empresa
inativa ou bloqueada" imediatamente — depois reativei a empresa e
confirmei que o status voltou a `ACTIVE`. Testei "Exportar PDF" na aba
Usuários: a chamada de rede para `/admin/users/export` retornou 200, a
geração assíncrona do PDF (rasterização do logo + tabela) terminou sem
erros e o botão voltou ao estado normal, sem toast de erro.
`eslint`/`next build` limpos (0 erros) nos dois repos.

Nota de metodologia de teste: durante os testes anteriores desta sessão eu
removia manualmente do DOM, via JS, modais que ficavam presos em
`opacity: 0` (limitação conhecida do ambiente de teste com animações do
Framer Motion, documentada na seção de Erros e Correções). Descobri que
isso corrompe a árvore interna do React e trava cliques subsequentes no
componente — a partir de agora, prefiro um reload de página a remover nós
gerenciados pelo React diretamente.

### 10.12 Filtro por empresa na aba Usuários

Novo select "Empresa" acima da tabela de Usuários, com "Todas as
empresas" + o nome de cada empresa cadastrada (reaproveitando
`useCompaniesQuery`, mesma fonte de dados do select do formulário
"Adicionar usuário"). Filtragem 100% client-side sobre os dados já
carregados por `useUsersQuery` — sem nova chamada de rede a cada troca de
empresa — combinada com o filtro de excluídos já existente (`status !==
'DELETED'`). Mensagem de tabela vazia diferenciada quando o filtro está
ativo ("Nenhum usuário para esta empresa.") do estado sem filtro nenhum
("Nenhum usuário cadastrado ainda.").

**Testado no navegador**: selecionei "Kyoris Tech" e a tabela passou a
mostrar só o usuário dessa empresa; troquei para "Mux Tech LTDA" e
mostrou só o usuário dela; voltei para "Todas as empresas" e os dois
usuários reapareceram. `eslint`/`next build` limpos (0 erros).

### 10.13 Select de empresa na mesma linha dos botões + aba Métricas

**Layout**: o select "Empresa" da aba Usuários (seção 10.12) subiu para
`UsersView`, na mesma linha flex dos botões de exportar/adicionar
(`justify-between`, select à esquerda e botões à direita) em vez de ficar
numa linha própria dentro de `UsersTable`. `UsersTable` agora recebe
`companyFilter` como prop controlada em vez de gerenciar o próprio estado
— `ALL_COMPANIES_VALUE` foi extraído para `features/admin/users/constants.ts`
para ser compartilhado entre os dois componentes sem duplicar o valor
sentinela.

**Aba Métricas**: dashboard administrativo global (todas as empresas, ao
contrário de "Relatórios" que é escopado à empresa do usuário logado),
reaproveitando os mesmos componentes de gráfico
(`ImportsTimelineChart`, `RankedBarChart`, `StatCard`) e a mesma lógica de
`compute-metrics.ts` como base, estendida em
`compute-admin-metrics.ts` com:
- **Consumo de IA**: soma e média de `costBrl` (campo que já existia no
  modelo `Resume` mas não era exibido em lugar nenhum do front) — direto
  do backend, sem endpoint novo, reaproveitando `GET /resumes` que a rota
  genérica `/api/resumes` já expõe (o backend já retorna todos os
  currículos de todas as empresas para quem é `admin`, então nenhuma
  mudança de backend foi necessária).
- **Currículos por empresa**: novo gráfico de barras (`RankedBarChart`)
  agrupando os currículos por `companyId`.
- **Cards de empresas/usuários**: ativos vs. total e bloqueados,
  calculados a partir dos dados já buscados por `useCompaniesQuery` e
  `useUsersQuery` (nenhuma chamada de rede extra).
- **Exportar relatório**: botão que gera um CSV com uma linha por empresa
  (currículos importados, custo total e médio de IA, confiança média,
  tempo médio de processamento) mais uma linha de total geral — dado
  claramente acionável para acompanhar consumo/custo por cliente.

**Testado no navegador**: acessei a aba Métricas em Administração e
confirmei os números batendo com os dados reais (2 currículos, custo
total e médio de IA corretos, 90% de confiança média, breakdown "Currículos
por empresa" mostrando só Kyoris Tech, que é quem tem currículos
importados). Cliquei em "Exportar relatório" e não houve toast de erro
(download disparado). Confirmei visualmente via `getBoundingClientRect`
que o select de empresa e o botão "Exportar CSV" da aba Usuários agora
compartilham a mesma linha. `eslint`/`next build` limpos (0 erros).

### 10.14 Select de período nas Métricas

Novo select "Última semana / Últimos 15 dias / Último mês" (7/15/30 dias)
no topo da aba Métricas, ao lado do botão "Exportar relatório". Diferente
do gráfico de importações da versão anterior (que já tinha uma janela fixa
de 14 dias só para o próprio gráfico), agora **todo** o dashboard —
cards, gráfico de linha do tempo, breakdown por empresa, habilidades e
escolaridade, e o CSV exportado — é recalculado sobre os currículos
filtrados pelo período escolhido (`compute-admin-metrics.ts` agora recebe
`periodDays` e filtra `createdAt >= hoje - periodDays` antes de qualquer
agregação; os cards de empresas/usuários ativos continuam sendo
snapshot do estado atual, não fazem sentido filtrados por período).
`periodDays` também define quantos dias o gráfico de importações mostra,
eliminando a constante fixa que existia antes.

**Testado no navegador**: troquei entre as três opções e confirmei que o
número de dias no eixo do gráfico muda (7, 15 ou 30 pontos) e que os
títulos das seções ("Currículos por empresa (X dias)" etc.) refletem o
período selecionado. Também confirmei — abrindo uma aba nova e limpa do
navegador para descartar erros de console remanescentes de testes
anteriores, que se mostraram ser apenas histórico obsoleto do harness de
teste e não bugs reais — que a página carrega sem nenhum erro de console
em qualquer um dos três períodos, e que "Exportar relatório" continua
funcionando. `eslint`/`next build` limpos (0 erros) nos dois repos.

### 10.15 Ciclo de vida de processos seletivos + métricas de recrutamento em Relatórios

**Pesquisa**: KPIs que times de RH/recrutamento tipicamente acompanham em
relatórios de processos seletivos — funil por status, taxa de conversão
(contratações / processos abertos), tempo até a contratação
("time-to-hire"), tamanho médio do pool de candidatos por processo, taxa
de cancelamento e vagas com maior volume de candidatos — foram usados como
base para a nova seção "Processos seletivos e candidatos" em Relatórios,
calculados 100% a partir de dados já existentes (nenhuma tabela nova).

**Backend**: `SelectionProcessStatus` deixou de ter só `OPEN`/`CLOSED` e
passou a ter 4 estados: `OPEN` (em andamento), `CLOSED` (fechado sem
contratação), `CANCELLED` (cancelado) e `CONCLUDED` (concluído com
contratação). Como o botão de cancelar já existia e usava `CLOSED` para
esse fim, rodei uma migração de dados
(`prisma/migrations/.../reclassify_closed_as_cancelled`) reclassificando
os registros `CLOSED` pré-existentes para `CANCELLED` — preservando o
significado original — antes de `CLOSED` passar a significar outra coisa.
Novos campos em `SelectionProcess`: `selectedResumeId` (+ relação
`selectedResume`), `closedAt`, `cancelledAt`, `concludedAt`. Novos
endpoints:
- `PATCH /selection-processes/:id/close` — fecha sem selecionar candidato.
- `PATCH /selection-processes/:id/conclude` — recebe `{ resumeId }`,
  valida que o candidato pertence ao processo, grava `selectedResumeId`
  + `concludedAt` e muda o status para `CONCLUDED`.
Todas as transições (cancelar/fechar/concluir/adicionar candidato) agora
exigem `status === 'OPEN'`, com mensagens de erro consistentes.

**Frontend**:
- `SelectionProcessDrawer`: quando `OPEN`, mostra três ações —
  **Concluir processo** (abre `ConcludeSelectionProcessDialog`, novo
  componente com seleção via rádio, novo componente de UI compartilhado
  `Radio.tsx` já que o design system só tinha `Checkbox`), **Fechar
  processo** e **Cancelar** (ambos com `ConfirmDialog`). Quando
  `CONCLUDED`, mostra um card destacando o candidato escolhido e a data de
  conclusão.
- `SELECTION_PROCESS_STATUS_LABELS`/`TONES` centralizados em
  `features/selection-processes/labels.ts` e reaproveitados em
  `SelectionProcessesTable`, `SelectionProcessDrawer` e
  `JobOpeningDrawer` (que tinha a mesma lógica de badge duplicada).
- Relatórios (`MetricsView`) ganhou `RecruitmentMetricsSection`: cards de
  processos abertos, taxa de conversão, tempo médio até a contratação,
  candidatos por processo, taxa de cancelamento e contratações concluídas;
  breakdown visual dos 4 status; gráfico de vagas com mais candidatos; e
  uma lista das últimas contratações com nome do candidato, vaga e data.
  O hook `useRecruitmentMetricsQuery` reaproveita a mesma query key de
  `useSelectionProcessesQuery` (cache compartilhado — nenhuma requisição
  duplicada entre a aba Processos Seletivos e Relatórios).

**Testado no navegador**: confirmei que um processo cancelado antes desta
mudança apareceu corretamente como "Cancelado" (migração de dados
funcionou). Concluí "Vaga Front-end Senior" escolhendo "Daniela Ferreira"
— o drawer passou a mostrar "Candidato escolhido: Daniela Ferreira" e a
tabela atualizou para "Concluído" sem reload. Criei e fechei um processo
via chamada direta à API para validar o fluxo de "Fechar processo"
(`status: CLOSED`, `closedAt` preenchido) e confirmei "Fechado" na
tabela. Na aba Relatórios, a nova seção mostrou números batendo com esse
estado (3 processos, 33% de conversão, 67% de cancelamento, 1 contratação
concluída, "Daniela Ferreira" em "Últimas contratações"). Zero erros de
console em aba limpa do navegador. `eslint`/`next build` e
`tsc`/`nest build` limpos (0 erros) nos dois repos.

### 10.16 Encerrar processo seletivo também encerra a vaga vinculada

Ao **concluir**, **fechar** ou **cancelar** um processo seletivo (qualquer
uma das três formas de encerrá-lo), o backend agora verifica se a vaga
vinculada (`jobOpeningId`) ainda tem algum outro processo **em
andamento**. Se não tiver nenhum, a vaga publicada é automaticamente
marcada como `CLOSED`. Essa checagem evita fechar uma vaga
prematuramente quando ela tem mais de um processo seletivo ativo ao
mesmo tempo — só fecha quando o último processo em andamento daquela
vaga é encerrado.

- `SelectionProcessService.closeLinkedJobOpeningIfNoOpenProcesses()`
  (privado, reaproveitado pelos três métodos `cancel`/`close`/`conclude`):
  busca a vaga, ignora se já está `CLOSED`, conta processos `OPEN`
  restantes vinculados a ela e só então fecha.
- Frontend: os três hooks de mutação de processo
  (`useCancelSelectionProcessMutation`, `useCloseSelectionProcessMutation`,
  `useConcludeSelectionProcessMutation`) passaram a invalidar também
  `queryKeys.jobOpenings.all`, já que o status da vaga pode ter mudado
  como efeito colateral. `SelectionProcessDrawer` ganhou um badge "Vaga
  aberta"/"Vaga fechada" ao lado do nome da vaga vinculada, deixando esse
  efeito visível sem precisar navegar até Vagas Publicadas.

**Testado via API e no navegador**: criei um processo vinculado à vaga
"Senior Frontend React Developer" e o concluí — a vaga passou de `OPEN`
para `CLOSED` automaticamente. Testei o guard criando uma vaga nova com
dois processos simultâneos: cancelar o primeiro manteve a vaga `OPEN`
(o segundo processo ainda estava em andamento); só depois de cancelar o
segundo também a vaga fechou. Confirmei na UI que "Vagas Publicadas"
mostra "Fechada" para ambas as vagas de teste, e que o drawer do processo
mostra o badge "Vaga fechada". Zero erros de console. `eslint`/`next
build` e `tsc`/`nest build` limpos (0 erros) nos dois repos.

### 10.17 Auditoria e correções de segurança

Varredura de APIs desprotegidas, vazamentos e problemas multi-tenant nos
dois repos. Modelo confirmado com o cliente: **`admin` é o operador global
(Kyoris), com poder sobre todas as empresas; tenants só têm `mod`/
`recruiter`**. Correções aplicadas:

**CRÍTICO — Segredo JWT público / typo:** `auth.module.ts` assinava com
`process.env.JWT_SERCRET` (escrito errado) e `jwt.strategy.ts` verificava
com `JWT_SECRET`; nenhum estava no `.env`, então ambos caíam no fallback
público `'orm-dev-secret'` — qualquer um podia forjar um JWT de admin.
Unificado em `getJwtSecret()` ([src/config/jwt.ts]) que **falha o boot** se
`JWT_SECRET` não existir (sem fallback inseguro); gerado um segredo forte
aleatório no `.env`. Verificado: token forjado com o segredo antigo agora
retorna 401; boot falha sem a env.

**CRÍTICO — Isolamento multi-tenant:** o poder cross-company do admin é
intencional (operador Kyoris), mas nada impedia criar um `admin` dentro de
um tenant, o que quebraria o isolamento. `UserService.create` agora rejeita
(`403`) criar role `admin` fora da empresa do admin que está criando —
como todo admin é da Kyoris, isso confina admins à Kyoris por indução.
Verificado: criar admin na Mux → 403; criar recruiter na Mux → 201.

**ALTO — Brute-force no login:** instalado `@nestjs/throttler`. Como a
arquitetura BFF faz o backend enxergar só o IP do servidor Next, o
`LoginThrottlerGuard` limita **por e-mail** (5/min) — protege a conta-alvo
contra ataque direto à API ou via front, sem falso bloqueio de outros
usuários. Verificado: 5ª tentativa → 429.

**MÉDIO/BAIXO:**
- Paginação: `pageSize`/`page` validados (`@IsNumberString`) e clampados
  (`parsePagination`, máx 2000) — evita payload gigante; usos legítimos
  (métricas admin) seguem funcionando. Verificado: `pageSize=abc`→400,
  `pageSize=999999999`→200 clampado.
- IDOR no status de bulk upload: agora escopado ao dono
  (`ownerId`+`companyId`) e com limpeza por TTL (10min) da memória.
- Swagger `/docs` só sobe fora de produção; CORS configurável via
  `CORS_ORIGINS`.
- Corrigido typo `'Recruiter'` no tipo do decorator `@Roles`.

**Confirmado como correto (sem mudança):** JWT nunca exposto ao JS do
cliente (cookie httpOnly + BFF); `selection-process`/`job-opening`
escopados por `companyId`; rotas admin do Next encaminham o token do
próprio usuário e o backend é a autoridade (`@Roles('admin')`), sem
escalonamento; `.env` fora do versionamento; `ValidationPipe` global com
`whitelist`.

Nota operacional: o throttler usa storage em memória — para múltiplas
instâncias em produção, trocar por um store compartilhado (ex.: Redis).
Login e navegação validados no navegador após as mudanças (zero erros de
console). `eslint`/`next build` e `tsc`/`nest build` limpos.

### 10.18 Marca d'água no PDF de currículo + favicon com o logo Orm

**Marca d'água no PDF** (`orm-back-node`): o download de currículo em PDF
(`resume-pdf.service.ts`, gerado com `pdfkit`) agora sai timbrado:
- Cabeçalho com o logo "Orm" (desenhado via `doc.path()` reaproveitando
  exatamente os mesmos paths vetoriais do `OrmLogo.tsx` do front — sem
  rasterização, sem dependência nova) + "Gerado por Orm · Kyoris Tech" à
  direita + linha divisória na cor de destaque da marca.
- Marca d'água diagonal do logo em baixa opacidade (6%), centralizada,
  atrás do conteúdo.
- Rodapé "Documento confidencial · Orm / Kyoris Tech".
- Tudo reaplicado em cada página via o evento `pageAdded` do PDFKit, para
  currículos que geram mais de uma página.

Paths do logo centralizados em `src/common/branding/orm-logo.ts` (novo).

**Armadilha do PDFKit encontrada e corrigida**: chamar `doc.text()` dentro
do handler de `pageAdded` pode recursar infinitamente — o PDFKit decide se
precisa paginar comparando `y` com `page.maxY()` (altura da página menos a
margem inferior), e como o rodapé é desenhado propositalmente dentro da
margem inferior, ele disparava uma nova página, que disparava o mesmo
`pageAdded`, num loop até `RangeError: Maximum call stack size exceeded`.
Corrigido zerando temporariamente `doc.page.margins.bottom` só durante o
desenho do rodapé (restaurado logo em seguida) e usando `lineBreak: false`
nos textos do cabeçalho/rodapé (que são de uma linha só, sem necessidade
de quebra automática).

**Favicon** (`orm-dashboard-front`): substituído o `favicon.ico` estático
padrão do Next por ícones **gerados dinamicamente** com o logo real da
Orm, via `ImageResponse` (`next/og`):
- `src/app/icon.tsx` — 64×64, fundo azul-marinho da marca + wordmark "Orm"
  em branco (mesmos paths SVG do `OrmLogo.tsx`, embutidos como data URI em
  `lib/branding/orm-logo-svg.ts`).
- `src/app/apple-icon.tsx` — 180×180, mesmo design (ícone de tela inicial
  no iOS).
- Removido `src/app/favicon.ico` para não concorrer com os novos ícones.
- `proxy.ts`: o matcher do middleware excluía `favicon.ico` mas não as
  novas rotas `/icon`/`/apple-icon` — sem usuário logado, essas rotas
  caíam no redirect para `/login` (307), quebrando o favicon para
  visitantes deslogados. Corrigido incluindo `icon` e `apple-icon` na
  exclusão do matcher.

**Testado**: baixei os dois currículos de teste via API direta e via
front real (clique no botão "Baixar PDF") — PDF 200 OK, timbrado
corretamente (cabeçalho, marca d'água diagonal e rodapé visíveis, sem
sobrepor o texto do currículo), zero erro no servidor. `/icon` e
`/apple-icon` retornam 200 `image/png` mesmo sem sessão (visitante
deslogado também vê o favicon correto); confirmado no navegador que
`<head>` só tem os dois `<link rel="icon">`/`<link rel="apple-touch-icon">`
novos, sem favicon antigo conflitando. Zero erros de console em aba
limpa. `tsc`/`nest build` e `eslint`/`next build` limpos (0 erros) nos
dois repos.

## 10.19 Cancelar vaga publicada + auditoria das ações de vagas/processos

**Contexto**: até aqui, uma vaga publicada só saía do status "Aberta"
automaticamente (quando todos os processos seletivos vinculados eram
fechados/cancelados/concluídos). Não havia como um recrutador cancelar
manualmente uma vaga que deixou de ser necessária. Além disso, uma
auditoria ao backend revelou que `job-opening.service.ts` e
`selection-process.service.ts` nunca chamavam `AuditLogService` —
diferente de `company.service.ts`/`user.service.ts` (que já registravam
alterações de status/nome) e de `resumes.service.ts` (que já registrava
download/exclusão/restauração de currículos direto via
`prisma.auditLog.create`). Ou seja, criar/cancelar/fechar/concluir vaga
e processo seletivo não deixava nenhum rastro auditável.

**Backend**:
- `prisma/schema.prisma`: `JobOpeningStatus` ganhou o valor `CANCELLED`;
  `JobOpening` ganhou `cancelledAt DateTime?`. Migração
  `20260816023707_job_opening_cancelled_status`.
- `job-opening.service.ts`: novo método `cancel()` — exige status
  `OPEN`, marca a vaga como `CANCELLED` e, na mesma transação, cancela
  em cascata todos os processos seletivos `OPEN` vinculados a ela
  (espelhando o comportamento inverso já existente: fechar o último
  processo seletivo de uma vaga a encerra automaticamente). Registra
  `AuditLog` tanto da vaga quanto de cada processo cancelado em
  cascata.
- `job-opening.controller.ts`: nova rota `PATCH /job-openings/:id/cancel`.
- `job-opening.service.ts`/`selection-process.service.ts`: injetado
  `AuditLogService`; todas as ações que alteram estado (`create`,
  `cancel`, `close`, `conclude`, e o fechamento automático de vaga sem
  processos abertos) agora gravam um registro de auditoria com
  entidade, ação, valor antigo/novo e quem executou.
- Novo endpoint de leitura, admin-only (`@Roles('admin')`):
  `GET /api/v1/admin/audit-logs?entityType=&page=&pageSize=`, paginado
  (25 por página, máx. 100), mais recentes primeiro. `AuditLogModule`
  ganhou `AuditLogController`.

**Frontend**:
- `types/job-opening.ts`: `JobOpeningStatus` ganhou `'CANCELLED'`.
- `features/job-openings/labels.ts`: labels/tons de status
  (`JOB_OPENING_STATUS_LABELS`/`_TONES`) reaproveitados na tabela, no
  drawer da vaga e no badge de vaga vinculada dentro do drawer de
  processo seletivo (antes hardcoded para só Aberta/Fechada).
  Cancelamento
- `JobOpeningDrawer.tsx`: botão "Cancelar vaga" (mesmo padrão visual e
  de confirmação do "Cancelar processo" já existente), visível apenas
  quando a vaga está `OPEN`, com `ConfirmDialog` avisando que os
  processos seletivos em andamento vinculados também serão cancelados.
- Nova aba **Auditoria** no painel Admin (`/admin`, visível apenas para
  `admin` — a Kyoris): lista paginada de todos os `AuditLog`, com
  filtro por entidade (Empresa/Usuário/Vaga/Processo
  seletivo/Currículo), coluna "Alteração" truncada em 60 caracteres
  (com `title` mostrando o valor completo) para não estourar a tabela
  quando o valor auditado é um JSON grande (ex.: payload completo de um
  currículo excluído).
- `src/features/admin/audit/*`: `api.ts`, `labels.ts`,
  `hooks/use-audit-logs-query.ts`, `components/AuditLogTable.tsx`,
  `components/AuditLogView.tsx`; rota BFF
  `src/app/api/admin/audit-logs/route.ts`.

**Validação**: `tsc --noEmit` + `nest build` limpos no backend;
`eslint` (0 erros) + `next build` limpos no frontend. Testado ao vivo:
cancelei a vaga "Teste Máscara Salário" pelo drawer — status mudou para
"Cancelada" na tabela e no drawer; conferi na aba Auditoria (admin) que
o evento apareceu no topo da lista (`Vaga · Cancelamento · OPEN →
CANCELLED`), junto com o histórico pré-existente de ações de
currículos/empresas/usuários agora com rótulos amigáveis. Testei
paginação (2 páginas, 29 registros) e o filtro por entidade (Vaga →
mostra só o registro relevante). Zero erros de console em aba nova.

## 10.20 Link público de compartilhamento da vaga (só a geração do link)

**Escopo combinado com o usuário**: por enquanto só a criação/exposição
do link (`/vagas/:código`) para o recrutador copiar e compartilhar com
candidatos — a página pública em si (`/vagas/[code]`) fica para depois.

**Backend**:
- `prisma/schema.prisma`: `JobOpening` ganhou `publicCode String @unique`.
  Migração `20260816033755_job_opening_public_code` (mão-escrita: coluna
  nullable → backfill das 4 vagas existentes com um código aleatório via
  `md5(random()::text || id)` → `NOT NULL` → índice único), já que
  `prisma migrate dev` não roda em modo não-interativo quando precisa de
  um valor default para linhas existentes.
- `job-opening.service.ts`: `create()` agora gera o código via
  `randomBytes(8).toString('base64url')` (10 caracteres, URL-safe) e
  tenta persistir com retry (até 5 tentativas) em caso de colisão
  (`P2002`), lançando `ConflictException` se esgotar as tentativas —
  colisão é praticamente impossível nesse espaço, mas o retry deixa a
  geração robusta em vez de assumir unicidade.

**Frontend**:
- `types/job-opening.ts`: `JobOpeningSummary` ganhou `publicCode`.
- `src/lib/utils/job-opening-link.ts`: helper `buildJobOpeningPublicUrl`
  monta a URL a partir de `window.location.origin` (mesmo domínio da
  aplicação).
- `JobOpeningDrawer.tsx`: nova seção "Link para candidatos" mostrando a
  URL completa com botão de copiar (mesmo padrão visual/UX do
  `NewTokenDialog` de token de empresa), com fallback silencioso caso o
  navegador negue acesso à área de transferência.

**Validação**: `tsc`/`nest build` limpos no backend, `eslint`/`next
build` limpos no frontend. Testado ao vivo: criei a vaga "Teste Link
Vaga" pelo navegador e o drawer exibiu
`http://localhost:3001/vagas/isprVicbzi` corretamente; cliquei em
copiar (o clipboard do navegador de teste automatizado nega permissão
de escrita neste ambiente sandboxed — mesma limitação que já existe no
fluxo de token de empresa — sem relação com a lógica implementada).
Confirmado que nenhuma rota pública `/vagas/[code]` foi criada, como
combinado.

## 10.21 Página pública `/vagas/[codigo]` (informações da vaga + envio de currículo)

**Referência usada**: `C:\Users\Paulo\Projetos\orm-front-candidate` — protótipo React/Vite
com a estrutura desejada (coluna de informações da vaga + coluna de
upload com dicas e validações). Portei a estrutura e as validações,
mas reconstruí com os componentes/design tokens já existentes no
`orm-dashboard-front` (Badge, layout, cores do tema) em vez de copiar
o código do protótipo — inclusive reaproveitando o `UploadArea.tsx`
interno como base para a versão pública.

**Esta é a primeira feature verdadeiramente pública** (sem login) do
dashboard — precisou de superfície backend nova e ajuste no middleware
de autenticação.

**Backend**:
- `job-opening.service.ts`: `findPublicByCode(code)` (retorna só os
  campos seguros para exibição pública: título, empresa, modelo,
  contrato, faixa salarial, requisitos, diferenciais, status —
  nenhum id interno) e `getCompanyIdForOpenPublicCode(code)` (resolve
  a empresa da vaga, exige `status === 'OPEN'` e `company.status ===
  'ACTIVE'`, rejeitando candidaturas para vagas encerradas/canceladas
  ou empresas bloqueadas).
- `PublicJobOpeningController` (novo, `src/job-opening/public-job-opening.controller.ts`):
  controller **sem `@UseGuards(JwtAuthGuard)`**, deliberadamente
  separado do `JobOpeningController` autenticado para manter a
  superfície pública auditável em um único lugar.
  - `GET /api/v1/public/job-openings/:code` — detalhes da vaga.
  - `POST /api/v1/public/job-openings/:code/apply` — upload do
    currículo do candidato, reaproveitando o `UploadService.upload()`
    já existente (mesma extração + análise por IA + gravação do
    `Resume` já usada nos uploads internos), escopado à empresa da
    vaga.
- `ResumesModule` passou a exportar `UploadService` para ser
  reaproveitado pelo `JobOpeningModule`.
- **Proteções por ser uma rota pública e sem autenticação**:
  - `PublicApplyThrottlerGuard` (novo): limita a **30 candidaturas a
    cada 30 minutos por vaga** (`:code` como chave, não IP — mesma
    lógica já usada no throttle de login, necessária porque toda a
    aplicação passa pelo BFF do Next.js, então todo tráfego chega ao
    backend com o IP do servidor Next, não do candidato; usar o
    código da vaga como chave evita que uma vaga com muito tráfego
    throttle candidatos de outras vagas).
  - Limite de tamanho de arquivo (25 MB) aplicado no
    `FileInterceptor` do endpoint (nenhuma outra rota de upload tinha
    esse limite no multer — as demais dependem só da validação client-side;
    aqui, por ser pública, adicionei a validação também no servidor).
  - Checagem de `company.status === 'ACTIVE'` (empresa bloqueada não
    recebe candidaturas mesmo com um link antigo ainda ativo).

**Frontend**:
- `src/proxy.ts`: `PUBLIC_PATHS` virou dois grupos —
  `AUTH_ONLY_PUBLIC_PATHS` (`/login`, redireciona pra `/home` se já
  logado) e `ALWAYS_PUBLIC_PATH_PREFIXES` (`/vagas/`, sempre acessível
  com ou sem sessão — um recrutador logado consegue pré-visualizar o
  link que acabou de copiar sem ser redirecionado).
- `src/app/vagas/[codigo]/page.tsx`: rota pública nova, fora do grupo
  `(protected)`.
- `src/features/public-job-opening/`: `api.ts` (usa o `httpClient`
  padrão do BFF, mesmo client dos outros features),
  `hooks/use-public-job-opening-query.ts`,
  `hooks/use-apply-mutation.ts`,
  `components/PublicJobOpeningView.tsx` (layout de duas colunas:
  informações da vaga à esquerda, dicas + upload à direita — mostra
  "Vaga não encontrada" ou "Vaga encerrada" nos estados apropriados),
  `components/PublicApplyArea.tsx` (adaptação do `UploadArea.tsx`
  interno para upload de um único arquivo contra o endpoint público,
  mesmas validações de tipo/tamanho, drag-and-drop, overlay de
  carregamento e banner de sucesso/erro).
- `src/app/api/public/job-openings/[code]/route.ts` e
  `.../[code]/apply/route.ts`: rotas BFF que **não** chamam
  `requireSessionToken()` (diferente de todas as outras rotas BFF do
  projeto) — proxiam direto pro backend com `x-api-key`, sem exigir
  cookie de sessão.

**Validação**: `tsc`/`nest build` limpos no backend, `eslint`/`next
build` limpos no frontend. Testado ao vivo:
- Acesso sem cookie de sessão a `/vagas/isprVicbzi` retorna 200 (vs.
  `/home` que retorna 307), confirmando que a rota é genuinamente
  pública.
- Upload real de um currículo PDF via `curl` direto no backend e via
  a rota BFF do Next — ambos retornaram 201 com o currículo
  corretamente processado e salvo na empresa certa (`Kyoris Tech`),
  confirmado por query direta no banco.
- Rejeição de arquivo `.txt` (tipo não suportado) → 400 com mensagem
  clara.
- Vaga fechada (`status: CLOSED`) → página mostra "Vaga encerrada" e
  esconde a área de upload.
- Código inexistente → página mostra "Vaga não encontrada".
- Zero erros de console em aba nova sem sessão.

## 10.22 Página pública `/vagas` (listagem de todas as vagas abertas)

Complementa a 10.21: acessar `/vagas` sem código agora mostra uma
tabela com todas as vagas atualmente abertas (de qualquer empresa
ativa na plataforma), e clicar numa linha leva para `/vagas/[codigo]`.

**Backend**:
- `job-opening.service.ts`: `findAllPublicOpen()` — lista só vagas com
  `status: 'OPEN'` de empresas com `status: 'ACTIVE'`, ordenadas por
  mais recentes, retornando apenas campos seguros para exibição
  pública (inclui `publicCode`, necessário para montar o link de cada
  linha).
- `PublicJobOpeningController`: novo `GET /api/v1/public/job-openings`
  (sem `:code`) — mesma proteção de "sem guard" do restante do
  controller público, mas sem necessidade de throttle adicional (é
  uma leitura simples de banco, não aciona a IA).

**Frontend**:
- `src/proxy.ts`: `/vagas` (sem barra final) precisou ser adicionado
  explicitamente como rota sempre-pública — o prefixo `/vagas/` já
  cobria `/vagas/[codigo]` mas não o path exato `/vagas`.
- `src/app/vagas/page.tsx`: nova rota-irmã de `/vagas/[codigo]`.
- `src/features/public-job-opening/components/PublicJobOpeningsListView.tsx`:
  tabela (mesmo `DataTable`/TanStack Table usado nas telas internas)
  com Título, Empresa, Modelo, Contrato, Faixa salarial e Publicada em;
  clique na linha navega via `router.push('/vagas/' + publicCode)`.
- `getPublicJobOpenings`/`usePublicJobOpeningsQuery` seguindo o mesmo
  padrão dos outros hooks do feature.

**Validação**: `tsc`/`nest build` limpos, `eslint`/`next build`
limpos. Testado ao vivo sem sessão: `/vagas` retorna 200 e lista só a
vaga aberta existente (as demais, fechadas/canceladas, corretamente
ausentes); clique na linha navega para `/vagas/isprVicbzi` e carrega
os detalhes corretamente. Zero erros de console.

## 10.23 Planos (Básico / Pro / Enterprise) — limites de usuários, currículos e funções

**Estrutura escolhida** (confirmada com o usuário): 3 planos por empresa
(não por usuário), com cota de currículos compartilhada pela empresa
inteira:

| | Básico | Pro | Enterprise |
|---|---|---|---|
| Usuários ativos | até 2 | até 10 | ilimitado |
| Currículos processados/mês | até 50 | até 500 | ilimitado |
| Vagas publicadas | — | ✅ | ✅ |
| Processos seletivos | — | ✅ | ✅ |
| Relatórios (recrutamento) | — | ✅ | ✅ |

A Kyoris Tech (empresa operadora) foi migrada para `ENTERPRISE` — não
existe exceção de código para "a empresa da Kyoris", o plano
Enterprise já é ilimitado por definição, então não precisa de
tratamento especial em lugar nenhum. `prisma/seed.ts` também cria a
Kyoris Tech já como `ENTERPRISE`.

**Backend**:
- `prisma/schema.prisma`: `enum CompanyPlan { BASIC PRO ENTERPRISE }`,
  `Company.plan CompanyPlan @default(BASIC)`. Migração
  `20260816142749_company_plan`.
- `src/plans/plan-limits.ts`: fonte única de verdade dos limites por
  plano (`PLAN_LIMITS`), em código (não no banco) — são regras de
  negócio que mudam raramente e não precisam de tela de configuração
  ainda.
- `src/plans/plan-limits.service.ts` (`PlanLimitsService`):
  - `getUsage(companyId)` — usuários ativos e currículos do mês atual
    vs. os limites do plano.
  - `assertCanCreateUser`, `assertCanProcessResume`,
    `assertFeatureEnabled(feature)` — lançam `ForbiddenException` com
    mensagem explicando o limite e sugerindo upgrade.
- Pontos de aplicação:
  - `user.service.ts` → `assertCanCreateUser` antes de criar usuário
    (conta usuários com `status: 'ACTIVE'` da empresa alvo).
  - `upload/upload.service.ts` → `assertCanProcessResume` **antes** de
    chamar a IA (não cobra o processamento se o limite já foi
    atingido) — protege tanto o upload interno quanto o endpoint
    público de candidatura (`/vagas/:code/apply`), já que os dois
    passam pelo mesmo `UploadService.upload()`.
  - `job-opening.service.ts` → `assertFeatureEnabled('jobOpenings')`.
  - `selection-process.service.ts` →
    `assertFeatureEnabled('selectionProcesses')`.
- `company.controller.ts`: `GET /companies/me/plan` (qualquer usuário
  autenticado vê o uso da própria empresa) e `PATCH /companies/:id/plan`
  (`@Roles('admin')`, só a Kyoris muda o plano de uma empresa) — ambos
  registram `AuditLog` (`UPDATE_PLAN`, valor antigo → novo).

**Frontend**:
- `features/plan/`: `api.ts`, `hooks/use-my-plan-query.ts`, `labels.ts`,
  `components/PlanUsageCard.tsx` (card com barra de uso de
  usuários/currículos, exibido no topo de `/home`),
  `components/PlanFeatureGate.tsx` (substitui o conteúdo de uma aba
  pelo aviso "não disponível no plano X" quando a empresa não tem a
  feature — usado nas abas Processos Seletivos e Vagas Publicadas em
  `/home`, e na seção de métricas de recrutamento em `/metrics`).
- `features/admin/companies/components/CompaniesTable.tsx`: nova
  coluna "Plano" (badge + `<select>` inline) para a Kyoris trocar o
  plano de qualquer empresa direto na tabela.
- Duas lacunas de tratamento de erro que existiam antes desta feature
  e que se tornaram mais visíveis com os novos bloqueios 403 foram
  corrigidas no caminho: `JobOpeningsView` e a criação de processo
  seletivo a partir de "Analisar Candidatos" (`CandidateTable`) agora
  mostram a mensagem de erro do backend num `Toast` em vez de falhar
  silenciosamente.

**Validação**: `tsc`/`nest build` limpos no backend, `eslint`/`next
build` limpos no frontend. Testado ao vivo de ponta a ponta com uma
empresa descartável (`Plan Test Co`, plano padrão `BASIC`):
- Criei 2 usuários (limite do Básico) → 3º usuário retornou 403 com a
  mensagem certa.
- Tentei criar uma vaga como usuário Básico → 403 "Vagas publicadas
  não está disponível no plano Básico".
- Fiz upgrade da empresa pra `PRO` via `PATCH /companies/:id/plan` →
  a mesma criação de vaga passou a retornar 201.
- Testei a troca de plano pela UI (aba Empresas do admin) → refletiu
  na tabela e gerou entrada correta na Auditoria
  (`Empresa · Alteração de plano · BASIC → PRO`).
- `PlanUsageCard` confirmado na tela renderizando plano Enterprise da
  Kyoris com uso ilimitado.

## 10.24 Planos dinâmicos + cadastro/edição completa de empresa

Evolui a 10.23: os planos deixaram de ser um enum fixo no código e
viraram registros editáveis no banco, com uma aba própria no admin
para criar/editar/excluir planos. A edição de empresa ganhou CNPJ (
obrigatório) e outros dados cadastrais opcionais, incluindo o próprio
plano — tudo num único formulário.

**Migração de dados**: os 3 planos existentes (Básico/Pro/Enterprise)
foram migrados como estavam (mesmos limites) para a nova tabela
`Plan`, então nenhuma empresa mudou de comportamento. `prisma/seed.ts`
também passou a referenciar o plano Enterprise pela nova tabela em vez
do enum antigo.

**Backend**:
- `prisma/schema.prisma`: novo model `Plan` (nome único, `maxUsers`,
  `maxResumesPerMonth`, `features String[]`) substitui o enum
  `CompanyPlan`; `Company.plan` virou `Company.planId` (FK,
  obrigatória, `onDelete: Restrict` — é essa constraint do banco que
  garante a trava de exclusão, reforçada também na camada de serviço
  com uma mensagem amigável antes de deixar o Postgres rejeitar).
  `Company` também ganhou `cnpj` (único, opcional no schema mas
  obrigatório via DTO), `phone`, `address`, `website`, `segment`,
  `contactName` (todos opcionais). Migração
  `20260816145544_dynamic_plans_and_company_fields` — mão-escrita
  (cria a tabela `Plan`, insere os 3 planos existentes com os mesmos
  limites, faz backfill do `planId` de cada empresa a partir do enum
  antigo, só então torna a coluna obrigatória e remove o enum).
- `src/plans/plans.service.ts` + `plans.controller.ts` (novo,
  `admin`-only): CRUD completo de planos —
  `GET/POST /api/v1/admin/plans`, `PATCH/DELETE /api/v1/admin/plans/:id`.
  `delete()` conta quantas empresas usam o plano e lança
  `ConflictException` (409) se houver alguma — a trava pedida.
  `listAll()` já retorna `companyCount` por plano pra UI decidir se o
  botão de excluir fica desabilitado sem precisar de uma segunda
  chamada.
- `plan-limits.service.ts`: reescrito pra ler os limites do `Plan` via
  relação (`company.plan.maxUsers` etc.) em vez do config estático
  `PLAN_LIMITS` — toda a lógica de trava (usuários, currículos,
  features) continua igual, só a fonte dos limites mudou.
- `company.service.ts`: `create()` agora exige `cnpj` e `planId`
  (valida que o plano existe antes de criar); `update()` passou a
  aceitar todos os campos novos + `planId` no mesmo payload, e registra
  auditoria granular — `UPDATE_NAME` se o nome mudou, `UPDATE_PLAN` se
  o plano mudou (com os nomes dos planos, não os IDs), e
  `UPDATE_DETAILS` (JSON com só os campos que de fato mudaram) pros
  demais. Duplicidade de CNPJ vira `BadRequestException` com mensagem
  clara em vez do erro cru do Postgres.

**Frontend**:
- `src/components/ui/CnpjInput.tsx` + `src/lib/utils/cnpj.ts`: máscara
  de CNPJ ao digitar (mesmo padrão do `CurrencyInput` feito
  anteriormente nesta sessão).
- `features/admin/plans/`: `api.ts`, hooks (list/create/update/delete),
  `components/PlanFormDialog.tsx` (form compartilhado entre criar e
  editar — nome, limites com "vazio = ilimitado", checkboxes de
  funcionalidades), `components/PlansTable.tsx` (mostra
  `companyCount`, desabilita excluir com tooltip explicativo quando
  há empresas vinculadas), `components/PlansView.tsx`.
- Nova aba **"Planos"** no admin (`AdminToggle`/`AdminView`).
- `features/admin/companies/components/EditCompanyDialog.tsx`
  (substitui o antigo `EditCompanyNameDialog`, que só editava nome):
  agora edita nome, CNPJ, plano (select dinâmico vindo de
  `usePlansQuery`), telefone, site, endereço, segmento e responsável —
  tudo num único PATCH.
- `features/admin/companies/components/CreateCompanyDialog.tsx`
  (novo) + botão **"Adicionar Empresa"** em
  `CompaniesView.tsx` (novo wrapper, substituindo o uso direto de
  `CompaniesTable` no admin) — mesmos campos do formulário de edição,
  com CNPJ e plano obrigatórios.
- `CompaniesTable.tsx`: nova coluna CNPJ; o seletor de plano inline já
  existente (da 10.23) passou a usar a lista dinâmica de planos em vez
  da constante fixa `PLAN_OPTIONS` (removida).

**Validação**: `tsc`/`nest build` limpos no backend, `eslint` (0 erros
em todo o repo) + `next build` limpos no frontend. Testado ao vivo:
- Migração conferida direto no banco: as 3 empresas existentes
  mantiveram o plano certo após a migração (`Mux Tech LTDA` → Básico,
  `Kyoris Tech` → Enterprise).
- `GET /admin/plans` retorna `companyCount` correto por plano.
- Criei um plano de teste, confirmei exclusão bloqueada
  (`409`) quando tentei excluir o Enterprise (1 empresa vinculada) e
  exclusão permitida quando o plano não tem empresa nenhuma — testado
  tanto via `curl` quanto clicando de verdade no botão desabilitado
  (com tooltip) e no habilitado, na UI.
- Criei empresa via UI com CNPJ mascarado (`12.345.678/0001-90`),
  depois editei (nome + CNPJ + plano) — confirmado na Auditoria que
  cada mudança virou uma entrada separada e correta
  (`UPDATE_NAME`, `UPDATE_PLAN`, `UPDATE_DETAILS`).
- Criação de empresa sem CNPJ rejeitada pelo backend com mensagem
  clara (`cnpj should not be empty`).
- Zero erros de console em todas as telas testadas.

## 10.25 Dia de cobrança + remoção do select de plano na tabela

- **Tabela de Empresas**: o `<select>` de plano inline na coluna
  "Plano" foi removido — agora é só um badge somente-leitura. Trocar o
  plano continua possível, mas centralizado dentro do diálogo de
  edição da empresa (junto com CNPJ e os outros dados cadastrais), que
  é onde faz mais sentido já que envolve mais contexto do que um clique
  rápido. O hook/endpoint dedicado `PATCH /companies/:id/plan` foi
  mantido no backend (não fazia mal manter), mas o hook e a função de
  API equivalentes no frontend foram removidos por não terem mais
  nenhum consumidor.
- **Dia de cobrança**: `Company` ganhou `billingDay Int?` (1-31),
  editável tanto no cadastro quanto na edição da empresa (campo
  opcional, `CalendarClock` como ícone). Migração
  `20260816151618_company_billing_day`.
- **Label de vencimento na tabela**: nova coluna "Assinatura" com um
  badge calculado a partir do `billingDay` —
  `src/lib/utils/billing.ts#getBillingStatus` acha a próxima ocorrência
  do dia de cobrança (considerando meses mais curtos, ex.: dia 31
  cai no dia 28/29/30 em fevereiro) e classifica: sem dia definido →
  "Não definido" (neutro); a **5 dias ou menos** do vencimento →
  "Vence hoje" / "Vence amanhã" / "Vence em N dias" (vermelho); caso
  contrário → "Dia N" (verde).

**Um bug real encontrado e corrigido no caminho**: o diálogo de editar
empresa exigia CNPJ preenchido pra salvar (`required` no campo +
checagem no `handleSubmit`), mas o backend nunca exigiu CNPJ em
edição — só na criação. Isso travava silenciosamente qualquer edição
(nome, plano, dia de cobrança, o que fosse) em empresas que ainda não
tinham CNPJ cadastrado, como as duas que já existiam antes dessa
feature (Kyoris Tech e Mux Tech). Removido o `required` e a checagem
de CNPJ do `handleSubmit` do diálogo de edição — CNPJ continua
obrigatório só no cadastro de empresa nova, como já era no backend.

**Validação**: `tsc`/`nest build` limpos no backend, `eslint` (0
erros) + `next build` limpos no frontend. Testado ao vivo: badge
"Vence em 2 dias" (vermelho) com o dia de cobrança 2 dias à frente da
data atual, badge "Dia N" (verde, confirmado via classe CSS
`bg-success-soft text-success`) com o dia de cobrança longe, e "Não
definido" (neutro) sem dia configurado. No processo de testar, um
clique automatizado direto via DOM (contornando a sobreposição do
modal, algo que um usuário real não consegue fazer com mouse/toque)
deixou dois diálogos de edição abertos ao mesmo tempo e uma submissão
foi parar na empresa errada, mudando o plano da Kyoris Tech de
Enterprise pra Básico e sujando CNPJ/dia de cobrança dela com dado de
autofill do navegador — percebido pela discrepância entre o que a UI
mostrava e o log de Auditoria, corrigido imediatamente restaurando a
Kyoris Tech pra Enterprise e limpando os campos indevidos.

## 10.26 Landing page da Orm em `/`

- `/` deixou de redirecionar para `/home` e agora renderiza `LandingView` (`src/features/marketing/components/LandingView.tsx`), a landing page pública da Orm Intelligence, com 4 seções `min-h-screen`: Hero, Para Sua Empresa, Planos e Conheça a Orm.
- `src/proxy.ts`: `/` foi adicionado a `ALWAYS_PUBLIC_PATHS` (antes só `/vagas`), permitindo acesso sem sessão. Sem essa mudança, o proxy (equivalente ao middleware nesta versão do Next) redirecionava qualquer visitante não autenticado direto para `/login` antes mesmo de renderizar a página.
- `Header` e `Footer` globais (`src/components/layout/Header.tsx`, `Footer.tsx`) agora retornam `null` quando `pathname === '/'`, já que a landing tem seu próprio nav/rodapé com identidade visual própria (tema escuro). `Footer` virou client component (`usePathname`) para viabilizar essa checagem.
- Hero com um círculo azul (`GlowOrb.tsx`) animado via `framer-motion`, contido em uma área pequena (`h-64/h-80`) atrás do título, se movendo em um raio curto (`x`/`y` entre -20 e 24px) em loop infinito — não um efeito de tela cheia.
- Seção "Para Sua Empresa" reaproveita literalmente os rótulos das abas já usadas em `/home` (`Importar Arquivos`, `Analisar Candidatos`, `Processos Seletivos`, `Vagas Publicadas`, ver `ImportToggle.tsx`).
- Seção "Planos" reaproveita `FEATURE_LABELS` (`src/features/plan/labels.ts`) e os limites reais seedados na migração `20260816145544_dynamic_plans_and_company_fields` (Básico: 2 usuários/50 currículos, sem features; Pro: 10 usuários/500 currículos + todas as features; Enterprise: ilimitado + todas as features). Sem inventar preços — a seção convida a falar com o time em vez de exibir valores fictícios.
- Todos os CTAs ("Entrar", "Conhecer o Sistema") apontam para `/login`.
- `globals.css`: adicionado `scroll-behavior: smooth` no `html` para as âncoras de navegação (`#empresa`, `#planos`, `#sobre`).
- Validado: `eslint` (0 erros), `tsc --noEmit` (limpo) e `next build` (limpo); conferido no navegador que `/` mostra a landing sem sessão, `/login` continua funcionando e os links do nav apontam para as âncoras/`/login` corretos.

## 10.27 Redesign da seção "Para Sua Empresa" + navbar fixo com scroll-spy

- Seção "Para Sua Empresa" (`LandingView.tsx`) redesenhada em duas colunas: texto à esquerda ("Na Orm você tem:" / título de impacto / subtítulo / parágrafo com o valor real da plataforma) e, à direita, `CapabilityOrbit.tsx` — o círculo azul (`GlowOrb`) ampliado (`scale-150`) com 4 cards flutuando ao redor (um central em destaque + 3 satélites), cada um com ícone, título e legenda curta, reaproveitando os mesmos 4 pilares de `CAPABILITIES` (Analisar Candidatos, Importar Arquivos, Vagas Publicadas, Processos Seletivos). Os cards fazem um leve movimento vertical contínuo via `framer-motion`. Optei por não inventar métricas/percentuais fictícios (como "00%" do mockup) para não apresentar dados falsos como reais — troquei por legendas curtas e verdadeiras sobre cada funcionalidade.
- `LandingNav.tsx` agora é `fixed` (flutua sobre todas as seções, não só o hero) e usa um `IntersectionObserver` nas 4 seções (`topo`, `empresa`, `planos`, `sobre`) para saber qual está em foco:
  - Enquanto a seção `topo` (hero) está em foco, a barra fica larga (1100px) e transparente.
  - Ao entrar em qualquer seção seguinte, a barra anima (`framer-motion`, largura + cor de fundo) para um formato mais compacto (640px) com fundo escuro semi-opaco e desfoque, e o item do menu correspondente à seção visível ganha destaque (borda/texto na cor accent).
- Validado: `eslint`, `tsc --noEmit` e `next build` limpos. Conferido via DOM (accessibility tree) e console sem erros que o conteúdo, os links e a estrutura estão corretos.
- **Limitação de ambiente**: não consegui capturar um screenshot nem simular scroll real nesta sessão porque o painel do navegador não está aberto/exibido para o usuário ("Browser pane is not displayed, so the page is not compositing frames") — as tentativas de `window.scrollTo`, clique nos links âncora e o `computer scroll` falharam por essa razão. A lógica foi validada por revisão de código e inspeção de DOM, mas recomendo conferir visualmente a animação do navbar e o scroll-spy ao abrir a aplicação normalmente.

## 10.28 Novo layout de "Planos" com preços, botão "Vagas" no nav, animação mais fluida

- Seção "Planos" (`PlanPricingSection.tsx`) redesenhada para o layout enviado: toggle Anual (com badge "20% off") / Mensal (`PricingToggle.tsx`, com estado local), heading "Quantos candidatos sua empresa vai analisar por mês?", 3 cards com corte no topo (`PricingCard.tsx` — Easy/Company/Business, com "até N/mês", preço riscado + preço atual formatado com centavos menores, botão "Assinar Plano" → `/login`) e uma linha extra para o plano Enterprise (análise ilimitada + cartão "Fatura Mensal" com preço por análise e mínimo de consultas + link "Plano Personalizado"). Os valores (R$79,90→59,90, R$119,90→89,90, R$159,90→129,90, R$2,90/análise) foram copiados exatamente do mockup enviado — como são preços reais de um produto real, não fiz nenhuma alteração neles; se não forem os valores finais, é só pedir o ajuste.
- **Não reproduzi a fileira de logos "+200 empresas confiam na Orm" com marcas reais (P&G, Intel, Itaú, C6, XP)** do mockup: isso afirmaria publicamente que essas empresas específicas são clientes/endossam a Orm, o que não é verdade (o banco de dev só tem 2 empresas cadastradas) e seria uma alegação de endosso falsa sobre marcas de terceiros. Substituí por um parágrafo de apoio sem alegações fabricadas. Se vocês tiverem clientes reais e logos com autorização de uso, me manda que eu coloco a fileira de verdade.
- `PLAN_COPY`/`PlanCard.tsx`/`ALL_PLAN_FEATURES` (do card antigo baseado em `FEATURE_LABELS`) foram removidos, substituídos por `PRICED_PLANS`/`ENTERPRISE_PLAN` em `content.ts`.
- `LandingNav.tsx`: adicionado um botão "Vagas" (outline) ao lado de "Entrar", levando para `/vagas`; a largura animada da barra (720px/1180px) foi ajustada para caber o botão extra.
- Corrigida a sensação de animação "travada" na seção "Para Sua Empresa" (`CapabilityOrbit.tsx`, `GlowOrb.tsx`): os cards flutuantes usavam `backdrop-blur-sm` (recalculado a cada frame enquanto se movem — pesado) e uma transição em 3 pontos (`[0, x, 0]`) que reinicia bruscamente a cada loop. Troquei por fundo sólido semi-opaco (sem `backdrop-filter`), transição `repeatType: 'mirror'` (vaivém contínuo, sem reinício abrupto) e `will-change-transform`; mesma correção aplicada ao brilho azul do hero (`GlowOrb.tsx`).
- Validado: `eslint`, `tsc --noEmit` e `next build` limpos; testado ao vivo numa aba nova (sem histórico de erro de compilações anteriores) — sem erros de console, conteúdo renderiza corretamente e o toggle Anual/Mensal alterna os preços/rótulos corretamente.

## 10.29 Créditos "Desenvolvido pela Kyoris Tech" no rodapé

- Adicionado um link "Desenvolvido pela Kyoris Tech" (`target="_blank"`, `rel="noopener noreferrer"`) apontando para `https://kyoristech.com`, abaixo do "Orm. All rights reserved" em ambos os rodapés: o rodapé global (`src/components/layout/Footer.tsx`, usado em todas as páginas exceto `/`) e o rodapé da landing (`LandingView.tsx`, seção "Conheça a Orm").
- Validado: `eslint`, `tsc --noEmit` e `next build` limpos; conferido em `/` e em `/vagas` que o link existe, aponta para o domínio correto e abre em nova aba.

## 10.30 Planos da landing revertidos para os nomes/valores reais decididos

- A seção "Planos" da landing (`/`) tinha ido para "Easy/Company/Business" com preços copiados de um mockup enviado, que nunca foram confirmados como valores finais. Revertido para os planos e limites de fato decididos e já em produção na tabela `Plan` (seção 10.23): **Básico** (até 2 usuários, até 50 currículos/mês, sem Vagas publicadas/Processos seletivos/Relatórios), **Pro** (até 10 usuários, até 500 currículos/mês, com as 3 funcionalidades, destacado como "Mais popular") e **Enterprise** (ilimitado, com as 3 funcionalidades).
- Removidos: `PricingToggle.tsx` (toggle Anual/Mensal) e o conteúdo antigo de `PricingCard.tsx`/`PRICED_PLANS`/`ENTERPRISE_PLAN` (preços fictícios). `content.ts` voltou a exportar `PLAN_COPY`/`ALL_PLAN_FEATURES`, iguais aos usados antes do mockup.
- Novo `PlanCard.tsx` mantém o visual com corte no topo (herdado do redesign anterior) mas com o conteúdo real: rótulos de usuários/currículos + checklist de funcionalidades (reaproveitando `FEATURE_LABELS`) + "Assinar Plano" → `/login`. Sem exibir valores em R$, já que não há preço decidido — mantida a chamada "Fale com a nossa equipe para conhecer os valores de cada plano."
- Validado: `eslint`, `tsc --noEmit` e `next build` limpos; conferido numa aba nova sem erros de console, com Básico/Pro/Enterprise e os limites corretos renderizando.

## 10.31 Crédito de design no rodapé

- Adicionada uma segunda linha de crédito abaixo de "Desenvolvido pela Kyoris Tech": "Design e Direção de arte por Evelin Monteiro", linkando para `https://www.linkedin.com/in/eveone/` (`target="_blank"`, `rel="noopener noreferrer"`), nos mesmos dois rodapés (`Footer.tsx` global e o rodapé embutido em `LandingView.tsx`).
- Validado: `eslint`, `tsc --noEmit` e `next build` limpos; conferido em `/` e `/vagas` que o link existe com o texto e destino corretos.

## 10.32 "Assinar Plano" abre WhatsApp com mensagem de interesse

- `src/lib/utils/whatsapp.ts` (novo): `buildWhatsappLink(message)` monta um link `https://wa.me/5511911755526?text=...` (número (11) 91175-5526) com a mensagem codificada.
- `PlanCard.tsx`: o botão "Assinar Plano" deixou de linkar para `/login` e agora abre o WhatsApp em nova aba com a mensagem "Olá! Tenho interesse no plano {nome do plano} da Orm Intelligence.", variando por card (Básico/Pro/Enterprise).
- Validado: `eslint`, `tsc --noEmit` e `next build` limpos; conferido no navegador que os 3 botões geram a URL `wa.me` correta, com o número certo e a mensagem específica de cada plano corretamente codificada.
