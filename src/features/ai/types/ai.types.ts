import type { Message } from './conversation.types'

// ─── AI Provider contract ─────────────────────────────────────────────────────
//
// Every current and future LLM provider MUST implement this interface.
// The rest of the application never imports a concrete provider directly —
// it only ever holds a value typed as AIProvider.

type AIProvider = {
  /**
   * Generate a conversational response.
   *
   * @param message       - Current user message (already translated to English)
   * @param characterPrompt - System prompt built from the selected Character
   * @param history         - Previous messages in the session (newest last)
   */
  generateResponse: (
    message: string,
    characterPrompt: string,
    history: Message[],
  ) => Promise<string>
}

// ─── Supported providers ──────────────────────────────────────────────────────

type AIProviderName =
  | 'gemini'
  | 'openai'
  | 'claude'
  | 'groq'
  | 'deepseek'
  | 'azure-openai'
  | 'local-llm'
  | 'ollama'

// ─── Speech Provider contract ─────────────────────────────────────────────────

type SpeechProvider = {
  startListening: (language: string) => Promise<string>
  stopListening: () => void
  speak: (text: string, language: string) => Promise<void>
  stopSpeaking: () => void
}

type SpeechProviderName = 'browser' | 'openai' | 'gemini' | 'elevenlabs' | 'azure'

export type { AIProvider, AIProviderName, SpeechProvider, SpeechProviderName }
