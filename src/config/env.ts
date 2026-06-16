const env = {
  VITE_API_URL:
    (import.meta.env['VITE_API_URL'] as string | undefined) ??
    'http://localhost:3000/api',
  DEV: import.meta.env.DEV as boolean,
  PROD: import.meta.env.PROD as boolean,
  MODE: import.meta.env.MODE as string,

  // ── AI Provider ───────────────────────────────────────────────────────────
  /** Which LLM provider to use. Must match an AIProviderName. */
  VITE_AI_PROVIDER:
    (import.meta.env['VITE_AI_PROVIDER'] as string | undefined) ?? 'groq',

  // ── Provider API keys (only the active provider's key is required) ────────
  VITE_GEMINI_API_KEY:
    (import.meta.env['VITE_GEMINI_API_KEY'] as string | undefined) ?? '',
  VITE_OPENAI_API_KEY:
    (import.meta.env['VITE_OPENAI_API_KEY'] as string | undefined) ?? '',
  VITE_CLAUDE_API_KEY:
    (import.meta.env['VITE_CLAUDE_API_KEY'] as string | undefined) ?? '',
  VITE_GROQ_API_KEY:
    (import.meta.env['VITE_GROQ_API_KEY'] as string | undefined) ?? '',
  VITE_DEEPSEEK_API_KEY:
    (import.meta.env['VITE_DEEPSEEK_API_KEY'] as string | undefined) ?? '',
} as const

export { env }
