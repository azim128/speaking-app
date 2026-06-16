# Speaking App — Project Rules & Architecture Guide

> The AI must follow every rule in this file whenever creating, modifying, or
> refactoring any code in this project. These rules are non-negotiable unless
> the user explicitly overrides them for a specific task.

---

## 1. Project Overview

| Property | Value |
|---|---|
| Framework | **TanStack Start** (SSR, built on TanStack Router) |
| Runtime | **Bun** |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS v4** |
| Deployment target | **Cloudflare Workers** (via `wrangler`) |

This is a **server-side rendered** application. The entry point is managed by
`@tanstack/react-start` — there is **no `main.tsx`**. The router is configured
in `src/router.tsx` and consumed by the framework automatically.

---

## 2. Tech Stack

| Concern | Library | Import from |
|---|---|---|
| Routing | `@tanstack/react-router` | `@tanstack/react-router` |
| SSR framework | `@tanstack/react-start` | handled by framework |
| Server state | `@tanstack/react-query` | `@tanstack/react-query` |
| HTTP client | `axios` | `@/lib/axios` (always use the configured instance) |
| Client state | `zustand` | `zustand`, `zustand/middleware` |
| Validation | `zod` | `zod` |
| Styling | Tailwind CSS v4 | utility classes in JSX |
| Icons | `lucide-react` | `lucide-react` |

---

## 3. Folder Structure

```
src/
├── app/
│   ├── providers/          # React context providers (QueryProvider, etc.)
│   └── layouts/            # Page-shell components (MainLayout, AuthLayout)
│
├── assets/
│   ├── styles/
│   │   ├── globals.css     # @import tailwind + resets
│   │   └── theme.css       # CSS custom properties (colors, radius, fonts)
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│   ├── ui/                 # Primitive, reusable UI (Button, Input, Modal…)
│   └── shared/             # Composed components used across features
│
├── config/
│   ├── env.ts              # Typed wrapper around import.meta.env
│   └── app.config.ts       # App-level constants derived from env
│
├── constants/              # Shared enums and literal maps (ROUTES, QUERY_KEYS…)
│
├── features/               # ← primary unit of work (see §5)
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── schemas/        # Zod schemas
│       ├── types/
│       ├── store/          # Feature-scoped Zustand store (if needed)
│       └── index.ts        # Public barrel — ONLY export what other features need
│
├── hooks/                  # Global shared hooks (not feature-specific)
├── lib/
│   ├── axios.ts            # Configured Axios instance (interceptors, auth)
│   ├── query-client.ts     # SSR-safe QueryClient singleton
│   └── utils.ts            # Pure utility functions (cn, formatDate, sleep)
│
├── routes/                 # TanStack Router file-based routes
│   ├── __root.tsx          # HTML shell + QueryProvider
│   ├── index.tsx
│   ├── login.tsx
│   ├── dashboard.tsx
│   └── routeTree.gen.ts    # AUTO-GENERATED — never edit by hand
│
├── services/api/           # Re-exports of all feature services (aggregator)
├── store/                  # App-level Zustand stores (theme, sidebar…)
├── types/                  # Global TypeScript types (ApiResponse, etc.)
└── utils/                  # Re-exports from lib/utils for convenience
```

### Placement rules

- **Feature code belongs inside `src/features/<name>/`**. Do not place feature
  logic in `src/components/`, `src/hooks/`, or `src/store/` unless it is
  genuinely shared across two or more unrelated features.
- **Shared UI primitives** (Button, Input, Badge…) go in `src/components/ui/`.
- **Cross-feature composed components** go in `src/components/shared/`.
- **Global hooks** (useMediaQuery, useDebounce…) go in `src/hooks/`.
- **App-level state** (theme, sidebar) lives in `src/store/`.
- **Feature-level state** lives in `src/features/<name>/store/`.

---

## 4. Path Aliases

The single alias `@` maps to `src/`.

```ts
// ✅ correct
import { useAppStore } from '@/store/app.store'
import { LoginPage } from '@/features/auth'
import { cn } from '@/lib/utils'

// ❌ wrong — never use relative paths that cross feature or layer boundaries
import { LoginPage } from '../../features/auth'
```

Relative imports are acceptable **only within the same feature folder**
(e.g., `../types`, `./use-login`).

---

## 5. Feature-Based Architecture

Each feature is a self-contained vertical slice:

