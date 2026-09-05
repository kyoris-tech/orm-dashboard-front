# Orm Dashboard — Documentação do Front

Documentação viva do `orm-dashboard-front`. Substitui o antigo `MIGRATION_PLAN.md`,
que descrevia a migração do SPA em Vite (`decifracv-web-mvp`) e deixou de servir
como referência do estado atual. O histórico da migração continua no git
(`git log -- MIGRATION_PLAN.md`).

Há uma versão navegável em [`DOCUMENTATION.html`](./DOCUMENTATION.html), ao lado
deste arquivo — mesmo conteúdo, com índice fixo e busca. Ao mudar um, mude o outro.

Documento irmão: o **Manual do Back Orm**, em `orm-back-node/docs/DOCUMENTATION.md`.

**Leia as seções 1 a 4 antes de escrever qualquer código.** O resto é consulta.

---

## Índice

| # | Seção | Para quê |
|---|-------|----------|
| 1 | [Visão geral](#1-visão-geral) | O que é o sistema e onde ele se encaixa |
| 2 | [Como começar](#2-como-começar) | Subir o projeto na sua máquina |
| 3 | [Regras do código](#3-regras-do-código) | **Obrigatório.** O que pode e o que não pode |
| 4 | [Organização e camadas](#4-organização-e-camadas) | Como o `src/` é dividido |
| 5 | [Onde encontrar cada coisa](#5-onde-encontrar-cada-coisa) | "Preciso mexer em X, vou onde?" |
| 6 | [Fluxo de dados ponta a ponta](#6-fluxo-de-dados-ponta-a-ponta) | Como um dado sai do banco e chega na tela |
| 7 | [Autenticação e proteção de rotas](#7-autenticação-e-proteção-de-rotas) | Sessão, cookies, guarda de rota |
| 8 | [Design system](#8-design-system) | Cores, tokens, tipografia |
| 9 | [Catálogo de componentes](#9-catálogo-de-componentes) | O que já existe pronto |
| 10 | [Paginação](#10-paginação) | Padrão server-side em todas as tabelas |
| 11 | [Padrões recorrentes](#11-padrões-recorrentes) | Como escrevemos tabela, dialog, mutation, label |
| 12 | [Mapa de rotas](#12-mapa-de-rotas) | Páginas e endpoints BFF |
| 13 | [Guia das features](#13-guia-das-features) | O que cada pasta de feature faz |
| 14 | [Receitas](#14-receitas) | Passo a passo para adicionar coisas novas |
| 15 | [Armadilhas conhecidas](#15-armadilhas-conhecidas) | Erros que já custaram tempo |
| 16 | [Antes de concluir](#16-antes-de-concluir) | Checklist de validação |

---

## 1. Visão geral

A **Orm Intelligence** é uma plataforma de recrutamento com triagem de currículos
por IA. Este repositório é o front: a landing pública, as páginas públicas de
vagas e o dashboard do recrutador.

### Os repositórios

| Repositório | Papel |
|-------------|-------|
| `orm-dashboard-front` (este) | Next.js 16 — landing, vagas públicas, dashboard |
| `orm-back-node` | NestJS + Prisma + PostgreSQL — regra de negócio, banco, integração com OpenAI |
| `orm-front-candidate` | Front do candidato (separado) |
| `decifracv-web-mvp` | SPA Vite legado, origem da migração — só consulta histórica |

### Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript strict**
- **Tailwind CSS 4** — configurado por `@theme` dentro do próprio CSS, sem `tailwind.config`
- **TanStack Query v5** (estado de servidor) + **TanStack Table v8** (tabelas)
- **Axios** (dois clientes distintos — seção 6), **dayjs**, **framer-motion**,
  **lucide-react**, **recharts**, **jspdf**

### O padrão mais importante: BFF

**O navegador nunca fala com o NestJS.** Todo request do client vai para um Route
Handler do próprio Next (`src/app/api/**`), que autentica e repassa ao backend.

Consequências práticas:

- `API_KEY` e `API_BASE_URL` nunca chegam ao browser — nenhuma variável sensível
  é `NEXT_PUBLIC_*`.
- O JWT vive num cookie `httpOnly`, inacessível ao JavaScript da página.
- Se um dado não aparece na tela, o request pode ter quebrado em **dois** lugares:
  browser → Next, ou Next → Nest. Confira os dois.

---

## 2. Como começar

```bash
npm install
npm run dev
```

### Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```
API_BASE_URL=      # URL do orm-back-node, ex: http://localhost:3000/api/v1
API_KEY=           # chave de API do backend
JWT_COOKIE_NAME=   # opcional, default: orm_session
```

Todas são lidas **só no servidor**, via `src/config/env.ts`, que lança erro no
boot se `API_BASE_URL` ou `API_KEY` faltarem. Se o app não sobe reclamando de
`Missing environment variable`, é isso.

### Scripts

| Comando | O quê |
|---------|-------|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Checagem de tipos |

### Por onde começar a ler o código

Nesta ordem são ~15 minutos, e dão o modelo mental inteiro:

1. `src/app/layout.tsx` — shell da aplicação (fonte, Header, Footer, providers)
2. `src/proxy.ts` — quem entra e quem é redirecionado para `/login`
3. `src/app/(protected)/home/home-view.tsx` — a tela principal do produto
4. `src/app/api/admin/users/route.ts` — um Route Handler BFF típico, curto
5. `src/features/admin/users/` — uma feature inteira, pequena o bastante para ler de ponta a ponta

---

## 3. Regras do código

Estas regras não são preferência de estilo — são o que mantém o projeto
navegável. Quem mexer aqui, pessoa ou agente, segue.

### 3.1 Idioma

- **Código em inglês**: variáveis, funções, classes, tipos, parâmetros, nomes de
  arquivo, chaves de objeto, nomes de props.
- **Português apenas no que o usuário lê**: labels, mensagens de erro, títulos,
  placeholders, textos de confirmação.

```ts
// certo
const [deletingUser, setDeletingUser] = useState<UserSummary | null>(null);
errorMessage="Não foi possível carregar os usuários."

// errado
const [usuarioExcluindo, setUsuarioExcluindo] = useState(null);
errorMessage="Could not load users."
```

Strings visíveis longas ou reutilizadas vão para o `labels.ts` da feature
(seção 11.4), não espalhadas pelos componentes.

### 3.2 Sem comentários

Não escrevemos comentários. Se um trecho precisa de comentário para ser
entendido, o trecho está errado — extraia uma função com nome descritivo, ou
nomeie a constante.

```ts
// errado
const t = 6000; // janela para desfazer a exclusão

// certo
const UNDO_WINDOW_MS = 6000;
```

Exceções, raras e só estas: `'use client'` e diretivas equivalentes, e
`eslint-disable` com justificativa real. Números mágicos viram constantes
nomeadas em `SCREAMING_SNAKE_CASE` no topo do arquivo — `MAX_VALUE_PREVIEW_LENGTH`,
`UNDO_WINDOW_MS`, `PAGE_SIZE`.

Os blocos com `// certo` / `// errado` acima são desta documentação, não do
código.

### 3.3 Componentização ativa

Esta é a regra que mais gera trabalho e mais economiza depois.

**Antes de escrever qualquer JSX, procure se já existe.** `src/components/ui/`
tem 25 componentes. Um `<button>` cru dentro de uma feature quase sempre é um
`Button`, `SecondaryButton` ou `IconButton` que não foi procurado.

**Se você duplicar um bloco pela segunda vez, extraia na hora.** Não espere a
terceira. O critério é: se dois lugares renderizam a mesma estrutura visual, ela
vira componente compartilhado.

- Reutilizável entre features → `src/components/ui/`
- Reutilizável só dentro de uma feature → `features/<feature>/components/`
- Lógica reutilizável → `features/<feature>/hooks/` ou `src/lib/hooks/`
- Função pura reutilizável → `src/lib/utils/`

Duplicação de lógica conta igual. `extractErrorMessage` (`lib/utils/error.ts`)
existe porque o mesmo `isAxiosError(...)` estava copiado em ~15 arquivos — e as
cópias já tinham divergido no texto da mensagem padrão. `Modal` existe porque o
mesmo par de `motion.div` estava repetido em 12 dialogs.

### 3.4 Estilo

- Aspas simples e vírgula final (`.prettierrc`).
- Classes condicionais sempre via `cn()` (`lib/utils/cn.ts`), nunca template
  string com ternário solto.
- **Nunca cor literal no JSX.** Use os tokens (`bg-surface`, `text-muted`,
  `border-border`) — seção 8.
- Componentes puramente de apresentação são exportados com `memo()`; veja
  qualquer arquivo de `components/ui/`.
- Props sempre com `export interface XProps` nomeada, mesmo com um campo só.
- `import type { ... }` para imports de tipo.
- Imports internos pelo alias `@/` — nunca `../../../`.

### 3.5 Client vs Server

`'use client'` só onde há estado, efeito, evento ou API de browser. Páginas em
`app/**/page.tsx` são Server Components: exportam `metadata`, leem a sessão e
renderizam uma `*View` cliente. Não transforme uma página em client component só
para usar um hook — mova o hook para a View.

### 3.6 Validação obrigatória

Nada é considerado pronto sem lint, checagem de tipos e build passando.
Detalhes na seção 16.

---

## 4. Organização e camadas

```
src/
  app/            # rotas (páginas) + Route Handlers (BFF)
  components/     # UI compartilhada entre features
  features/       # uma pasta por domínio de produto
  lib/            # infraestrutura e utilitários sem UI
  types/          # contratos de dados compartilhados
  config/         # leitura tipada de env
  context/        # React Context de escopo global
  proxy.ts        # guarda de rota (o "middleware" do Next 16)
```

### As quatro camadas

```
types/                        →  domínio     (contratos, sem dependências)
lib/http, lib/auth            →  infra       (axios, cookies, erros)
features/*/api.ts + hooks/    →  aplicação   (busca, cache, mutação)
components/, features/*/components/, app/   →  apresentação
```

A dependência só desce nessa direção. Um `lib/utils/` nunca importa de
`features/`; um `types/` nunca importa de nada.

### Anatomia de uma feature

Toda pasta em `features/` segue o mesmo formato:

```
features/<nome>/
  api.ts            # funções que chamam os Route Handlers via httpClient
  components/       # UI da feature
  hooks/            # um arquivo por query/mutation
  labels.ts         # textos e mapas de tradução de enum
  types.ts          # tipos locais que não são contrato de API
  constants.ts      # constantes da feature
```

Nem toda feature tem todos os arquivos — mas quando tem, é com esse nome.

---

## 5. Onde encontrar cada coisa

"Preciso mexer em ___, vou onde?"

| Você quer... | Vá para |
|---|---|
| Mudar cor, sombra, token do tema | `src/app/globals.css` |
| Mudar Header, Footer, largura das páginas | `src/components/layout/` |
| Mudar botão/input/tabela/modal usado em todo lugar | `src/components/ui/` |
| Mudar quem pode acessar uma rota | `src/proxy.ts` |
| Mudar o que acontece no login/logout | `src/features/auth/` + `src/app/api/auth/` |
| Ver como a sessão é lida no servidor | `src/lib/auth/session.ts` |
| Mudar como um request sai do browser | `src/lib/http/client.ts` |
| Mudar como o Next chama o Nest | `src/lib/http/backend-client.ts` |
| Mudar o texto de erro genérico de uma ação | `src/lib/utils/error.ts` |
| Adicionar/alterar endpoint consumido pelo front | `src/app/api/**/route.ts` |
| Mudar a chave de cache de uma query | `src/lib/query/keys.ts` |
| Mudar comportamento global do cache | `src/lib/query/query-client.ts` |
| Mudar paginação (tamanho padrão, opções) | `src/types/pagination.ts` |
| Mexer na tela inicial do recrutador | `src/app/(protected)/home/home-view.tsx` |
| Mexer no upload / importação de currículos | `src/features/resumes/components/UploadArea.tsx` |
| Mexer na busca e filtros de candidatos | `src/features/resumes/components/AnalyzeSection.tsx` |
| Mexer nos chips de filtro e placeholders | `src/features/resumes/components/FiltersBar.tsx` |
| Mexer em vagas | `src/features/job-openings/` |
| Mexer em processos seletivos | `src/features/selection-processes/` |
| Mexer na administração (empresas, usuários, planos, auditoria) | `src/features/admin/` |
| Mexer em relatórios/métricas do recrutador | `src/features/metrics/` |
| Mexer na landing page | `src/features/marketing/` (textos em `content.ts`) |
| Mexer nas páginas públicas de vaga | `src/features/public-job-opening/` |
| Mexer no bloqueio por plano | `src/features/plan/components/PlanFeatureGate.tsx` |
| Formatar telefone, CNPJ, moeda, data | `src/lib/utils/` |
| Mudar SEO / metadata | o `page.tsx` da rota; `src/app/layout.tsx` para o global |
| Mudar `robots.txt` / `sitemap.xml` | `src/app/robots.ts` / `src/app/sitemap.ts` |
| Mudar favicon / ícone | `src/app/icon.tsx`, `src/app/apple-icon.tsx` |

### Como buscar

O código é consistente o bastante para busca textual funcionar bem:

```bash
grep -rn "useUsersQuery" src
grep -rn "queryKeys.users" src
grep -rn "components/ui/Modal" src
```

Padrões de nome que valem sempre:

| Padrão de arquivo | Export | Exemplo |
|---|---|---|
| `use-<recurso>-query.ts` | `use<Recurso>Query` | `use-users-query.ts` |
| `use-<ação>-mutation.ts` | `use<Ação>Mutation` | `use-create-user-mutation.ts` |
| `<Recurso>Table.tsx` | tabela com paginação | `UsersTable.tsx` |
| `<Recurso>View.tsx` | tela/aba completa | `UsersView.tsx` |
| `<Ação>Dialog.tsx` | modal | `ChangePasswordDialog.tsx` |
| `<Recurso>Drawer.tsx` | painel lateral | `JobOpeningDrawer.tsx` |
| `labels.ts` | mapas de tradução de enum | `admin/users/labels.ts` |

---

## 6. Fluxo de dados ponta a ponta

Uma listagem de usuários, do banco até a tela — os seis arquivos, em ordem:

```
PostgreSQL
   ↑
orm-back-node                          GET /api/v1/users?page=1&pageSize=10
   ↑
1. src/app/api/admin/users/route.ts    Route Handler (BFF, servidor)
   ↑                                   valida sessão, repassa query params
2. src/features/admin/users/api.ts     getUsers(params) via httpClient
   ↑
3. src/lib/query/keys.ts               queryKeys.users.list(params)
   ↑
4. .../hooks/use-users-query.ts        useQuery
   ↑
5. .../components/UsersTable.tsx       TanStack Table + DataTable + Pagination
   ↑
6. .../components/UsersView.tsx        aba, filtro de empresa, botões
```

### Os dois clientes Axios

Confundir os dois é o erro mais comum de quem chega no projeto.

| | `lib/http/backend-client.ts` | `lib/http/client.ts` |
|---|---|---|
| Roda em | **servidor** (Route Handlers) | **browser** |
| `baseURL` | `env.apiBaseUrl` (o Nest) | `/api` (o próprio Next) |
| Autenticação | `x-api-key` + `Authorization: Bearer` | cookie `httpOnly`, automático |
| Importado por | `src/app/api/**` | `features/*/api.ts` |

Importar `backendClient` num componente cliente quebra o build — ele lê
`env`, que só existe no servidor.

O `client.ts` tem um interceptor: qualquer 401 fora de `/auth/*` redireciona
para `/login`.

### Formato de um Route Handler

Todos seguem esta forma. Ao criar um novo, copie de
`src/app/api/admin/users/route.ts`:

```ts
export async function GET(request: Request) {
  const token = await requireSessionToken();

  if (token instanceof NextResponse) {
    return token;
  }

  const { searchParams } = new URL(request.url);

  try {
    const { data } = await backendClient.get('/users', {
      ...withBearerToken(token),
      params: Object.fromEntries(searchParams),
    });
    return NextResponse.json(data);
  } catch (error) {
    return forwardAxiosError(error, 'Não foi possível carregar os usuários.');
  }
}
```

Três peças obrigatórias:

- `requireSessionToken()` — devolve o token **ou** um `NextResponse` 401. O
  `instanceof` não é opcional.
- `Object.fromEntries(searchParams)` — sem isso a paginação e os filtros são
  silenciosamente descartados (seção 15).
- `forwardAxiosError(error, ...)` — preserva o status e a mensagem do Nest.

### Cache

`src/lib/query/query-client.ts` define os padrões: `staleTime` 30s, `gcTime` 5min,
sem refetch no foco, 1 retry em query e 0 em mutation.

Todas as chaves ficam centralizadas em `src/lib/query/keys.ts`. Nunca escreva um
array de chave inline — a invalidação depende do prefixo comum:

```ts
queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
```

Chaves de lista recebem os parâmetros (`queryKeys.users.list(params)`), então
trocar de página ou de `pageSize` gera uma entrada de cache nova.

---

## 7. Autenticação e proteção de rotas

### Cookies

`src/lib/auth/session.ts` gerencia dois cookies, ambos `httpOnly`:

| Cookie | Conteúdo |
|---|---|
| `orm_session` (configurável) | o JWT |
| `orm_session_user` | o `SessionUser` serializado, para render no servidor |

Nomes derivam de `JWT_COOKIE_NAME`. `secure` só em produção.

### Guarda de rota

`src/proxy.ts` (no Next 16 o antigo `middleware.ts` chama-se `proxy.ts`):

- `ALWAYS_PUBLIC_PATHS` — `/`, `/vagas`, `/robots.txt`, `/sitemap.xml`, e tudo
  sob `/vagas/`
- `/login` só para quem **não** tem sessão; quem tem é mandado para `/home`
- todo o resto sem sessão → redirect para `/login`

O `matcher` exclui `api`, estáticos e ícones. **A guarda é por presença do
cookie, não por validade do JWT** — a validação real acontece no Nest, e o 401
volta via interceptor.

### Sessão no client

`src/context/SessionProvider.tsx` recebe o usuário do `layout.tsx` (servidor) e
expõe `useSessionUser()`. Use-o para checagens de UI:

```ts
const sessionUser = useSessionUser();
const isSelf = user.id === sessionUser?.id;
```

Autorização de verdade (ex.: `/admin`) é feita no Server Component, com
`redirect()` — ver `src/app/(protected)/admin/page.tsx`.

### Plano

`PlanFeatureGate` bloqueia features não contratadas (`jobOpenings`,
`selectionProcesses`, `reports`), renderizando um card de upgrade no lugar do
conteúdo. Em erro de carregamento ele **libera** o conteúdo, para não travar o
produto por falha de rede.

---

## 8. Design system

Tudo vem de `src/app/globals.css`. Não existe `tailwind.config` — o Tailwind 4
lê os tokens do bloco `@theme inline`.

### Tokens

| Token | Valor | Uso |
|---|---|---|
| `background` | `#f9fbfd` | fundo base |
| `foreground` | `#13181d` | texto principal |
| `primary` | `#0c3355` | azul escuro da marca |
| `accent` | `#007aff` | ações, links, destaque |
| `accent-dark` | `#0065d1` | hover de ação |
| `muted` | `#5c6b7b` | texto secundário |
| `border` | `#c8d3df` | bordas e divisores |
| `success` / `success-soft` | `#00ae00` / `#e6fff2` | positivo |
| `danger` / `danger-soft` | `#c40003` / `#fff3f3` | destrutivo |
| `surface` | `#ffffff` | **fundo de card e de célula de tabela** |
| `surface-soft` | `#f3f7ff` | fundo da página, inputs, estados sutis |

Cada token vira classe utilitária: `bg-surface`, `text-muted`,
`border-border`, `bg-danger-soft`.

**Nunca escreva `#fff` ou `bg-white` no JSX.** A única cor literal restante no
código é o amarelo intermediário de `lib/utils/score.ts`, que não tem token.

Fonte: **Outfit** (Google Fonts), pesos 400/500/700, via `--font-outfit`.

### Detalhe das tabelas

`DataTable` usa `border-separate` com `border-spacing-y-2` para dar o efeito de
linhas separadas com cantos arredondados. Nesse modo o `<tr>` **não pinta
fundo** — o `bg-surface` precisa estar no `<td>`. Se você mudar o fundo das
tabelas, é lá.

---

## 9. Catálogo de componentes

Antes de criar qualquer coisa, veja se está aqui.

### `src/components/ui/`

| Componente | Para quê |
|---|---|
| `Button` | ação primária; variantes e `loading` |
| `SecondaryButton` | ação secundária (o "Cancelar" de todo dialog) |
| `IconButton` | ação só-ícone em tabela; `tone: 'accent' \| 'danger'` |
| `Input` | campo de texto com label e ícone |
| `PasswordInput` | senha com botão de revelar |
| `CurrencyInput` | valor em reais, com máscara |
| `CnpjInput` | CNPJ com máscara |
| `SearchInput` | busca com ícone de lupa |
| `TagListInput` | lista de strings (requisitos, benefícios) |
| `Select` | select estilizado, recebe `SelectOption[]` |
| `Checkbox`, `Radio` | inputs de escolha |
| `SegmentedControl` | alternador de abas, genérico em `<T extends string>` |
| `Modal` | **base de todo dialog** — portal, overlay, animação, `size` |
| `ConfirmDialog` | confirmação sim/não com `tone` |
| `Drawer` | painel lateral de detalhes |
| `ModalPortal` | portal cru; use `Modal`, não este |
| `DataTable` | **base de toda tabela** — loading, erro, vazio, ordenação |
| `Pagination` | navegação de páginas + seletor de itens por página |
| `Card`, `StatCard` | contêineres |
| `Badge` | pílula de status, com `tone` |
| `Text` | tipografia |
| `Toast` | aviso temporário, com ação opcional (usado no "desfazer") |
| `OrmLogo` | logo |
| `charts/ImportsTimelineChart` | linha do tempo de importações |
| `charts/RankedBarChart` | barras ranqueadas |

### `src/components/layout/`

`Header` (nav + menu do usuário), `Footer`, `PageContainer` (largura e
espaçamento padrão de página).

### `src/components/motion/`

`FadeIn` — wrapper de entrada em framer-motion.

### `src/lib/hooks/`

| Hook | Para quê |
|---|---|
| `usePagination` | `page`/`pageSize` com reset automático da página ao trocar o tamanho |
| `useDebouncedValue` | debounce genérico (usado na busca de candidatos, 500ms) |

### `src/lib/utils/`

| Arquivo | Exports principais |
|---|---|
| `cn.ts` | `cn()` — junção de classes |
| `error.ts` | `extractErrorMessage()`, `DEFAULT_ERROR_MESSAGE` |
| `score.ts` | `scoreTone()` — cor da nota de aderência |
| `date.ts` | `formatDate()`, `formatDateTime()` |
| `currency.ts` | `formatCurrency()`, `centsToReais()`, `formatSalaryRange()` |
| `phone.ts` | `formatPhoneNumber()`, `getDDI()`, `getLocalNumber()` |
| `cnpj.ts` | `formatCnpj()` |
| `csv.ts` | `buildCsv()`, `downloadCsv()` |
| `pdf.ts` | `hexToRgb()`, `svgToPngDataUrl()` — apoio ao jsPDF |
| `billing.ts` | `getBillingStatus()` — dia de cobrança |
| `branding.ts` | logo em SVG, cores da marca, `CONTROLLER_NAME` |
| `job-opening-link.ts` | `buildJobOpeningPublicUrl()` |
| `whatsapp.ts` | `buildWhatsappLink()` |

---

## 10. Paginação

**A paginação é server-side.** O backend recebe `page` e `pageSize`, pagina no
banco e devolve:

```ts
{
  data: T[],
  pagination: { page, pageSize, totalItems, totalPages }
}
```

O tipo é `Paginated<T>` em `src/types/pagination.ts`, junto com:

| Constante | Valor | Uso |
|---|---|---|
| `DEFAULT_PAGE_SIZE` | `10` | tamanho inicial de toda tabela |
| `PAGE_SIZE_OPTIONS` | `[10, 25, 50, 100]` | opções do seletor |
| `ALL_ITEMS_PAGE_SIZE` | `2000` | **pedir a lista inteira** |

### Tabelas paginadas

Empresas, Usuários, Planos, Auditoria, Vagas, Processos Seletivos e Candidatos.

### `ALL_ITEMS_PAGE_SIZE`

Nem todo consumidor de uma lista é uma tabela. Selects e cálculos de métrica
precisam de **tudo**, e com o default de 10 mostrariam só os 10 primeiros
registros. Esses lugares pedem explicitamente:

```ts
const companiesQuery = useCompaniesQuery({ pageSize: ALL_ITEMS_PAGE_SIZE });
```

Hoje usam isso: `JobOpeningPicker`, `CreateUserDialog`, `CreateCompanyDialog`,
`EditCompanyDialog`, `UsersView`, `AdminMetricsView` e
`use-recruitment-metrics-query`. **Se você criar um novo select alimentado por
uma lista paginada, ele precisa disto** — senão trunca em silêncio.

### Filtrar sempre no backend

Com paginação server-side, filtrar no cliente quebra a contagem: uma página de
10 registros exibiria 7 e o rodapé continuaria dizendo "30 usuários". Todo
filtro de lista vai como query param para o backend.

---

## 11. Padrões recorrentes

### 11.1 Tabela

Toda tabela segue `UsersTable.tsx`. Esqueleto:

```tsx
const { page, pageSize, setPage, setPageSize } = usePagination();
const query = useUsersQuery({ page, pageSize });

const data = useMemo(() => query.data?.data ?? [], [query.data]);
const pagination = query.data?.pagination;

const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

return (
  <div className="w-full min-h-[300px] relative overflow-x-auto">
    <DataTable table={table} isLoading={...} isError={...} errorMessage="..." emptyMessage="..." />
    {pagination && (
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalLabel={`${pagination.totalItems} usuário(s)`}
      />
    )}
  </div>
);
```

Detalhes que importam:

- `data` **sempre** dentro de `useMemo` — `?? []` cria array novo a cada render
  e faz o TanStack Table remontar em loop.
- `columns` fora do componente quando não depende de nada; dentro de `useMemo`
  quando depende (ex.: `sessionUser?.id`).
- Loading, erro e vazio são responsabilidade do `DataTable` — não reimplemente.

### 11.2 Dialog

Todo modal usa `Modal`, nunca `ModalPortal` direto:

```tsx
<Modal isOpen={isOpen} size="lg" className="max-h-[90vh] overflow-y-auto">
  <h2 className="text-2xl font-semibold text-accent mb-6 text-center">Título</h2>
  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
    {/* campos */}
    <div className="flex gap-4 mt-2">
      <SecondaryButton onClick={onCancel} className="flex-1">Cancelar</SecondaryButton>
      <Button type="submit" variant="accent" loading={isSubmitting} className="flex-1">Salvar</Button>
    </div>
  </form>
</Modal>
```

Confirmações simples usam `ConfirmDialog`, não um `Modal` novo.

### 11.3 Query e mutation

Um arquivo por hook. Query:

```ts
export function useUsersQuery(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => getUsers(params),
    staleTime: 30_000,
  });
}
```

Mutation — sempre invalidando o prefixo `all` do recurso:

```ts
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
```

Em listagens que trocam de página, use `placeholderData: keepPreviousData` para
não piscar (ver `use-search-resumes-query.ts`).

### 11.4 Labels

Enum do backend nunca aparece cru na tela. Cada feature tem seu `labels.ts` com
`Record<Enum, string>` e, quando vira select, o `*_OPTIONS` derivado:

```ts
export const ROLE_LABELS: Record<RoleName, string> = {
  admin: 'Administrador',
  mod: 'Moderador',
  recruiter: 'Recrutador',
};

export const ROLE_OPTIONS: SelectOption[] = [
  { value: 'admin', label: ROLE_LABELS.admin },
  ...
];
```

Também é onde ficam os `*_TONES` que mapeiam status → cor de `Badge`.

### 11.5 Erro na tela

Mutations reportam erro por `Toast`, com a mensagem extraída pelo util:

```ts
onError: (error) => setErrorMessage(extractErrorMessage(error)),
```

```tsx
{errorMessage && <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />}
```

Nunca reimplemente o `isAxiosError` — a divergência entre cópias já aconteceu.

### 11.6 Ação desfazível

`useUndoableDelete` (em `features/resumes/hooks/`) é o padrão de exclusão com
janela de desfazer: exclui, guarda o id por 6s, oferece `Toast` com ação de
restaurar. Reaproveite se precisar do mesmo comportamento em outro recurso.

---

## 12. Mapa de rotas

### Páginas

| Rota | Acesso | Arquivo |
|---|---|---|
| `/` | pública | `app/page.tsx` → `features/marketing/LandingView` |
| `/vagas` | pública | `app/vagas/page.tsx` |
| `/vagas/[codigo]` | pública | `app/vagas/[codigo]/page.tsx` |
| `/login` | só sem sessão | `app/login/page.tsx` |
| `/home` | autenticada | `app/(protected)/home/` |
| `/metrics` | autenticada | `app/(protected)/metrics/page.tsx` |
| `/admin` | autenticada + `role === 'admin'` | `app/(protected)/admin/page.tsx` |

Rotas públicas exportam `metadata` completo (canonical, OpenGraph, Twitter);
rotas autenticadas exportam `robots: { index: false, follow: false }`.

`/home` não tem sub-rotas — as quatro seções (Importar, Analisar, Processos,
Vagas) são estado local em `home-view.tsx`.

### Route Handlers (`src/app/api/`)

| Grupo | Endpoints |
|---|---|
| `auth/` | `login`, `logout` |
| `resumes/` | listagem/busca, `recent`, `company`, `metrics`, `[id]`, `[id]/pdf`, `[id]/restore`, `upload/bulk/start`, `upload/bulk/status/[jobId]`, `admin/[id]/permanent` |
| `job-openings/` | listagem, criação, `[id]`, `[id]/cancel` |
| `selection-processes/` | listagem, `[id]`, `[id]/candidates`, `[id]/close`, `[id]/cancel`, `[id]/conclude`, `[id]/job-opening`, `link-candidate` |
| `company/` | `plan` |
| `public/` | `job-openings`, `job-openings/[code]`, `job-openings/[code]/apply` — **sem sessão** |
| `admin/` | `companies` (+ `[id]`, `[id]/plan`, `[id]/status`, `[id]/regenerate-token`), `users` (+ `[id]/status`, `[id]/password`, `export`), `plans` (+ `[id]`), `audit-logs` |

Os handlers sob `public/` são os únicos que não chamam `requireSessionToken()`.

---

## 13. Guia das features

| Feature | O que faz | Comece por |
|---|---|---|
| `auth` | login e logout | `components/LoginForm.tsx` |
| `resumes` | upload em lote, importações recentes, busca e filtros de candidatos, modal do currículo | `components/AnalyzeSection.tsx` |
| `job-openings` | CRUD de vagas, drawer de detalhes, link público, picker reutilizável | `components/JobOpeningsView.tsx` |
| `selection-processes` | ciclo de vida do processo, candidatos, vínculo com vaga, conclusão | `components/SelectionProcessesTable.tsx` |
| `metrics` | relatórios do recrutador (volume, conversão, tempo até contratação) | `components/MetricsView.tsx` |
| `plan` | plano da empresa, uso e bloqueio de features | `components/PlanFeatureGate.tsx` |
| `marketing` | landing pública | `components/LandingView.tsx`, textos em `content.ts` |
| `public-job-opening` | vagas públicas e candidatura sem conta | `components/PublicJobOpeningView.tsx` |
| `admin/companies` | empresas, plano, status, token de API | `components/CompaniesView.tsx` |
| `admin/users` | usuários, senha, bloqueio, exportação LGPD | `components/UsersView.tsx` |
| `admin/plans` | CRUD de planos | `components/PlansView.tsx` |
| `admin/audit` | log de auditoria | `components/AuditLogView.tsx` |
| `admin/metrics` | métricas globais da plataforma | `components/AdminMetricsView.tsx` |

Notas úteis:

- **`resumes`** é a feature mais densa. `AnalyzeSection` orquestra três estados:
  `draftFilters` (o que está sendo digitado), `appliedFilters` (o que foi
  aplicado) e `search` (com debounce de 500ms). Qualquer mudança volta para a
  página 1.
- **Filtros de candidato aceitam múltiplos valores separados por vírgula**, e
  cada valor é comparado como frase inteira — `Design Systems` conta como um
  termo, não dois. A nota exibida é `termos atendidos / termos pedidos`. Os
  filtros **ordenam, não excluem**: quem tem 0% ainda aparece no fim da lista.
- **`admin/metrics`** calcula em memória (`compute-admin-metrics.ts`) a partir
  das listas completas; é por isso que ele usa `ALL_ITEMS_PAGE_SIZE`.

---

## 14. Receitas

### 14.1 Nova tela dentro de `/home`

1. Adicione a seção em `ImportToggle` (`features/resumes/components/ImportToggle.tsx`).
2. Crie a `*View` na feature correspondente.
3. Renderize em `home-view.tsx`, envolvendo em `PlanFeatureGate` se for feature de plano.

### 14.2 Nova página

1. `src/app/<rota>/page.tsx` como Server Component, exportando `metadata`.
2. A UI vai numa `*View` cliente dentro da feature.
3. Se for pública, adicione a `ALWAYS_PUBLIC_PATHS` em `src/proxy.ts` **e** ao
   `sitemap.ts`.
4. Se exigir papel específico, faça `getSessionUser()` + `redirect()` na página.

### 14.3 Novo endpoint

1. `src/app/api/<recurso>/route.ts`, copiando o formato da seção 6 — inclusive o
   repasse de `searchParams`.
2. Função em `features/<feature>/api.ts` usando `httpClient`.
3. Tipos de request/response em `src/types/`.
4. Chave em `src/lib/query/keys.ts`.
5. Hook em `features/<feature>/hooks/`.

### 14.4 Nova tabela paginada

1. Garanta que o endpoint do backend aceita `page`/`pageSize` e devolve
   `{ data, pagination }`.
2. O Route Handler repassa os params.
3. `api.ts` tipa o retorno como `Paginated<T>`.
4. A chave de query recebe `params`.
5. O componente usa `usePagination()` + `DataTable` + `Pagination` (seção 11.1).

### 14.5 Novo componente compartilhado

1. `src/components/ui/<Nome>.tsx`, com `'use client'` se tiver interação.
2. `export interface <Nome>Props`.
3. `export const <Nome> = memo(<Nome>Component)` se for de apresentação.
4. Só tokens de cor.
5. **Substitua as ocorrências duplicadas existentes** — criar o componente e
   deixar as cópias vivas é pior do que não ter criado.

### 14.6 Novo campo em formulário

1. Tipo em `src/types/`.
2. Campo no `*Dialog` usando o input pronto (`Input`, `CurrencyInput`,
   `TagListInput`, `Select`...).
3. Se for enum, os textos vão no `labels.ts` da feature.
4. Coluna correspondente na tabela, se precisar aparecer na listagem.

---

## 15. Armadilhas conhecidas

Erros que já aconteceram neste projeto e custaram tempo.

**Route Handler que não repassa query params.** Sem
`params: Object.fromEntries(searchParams)`, o backend recebe sempre a página 1 e
a paginação vira no-op — sem erro, sem log, só dados errados. Aconteceu em 5
rotas de uma vez.

**Filtro no cliente com paginação no servidor.** Uma página de 10 registros
exibindo 7, com o rodapé dizendo outro total. Filtro de lista vai para o backend.

**Select truncado em 10 itens.** Todo consumidor de lista que não é tabela
precisa de `ALL_ITEMS_PAGE_SIZE` (seção 10).

**Fundo de linha de tabela.** `border-separate` ignora `background` no `<tr>`; o
`bg-surface` mora no `<td>` (seção 8).

**`data` sem `useMemo`.** `query.data?.data ?? []` retorna array novo a cada
render e faz o TanStack Table remontar em loop.

**Importar `backendClient` no cliente.** Quebra o build ao tentar ler `env` no
browser. No browser é sempre `httpClient`.

**Console do navegador acumulado.** Erros antigos numa aba de dev server aberta
há muito tempo parecem falhas atuais. Abra uma aba nova antes de concluir que
algo quebrou.

**`middleware.ts` não existe.** No Next 16 o arquivo é `src/proxy.ts`, exportando
`proxy` e `config`.

### Avisos de lint esperados

`npm run lint` termina com 0 erros e ~10 warnings conhecidos, todos aceitos:

- `<img>` em overlays de loading (`next/image` não se aplica ali)
- `useReactTable` sinalizado pelo React Compiler
- `window.location.href` no interceptor 401 do `client.ts`

Se aparecer warning fora dessa lista, é seu.

---

## 16. Antes de concluir

Rode os três, nesta ordem, e só considere pronto com os três limpos:

```bash
npm run lint
```

```bash
npx tsc --noEmit
```

```bash
npm run build
```

Além disso, antes de abrir um PR:

- Nenhum comentário novo no código (seção 3.2)
- Nenhum identificador em português (seção 3.1)
- Nenhuma cor literal — só tokens (seção 8)
- Nenhum bloco de JSX duplicado que já exista em `components/ui/` (seção 3.3)
- Se mexeu numa lista: paginação e contagem conferem, e nenhum select ficou
  truncado (seção 10)
- Se mudou o comportamento do produto: esta documentação foi atualizada junto
