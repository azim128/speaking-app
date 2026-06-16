# Project Overview

## What Is Speaking App?

Speaking App is an AI-powered English speaking practice tool. Users speak in their **native language**, and the application handles the full pipeline: speech recognition, translation, AI conversation, and text-to-speech playback — all in real time.

The goal is to reduce the friction of speaking practice. A user does not need to type, translate, or think about technical steps. They simply speak, and a conversational AI character responds in English.

---

## Problem Statement

Language learners — especially those working toward goals like IELTS, job interviews, or fluent daily conversation — struggle to practice speaking because:

- Native speakers are not always available
- Language tutors are expensive
- Speaking apps that exist today are rigid and gamified, not conversational
- The fear of making mistakes discourages real practice

Speaking App addresses this by providing on-demand, judgment-free, persona-driven English conversation.

---

## Target Users

| User | Goal |
|---|---|
| IELTS / TOEFL candidates | Simulate exam speaking sections |
| Job seekers | Practice English interviews |
| Casual learners | Improve everyday conversational fluency |
| Business professionals | Develop corporate English vocabulary |
| Students | Practice academic discussion |

---

## MVP Scope

The current MVP focuses on exactly three capabilities:

1. **Character selection** — choose an AI partner with a distinct persona
2. **Voice conversation** — speak in any language, receive English responses
3. **Audio playback** — hear the AI character speak back

Everything else — authentication, progress tracking, scoring, history persistence — is intentionally deferred.

---

## MVP User Flow

```
1.  User opens the app at /
2.  User sees a grid of AI characters
3.  User selects a character (e.g. "Sarah — English Teacher")
4.  App navigates to /speak
5.  User taps the microphone button
6.  App captures audio via browser Speech Recognition
7.  Transcript is sent to the Translation Service
8.  Translation Service calls the AI provider to convert text → English
9.  English text is sent to the Conversation Service
10. Conversation Service calls the AI provider with character system prompt + history
11. AI generates a response in English
12. Response is spoken aloud via browser Speech Synthesis
13. Both messages appear in the chat history
14. User can speak again (step 5) or change character (step 3)
```

---

## Tech Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| Language | TypeScript | 6.x | Strict type safety, excellent DX |
| UI Framework | React | 19.x | Concurrent features, stable ecosystem |
| Build Tool | Vite | 8.x | Fast HMR, native ESM, Rolldown bundler |
| SSR Framework | TanStack Start | latest | File-based SSR on top of TanStack Router |
| Routing | TanStack Router | latest | 100% type-safe routes, file-based |
| Server State | TanStack Query | 5.x | Declarative data fetching, caching |
| HTTP Client | Axios | 1.x | Interceptors for auth token injection |
| Client State | Zustand | 5.x | Minimal, performant, persist middleware |
| Validation | Zod | 4.x | Runtime schema validation |
| Styling | Tailwind CSS | 4.x | Utility-first, no separate CSS files |
| Runtime | Bun | latest | Fast install, test, run |
| Deployment | Cloudflare Workers | — | Edge SSR, global low-latency |

---

## AI Provider Support

The application is **provider-agnostic**. Switching the LLM requires only a `.env` change — no code changes.

| Provider | Status | Env Var |
|---|---|---|
| Google Gemini | ✅ Implemented | `VITE_GEMINI_API_KEY` |
| OpenAI | ✅ Implemented | `VITE_OPENAI_API_KEY` |
| Groq | ✅ Implemented | `VITE_GROQ_API_KEY` |
| Anthropic Claude | 🔲 Planned | `VITE_CLAUDE_API_KEY` |
| DeepSeek | 🔲 Planned | — |
| Azure OpenAI | 🔲 Planned | — |
| Ollama (local) | 🔲 Planned | — |

Switch provider: `VITE_AI_PROVIDER=openai` in `.env`.

---

## Built-in Characters

| ID | Name | Role | Emoji |
|---|---|---|---|
| `english-teacher` | Sarah | Patient English teacher | 👩‍🏫 |
| `friendly-friend` | Alex | Native-speaking casual friend | 😄 |
| `interview-coach` | Michael | Professional interview coach | 💼 |
| `ielts-examiner` | Emma | IELTS speaking exam simulator | 📝 |
| `business-mentor` | David | Business English mentor | 🎯 |

Characters are defined in `src/features/ai/services/character.service.ts`. Custom characters can be added at runtime and are persisted via Zustand.

---

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | Character Selector | Choose an AI partner, navigate to `/speak` |
| `/speak` | Conversation | Full-screen voice conversation interface |
| `/login` | Login | Future: authentication (scaffold only) |
| `/dashboard` | Dashboard | Future: analytics (scaffold only) |

---

## Planned Features (Not in MVP)

- User authentication and authorization
- Conversation history (persistent across sessions)
- Speaking score / pronunciation feedback
- Grammar correction overlay
- Vocabulary tracking
- Progress analytics dashboard
- Multiple voice options per character
- Character marketplace (community-created personas)
- Subscription / payment system
- Mobile app (React Native)

---

## Design Principles

**1. Provider independence**
The app never imports a concrete AI SDK anywhere except inside provider files. `providerFactory.getProvider()` is the only crossing point between application logic and AI infrastructure.

**2. Feature-based architecture**
Each feature (`ai`, `auth`, `dashboard`) is a self-contained vertical slice with its own types, services, hooks, components, and store. Features communicate only through each other's `index.ts` barrel.

**3. SSR safety**
The app runs on Cloudflare Workers. Every browser-only API (`localStorage`, `window`, `SpeechRecognition`) is guarded with `typeof window !== 'undefined'`.

**4. Separation of concerns**
- Components own UI only
- Hooks own state orchestration
- Services own business logic
- Providers own external integrations
- Stores own shared state

No layer reaches past its boundary.