```
features/auth/
├── components/   UI components owned by this feature
├── hooks/        Custom hooks (useLogin, useRegister…)
├── services/     Axios calls — plain async functions, no hooks
├── schemas/      Zod schemas for forms and API payloads
├── types/        TypeScript types scoped to this feature
├── store/        Zustand store (only if feature needs local client state)
└── index.ts      Public barrel — the only export surface
```

### Feature rules

1. **Other features import only from `index.ts`**, never from internal paths.
   ```ts
   // ✅
   import { LoginPage } from '@/features/auth'

   // ❌
   import { LoginPage } from '@/features/auth/components/LoginPage'
   ```
2. The `index.ts` barrel must **only export what is needed by other features**.
   Keep internals private.
3. A feature **must not import from another feature** directly — shared logic
   must be promoted to `src/lib/`, `src/hooks/`, or `src/components/`.

---

## 6. TypeScript Rules

### Use `type`, not `interface`

```ts
// ✅
type User = { id: string; email: string }

// ❌
interface User { id: string; email: string }
```

### `import type` for type-only imports

The project uses `"verbatimModuleSyntax": true`. Any import used only as a type
must use `import type`.

```ts
// ✅
import type { ReactNode } from 'react'
import type { AuthUser } from '../types'

// ❌
import { ReactNode } from 'react'
```

### No inline `React.SomeType` — import the type directly

```ts
// ✅
import type { ReactNode, FormEvent } from 'react'
function Layout({ children }: { children: ReactNode }) { … }

// ❌
function Layout({ children }: { children: React.ReactNode }) { … }
```

### Strict mode is enforced

The compiler options include:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

Every unused import or variable will cause a build error. Remove them.

---

## 7. Component Rules

### Functional components only — no class components

### No `React.FC`

```ts
// ✅
function Button({ label }: { label: string }) { … }

// ❌
const Button: React.FC<{ label: string }> = ({ label }) => { … }
```

### Named exports only — no default exports (except where forced)

```ts
// ✅
export { Button }
export { useLogin }

// ❌
export default Button
```

> **Exception**: TanStack Router file-based routing requires
> `export const Route = createFileRoute(…)`. That named export is correct.
> No default export is needed even for route files.

### Props type defined above the component

```ts
type ButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
}

function Button({ label, onClick, disabled = false }: ButtonProps) { … }

export { Button }
```

### No anonymous arrow-function components

```ts
// ✅
function HomePage() { … }
export { HomePage }

// ❌
export const HomePage = () => { … }
```

---

## 8. Routing (TanStack Router)

- Routes live in `src/routes/` using **file-based routing**.
- `routeTree.gen.ts` is **auto-generated** — never edit it manually. The dev
  server regenerates it on startup via the `tanstackStart()` Vite plugin.
- Each route file exports **one** `Route` constant:

```ts
import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/app/layouts'
import { SomePage } from '@/features/some-feature'

export const Route = createFileRoute('/some-path')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <MainLayout>
      <SomePage />
    </MainLayout>
  )
}
```

- Route components should be thin **orchestration shells** — they pick a layout
  and render the feature page. Business logic stays in the feature.
- Use `useNavigate()` for programmatic navigation (not `useRouter().navigate`).
- Use `<Link to="…">` for declarative navigation.
- Route paths must match a key in `ROUTES` constant (`src/constants/index.ts`).

### Layouts

| Layout | Use for |
|---|---|
| `MainLayout` | Authenticated pages with sidebar navigation |
| `AuthLayout` | Unauthenticated pages (login, register, forgot password) |

---

## 9. Data Fetching (TanStack Query)

### Always use the shared `getQueryClient()` from `@/lib/query-client`

Never instantiate `new QueryClient()` outside of `lib/query-client.ts`.

### Query key conventions

All query keys live in `QUERY_KEYS` in `src/constants/index.ts`.

```ts
// src/constants/index.ts
const QUERY_KEYS = {
  AUTH: { ME: ['auth', 'me'] as const },
  DASHBOARD: { STATS: ['dashboard', 'stats'] as const },
} as const
```

Use them in hooks:

```ts
import { QUERY_KEYS } from '@/constants'

function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.STATS,
    queryFn: () => dashboardService.getStats(),
  })
}
```

### Hook naming

| Pattern | Example |
|---|---|
| Read data | `use<Resource>` | `useUser`, `useDashboardStats` |
| Mutate data | `use<Verb><Resource>` | `useLogin`, `useUpdateProfile` |

### Services are plain async functions — never hooks

```ts
// ✅ service — no hooks, no React
const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post('/auth/login', credentials)
    return data
  },
}

// ❌ do not call useQuery inside a service
```

