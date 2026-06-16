# Developer Guide

Everything a developer needs to set up, run, extend, and maintain the Speaking App codebase.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Bun | ≥ 1.1 | `curl -fsSL https://bun.sh/install \| bash` |
| Node.js | ≥ 20 (for Wrangler) | https://nodejs.org |
| Git | any | https://git-scm.com |

A browser that supports the **Web Speech API** is required for the speaking feature: Chrome 33+, Edge 79+, Safari 14.1+. Firefox does not support `SpeechRecognition`.

---

## Initial Setup

```bash
# 1. Install dependencies
bun install

# 2. Copy the environment template
cp .env.example .env

# 3. Add your Gemini API key  (get one at https://aistudio.google.com/apikey)
#    Edit .env and set:
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=your_key_here

# 4. Start the development server
bun run dev
```

The app is now running at **http://localhost:3000**.

---

## Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server with HMR on port 3000 |
| `bun run build` | Production build (client + server bundles) |
| `bun run preview` | Preview the production build locally |
| `bun run generate-routes` | Manually regenerate `src/routeTree.gen.ts` |
| `bun run test` | Run Vitest test suite |
| `bun run lint` | Lint with ESLint |
| `bun run format` | Format with Prettier + ESLint fix |
| `bun run check` | Check formatting without modifying files |
| `bun run deploy` | Build + deploy to Cloudflare Workers |

---

## Environment Variables

All variables are prefixed with `VITE_` and are available in the browser. They are inlined at build time by Vite — never sent over the network.

```bash
# .env

# ── Backend ───────────────────────────────────────────────────────
VITE_API_URL=http://localhost:3000/api

# ── AI Provider ───────────────────────────────────────────────────
# Options: gemini | openai | groq | claude | deepseek | azure-openai | ollama
VITE_AI_PROVIDER=groq

# ── API Keys (only the active provider's key is required) ─────────
VITE_GEMINI_API_KEY=
VITE_OPENAI_API_KEY=
VITE_CLAUDE_API_KEY=
VITE_GROQ_API_KEY=
```

> **Security:** Never commit `.env`. It is in `.gitignore`. If you accidentally expose an API key, revoke it immediately in the provider's dashboard.

All env vars are accessed through `src/config/env.ts`. Never read `import.meta.env` directly in any other file.

---

## Adding a New AI Provider

The provider abstraction means adding a new LLM touches exactly **3 files**.

### Step 1 — Create the provider file

```
src/features/ai/providers/<name>.provider.ts
```

```typescript
// src/features/ai/providers/groq.provider.ts

import type { AIProvider } from './ai-provider'
import type { Message } from '../types/conversation.types'

type GroqRole = 'system' | 'user' | 'assistant'
type GroqMessage = { role: GroqRole; content: string }
type GroqResponse = { choices: Array<{ message: { content: string } }> }

function toGroqRole(role: Message['role']): GroqRole {
  return role === 'user' ? 'user' : 'assistant'
}

function createGroqProvider(apiKey: string, model = 'llama3-70b-8192'): AIProvider {
  return {
    generateResponse: async (message, characterPrompt, history): Promise<string> => {
      const messages: GroqMessage[] = [
        { role: 'system', content: characterPrompt },
        ...history.map((m) => ({ role: toGroqRole(m.role), content: m.englishText })),
        { role: 'user', content: message },
      ]

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, max_tokens: 512 }),
      })

      if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`)

      const data = await res.json() as GroqResponse
      const text = data.choices[0]?.message.content
      if (!text) throw new Error('Groq returned an empty response')
      return text.trim()
    },
  }
}

export { createGroqProvider }
```

### Step 2 — Register in the factory

```typescript
// src/features/ai/providers/provider-factory.ts

import { createGroqProvider } from './groq.provider'   // add import

// inside getProvider():
case 'groq': {
  if (!env.VITE_GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not set.')
  }
  return createGroqProvider(env.VITE_GROQ_API_KEY)
}
```

### Step 3 — Add the key to env

```typescript
// src/config/env.ts — already has this:
VITE_GROQ_API_KEY: (import.meta.env['VITE_GROQ_API_KEY'] as string | undefined) ?? '',
```

```bash
# .env.example — add:
VITE_GROQ_API_KEY=
```

### Use it

```bash
# .env
VITE_AI_PROVIDER=groq
VITE_GROQ_API_KEY=gsk_...
```

No other changes needed anywhere in the application.

> **Groq is already implemented.** Use `VITE_AI_PROVIDER=groq` and `VITE_GROQ_API_KEY` directly — no additional steps required.

---

## Adding a New AI Character

Characters are defined in `src/features/ai/services/character.service.ts`.

```typescript
// Add to DEFAULT_CHARACTERS array:
{
  id: 'debate-partner',
  name: 'Jordan',
  description: 'Debate partner for advanced speakers',
  personality:
    'Intellectual, challenging, and direct. Presents opposing viewpoints to develop argumentation skills.',
  speakingStyle:
    'Formal and precise. Uses rhetorical techniques. Asks probing follow-up questions.',
  avatarEmoji: '🎙️',
},
```

The character immediately appears in the selector grid on the home page.

If you want a character to be available to all users immediately, add it to `DEFAULT_CHARACTERS`. If it should be user-created, use `useCharacterStore.getState().addCustomCharacter(character)`.

---

## Adding a New Route

### Step 1 — Create the route file

```
src/routes/settings.tsx
```

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/app/layouts'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <MainLayout>
      <div>
        <h1>Settings</h1>
      </div>
    </MainLayout>
  )
}
```

