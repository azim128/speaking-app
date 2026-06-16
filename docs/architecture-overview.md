# Architecture Overview

## System Architecture

Speaking App is a **server-side rendered React application** deployed on Cloudflare Workers. The SSR layer is provided by TanStack Start, which wraps TanStack Router with server rendering, streaming, and edge deployment capabilities.

```
┌─────────────────────────────────────────────────────┐
│                  Cloudflare Workers                  │
│                                                     │
│  ┌──────────────┐        ┌──────────────────────┐  │
│  │ TanStack     │        │  External APIs        │  │
│  │ Start SSR    │──────▶ │  - Gemini REST        │  │
│  │              │        │  - OpenAI REST        │  │
│  │  React 19    │        │  - (future providers) │  │
│  └──────────────┘        └──────────────────────┘  │
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐                                   │
│  │  Browser     │                                   │
│  │  Web Speech  │  (STT + TTS — client-only)        │
│  │  API         │                                   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

---

## Application Layers

The codebase is organized into five horizontal layers, each with a strict responsibility boundary.

```
┌────────────────────────────────────────────────┐
│  Routes          src/routes/                   │  ← Thin shells: layout + feature page
├────────────────────────────────────────────────┤
│  Components      src/features/*/components/    │  ← UI only, calls hooks
├────────────────────────────────────────────────┤
│  Hooks           src/features/*/hooks/         │  ← State orchestration, calls services
├────────────────────────────────────────────────┤
│  Services        src/features/*/services/      │  ← Business logic, calls providers
├────────────────────────────────────────────────┤
│  Providers       src/features/ai/providers/    │  ← External integrations (LLM, Speech)
└────────────────────────────────────────────────┘
        ↕  shared state
┌────────────────────────────────────────────────┐
│  Stores          src/features/*/store/         │  ← Zustand (session + persisted)
│                  src/store/                    │
└────────────────────────────────────────────────┘
```

**Rule:** Data flows down. A layer may only call the layer directly beneath it. A component never calls a service. A service never calls a hook. A provider never calls a store.

---

## AI Feature Architecture

The `features/ai` module is the core of the application. It is designed around a **provider abstraction layer** that decouples application logic from any specific LLM.

### The Provider Contract

Every AI provider implements one interface:

```typescript
type AIProvider = {
  generateResponse: (
    message: string,       // user's current message (in English)
    characterPrompt: string, // system prompt from the selected character
    history: Message[],    // previous messages in the session
  ) => Promise<string>
}
```

No other file in the application holds a reference to `GeminiProvider` or `OpenAIProvider`. They only ever hold `AIProvider`.

### Call Chain

```
startVoiceInput()            ← useConversation hook
  │
  ├─ speechService.startListening()     ← browser SpeechRecognition API
  │    └─ returns: transcript (native language text)
  │
  ├─ translationService.translateToEnglish(transcript)
  │    └─ providerFactory.getProvider().generateResponse(text, TRANSLATE_PROMPT, [])
  │         └─ GeminiProvider / OpenAIProvider / ...
  │
  ├─ conversationService.getResponse(englishText, character, history)
  │    └─ characterService.buildSystemPrompt(character)
  │    └─ providerFactory.getProvider().generateResponse(text, systemPrompt, history)
  │         └─ GeminiProvider / OpenAIProvider / ...
  │
  └─ speechService.speak(responseText)  ← browser SpeechSynthesis API
```

### Provider Factory

`providerFactory.ts` is the **only** file that reads `VITE_AI_PROVIDER` and instantiates a concrete provider. Switching providers requires only a `.env` change.

```
VITE_AI_PROVIDER=gemini   → createGeminiProvider(VITE_GEMINI_API_KEY)
VITE_AI_PROVIDER=openai   → createOpenAIProvider(VITE_OPENAI_API_KEY)
VITE_AI_PROVIDER=claude   → (add case in provider-factory.ts)
```

---

## State Architecture

The application uses two Zustand stores for the AI feature and one app-level store.

### Store map

```
localStorage (persisted)
├── app-storage          → theme preference only
├── auth-storage         → user, token, isAuthenticated (future auth)
└── character-storage    → selectedCharacter, customCharacters

Session (not persisted)
└── ConversationStore    → messages[], conversationState, error
```

### ConversationState machine

The `conversationState` field drives every visual feedback element in the UI. It is a strict state machine with six states:

```
         ┌─────────────────────────────────┐
         │                                 │
         ▼                                 │
       idle ──[tap button]──▶ listening    │
                                  │        │
                         [transcript]      │
                                  │        │
                                  ▼        │
                            translating    │
                                  │        │
                         [english text]    │
                                  │        │
                                  ▼        │
                             thinking      │
                                  │        │
                          [ai response]    │
                                  │        │
                                  ▼        │
                             speaking ─────┘
                        [audio ends / error]