---

## 10. HTTP Client (Axios)

**Always import `axiosInstance` from `@/lib/axios`** — never use raw `axios`.

```ts
// ✅
import { axiosInstance } from '@/lib/axios'

// ❌
import axios from 'axios'
axios.get(…)
```

The configured instance provides:
- Base URL from `VITE_API_URL`
- Automatic `Authorization: Bearer <token>` injection
- Global 401 handler (clears token, redirects to `/login`)
- 15-second request timeout

---

## 11. State Management (Zustand)

### Store structure pattern

```ts
// 1. State type
type FooState = { count: number }

// 2. Actions type
type FooActions = { increment: () => void; reset: () => void }

// 3. Combined store type
type FooStore = FooState & FooActions

// 4. Initial state constant (reused in reset)
const initialState: FooState = { count: 0 }

// 5. Store creation
const useFooStore = create<FooStore>()((set) => ({
  ...initialState,
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set(initialState),
}))

export { useFooStore }
export type { FooStore, FooState, FooActions }
```

### `persist` middleware

- Use `partialize` to **only persist what must survive a page refresh**.
- Use `STORAGE_KEYS` constants for storage names.
- Guard `localStorage` access with `typeof window !== 'undefined'` (SSR safety).

### Selector pattern — subscribe to the smallest slice

```ts
// ✅
const theme = useAppStore((state) => state.theme)

// ❌ — subscribes to the entire store, causes unnecessary re-renders
const store = useAppStore()
```

---

## 12. Validation (Zod)

- Schemas live in `features/<name>/schemas/`.
- Schema files are named `<resource>.schema.ts`.
- Always export the inferred type alongside the schema:

```ts
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export { loginSchema }
export type { LoginFormValues }
```

---

## 13. CSS & Styling (Tailwind CSS v4)

- Tailwind is imported via `@import "tailwindcss"` in `globals.css`.
- Design tokens (colors, radius, fonts) are CSS custom properties in `theme.css`.
- Use Tailwind utility classes directly in JSX — no separate CSS files per component.
- Do **not** use `@apply` in CSS files (it defeats the purpose of utilities).
- CSS variable names follow the pattern `--color-<role>`, `--radius-<size>`.

### Class composition

Use the `cn()` utility from `@/lib/utils` to conditionally merge classes:

```ts
import { cn } from '@/lib/utils'

const cls = cn(
  'rounded-lg px-4 py-2 text-sm font-semibold',
  isActive && 'bg-blue-600 text-white',
  isDisabled && 'opacity-60 cursor-not-allowed',
)
```

---

## 14. Environment Variables

- All `VITE_*` variables are accessed through `src/config/env.ts` — never
  reference `import.meta.env` directly outside that file.
- Add every new variable to `.env.example` with a placeholder value.
- Never commit secrets. The `.env` file is gitignored.

```ts
// ✅
import { env } from '@/config/env'
const url = env.VITE_API_URL

// ❌
const url = import.meta.env.VITE_API_URL
```

---

## 15. Barrel Exports (`index.ts`)

Every folder that is imported by external code must have an `index.ts` that
re-exports its public API.

```ts
// features/auth/index.ts
export { LoginPage } from './components/LoginPage'
export { useLogin } from './hooks'
export { authService } from './services/auth.service'
export { loginSchema } from './schemas/login.schema'
export { useAuthStore } from './store/auth.store'
export type { AuthUser, LoginCredentials, AuthResponse } from './types'
```

Rules:
- Only export what external consumers actually need.
- Re-export types using `export type { … }`.
- Keep internal implementation details unexported.

---

## 16. SSR Safety

This project runs on the server (Cloudflare Workers). Browser-only APIs must
be guarded:

```ts
// localStorage / sessionStorage
if (typeof window !== 'undefined') {
  localStorage.setItem('key', value)
}

// window / document
if (typeof document !== 'undefined') {
  document.title = '…'
}
```

The `QueryClient` is instantiated per-request on the server and as a singleton
on the client (see `src/lib/query-client.ts`).

Do **not** use browser-only APIs at module initialization time (outside a
function or effect).

---

## 17. File & Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| React component file | `PascalCase.tsx` | `LoginPage.tsx` |
| Hook file | `kebab-case.ts` | `use-login.ts` |
| Service file | `kebab-case.ts` | `auth.service.ts` |
| Schema file | `kebab-case.ts` | `login.schema.ts` |
| Store file | `kebab-case.ts` | `auth.store.ts` |
| Utility / lib file | `kebab-case.ts` | `query-client.ts` |
| Barrel | `index.ts` | `index.ts` |
| Type-only file | `index.ts` or `kebab-case.ts` | `index.ts` |
| Route file | `kebab-case.tsx` | `dashboard.tsx` |
| Root route | `__root.tsx` | `__root.tsx` |