### Step 2 — Add to constants

```typescript
// src/constants/index.ts
const ROUTES = {
  HOME: '/',
  SPEAK: '/speak',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',   // add this
} as const
```

### Step 3 — Regenerate the route tree

The route tree regenerates automatically on the next `bun run dev`. To regenerate manually:

```bash
bun run generate-routes
```

This updates `src/routeTree.gen.ts` so that `<Link to="/settings">` and `navigate({ to: '/settings' })` are fully type-checked.

---

## Adding a New Feature

Each feature is a self-contained vertical slice. Follow this structure:

```
src/features/vocabulary/
├── components/
│   └── VocabularyList.tsx
├── hooks/
│   ├── use-vocabulary.ts
│   └── index.ts
├── services/
│   └── vocabulary.service.ts
├── schemas/
│   └── word.schema.ts
├── types/
│   └── index.ts
├── store/
│   └── vocabulary.store.ts   (if needed)
└── index.ts                  ← public barrel
```

**Rules:**
- Export only what external consumers need from `index.ts`
- Import from other features only through their `index.ts`
- Internal paths stay internal

---

## Adding a New Zustand Store

Follow the established pattern exactly:

```typescript
// src/features/<name>/store/<name>.store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'   // only if persistence needed
import { STORAGE_KEYS } from '@/constants'

// 1. State type
type FooState = {
  items: string[]
  isLoading: boolean
}

// 2. Actions type
type FooActions = {
  addItem: (item: string) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

// 3. Combined store type
type FooStore = FooState & FooActions

// 4. Initial state (reused in reset action)
const initialState: FooState = {
  items: [],
  isLoading: false,
}

// 5. Create store
const useFooStore = create<FooStore>()(
  persist(
    (set) => ({
      ...initialState,
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.FOO_STORAGE,        // add FOO_STORAGE to constants
      partialize: (state) => ({ items: state.items }),  // only persist what's needed
    },
  ),
)

export { useFooStore }
export type { FooStore, FooState, FooActions }
```

**Selector rule:** Always subscribe to the smallest slice:

```typescript
// ✅ Only re-renders when items changes
const items = useFooStore((state) => state.items)

// ❌ Re-renders on any store change
const store = useFooStore()
```

---

## Adding a New TanStack Query Hook

```typescript
// src/features/<name>/hooks/use-<resource>.ts

import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { fooService } from '../services/foo.service'

function useFoo(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.FOO.ITEM, id],
    queryFn: () => fooService.getById(id),
    enabled: !!id,
  })
}

export { useFoo }
```

Add the query key to `src/constants/index.ts`:

```typescript
const QUERY_KEYS = {
  // ...existing keys...
  FOO: {
    LIST: ['foo', 'list'] as const,
    ITEM: ['foo', 'item'] as const,
  },
} as const
```

---

## Working with the Conversation Pipeline

The conversation pipeline in `useConversation.ts` follows a strict sequence. When debugging, check each step:

### Diagnosing STT issues

```typescript
// Check browser support before rendering the VoiceButton
import { speechService } from '@/features/ai/services/speech.service'

if (!speechService.isSTTSupported()) {
  // Show "Use Chrome or Edge" message
}
```

Common STT problems:
- **`not-allowed`** error → user denied microphone permission
- **`no-speech`** error → resolved as empty string (not an error in our service)
- **`network`** error → browser can't reach Google's STT endpoint (Chrome uses cloud STT)
- No result at all → `recognition.onend` fires without `onresult`, resolves `''`

### Diagnosing AI provider issues

The error is always surfaced to `useConversationStore.error`. Check what your `.env` says:

```bash
# Verify the key is loaded
console.log(env.VITE_AI_PROVIDER)      # should be 'gemini'
console.log(env.VITE_GEMINI_API_KEY)   # should be non-empty
```

