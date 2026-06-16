# File Structure

Complete annotated file tree for the Speaking App. Every directory and file is explained.

---

## Root

```
speaking-app/
│
├── docs/                        ← Project documentation (this folder)
│   ├── project-overview.md
│   ├── architecture-overview.md
│   ├── file-structure.md
│   └── developer-guide.md
│
├── .skill/
│   └── project.md               ← AI coding rules (enforced by Zed agent)
│
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
│
├── src/                         ← All application source code
│
├── .env.example                 ← Template for required environment variables
├── .gitignore
├── .prettierignore
├── bun.lock
├── eslint.config.js             ← ESLint with @tanstack/eslint-config
├── package.json
├── prettier.config.js
├── tsconfig.json                ← Strict TypeScript, @/* alias, bundler mode
├── tsr.config.json              ← TanStack Router file-based routing config
├── vite.config.ts               ← Vite + TanStack Start + Cloudflare + Tailwind
└── wrangler.jsonc               ← Cloudflare Workers deployment config
```

---

## src/

```
src/
│
├── app/                         ← Framework-level wrappers (not feature code)
│   ├── providers/
│   │   ├── QueryProvider.tsx    ← QueryClientProvider + ReactQueryDevtools
│   │   ├── RouterProvider.tsx   ← Thin wrapper for CSR / test scenarios
│   │   └── index.ts
│   ├── layouts/
│   │   ├── MainLayout.tsx       ← Sidebar + main content (authenticated pages)
│   │   ├── AuthLayout.tsx       ← Centered card (login / register)
│   │   └── index.ts
│   └── index.ts
│
├── assets/
│   ├── styles/
│   │   ├── globals.css          ← @import tailwindcss + resets + font-smoothing
│   │   └── theme.css            ← CSS custom properties (:root + .dark)
│   ├── images/                  ← Static images
│   ├── icons/                   ← Custom SVG icons
│   └── fonts/                   ← Self-hosted fonts
│
├── components/
│   ├── ui/                      ← Primitive components (Button, Input, Badge…)
│   └── shared/                  ← Composed cross-feature components
│
├── config/
│   ├── env.ts                   ← Typed wrapper around import.meta.env (only file that reads it)
│   └── app.config.ts            ← App-level constants derived from env.ts
│
├── constants/
│   └── index.ts                 ← ROUTES, STORAGE_KEYS, QUERY_KEYS, APP_NAME
│
├── features/                    ← Feature-based architecture (primary unit of work)
│   ├── ai/                      ← Core AI feature (see expanded tree below)
│   ├── auth/                    ← Authentication (scaffold, future)
│   ├── dashboard/               ← Analytics dashboard (scaffold, future)
│   └── home/                    ← Legacy home page (replaced by CharacterSelector)
│
├── hooks/
│   └── index.ts                 ← Global shared hooks (not feature-specific)
│
├── lib/
│   ├── axios.ts                 ← Configured Axios instance (interceptors, auth)
│   ├── query-client.ts          ← SSR-safe QueryClient singleton
│   └── utils.ts                 ← cn(), formatDate(), sleep()
│
├── routes/                      ← TanStack Router file-based routes
│   ├── __root.tsx               ← HTML shell + QueryProvider + devtools
│   ├── index.tsx                ← / → CharacterSelector
│   ├── speak.tsx                ← /speak → ConversationView
│   ├── login.tsx                ← /login → LoginPage (future)
│   ├── dashboard.tsx            ← /dashboard → DashboardPage (future)
│   └── routeTree.gen.ts         ← AUTO-GENERATED — never edit manually
│
├── router.tsx                   ← TanStack router instance (used by TanStack Start)
│
├── services/
│   └── api/
│       └── index.ts             ← Aggregator re-exporting all feature services
│
├── store/
│   ├── app.store.ts             ← Theme + sidebar state (app-level)
│   └── index.ts
│
├── types/
│   └── index.ts                 ← ApiResponse<T>, ApiError, PaginatedResponse<T>
│
├── utils/
│   └── index.ts                 ← Re-exports from lib/utils.ts
│
└── vite-env.d.ts                ← /// <reference types="vite/client" />
```

---

## src/features/ai/ (expanded)

This is the core feature of the application. Each sub-directory is a distinct architectural layer.

```
src/features/ai/
│
├── types/                       ← TypeScript type definitions (no logic)
│   ├── ai.types.ts              ← AIProvider contract, AIProviderName, SpeechProvider
│   ├── conversation.types.ts    ← Message, MessageRole, ConversationState
│   └── character.types.ts       ← Character shape
│
├── providers/                   ← Concrete AI integrations (hidden behind the contract)
│   ├── ai-provider.ts           ← Re-exports AIProvider type + isAIProvider guard
│   ├── gemini.provider.ts       ← Google Gemini REST API (gemini-2.0-flash default)
│   ├── openai.provider.ts       ← OpenAI Chat Completions (gpt-4o-mini default)
│   └── provider-factory.ts      ← Reads VITE_AI_PROVIDER, returns the correct AIProvider
│
├── services/                    ← Business logic (pure async functions, no React)
│   ├── character.service.ts     ← Default characters list + buildSystemPrompt()
│   ├── conversation.service.ts  ← getResponse(message, character, history)
│   ├── translation.service.ts   ← translateToEnglish() + detectLanguage()
│   └── speech.service.ts        ← Browser STT (SpeechRecognition) + TTS (SpeechSynthesis)
│
├── store/                       ← Zustand stores
│   ├── conversation.store.ts    ← messages[], conversationState, error (session-only)
│   └── character.store.ts       ← selectedCharacter, customCharacters (persisted)
│
├── hooks/                       ← State orchestration (React only, calls services)
│   ├── useConversation.ts       ← Full pipeline: STT → translate → AI → TTS
│   ├── useSpeech.ts             ← Microphone capture + TTS playback state
│   └── useCharacter.ts          ← Character selection + navigate to /speak
│
├── components/                  ← UI components (call hooks, render data)
│   ├── ConversationView.tsx     ← Full chat UI: header + message list + voice button
│   ├── CharacterSelector.tsx    ← Grid of CharacterCards
│   ├── CharacterCard.tsx        ← Individual character card with selection state
│   ├── MessageBubble.tsx        ← Single chat message (user or assistant)
│   └── VoiceButton.tsx          ← Animated mic button with 6 visual states
│
└── index.ts                     ← Public barrel — the only export surface for this feature
```

