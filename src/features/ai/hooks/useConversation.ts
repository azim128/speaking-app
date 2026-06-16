// useConversation — orchestrates the full voice conversation pipeline:
//
//   startVoiceInput()
//     1. STT  — microphone → transcript
//     2. TRANSLATE — native text → English  (translationService)
//     3. THINK    — English → AI response   (conversationService → providerFactory)
//     4. TTS      — response → audio        (speechService)

import { useCallback } from 'react'
import { useConversationStore } from '../store/conversation.store'
import { useCharacterStore } from '../store/character.store'
import { conversationService } from '../services/conversation.service'
import { translationService } from '../services/translation.service'
import { useSpeech } from './useSpeech'
import type { Message } from '../types/conversation.types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function useConversation() {
  // ── Store slices ──────────────────────────────────────────────────────────
  const messages = useConversationStore((s) => s.messages)
  const conversationState = useConversationStore((s) => s.conversationState)
  const error = useConversationStore((s) => s.error)
  const addMessage = useConversationStore((s) => s.addMessage)
  const setConversationState = useConversationStore((s) => s.setConversationState)
  const setError = useConversationStore((s) => s.setError)
  const clearMessages = useConversationStore((s) => s.clearMessages)
  const selectedCharacter = useCharacterStore((s) => s.selectedCharacter)

  const { startListening, speak, isListening, isSpeaking } = useSpeech()

  // ── Core pipeline ─────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (originalText: string) => {
      if (!selectedCharacter) {
        setError('No character selected. Please go back and choose one.')
        return
      }

      try {
        setError(null)

        // 1 — Translate to English
        setConversationState('translating')
        const englishText = await translationService.translateToEnglish(originalText)

        // 2 — Snapshot history BEFORE adding the new user message so we don't
        //     send the current turn twice to the provider.
        const historySnapshot = useConversationStore.getState().messages

        // 3 — Persist user message
        const userMessage: Message = {
          id: generateId(),
          role: 'user',
          originalText,
          englishText,
          createdAt: new Date().toISOString(),
        }
        addMessage(userMessage)

        // 4 — Get AI response
        setConversationState('thinking')
        const responseText = await conversationService.getResponse(
          englishText,
          selectedCharacter,
          historySnapshot,
        )

        // 5 — Persist AI message
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          originalText: responseText,
          englishText: responseText,
          createdAt: new Date().toISOString(),
        }
        addMessage(assistantMessage)

        // 6 — Speak the response aloud
        setConversationState('speaking')
        await speak(responseText)

        setConversationState('idle')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
        setConversationState('idle')
      }
    },
    // Stable deps: selectedCharacter, store actions, speak.
    // useConversationStore.getState() accesses fresh state without closure staleness.
    [selectedCharacter, addMessage, setConversationState, setError, speak],
  )

  // ── Voice entry point ─────────────────────────────────────────────────────

  const startVoiceInput = useCallback(
    async (nativeLanguage = 'tr-TR') => {
      try {
        setError(null)
        setConversationState('listening')

        const transcript = await startListening(nativeLanguage)

        if (!transcript.trim()) {
          setConversationState('idle')
          return
        }

        await sendMessage(transcript)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Microphone error.')
        setConversationState('idle')
      }
    },
    [startListening, sendMessage, setConversationState, setError],
  )

  return {
    messages,
    conversationState,
    error,
    selectedCharacter,
    isListening,
    isSpeaking,
    sendMessage,
    startVoiceInput,
    clearMessages,
  }
}

export { useConversation }
