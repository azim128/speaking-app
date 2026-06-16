import { create } from 'zustand'
import type { Message, ConversationState } from '../types/conversation.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ConversationStoreState = {
  messages: Message[]
  conversationState: ConversationState
  error: string | null
}

type ConversationStoreActions = {
  addMessage: (message: Message) => void
  setConversationState: (state: ConversationState) => void
  setError: (error: string | null) => void
  clearMessages: () => void
  reset: () => void
}

type ConversationStore = ConversationStoreState & ConversationStoreActions

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: ConversationStoreState = {
  messages: [],
  conversationState: 'idle',
  error: null,
}

// ─── Store ────────────────────────────────────────────────────────────────────
// Intentionally NOT persisted — conversation history is session-only.

const useConversationStore = create<ConversationStore>()((set) => ({
  ...initialState,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setConversationState: (conversationState) => set({ conversationState }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [], error: null }),

  reset: () => set(initialState),
}))

export { useConversationStore }
export type { ConversationStore, ConversationStoreState, ConversationStoreActions }