---

## src/features/auth/ (scaffold)

```
src/features/auth/
├── components/
│   └── LoginPage.tsx            ← Email + password form using useLogin mutation
├── hooks/
│   ├── use-login.ts             ← useMutation wrapping authService.login()
│   └── index.ts
├── schemas/
│   └── login.schema.ts          ← Zod schema + LoginFormValues type
├── services/
│   └── auth.service.ts          ← login(), logout(), getMe(), refreshToken()
├── store/
│   └── auth.store.ts            ← user, token, isAuthenticated (persisted)
├── types/
│   └── index.ts                 ← AuthUser, LoginCredentials, AuthResponse
└── index.ts
```

---

## src/features/dashboard/ (scaffold)

```
src/features/dashboard/
├── components/
│   └── DashboardPage.tsx        ← Stat cards + Zustand store demo
├── hooks/
│   ├── use-dashboard-stats.ts   ← useQuery wrapping dashboardService.getStats()
│   └── index.ts
├── services/
│   └── dashboard.service.ts     ← getStats() via axiosInstance
├── types/
│   └── index.ts                 ← DashboardStats, StatCard
└── index.ts
```

---

## Key File Responsibilities

### `src/config/env.ts`
Single source of truth for all environment variables. No other file reads `import.meta.env` directly. All keys have safe fallback defaults. Used at module initialization time — never inside components.

### `src/lib/axios.ts`
The configured backend HTTP client. Automatically attaches `Authorization: Bearer <token>` from `localStorage` on every request. Redirects to `/login` on 401. Only for calls to the app's own backend — not for AI provider APIs.

### `src/lib/query-client.ts`
SSR-safe QueryClient factory. Returns a new `QueryClient` on every server request and a cached singleton on the client. This prevents state leaking between SSR requests.

### `src/features/ai/providers/provider-factory.ts`
The **only** file that knows which AI provider is active. Reads `VITE_AI_PROVIDER`, validates the API key, and returns the correct `AIProvider` implementation. Adding a new LLM provider requires touching only this file (plus the new provider file itself).

### `src/features/ai/hooks/useConversation.ts`
The **orchestration hub** of the entire app. Coordinates six sequential async steps: listening → translating → history snapshot → AI response → TTS → idle. All error handling is centralized here.

### `src/routes/__root.tsx`
The HTML document root. Uses TanStack Start's `shellComponent` for the `<html>/<body>` wrapper and `component` for the React tree root (QueryProvider + Outlet). TanStack devtools are mounted here in development.

### `src/routeTree.gen.ts`
Auto-generated by the TanStack Router Vite plugin on every dev server start. Never edit manually. Provides full TypeScript types for all routes, enabling type-safe `<Link to="...">` and `navigate({ to: ... })`.

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| React component file | `PascalCase.tsx` | `CharacterCard.tsx` |
| Hook file | `camelCase.ts` (use prefix) | `useConversation.ts` |
| Service file | `kebab-case.ts` (.service suffix) | `character.service.ts` |
| Schema file | `kebab-case.ts` (.schema suffix) | `login.schema.ts` |
| Store file | `kebab-case.ts` (.store suffix) | `conversation.store.ts` |
| Provider file | `kebab-case.ts` (.provider suffix) | `gemini.provider.ts` |
| Utility / lib | `kebab-case.ts` | `query-client.ts` |
| Type-only file | `index.ts` or `*.types.ts` | `ai.types.ts` |
| Barrel | `index.ts` | `index.ts` |
| Route | `kebab-case.tsx` | `speak.tsx` |
| Root route | `__root.tsx` | `__root.tsx` |

---

## Import Path Rules

```typescript
// ✅ Absolute — use for all cross-directory imports
import { useAppStore } from '@/store/app.store'
import { ConversationView } from '@/features/ai'        // from barrel only
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants'

// ✅ Relative — acceptable within the SAME feature folder
import { characterService } from '../services/character.service'
import type { Character } from '../types/character.types'

// ❌ Never — cross-feature internal path (bypasses barrel)
import { LoginPage } from '@/features/auth/components/LoginPage'

// ❌ Never — relative path crossing feature boundaries
import { LoginPage } from '../../features/auth'
```

The `@` alias is configured in `tsconfig.json` (`"@/*": ["./src/*"]`) and resolved by Vite via `resolve.tsconfigPaths: true`.
