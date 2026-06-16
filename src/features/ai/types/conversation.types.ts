// ─── Message ──────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'assistant'

type Message = {
  id: string
  role: MessageRole
  /** Text as the user originally spoke it (may be non-English) */
  originalText: string
  /** English translation sent to / returned from the AI */
  englishText: string
  /** Presigned or object-URL for the TTS audio blob, if generated */
  audioUrl?: string
  createdAt: string
}

// ─── Conversation state machine ───────────────────────────────────────────────

type ConversationState =
  | 'idle'          // waiting for user input
  | 'listening'     // microphone open, capturing audio
  | 'transcribing'  // audio → text (STT)
  | 'translating'   // native text → English
  | 'thinking'      // English text → AI response
  | 'speaking'      // AI response → audio (TTS)

export type { Message, MessageRole, ConversationState }