```

Any unhandled error at any step returns the state to `idle` and sets `error`.

---

## Routing Architecture

TanStack Start uses file-based routing. Route files in `src/routes/` are thin orchestration shells — they pick a layout and render a feature page.

```
routes/
├── __root.tsx      HTML shell (head, body) + QueryProvider wrapper
├── index.tsx       / → CharacterSelector
├── speak.tsx       /speak → ConversationView  (client-side redirect if no character)
├── login.tsx       /login → LoginPage         (future)
└── dashboard.tsx   /dashboard → DashboardPage (future)
```

### Root route structure

TanStack Start separates the HTML shell (`shellComponent`) from the React app tree (`component`):

```tsx
Route = {
  shellComponent: RootDocument   // renders <html>, <head>, <body>, scripts
  component: RootComponent       // renders QueryProvider + <Outlet />
}
```

The `QueryProvider` wraps the entire React tree, making `useQuery`/`useMutation` available on every page.

### SSR-safe redirect in /speak

The `/speak` route uses a `useEffect`-based redirect instead of `beforeLoad` because Zustand's `persist` middleware hasn't rehydrated from `localStorage` during the server render:

```tsx
useEffect(() => {
  if (!selectedCharacter) {
    void navigate({ to: '/', replace: true })
  }
}, [selectedCharacter, navigate])
```

---

## Data Flow: Full Conversation Turn

This sequence diagram shows a complete user interaction from voice input to audio playback.

```
User          Browser         useConversation       Services          AI Provider
 │                │                 │                   │                  │
 │──[tap mic]────▶│                 │                   │                  │
 │                │──startListening─▶                   │                  │
 │──[speak]──────▶│                 │                   │                  │
 │                │◀────transcript──│                   │                  │
 │                │                 │                   │                  │
 │                │         setConversationState        │                  │
 │                │         ('translating')             │                  │
 │                │                 │──translateToEnglish▶                 │
 │                │                 │                   │──generateResponse▶
 │                │                 │                   │◀──englishText────│
 │                │                 │◀──englishText─────│                  │
 │                │                 │                   │                  │
 │                │         addMessage(userMessage)     │                  │
 │                │         setConversationState        │                  │
 │                │         ('thinking')                │                  │
 │                │                 │──getResponse──────▶                  │
 │                │                 │                   │──generateResponse▶
 │                │                 │                   │◀──responseText───│
 │                │                 │◀──responseText────│                  │
 │                │                 │                   │                  │
 │                │         addMessage(assistantMessage)│                  │
 │                │         setConversationState        │                  │
 │                │         ('speaking')                │                  │
 │                │──speak(responseText)──────────────▶ │                  │
 │◀─[audio plays]─│                 │                   │                  │
 │                │         setConversationState        │                  │
 │                │         ('idle')                    │                  │
```

---

## HTTP Client Architecture

`src/lib/axios.ts` exports a single configured `axiosInstance` used for all backend API calls.

```
axiosInstance
├── baseURL       = VITE_API_URL
├── timeout       = 15 seconds
├── Request interceptor
│   └── Reads auth_token from localStorage
│   └── Injects Authorization: Bearer <token>  (client-side only)
└── Response interceptor
    └── 401 → clear token → redirect to /login (client-side only)
```

> **AI providers do not use `axiosInstance`.**  
> They call external APIs (Gemini, OpenAI) using native `fetch` with their own keys. Using the app's `axiosInstance` would incorrectly inject the user's auth token into third-party requests.

---

## Environment Configuration Architecture

```
.env
└── parsed by Vite at build time
    └── src/config/env.ts     (single typed wrapper — only file that reads import.meta.env)
        └── src/config/app.config.ts   (derived app-level constants)
            └── used by services, providers, lib/axios
```

No file outside `src/config/env.ts` reads `import.meta.env` directly.

---

## CSS Architecture

```
src/assets/styles/
├── globals.css   @import tailwindcss
│                 @import ./theme.css
│                 global resets (box-sizing, margin, font-smoothing)
│
└── theme.css     CSS custom properties
                  :root  → light theme  (--color-*, --radius-*, --font-*)
                  .dark  → dark theme overrides
```

Tailwind v4 reads design tokens from CSS custom properties. No `tailwind.config.js` is needed — configuration lives in CSS.

Components use Tailwind utility classes directly. Conditional class merging uses the `cn()` utility from `src/lib/utils.ts`.

---

## Build Pipeline

```
bun run dev
  └── vite dev --port 3000
        ├── tanstackStart()    SSR route generation + server entry
        ├── cloudflare()       Cloudflare Workers compatibility layer
        ├── tailwindcss()      JIT CSS generation
        ├── viteReact()        React JSX transform
        └── devtools()         TanStack devtools overlay

bun run build
  └── vite build
        ├── Client bundle  → dist/client/   (code-split per route)
        └── Server bundle  → dist/server/   (Cloudflare Workers format)

bun run deploy
  └── bun run build && wrangler deploy
        └── Pushes dist/server/ to Cloudflare Workers
```

---

## Security Considerations

| Concern | Approach |
|---|---|
| API keys in client bundle | `VITE_*` vars are inlined at build time. Never log them. Rotate keys if exposed. |
| Auth token storage | `localStorage` — acceptable for MVP. Future: migrate to httpOnly cookies. |
| 401 handling | Automatic token clear + redirect. No retry loop. |
| Provider error exposure | Errors are caught in `useConversation` and surfaced as user-readable strings, never raw API error bodies. |
| SSR secret isolation | Server-only secrets (non-`VITE_*`) are never sent to the client. |