Common provider errors:
- `VITE_GEMINI_API_KEY is not set` → check your `.env` file
- `Gemini API error 400` → malformed request (usually empty message)
- `Gemini API error 429` → rate limit exceeded, wait and retry
- `Gemini API error 403` → invalid or expired API key

### Diagnosing TTS issues

```typescript
if (!speechService.isTTSSupported()) {
  // Browser doesn't support SpeechSynthesis
}
```

TTS issues:
- **Silence** → some browsers block autoplay. Ensure TTS is triggered by a user gesture (the mic button click chain satisfies this).
- **Wrong voice** → change `utterance.lang` in `speech.service.ts` `speak()` method
- **Too fast** → adjust `rate` in `TextToSpeechOptions` (default 0.92)

---

## TypeScript Conventions

### Use `type`, not `interface`

```typescript
// ✅
type User = { id: string; email: string }

// ❌
interface User { id: string; email: string }
```

### Always `import type` for type-only imports

The project uses `"verbatimModuleSyntax": true`. Failing to use `import type` causes build errors.

```typescript
// ✅
import type { Message } from '../types/conversation.types'
import type { ReactNode } from 'react'

// ❌ — type-only import without `type` keyword
import { Message } from '../types/conversation.types'
```

### No `React.FC`, no anonymous arrow components

```typescript
// ✅
function MyComponent({ title }: { title: string }) {
  return <h1>{title}</h1>
}
export { MyComponent }

// ❌
const MyComponent: React.FC<{ title: string }> = ({ title }) => <h1>{title}</h1>
export default MyComponent
```

### Void the navigate promise

```typescript
// ✅ — avoids ESLint "no floating promises"
void navigate({ to: '/speak' })

// ❌
navigate({ to: '/speak' })
```

---

## Code Style

The project uses Prettier for formatting and ESLint (`@tanstack/eslint-config`) for linting.

```bash
# Format all files
bun run format

# Check without modifying
bun run check

# Lint only
bun run lint
```

Key style rules:
- 2-space indentation
- Single quotes
- Trailing commas
- Semicolons off (handled by ASI)
- No default exports (enforced by ESLint)
- No unused locals or parameters (enforced by TypeScript)

---

## Testing

The project uses **Vitest** with **@testing-library/react**.

```bash
bun run test
```

Test files should be co-located with the code they test or placed in a `__tests__/` folder.

Example test for a service:

```typescript
// src/features/ai/services/character.service.test.ts
import { describe, it, expect } from 'vitest'
import { characterService } from './character.service'

describe('characterService', () => {
  it('returns 5 default characters', () => {
    expect(characterService.getDefaultCharacters()).toHaveLength(5)
  })

  it('builds a system prompt containing the character name', () => {
    const character = characterService.findById('english-teacher')!
    const prompt = characterService.buildSystemPrompt(character)
    expect(prompt).toContain('Sarah')
  })
})
```

---

## Deployment

### Cloudflare Workers

```bash
bun run deploy
```

This runs `vite build` (which produces `dist/server/` in Cloudflare Workers format) then `wrangler deploy`.

**Requirements:**
- Run `wrangler login` once before first deploy
- `wrangler.jsonc` is already configured with the correct entry point

### Environment variables in production

Do not put API keys in `wrangler.jsonc`. Use Cloudflare's secret manager:

```bash
wrangler secret put VITE_GEMINI_API_KEY
# Enter the key value when prompted
```

Or set them in the Cloudflare dashboard → Workers → your worker → Settings → Variables.

---

## Common Tasks Cheat Sheet

| Task | What to do |
|---|---|
| Switch AI provider | Set `VITE_AI_PROVIDER=groq` (or `gemini`, `openai`) in `.env` |
| Add a new LLM | Create `providers/<name>.provider.ts`, add case in `provider-factory.ts` |
| Add a new character | Add entry to `DEFAULT_CHARACTERS` in `character.service.ts` |
| Add a new route | Create `src/routes/<name>.tsx`, add to `ROUTES` constants, run `generate-routes` |
| Add a new feature | Create `src/features/<name>/` with the standard slice structure |
| Change mic language | Pass BCP-47 tag to `startVoiceInput('es-ES')` in `ConversationView` |
| Change TTS speed | Adjust `rate` in `speechService.speak()` options (default 0.92) |
| Debug AI errors | Check `useConversationStore.error` in React DevTools |
| Reset conversation | Call `clearMessages()` from `useConversation()` hook |
| Clear all localStorage | `localStorage.clear()` in browser console (resets all Zustand persisted state) |
| Regenerate route types | `bun run generate-routes` |
| Type-check only | `bun run tsc --noEmit` |
| Full production build | `bun run build` |
