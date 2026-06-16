// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useConversation } from './hooks/useConversation'
export { useSpeech } from './hooks/useSpeech'
export { useCharacter } from './hooks/useCharacter'
export { useAudioReplay } from './hooks/useAudioReplay'

// ─── Stores ───────────────────────────────────────────────────────────────────
export { useConversationStore } from './store/conversation.store'
export { useCharacterStore, useAllCharacters } from './store/character.store'

// ─── Components ───────────────────────────────────────────────────────────────
export { ConversationView } from './components/ConversationView'
export { CharacterSelector } from './components/CharacterSelector'
export { CharacterCard } from './components/CharacterCard'
export { MessageBubble } from './components/MessageBubble'
export { VoiceButton } from './components/VoiceButton'

// ─── Services (public API for cross-feature use) ──────────────────────────────
export { characterService } from './services/character.service'
export { providerFactory } from './providers/provider-factory'

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  Message,
  MessageRole,
  ConversationState,
} from './types/conversation.types'
export type { Character } from './types/character.types'
export type { AIProvider, AIProviderName } from './types/ai.types'