---

## 18. AI Feature Architecture

### The provider abstraction rule (most important)

The application **must never know which AI provider is active**. The only
place where a provider name appears is `provider-factory.ts`. Every other file
receives an `AIProvider` value and calls `.generateResponse()` on it.

```
useConversation
  → conversationService.getResponse()
    → providerFactory.getProvider()   ← only crossing point
      → gemini / openai / …           ← invisible to the rest of the app
```

### Adding a new LLM provider

1. Create `src/features/ai/providers/<name>.provider.ts`
   - Export a `create<Name>Provider(apiKey: string): AIProvider` factory
   - Use native `fetch` for REST calls — no extra SDK dependency
   - Add a role-mapping helper for the provider's message format
2. Add a `case '<name>':` in `provider-factory.ts`
3. Add `VITE_<NAME>_API_KEY` to `src/config/env.ts` and `.env.example`
4. No changes needed anywhere else

### Adding a new Speech provider

1. Create `src/features/ai/providers/<name>-speech.provider.ts`
2. Return an object shaped like `speechService` (same method signatures)
3. Swap it out in `useSpeech.ts` — the rest of the app is unaffected

### Conversation pipeline rules

- `components/` → UI only, calls hooks
- `hooks/` → state orchestration, calls services
- `services/` → business logic, calls `providerFactory`
- `providers/` → external integrations, called by services
- `store/` → shared state, no side effects

Services are plain async functions — **never call React hooks inside a service**.

### Message history rule

When building a request to the AI, snapshot `useConversationStore.getState().messages`
**before** adding the current user message to the store. This prevents the
current turn from appearing twice in the provider's history.

### Speech service rules

- Every browser API call inside `speech.service.ts` must be guarded with
  `typeof window !== 'undefined'`
- `SpeechRecognition` and `SpeechSynthesis` types are declared locally in the
  service file — do not rely on TypeScript's DOM lib for these
- `no-speech` recognition errors are not real errors; resolve with `''`

### Character system rules

- `character.service.ts` owns the default character list and prompt builder
- Call `characterService.buildSystemPrompt(character)` before every provider call
- Character selection is persisted via Zustand `persist` (`CHARACTER_STORAGE` key)
- Custom characters are stored in `customCharacters[]` in the character store
- Route `routes/speak.tsx` redirects client-side to `/` if no character is
  selected (not in `beforeLoad` — that would break SSR)

### Conversation store rules

- `conversationState` drives all UI feedback (listening / translating / thinking / speaking)
- The conversation store is **session-only** — intentionally NOT persisted
- `error` is always reset to `null` at the start of a new voice input cycle

---

## 19. Do's and Don'ts

### ✅ Do

- Use `type` (not `interface`) for all TypeScript definitions.
- Use `import type` for type-only imports.
- Use named exports everywhere.
- Import `axiosInstance` from `@/lib/axios`, never raw `axios`.
- Import env values from `@/config/env`.
- Use `QUERY_KEYS`, `ROUTES`, and `STORAGE_KEYS` constants instead of magic strings.
- Guard `localStorage` / `window` with `typeof window !== 'undefined'`.
- Keep route files as thin orchestration shells.
- Add new routes to `ROUTES` in `src/constants/index.ts`.
- Use `getQueryClient()` from `@/lib/query-client` — never `new QueryClient()` ad-hoc.
- Use `void navigate(…)` when calling `useNavigate()` imperatively (avoids unhandled promise lint warnings).

### ❌ Don't

- Don't use `interface` — use `type`.
- Don't use `React.FC` — use plain function declarations.
- Don't use default exports (except where forced by a third-party API).
- Don't import from inside a feature's subdirectories from outside that feature.
- Don't call `import.meta.env` outside `src/config/env.ts`.
- Don't edit `src/routeTree.gen.ts` — it is auto-generated.
- Don't access `localStorage` at module initialization time (SSR will crash).
- Don't put feature logic into `src/components/`, `src/hooks/`, or `src/store/` unless it's truly shared.
- Don't use `@apply` in CSS — compose with `cn()` in JSX.
- Don't create a new `QueryClient` anywhere other than `lib/query-client.ts`.
- Don't add comments that merely restate the code — only comment non-obvious intent.
